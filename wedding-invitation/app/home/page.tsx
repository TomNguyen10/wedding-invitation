"use client";

import React, { useEffect, useState } from "react";

const HomePage: React.FC = () => {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    if (!isAuthenticated) {
      window.location.href = "/";
    }

    const fetchSheetData = async () => {
      try {
        const response = await fetch("/api/sheets");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setAttendees(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Attendee List</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Sent</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee, index) => (
            <tr key={index}>
              <td>{attendee[0]}</td>
              <td>{attendee[1]}</td>
              <td>{attendee[2]}</td>
              <td>{attendee[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HomePage;
