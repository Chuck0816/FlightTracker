import mysql from 'mysql2/promise';

const globalForPool = global as unknown as {
  pool: mysql.Pool | null;
};

function createPool(): mysql.Pool {
  const socketPath = process.env.DB_SOCKET;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;

  if (
    !process.env.DB_USER ||
    !process.env.DB_PASSWORD ||
    !process.env.DB_NAME ||
    (!socketPath && (!host || !port))
  ) {
    throw new Error("Missing database configuration");
  }

  return mysql.createPool({
    ...(socketPath
      ? { socketPath }
      : {
          host,
          port: parseInt(port!, 10),
        }),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

const pool = new Proxy({} as mysql.Pool, {
  get(_target, prop, receiver) {
    const instance = globalForPool.pool ?? (globalForPool.pool = createPool());
    return Reflect.get(instance, prop, instance);
  },
});

export default pool;