export const DATETIME_FORMAT = "MMM DD, YYYY, hh:mm A";

export const EVENT_NAMES = {
  status_notification: "StatusNotification",
  lost_connection: "lost_connection",
  heartbeat: "Heartbeat",
  start_transaction: "StartTransaction",
  stop_transaction: "StopTransaction",
};

export const STATION_STATUS = {
  available: "Available",
  unavailable: "Unavailable",
  faulted: "Faulted",
};

export const TRANSACTION_STATUS = {
  completed: "completed",
  in_progress: "in progress",
};

export const STATION_STATUS_COLOR = {
  available: "#0ee018",
  unavailable: "#7e817d",
  faulted: "#DC184CFF",
};

export const TRANSACTION_STATUS_COLOR = {
  in_progress: "#0ee018",
  completed: "#7e817d",
};
