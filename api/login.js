import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Solo POST' });
  
  const { email, password } = req.body;
  
  // Verificamos que la URL esté cargada
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ success: false, message: 'Falta configurar DATABASE_URL en Vercel' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email} AND password_hash = ${password}`;
    
    if (users.length > 0) {
      return res.status(200).json({ success: true, message: 'Login exitoso' });
    } else {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error(error); // Esto aparecerá en los Logs de Vercel
    return res.status(500).json({ success: false, message: 'Error interno de base de datos' });
  }
}