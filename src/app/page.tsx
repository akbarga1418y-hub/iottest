'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
  const [latestValue, setLatestValue] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Ambil data terbaru
      const latestRes = await fetch('/api/latest');
      if (latestRes.ok) {
        const data = await latestRes.json();
        setLatestValue(data.value);
      }

      // Ambil riwayat
      const historyRes = await fetch('/api/history');
      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);  // Refresh setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  // Data untuk chart (riwayat)
  const chartData = {
    labels: history.map((_, i) => `T${i + 1}`),  // Label sederhana
    datasets: [
      {
        label: 'Data 0/1',
        data: history,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Riwayat Data dari ESP32' },
    },
    scales: {
      y: { min: 0, max: 1, ticks: { stepSize: 1 } },
    },
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Dashboard ESP32 IoT - Data 0/1</h1>
        
        {/* Data Terbaru */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Data Terbaru</h2>
          <div className={`text-6xl font-bold p-4 rounded ${latestValue === 1 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {latestValue ?? 'N/A'}
          </div>
          <p className="mt-2">Status: {latestValue === 1 ? 'ON (1)' : 'OFF (0)'}</p>
          <p className="text-sm text-gray-500">Terakhir update: {new Date().toLocaleTimeString()}</p>
        </div>

        {/* Grafik Riwayat */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Riwayat 10 Data Terakhir</h2>
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}