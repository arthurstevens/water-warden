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
    nodeID INT,
    timestamp TIMESTAMP NOT NULL,
    flowRate REAL NOT NULL,
    pressure REAL NOT NULL,
    battery REAL NOT NULL,
    temperature REAL,
    turbidity REAL,
    totalDissolvedSolids REAL,
    CONSTRAINT fk_nodeLog_id FOREIGN KEY (id) REFERENCES node(id)
    PRIMARY KEY(nodeID, timestamp)
);


-- Adjacency table
CREATE TABLE IF NOT EXISTS nodeAdjacency (
	mainNodeID INT,
	childNodeID INT,
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

INSERT INTO node (name, latitude, longitude) VALUES
('Node001', 28.52955, 30.26594),
('Node002', 29.52955, 29.26594);

INSERT INTO announcementPresets (heading, content) VALUES
('Test Announcement', 'This is a test announcement'),
('Test Announcement 2', 'This is a second test announcement');

INSERT INTO announcementLog (announcementID, userID, initialTime, expiry, createdDate) VALUES
(1, 1, '2025-06-07 13:25:00', '2025-06-08 12:00:00', NOW()),
(2, 1, '2025-06-06 13:25:00', '2025-06-09 12:00:00', NOW());

-- View
CREATE OR REPLACE VIEW nodeView AS SELECT node.name, nodeLog.timestamp, nodeLog.flowRate, nodeLog.pressure, nodeLog.battery, nodeLog.temperature, nodeLog.turbidity, nodeLog.totalDissolvedSolids FROM node LEFT JOIN nodeLog ON node.id = nodeLog.nodeID;

-- Test query
SELECT announcementLog.announcementID, announcementLog.expiry, announcementPresets.heading, announcementPresets.content FROM announcementLog LEFT JOIN announcementPresets ON announcementPresets.announcementID=announcementLog.announcementID WHERE initialTime < NOW() AND expiry > NOW();