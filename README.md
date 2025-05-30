# AmanziWarden (Summative, Year 1)

Smart water monitoring and leak detection system designed for Makers Valley, Johannesburg.

## Features
- Real-time water flow data
- Anomaly detection & alerting
- API + PWA dashboard interface
- Simulated and optional physical sensor nodes

## Technologies

### Client

- EJS: loading dynamic content
- Tailwind: rapid design/prototyping
- SVGs: lossless quality for icons/logos
- JS
- Communicates with Express server

### Server

*TBD*

### Database

*TBD*

### Simulator

*TBD*

## Proposed File Structure

```plaintext
amanzi-warden/
├── client/                      # Frontend
│   ├── public/                  # Publicly served static files
│   │   ├── assets/              # External SVG icons
│   │   └── app.js               # Needs functionality for:
│   │                            # - Fetch node data from Express server
│   │                            # - Edit DOM (header status info, KPIs, nodes table)
│   │                            # - Respond to table filter and CSV export requests
│   └── views/                   # EJS/Templates
│       └── index.ejs            # Standalone page using Tailwind CSS
│
├── server/                      # Express backend
│   ├── routes/                  # API endpoints
│   ├── controllers/             # Business logic, interprets node data
│   ├── db/                      # DB connection (Postgres)
│   ├── utils/                   # Any other utility
│   └── index.js                 # Main Express app (entry point)
│
├── database/                    # SQL schema and test data
│   ├── schema.sql               # DDL
│   └── seed.sql                 # Mock DML (for development)
│
├── simulator/                   # Simulate data for demonstration
│   └── simulateDemo.js          # Sends mock data/sensor readings to API
│
├── .env                         # Environment config, credentials
├── .gitignore                   
├── package.json                 # Node dependencies
└── README.md                    # Project overview/setup
```
