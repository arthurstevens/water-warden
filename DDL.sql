ROLLBACK;

DROP SCHEMA IF EXISTS "amanzi-warden" CASCADE;

CREATE SCHEMA "amanzi-warden";
SET search_path TO "amanzi-warden";

-- Node tables
CREATE TABLE IF NOT EXISTS node (
    nodeID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS nodeLog (
    nodeID INT REFERENCES node(nodeID),
    timestamp TIMESTAMP NOT NULL,
    flowRate REAL NOT NULL,
    pressure REAL NOT NULL,
    battery REAL NOT NULL,
    temperature REAL,
    turbidity REAL,
    totalDissolvedSolids REAL
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
    severity 
    CONSTRAINT fk_announcementLog_announcementID FOREIGN KEY (announcementID) REFERENCES announcementPresets(announcementID)
);

CREATE TABLE IF NOT EXISTS alertLog (
    nodeID SERIAL,
    timestamp TIMESTAMP NOT NULL,
    reason VARCHAR(255),
    severity INT NOT NULL,
    CONSTRAINT fk_alertLog_nodeID FOREIGN KEY (nodeID) REFERENCES nodeName(nodeID)
);


INSERT INTO node (name, latitude, longitude) VALUES
('Some Area A', 28.52955, 30.26594),
('Other Zone B', 29.52955, 29.26594);

INSERT INTO announcementPresets (heading, content) VALUES
('Test Announcement 1', 'Example test announcement 1'),
('Test Announcement 2', 'Example test announcement 2');

INSERT INTO announcementLog (announcementID, userID, initialTime, expiry, createdDate) VALUES
(1, 1, '2025-06-07 13:25:00', '2025-06-08 12:00:00', NOW()),
(2, 1, '2025-06-06 13:25:00', '2025-06-09 12:00:00', NOW());

-- View
CREATE OR REPLACE VIEW nodeView 
AS SELECT n.name, nl.timestamp, nl.flowRate, nl.pressure, nl.battery, nl.temperature, nl.turbidity, nl.totalDissolvedSolids 
FROM node n
LEFT JOIN nodeLog nl ON n.nodeID = nl.nodeID;

-- Test query
SELECT al.announcementID, al.expiry, ap.heading, ap.content 
FROM announcementLog al
LEFT JOIN announcementPresets ap ON ap.announcementID=al.announcementID 
WHERE expiry > NOW();