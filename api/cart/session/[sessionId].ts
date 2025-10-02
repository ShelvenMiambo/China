import { DbStorage } from "../../../server/storage";

const storage = new DbStorage();

export default async function handler(req: any, res: any) {
  const { sessionId } = req.query;

  if (req.method === 'GET') {
    try {
      const cartItems = await storage.getCartItems(sessionId);
      res.status(200).json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  } else if (req.method === 'DELETE') {
    try {
      await storage.clearCart(sessionId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
