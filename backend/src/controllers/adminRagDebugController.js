const RagTrace = require('../models/RagTrace');
const ApiResponse = require('../utils/response');
const { getPagination, buildPaginationResponse } = require('../utils/helpers');

exports.listRagTraces = async (req, res, next) => {
  try {
    const {
      conversationId,
      messageId,
      traceId,
      ragTraceId,
      docName,
      docId,
      page = 1,
      limit = 20
    } = req.query;

    const { skip, limit: limitNum } = getPagination(page, limit);
    const query = {};
    const andFilters = [];

    if (conversationId) {
      query.conversationId = conversationId;
    }
    if (messageId) {
      query.messageId = messageId;
    }
    if (traceId) {
      query.traceId = traceId;
    }
    if (ragTraceId) {
      query.ragTraceId = ragTraceId;
    }
    if (docName) {
      andFilters.push({
        $or: [
          { kbDocNames: { $regex: docName, $options: 'i' } },
          { 'chunks.docName': { $regex: docName, $options: 'i' } }
        ]
      });
    }
    if (docId) {
      andFilters.push({
        $or: [
          { kbDocIds: docId },
          { 'chunks.docId': docId }
        ]
      });
    }

    if (andFilters.length) {
      query.$and = andFilters;
    }

    const [traces, total] = await Promise.all([
      RagTrace.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      RagTrace.countDocuments(query)
    ]);

    const pagination = buildPaginationResponse(page, limitNum, total);
    return ApiResponse.paginated(res, traces, pagination);
  } catch (error) {
    next(error);
  }
};

exports.getRagTrace = async (req, res, next) => {
  try {
    const { ragTraceId } = req.params;
    const trace = await RagTrace.findOne({ ragTraceId }).lean();
    if (!trace) {
      return ApiResponse.error(res, 'RAG trace not found', 'SUPPORT_NOT_FOUND', 404);
    }
    return ApiResponse.success(res, trace);
  } catch (error) {
    next(error);
  }
};

