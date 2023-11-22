import asyncio
from datetime import datetime
import logging
import websockets
import subprocess

from ocpp.v201 import ChargePoint as cp
from ocpp.v201 import call
from ocpp.v201.enums import RegistrationStatusType
from ocpp.routing import on

logging.basicConfig(level=logging.INFO)

class ChargePoint(cp):

    auth = False
    serial_number = "1234567890"
    password = "1234"

    async def send_authorize(self):
        print(f"Sending authorize for {self.id}.")
        request = call.AuthorizePayload(
            id_token={
                'id_token': self.password,
                'type': 'ISO14443',
                'additional_info': [{
                    'additionalIdToken': self.serial_number,
                    'type': 'ISO14443'
                }]
            },
        )
        response = await self.call(request)
        print(f"Received authorize response for {self.id}: {response}")
        if response.id_token_info['status'] == "Accepted":
            self.auth = True
            print(f"Authorized {self.id}.")
            await self.send_boot_notification()
        else:
            try:
                await self._connection.close()
            except (OSError, websockets.exceptions.ConnectionClosedError,websockets.exceptions.ConnectionClosedOK) as e:
                print(e)
                print(f"Authorization failed for {self.id}.")
                subprocess.call(["python", __file__])
                return        

    async def send_heartbeat(self, interval):
        print(f"Sending heartbeat for {self.id}.")
        request = call.HeartbeatPayload()
        while True:
            await self.call(request)
            await asyncio.sleep(interval)
            print(f"Received heartbeat response for {self.id}.")

    async def send_boot_notification(self):
        request = call.BootNotificationPayload(
            charging_station={
                'model': 'Wallbox XYZ',
                'vendor_name': 'anewone'
            },
            reason="PowerUp"
        )
        response = await self.call(request)

        if response.status == RegistrationStatusType.accepted:
            print(f"Connected to central system for {self.id}.")
            await self.send_heartbeat(response.interval)

    async def send_meter_values(self):
        print(f"Sending meter values for {self.id}.")
        request = call.MeterValuesPayload(
            connector_id=1,
            transaction_id=1,
            meter_value=[{
                'timestamp': datetime.utcnow().isoformat(),
                'sampled_value': [{
                    'value': '0'
                }]
            }]
        )
        response = await self.call(request)
        print(f"Received meter values response for {self.id}: {response}")

    async def send_start_transaction(self):
        print(f"Sending start transaction for {self.id}.")
        request = call.TransactionEventPayload(
            event_type="Start",
            timestamp=datetime.utcnow().isoformat(),
            trigger_reason="CablePluggedIn",
            seq_no=1,
            transaction_data={
                'id': 1,
                'timestamp': datetime.utcnow().isoformat(),
                'meter_start': 0,
                'reservation_id': 0
            }
        )
        response = await self.call(request)
        print(f"Received start transaction response for {self.id}: {response}")

    async def send_stop_transaction(self):
        print(f"Sending stop transaction for {self.id}.")
        request = call.TransactionEventPayload(
            event_type="Stop",
            timestamp=datetime.utcnow().isoformat(),
            trigger_reason="Authorized",
            seq_no=1,
            transaction_data={
                'id': 1,
                'timestamp': datetime.utcnow().isoformat(),
                'meter_stop': 0,
                'transaction_id': 1
            }
        )
        response = await self.call(request)
        print(f"Received stop transaction response for {self.id}: {response}")

    @on("UnlockConnector")
    async def on_unlock_connector(self, connector_id, evse_id, **kwargs):
        print(f"Received unlock connector request for {self.id}.")
        request = call.UnlockConnectorPayload(
            connector_id=connector_id,        
            evse_id=evse_id,
        )
        response = await self.call(request)
        print(response)
        print(f"Received unlock connector response for {self.id}.")
       
    async def on_status_notification(self, request):
        print(f"Received status notification for {self.id}.")
        return call.StatusNotificationPayload()   
    
    async def on_firmware_status_notification(self, request):
        print(f"Received firmware status notification for {self.id}.")
        return call.FirmwareStatusNotificationPayload()
    
    def __init__(self, id, connection, response_timeout=30,password="1234",serial_number="1234567890"):
        super().__init__(id, connection, response_timeout)
        self.password = password
        self.serial_number = serial_number



async def create_chargepoint(cp_id,password,serial_number):
    async with websockets.connect(
            f'ws://localhost:9200/{cp_id}',
            subprotocols=['ocpp2.0.1']
    ) as ws:
        charge_point = ChargePoint(cp_id, ws, 30, password, serial_number)
        await asyncio.gather(charge_point.start(), charge_point.send_authorize())

async def main():
    charge_point_ids = []
    tasks = []

    while True:
        print("Menu:")
        print("1. Create a new ChargePoint")
        print("2. Create 3 charging point")
        print("3. Establish connection with a Central System initial")
        print("4. Exit")
        choice = input("Enter your choice: ")

        if choice == '1':
            cp_id = input("Enter ChargePoint ID: ")
            passw = input("Enter Pass: ")
            sn = input("Enter sn: ")
            charge_point_ids.append(cp_id)
            tasks.append(asyncio.create_task(create_chargepoint(cp_id,passw,sn)))
        elif choice == '2':
            for i in range(3):
                cp_id = f"CP2-{i+1}"
                passw = f"pass{i+1}"
                print(f"Creating {cp_id}")
                charge_point_ids.append(cp_id)
                tasks.append(asyncio.create_task(create_chargepoint(cp_id,passw)))
        elif choice == '3':
            try:
                await asyncio.gather(*tasks)
            except (OSError, websockets.exceptions.ConnectionClosedError) as e:
                print(e)
                print("Connection failed. Restarting...")
                subprocess.call(["python", __file__])
                return        
        elif choice == '4':
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == '__main__':
    asyncio.run(main())
