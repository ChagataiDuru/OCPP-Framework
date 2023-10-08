import asyncio
from datetime import datetime
import logging
import websockets
import subprocess

from ocpp.v16 import ChargePoint as cp
from ocpp.v16 import call
from ocpp.v16.enums import Action,AuthorizationStatus
from ocpp.routing import on

logging.basicConfig(level=logging.INFO)

class ChargePoint(cp):

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

        if response.status == AuthorizationStatus.accepted:
            print(f"Connected to central system for {self.id}.")
            await self.send_heartbeat(response.interval)

    @on(Action.UnlockConnector)
    async def on_unlock_connector(self, connector_id, evse_id, **kwargs):
        print(f"Received unlock connector request for {self.id}.")
        request = call.UnlockConnectorPayload(
            connector_id=connector_id,        
            evse_id=evse_id,
        )
        response = await self.call(request)
        print(response)
        print(f"Received unlock connector response for {self.id}.")
    
    @on(Action.StatusNotification)    
    async def on_status_notification(self, request):
        print(f"Received status notification for {self.id}.")
        return call.StatusNotificationPayload()   
    
    async def on_firmware_status_notification(self, request):
        print(f"Received firmware status notification for {self.id}.")
        return call.FirmwareStatusNotificationPayload()
    


async def create_chargepoint(cp_id):
    async with websockets.connect(
            f'ws://localhost:9200/{cp_id}',
            subprotocols=['ocpp1.6']
    ) as ws:
        charge_point = ChargePoint(cp_id, ws)
        await asyncio.gather(charge_point.start(), charge_point.send_boot_notification())

async def main():
    charge_point_ids = []
    tasks = []

    while True:
        print("Menu:")
        print("1. Create a new ChargePoint")
        print("2. Establish connection with a Central System")
        print("3. List all connected ChargePoints")
        print("4. Exit")
        choice = input("Enter your choice: ")

        if choice == '1':
            cp_id = input("Enter ChargePoint ID: ")
            charge_point_ids.append(cp_id)
            tasks.append(asyncio.create_task(create_chargepoint(cp_id)))
        elif choice == '2':
            try:
                await asyncio.gather(*tasks)
            except (OSError, websockets.exceptions.ConnectionClosedError) as e:
                print(e)
                print("Connection failed. Restarting...")
                subprocess.call(["python", __file__])
                return        
        elif choice == '3':
            print("List of ChargePoints:")
            for cp_id in charge_point_ids:
                print(cp_id)
        elif choice == '4':
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == '__main__':
    asyncio.run(main())
