import { DbStorage } from "../server/storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

const storage = new DbStorage();

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { category, search } = req.query;

      let products;
      if (category && typeof category === 'string') {
        products = await storage.getProductsByCategory(category);
      } else if (search && typeof search === 'string') {
        products = await storage.searchProducts(search);
      } else {
        products = await storage.getProducts();
      }

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  } else if (req.method === 'POST') {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
