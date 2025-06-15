# Water Warden

A prototype web application for monitoring and managing plumbing infrastructure. Simulates how administrators could track node activity, sensor readings, and network health in a scalable, real-world irrigation system.

---

## Features

- **Web-based Dashboard**  
  Responsive interface with status indicators, health metrics, and real-time updates

- **Node Simulation**  
  Virtual node data ingestion (name, coordinates, timestamp, and optional sensor readings)

- **Status Alerts**  
  Nodes deliver 'Normal', 'Potential Issues', or 'Critical' status based on defined thresholds

- **KPI Metrics**  
  Displays live data for node count, online status, and last updated time

- **Admin Panel**  
  Create announcements and initialise nodes with auth tokens

- **Responsive UI**  
  Built using EJS templating and Tailwind CSS for clean, adaptive design

- **Data Cache**
  Node data and alerts are held in local storage until they can be updated again

---

## Stack

| Layer           | Technologies                       |
|-----------------|------------------------------------|
| Frontend        | HTML, EJS, Tailwind CSS            |
| Backend         | Node.js, Express.js                |
| Data/Storage    | PostgreSQL                         |
| Utilities       | JS                                 |

---

## Screenshots

<details>
<summary>Home / Dashboard</summary>
  
![Screenshot 2025-06-15 at 03-02-48 Water Warden](https://github.com/user-attachments/assets/8b1cdf20-2724-476e-826c-cb70f1471eb0)

</details>

<details>
<summary>Admin Login</summary>
  
![Screenshot 2025-06-15 at 03-03-07 Water Warden](https://github.com/user-attachments/assets/69222906-9c6a-48e0-92a0-36a6ccc50070)

</details>

<details>
<summary>Admin Panel</summary>
  
![Screenshot 2025-06-15 at 03-03-23 Admin Dashboard](https://github.com/user-attachments/assets/55001eee-de16-49f5-b290-630337200bca)

</details>

<details>
<summary>Example Alert</summary>
  
![Screenshot 2025-06-15 at 03-10-42 Water Warden](https://github.com/user-attachments/assets/843f5e9f-6652-4fe7-86f4-8a539a7b173a)

</details>

---

## Setup & Running Locally

### Basics

```bash
# 1. Clone the repo
git clone https://github.com/arthurstevens/water-warden.git
cd water-warden

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Fill in database connection values & a session secret for user sessions

# 4. Run the app
npm start
```

### Database

Before running the app, make sure you have a PostgreSQL database to connect to.

```bash
# Create a new database
# Run the included DDL script
psql -U <db_username> -d <db_name> -f init/schema.sql
```

> Replace `<db_username>` and `<db_name>` as desired.

> Configure & run `scripts/gen-user-sql.js` to generate SQL statements for user (admin) accounts.

### Simulating Nodes

Open and configure scripts/simulate_nodes.py as desired, and then run:

```bash
py scripts/simulate_nodes.py
```

> Make sure server is running before executing this script (RESTful endpoint must be active to receive data)
