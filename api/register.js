import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Solo POST' });
  const { email, password } = req.body;
  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`INSERT INTO users (email, password_hash, role) VALUES (${email}, ${password}, 'cliente')`;
    return res.status(200).json({ success: true, message: 'Usuario creado' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al registrar' });
  }
}