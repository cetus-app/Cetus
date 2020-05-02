module.exports = {
  type: "postgres",
  host: process.env.dbHost || "localhost",
  port: process.env.dbPort || 5432,
  username: process.env.dbUsername,
  password: process.env.dbPassword,
  database: process.env.db,
  // If it's development or dbSync is set
  synchronize: process.env.NODE_ENV === "development" || !!process.env.dbSync,
  logging: false,
  // JS because thats the file extension when they're compiled.
  entities: [
    `src/db/entity/*.entity.js`
  ],
  migrations: [
    "src/db/migration/*.js"
  ],
  subscribers: [
    "src/db/subscriber/*.js"
  ]
};
