ROLLBACK;

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

INSERT INTO nodeName (name, latitude, longitude) VALUES
('Node001', 28.52955, 30.26594),
('Node002', 29.52955, 29.26594);

-- View
CREATE OR REPLACE VIEW nodeView AS SELECT nodeName.name, nodeLog.timestamp, nodeLog.flowRate, nodeLog.pressure, nodeLog.battery, nodeLog.temperature, nodeLog.turbidity, nodeLog.totalDissolvedSolids FROM nodeName LEFT JOIN nodeLog ON nodeName.nodeID = nodeLog.nodeID;

-- Test query
SELECT * FROM nodeView;