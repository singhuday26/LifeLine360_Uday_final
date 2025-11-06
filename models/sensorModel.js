import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  pm25: Number,
  gas: Number,
  timestamp: { type: Date, default: Date.now },
});

const Sensor = mongoose.model("Sensor", sensorSchema);
export default Sensor;
