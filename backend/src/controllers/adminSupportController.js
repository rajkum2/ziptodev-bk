const Conversation = require('../models/Conversation');
const ConversationMessage = require('../models/ConversationMessage');
const AdminChatAudit = require('../models/AdminChatAudit');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Order = require('../models/Order');
const ApiResponse = require('../utils/response');
const { getPagination, buildPaginationResponse } = require('../utils/helpers');
const {
  emitConversationAssigned,
  emitConversationUpdated,
  emitConversationModeChanged,
  emitConversationClosed,
  emitConversationNewMessage
} = require('../socket');

const buildConversationSummary = async (conversationId) => {
  const conversation = await Conversation.findOne({ conversationId })
    .populate('customerUserId', 'name phone email')
    .populate('assignedToAdminId', 'username email firstName lastName')
    .lean();

  if (!conversation) return null;

  const lastMessage = await ConversationMessage.findOne({ conversationId })
    .sort({ createdAt: -1 })
    .select('content role createdAt metadata')
    .lean();

  const slaBreached = conversation.slaBreached ||
    (conversation.slaFirstResponseDueAt && conversation.slaFirstResponseDueAt < new Date());

  return {
    conversationId: conversation.conversationId,
    status: conversation.status,
    mode: conversation.mode,
    queue: conversation.queue,
    priority: conversation.priority,
    needsReview: conversation.needsReview,
    aiConfidence: conversation.aiConfidence || null,
    assignedToAdminId: conversation.assignedToAdminId?._id || null,
    assignedTo: conversation.assignedToAdminId ? {
      _id: conversation.assignedToAdminId._id,
      username: conversation.assignedToAdminId.username,
      email: conversation.assignedToAdminId.email,
      firstName: conversation.assignedToAdminId.firstName,
      lastName: conversation.assignedToAdminId.lastName
    } : null,
    customer: conversation.customerUserId ? {
      _id: conversation.customerUserId._id,
      name: conversation.customerUserId.name,
      phone: conversation.customerUserId.phone,
      email: conversation.customerUserId.email
    } : null,
    lastMessagePreview: lastMessage?.content || '',
    lastMessageAt: lastMessage?.createdAt || conversation.lastMessageAt,
    lastMessageRole: lastMessage?.role || null,
    slaBreached,
    slaFirstResponseDueAt: conversation.slaFirstResponseDueAt || null,
    updatedAt: conversation.updatedAt
  };
};

const createAudit = async (adminId, conversationId, action, before = null, after = null, meta = null) => {
  await AdminChatAudit.create({
    adminId,
    conversationId,
    action,
    before,
    after,
    meta
  });
};

exports.listConversations = async (req, res, next) => {
  try {
    const {
      status = 'open',
      queue = 'all',
      needsReview,
      assigned = 'any',
      slaBreached,
      q,
      page = 1,
      limit = 20
    } = req.query;

    const { skip, limit: limitNum } = getPagination(page, limit);
    const query = {};
    const andFilters = [];

    if (status && status !== 'all') {
      query.status = status;
    }

    if (queue && queue !== 'all') {
      query.queue = queue;
    }

    if (needsReview !== undefined) {
      query.needsReview = needsReview === 'true' || needsReview === true;
    }

    if (assigned === 'me') {
      query.assignedToAdminId = req.adminId;
    } else if (assigned === 'unassigned') {
      query.assignedToAdminId = null;
    }

    if (slaBreached !== undefined) {
      const breached = slaBreached === 'true' || slaBreached === true;
      if (breached) {
        andFilters.push({
          $or: [
            { slaBreached: true },
            { slaFirstResponseDueAt: { $lt: new Date() } }
          ]
        });
      } else {
        andFilters.push({
          $or: [{ slaBreached: false }, { slaBreached: null }]
        });
        andFilters.push({
          $or: [{ slaFirstResponseDueAt: null }, { slaFirstResponseDueAt: { $gte: new Date() } }]
        });
      }
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      const [userIds, messageConversationIds] = await Promise.all([
        User.find({
          $or: [{ name: searchRegex }, { phone: searchRegex }]
        }).distinct('_id'),
        ConversationMessage.find({ content: searchRegex })
          .limit(200)
          .distinct('conversationId')
      ]);

      andFilters.push({
        $or: [
          { conversationId: searchRegex },
          { customerUserId: { $in: userIds } },
          { conversationId: { $in: messageConversationIds } }
        ]
      });
    }

    if (andFilters.length) {
      query.$and = andFilters;
    }

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('customerUserId', 'name phone')
        .populate('assignedToAdminId', 'username email firstName lastName')
        .lean(),
      Conversation.countDocuments(query)
    ]);

    const conversationIds = conversations.map(conv => conv.conversationId);
    const lastMessages = await ConversationMessage.find({
      conversationId: { $in: conversationIds }
    })
      .sort({ createdAt: -1 })
      .select('conversationId content role createdAt metadata')
      .lean();

    const lastMessageMap = new Map();
    for (const message of lastMessages) {
      if (!lastMessageMap.has(message.conversationId)) {
        lastMessageMap.set(message.conversationId, message);
      }
    }

    const now = new Date();
    const data = conversations.map(conv => {
      const lastMessage = lastMessageMap.get(conv.conversationId);
      const slaBreachedComputed = conv.slaBreached ||
        (conv.slaFirstResponseDueAt && conv.slaFirstResponseDueAt < now);

      return {
        conversationId: conv.conversationId,
        status: conv.status,
        mode: conv.mode,
        queue: conv.queue,
        priority: conv.priority,
        needsReview: conv.needsReview,
        aiConfidence: conv.aiConfidence || null,
        assignedToAdminId: conv.assignedToAdminId?._id || null,
        assignedTo: conv.assignedToAdminId ? {
          _id: conv.assignedToAdminId._id,
          username: conv.assignedToAdminId.username,
          email: conv.assignedToAdminId.email,
          firstName: conv.assignedToAdminId.firstName,
          lastName: conv.assignedToAdminId.lastName
        } : null,
        customer: conv.customerUserId ? {
          _id: conv.customerUserId._id,
          name: conv.customerUserId.name,
          phone: conv.customerUserId.phone
        } : null,
        lastMessagePreview: lastMessage?.content || '',
        lastMessageAt: lastMessage?.createdAt || conv.lastMessageAt,
        lastMessageRole: lastMessage?.role || null,
        unread: lastMessage?.role === 'customer',
        slaBreached: slaBreachedComputed,
        slaFirstResponseDueAt: conv.slaFirstResponseDueAt || null,
        updatedAt: conv.updatedAt
      };
    });

    const pagination = buildPaginationResponse(page, limitNum, total);
    return ApiResponse.paginated(res, data, pagination);
  } catch (error) {
    next(error);
  }
};

exports.getConversationDetail = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 30 } = req.query;
    const { skip, limit: limitNum } = getPagination(page, limit);

    const conversation = await Conversation.findOne({ conversationId })
      .populate('customerUserId', 'name phone email')
      .populate('assignedToAdminId', 'username email firstName lastName')
      .lean();

    if (!conversation) {
      return ApiResponse.error(res, 'Conversation not found', 'SUPPORT_NOT_FOUND', 404);
    }

    const [messages, total, recentOrders] = await Promise.all([
      ConversationMessage.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ConversationMessage.countDocuments({ conversationId }),
      conversation.customerUserId
        ? Order.find({ userId: conversation.customerUserId._id })
          .sort({ createdAt: -1 })
          .limit(3)
          .select('orderId status totalAmount createdAt items')
          .lean()
        : Promise.resolve([])
    ]);

    const pagination = buildPaginationResponse(page, limitNum, total);

    return ApiResponse.success(res, {
      conversation,
      messages,
      pagination,
      unreadCount: 0,
      lastMessageAt: conversation.lastMessageAt,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};

exports.assignConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { assignedToAdminId } = req.body;

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return ApiResponse.error(res, 'Conversation not found', 'SUPPORT_NOT_FOUND', 404);
    }

    let resolvedAdminId = req.adminId;
    if (assignedToAdminId && assignedToAdminId !== 'me') {
      const admin = await Admin.findById(assignedToAdminId);
      if (!admin) {
        return ApiResponse.error(res, 'Admin not found', 'SUPPORT_NOT_FOUND', 404);
      }
      resolvedAdminId = admin._id;
    }

    const before = { assignedToAdminId: conversation.assignedToAdminId };
    conversation.assignedToAdminId = resolvedAdminId;
    await conversation.save();

    await createAudit(req.adminId, conversationId, 'ASSIGN', before, {
      assignedToAdminId: resolvedAdminId
    });

    const summary = await buildConversationSummary(conversationId);
    if (summary) {
      emitConversationAssigned(summary);
    }

    return ApiResponse.success(res, summary, 'Conversation assigned');
  } catch (error) {
    next(error);
  }
};

exports.toggleNeedsReview = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { needsReview } = req.body;

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return ApiResponse.error(res, 'Conversation not found', 'SUPPORT_NOT_FOUND', 404);
    }

    const before = { needsReview: conversation.needsReview };
    conversation.needsReview = needsReview;
    await conversation.save();

    await createAudit(req.adminId, conversationId, 'MARK_REVIEW', before, { needsReview });

    const summary = await buildConversationSummary(conversationId);
    if (summary) {
      emitConversationUpdated(summary);
    }

    return ApiResponse.success(res, summary, 'Conversation updated');
  } catch (error) {
    next(error);
  }
};

exports.takeoverConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      return ApiResponse.error(res, 'Conversation not found', 'SUPPORT_NOT_FOUND', 404);
    }

    const before = { mode: conversation.mode };
    conversation.mode = 'HUMAN_ONLY';
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const systemMessage = await ConversationMessage.create({
      conversationId,
      role: 'system',
      content: 'Human agent took over'
    });

    await createAudit(req.adminId, conversationId, 'TAKEOVER', before, { mode: 'HUMAN_ONLY' });

    const summary = await buildConversationSummary(conversationId);
    if (summary) {
      emitConversationModeChanged({
        ...summary,
        systemMessage
      });
    }

    return ApiResponse.success(res, summary, 'Conversation taken over');
  } catch (error) {
    next(error);
  }
};

exports.returnToAi = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { mode = 'AI_ONLY' } = req.body;

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return ApiResponse.error(res, 'Conversation not found', 'SUPPORT_NOT_FOUND', 404);
    }

    const before = { mode: conversation.mode };
    conversation.mode = mode;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const systemMessage = await ConversationMessage.create({
      conversationId,
      role: 'system',
      content: 'Conversation returned to AI'
    });

    await createAudit(req.adminId, conversationId, 'RETURN_TO_AI', before, { mode });

    const summary = await buildConversationSummary(conversationId);
    if (summary) {
      emitConversationModeChanged({
        ...summary,
        systemMessage
      });
    }

    return ApiResponse.success(res, summary, 'Conversation returned to AI');
  } catch (error) {
    next(error);
  }
};

exports.closeConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return ApiResponse.error(res, 'Conversation not found', 'SUPPORT_NOT_FOUND', 404);
    }

    const before = { status: conversation.status };
    conversation.status = 'closed';
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const systemMessage = await ConversationMessage.create({
      conversationId,
      role: 'system',
      content: 'Conversation closed'
    });

    await createAudit(req.adminId, conversationId, 'CLOSE', before, { status: 'closed' });

    const summary = await buildConversationSummary(conversationId);
    if (summary) {
      emitConversationClosed({
        ...summary,
        systemMessage
      });
    }

    return ApiResponse.success(res, summary, 'Conversation closed');
  } catch (error) {
    next(error);
  }
};

exports.sendHumanMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content, isInternalNote } = req.body;

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return ApiResponse.error(res, 'Conversation not found', 'SUPPORT_NOT_FOUND', 404);
    }

    const role = isInternalNote ? 'system' : 'human';
    const messageContent = isInternalNote ? `Internal note: ${content}` : content;

    const message = await ConversationMessage.create({
      conversationId,
      role,
      content: messageContent
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    await createAudit(
      req.adminId,
      conversationId,
      isInternalNote ? 'ADD_NOTE' : 'SEND_MESSAGE',
      null,
      { content: messageContent }
    );

    const summary = await buildConversationSummary(conversationId);
    if (summary) {
      if (isInternalNote) {
        emitConversationUpdated({
          ...summary,
          systemMessage: message
        });
      } else {
        emitConversationNewMessage({
          ...summary,
          message
        });
      }
    }

    return ApiResponse.success(res, { message, conversation: summary }, 'Message sent');
  } catch (error) {
    next(error);
  }
};

