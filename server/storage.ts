import {
  users,
  restaurants,
  categories,
  products,
  tables,
  orders,
  orderItems,
  waiterCalls,
  type User,
  type UpsertUser,
  type Restaurant,
  type InsertRestaurant,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Table,
  type InsertTable,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type WaiterCall,
  type InsertWaiterCall,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Restaurant operations
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getUserRestaurant(userId: string): Promise<Restaurant | undefined>;
  updateRestaurant(id: number, updates: Partial<InsertRestaurant>): Promise<Restaurant>;
  
  // Category operations
  getCategories(restaurantId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Product operations
  getProducts(restaurantId: number, categoryId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getProductCount(restaurantId: number): Promise<number>;
  
  // Table operations
  getTables(restaurantId: number): Promise<Table[]>;
  getTable(id: number): Promise<Table | undefined>;
  getTableByQrCode(qrCode: string): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: number, updates: Partial<InsertTable>): Promise<Table>;
  deleteTable(id: number): Promise<void>;
  
  // Order operations
  getOrders(restaurantId: number, limit?: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: number, updates: Partial<InsertOrderItem>): Promise<OrderItem>;
  deleteOrderItem(id: number): Promise<void>;
  
  // Waiter call operations
  getWaiterCalls(restaurantId: number, status?: string): Promise<WaiterCall[]>;
  createWaiterCall(call: InsertWaiterCall): Promise<WaiterCall>;
  updateWaiterCall(id: number, updates: Partial<InsertWaiterCall>): Promise<WaiterCall>;
  
  // Dashboard stats
  getDashboardStats(restaurantId: number): Promise<{
    totalProducts: number;
    activeTables: number;
    todayOrders: number;
    pendingWaiterCalls: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Restaurant operations
  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db
      .insert(restaurants)
      .values(restaurant)
      .returning();
    return newRestaurant;
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id));
    return restaurant;
  }

  async getUserRestaurant(userId: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.userId, userId));
    return restaurant;
  }

  async updateRestaurant(id: number, updates: Partial<InsertRestaurant>): Promise<Restaurant> {
    const [restaurant] = await db
      .update(restaurants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(restaurants.id, id))
      .returning();
    return restaurant;
  }

  // Category operations
  async getCategories(restaurantId: number): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(and(eq(categories.restaurantId, restaurantId), eq(categories.isActive, true)))
      .orderBy(categories.sortOrder, categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Product operations
  async getProducts(restaurantId: number, categoryId?: number): Promise<Product[]> {
    const conditions = [eq(products.restaurantId, restaurantId)];
    
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    return await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(products.sortOrder, products.name);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getProductCount(restaurantId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.restaurantId, restaurantId));
    return result.count;
  }

  // Table operations
  async getTables(restaurantId: number): Promise<Table[]> {
    return await db
      .select()
      .from(tables)
      .where(and(eq(tables.restaurantId, restaurantId), eq(tables.isActive, true)))
      .orderBy(tables.name);
  }

  async getTable(id: number): Promise<Table | undefined> {
    const [table] = await db
      .select()
      .from(tables)
      .where(eq(tables.id, id));
    return table;
  }

  async getTableByQrCode(qrCode: string): Promise<Table | undefined> {
    const [table] = await db
      .select()
      .from(tables)
      .where(eq(tables.qrCode, qrCode));
    return table;
  }

  async createTable(table: InsertTable): Promise<Table> {
    const qrCode = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [newTable] = await db
      .insert(tables)
      .values({ ...table, qrCode })
      .returning();
    return newTable;
  }

  async updateTable(id: number, updates: Partial<InsertTable>): Promise<Table> {
    const [table] = await db
      .update(tables)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tables.id, id))
      .returning();
    return table;
  }

  async deleteTable(id: number): Promise<void> {
    await db.delete(tables).where(eq(tables.id, id));
  }

  // Order operations
  async getOrders(restaurantId: number, limit = 50): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.restaurantId, restaurantId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return newOrderItem;
  }

  async updateOrderItem(id: number, updates: Partial<InsertOrderItem>): Promise<OrderItem> {
    const [orderItem] = await db
      .update(orderItems)
      .set(updates)
      .where(eq(orderItems.id, id))
      .returning();
    return orderItem;
  }

  async deleteOrderItem(id: number): Promise<void> {
    await db.delete(orderItems).where(eq(orderItems.id, id));
  }

  // Waiter call operations
  async getWaiterCalls(restaurantId: number, status?: string): Promise<WaiterCall[]> {
    const conditions = [eq(waiterCalls.restaurantId, restaurantId)];
    
    if (status) {
      conditions.push(eq(waiterCalls.status, status));
    }

    return await db
      .select()
      .from(waiterCalls)
      .where(and(...conditions))
      .orderBy(desc(waiterCalls.createdAt));
  }

  async createWaiterCall(call: InsertWaiterCall): Promise<WaiterCall> {
    const [newCall] = await db
      .insert(waiterCalls)
      .values(call)
      .returning();
    return newCall;
  }

  async updateWaiterCall(id: number, updates: Partial<InsertWaiterCall>): Promise<WaiterCall> {
    const [call] = await db
      .update(waiterCalls)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(waiterCalls.id, id))
      .returning();
    return call;
  }

  // Dashboard stats
  async getDashboardStats(restaurantId: number): Promise<{
    totalProducts: number;
    activeTables: number;
    todayOrders: number;
    pendingWaiterCalls: number;
  }> {
    const [productCount] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.restaurantId, restaurantId));

    const [tableCount] = await db
      .select({ count: count() })
      .from(tables)
      .where(and(eq(tables.restaurantId, restaurantId), eq(tables.isActive, true)));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [todayOrderCount] = await db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          eq(orders.createdAt, today)
        )
      );

    const [waiterCallCount] = await db
      .select({ count: count() })
      .from(waiterCalls)
      .where(
        and(
          eq(waiterCalls.restaurantId, restaurantId),
          eq(waiterCalls.status, "pending")
        )
      );

    return {
      totalProducts: productCount.count,
      activeTables: tableCount.count,
      todayOrders: todayOrderCount.count,
      pendingWaiterCalls: waiterCallCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
