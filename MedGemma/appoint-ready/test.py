import json
from google.oauth2 import service_account

secret_key_json="hcls-jp1-medgemma-41cdd6582f22.json"
with open(secret_key_json) as f:
    service_account_info = json.load(f)
    print(service_account_info)
