import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, types } = pg;

// Without this, pg parses DATE columns into JS Date objects, which then
// serialize to full ISO timestamps like "2026-10-17T00:00:00.000Z" in JSON
// responses. The frontend expects a plain "2026-10-17" string and appends
// its own time, so a full timestamp there produces "Invalid Date". OID 1082
// is Postgres's `date` type — this keeps it as the raw string from the wire.
types.setTypeParser(1082, val => val);

let poolConfig;

if (process.env.DATABASE_URL) {
  // Hosted providers (Neon, Supabase, Render, Railway) give you a single
  // connection string instead of separate PGHOST/PGUSER/etc vars. Most of
  // them also require SSL and use a certificate pg doesn't recognize by
  // default, hence rejectUnauthorized: false — fine for these managed
  // providers, since the connection itself is still encrypted.
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
  };
} else {
  const required = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];
  const missing = required.filter(key => process.env[key] === undefined);

  if (missing.length > 0) {
    console.error(
      `\nMissing env var(s): ${missing.join(', ')}\n` +
      `Set these individually for local dev, or set DATABASE_URL instead for a hosted database.\n` +
      `Fix: copy server/.env.example to server/.env and fill in real values, then re-run.\n`
    );
    process.exit(1);
  }

  poolConfig = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: String(process.env.PGPASSWORD), // pg's SASL step rejects anything that isn't a string
  };
}

export const pool = new Pool(poolConfig);
