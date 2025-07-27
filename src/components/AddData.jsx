import React, { useState } from 'react';
import axios from 'axios';

const databaseURL = "https://breath-easy-2-default-rtdb.asia-southeast1.firebasedatabase.app";
const itemsEndpoint = `${databaseURL}/data.json`;

const AirQualityForm = () => {
  const [formData, setFormData] = useState({
    aqi: 10,
    no2: 18,
    temp: 28,
    hum: 60,
    voc: 12,
    co2: 410,
    O3: 30,
    PM25: 15,
    PM10: 35,
    PM1: 10
  });
  const [dataList, setDataList] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleCreate = async (data) => {
    try {
      await axios.post(itemsEndpoint, {
        ...data,
        createdAt: new Date().toISOString(),
      });
      setResponseMessage('Data submitted successfully!');
    } catch (err) {
      console.error("Error adding item:", err);
      setError('Failed to submit data. Please try again.');
    }
  };

  const handleAddData = () => {
    const newData = { ...formData, id: Date.now() };
    setDataList(prev => [...prev, newData]);
    handleCreate(newData);
    setFormData({
      aqi: 10,
      no2: 18,
      temp: 28,
      hum: 60,
      voc: 12,
      co2: 410,
      O3: 30,
      PM25: 15,
      PM10: 35,
      PM1: 10
    });
    setResponseMessage('Data added locally!');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Air Quality Data Input</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">NO₂ (µg/m³)</label>
          <input
            type="number"
            name="no2"
            value={formData.no2}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
          <input
            type="number"
            name="temp"
            value={formData.temp}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">AQI</label>
          <input
            type="number"
            name="aqi"
            value={formData.aqi}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Humidity (%)</label>
          <input
            type="number"
            name="hum"
            value={formData.hum}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">VOC (ppb)</label>
          <input
            type="number"
            name="voc"
            value={formData.voc}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CO₂ (ppm)</label>
          <input
            type="number"
            name="co2"
            value={formData.co2}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">O₃ (µg/m³)</label>
          <input
            type="number"
            name="O3"
            value={formData.O3}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">PM2.5 (µg/m³)</label>
          <input
            type="number"
            name="PM25"
            value={formData.PM25}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">PM10 (µg/m³)</label>
          <input
            type="number"
            name="PM10"
            value={formData.PM10}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">PM1 (µg/m³)</label>
          <input
            type="number"
            name="PM1"
            value={formData.PM1}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            step="0.1"
          />
        </div>
        <button
          onClick={handleAddData}
          className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
        >
          Add and Submit Data
        </button>
        {responseMessage && <p className="text-green-600">{responseMessage}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
      {dataList.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Added Data</h3>
          <ul className="space-y-2">
            {dataList.map(data => (
              <li key={data.id} className="p-2 bg-gray-100 rounded-md">
                NO₂: {data.no2} µg/m³, Temp: {data.temp} °C, Hum: {data.hum}%, 
                VOC: {data.voc} ppb, CO₂: {data.co2} ppm, O₃: {data.O3} µg/m³, 
                PM2.5: {data.PM25} µg/m³, PM10: {data.PM10} µg/m³, PM1: {data.PM1} µg/m³
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AirQualityForm;