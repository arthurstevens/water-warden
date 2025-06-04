ROLLBACK;

CREATE SCHEMA IF NOT EXISTS "amanzi-warden";
SET search_path TO "amanzi-warden";


-- Node tables
CREATE TABLE IF NOT EXISTS nodeName (
    nodeID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS nodeLog (
    nodeID SERIAL PRIMARY KEY,
    timeStamp TIMESTAMP NOT NULL,
    flowRate REAL NOT NULL,
    pressure REAL NOT NULL,
    battery REAL NOT NULL,
    temperature REAL NOT NULL,
    turbidity REAL NOT NULL,
    totalDissolvedSolids REAL NOT NULL,
    CONSTRAINT nodeID FOREIGN KEY (nodeID) REFERENCES nodeName
);

CREATE TABLE IF NOT EXISTS nodeLog (
    nodeID SERIAL PRIMARY KEY,
    timeStamp TIMESTAMP NOT NULL,
    reason VARCHAR(255),
    severity INT NOT NULL,
    CONSTRAINT nodeID FOREIGN KEY (nodeID) REFERENCES nodeName
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
    announcementID SERIAL PRIMARY KEY,
    userID INT NOT NULL,
    initialTime TIMESTAMP NOT NULL,
    expiry TIMESTAMP NOT NULL,
    createdDate TIMESTAMP NOT NULL,
    CONSTRAINT announcementID FOREIGN KEY (announcementID) REFERENCES announcementPresets
);

CREATE OR REPLACE VIEW nodeView AS SELECT * FROM nodeLog;

SELECT * FROM nodeView;