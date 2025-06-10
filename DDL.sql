ROLLBACK;

DROP SCHEMA IF EXISTS "amanzi-warden" CASCADE;

CREATE SCHEMA IF NOT EXISTS "amanzi-warden";
SET search_path TO "amanzi-warden";

DROP TABLE IF EXISTS node CASCADE;
DROP TABLE IF EXISTS nodeLog CASCADE;
DROP TABLE IF EXISTS alertLog CASCADE;
DROP TABLE IF EXISTS nodeAdjacency CASCADE;
DROP TABLE IF EXISTS announcementLog CASCADE;
DROP TABLE IF EXISTS announcementPresets CASCADE;

-- Node tables
CREATE TABLE IF NOT EXISTS node (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS nodeLog (
    nodeID INT REFERENCES node(id),
    timestamp TIMESTAMP NOT NULL,
    flowRate REAL NOT NULL,
    pressure REAL NOT NULL,
    battery REAL NOT NULL,
    temperature REAL,
    turbidity REAL,
    totalDissolvedSolids REAL,
    PRIMARY KEY(nodeID, timestamp)
);

-- Adjacency table
CREATE TABLE IF NOT EXISTS nodeAdjacency (
	mainNodeID INT REFERENCES node(id),
	childNodeID INT REFERENCES node(id),
	PRIMARY KEY (mainNodeID, childNodeID)
);

-- Announcement tables
CREATE TABLE IF NOT EXISTS announcementPresets (
    announcementID SERIAL PRIMARY KEY,
    heading VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS alertLog (
    id SERIAL PRIMARY KEY,
    nodeID INT,
    timestamp TIMESTAMP NOT NULL,
    reason VARCHAR(255),
    severity INT NOT NULL,
    CONSTRAINT fk_alertLog_nodeID FOREIGN KEY (nodeID) REFERENCES node(id)
);

CREATE TABLE IF NOT EXISTS announcementLog (
    announcementID INT,
    userID INT NOT NULL,
    initialTime TIMESTAMP NOT NULL,
    expiry TIMESTAMP NOT NULL,
    createdDate TIMESTAMP NOT NULL,
    CONSTRAINT fk_announcementLog_announcementID FOREIGN KEY (announcementID) REFERENCES announcementPresets(announcementID)
);

-- View
CREATE OR REPLACE VIEW latestNodeView AS 
SELECT DISTINCT ON (nl.nodeID) nl.*, n.name, n.longitude, n.latitude
FROM nodeLog nl
JOIN node n ON n.ID = nl.nodeID
ORDER BY nl.nodeID, nl.timestamp DESC;

-- Seed
INSERT INTO node (name, latitude, longitude) VALUES
('Node-001', 28.52955, 30.26594),
('Node-002', 29.52955, 29.26594);

INSERT INTO nodeAdjacency (mainNodeID, childNodeID) VALUES
(1, 2),
(2, 1);

INSERT INTO nodeLog (nodeID, timestamp, flowRate, pressure, battery, temperature, turbidity, totalDissolvedSolids) VALUES
(1, NOW(), 12.5, 1.2, 93, 18.4, 0.8, 230),
(1, NOW() - INTERVAL '1 day', 11.9, 1.1, 94, 18.1, 0.9, 225),
(2, NOW(), 13.2, 1.3, 90, 19.0, 0.7, 240),
(2, NOW() - INTERVAL '1 day', 13.0, 1.2, 91, 18.8, 0.75, 238);

INSERT INTO alertLog (nodeID, timestamp, reason, severity) VALUES
(1, NOW() - INTERVAL '30 minutes', 'Low Battery', 2),
(2, NOW() - INTERVAL '45 minutes', 'High Pressure', 3);

INSERT INTO announcementPresets (heading, content) VALUES
('Test Announcement', 'This is a test announcement'),
('Test Announcement 2', 'This is a second test announcement');

INSERT INTO announcementLog (announcementID, userID, initialTime, expiry, createdDate) VALUES
(1, 1, '2025-06-07 13:25:00', '2025-06-08 12:00:00', NOW()),
(2, 1, '2025-06-06 13:25:00', '2025-06-09 12:00:00', NOW());

-- Test query
SELECT announcementLog.announcementID, announcementLog.expiry, announcementPresets.heading, announcementPresets.content 
FROM announcementLog 
LEFT JOIN announcementPresets ON announcementPresets.announcementID=announcementLog.announcementID 
WHERE initialTime < NOW() AND expiry > NOW();