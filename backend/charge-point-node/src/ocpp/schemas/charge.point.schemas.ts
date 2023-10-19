
import { Schema, model } from 'mongoose';

enum ChargePointStatus {
  available = 'available',
  occupied = 'occupied',
  unavailable = 'unavailable',
}

const AccountSchema = new Schema({
  name: { type: String, required: true, unique: true },
  locations: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
});

const LocationSchema = new Schema({
  name: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  address1: { type: String, required: true },
  address2: { type: String },
  comment: { type: String },
  charge_points: [{ type: Schema.Types.ObjectId, ref: 'ChargePoint' }],
  account_id: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
});

const ChargePointSchema = new Schema({
  description: { type: String },
  status: { type: String, enum: Object.values(ChargePointStatus), default: ChargePointStatus.unavailable },
  manufacturer: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  serial_number: { type: String, required: true, unique: true },
  comment: { type: String },
  model: { type: String, required: true },
  password: { type: String },
  connectors: { type: Schema.Types.Mixed, default: {} },
  location_id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
});

const TransactionSchema = new Schema({
  city: { type: String, required: true },
  vehicle: { type: String, required: true },
  address: { type: String, required: true },
  meter_start: { type: Number, required: true },
  meter_stop: { type: Number },
  charge_point: { type: String, required: true },
  transaction_id: { type: Number, required: true, unique: true },
  account_id: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
});

const Account = model('Account', AccountSchema);
const Location = model('Location', LocationSchema);
const ChargePoint = model('ChargePoint', ChargePointSchema);
const Transaction = model('Transaction', TransactionSchema);

export { Account, Location, ChargePoint, Transaction };
