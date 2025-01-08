"use client";

import React, { useEffect, useState } from "react";

const HomePage: React.FC = () => {
  const [attendees, setAttendees] = useState<any[]>([]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    if (!isAuthenticated) {
      window.location.href = "/";
    }

    const fetchSheetData = async () => {
      const response = await fetch("/api/sheets");
      if (response.ok) {
        const data = await response.json();
        setAttendees(data.data);
      } else {
        alert("Failed to fetch data from Google Sheets");
      }
    };

    fetchSheetData();
  }, []);

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
