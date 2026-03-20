const db = require('./src/compartido/infraestructura/BaseDeDatos');

try {
  db.prepare('ALTER TABLE uploads ADD COLUMN publicado INTEGER DEFAULT 0;').run();
  console.log('Columna publicado añadida con éxito.');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('La columna ya existe.');
  } else {
    console.error('Error:', error.message);
  }
}
