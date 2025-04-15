import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const FacultyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const uid = auth.currentUser.uid;

      const res = await fetch(
        `http://localhost:5000/api/faculty/dashboard/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  const { faculty, stats, charts } = data;

  const statusChartData = {
    labels: charts.topicStatus.map((row) => row.status),
    datasets: [
      {
        label: "Topics by Status",
        backgroundColor: "#3B82F6",
        borderRadius: 6,
        data: charts.topicStatus.map((row) => row.count),
      },
    ],
  };

  const creationChartData = {
    labels: charts.topicCreation.map((row) => row.month),
    datasets: [
      {
        label: "Topics Created",
        fill: false,
        borderColor: "#10B981",
        backgroundColor: "#6EE7B7",
        data: charts.topicCreation.map((row) => row.count),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-4 text-3xl font-bold">
        Welcome, {faculty.first_name} {faculty.last_name}
      </h1>

      <div className="mb-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <p className="text-sm text-gray-600">Topics Created</p>
          <p className="text-2xl font-semibold">{stats.totalTopics}</p>
        </div>
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <p className="text-sm text-gray-600">Students Involved</p>
          <p className="text-2xl font-semibold">{stats.totalStudents}</p>
        </div>
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <p className="text-sm text-gray-600">⭐ Avg. Rating</p>
          <p className="text-2xl font-semibold">{stats.avgRating}</p>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium">Topic Status Overview</h2>
          <Bar data={statusChartData} />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium">Topics Created Over Time</h2>
          <Line data={creationChartData} />
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
