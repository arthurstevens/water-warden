import json
import random
import time
import datetime
import requests
import psycopg2
import secrets
import os
import dotenv

dotenv.load_dotenv()

NODES_TO_GENERATE = 50
NODE_INTERVAL = 5

def createNode(name, token, longitude, latitude):
    conn = psycopg2.connect(
        host=os.getenv("PG_HOST"),
        database=os.getenv("PG_DATABASE"),
        user=os.getenv("PG_USER"),
        password=os.getenv("PG_PASSWORD"),
    )

    with conn:
        with conn.cursor() as cur:
            cur.execute('SET search_path TO "amanzi-warden";')
            cur.execute(
                'INSERT INTO node (name, token, latitude, longitude) VALUES (%s, %s, %s, %s) RETURNING id',
                (name, token, latitude, longitude)
            )
            node_id = cur.fetchone()[0]

    conn.close()
    return node_id

def postNodeData(data):
    response = requests.post(
        "http://localhost:3000/api/node-readings",
        headers={"Content-Type": "application/json"},
        data=json.dumps(data)
    )

    print(f"Response: {response.status_code} {response.text}")

def updateNode(node):
    DELTAS = {
        "flowrate": 1.2,
        "pressure": 0.1,
        "battery": 0.5,
        "temperature": 0.3,
        "turbidity": 0.1,
        "totaldissolvedsolids": 20
    }

    def vary(value, delta, lower, upper, round_dp=None):
        if value is None:
            return None
        new_value = value + random.uniform(-delta, delta)
        new_value = max(min(new_value, upper), lower)
        if round_dp is not None:
            return round(new_value, round_dp)
        return int(round(new_value))

    prev = node["data"]
    water_quality = node["water_quality"]

    data = {
        "token": node["token"],
        "timestamp": str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        "flowrate": vary(prev["flowrate"], DELTAS["flowrate"], 10, 20),
        "pressure": vary(prev["pressure"], DELTAS["pressure"], 1, 10, 2),
        "battery": vary(prev["battery"], DELTAS["battery"], 1, 100),
        "temperature": vary(prev["temperature"], DELTAS["temperature"], 10, 35, 1) if water_quality else None,
        "turbidity": vary(prev["turbidity"], DELTAS["turbidity"], 0, 5, 1) if water_quality else None,
        "totaldissolvedsolids": vary(prev["totaldissolvedsolids"], DELTAS["totaldissolvedsolids"], 0, 1400, 1) if water_quality else None
    }

    node["data"] = data
    return node

def main():
    nodes = []

    for i in range(NODES_TO_GENERATE):
        name = f'Example Node {i + 1}'
        token = secrets.token_hex(16)
        latitude = round(random.uniform(-26.20500, -26.19000), 5)
        longitude = round(random.uniform(28.06000, 28.08000), 5)

        id = createNode(name, token, longitude, latitude)

        # Decide initial node severity category
        rand = random.random()
        if rand < 0.9:
            state = 'normal'
        elif rand < 0.97:
            state = 'potential'
        else:
            state = 'critical'

        water_quality = random.choice([True, False])

        if state == 'normal':
            flowrate = random.randint(15, 18)
            pressure = round(random.uniform(3.5, 5.5), 2)
            battery = random.randint(70, 100)
        elif state == 'potential':
            flowrate = random.randint(12, 14)
            pressure = round(random.uniform(2.5, 5), 2)
            battery = random.randint(40, 70)
        elif state == 'critical':
            flowrate = random.randint(8, 11)
            pressure = round(random.uniform(1, 2.5), 2)   
            battery = random.randint(1, 30)

        temperature = (
            round(random.uniform(10, 15), 1) if state == 'critical' and water_quality else
            round(random.uniform(18, 22), 1) if water_quality else None
        )
        turbidity = (
            round(random.uniform(3, 5), 1) if state == 'critical' and water_quality else
            round(random.uniform(0.1, 1), 1) if water_quality else None
        )
        tds = (
            round(random.uniform(900, 1400), 1) if state == 'critical' and water_quality else
            round(random.uniform(250, 350), 1) if water_quality else None
        )

        data = {
            "token": token,
            "timestamp": str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
            "flowrate": flowrate,
            "pressure": pressure,
            "battery": battery,
            "temperature": temperature,
            "turbidity": turbidity,
            "totaldissolvedsolids": tds
        }

        node = {
            'id': id,
            'token': token,
            'water_quality': water_quality,
            'data': data
        }

        nodes.append(node)

    while True:
        for node in nodes:
            node = updateNode(node)
            postNodeData(node['data'])
        time.sleep(NODE_INTERVAL)

if __name__ == "__main__":
    main()
