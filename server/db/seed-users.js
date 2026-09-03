// Seeds the admin account + 8 crew member accounts with properly bcrypt-hashed
// passwords. Run this with `node db/seed-users.js` from the server/ folder,
// AFTER `npm install` (it needs bcryptjs and pg, both server dependencies).
//
// Everyone gets a default password so they can log in for the first time —
// tell them to change it from their dashboard afterwards.

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from '../src/db.js';

dotenv.config();

const ADMIN_PASSWORD = 'Ultraboyz2026!';
const MEMBER_PASSWORD = 'Welcome123!';

const admin = {
  name: 'Crew Admin', email: 'admin@ultraboyz.club', role: 'admin',
  alias: 'Race Director', crew_number: 0, photo_url: 'https://picsum.photos/seed/admin/400/400',
  pace_min_per_km: 5.30, longest_run_km: 42.0, personal_record: 'Keeper of the roster',
  bio: 'Runs the spreadsheet as hard as the trails.', rarity: 'gold',
};

const members = [
  { name: 'Jerwin Maguyon', email: 'jerwin.maguyon@ultraboyz.club', alias: 'The Odometer', crew_number: 1, photo_url: 'https://picsum.photos/seed/jerwin/400/400', pace_min_per_km: 6.10, longest_run_km: 42.00, personal_record: '42K PR: 4:58:20', bio: 'Logs every kilometer like it owes him money. Nobody has seen his training log end early.', rarity: 'gold' },
  { name: 'Wendeil Maliwat', email: 'wendeil.maliwat@ultraboyz.club', alias: 'Horizon Chaser', crew_number: 2, photo_url: 'https://picsum.photos/seed/wendeil/400/400', pace_min_per_km: 5.45, longest_run_km: 50.00, personal_record: '50K PR: 5:12:40', bio: 'Picks races by how far the map goes, not how fast the leaderboard moves.', rarity: 'legendary' },
  { name: 'Jun Marie Hupguidan', email: 'junmarie.hupguidan@ultraboyz.club', alias: 'Sunrise Closer', crew_number: 3, photo_url: 'https://picsum.photos/seed/junmarie/400/400', pace_min_per_km: 6.00, longest_run_km: 30.00, personal_record: '30K PR: 3:04:10', bio: 'Always finishes as the sun comes up. Has never once seen the start line in daylight.', rarity: 'silver' },
  { name: 'Edwin Paradina', email: 'edwin.paradina@ultraboyz.club', alias: 'The Anchor', crew_number: 4, photo_url: 'https://picsum.photos/seed/edwin/400/400', pace_min_per_km: 6.30, longest_run_km: 25.00, personal_record: 'Longest streak: 96 weeks', bio: 'Shows up every Saturday, rain or heat index. The crew sets their watch by him.', rarity: 'bronze' },
  { name: 'Abraham Barrera', email: 'abraham.barrera@ultraboyz.club', alias: 'Marathon Monk', crew_number: 5, photo_url: 'https://picsum.photos/seed/abraham/400/400', pace_min_per_km: 5.55, longest_run_km: 42.00, personal_record: '42K PR: 3:41:15', bio: 'Trains in total silence, no music, no chat. Says the distance does the talking.', rarity: 'gold' },
  { name: 'Chris Paulo Moneva', email: 'chrispaulo.moneva@ultraboyz.club', alias: 'Cruise Control', crew_number: 6, photo_url: 'https://picsum.photos/seed/chrispaulo/400/400', pace_min_per_km: 5.20, longest_run_km: 60.00, personal_record: '60K PR: 6:20:55', bio: 'Same pace at kilometer 2 and kilometer 55. Nobody has figured out how.', rarity: 'legendary' },
  { name: 'Chiervine Castañeda', email: 'chiervine.castaneda@ultraboyz.club', alias: 'The Quiet Engine', crew_number: 7, photo_url: 'https://picsum.photos/seed/chiervine/400/400', pace_min_per_km: 6.15, longest_run_km: 21.00, personal_record: '21K PR: 1:52:30', bio: 'Newest to the ultra distances, but already outlasting members with twice the mileage.', rarity: 'bronze' },
  { name: 'Dan Doria', email: 'dan.doria@ultraboyz.club', alias: 'Last Mile Dan', crew_number: 8, photo_url: 'https://picsum.photos/seed/dandoria/400/400', pace_min_per_km: 5.50, longest_run_km: 50.00, personal_record: '50K PR: 5:02:18', bio: 'Runs the final kilometer of every race like it is the first. Crew calls it the Dan Kick.', rarity: 'gold' },
];

async function upsert(user, password, role) {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, alias, crew_number, photo_url, pace_min_per_km, longest_run_km, personal_record, bio, rarity)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (email) DO NOTHING`,
    [user.name, user.email, hash, role, user.alias, user.crew_number, user.photo_url,
     user.pace_min_per_km, user.longest_run_km, user.personal_record, user.bio, user.rarity]
  );
  console.log(`✓ ${user.email} (${role})`);
}

async function run() {
  await upsert(admin, ADMIN_PASSWORD, 'admin');
  for (const m of members) {
    await upsert(m, MEMBER_PASSWORD, 'user');
  }
  console.log('\nDone. Default passwords:');
  console.log(`  admin: ${ADMIN_PASSWORD}`);
  console.log(`  every crew member: ${MEMBER_PASSWORD}`);
  console.log('Change these from the dashboard after first login.');
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
