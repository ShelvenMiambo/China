import { DbStorage } from "../../server/storage";

const storage = new DbStorage();

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { quantity } = req.body;
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      const cartItem = await storage.updateCartItemQuantity(id, quantity);
      res.status(200).json(cartItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
