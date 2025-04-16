import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
} from "chart.js";
import { auth } from "../firebase"; // Adjust the import path as necessary

// Registering Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
);

const StudentDashboard = ({ studentId }) => {
  const [studentData, setStudentData] = useState(null);
  const [chartData, setChartData] = useState(null);

  // Fetching dashboard data using fetch API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const uid = auth.currentUser.uid;

        const response = await fetch(
          `http://localhost:3000/api/student/dashboard/${uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Dashboard data:", data);
          setStudentData(data);

          // Check if topics exist before trying to reduce them
          if (data.topics && Array.isArray(data.topics)) {
            // Prepare data for the chart (for example, showing topic status distribution)
            const topicStatusCount = data.topics.reduce((acc, topic) => {
              acc[topic.status] = (acc[topic.status] || 0) + 1;
              return acc;
            }, {});

            setChartData({
              labels: Object.keys(topicStatusCount),
              datasets: [
                {
                  label: "Topic Statuses",
                  data: Object.values(topicStatusCount),
                  backgroundColor: "#3b82f6",
                  borderColor: "#2563eb",
                  borderWidth: 1,
                },
              ],
            });
          } else {
            // Handle case where topics data is missing or not an array
            console.warn("No topics data available or invalid format");
          }
        } else {
          console.error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [studentId]);

  if (!studentData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold">
          {studentData.student.first_name} {studentData.student.last_name}'s
          Dashboard
        </h1>
        <p className="text-gray-500">{studentData.student.email}</p>
      </header>

      {/* Stats Section */}
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 text-center shadow-lg">
          <h2 className="text-lg font-medium">Total Topics</h2>
          <p className="text-2xl font-semibold">
            {studentData.topics ? studentData.topics.length : 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 text-center shadow-lg">
          <h2 className="text-lg font-medium">Accepted Topics</h2>
          <p className="text-2xl font-semibold">
            {studentData.topics &&
              studentData.topics.filter((topic) => topic.status === "accepted")
                .length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 text-center shadow-lg">
          <h2 className="text-lg font-medium">Completed Topics</h2>
          <p className="text-2xl font-semibold">
            {studentData.topics &&
              studentData.topics.filter((topic) => topic.status === "completed")
                .length}
          </p>
        </div>
      </section>

      {/* Chart Section */}
      <section className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-medium">Topic Status Distribution</h2>
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Topic Statuses" },
            },
          }}
        />
      </section>
    </div>
  );
};

export default StudentDashboard;
