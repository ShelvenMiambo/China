import { DbStorage } from "../../server/storage";

const storage = new DbStorage();

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const report = await storage.getSalesReport();

      // Generate CSV content
      const csvHeader = "Order ID,Customer Name,Email,Phone,Total MZN,Total USD,Date,Status\n";
      const csvRows = report.orders.map((order: any) =>
        `${order.id},"${order.customer_name}","${order.customer_email}","${order.customer_phone}",${order.total_mzn},${order.total_usd},"${order.created_at}","${order.status}"`
      ).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sales_report.csv');
      res.status(200).send(csvContent);
    } catch (error) {
      res.status(500).json({ error: "Failed to export sales report" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
