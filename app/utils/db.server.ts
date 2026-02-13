import postgres from "postgres";

/**
 * PostgreSQL client configured for Neon.
 *
 * The `transform` option converts between JS camelCase and SQL snake_case
 * automatically, so we write `profile.avatarUrl` in TypeScript but the
 * column is stored as `avatar_url` in PostgreSQL.
 */
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  transform: postgres.camel,
});

export { sql };
