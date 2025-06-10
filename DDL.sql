-- ============================================================================
-- Project Name : Amanzi Warden
-- File Name    : DDL.sql
-- Description  : Defines the database schema in entirety. Comprised of tables 
--				  and their constraints, functions, triggers, views, and 
--				  indexes.
--                Additionally contains some seed data at the base.
-- Created On   : 2025-06-04
-- Last Altered : 2025-06-10
-- NOTE         : N/A
-- ============================================================================


-- ============================================================================
-- SCHEMA DEFINITION
-- ============================================================================

DROP SCHEMA IF EXISTS "amanzi-warden" CASCADE;

CREATE SCHEMA IF NOT EXISTS "amanzi-warden";
SET search_path TO "amanzi-warden";

DROP TABLE IF EXISTS node CASCADE;
DROP TABLE IF EXISTS nodeLog CASCADE;
DROP TABLE IF EXISTS alertLog CASCADE;
DROP TABLE IF EXISTS nodeAdjacency CASCADE;
DROP TABLE IF EXISTS announcementLog CASCADE;
DROP TABLE IF EXISTS announcementPresets CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'user');

-- ============================================================================
-- TABLE DEFINITIONS
-- ============================================================================

-- Node table: stores node metadata
CREATE TABLE IF NOT EXISTS node (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    latitude NUMERIC(8,5) NOT NULL,
    longitude NUMERIC(8,5) NOT NULL,
    createdDate TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Node logs: stores time-sensitive data sent by node readings
CREATE TABLE IF NOT EXISTS nodeLog (
    nodeID INT REFERENCES node(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    flowRate REAL NOT NULL,
    pressure REAL NOT NULL,
    battery REAL NOT NULL,
    temperature REAL,
    turbidity REAL,
    totalDissolvedSolids REAL,
    PRIMARY KEY(nodeID, timestamp)
);

-- Node adjacency table: node connections list of direction mainNode -> childNode
CREATE TABLE IF NOT EXISTS nodeAdjacency (
	mainNodeID INT NOT NULL REFERENCES node(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
	childNodeID INT NOT NULL REFERENCES node(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
	PRIMARY KEY (mainNodeID, childNodeID)
);

-- User table: currently only for access to admin panel
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    createdDate TIMESTAMP DEFAULT NOW()
);

-- Announcement logs: records active and expired announcements and the user that triggered it
CREATE TABLE IF NOT EXISTS announcementLog (
    id SERIAL PRIMARY KEY,
	heading VARCHAR(50) NOT NULL,
    content VARCHAR(255) NOT NULL,
    userID INT NOT NULL REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    initialTime TIMESTAMP NOT NULL,
    expiry TIMESTAMP NOT NULL,
    createdDate TIMESTAMP DEFAULT NOW(),
    severity INT NOT NULL 
        CHECK (severity IN (0, 1, 2, 3))
);

-- Alert logs: stores flags for nodes with abnormal readings
CREATE TABLE IF NOT EXISTS alertLog (
    id SERIAL PRIMARY KEY,
    nodeID INT REFERENCES node(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    reason VARCHAR(255),
    severity INT NOT NULL
        CHECK (severity IN (2, 3))
);

-- ============================================================================
-- VIEWS DEFINITIONS
-- ============================================================================

-- Most recent data recordings from each node
CREATE OR REPLACE VIEW latestNodeView AS 
SELECT DISTINCT ON (nl.nodeID)
n.id AS nodeID, n.name, nl.flowRate, nl.pressure, nl.temperature, nl.turbidity, nl.totalDissolvedSolids AS tds, nl.timestamp, n.longitude, n.latitude, nl.battery
FROM nodeLog nl
LEFT JOIN node n ON n.ID = nl.nodeID
ORDER BY nl.nodeID, nl.timestamp DESC;

-- Active announcements
CREATE OR REPLACE VIEW activeAnnouncements AS
SELECT heading, content, initialTime, expiry, severity
FROM announcementLog
WHERE expiry > NOW()
ORDER BY initialTime ASC;

-- ============================================================================
-- INDEX DEFINITIONS
-- ============================================================================

-- Faster lookup for most recent node data
CREATE INDEX nodeLog_timestamp ON nodeLog(timestamp);

-- Faster lookup for expired announcements
CREATE INDEX announcementLog_expiry ON announcementLog(expiry);

-- Faster lookup for users
CREATE INDEX users_username ON users(username);

-- ============================================================================
-- SEED / TESTING
-- ============================================================================

INSERT INTO node (name, latitude, longitude) VALUES
('Some Area A', 28.52955, 30.26594),
('Another Area B', 29.52955, 29.26594);

INSERT INTO nodeAdjacency (mainNodeID, childNodeID) VALUES
(1, 2);

INSERT INTO nodeLog (nodeID, timestamp, flowRate, pressure, battery, temperature, turbidity, totalDissolvedSolids) VALUES
(1, NOW(), 12.5, 1.2, 93, 18.4, 0.8, 230),
(1, NOW() - INTERVAL '1 day', 11.9, 1.1, 94, 18.1, 0.9, 225),
(2, NOW(), 13.2, 1.3, 90, 19.0, 0.7, 240),
(2, NOW() - INTERVAL '1 day', 13.0, 1.2, 91, 18.8, 0.75, 238);

INSERT INTO alertLog (nodeID, timestamp, reason, severity) VALUES
(1, NOW() - INTERVAL '30 minutes', 'Low battery', 2),
(2, NOW() - INTERVAL '45 minutes', 'High pressure', 3);

INSERT INTO users (username, passwordHash) VALUES
('user1', '123');

INSERT INTO announcementLog (heading, content, userID, initialTime, expiry, severity) VALUES
('Test Announcement 1', 'Test content 1 (active)', 1, '2025-06-07 13:25:00', NOW() + INTERVAL '1 day', 1),
('Test Announcement 2', 'Test content 1 (active)', 1, '2025-06-06 13:25:00', NOW() + INTERVAL '2 day', 2),
('Test Announcement 3', 'Test content 1 (inactive)', 1, '2025-06-07 13:25:00', NOW() - INTERVAL '1 day', 3),
('Test Announcement 4', 'Test content 1 (inactive)', 1, '2025-06-06 13:25:00', NOW() - INTERVAL '2 day', 2);

-- Test query
SELECT * FROM activeAnnouncements;