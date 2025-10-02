import { DbStorage } from "../../server/storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

const storage = new DbStorage();

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  } else if (req.method === 'PUT') {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  } else if (req.method === 'PATCH') {
    // Assuming PATCH is for stock update, as per the route /api/products/:id/stock
    try {
      const { stock } = req.body;
      if (typeof stock !== 'number' || stock < 0) {
        return res.status(400).json({ error: "Invalid stock value" });
      }

      const product = await storage.updateProductStock(id, stock);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update stock" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
