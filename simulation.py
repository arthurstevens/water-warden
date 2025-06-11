import json
import random
import time
import datetime
import requests
import psycopg2
import secrets

NODES_TO_GENERATE = 50
NODE_INTERVAL = 5

def createNode(name, token, longitude, latitude):
    conn = psycopg2.connect(
        host="localhost",
        database="amanzi-water-db",
        user="postgres",
        password="$$%%^^LocalDB^^%%$$"
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
    # Maximum deviation per update
    DELTAS = {
        "flowrate": 2,
        "pressure": 0.2,
        "battery": 1,
        "temperature": 0.5,
        "turbidity": 0.2,
        "totaldissolvedsolids": 50
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
    nodes = [ ]

    for i in range(NODES_TO_GENERATE):
        name = f'Example Node {i + 1}'
        token = secrets.token_hex(16)
        latitude = round(random.uniform(-26.20500, -26.19000), 5)
        longitude = round(random.uniform(28.06000, 28.08000), 5)

        id = createNode(name, token, longitude, latitude)
        water_quality = random.choice([True, False])

        data = {
            "token": token,
            "timestamp": str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
            "flowrate": random.randint(12,18),
            "pressure": round(random.uniform(4,5),2),
            "battery": random.randint(30,70),
            "temperature": round(random.uniform(15, 25), 1) if water_quality else None,
            "turbidity": round(random.uniform(0,3),1) if water_quality else None,
            "totaldissolvedsolids": round(random.randint(0,1200),1) if water_quality else None
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