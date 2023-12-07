import random
import string
import threading
from datetime import datetime

import asyncio
import sys
import websockets

import tkinter as tk
from tkinter import ttk
from tkinter.scrolledtext import ScrolledText

from ocpp.v16 import ChargePoint as cp
from ocpp.v16 import call, call_result
from ocpp.v16.enums import RegistrationStatus, Action, AuthorizationStatus, RemoteStartStopStatus

class MyChargePoint(cp):
    async def send_boot_notification(self):
        request = call.BootNotificationPayload(
            charge_point_model="AVT-Express",
            charge_point_vendor="AVT-Company",
            # TODO: Send Serial Number
        )
        response = await self.call(request)
        return response.status

    async def send_authorize(self, id_tag):
        request = call.AuthorizePayload(
            id_tag=id_tag
        )
        response = await self.call(request)
        return response.id_tag_info.status

    async def send_start_transaction(self, connector_id, id_tag, meter_start):
        request = call.StartTransactionPayload(
            connector_id=connector_id,
            id_tag=id_tag,
            meter_start=meter_start,
            timestamp=datetime.utcnow().isoformat()
        )
        response = await self.call(request)
        return response.id_tag_info.status

    async def send_stop_transaction(self, transaction_id, meter_stop):
        request = call.StopTransactionPayload(
            meter_stop=meter_stop,
            timestamp=datetime.utcnow().isoformat(),
            transaction_id=transaction_id
        )
        response = await self.call(request)
        return response.id_tag_info.status

    async def send_heartbeat(self):
        request = call.HeartbeatPayload()
        response = await self.call(request)
        return response.current_time

    async def send_meter_values(self, connector_id, transaction_id, meter_value):
        request = call.MeterValuesPayload(
            meter_value=[
                {
                    "sampled_value": [
                        {
                            "value": str(meter_value),
                            "context": "Sample.Periodic",
                            "measurand": "Energy.Active.Import.Register",
                            "location": "Outlet",
                            "unit": "Wh"
                        }
                    ],
                    "timestamp": datetime.utcnow().isoformat()
                }
            ],
            connector_id=connector_id,
            transaction_id=transaction_id
        )
        response = await self.call(request)
        return response

    async def send_status_notification(self, connector_id, status):
        request = call.StatusNotificationPayload(
            connector_id=connector_id,
            status=status,
            error_code="NoError",
            timestamp=datetime.utcnow().isoformat()
        )
        response = await self.call(request)
        return response

    async def send_data_transfer(self, vendor_id, message_id, data):
        request = call.DataTransferPayload(
            vendor_id=vendor_id,
            message_id=message_id,
            data=data
        )
        response = await self.call(request)
        return response.status

class OCPPSimulatorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("OCPP Simulator")
        
        self.charge_point: MyChargePoint = None
        self.create_widgets()

        #sys.stdout = ConsoleOutput(self.console)

    def create_widgets(self):
        # Title
        title = tk.Label(self.root, text="Chagatai's", font=("Arial", 48), fg="#27a3ac")
        title.pack()

        # Subtitle
        subtitle = tk.Label(self.root, text="Simple OCPP 1.6 Chargebox Simulator", font=("Arial", 24), fg="#eee")
        subtitle.pack()

        # Central Station
        central_station_label = tk.Label(self.root, text="Central Station")
        central_station_label.pack()
        self.central_station_entry = tk.Entry(self.root)
        self.central_station_entry.pack()

        # Tag
        tag_label = tk.Label(self.root, text="Tag")
        tag_label.pack()
        self.tag_entry = tk.Entry(self.root)
        self.tag_entry.pack()

        # Connector uid
        connector_uid_label = tk.Label(self.root, text="Connector uid")
        connector_uid_label.pack()
        self.connector_uid_entry = tk.Entry(self.root)
        self.connector_uid_entry.pack()

        # Actions
        self.actions_label = tk.Label(self.root, text="Actions", font=("Arial", 24))
        self.actions_label.pack()
        self.connect_button = tk.Button(self.root, text="Connect", command=self.connect_action)
        self.connect_button.pack()
        self.authorize_button = tk.Button(self.root, text="Authorize", command=self.authorize_action)
        self.authorize_button.pack()
        self.start_transaction_button = tk.Button(self.root, text="Start Transaction", command=self.start_transaction_action)
        self.start_transaction_button.pack()
        self.stop_transaction_button = tk.Button(self.root, text="Stop Transaction", command=self.stop_transaction_action)
        self.stop_transaction_button.pack()
        self.heartbeat_button = tk.Button(self.root, text="Heartbeat", command=self.heartbeat_action)
        self.heartbeat_button.pack()

        # Meter value
        meter_value_label = tk.Label(self.root, text="Meter value")
        meter_value_label.pack()
        self.meter_value_entry = tk.Entry(self.root)
        self.meter_value_entry.pack()

        # transactionId
        transaction_id_label = tk.Label(self.root, text="transactionId")
        transaction_id_label.pack()
        transaction_id_entry = tk.Entry(self.root)
        transaction_id_entry.pack()

        # Connector Status
        connector_status_label = tk.Label(self.root, text="Connector Status")
        connector_status_label.pack()
        connector_status_combobox = ttk.Combobox(self.root, values=["Available", "Preparing", "Charging", "SuspendedEV", "SuspendedEVSE", "Finishing", "Reserved", "Faulted", "Offline"])
        connector_status_combobox.pack()

        # Send Meter Values button
        send_meter_values_button = tk.Button(self.root, text="Send Meter Values")
        send_meter_values_button.pack()

        # Increment value
        increment_value_label = tk.Label(self.root, text="Increment value")
        increment_value_label.pack()
        increment_value_entry = tk.Entry(self.root)
        increment_value_entry.pack()

        # Time interval
        time_interval_label = tk.Label(self.root, text="Time interval")
        time_interval_label.pack()
        time_interval_entry = tk.Entry(self.root)
        time_interval_entry.pack()

        # Counter
        counter_label = tk.Label(self.root, text="Counter")
        counter_label.pack()
        counter_entry = tk.Entry(self.root)
        counter_entry.pack()

        # Send Meter Values loop button
        send_meter_values_loop_button = tk.Button(self.root, text="Send Meter Values loop")
        send_meter_values_loop_button.pack()

        # Status Notification button
        status_notification_button = tk.Button(self.root, text="Status Notification")
        status_notification_button.pack()

        # Data Transfer button
        data_transfer_button = tk.Button(self.root, text="Data Transfer")
        data_transfer_button.pack()

        # Console
        self.console = ScrolledText(self.root, bg="black", fg="white", state='disabled')
        self.console.pack(fill="both", expand=True)

    async def print_result(self, task: asyncio.Task):
        try:
            result = task.result()
            print(f"Result: {result}")
        except Exception as e:
            print(f"An error occurred: {e}")

    async def create_chargepoint(self, cp_id):
        async with websockets.connect(
                f'ws://localhost:9210/{cp_id}',
                subprotocols=['ocpp1.6']
        ) as ws:
            self.charge_point = MyChargePoint(cp_id, ws)
            await asyncio.gather(self.charge_point.start(), self.charge_point.send_boot_notification())

    # Actions
    def connect_action(self):
        cp_value = self.central_station_entry.get()
        print(f"Connecting to Central Station as: {cp_value}")
        try:
            task = asyncio.run_coroutine_threadsafe(self.create_chargepoint(cp_value), asyncio.get_event_loop())
            task.add_done_callback(self.print_result)
            print(f"Connected to Central Station")

            self.central_station_entry.delete(0, tk.END)
            self.central_station_entry.insert(0, "Connected")
            self.central_station_entry.config(state="disabled")
            self.connect_button.config(state="disabled")

        except Exception as e:
            print(f"An error occurred: {e}")
            return

    def authorize_action(self):
        tag_value = self.tag_entry.get()
        print(f"Authorizing with Tag: {tag_value}")
        task = asyncio.run_coroutine_threadsafe(self.charge_point.send_authorize(tag_value), asyncio.get_event_loop())
        task.add_done_callback(self.print_result)


    def start_transaction_action(self):
        connector_id_value = self.connector_uid_entry.get()
        tag_value = self.tag_entry.get()
        meter_start_value = self.meter_value_entry.get()
        print(f"Starting transaction with Connector ID: {connector_id_value}, Tag: {tag_value}, Meter Start: {meter_start_value}")
        task = asyncio.run_coroutine_threadsafe(self.charge_point.send_start_transaction(connector_id_value, tag_value, meter_start_value), asyncio.get_event_loop())
        task.add_done_callback(self.print_result)

    def stop_transaction_action(self):
        transaction_id_value = self.entry_transaction_id.get()
        meter_stop_value = self.meter_value_entry.get()
        print(f"Stopping transaction with Transaction ID: {transaction_id_value}, Meter Stop: {meter_stop_value}")
        asyncio.create_task(self.charge_point.send_stop_transaction(transaction_id_value, meter_stop_value))

    def heartbeat_action(self):
        print("Sending heartbeat")
        asyncio.create_task(self.charge_point.send_heartbeat())

class ConsoleOutput:
    def __init__(self, console):
        self.console = console

    def write(self, text):
        self.console.insert(tk.END, text)
        self.console.see(tk.END)

    def flush(self):
        pass

def main():
    root = tk.Tk()
    app = OCPPSimulatorGUI(root)

    def start_asyncio_loop(loop: asyncio.AbstractEventLoop):
        asyncio.set_event_loop(loop)
        loop.run_forever()

    loop = asyncio.get_event_loop()
    threading.Thread(target=start_asyncio_loop, args=(loop,), daemon=True).start()

    root.mainloop()

if __name__ == '__main__':
    main()