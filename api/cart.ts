import { DbStorage } from "../server/storage";
import { insertCartItemSchema } from "@shared/schema";
import { z } from "zod";

const storage = new DbStorage();

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid cart data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add to cart" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
