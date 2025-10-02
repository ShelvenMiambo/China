import { DbStorage } from "../server/storage";

const storage = new DbStorage();

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const admin = await storage.getAdminUser(email);
      if (!admin || admin.password !== password) { // In production, use proper password hashing
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // In production, use proper JWT or session management
      res.status(200).json({
        success: true,
        admin: { id: admin.id, email: admin.email, name: admin.name }
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
