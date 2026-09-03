-- Ultraboyz Run Crew — database schema

DROP TABLE IF EXISTS event_photos;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- Every account IS a crew member. role decides admin vs regular user.
CREATE TABLE users (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  email            VARCHAR(150) UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,
  role             VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),

  alias            VARCHAR(100),
  crew_number      INT UNIQUE,
  photo_url        TEXT,
  pace_min_per_km  NUMERIC(4,2),
  longest_run_km   NUMERIC(6,2),
  personal_record  VARCHAR(150),
  bio              TEXT,
  rarity           VARCHAR(20) NOT NULL DEFAULT 'bronze'
                     CHECK (rarity IN ('bronze','silver','gold','legendary')),

  created_at       TIMESTAMP DEFAULT now()
);

CREATE TABLE events (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(150) NOT NULL,
  event_date       DATE NOT NULL,
  distance         VARCHAR(50) NOT NULL,
  location         VARCHAR(150),
  notes            TEXT,
  status           VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                     CHECK (status IN ('upcoming','recent')),
  cover_photo_url  TEXT
);

CREATE TABLE event_photos (
  id          SERIAL PRIMARY KEY,
  event_id    INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  photo_url   TEXT NOT NULL,
  caption     VARCHAR(150),
  added_by    INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_rarity ON users(rarity);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_event_photos_event ON event_photos(event_id);
