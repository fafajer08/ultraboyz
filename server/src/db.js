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

const required = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];
const missing = required.filter(key => process.env[key] === undefined);

if (missing.length > 0) {
  console.error(
    `\nMissing env var(s): ${missing.join(', ')}\n` +
    `Postgres will reject the connection with a confusing SASL error if these aren't set.\n` +
    `Fix: copy server/.env.example to server/.env and fill in real values, then re-run.\n`
  );
  process.exit(1);
}

export const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: String(process.env.PGPASSWORD), // pg's SASL step rejects anything that isn't a string
});
