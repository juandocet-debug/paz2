require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();
  console.log('Connected');
  const maxRes = await client.query('SELECT MAX(id) as max_id FROM uploads');
  const maxId = maxRes.rows[0].max_id;
  if (maxId) {
    console.log('Max ID:', maxId);
    const del1 = await client.query('DELETE FROM practices WHERE upload_id < $1', [maxId]);
    console.log('Deleted practices:', del1.rowCount);
    const del2 = await client.query('DELETE FROM uploads WHERE id < $1', [maxId]);
    console.log('Deleted uploads:', del2.rowCount);
  } else {
    console.log('No uploads found.');
  }
  await client.end();
}

run().catch(console.error);
