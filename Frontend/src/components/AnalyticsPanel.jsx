import React, { useEffect, useState } from "react";
import { fetchAnalyticsSummary } from "../api/analytics";

const AnalyticsPanel = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchAnalyticsSummary();
        if (active) setData(res);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-5 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-3">Analytics</h2>
        <p>Loading analytics...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-white p-5 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-3">Analytics</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  if (!data) return null;

  const { overall, per_prn } = data;

  return (
    <div className="bg-white p-5 shadow rounded-xl">
      <h2 className="text-xl font-semibold mb-3">Class Attention Analytics</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-gray-600">Attentive Count</div>
          <div className="text-2xl font-bold text-green-700">{overall.attentive_count}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-gray-600">Non-Attentive Count</div>
          <div className="text-2xl font-bold text-red-700">{overall.non_attentive_count}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-gray-600">Avg Attentive Confidence</div>
          <div className="text-xl font-semibold">{(overall.avg_attentive_conf * 100).toFixed(1)}%</div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-gray-600">Avg Non-Attentive Confidence</div>
          <div className="text-xl font-semibold">{(overall.avg_non_attentive_conf * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="overflow-auto max-h-72 border rounded">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2">PRN</th>
              <th className="p-2">Attentive</th>
              <th className="p-2">Non-Attentive</th>
              <th className="p-2">Avg Att Conf</th>
              <th className="p-2">Avg Non Conf</th>
              <th className="p-2">Samples</th>
            </tr>
          </thead>
          <tbody>
            {(per_prn || []).map((row, i) => (
              <tr key={i} className="border-b">
                <td className="p-2 font-mono">{row.prn}</td>
                <td className="p-2 text-green-700">{row.attentive_count}</td>
                <td className="p-2 text-red-700">{row.non_attentive_count}</td>
                <td className="p-2">{(row.avg_attentive_conf * 100).toFixed(1)}%</td>
                <td className="p-2">{(row.avg_non_attentive_conf * 100).toFixed(1)}%</td>
                <td className="p-2">{row.samples}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
