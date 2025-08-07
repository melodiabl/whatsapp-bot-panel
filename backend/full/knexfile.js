import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: join(__dirname, 'storage', 'database.sqlite')
    },
    migrations: {
      directory: join(__dirname, 'migrations'),
      loadExtensions: ['.js', '.cjs']
    },
    useNullAsDefault: true
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: join(__dirname, 'migrations'),
      loadExtensions: ['.js', '.cjs']
    },
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};
