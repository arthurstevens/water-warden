CREATE SCHEMA IF NOT EXISTS 'amanzi-warden';
SET search_path TO 'amanzi-warden';


-- Node tables
CREATE TABLE IF NOT EXISTS nodeName (
    nodeID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL
)

CREATE TABLE IF NOT EXISTS nodeLog (
    nodeID SERIAL PRIMARY KEY,
    timeStamp TIMESTAMP NOT NULL,
    flowRate DOUBLE PRECISION NOT NULL,
    pressure DOUBLE PRECISION NOT NULL,
    battery DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    turbidity DOUBLE PRECISION NOT NULL,
    totalDissolvedSolids DOUBLE PRECISION NOT NULL,
    CONSTRAINT nodeID FOREIGN KEY (nodeID) REFERENCES nodeName
)

CREATE TABLE IF NOT EXISTS nodeLog (
    nodeID SERIAL PRIMARY KEY,
    timeStamp TIMESTAMP NOT NULL,
    reason VARCHAR(255),
    severity INT NOT NULL,
    CONSTRAINT nodeID FOREIGN KEY (nodeID) REFERENCES nodeName
)


-- Announcement tables
CREATE TABLE IF NOT EXISTS announcementPresets (
    announcementID SERIAL PRIMARY KEY,
    heading VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL
)

CREATE TABLE IF NOT EXISTS announcementLog (
    announcementID SERIAL PRIMARY KEY,
    userID INT NOT NULL,
    initialTime TIMESTAMP NOT NULL,
    expiry TIMESTAMP NOT NULL,
    createdDate TIMESTAMP NOT NULL,
    CONSTRAINT announcementID FOREIGN KEY (announcementID) REFERENCES announcementPresets
)

CREATE VIEW IF NOT EXISTS nodeView AS
SELECT * FROM nodeLog