import mysql from 'mysql';

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err.message);
    throw err;
  } else {
    console.log('Connected to MySQL database');

    db.query('SELECT 1', (error, results) => {
      if (error) {
        console.error('Error testing the database connection:', error.message);
      } else {
        console.log('Database connection test successful:', results);
      }
    });
  }
});

export default db;
