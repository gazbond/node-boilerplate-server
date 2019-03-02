module.exports = {
  development: {
    client: "postgresql",
    connection: {
      host: "postgres",
      database: "node_app",
      user: "postgres",
      password: "postgres"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },
  testing: {
    client: "postgresql",
    connection: {
      host: "postgres",
      database: "node_app_test",
      user: "postgres",
      password: "postgres"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};
