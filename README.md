# AmanziWarden (Summative, Year 1)

Smart water monitoring and leak detection system designed for Makers Valley, Johannesburg.

## Features
- Real-time water flow data
- Anomaly detection & alerting
- API + PWA dashboard interface
- Simulated and optional physical sensor nodes

## Technologies
- Node.js + Express
- PostgreSQL
- (Optional) React or Vanilla JS frontend
- ESP32 / mock sensor data simulation

## Proposed File Structure

```plaintext
amanzi-warden/
├── client/                     # Frontend (React or static HTML/JS)
│   ├── public/                 # Static files (favicon, logo)
│   ├── src/                    # JS/React code or vanilla scripts
│   └── index.html              # Entry point (for static or bundled app)
│
├── server/                     # Express.js backend
│   ├── routes/                 # API endpoints (e.g. /flow, /alerts)
│   ├── controllers/            # Logic (e.g. handleFlowData, detectLeak)
│   ├── db/                     # DB connection + queries
│   ├── models/                 # Optional: FlowData, Node schema, etc.
│   ├── utils/                  # Timestamps, validation, format helpers
│   └── index.js                # Main Express app entry
│
├── database/                   # PostgreSQL setup
│   ├── schema.sql              # CREATE TABLE statements
│   └── seed.sql                # Optional test data
│
├── simulator/                  # Mock sensor node (for testing without hardware)
│   ├── sendMock.js             # Sends fake flow data to API
│   └── config.json             # Endpoint settings or node list
│
├── esp32-node/                 # Optional real ESP32 flow sensor code
│   └── amanzi-warden.ino       # Arduino sketch to send flow data
│
├── docs/                       # Reports, diagrams, notes
│   ├── uml/                    # Use case, sequence, class diagrams
│   ├── wireframes/             # UI sketches or Figma exports
│   ├── personas.md             # User persona profiles
│   ├── MoSCoW.md               # Feature priority list
│   ├── sustainability.md       # Sustainability notes
│   └── README-slide-notes.md   # Presentation prep notes
│
├── .env                        # DB credentials, port, etc. (DO NOT COMMIT)
├── .gitignore                  # node_modules/, .env, etc.
├── README.md                   # Project overview and setup
└── package.json                # Node dependencies
```

## Getting Started [ignore]
```bash
npm install
node server/index.js
```