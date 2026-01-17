// Helper to generate unique order ID with index
const generateUniqueOrderId = (index) => {
  const timestamp = Date.now() + index * 1000; // Add offset to ensure uniqueness
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

// Admin user (password will be hashed by the model)
const admin = {
  username: 'admin',
  email: 'admin@zipto.com',
  password: 'Admin@123',
  role: 'super_admin',
  permissions: [
    '*',
    'SUPPORT_VIEW',
    'SUPPORT_MANAGE',
    'SUPPORT_TAKEOVER',
    'SUPPORT_ASSIGN',
    'SUPPORT_CLOSE',
    'SUPPORT_RAG_DEBUG'
  ],
  isActive: true,
  firstName: 'System',
  lastName: 'Admin'
};

// Categories (10 parent categories)
const categories = [
  {
    name: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    icon: '🥬',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
    color: '#22c55e',
    priority: 10,
    isActive: true,
    description: 'Fresh fruits and vegetables delivered to your doorstep'
  },
  {
    name: 'Dairy & Breakfast',
    slug: 'dairy-breakfast',
    icon: '🥛',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400',
    color: '#3b82f6',
    priority: 9,
    isActive: true,
    description: 'Milk, bread, eggs, butter, and breakfast essentials'
  },
  {
    name: 'Snacks & Beverages',
    slug: 'snacks-beverages',
    icon: '🍿',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
    color: '#f59e0b',
    priority: 8,
    isActive: true,
    description: 'Chips, biscuits, cold drinks, juices, and more'
  },
  {
    name: 'Staples',
    slug: 'staples',
    icon: '🌾',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    color: '#a855f7',
    priority: 7,
    isActive: true,
    description: 'Rice, dal, flour, oil, and cooking essentials'
  },
  {
    name: 'Instant & Frozen',
    slug: 'instant-frozen',
    icon: '🍜',
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400',
    color: '#ef4444',
    priority: 6,
    isActive: true,
    description: 'Instant noodles, frozen foods, and ready-to-eat meals'
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    icon: '🧴',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    color: '#ec4899',
    priority: 5,
    isActive: true,
    description: 'Soaps, shampoos, skincare, and hygiene products'
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    color: '#06b6d4',
    priority: 4,
    isActive: true,
    description: 'Cleaning supplies, kitchen tools, and home essentials'
  },
  {
    name: 'Baby Care',
    slug: 'baby-care',
    icon: '👶',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
    color: '#f472b6',
    priority: 3,
    isActive: true,
    description: 'Diapers, baby food, and baby care essentials'
  },
  {
    name: 'Pet Care',
    slug: 'pet-care',
    icon: '🐕',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
    color: '#84cc16',
    priority: 2,
    isActive: true,
    description: 'Pet food, treats, and accessories'
  },
  {
    name: 'Meat & Seafood',
    slug: 'meat-seafood',
    icon: '🥩',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400',
    color: '#dc2626',
    priority: 1,
    isActive: true,
    description: 'Fresh chicken, mutton, fish, and eggs'
  }
];

// Helper to generate variant ID
const genVarId = () => `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Products - 100+ products across all categories
const products = [
  // ============ FRUITS & VEGETABLES (15 products) ============
  {
    name: 'Fresh Tomatoes',
    slug: 'fresh-tomatoes',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1546470427-227c7369a9d5?w=400', alt: 'Fresh Tomatoes' }],
    variants: [
      { variantId: genVarId(), name: '500g', mrp: 40, price: 35, inStock: true, stock: 100, sku: 'TOM-500' },
      { variantId: genVarId(), name: '1kg', mrp: 75, price: 65, inStock: true, stock: 80, sku: 'TOM-1KG' }
    ],
    tags: ['fresh', 'vegetables', 'daily-essentials'],
    description: 'Farm fresh red tomatoes, perfect for curries and salads',
    isActive: true
  },
  {
    name: 'Red Onions',
    slug: 'red-onions',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400', alt: 'Red Onions' }],
    variants: [
      { variantId: genVarId(), name: '1kg', mrp: 45, price: 40, inStock: true, stock: 150, sku: 'ONI-1KG' },
      { variantId: genVarId(), name: '2kg', mrp: 85, price: 75, inStock: true, stock: 100, sku: 'ONI-2KG' }
    ],
    tags: ['fresh', 'vegetables', 'daily-essentials'],
    description: 'Fresh red onions for everyday cooking',
    isActive: true
  },
  {
    name: 'Potatoes',
    slug: 'potatoes',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1518977676601-b53f82ber3a?w=400', alt: 'Potatoes' }],
    variants: [
      { variantId: genVarId(), name: '1kg', mrp: 35, price: 30, inStock: true, stock: 200, sku: 'POT-1KG' },
      { variantId: genVarId(), name: '2kg', mrp: 65, price: 55, inStock: true, stock: 120, sku: 'POT-2KG' }
    ],
    tags: ['fresh', 'vegetables', 'daily-essentials'],
    description: 'Fresh potatoes ideal for all recipes',
    isActive: true
  },
  {
    name: 'Bananas',
    slug: 'bananas',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', alt: 'Bananas' }],
    variants: [
      { variantId: genVarId(), name: '6 pcs', mrp: 40, price: 35, inStock: true, stock: 200, sku: 'BAN-6PC' },
      { variantId: genVarId(), name: '12 pcs', mrp: 75, price: 65, inStock: true, stock: 150, sku: 'BAN-12PC' }
    ],
    tags: ['fresh', 'fruits', 'daily-essentials'],
    description: 'Fresh yellow bananas rich in potassium',
    isActive: true
  },
  {
    name: 'Apples - Royal Gala',
    slug: 'apples-royal-gala',
    brand: 'Imported',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', alt: 'Apples' }],
    variants: [
      { variantId: genVarId(), name: '4 pcs', mrp: 120, price: 99, inStock: true, stock: 80, sku: 'APL-4PC' },
      { variantId: genVarId(), name: '1kg', mrp: 180, price: 160, inStock: true, stock: 60, sku: 'APL-1KG' }
    ],
    tags: ['fresh', 'fruits', 'imported', 'premium'],
    description: 'Sweet and crispy imported Royal Gala apples',
    isActive: true
  },
  {
    name: 'Green Capsicum',
    slug: 'green-capsicum',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', alt: 'Capsicum' }],
    variants: [
      { variantId: genVarId(), name: '250g', mrp: 35, price: 30, inStock: true, stock: 90, sku: 'CAP-250' },
      { variantId: genVarId(), name: '500g', mrp: 65, price: 55, inStock: true, stock: 60, sku: 'CAP-500' }
    ],
    tags: ['fresh', 'vegetables'],
    description: 'Fresh green capsicum for salads and cooking',
    isActive: true
  },
  {
    name: 'Carrots',
    slug: 'carrots',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', alt: 'Carrots' }],
    variants: [
      { variantId: genVarId(), name: '500g', mrp: 40, price: 35, inStock: true, stock: 100, sku: 'CAR-500' },
      { variantId: genVarId(), name: '1kg', mrp: 75, price: 65, inStock: true, stock: 70, sku: 'CAR-1KG' }
    ],
    tags: ['fresh', 'vegetables'],
    description: 'Fresh orange carrots great for juices and cooking',
    isActive: true
  },
  {
    name: 'Spinach',
    slug: 'spinach',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', alt: 'Spinach' }],
    variants: [
      { variantId: genVarId(), name: '250g', mrp: 25, price: 20, inStock: true, stock: 80, sku: 'SPN-250' }
    ],
    tags: ['fresh', 'vegetables', 'leafy'],
    description: 'Fresh leafy spinach rich in iron',
    isActive: true
  },
  {
    name: 'Mangoes - Alphonso',
    slug: 'mangoes-alphonso',
    brand: 'Ratnagiri',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', alt: 'Alphonso Mangoes' }],
    variants: [
      { variantId: genVarId(), name: '1kg (4-5 pcs)', mrp: 350, price: 299, inStock: true, stock: 40, sku: 'MNG-1KG' }
    ],
    tags: ['fresh', 'fruits', 'seasonal', 'premium'],
    description: 'Premium Ratnagiri Alphonso mangoes',
    isActive: true
  },
  {
    name: 'Cucumber',
    slug: 'cucumber',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400', alt: 'Cucumber' }],
    variants: [
      { variantId: genVarId(), name: '500g', mrp: 30, price: 25, inStock: true, stock: 120, sku: 'CUC-500' }
    ],
    tags: ['fresh', 'vegetables', 'salad'],
    description: 'Fresh cucumbers perfect for salads',
    isActive: true
  },
  {
    name: 'Grapes - Green Seedless',
    slug: 'grapes-green',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400', alt: 'Grapes' }],
    variants: [
      { variantId: genVarId(), name: '500g', mrp: 80, price: 70, inStock: true, stock: 60, sku: 'GRP-500' }
    ],
    tags: ['fresh', 'fruits'],
    description: 'Sweet seedless green grapes',
    isActive: true
  },
  {
    name: 'Orange - Nagpur',
    slug: 'orange-nagpur',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', alt: 'Oranges' }],
    variants: [
      { variantId: genVarId(), name: '1kg (5-6 pcs)', mrp: 90, price: 75, inStock: true, stock: 80, sku: 'ORG-1KG' }
    ],
    tags: ['fresh', 'fruits', 'citrus'],
    description: 'Juicy Nagpur oranges rich in Vitamin C',
    isActive: true
  },
  {
    name: 'Cauliflower',
    slug: 'cauliflower',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400', alt: 'Cauliflower' }],
    variants: [
      { variantId: genVarId(), name: '1 pc (400-500g)', mrp: 40, price: 35, inStock: true, stock: 70, sku: 'CAU-1PC' }
    ],
    tags: ['fresh', 'vegetables'],
    description: 'Fresh white cauliflower',
    isActive: true
  },
  {
    name: 'Pomegranate',
    slug: 'pomegranate',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=400', alt: 'Pomegranate' }],
    variants: [
      { variantId: genVarId(), name: '2 pcs', mrp: 120, price: 99, inStock: true, stock: 50, sku: 'POM-2PC' }
    ],
    tags: ['fresh', 'fruits', 'healthy'],
    description: 'Fresh red pomegranates packed with antioxidants',
    isActive: true
  },
  {
    name: 'Lady Finger (Bhindi)',
    slug: 'lady-finger-bhindi',
    brand: 'Fresho',
    categorySlug: 'fruits-vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=400', alt: 'Lady Finger' }],
    variants: [
      { variantId: genVarId(), name: '250g', mrp: 30, price: 25, inStock: true, stock: 80, sku: 'LDF-250' }
    ],
    tags: ['fresh', 'vegetables'],
    description: 'Fresh tender lady finger',
    isActive: true
  },

  // ============ DAIRY & BREAKFAST (15 products) ============
  {
    name: 'Amul Taaza Toned Milk',
    slug: 'amul-taaza-milk',
    brand: 'Amul',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', alt: 'Amul Milk' }],
    variants: [
      { variantId: genVarId(), name: '500ml', mrp: 28, price: 26, inStock: true, stock: 200, sku: 'AML-500' },
      { variantId: genVarId(), name: '1L', mrp: 54, price: 50, inStock: true, stock: 250, sku: 'AML-1L' }
    ],
    tags: ['dairy', 'milk', 'daily-essentials'],
    description: 'Fresh toned milk from Amul',
    isActive: true
  },
  {
    name: 'Amul Gold Full Cream Milk',
    slug: 'amul-gold-milk',
    brand: 'Amul',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', alt: 'Amul Gold' }],
    variants: [
      { variantId: genVarId(), name: '500ml', mrp: 35, price: 33, inStock: true, stock: 150, sku: 'AMLG-500' },
      { variantId: genVarId(), name: '1L', mrp: 68, price: 64, inStock: true, stock: 180, sku: 'AMLG-1L' }
    ],
    tags: ['dairy', 'milk', 'full-cream'],
    description: 'Rich full cream milk from Amul',
    isActive: true
  },
  {
    name: 'Amul Butter',
    slug: 'amul-butter',
    brand: 'Amul',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', alt: 'Amul Butter' }],
    variants: [
      { variantId: genVarId(), name: '100g', mrp: 60, price: 56, inStock: true, stock: 120, sku: 'AMLB-100' },
      { variantId: genVarId(), name: '500g', mrp: 280, price: 265, inStock: true, stock: 80, sku: 'AMLB-500' }
    ],
    tags: ['dairy', 'butter', 'breakfast'],
    description: 'Utterly butterly delicious Amul butter',
    isActive: true
  },
  {
    name: 'Brown Eggs',
    slug: 'brown-eggs',
    brand: 'Fresho',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', alt: 'Brown Eggs' }],
    variants: [
      { variantId: genVarId(), name: '6 pcs', mrp: 50, price: 45, inStock: true, stock: 200, sku: 'EGG-6' },
      { variantId: genVarId(), name: '12 pcs', mrp: 95, price: 85, inStock: true, stock: 150, sku: 'EGG-12' },
      { variantId: genVarId(), name: '30 pcs', mrp: 220, price: 199, inStock: true, stock: 80, sku: 'EGG-30' }
    ],
    tags: ['eggs', 'protein', 'breakfast', 'daily-essentials'],
    description: 'Farm fresh brown eggs',
    isActive: true
  },
  {
    name: 'Britannia White Bread',
    slug: 'britannia-white-bread',
    brand: 'Britannia',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', alt: 'White Bread' }],
    variants: [
      { variantId: genVarId(), name: '400g', mrp: 45, price: 42, inStock: true, stock: 150, sku: 'BRD-400' }
    ],
    tags: ['bread', 'breakfast', 'daily-essentials'],
    description: 'Soft and fresh white bread',
    isActive: true
  },
  {
    name: 'Britannia Brown Bread',
    slug: 'britannia-brown-bread',
    brand: 'Britannia',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', alt: 'Brown Bread' }],
    variants: [
      { variantId: genVarId(), name: '400g', mrp: 50, price: 46, inStock: true, stock: 120, sku: 'BRDB-400' }
    ],
    tags: ['bread', 'breakfast', 'healthy'],
    description: 'Healthy whole wheat brown bread',
    isActive: true
  },
  {
    name: 'Amul Cheese Slices',
    slug: 'amul-cheese-slices',
    brand: 'Amul',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', alt: 'Cheese Slices' }],
    variants: [
      { variantId: genVarId(), name: '200g (10 slices)', mrp: 130, price: 120, inStock: true, stock: 90, sku: 'CHZ-200' }
    ],
    tags: ['dairy', 'cheese', 'breakfast'],
    description: 'Processed cheese slices perfect for sandwiches',
    isActive: true
  },
  {
    name: 'Mother Dairy Dahi',
    slug: 'mother-dairy-dahi',
    brand: 'Mother Dairy',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', alt: 'Curd' }],
    variants: [
      { variantId: genVarId(), name: '400g', mrp: 35, price: 32, inStock: true, stock: 100, sku: 'DAH-400' },
      { variantId: genVarId(), name: '1kg', mrp: 75, price: 70, inStock: true, stock: 70, sku: 'DAH-1KG' }
    ],
    tags: ['dairy', 'curd', 'daily-essentials'],
    description: 'Fresh and creamy dahi',
    isActive: true
  },
  {
    name: 'Amul Paneer',
    slug: 'amul-paneer',
    brand: 'Amul',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', alt: 'Paneer' }],
    variants: [
      { variantId: genVarId(), name: '200g', mrp: 95, price: 88, inStock: true, stock: 80, sku: 'PNR-200' },
      { variantId: genVarId(), name: '500g', mrp: 220, price: 205, inStock: true, stock: 50, sku: 'PNR-500' }
    ],
    tags: ['dairy', 'paneer', 'protein'],
    description: 'Fresh and soft cottage cheese',
    isActive: true
  },
  {
    name: 'Kelloggs Corn Flakes',
    slug: 'kelloggs-corn-flakes',
    brand: 'Kelloggs',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?w=400', alt: 'Corn Flakes' }],
    variants: [
      { variantId: genVarId(), name: '475g', mrp: 210, price: 195, inStock: true, stock: 70, sku: 'KCF-475' }
    ],
    tags: ['breakfast', 'cereal', 'healthy'],
    description: 'Crunchy corn flakes for a healthy breakfast',
    isActive: true
  },
  {
    name: 'Kelloggs Chocos',
    slug: 'kelloggs-chocos',
    brand: 'Kelloggs',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400', alt: 'Chocos' }],
    variants: [
      { variantId: genVarId(), name: '375g', mrp: 199, price: 185, inStock: true, stock: 60, sku: 'KCH-375' }
    ],
    tags: ['breakfast', 'cereal', 'kids'],
    description: 'Chocolate flavored cereal loved by kids',
    isActive: true
  },
  {
    name: 'Nestle Everyday Dairy Whitener',
    slug: 'nestle-everyday',
    brand: 'Nestle',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', alt: 'Everyday' }],
    variants: [
      { variantId: genVarId(), name: '400g', mrp: 195, price: 180, inStock: true, stock: 90, sku: 'NED-400' }
    ],
    tags: ['dairy', 'milk-powder', 'tea'],
    description: 'Dairy whitener for perfect tea',
    isActive: true
  },
  {
    name: 'Amul Ghee',
    slug: 'amul-ghee',
    brand: 'Amul',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1631452180775-74a3c97d8c4e?w=400', alt: 'Ghee' }],
    variants: [
      { variantId: genVarId(), name: '500ml', mrp: 340, price: 320, inStock: true, stock: 60, sku: 'GHE-500' },
      { variantId: genVarId(), name: '1L', mrp: 650, price: 615, inStock: true, stock: 40, sku: 'GHE-1L' }
    ],
    tags: ['dairy', 'ghee', 'cooking'],
    description: 'Pure cow ghee from Amul',
    isActive: true
  },
  {
    name: 'Greek Yogurt - Plain',
    slug: 'greek-yogurt-plain',
    brand: 'Epigamia',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', alt: 'Greek Yogurt' }],
    variants: [
      { variantId: genVarId(), name: '90g', mrp: 50, price: 45, inStock: true, stock: 70, sku: 'GYP-90' }
    ],
    tags: ['dairy', 'yogurt', 'protein', 'healthy'],
    description: 'High protein Greek yogurt',
    isActive: true
  },
  {
    name: 'Masala Oats',
    slug: 'masala-oats',
    brand: 'Saffola',
    categorySlug: 'dairy-breakfast',
    images: [{ url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400', alt: 'Masala Oats' }],
    variants: [
      { variantId: genVarId(), name: '400g', mrp: 140, price: 125, inStock: true, stock: 80, sku: 'MOT-400' }
    ],
    tags: ['breakfast', 'healthy', 'oats'],
    description: 'Instant masala oats for quick breakfast',
    isActive: true
  },

  // ============ SNACKS & BEVERAGES (15 products) ============
  {
    name: 'Lays Classic Salted',
    slug: 'lays-classic-salted',
    brand: 'Lays',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', alt: 'Lays Chips' }],
    variants: [
      { variantId: genVarId(), name: '52g', mrp: 20, price: 20, inStock: true, stock: 200, sku: 'LAY-52' },
      { variantId: genVarId(), name: '115g', mrp: 40, price: 40, inStock: true, stock: 150, sku: 'LAY-115' }
    ],
    tags: ['snacks', 'chips', 'party'],
    description: 'Classic salted potato chips',
    isActive: true
  },
  {
    name: 'Lays India Magic Masala',
    slug: 'lays-india-magic-masala',
    brand: 'Lays',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400', alt: 'Lays Masala' }],
    variants: [
      { variantId: genVarId(), name: '52g', mrp: 20, price: 20, inStock: true, stock: 180, sku: 'LAYM-52' }
    ],
    tags: ['snacks', 'chips', 'masala'],
    description: 'Spicy masala flavored chips',
    isActive: true
  },
  {
    name: 'Kurkure Masala Munch',
    slug: 'kurkure-masala-munch',
    brand: 'Kurkure',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', alt: 'Kurkure' }],
    variants: [
      { variantId: genVarId(), name: '90g', mrp: 30, price: 28, inStock: true, stock: 150, sku: 'KUR-90' }
    ],
    tags: ['snacks', 'namkeen', 'masala'],
    description: 'Crunchy corn puffs with masala flavor',
    isActive: true
  },
  {
    name: 'Haldirams Bhujia',
    slug: 'haldirams-bhujia',
    brand: 'Haldirams',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', alt: 'Bhujia' }],
    variants: [
      { variantId: genVarId(), name: '200g', mrp: 65, price: 60, inStock: true, stock: 100, sku: 'HBJ-200' },
      { variantId: genVarId(), name: '400g', mrp: 120, price: 110, inStock: true, stock: 70, sku: 'HBJ-400' }
    ],
    tags: ['snacks', 'namkeen', 'traditional'],
    description: 'Classic Bikaneri bhujia',
    isActive: true
  },
  {
    name: 'Haldirams Aloo Bhujia',
    slug: 'haldirams-aloo-bhujia',
    brand: 'Haldirams',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', alt: 'Aloo Bhujia' }],
    variants: [
      { variantId: genVarId(), name: '200g', mrp: 60, price: 55, inStock: true, stock: 90, sku: 'HAB-200' }
    ],
    tags: ['snacks', 'namkeen'],
    description: 'Crispy potato bhujia',
    isActive: true
  },
  {
    name: 'Coca Cola',
    slug: 'coca-cola',
    brand: 'Coca Cola',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', alt: 'Coca Cola' }],
    variants: [
      { variantId: genVarId(), name: '300ml', mrp: 25, price: 25, inStock: true, stock: 200, sku: 'COK-300' },
      { variantId: genVarId(), name: '750ml', mrp: 45, price: 45, inStock: true, stock: 150, sku: 'COK-750' },
      { variantId: genVarId(), name: '2L', mrp: 95, price: 90, inStock: true, stock: 80, sku: 'COK-2L' }
    ],
    tags: ['beverages', 'cold-drinks', 'party'],
    description: 'Refreshing cola drink',
    isActive: true
  },
  {
    name: 'Pepsi',
    slug: 'pepsi',
    brand: 'Pepsi',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=400', alt: 'Pepsi' }],
    variants: [
      { variantId: genVarId(), name: '750ml', mrp: 45, price: 45, inStock: true, stock: 150, sku: 'PEP-750' },
      { variantId: genVarId(), name: '2L', mrp: 95, price: 90, inStock: true, stock: 70, sku: 'PEP-2L' }
    ],
    tags: ['beverages', 'cold-drinks'],
    description: 'Refreshing pepsi cola',
    isActive: true
  },
  {
    name: 'Sprite',
    slug: 'sprite',
    brand: 'Sprite',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', alt: 'Sprite' }],
    variants: [
      { variantId: genVarId(), name: '750ml', mrp: 45, price: 45, inStock: true, stock: 140, sku: 'SPR-750' }
    ],
    tags: ['beverages', 'cold-drinks', 'lemon'],
    description: 'Clear lemon lime drink',
    isActive: true
  },
  {
    name: 'Real Fruit Juice - Mixed Fruit',
    slug: 'real-juice-mixed-fruit',
    brand: 'Real',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', alt: 'Fruit Juice' }],
    variants: [
      { variantId: genVarId(), name: '1L', mrp: 120, price: 110, inStock: true, stock: 80, sku: 'RJM-1L' }
    ],
    tags: ['beverages', 'juice', 'healthy'],
    description: 'Mixed fruit juice with no added sugar',
    isActive: true
  },
  {
    name: 'Tropicana Orange Juice',
    slug: 'tropicana-orange',
    brand: 'Tropicana',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', alt: 'Orange Juice' }],
    variants: [
      { variantId: genVarId(), name: '1L', mrp: 145, price: 135, inStock: true, stock: 70, sku: 'TOJ-1L' }
    ],
    tags: ['beverages', 'juice', 'orange'],
    description: '100% orange juice',
    isActive: true
  },
  {
    name: 'Red Bull Energy Drink',
    slug: 'red-bull',
    brand: 'Red Bull',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400', alt: 'Red Bull' }],
    variants: [
      { variantId: genVarId(), name: '250ml', mrp: 125, price: 120, inStock: true, stock: 60, sku: 'RBL-250' }
    ],
    tags: ['beverages', 'energy-drink'],
    description: 'Energy drink that gives you wings',
    isActive: true
  },
  {
    name: 'Britannia Good Day Butter',
    slug: 'good-day-butter',
    brand: 'Britannia',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', alt: 'Good Day Biscuits' }],
    variants: [
      { variantId: genVarId(), name: '200g', mrp: 45, price: 42, inStock: true, stock: 150, sku: 'GDB-200' }
    ],
    tags: ['biscuits', 'snacks', 'tea-time'],
    description: 'Butter cookies for tea time',
    isActive: true
  },
  {
    name: 'Parle-G Biscuits',
    slug: 'parle-g',
    brand: 'Parle',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', alt: 'Parle-G' }],
    variants: [
      { variantId: genVarId(), name: '200g', mrp: 25, price: 23, inStock: true, stock: 200, sku: 'PLG-200' },
      { variantId: genVarId(), name: '800g', mrp: 85, price: 80, inStock: true, stock: 100, sku: 'PLG-800' }
    ],
    tags: ['biscuits', 'snacks', 'value'],
    description: 'India\'s favorite glucose biscuit',
    isActive: true
  },
  {
    name: 'Oreo Biscuits',
    slug: 'oreo-biscuits',
    brand: 'Cadbury',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400', alt: 'Oreo' }],
    variants: [
      { variantId: genVarId(), name: '120g', mrp: 35, price: 32, inStock: true, stock: 120, sku: 'ORO-120' }
    ],
    tags: ['biscuits', 'chocolate', 'kids'],
    description: 'Chocolate sandwich cookies',
    isActive: true
  },
  {
    name: 'Bingo Mad Angles',
    slug: 'bingo-mad-angles',
    brand: 'Bingo',
    categorySlug: 'snacks-beverages',
    images: [{ url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', alt: 'Mad Angles' }],
    variants: [
      { variantId: genVarId(), name: '90g', mrp: 30, price: 28, inStock: true, stock: 130, sku: 'BMA-90' }
    ],
    tags: ['snacks', 'chips'],
    description: 'Triangular shaped masala chips',
    isActive: true
  },

  // ============ STAPLES (12 products) ============
  {
    name: 'India Gate Basmati Rice',
    slug: 'india-gate-basmati',
    brand: 'India Gate',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', alt: 'Basmati Rice' }],
    variants: [
      { variantId: genVarId(), name: '1kg', mrp: 150, price: 140, inStock: true, stock: 100, sku: 'IGR-1KG' },
      { variantId: genVarId(), name: '5kg', mrp: 550, price: 510, inStock: true, stock: 60, sku: 'IGR-5KG' }
    ],
    tags: ['rice', 'basmati', 'staples'],
    description: 'Premium aged basmati rice',
    isActive: true
  },
  {
    name: 'Fortune Sunlite Oil',
    slug: 'fortune-sunlite-oil',
    brand: 'Fortune',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', alt: 'Sunflower Oil' }],
    variants: [
      { variantId: genVarId(), name: '1L', mrp: 175, price: 165, inStock: true, stock: 120, sku: 'FSO-1L' },
      { variantId: genVarId(), name: '5L', mrp: 775, price: 740, inStock: true, stock: 50, sku: 'FSO-5L' }
    ],
    tags: ['oil', 'cooking', 'staples'],
    description: 'Refined sunflower oil',
    isActive: true
  },
  {
    name: 'Tata Salt',
    slug: 'tata-salt',
    brand: 'Tata',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400', alt: 'Salt' }],
    variants: [
      { variantId: genVarId(), name: '1kg', mrp: 28, price: 26, inStock: true, stock: 200, sku: 'TSL-1KG' }
    ],
    tags: ['salt', 'staples', 'daily-essentials'],
    description: 'Vacuum evaporated iodised salt',
    isActive: true
  },
  {
    name: 'Tata Sampann Toor Dal',
    slug: 'tata-toor-dal',
    brand: 'Tata Sampann',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1585996025476-c84f87cc6cd5?w=400', alt: 'Toor Dal' }],
    variants: [
      { variantId: genVarId(), name: '1kg', mrp: 185, price: 170, inStock: true, stock: 80, sku: 'TTD-1KG' }
    ],
    tags: ['dal', 'pulses', 'staples'],
    description: 'Unpolished toor dal',
    isActive: true
  },
  {
    name: 'Aashirvaad Whole Wheat Atta',
    slug: 'aashirvaad-atta',
    brand: 'Aashirvaad',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', alt: 'Wheat Atta' }],
    variants: [
      { variantId: genVarId(), name: '5kg', mrp: 280, price: 260, inStock: true, stock: 80, sku: 'AWA-5KG' },
      { variantId: genVarId(), name: '10kg', mrp: 520, price: 490, inStock: true, stock: 50, sku: 'AWA-10KG' }
    ],
    tags: ['atta', 'flour', 'staples'],
    description: '100% whole wheat atta',
    isActive: true
  },
  {
    name: 'MDH Garam Masala',
    slug: 'mdh-garam-masala',
    brand: 'MDH',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', alt: 'Garam Masala' }],
    variants: [
      { variantId: genVarId(), name: '100g', mrp: 80, price: 74, inStock: true, stock: 100, sku: 'MGM-100' }
    ],
    tags: ['spices', 'masala', 'cooking'],
    description: 'Aromatic blend of spices',
    isActive: true
  },
  {
    name: 'Everest Turmeric Powder',
    slug: 'everest-turmeric',
    brand: 'Everest',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400', alt: 'Turmeric' }],
    variants: [
      { variantId: genVarId(), name: '100g', mrp: 48, price: 44, inStock: true, stock: 150, sku: 'ETR-100' },
      { variantId: genVarId(), name: '200g', mrp: 92, price: 85, inStock: true, stock: 100, sku: 'ETR-200' }
    ],
    tags: ['spices', 'turmeric', 'cooking'],
    description: 'Pure turmeric powder',
    isActive: true
  },
  {
    name: 'Everest Red Chilli Powder',
    slug: 'everest-red-chilli',
    brand: 'Everest',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', alt: 'Red Chilli' }],
    variants: [
      { variantId: genVarId(), name: '100g', mrp: 55, price: 50, inStock: true, stock: 120, sku: 'ERC-100' }
    ],
    tags: ['spices', 'chilli', 'cooking'],
    description: 'Hot red chilli powder',
    isActive: true
  },
  {
    name: 'Catch Cumin (Jeera) Powder',
    slug: 'catch-jeera-powder',
    brand: 'Catch',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1599909533400-7c9b12d9f02c?w=400', alt: 'Jeera' }],
    variants: [
      { variantId: genVarId(), name: '100g', mrp: 70, price: 65, inStock: true, stock: 90, sku: 'CJP-100' }
    ],
    tags: ['spices', 'jeera', 'cooking'],
    description: 'Aromatic cumin powder',
    isActive: true
  },
  {
    name: 'Sugar',
    slug: 'sugar',
    brand: 'Uttam',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400', alt: 'Sugar' }],
    variants: [
      { variantId: genVarId(), name: '1kg', mrp: 52, price: 48, inStock: true, stock: 150, sku: 'SUG-1KG' },
      { variantId: genVarId(), name: '5kg', mrp: 250, price: 235, inStock: true, stock: 80, sku: 'SUG-5KG' }
    ],
    tags: ['sugar', 'staples', 'daily-essentials'],
    description: 'White crystal sugar',
    isActive: true
  },
  {
    name: 'Saffola Gold Oil',
    slug: 'saffola-gold-oil',
    brand: 'Saffola',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', alt: 'Saffola Oil' }],
    variants: [
      { variantId: genVarId(), name: '1L', mrp: 220, price: 205, inStock: true, stock: 80, sku: 'SFG-1L' }
    ],
    tags: ['oil', 'cooking', 'healthy'],
    description: 'Heart healthy blended oil',
    isActive: true
  },
  {
    name: 'Moong Dal',
    slug: 'moong-dal',
    brand: 'Tata Sampann',
    categorySlug: 'staples',
    images: [{ url: 'https://images.unsplash.com/photo-1585996025476-c84f87cc6cd5?w=400', alt: 'Moong Dal' }],
    variants: [
      { variantId: genVarId(), name: '1kg', mrp: 165, price: 150, inStock: true, stock: 70, sku: 'TMD-1KG' }
    ],
    tags: ['dal', 'pulses', 'staples'],
    description: 'Yellow moong dal',
    isActive: true
  },

  // ============ INSTANT & FROZEN (10 products) ============
  {
    name: 'Maggi 2-Minute Noodles',
    slug: 'maggi-noodles',
    brand: 'Maggi',
    categorySlug: 'instant-frozen',
    images: [{ url: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400', alt: 'Maggi Noodles' }],
    variants: [
      { variantId: genVarId(), name: '70g (Single)', mrp: 14, price: 14, inStock: true, stock: 300, sku: 'MAG-70' },
      { variantId: genVarId(), name: '280g (4 Pack)', mrp: 56, price: 52, inStock: true, stock: 200, sku: 'MAG-280' },
      { variantId: genVarId(), name: '560g (8 Pack)', mrp: 108, price: 100, inStock: true, stock: 100, sku: 'MAG-560' }
    ],
    tags: ['noodles', 'instant', 'quick-meal'],
    description: '2-minute instant noodles',
    isActive: true
  },
  {
    name: 'Knorr Classic Tomato Soup',
    slug: 'knorr-tomato-soup',
    brand: 'Knorr',
    categorySlug: 'instant-frozen',
    images: [{ url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', alt: 'Tomato Soup' }],
    variants: [
      { variantId: genVarId(), name: '53g', mrp: 60, price: 55, inStock: true, stock: 80, sku: 'KTS-53' }
    ],
    tags: ['soup', 'instant', 'ready-to-cook'],
    description: 'Classic tomato soup mix',
    isActive: true
  },
  {
    name: 'MTR Ready to Eat Rajma Masala',
    slug: 'mtr-rajma-masala',
    brand: 'MTR',
    categorySlug: 'instant-frozen',
    images: [{ url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', alt: 'Rajma Masala' }],
    variants: [
      { variantId: genVarId(), name: '300g', mrp: 99, price: 90, inStock: true, stock: 60, sku: 'MTR-RM' }
    ],
    tags: ['ready-to-eat', 'instant', 'meal'],
    description: 'Heat and eat rajma masala',
    isActive: true
  },
  {
    name: 'McCain French Fries',
    slug: 'mccain-french-fries',
    brand: 'McCain',
    categorySlug: 'instant-frozen',
    images: [{ url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', alt: 'French Fries' }],
    variants: [
      { variantId: genVarId(), name: '420g', mrp: 150, price: 140, inStock: true, stock: 50, sku: 'MCF-420' }
    ],
    tags: ['frozen', 'fries', 'snacks'],
    description: 'Crispy frozen french fries',
    isActive: true
  },
  {
    name: 'Yippee Noodles',
    slug: 'yippee-noodles',
    brand: 'Sunfeast',
    categorySlug: 'instant-frozen',
    images: [{ url: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400', alt: 'Yippee Noodles' }],
    variants: [
      { variantId: genVarId(), name: '280g (4 Pack)', mrp: 52, price: 48, inStock: true, stock: 150, sku: 'YIP-280' }
    ],
    tags: ['noodles', 'instant'],
    description: 'Magic masala instant noodles',
    isActive: true
  },
  {
    name: 'Haldirams Frozen Samosa',
    slug: 'haldirams-frozen-samosa',
    brand: 'Haldirams',
    categorySlug: 'instant-frozen',
    images: [{ url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', alt: 'Frozen Samosa' }],
    variants: [
      { variantId: genVarId(), name: '300g (6 pcs)', mrp: 120, price: 110, inStock: true, stock: 40, sku: 'HFS-300' }
    ],
    tags: ['frozen', 'snacks', 'indian'],
    description: 'Ready to fry frozen samosas',
    isActive: true
  },
  {
    name: 'Cup Noodles - Masala',
    slug: 'cup-noodles-masala',
    brand: 'Nissin',
    categorySlug: 'instant-frozen',
    images: [{ url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', alt: 'Cup Noodles' }],
    variants: [
      { variantId: genVarId(), name: '70g', mrp: 50, price: 45, inStock: true, stock: 100, sku: 'CNM-70' }
    ],
    tags: ['noodles', 'instant', 'cup'],
    description: 'Just add hot water noodles',
    isActive: true
  },
  {
    name: 'MTR Rava Idli Mix',
    slug: 'mtr-rava-idli-mix',
    brand: 'MTR',
    categorySlug: 'instant-frozen',
    images: [{ url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400', alt: 'Idli Mix' }],
    variants: [
      { variantId: genVarId(), name: '500g', mrp: 95, price: 88, inStock: true, stock: 70, sku: 'MTR-IDL' }
    ],
    tags: ['instant', 'breakfast', 'south-indian'],
    description: 'Instant rava idli mix',
    isActive: true
  },
  {
    name: 'Gits Gulab Jamun Mix',
    slug: 'gits-gulab-jamun',
    brand: 'Gits',
    categorySlug: 'instant-frozen',
    images: [{ url: 'https://images.unsplash.com/photo-1666190060504-a1a56453c8d8?w=400', alt: 'Gulab Jamun' }],
    variants: [
      { variantId: genVarId(), name: '200g', mrp: 95, price: 88, inStock: true, stock: 60, sku: 'GGJ-200' }
    ],
    tags: ['instant', 'dessert', 'sweets'],
    description: 'Easy to make gulab jamun',
    isActive: true
  },
  {
    name: 'Ching\'s Schezwan Noodles',
    slug: 'chings-schezwan-noodles',
    brand: 'Ching\'s',
    categorySlug: 'instant-frozen',
    images: [{ url: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400', alt: 'Schezwan Noodles' }],
    variants: [
      { variantId: genVarId(), name: '240g', mrp: 55, price: 50, inStock: true, stock: 90, sku: 'CSN-240' }
    ],
    tags: ['noodles', 'instant', 'chinese'],
    description: 'Spicy schezwan flavor noodles',
    isActive: true
  },

  // ============ PERSONAL CARE (10 products) ============
  {
    name: 'Colgate MaxFresh Toothpaste',
    slug: 'colgate-maxfresh',
    brand: 'Colgate',
    categorySlug: 'personal-care',
    images: [{ url: 'https://images.unsplash.com/photo-1628359355624-855c74c44bc5?w=400', alt: 'Toothpaste' }],
    variants: [
      { variantId: genVarId(), name: '150g', mrp: 110, price: 99, inStock: true, stock: 120, sku: 'CMF-150' }
    ],
    tags: ['toothpaste', 'oral-care', 'daily-essentials'],
    description: 'Cooling crystal toothpaste',
    isActive: true
  },
  {
    name: 'Dettol Original Soap',
    slug: 'dettol-soap',
    brand: 'Dettol',
    categorySlug: 'personal-care',
    images: [{ url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400', alt: 'Dettol Soap' }],
    variants: [
      { variantId: genVarId(), name: '125g', mrp: 55, price: 50, inStock: true, stock: 150, sku: 'DTS-125' },
      { variantId: genVarId(), name: '125g x 4', mrp: 199, price: 180, inStock: true, stock: 80, sku: 'DTS-4PK' }
    ],
    tags: ['soap', 'bath', 'antibacterial'],
    description: 'Trusted protection soap',
    isActive: true
  },
  {
    name: 'Dove Shampoo',
    slug: 'dove-shampoo',
    brand: 'Dove',
    categorySlug: 'personal-care',
    images: [{ url: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400', alt: 'Dove Shampoo' }],
    variants: [
      { variantId: genVarId(), name: '340ml', mrp: 315, price: 290, inStock: true, stock: 70, sku: 'DVS-340' }
    ],
    tags: ['shampoo', 'hair-care'],
    description: 'Daily shine shampoo',
    isActive: true
  },
  {
    name: 'Head & Shoulders Shampoo',
    slug: 'head-shoulders',
    brand: 'Head & Shoulders',
    categorySlug: 'personal-care',
    images: [{ url: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400', alt: 'Head Shoulders' }],
    variants: [
      { variantId: genVarId(), name: '340ml', mrp: 340, price: 310, inStock: true, stock: 60, sku: 'HNS-340' }
    ],
    tags: ['shampoo', 'hair-care', 'anti-dandruff'],
    description: 'Anti-dandruff shampoo',
    isActive: true
  },
  {
    name: 'Nivea Body Lotion',
    slug: 'nivea-body-lotion',
    brand: 'Nivea',
    categorySlug: 'personal-care',
    images: [{ url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400', alt: 'Body Lotion' }],
    variants: [
      { variantId: genVarId(), name: '200ml', mrp: 220, price: 200, inStock: true, stock: 80, sku: 'NVL-200' }
    ],
    tags: ['lotion', 'skin-care', 'moisturizer'],
    description: 'Deep moisture body lotion',
    isActive: true
  },
  {
    name: 'Gillette Guard Razor',
    slug: 'gillette-guard',
    brand: 'Gillette',
    categorySlug: 'personal-care',
    images: [{ url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400', alt: 'Razor' }],
    variants: [
      { variantId: genVarId(), name: '1 Razor + 2 Cartridges', mrp: 85, price: 78, inStock: true, stock: 100, sku: 'GGR-1' }
    ],
    tags: ['razor', 'shaving', 'men'],
    description: 'Guard razor with cartridges',
    isActive: true
  },
  {
    name: 'Whisper Choice Sanitary Pads',
    slug: 'whisper-choice',
    brand: 'Whisper',
    categorySlug: 'personal-care',
    images: [{ url: 'https://images.unsplash.com/photo-1589810635657-232948472d98?w=400', alt: 'Sanitary Pads' }],
    variants: [
      { variantId: genVarId(), name: '7 Pads', mrp: 42, price: 40, inStock: true, stock: 120, sku: 'WSP-7' },
      { variantId: genVarId(), name: '20 Pads', mrp: 115, price: 105, inStock: true, stock: 80, sku: 'WSP-20' }
    ],
    tags: ['feminine-care', 'hygiene'],
    description: 'Ultra-thin sanitary pads',
    isActive: true
  },
  {
    name: 'Dettol Hand Wash',
    slug: 'dettol-handwash',
    brand: 'Dettol',
    categorySlug: 'personal-care',
    images: [{ url: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400', alt: 'Hand Wash' }],
    variants: [
      { variantId: genVarId(), name: '200ml', mrp: 60, price: 55, inStock: true, stock: 100, sku: 'DHW-200' },
      { variantId: genVarId(), name: '900ml Refill', mrp: 170, price: 155, inStock: true, stock: 60, sku: 'DHW-900' }
    ],
    tags: ['handwash', 'hygiene', 'antibacterial'],
    description: 'Original liquid handwash',
    isActive: true
  },
  {
    name: 'Lux Soap',
    slug: 'lux-soap',
    brand: 'Lux',
    categorySlug: 'personal-care',
    images: [{ url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400', alt: 'Lux Soap' }],
    variants: [
      { variantId: genVarId(), name: '150g', mrp: 52, price: 48, inStock: true, stock: 140, sku: 'LUX-150' }
    ],
    tags: ['soap', 'bath', 'fragrance'],
    description: 'Soft touch beauty soap',
    isActive: true
  },
  {
    name: 'Pepsodent Toothpaste',
    slug: 'pepsodent-toothpaste',
    brand: 'Pepsodent',
    categorySlug: 'personal-care',
    images: [{ url: 'https://images.unsplash.com/photo-1628359355624-855c74c44bc5?w=400', alt: 'Pepsodent' }],
    variants: [
      { variantId: genVarId(), name: '200g', mrp: 95, price: 88, inStock: true, stock: 110, sku: 'PSD-200' }
    ],
    tags: ['toothpaste', 'oral-care'],
    description: 'Germicheck toothpaste',
    isActive: true
  },

  // ============ HOME & KITCHEN (8 products) ============
  {
    name: 'Vim Dishwash Bar',
    slug: 'vim-dishwash-bar',
    brand: 'Vim',
    categorySlug: 'home-kitchen',
    images: [{ url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400', alt: 'Vim Bar' }],
    variants: [
      { variantId: genVarId(), name: '200g', mrp: 32, price: 30, inStock: true, stock: 180, sku: 'VIM-200' },
      { variantId: genVarId(), name: '500g', mrp: 70, price: 65, inStock: true, stock: 100, sku: 'VIM-500' }
    ],
    tags: ['dishwash', 'cleaning', 'kitchen'],
    description: 'Lemon dishwash bar',
    isActive: true
  },
  {
    name: 'Surf Excel Detergent',
    slug: 'surf-excel-detergent',
    brand: 'Surf Excel',
    categorySlug: 'home-kitchen',
    images: [{ url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', alt: 'Surf Excel' }],
    variants: [
      { variantId: genVarId(), name: '1kg', mrp: 185, price: 170, inStock: true, stock: 80, sku: 'SRF-1KG' },
      { variantId: genVarId(), name: '2kg', mrp: 350, price: 325, inStock: true, stock: 50, sku: 'SRF-2KG' }
    ],
    tags: ['detergent', 'laundry', 'cleaning'],
    description: 'Easy wash detergent powder',
    isActive: true
  },
  {
    name: 'Harpic Toilet Cleaner',
    slug: 'harpic-toilet-cleaner',
    brand: 'Harpic',
    categorySlug: 'home-kitchen',
    images: [{ url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400', alt: 'Harpic' }],
    variants: [
      { variantId: genVarId(), name: '500ml', mrp: 110, price: 100, inStock: true, stock: 90, sku: 'HRP-500' }
    ],
    tags: ['toilet-cleaner', 'bathroom', 'cleaning'],
    description: 'Power plus toilet cleaner',
    isActive: true
  },
  {
    name: 'Colin Glass Cleaner',
    slug: 'colin-glass-cleaner',
    brand: 'Colin',
    categorySlug: 'home-kitchen',
    images: [{ url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', alt: 'Glass Cleaner' }],
    variants: [
      { variantId: genVarId(), name: '500ml', mrp: 130, price: 120, inStock: true, stock: 70, sku: 'COL-500' }
    ],
    tags: ['glass-cleaner', 'cleaning', 'home'],
    description: 'Streak-free shine glass cleaner',
    isActive: true
  },
  {
    name: 'Lizol Floor Cleaner',
    slug: 'lizol-floor-cleaner',
    brand: 'Lizol',
    categorySlug: 'home-kitchen',
    images: [{ url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400', alt: 'Floor Cleaner' }],
    variants: [
      { variantId: genVarId(), name: '1L', mrp: 195, price: 180, inStock: true, stock: 60, sku: 'LIZ-1L' }
    ],
    tags: ['floor-cleaner', 'cleaning', 'home'],
    description: 'Disinfectant surface cleaner',
    isActive: true
  },
  {
    name: 'Good Knight Liquid Vapourizer',
    slug: 'goodknight-vapourizer',
    brand: 'Good Knight',
    categorySlug: 'home-kitchen',
    images: [{ url: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400', alt: 'Vapourizer' }],
    variants: [
      { variantId: genVarId(), name: '45ml Refill', mrp: 75, price: 70, inStock: true, stock: 100, sku: 'GKV-45' }
    ],
    tags: ['mosquito', 'repellent', 'home'],
    description: 'Mosquito repellent refill',
    isActive: true
  },
  {
    name: 'Scotch Brite Scrub Pad',
    slug: 'scotch-brite-scrub',
    brand: 'Scotch Brite',
    categorySlug: 'home-kitchen',
    images: [{ url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400', alt: 'Scrub Pad' }],
    variants: [
      { variantId: genVarId(), name: '3 Pads', mrp: 50, price: 45, inStock: true, stock: 120, sku: 'SBS-3' }
    ],
    tags: ['scrub', 'cleaning', 'kitchen'],
    description: 'Heavy duty scrub pad',
    isActive: true
  },
  {
    name: 'Odonil Air Freshener',
    slug: 'odonil-air-freshener',
    brand: 'Odonil',
    categorySlug: 'home-kitchen',
    images: [{ url: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400', alt: 'Air Freshener' }],
    variants: [
      { variantId: genVarId(), name: '75g', mrp: 55, price: 50, inStock: true, stock: 90, sku: 'ODN-75' }
    ],
    tags: ['air-freshener', 'fragrance', 'bathroom'],
    description: 'Bathroom air freshener',
    isActive: true
  },

  // ============ BABY CARE (6 products) ============
  {
    name: 'Pampers Active Baby Diapers',
    slug: 'pampers-diapers',
    brand: 'Pampers',
    categorySlug: 'baby-care',
    images: [{ url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', alt: 'Pampers Diapers' }],
    variants: [
      { variantId: genVarId(), name: 'Small (46 pcs)', mrp: 899, price: 850, inStock: true, stock: 40, sku: 'PAM-S46' },
      { variantId: genVarId(), name: 'Medium (40 pcs)', mrp: 899, price: 850, inStock: true, stock: 50, sku: 'PAM-M40' },
      { variantId: genVarId(), name: 'Large (34 pcs)', mrp: 899, price: 850, inStock: true, stock: 45, sku: 'PAM-L34' }
    ],
    tags: ['diapers', 'baby', 'hygiene'],
    description: 'Soft and absorbent baby diapers',
    isActive: true
  },
  {
    name: 'Johnson Baby Powder',
    slug: 'johnson-baby-powder',
    brand: 'Johnson\'s',
    categorySlug: 'baby-care',
    images: [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', alt: 'Baby Powder' }],
    variants: [
      { variantId: genVarId(), name: '200g', mrp: 160, price: 150, inStock: true, stock: 80, sku: 'JBP-200' }
    ],
    tags: ['powder', 'baby', 'care'],
    description: 'Gentle baby powder',
    isActive: true
  },
  {
    name: 'Johnson Baby Shampoo',
    slug: 'johnson-baby-shampoo',
    brand: 'Johnson\'s',
    categorySlug: 'baby-care',
    images: [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', alt: 'Baby Shampoo' }],
    variants: [
      { variantId: genVarId(), name: '200ml', mrp: 190, price: 175, inStock: true, stock: 70, sku: 'JBS-200' }
    ],
    tags: ['shampoo', 'baby', 'gentle'],
    description: 'No more tears shampoo',
    isActive: true
  },
  {
    name: 'Cerelac Baby Food',
    slug: 'cerelac-baby-food',
    brand: 'Nestle',
    categorySlug: 'baby-care',
    images: [{ url: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400', alt: 'Cerelac' }],
    variants: [
      { variantId: genVarId(), name: '300g', mrp: 250, price: 235, inStock: true, stock: 60, sku: 'CRL-300' }
    ],
    tags: ['baby-food', 'cereal', 'nutrition'],
    description: 'Wheat apple cherry baby cereal',
    isActive: true
  },
  {
    name: 'Himalaya Baby Lotion',
    slug: 'himalaya-baby-lotion',
    brand: 'Himalaya',
    categorySlug: 'baby-care',
    images: [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', alt: 'Baby Lotion' }],
    variants: [
      { variantId: genVarId(), name: '200ml', mrp: 165, price: 155, inStock: true, stock: 65, sku: 'HBL-200' }
    ],
    tags: ['lotion', 'baby', 'moisturizer'],
    description: 'Nourishing baby lotion',
    isActive: true
  },
  {
    name: 'MamyPoko Pants',
    slug: 'mamypoko-pants',
    brand: 'MamyPoko',
    categorySlug: 'baby-care',
    images: [{ url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', alt: 'MamyPoko' }],
    variants: [
      { variantId: genVarId(), name: 'Large (42 pcs)', mrp: 949, price: 899, inStock: true, stock: 40, sku: 'MPP-L42' },
      { variantId: genVarId(), name: 'XL (36 pcs)', mrp: 949, price: 899, inStock: true, stock: 35, sku: 'MPP-XL36' }
    ],
    tags: ['diapers', 'pants', 'baby'],
    description: 'Pant style diapers',
    isActive: true
  },

  // ============ PET CARE (4 products) ============
  {
    name: 'Pedigree Adult Dog Food',
    slug: 'pedigree-dog-food',
    brand: 'Pedigree',
    categorySlug: 'pet-care',
    images: [{ url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400', alt: 'Dog Food' }],
    variants: [
      { variantId: genVarId(), name: '3kg', mrp: 660, price: 620, inStock: true, stock: 30, sku: 'PDG-3KG' },
      { variantId: genVarId(), name: '10kg', mrp: 1980, price: 1850, inStock: true, stock: 15, sku: 'PDG-10KG' }
    ],
    tags: ['dog-food', 'pet', 'nutrition'],
    description: 'Complete nutrition for adult dogs',
    isActive: true
  },
  {
    name: 'Whiskas Cat Food - Tuna',
    slug: 'whiskas-cat-food',
    brand: 'Whiskas',
    categorySlug: 'pet-care',
    images: [{ url: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=400', alt: 'Cat Food' }],
    variants: [
      { variantId: genVarId(), name: '480g', mrp: 180, price: 165, inStock: true, stock: 40, sku: 'WSK-480' },
      { variantId: genVarId(), name: '1.2kg', mrp: 420, price: 390, inStock: true, stock: 25, sku: 'WSK-1.2' }
    ],
    tags: ['cat-food', 'pet', 'tuna'],
    description: 'Tuna flavored cat food',
    isActive: true
  },
  {
    name: 'Drools Dog Biscuits',
    slug: 'drools-dog-biscuits',
    brand: 'Drools',
    categorySlug: 'pet-care',
    images: [{ url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400', alt: 'Dog Biscuits' }],
    variants: [
      { variantId: genVarId(), name: '500g', mrp: 180, price: 165, inStock: true, stock: 50, sku: 'DRB-500' }
    ],
    tags: ['dog-treats', 'pet', 'biscuits'],
    description: 'Crunchy dog biscuits',
    isActive: true
  },
  {
    name: 'Pet Shampoo',
    slug: 'pet-shampoo',
    brand: 'Himalaya',
    categorySlug: 'pet-care',
    images: [{ url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', alt: 'Pet Shampoo' }],
    variants: [
      { variantId: genVarId(), name: '200ml', mrp: 220, price: 200, inStock: true, stock: 35, sku: 'PTS-200' }
    ],
    tags: ['pet-care', 'shampoo', 'grooming'],
    description: 'Gentle pet shampoo',
    isActive: true
  },

  // ============ MEAT & SEAFOOD (4 products) ============
  {
    name: 'Fresh Chicken Breast',
    slug: 'chicken-breast',
    brand: 'Licious',
    categorySlug: 'meat-seafood',
    images: [{ url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400', alt: 'Chicken Breast' }],
    variants: [
      { variantId: genVarId(), name: '500g', mrp: 280, price: 260, inStock: true, stock: 30, sku: 'CHB-500' }
    ],
    tags: ['chicken', 'meat', 'fresh', 'protein'],
    description: 'Boneless chicken breast',
    isActive: true
  },
  {
    name: 'Chicken Curry Cut',
    slug: 'chicken-curry-cut',
    brand: 'Licious',
    categorySlug: 'meat-seafood',
    images: [{ url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400', alt: 'Chicken Curry Cut' }],
    variants: [
      { variantId: genVarId(), name: '500g', mrp: 200, price: 185, inStock: true, stock: 40, sku: 'CHC-500' },
      { variantId: genVarId(), name: '1kg', mrp: 380, price: 350, inStock: true, stock: 25, sku: 'CHC-1KG' }
    ],
    tags: ['chicken', 'meat', 'fresh'],
    description: 'Fresh chicken with bone',
    isActive: true
  },
  {
    name: 'Fresh Mutton',
    slug: 'fresh-mutton',
    brand: 'FreshToHome',
    categorySlug: 'meat-seafood',
    images: [{ url: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400', alt: 'Mutton' }],
    variants: [
      { variantId: genVarId(), name: '500g', mrp: 450, price: 420, inStock: true, stock: 20, sku: 'MTN-500' }
    ],
    tags: ['mutton', 'meat', 'fresh'],
    description: 'Fresh goat meat',
    isActive: true
  },
  {
    name: 'Rohu Fish',
    slug: 'rohu-fish',
    brand: 'FreshToHome',
    categorySlug: 'meat-seafood',
    images: [{ url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', alt: 'Fish' }],
    variants: [
      { variantId: genVarId(), name: '500g', mrp: 180, price: 165, inStock: true, stock: 25, sku: 'ROH-500' }
    ],
    tags: ['fish', 'seafood', 'fresh'],
    description: 'Fresh Rohu fish cleaned',
    isActive: true
  }
];

// Users (50 mock users)
const users = Array.from({ length: 50 }, (_, i) => ({
  phone: `98765${String(i).padStart(5, '0')}`,
  name: ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy', 'Vikram Singh', 'Anjali Gupta', 'Rajesh Nair', 'Deepika Iyer', 'Suresh Menon', 'Kavitha Rao'][i % 10],
  email: i % 3 === 0 ? `user${i + 1}@email.com` : undefined,
  status: i % 20 === 0 ? 'blocked' : 'active',
  totalOrders: Math.floor(Math.random() * 15),
  totalSpent: Math.floor(Math.random() * 8000)
}));

// Serviceable locations (Hyderabad pincodes)
const locations = [
  { pincode: '500001', area: 'Abids', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 10, deliveryFee: 0 },
  { pincode: '500003', area: 'Kachiguda', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 12, deliveryFee: 0 },
  { pincode: '500004', area: 'Sultan Bazar', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 15, deliveryFee: 0 },
  { pincode: '500012', area: 'Tarnaka', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 10, deliveryFee: 0 },
  { pincode: '500016', area: 'Himayat Nagar', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 8, deliveryFee: 0 },
  { pincode: '500028', area: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 10, deliveryFee: 0 },
  { pincode: '500029', area: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 8, deliveryFee: 0 },
  { pincode: '500032', area: 'Secunderabad', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 12, deliveryFee: 0 },
  { pincode: '500034', area: 'Malkajgiri', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 15, deliveryFee: 0 },
  { pincode: '500044', area: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 10, deliveryFee: 0 },
  { pincode: '500081', area: 'Madhapur', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 10, deliveryFee: 0 },
  { pincode: '500082', area: 'HITEC City', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 12, deliveryFee: 0 },
  { pincode: '500084', area: 'Kondapur', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 12, deliveryFee: 0 },
  { pincode: '500090', area: 'Kukatpally', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 15, deliveryFee: 0 },
  { pincode: '500072', area: 'Miyapur', city: 'Hyderabad', state: 'Telangana', isServiceable: true, estimatedDeliveryTime: 18, deliveryFee: 20 }
];

// Delivery partners (15)
const partners = Array.from({ length: 15 }, (_, i) => ({
  name: ['Raju Kumar', 'Sunil Yadav', 'Mohan Reddy', 'Krishna Prasad', 'Venkat Rao', 'Srinivas', 'Ramesh Babu', 'Ganesh', 'Mahesh Kumar', 'Naresh', 'Prakash', 'Santosh', 'Vijay', 'Anil', 'Kiran'][i],
  phone: `91234${String(i).padStart(5, '0')}`,
  email: `partner${i + 1}@zipto.com`,
  vehicleType: ['bike', 'scooter', 'bicycle'][i % 3],
  vehicleNumber: `TS09XX${1000 + i}`,
  status: ['available', 'busy', 'offline'][i % 3],
  currentLocation: {
    type: 'Point',
    coordinates: [78.4867 + (Math.random() - 0.5) * 0.1, 17.385 + (Math.random() - 0.5) * 0.1]
  },
  rating: { average: 4 + Math.random(), count: Math.floor(Math.random() * 100) + 10 },
  totalDeliveries: Math.floor(Math.random() * 500) + 50,
  todayDeliveries: Math.floor(Math.random() * 10),
  isActive: i % 8 !== 0
}));

// Orders (30 sample orders)
const orders = Array.from({ length: 30 }, (_, i) => ({
  orderId: generateUniqueOrderId(i),
  items: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => ({
    variantId: `v${j + 1}`,
    name: ['Amul Milk', 'Fresh Tomatoes', 'Maggi Noodles', 'Lays Chips', 'Bread'][j % 5],
    variantLabel: ['1L', '500g', '280g', '52g', '400g'][j % 5],
    quantity: Math.floor(Math.random() * 3) + 1,
    price: [50, 35, 52, 20, 42][j % 5],
    mrp: [54, 40, 56, 20, 45][j % 5]
  })),
  deliveryAddress: {
    name: users[i % users.length].name,
    phone: users[i % users.length].phone,
    addressLine1: `Flat ${100 + i}, Tower ${String.fromCharCode(65 + (i % 4))}`,
    addressLine2: ['Prestige Apartments', 'Mantri Residency', 'Aparna Towers', 'My Home Hub'][i % 4],
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: locations[i % locations.length].pincode,
    latitude: 17.385 + (Math.random() - 0.5) * 0.1,
    longitude: 78.4867 + (Math.random() - 0.5) * 0.1
  },
  payment: {
    method: ['cod', 'online', 'upi'][i % 3],
    status: i % 6 === 5 ? 'pending' : 'success'
  },
  pricing: {
    itemTotal: 150 + Math.random() * 400,
    deliveryFee: 0,
    handlingFee: 5,
    tip: i % 4 === 0 ? 20 : 0,
    totalSavings: 20 + Math.floor(Math.random() * 50),
    grandTotal: 155 + Math.random() * 400
  },
  status: ['placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered', 'cancelled'][i % 6],
  statusHistory: [
    { status: 'placed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * (30 - i)), note: 'Order placed successfully' }
  ],
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * (30 - i))
}));

// Banners (6 promotional banners)
const banners = [
  {
    title: 'Get 20% OFF on First Order',
    subtitle: 'Use code: FIRST20',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop',
    link: '/products',
    bgColor: '#7c3aed',
    priority: 10,
    isActive: true,
    type: 'promotional'
  },
  {
    title: 'Fresh Fruits & Vegetables',
    subtitle: 'Farm to Home in 10 Minutes',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&h=400&fit=crop',
    link: '/category/fruits-vegetables',
    bgColor: '#22c55e',
    priority: 9,
    isActive: true,
    type: 'category'
  },
  {
    title: 'Dairy Essentials',
    subtitle: 'Milk, Butter, Cheese & More',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&h=400&fit=crop',
    link: '/category/dairy-breakfast',
    bgColor: '#3b82f6',
    priority: 8,
    isActive: true,
    type: 'category'
  },
  {
    title: 'Free Delivery',
    subtitle: 'On orders above Rs 199',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    bgColor: '#f59e0b',
    priority: 7,
    isActive: true,
    type: 'promotional'
  },
  {
    title: 'Snacks Festival',
    subtitle: 'Up to 30% OFF on Snacks',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=400&fit=crop',
    link: '/category/snacks-beverages',
    bgColor: '#ef4444',
    priority: 6,
    isActive: true,
    type: 'offer'
  },
  {
    title: 'Baby Care Specials',
    subtitle: 'Trusted brands for your little one',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=400&fit=crop',
    link: '/category/baby-care',
    bgColor: '#ec4899',
    priority: 5,
    isActive: true,
    type: 'category'
  }
];

// Shelves (Homepage product sections)
const shelves = [
  {
    title: 'Best Sellers',
    subtitle: 'Most loved by our customers',
    type: 'featured',
    tags: ['daily-essentials'],
    priority: 10,
    isActive: true,
    maxProducts: 20,
    layout: 'carousel'
  },
  {
    title: 'Fresh Fruits & Vegetables',
    subtitle: 'Farm fresh produce',
    type: 'category',
    categorySlug: 'fruits-vegetables',
    priority: 9,
    isActive: true,
    maxProducts: 15,
    layout: 'carousel'
  },
  {
    title: 'Dairy & Breakfast',
    subtitle: 'Start your day right',
    type: 'category',
    categorySlug: 'dairy-breakfast',
    priority: 8,
    isActive: true,
    maxProducts: 15,
    layout: 'carousel'
  },
  {
    title: 'Snacks & Munchies',
    subtitle: 'For your cravings',
    type: 'category',
    categorySlug: 'snacks-beverages',
    priority: 7,
    isActive: true,
    maxProducts: 15,
    layout: 'carousel'
  },
  {
    title: 'Kitchen Staples',
    subtitle: 'Everyday cooking essentials',
    type: 'category',
    categorySlug: 'staples',
    priority: 6,
    isActive: true,
    maxProducts: 12,
    layout: 'carousel'
  },
  {
    title: 'Instant & Ready to Eat',
    subtitle: 'Quick meals in minutes',
    type: 'category',
    categorySlug: 'instant-frozen',
    priority: 5,
    isActive: true,
    maxProducts: 10,
    layout: 'carousel'
  },
  {
    title: 'Personal Care',
    subtitle: 'Stay fresh and clean',
    type: 'category',
    categorySlug: 'personal-care',
    priority: 4,
    isActive: true,
    maxProducts: 10,
    layout: 'carousel'
  },
  {
    title: 'Home Essentials',
    subtitle: 'Keep your home sparkling',
    type: 'category',
    categorySlug: 'home-kitchen',
    priority: 3,
    isActive: true,
    maxProducts: 10,
    layout: 'carousel'
  }
];

// Analytics events (100 events)
const analyticsEvents = Array.from({ length: 100 }, (_, i) => {
  const eventTypes = ['page_view', 'product_view', 'add_to_cart', 'purchase', 'search'];
  const eventType = eventTypes[i % eventTypes.length];

  return {
    eventType,
    sessionId: `session_${Math.floor(i / 5)}`,
    metadata: eventType === 'search' ? { query: ['milk', 'bread', 'fruits', 'snacks', 'rice'][i % 5] } : {},
    timestamp: new Date(Date.now() - 1000 * 60 * (100 - i)),
    device: ['mobile', 'desktop', 'mobile', 'mobile', 'tablet'][i % 5],
    platform: 'web'
  };
});

module.exports = {
  admin,
  categories,
  products,
  users,
  locations,
  partners,
  orders,
  banners,
  shelves,
  analyticsEvents
};
