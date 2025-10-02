import { DbStorage } from "../server/storage";

const storage = new DbStorage();

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const report = await storage.getSalesReport(start, end);
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate sales report" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
