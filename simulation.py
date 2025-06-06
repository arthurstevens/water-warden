import json
import random
import time
import datetime
import requests

while True:
    data = {
        "nodeid": 1,
        "timestamp": str(datetime.datetime.now().strftime("%Y-%m-%d")),
        "flowrate": random.randint(0,20),
        "pressure": round(random.uniform(0.75,1.25),2),
        "battery": random.randint(1,100),
        "temperature": round(random.uniform(10.0,30.0),1),
        "turbidity": round(random.uniform(0.0,10.0),1),
        "totaldissolvedsolids": round(random.uniform(0.0,10.0),1)
    }

    response = requests.post(
        "http://localhost:3000/api/simulate",
        headers={"Content-Type": "application/json"},
        data=json.dumps(data)
    )

    print("Response:", response.status_code, response.text)
    
    time.sleep(5)
    # break

