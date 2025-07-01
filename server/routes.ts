import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertRestaurantSchema,
  insertCategorySchema,
  insertProductSchema,
  insertTableSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertWaiterCallSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Restaurant routes
  app.get('/api/restaurant', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurant = await storage.getUserRestaurant(userId);
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  app.post('/api/restaurant', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertRestaurantSchema.parse({ ...req.body, userId });
      const restaurant = await storage.createRestaurant(data);
      res.json(restaurant);
    } catch (error) {
      console.error("Error creating restaurant:", error);
      res.status(400).json({ message: "Failed to create restaurant" });
    }
  });

  app.put('/api/restaurant/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurantId = parseInt(req.params.id);
      
      // Verify ownership
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant || restaurant.userId !== userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const data = insertRestaurantSchema.partial().parse(req.body);
      const updatedRestaurant = await storage.updateRestaurant(restaurantId, data);
      res.json(updatedRestaurant);
    } catch (error) {
      console.error("Error updating restaurant:", error);
      res.status(400).json({ message: "Failed to update restaurant" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurant = await storage.getUserRestaurant(userId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const stats = await storage.getDashboardStats(restaurant.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Category routes
  app.get('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurant = await storage.getUserRestaurant(userId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const categories = await storage.getCategories(restaurant.id);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurant = await storage.getUserRestaurant(userId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const data = insertCategorySchema.parse({ ...req.body, restaurantId: restaurant.id });
      const category = await storage.createCategory(data);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurant = await storage.getUserRestaurant(userId);
      const categoryId = parseInt(req.params.id);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(categoryId, data);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(400).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      await storage.deleteCategory(categoryId);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(400).json({ message: "Failed to delete category" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurant = await storage.getUserRestaurant(userId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const products = await storage.getProducts(restaurant.id, categoryId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurant = await storage.getUserRestaurant(userId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Check product limit for free plan
      if (restaurant.plan === 'free') {
        const productCount = await storage.getProductCount(restaurant.id);
        if (productCount >= restaurant.maxProducts) {
          return res.status(400).json({ 
            message: `Product limit reached. Upgrade to Elite plan to add more products.`,
            code: 'PRODUCT_LIMIT_REACHED'
          });
        }
      }

      const data = insertProductSchema.parse({ ...req.body, restaurantId: restaurant.id });
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, data);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      await storage.deleteProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(400).json({ message: "Failed to delete product" });
    }
  });

  // Table routes
  app.get('/api/tables', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurant = await storage.getUserRestaurant(userId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const tables = await storage.getTables(restaurant.id);
      res.json(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });

  app.post('/api/tables', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurant = await storage.getUserRestaurant(userId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const data = insertTableSchema.parse({ ...req.body, restaurantId: restaurant.id });
      const table = await storage.createTable(data);
      res.json(table);
    } catch (error) {
      console.error("Error creating table:", error);
      res.status(400).json({ message: "Failed to create table" });
    }
  });

  // Public menu routes (no auth required)
  app.get('/api/menu/:qrCode', async (req, res) => {
    try {
      const { qrCode } = req.params;
      const table = await storage.getTableByQrCode(qrCode);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }

      const restaurant = await storage.getRestaurant(table.restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const categories = await storage.getCategories(restaurant.id);
      const products = await storage.getProducts(restaurant.id);
      
      res.json({
        restaurant,
        table,
        categories,
        products,
      });
    } catch (error) {
      console.error("Error fetching menu:", error);
      res.status(500).json({ message: "Failed to fetch menu" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurant = await storage.getUserRestaurant(userId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const orders = await storage.getOrders(restaurant.id, limit);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const data = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(orderId, data);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(400).json({ message: "Failed to update order" });
    }
  });

  // Waiter call routes
  app.get('/api/waiter-calls', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurant = await storage.getUserRestaurant(userId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const status = req.query.status as string | undefined;
      const calls = await storage.getWaiterCalls(restaurant.id, status);
      res.json(calls);
    } catch (error) {
      console.error("Error fetching waiter calls:", error);
      res.status(500).json({ message: "Failed to fetch waiter calls" });
    }
  });

  app.post('/api/waiter-calls', async (req, res) => {
    try {
      const data = insertWaiterCallSchema.parse(req.body);
      const call = await storage.createWaiterCall(data);
      res.json(call);
    } catch (error) {
      console.error("Error creating waiter call:", error);
      res.status(400).json({ message: "Failed to create waiter call" });
    }
  });

  app.put('/api/waiter-calls/:id', isAuthenticated, async (req: any, res) => {
    try {
      const callId = parseInt(req.params.id);
      const data = insertWaiterCallSchema.partial().parse(req.body);
      const call = await storage.updateWaiterCall(callId, data);
      res.json(call);
    } catch (error) {
      console.error("Error updating waiter call:", error);
      res.status(400).json({ message: "Failed to update waiter call" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
