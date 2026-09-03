-- Ultraboyz Run Crew — event seed data (safe to run with plain SQL, no passwords involved)

INSERT INTO events (title, event_date, distance, location, notes, status, cover_photo_url) VALUES
('Sierra Ridge 100K',  '2026-10-17', '100K', 'Sierra Nevada, CA',   'Wendeil and Chris Paulo are running it. Aid crew needed at km 60.', 'upcoming', 'https://picsum.photos/seed/sierraridge/800/500'),
('Night Trail 50',     '2026-11-08', '50 miles', 'Angeles National Forest', 'Headlamps mandatory. Dan is defending last year''s crew record.', 'upcoming', 'https://picsum.photos/seed/nighttrail/800/500'),
('Riverbend Ultra',    '2026-07-12', '50K', 'Riverside County',    'Good first-ultra course. Flat, well-stocked aid stations.', 'recent', 'https://picsum.photos/seed/riverbend/800/500'),
('Coastal Loop 42K',   '2026-05-03', '42K', 'Batangas Coastline',  'Full crew turnout. Jerwin set a new PR here.', 'recent', 'https://picsum.photos/seed/coastalloop/800/500');

INSERT INTO event_photos (event_id, photo_url, caption) VALUES
(3, 'https://picsum.photos/seed/riverbend1/700/500', 'Start line, sunrise'),
(3, 'https://picsum.photos/seed/riverbend2/700/500', 'Km 25 aid station'),
(3, 'https://picsum.photos/seed/riverbend3/700/500', 'Finish line group photo'),
(4, 'https://picsum.photos/seed/coastal1/700/500', 'Coastal trail, first light'),
(4, 'https://picsum.photos/seed/coastal2/700/500', 'Jerwin''s PR finish'),
(4, 'https://picsum.photos/seed/coastal3/700/500', 'Post-race pancakes'),
(4, 'https://picsum.photos/seed/coastal4/700/500', 'Full crew, medals on');
