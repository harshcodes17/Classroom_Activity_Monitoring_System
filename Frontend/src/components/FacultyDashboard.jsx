import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const FacultyDashboard = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 45,
    alertsToday: 0,
    avgAttention: 82,
  });

  const dummyEvents = [
    { student_id: "S101", status: "Attentive", confidence: 0.91 },
    { student_id: "S104", status: "Using Phone", confidence: 0.95 },
    { student_id: "S112", status: "Sleeping", confidence: 0.87 },
    { student_id: "S117", status: "Attentive", confidence: 0.93 },
    { student_id: "S125", status: "Using Phone", confidence: 0.90 },
  ];

  const COLORS = ["#00C49F", "#FF8042", "#FFBB28"];

  const getColor = (status) => {
    if (status === "Attentive") return "bg-green-100 text-green-700";
    if (status === "Using Phone") return "bg-red-100 text-red-700";
    if (status === "Sleeping") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100";
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvent =
        dummyEvents[Math.floor(Math.random() * dummyEvents.length)];
      const timestamp = new Date().toLocaleTimeString();
      const newEvent = { ...randomEvent, timestamp };
      setEvents((prev) => [newEvent, ...prev.slice(0, 8)]);

      // show alert if distracted
      if (randomEvent.status !== "Attentive") {
        toast.warn(
          `⚠️ Student ${randomEvent.student_id} detected ${randomEvent.status} (${(
            randomEvent.confidence * 100
          ).toFixed(1)}%)`
        );
        setStats((prev) => ({
          ...prev,
          alertsToday: prev.alertsToday + 1,
        }));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const chartData = [
    {
      name: "Attentive",
      value: events.filter((e) => e.status === "Attentive").length || 10,
    },
    {
      name: "Using Phone",
      value: events.filter((e) => e.status === "Using Phone").length || 5,
    },
    {
      name: "Sleeping",
      value: events.filter((e) => e.status === "Sleeping").length || 3,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-900">CAMS Dashboard</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow">
          Logout
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 shadow rounded-xl text-center">
          <h2 className="text-gray-600">Total Students Monitored</h2>
          <p className="text-3xl font-bold text-indigo-700">
            {stats.totalStudents}
          </p>
        </div>
        <div className="bg-white p-5 shadow rounded-xl text-center">
          <h2 className="text-gray-600">Distraction Alerts Today</h2>
          <p className="text-3xl font-bold text-red-600">{stats.alertsToday}</p>
        </div>
        <div className="bg-white p-5 shadow rounded-xl text-center">
          <h2 className="text-gray-600">Average Attention</h2>
          <p className="text-3xl font-bold text-green-600">
            {stats.avgAttention}%
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Live Feed */}
        <div className="col-span-2 bg-white p-5 shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-3">Live Activity Feed</h2>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-2">Student ID</th>
                <th className="p-2">Status</th>
                <th className="p-2">Confidence</th>
                <th className="p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{e.student_id}</td>
                  <td className={`p-2 font-medium ${getColor(e.status)}`}>
                    {e.status}
                  </td>
                  <td className="p-2">{(e.confidence * 100).toFixed(1)}%</td>
                  <td className="p-2">{e.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Analytics */}
        <div className="bg-white p-5 shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-3">Live Analytics</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Generation */}
      <div className="mt-8 bg-white p-5 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-3">Report Generation</h2>
        <div className="flex gap-4 items-center">
          <select className="border p-2 rounded">
            <option>Faculty-wise</option>
            <option>Department-wise</option>
          </select>
          <select className="border p-2 rounded">
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Semester</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
