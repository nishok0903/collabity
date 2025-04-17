import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { Bar, Line } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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
import { useAuth } from "../context/AuthContext";
import { namedQuery } from "firebase/firestore";

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
  const { currentUser } = useAuth();

  const fetchDashboard = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const uid = auth.currentUser.uid;

      const res = await fetch(`/api/faculty/dashboard/${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch dashboard data");

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

  const generatePDF = () => {
    const doc = new jsPDF();

    const { faculty, stats, charts } = data;
    console.log("Faculty Data:", faculty);
    console.log("Statistics:", stats);

    const n = `${faculty.first_name} ${faculty.last_name}`;
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const filename = `Faculty_Dashboard_Report_${n}_${date}.pdf`;

    // Header
    doc.setFontSize(18);
    doc.text("Faculty Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${faculty.first_name} ${faculty.last_name}`, 14, 30);
    doc.text(`Department: ${faculty.department || "N/A"}`, 14, 38);
    doc.text(`Designation: ${faculty.designation || "N/A"}`, 14, 46);

    // Stats Section
    doc.setFontSize(14);
    doc.text("Statistics", 14, 60);

    doc.setFontSize(12);
    doc.text(`Topics Created: ${stats.totalTopics}`, 14, 68);
    doc.text(`Students Involved: ${stats.totalStudents}`, 14, 76);
    doc.text(`Average Rating: ${stats.avgRating}`, 14, 84);

    // Topic Status Table
    if (charts.topicStatus?.length > 0) {
      const tableData = charts.topicStatus.map((row) => [
        row.status.toString(),
        row.count.toString(),
      ]);
      autoTable(doc, {
        startY: 95,
        head: [["Status", "Count"]],
        body: tableData,
      });
    }

    // Save PDF
    doc.save(filename);
  };

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
      <div className="flex items-center justify-between">
        <h1 className="mb-4 text-3xl font-bold">
          Welcome, {faculty.first_name} {faculty.last_name}
        </h1>
        <button
          onClick={generatePDF}
          className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          Download Report
        </button>
      </div>

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
