import { DbStorage } from "../server/storage";

const storage = new DbStorage();

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const products = await storage.getLowStockProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low stock products" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
