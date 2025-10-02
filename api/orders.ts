import { DbStorage } from "../server/storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";

const storage = new DbStorage();

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const orders = await storage.getOrders();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  } else if (req.method === 'POST') {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);

      // Update stock for ordered items
      for (const item of validatedData.items) {
        const product = await storage.getProduct(item.product_id);
        if (product) {
          await storage.updateProductStock(item.product_id, product.stock - item.quantity);
        }
      }

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
