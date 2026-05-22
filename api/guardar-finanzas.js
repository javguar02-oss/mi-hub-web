import { neon } from '@neondatabase/serverless';

// Conectamos con la base de datos usando la variable segura de Vercel
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Solo permitimos guardar mediante POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  try {
    const { tipo, monto, concepto } = req.body;

    if (!monto || !concepto) {
      return res.status(400).json({ success: false, error: 'Faltan datos obligatorios' });
    }

    // 1. Crear la tabla de finanzas de forma segura si es la primera vez que se usa
    await sql`
      CREATE TABLE IF NOT EXISTS finanzas_hub (
        id SERIAL PRIMARY KEY,
        tipo TEXT NOT NULL,
        monto NUMERIC(10, 2) NOT NULL,
        concepto TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Insertar el movimiento que el usuario cargó en la pantalla
    await sql`
      INSERT INTO finanzas_hub (tipo, monto, concepto)
      VALUES (${tipo}, ${monto}, ${concepto});
    `;

    // Devolvemos el éxito al panel visual
    return res.status(200).json({ success: true, message: 'Movimiento guardado en la nube con éxito' });

  } catch (error) {
    console.error('Error en la base de datos Neon:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al conectar con la base de datos. Verifica tu DATABASE_URL en Vercel.' 
    });
  }
}