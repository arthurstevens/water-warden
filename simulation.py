import json
import random
import time
import datetime
import requests

# Some nodes don't record temperature, turbidity or dissolved solids



while True:
    if random.randint(1,2) == 1:
        data = {
            "token": 'xyz789abc123',
            "timestamp": str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
            "flowrate": random.randint(10,20),
            "pressure": round(random.uniform(1,10),2),
            "battery": random.randint(1,100),
            "temperature": round(random.uniform(10,35),1),
            "turbidity": round(random.uniform(0,5),1),
            "totaldissolvedsolids": round(random.randint(0,1400),1)
        }
    else:
        data = {
            "token": '123abc789xyz',
            "timestamp": str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
            "flowrate": random.randint(10,20),
            "pressure": round(random.uniform(1,10),2),
            "battery": random.randint(1,100),
            "temperature": None,
            "turbidity": None,
            "totaldissolvedsolids": None
        }

    response = requests.post(
        "http://localhost:3000/api/simulate",
        headers={"Content-Type": "application/json"},
        data=json.dumps(data)
    )

    print(f"Response: {response.status_code} {response.text}")
    
    # break
    time.sleep(5)

