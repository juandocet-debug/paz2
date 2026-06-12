const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
  });

  try {
    await client.connect();
    console.log('Conectado a PostgreSQL local (bd postgres).');
    
    // Verificar si la db ya existe
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'proyecto_paz'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE proyecto_paz');
      console.log('✅ Base de datos "proyecto_paz" creada exitosamente.');
    } else {
      console.log('⚠ La base de datos "proyecto_paz" ya existe.');
    }
  } catch (err) {
    console.error('❌ Error al crear la base de datos:', err.message);
  } finally {
    await client.end();
  }
}

createDb();
