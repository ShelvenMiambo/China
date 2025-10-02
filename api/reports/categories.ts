import { DbStorage } from "../server/storage";

const storage = new DbStorage();

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const report = await storage.getCategoryPerformance();
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate category report" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
