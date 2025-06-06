DROP SCHEMA IF EXISTS "amanzi-warden" CASCADE;

CREATE SCHEMA IF NOT EXISTS "amanzi-warden";
SET search_path TO "amanzi-warden";

DROP TABLE IF EXISTS nodeName CASCADE;
DROP TABLE IF EXISTS nodeLog CASCADE;
DROP TABLE IF EXISTS alertLog CASCADE;
DROP TABLE IF EXISTS nodeAdjacency CASCADE;
DROP TABLE IF EXISTS announcementLog CASCADE;
DROP TABLE IF EXISTS announcementPresets CASCADE;

-- Node tables
CREATE TABLE IF NOT EXISTS nodeName (
    nodeID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS nodeLog (
    nodeID INT,
    timeStamp TIMESTAMP NOT NULL,
    flowRate REAL NOT NULL,
    pressure REAL NOT NULL,
    battery REAL NOT NULL,
    temperature REAL NOT NULL,
    turbidity REAL NOT NULL,
    totalDissolvedSolids REAL NOT NULL,
    CONSTRAINT fk_nodeLog_nodeID FOREIGN KEY (nodeID) REFERENCES nodeName(nodeID)
);

CREATE TABLE IF NOT EXISTS alertLog (
    nodeID SERIAL,
    timeStamp TIMESTAMP NOT NULL,
    reason VARCHAR(255),
    severity INT NOT NULL,
    CONSTRAINT fk_alertLog_nodeID FOREIGN KEY (nodeID) REFERENCES nodeName(nodeID)
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

CREATE TABLE IF NOT EXISTS announcementLog (
    announcementID INT,
    userID INT NOT NULL,
    initialTime TIMESTAMP NOT NULL,
    expiry TIMESTAMP NOT NULL,
    createdDate TIMESTAMP NOT NULL,
    CONSTRAINT fk_announcementLog_announcementID FOREIGN KEY (announcementID) REFERENCES announcementPresets(announcementID)
);

-- View
CREATE OR REPLACE VIEW nodeView AS SELECT * FROM nodeLog;

-- Seed data
INSERT INTO nodeName (name, latitude, longitude) VALUES
('Node001', 28.82863, 30.24287);

INSERT INTO nodeLog (nodeID, timestamp, flowRate, pressure, battery, temperature, turbidity, totalDissolvedSolids) VALUES
(1, NOW(), 11.2, 1.0, 85, 22.1, 2.5, 5.8),
(1, NOW(), 10.7, 0.9, 86, 23.0, 2.9, 5.5);

-- Test query
SELECT * FROM nodeView;
