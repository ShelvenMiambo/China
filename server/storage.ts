import { type Product, type InsertProduct, type Order, type InsertOrder, type CartItem, type InsertCartItem, type AdminUser, type InsertAdminUser, type OrderItem } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, like, sql, and, gte, lte, lt } from "drizzle-orm";
import { products, orders, cart_items, admin_users } from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  updateProductStock(id: string, stock: number): Promise<Product | undefined>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Cart
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;

  // Admin
  getAdminUser(email: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;

  // Reports
  getSalesReport(startDate?: Date, endDate?: Date): Promise<any>;
  getCategoryPerformance(): Promise<any>;
  getLowStockProducts(): Promise<Product[]>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private cartItems: Map<string, CartItem>;
  private adminUsers: Map<string, AdminUser>;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.cartItems = new Map();
    this.adminUsers = new Map();
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Add default admin user
    const adminId = randomUUID();
    const adminUser: AdminUser = {
      id: adminId,
      email: "admin@maputoimporthub.mz",
      password: "admin123", // In production, this should be hashed
      name: "Admin",
      created_at: new Date(),
    };
    this.adminUsers.set(adminUser.email, adminUser);

    // Add sample products
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        name: "Tijolo Cerâmico 20x20cm",
        description: "Tijolo cerâmico de alta qualidade, dimensões 20x20cm, ideal para construção residencial e comercial. Importado diretamente da China, oferece excelente resistência e durabilidade.",
        category: "Construção",
        price_mzn: 25,
        price_usd: "0.39",
        stock: 5000,
        images: ["https://images.unsplash.com/photo-1590642916589-592bca10dfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        specifications: {
          "Dimensões": "20x20x10cm",
          "Material": "Cerâmica vermelha",
          "Resistência": "Alta",
          "Origem": "China",
          "Garantia": "12 meses"
        },
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: randomUUID(),
        name: "Janela Alumínio 120x120cm",
        description: "Janela de alumínio com vidro temperado, acabamento branco, sistema de abertura correr. Perfeita para residências e escritórios.",
        category: "Construção",
        price_mzn: 1600,
        price_usd: "25.00",
        stock: 100,
        images: ["https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        specifications: {
          "Dimensões": "120x120cm",
          "Material": "Alumínio + Vidro",
          "Cor": "Branco",
          "Abertura": "Correr",
          "Garantia": "24 meses"
        },
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: randomUUID(),
        name: "Smartphone Android 64GB",
        description: "Smartphone com tela 6.5\", 4GB RAM, câmera dupla 13MP, bateria 4000mAh. Sistema Android atualizado.",
        category: "Eletrônicos",
        price_mzn: 5000,
        price_usd: "78.13",
        stock: 50,
        images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        specifications: {
          "Tela": "6.5 polegadas",
          "RAM": "4GB",
          "Armazenamento": "64GB",
          "Câmera": "13MP dupla",
          "Bateria": "4000mAh"
        },
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: randomUUID(),
        name: "Cimento Portland 50kg",
        description: "Cimento Portland CP-II 50kg, ideal para concreto e argamassa de alta resistência. Qualidade garantida.",
        category: "Construção",
        price_mzn: 800,
        price_usd: "12.50",
        stock: 15,
        images: ["https://images.unsplash.com/photo-1605732562742-3023a888e56e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        specifications: {
          "Peso": "50kg",
          "Tipo": "CP-II",
          "Uso": "Concreto e argamassa",
          "Origem": "China"
        },
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      id,
      name: insertProduct.name,
      description: insertProduct.description,
      category: insertProduct.category,
      price_mzn: insertProduct.price_mzn,
      price_usd: insertProduct.price_usd,
      stock: insertProduct.stock,
      status: insertProduct.status || "active",
      images: insertProduct.images ? [...insertProduct.images] : null,
      specifications: insertProduct.specifications ? {...insertProduct.specifications} : null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;

    const updated: Product = {
      id: existing.id,
      name: updateData.name ?? existing.name,
      description: updateData.description ?? existing.description,
      category: updateData.category ?? existing.category,
      price_mzn: updateData.price_mzn ?? existing.price_mzn,
      price_usd: updateData.price_usd ?? existing.price_usd,
      stock: updateData.stock ?? existing.stock,
      status: updateData.status ?? existing.status,
      images: updateData.images ? [...updateData.images] : existing.images,
      specifications: updateData.specifications ? {...updateData.specifications} : existing.specifications,
      created_at: existing.created_at,
      updated_at: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async updateProductStock(id: string, stock: number): Promise<Product | undefined> {
    return this.updateProduct(id, { stock });
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      id,
      customer_name: insertOrder.customer_name,
      customer_email: insertOrder.customer_email,
      customer_phone: insertOrder.customer_phone,
      customer_company: insertOrder.customer_company || null,
      delivery_address: insertOrder.delivery_address,
      delivery_city: insertOrder.delivery_city,
      delivery_postal_code: insertOrder.delivery_postal_code || null,
      delivery_option: insertOrder.delivery_option,
      payment_method: insertOrder.payment_method,
      items: [...insertOrder.items],
      total_mzn: insertOrder.total_mzn,
      total_usd: insertOrder.total_usd,
      notes: insertOrder.notes || null,
      status: "pending",
      created_at: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;

    const updated: Order = {
      ...existing,
      status,
    };
    this.orders.set(id, updated);
    return updated;
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const cartItems = Array.from(this.cartItems.values()).filter(item => item.session_id === sessionId);
    const result = [];
    
    for (const item of cartItems) {
      const product = this.products.get(item.product_id);
      if (product) {
        result.push({ ...item, product });
      }
    }
    
    return result;
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItems = Array.from(this.cartItems.values()).filter(
      item => item.session_id === insertCartItem.session_id && item.product_id === insertCartItem.product_id
    );

    if (existingItems.length > 0) {
      // Update quantity of existing item
      const existingItem = existingItems[0];
      const updated: CartItem = {
        ...existingItem,
        quantity: existingItem.quantity + insertCartItem.quantity,
      };
      this.cartItems.set(existingItem.id, updated);
      return updated;
    } else {
      // Create new cart item
      const id = randomUUID();
      const cartItem: CartItem = {
        ...insertCartItem,
        id,
        created_at: new Date(),
      };
      this.cartItems.set(id, cartItem);
      return cartItem;
    }
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const existing = this.cartItems.get(id);
    if (!existing) return undefined;

    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }

    const updated: CartItem = {
      ...existing,
      quantity,
    };
    this.cartItems.set(id, updated);
    return updated;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const cartItems = Array.from(this.cartItems.values()).filter(item => item.session_id === sessionId);
    cartItems.forEach(item => this.cartItems.delete(item.id));
    return true;
  }

  async getAdminUser(email: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(email);
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const user: AdminUser = {
      ...insertUser,
      id,
      created_at: new Date(),
    };
    this.adminUsers.set(user.email, user);
    return user;
  }

  async getSalesReport(startDate?: Date, endDate?: Date): Promise<any> {
    const orders = Array.from(this.orders.values());
    const filteredOrders = orders.filter(order => {
      if (!order.created_at) return false;
      if (startDate && order.created_at < startDate) return false;
      if (endDate && order.created_at > endDate) return false;
      return true;
    });

    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total_mzn, 0);
    const productsSold = filteredOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    return {
      total_sales_mzn: totalSales,
      total_sales_usd: (totalSales / 64).toFixed(2),
      total_orders: filteredOrders.length,
      products_sold: productsSold,
      orders: filteredOrders,
    };
  }

  async getCategoryPerformance(): Promise<any> {
    const orders = Array.from(this.orders.values());
    const categoryStats = new Map<string, { sales: number; quantity: number }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const product = this.products.get(item.product_id);
        if (product) {
          const existing = categoryStats.get(product.category) || { sales: 0, quantity: 0 };
          categoryStats.set(product.category, {
            sales: existing.sales + item.total_mzn,
            quantity: existing.quantity + item.quantity,
          });
        }
      });
    });

    return Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      sales_mzn: stats.sales,
      sales_usd: (stats.sales / 64).toFixed(2),
      quantity_sold: stats.quantity,
    }));
  }

  async getLowStockProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.stock < 50);
  }
}

export class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql, { schema: { products, orders, cart_items, admin_users } });
  }

  async getProducts(): Promise<Product[]> {
    return await this.db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await this.db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await this.db.select().from(products).where(eq(products.category, category));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = `%${query}%`;
    return await this.db.select().from(products).where(
      sql`${products.name} ILIKE ${searchTerm} OR ${products.description} ILIKE ${searchTerm} OR ${products.category} ILIKE ${searchTerm}`
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await this.db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await this.db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async updateProductStock(id: string, stock: number): Promise<Product | undefined> {
    return await this.updateProduct(id, { stock });
  }

  async getOrders(): Promise<Order[]> {
    return await this.db.select().from(orders);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await this.db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await this.db.insert(orders).values(insertOrder).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await this.db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const result = await this.db
      .select({
        id: cart_items.id,
        session_id: cart_items.session_id,
        product_id: cart_items.product_id,
        quantity: cart_items.quantity,
        created_at: cart_items.created_at,
        product: products,
      })
      .from(cart_items)
      .innerJoin(products, eq(cart_items.product_id, products.id))
      .where(eq(cart_items.session_id, sessionId));
    return result;
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existing = await this.db
      .select()
      .from(cart_items)
      .where(and(eq(cart_items.session_id, insertCartItem.session_id), eq(cart_items.product_id, insertCartItem.product_id)));

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + insertCartItem.quantity;
      const result = await this.db
        .update(cart_items)
        .set({ quantity: newQuantity })
        .where(eq(cart_items.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      // Insert new
      const result = await this.db.insert(cart_items).values(insertCartItem).returning();
      return result[0];
    }
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await this.db.delete(cart_items).where(eq(cart_items.id, id));
      return undefined;
    }
    const result = await this.db.update(cart_items).set({ quantity }).where(eq(cart_items.id, id)).returning();
    return result[0];
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await this.db.delete(cart_items).where(eq(cart_items.id, id));
    return result.rowCount > 0;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    await this.db.delete(cart_items).where(eq(cart_items.session_id, sessionId));
    return true;
  }

  async getAdminUser(email: string): Promise<AdminUser | undefined> {
    const result = await this.db.select().from(admin_users).where(eq(admin_users.email, email));
    return result[0];
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const result = await this.db.insert(admin_users).values(insertUser).returning();
    return result[0];
  }

  async getSalesReport(startDate?: Date, endDate?: Date): Promise<any> {
    let whereClause = sql`true`;
    if (startDate) whereClause = and(whereClause, gte(orders.created_at, startDate));
    if (endDate) whereClause = and(whereClause, lte(orders.created_at, endDate));

    const result = await this.db
      .select({
        total_sales_mzn: sql<number>`sum(${orders.total_mzn})`,
        total_sales_usd: sql<number>`sum(${orders.total_usd})`,
        total_orders: sql<number>`count(*)`,
        products_sold: sql<number>`sum(jsonb_array_length(${orders.items}))`,
        orders: sql<Order[]>`array_agg(${orders})`,
      })
      .from(orders)
      .where(whereClause);

    return result[0];
  }

  async getCategoryPerformance(): Promise<any> {
    // This is complex, need to aggregate from orders.items
    // For simplicity, return empty for now - can be implemented later
    return [];
  }

  async getLowStockProducts(): Promise<Product[]> {
    return await this.db.select().from(products).where(lt(products.stock, 50));
  }
}

export const storage = new MemStorage();
