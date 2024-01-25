import sys
import threading
import asyncio
import websockets
from datetime import datetime

import tkinter as tk
from tkinter import ttk
from tkinter.scrolledtext import ScrolledText

from ocpp.v16 import ChargePoint as cp
from ocpp.v16 import call, call_result
from ocpp.v16.enums import RegistrationStatus, AuthorizationStatus

class MyChargePoint(cp):
    interval:int = 60
    transactionId:int = 0
    async def send_boot_notification(self, serial_number):
        request = call.BootNotificationPayload(
            charge_point_model="AVT-Express",
            charge_point_vendor="AVT-Company",
            charge_point_serial_number=serial_number,
        )
        try:
            response: call_result.BootNotificationPayload = await self.call(request)
            self.interval = response.interval
            if response.status == RegistrationStatus.accepted:
                print(f"Connected to central system for {self.id}.")
                await self.send_heartbeat()
            return response.status == RegistrationStatus.accepted
        except websockets.exceptions.ConnectionClosed as e:
            print(f"Connection closed: {e}")
            return False
        
    async def send_authorize(self, id_tag):
        print(f"Authorizing for {id_tag}.")
        request = call.AuthorizePayload(
            id_tag=id_tag
        )
        response = await self.call(request)
        print(f"Received authorize response for {response}.")
        is_authorized = response.id_tag_info.status == AuthorizationStatus.accepted
        print(f"Authorized: {is_authorized}")
        return response

    async def send_start_transaction(self, connector_id, id_tag, meter_start):
        request = call.StartTransactionPayload(
            connector_id=int(connector_id),
            id_tag=id_tag,
            meter_start=int(meter_start),
            timestamp=datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        )
        print(f"Starting transaction for {id_tag}., {connector_id}, {meter_start}, {request.timestamp}")
        try:
            response: call_result.StartTransactionPayload = await self.call(request)

            print(f"Received start transaction response for {response}.")
            print(f"Transaction ID: {response.transaction_id}")
            print(f"Status: {response.id_tag_info}")
            status = response.id_tag_info.get("status")

            if status == AuthorizationStatus.accepted:
                print(f"Authorized for {id_tag} and transaction started.")
                self.transactionId = response.transaction_id
            elif status == AuthorizationStatus.invalid:
                print(f"Invalid authorization for {id_tag}.")
                return
            return status
        except Exception as e:
            print("An error occurred during the start transaction call",e)

    async def send_stop_transaction(self, meter_stop):
        request = call.StopTransactionPayload(
            meter_stop=int(meter_stop),
            timestamp=datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            transaction_id=int(self.transactionId),
            reason = "Local",
        )
        print(f"Stopping transaction for {self.transactionId}., {meter_stop}, {request.timestamp}")
        try:
            response: call_result.StopTransactionPayload = await self.call(request)
            print(f"Received stop transaction response for {response}.")
            return response.id_tag_info.status
        except Exception as e:
            print("An error occurred during the stop transaction call")

    async def send_heartbeat(self):
        print(f"Sending heartbeat for {self.id}.")
        request = call.HeartbeatPayload()
        while True:
            await self.call(request)
            await asyncio.sleep(self.interval)
            print(f"Received heartbeat response for {self.id}.")


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

    async def send_meter_values_loop(self, connector_id, transaction_id, meter_value, increment_value, counter):
        for i in range(counter):
            await self.send_meter_values(connector_id, transaction_id, meter_value)
            meter_value += increment_value
            await asyncio.sleep(1)
        

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
        response: call_result.DataTransferPayload = await self.call(request)
        return response.status

class TextRedirector:
    def __init__(self, widget, tag="stdout"):
        self.widget = widget
        self.tag = tag

    def write(self, str):
        self.widget.insert(tk.END, str, (self.tag,))
        self.widget.see(tk.END)

class OCPPSimulatorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("OCPP Simulator")
        
        self.charge_point: MyChargePoint = None
        self.serials = {
            "OCM-172990": "ZES-Ataşehir",
            "OCM-165195": "EŞARJ-Paladium",
            "OCM-107959": "EŞARJ-Kadiköy",
            "OCM-260427": "POWERSARJ-Doğuş",
            "OCM-165200": "EŞARJ-Optimum",
        }
        self.create_widgets()

        #sys.stdout = TextRedirector(self.console, "stdout")

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
        text = tk.StringVar() 
        text.set("ws://localhost:9210/CP_1") 
        self.central_station_entry = tk.Entry(self.root,textvariable=text)
        self.central_station_entry.pack()

        # Charge Station Serial Number
        charge_station_serial_label = tk.Label(self.root, text="Charge Station Serial Number")
        charge_station_serial_label.pack()
        self.central_station_serial_combobox = ttk.Combobox(self.root, values=[key for key in self.serials])
        self.central_station_serial_combobox.pack()

        # RFID Tag
        rfid_tag_label = tk.Label(self.root, text="RFID Tag")
        rfid_tag_label.pack()
        self.rfid_tag_entry = tk.Entry(self.root)
        self.rfid_tag_entry.pack()

        # Connector uid
        connector_uid_label = tk.Label(self.root, text="Connector uid")
        connector_uid_label.pack()
        self.connector_uid_entry = tk.Entry(self.root)
        self.connector_uid_entry.pack()


        # Meter value
        meter_value_label = tk.Label(self.root, text="Meter value")
        meter_value_label.pack()
        self.meter_value_entry = tk.Entry(self.root)
        self.meter_value_entry.pack()
        

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

        # Connector Status
        self.connector_status_label = tk.Label(self.root, text="Connector Status")
        self.connector_status_label.pack()
        self.connector_status_combobox = ttk.Combobox(self.root, values=["Available", "Preparing", "Charging", "SuspendedEV", "SuspendedEVSE", "Finishing", "Reserved", "Faulted", "Offline"])
        self.connector_status_combobox.pack()

        # Status Notification button
        self.status_notification_button = tk.Button(self.root, text="Status Notification")
        self.status_notification_button.pack()

        # Increment value
        self.increment_value_label = tk.Label(self.root, text="Increment value")
        self.increment_value_label.pack()
        self.increment_value_entry = tk.Entry(self.root)
        self.increment_value_entry.pack()

        # Counter
        self.counter_label = tk.Label(self.root, text="Counter")
        self.counter_label.pack()
        self.counter_entry = tk.Entry(self.root)
        self.counter_entry.pack()

        # Send Meter Values button
        self.send_meter_values_button = tk.Button(self.root, text="Send Meter Values", command=self.send_meter_values)
        self.send_meter_values_button.pack()

        # Send Meter Values loop button
        self.send_meter_values_loop_button = tk.Button(self.root, text="Send Meter Values loop", command=self.send_meter_values_loop)
        self.send_meter_values_loop_button.pack()

        # Console
        self.console = ScrolledText(self.root, state="disabled", height=10, width=80,wrap=tk.WORD)
        self.console.pack(expand=True, fill="both")

        is_connected = False
        is_authorized = False

        # Reset button
        self.reset_button = tk.Button(self.root, text="Reset", command=self.reset_action)
        self.reset_button.pack()

    def log_to_console(self, message, tag=""):
        self.console.config(state="normal")
        self.console.insert(tk.END, f"{message}\n", (tag,))
        self.console.config(state="disabled")
        self.console.see(tk.END)  # Scroll to the end to always show the latest output

    async def create_chargepoint(self, host, serial_number):
        try:
            async with websockets.connect(
                    f'{host}',
                    subprotocols=['ocpp1.6']
            ) as ws:
                cp_id = host.split("/")[-1]
                self.charge_point = MyChargePoint(cp_id, ws)
                await asyncio.gather(self.charge_point.start(), self.charge_point.send_boot_notification(serial_number))
        except Exception as e:
            self.log_to_console(f"Failed to connect: {e}", "error")

    # Actions
    def handle_create_chargepoint_result(self):
        try:
            self.log_to_console("Charge Point registered")
            self.central_station_entry.config(state="disabled")
            self.central_station_serial_combobox.config(state="disabled")
            self.connect_button.config(state="disabled")
            self.log_to_console("Connected to Central Station")
        except Exception as e:
            self.log_to_console(f"An error occurred: {e}", "error")

    def connect_action(self):
        #for thread in threading.enumerate():
        #    print(thread.name)
        host = self.central_station_entry.get()
        serial_number = self.central_station_serial_combobox.get() 
        print(f"Connecting to Central Station as: {host}, {serial_number}")
        try:
            asyncio.run_coroutine_threadsafe(self.create_chargepoint(host,serial_number), asyncio.get_event_loop())
            self.handle_create_chargepoint_result()
        except Exception as e:
            self.log_to_console(f"An error occurred: {e}", "error")


    def handle_authorize_result(self):
        try:
            self.log_to_console("Authorization accepted")
            self.rfid_tag_entry.config(state="disabled")
            self.authorize_button.config(state="disabled")
        except Exception as e:
            self.log_to_console(f"An error occurred: {e}", "error")

    def authorize_action(self):
        tag_value = self.rfid_tag_entry.get()
        self.log_to_console(f"Authorizing with Tag: {tag_value}")

        try:
            asyncio.run_coroutine_threadsafe(self.charge_point.send_authorize(tag_value), asyncio.get_event_loop())
            self.handle_authorize_result()
        except Exception as e:
            self.log_to_console(f"An error occurred: {e}", "error")

    def send_meter_values(self):
        connector_id_value = self.connector_uid_entry.get()
        meter_value_value = self.meter_value_entry.get()
        if connector_id_value == "" or meter_value_value == "":
            self.log_to_console("Please fill in all fields.", "error")
            return
        self.log_to_console(f"Sending Meter Values with Connector ID: {connector_id_value}, Meter Value: {meter_value_value}")

        try:
            task = asyncio.run_coroutine_threadsafe(
                self.charge_point.send_meter_values(connector_id_value, self.charge_point.transactionId, meter_value_value),
                asyncio.get_event_loop()
            )
        except Exception as e:
            self.log_to_console(f"An error occurred: {e}", "error")
    
    def send_meter_values_loop(self):
        connector_id_value = self.connector_uid_entry.get()
        meter_value_value = self.meter_value_entry.get()
        increment_value_value = self.increment_value_entry.get()
        counter_value = self.counter_entry.get()
        if connector_id_value == "" or meter_value_value == "" or increment_value_value == "" or counter_value == "":
            self.log_to_console("Please fill in all fields.", "error")
            return
        self.log_to_console(f"Sending Meter Values with Connector ID: {connector_id_value}, Meter Value: {meter_value_value}, Increment Value: {increment_value_value}, Counter: {counter_value}")

        try:
            task = asyncio.run_coroutine_threadsafe(
                self.charge_point.send_meter_values_loop(connector_id_value, self.charge_point.transactionId, int(meter_value_value), int(increment_value_value), int(counter_value)),
                asyncio.get_event_loop()
            )
        except Exception as e:
            self.log_to_console(f"An error occurred: {e}", "error")

    def start_transaction_action(self):
        connector_id_value = self.connector_uid_entry.get()
        tag_value = self.rfid_tag_entry.get()
        meter_start_value = self.meter_value_entry.get()

        if connector_id_value == "" or meter_start_value == "":
            self.log_to_console("Please fill in all fields.", "error")
            return
        self.log_to_console(f"Trying starting transaction with Connector ID: {connector_id_value}, Meter Start: {meter_start_value}")
        try:
            task = asyncio.run_coroutine_threadsafe(
                self.charge_point.send_start_transaction(connector_id_value, tag_value, meter_start_value),
                asyncio.get_event_loop()

            )
        except Exception as e:
            self.log_to_console(f"An error occurred: {e}", "error")

    def stop_transaction_action(self):
        connector_id_value = self.connector_uid_entry.get()
        tag_value = self.rfid_tag_entry.get()
        meter_stop_value = self.meter_value_entry.get()

        if meter_stop_value == "":
            self.log_to_console("Please fill in all fields.", "error")
            return

        self.log_to_console(f"Stopping transaction with Connector ID: {connector_id_value}, Tag: {tag_value}, Meter Stop: {meter_stop_value}")

        try:
            task = asyncio.run_coroutine_threadsafe(
                self.charge_point.send_stop_transaction(meter_stop_value),
                asyncio.get_event_loop()
            )
        except Exception as e:
            self.log_to_console(f"An error occurred: {e}", "error")
    
    def reset_action(self):
        self.charge_point = None
        self.central_station_entry.config(state="normal")
        self.central_station_serial_combobox.config(state="normal")
        self.connect_button.config(state="normal")
        self.rfid_tag_entry.config(state="normal")
        self.authorize_button.config(state="normal")
        self.connector_uid_entry.config(state="normal")
        self.meter_value_entry.config(state="normal")
        self.start_transaction_button.config(state="normal")
        self.stop_transaction_button.config(state="normal")
        self.increment_value_entry.config(state="normal")
        self.counter_entry.config(state="normal")
        self.send_meter_values_button.config(state="normal")
        self.send_meter_values_loop_button.config(state="normal")
        self.log_to_console("Resetted", "error")


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