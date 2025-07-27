import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip, 
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // For date handling
import zoomPlugin from 'chartjs-plugin-zoom';

// Register Chart.js components and plugins
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

// Mock function to simulate fetching weather data and compute daily averages
const fetchWeatherData = () => {
  const now = new Date();
  const dataPoints = [];
  // Generate mock data for the last 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0); // Set to start of day
    // Simulate daily average temperature (based on 5-min data)
    const dailyTemps = Array.from({ length: 288 }, (_, j) => 
      20 + Math.sin((i * 288 + j) / 10) * 5 + Math.random() * 2
    ); // 288 points per day (5-min intervals)
    const avgTemp = dailyTemps.reduce((sum, temp) => sum + temp, 0) / dailyTemps.length;
    dataPoints.push({ x: date, y: avgTemp });
  }
  return dataPoints;
};

const WeatherGraph = () => {
  const [weatherData, setWeatherData] = useState(fetchWeatherData());

  // Update data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setWeatherData(fetchWeatherData());
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Chart.js data configuration
  const data = {
    datasets: [
      {
        label: 'Average Daily Temperature (°C)',
        data: weatherData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // Chart.js options with zoom and date scale
  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day', // Display dates
          displayFormats: {
            day: 'MMM d, yyyy', // Format as "Jan 1, 2025"
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Average Temperature (°C)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Average Weather Data (Temperature)',
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true, // Enable zoom with mouse wheel
          },
          pinch: {
            enabled: true, // Enable zoom with pinch gestures
          },
          mode: 'x', // Zoom only on x-axis (date)
        },
        pan: {
          enabled: true,
          mode: 'x', // Pan only on x-axis
        },
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <Line data={data} options={options} />
      <p className="text-center text-gray-600 mt-4">
        Use mouse wheel or pinch to zoom, drag to pan
      </p>
    </div>
  );
};

export default WeatherGraph;