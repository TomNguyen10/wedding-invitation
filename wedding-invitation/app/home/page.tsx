"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditIcon } from "lucide-react";
import { TrashIcon } from "lucide-react";
import { FaCheckSquare, FaRegSquare } from "react-icons/fa";

const HomePage: React.FC = () => {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [tempValues, setTempValues] = useState<any[]>([]);
  const [newAttendee, setNewAttendee] = useState({
    name: "",
    email: "",
    role: "normal",
    sent: "No",
  });

  const [checkboxStates, setCheckboxStates] = useState<boolean[]>([]);

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const response = await fetch("/api/sheets");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setAttendees(data.data);
        setCheckboxStates(new Array(data.data.length).fill(false));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setTempValues(attendees[index]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    columnIndex: number
  ) => {
    const updatedValues = [...tempValues];
    updatedValues[columnIndex] = e.target.value;
    setTempValues(updatedValues);
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    columnIndex: number
  ) => {
    const updatedValues = [...tempValues];
    updatedValues[columnIndex] = e.target.value;
    setTempValues(updatedValues);
  };

  const handleSaveClick = async () => {
    try {
      await fetch("/api/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rowIndex: editIndex, values: tempValues }),
      });
      setAttendees((prev) => {
        const newAttendees = [...prev];
        newAttendees[editIndex!] = tempValues;
        return newAttendees;
      });
      alert("Update successful!");
    } catch (err) {
      alert("Failed to update data.");
      console.error(err);
    } finally {
      setEditIndex(null);
    }
  };

  const handleAddRow = async () => {
    if (!newAttendee.name.trim()) {
      alert("Name cannot be empty.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newAttendee.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const newRow = [
        newAttendee.name,
        newAttendee.email,
        newAttendee.role,
        newAttendee.sent,
      ];

      await fetch("/api/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rowIndex: attendees.length, values: newRow }),
      });

      setAttendees((prev) => [...prev, newRow]);
      alert("New attendee added!");

      setNewAttendee({ name: "", email: "", role: "normal", sent: "No" });
      setCheckboxStates((prev) => [...prev, false]);
    } catch (err) {
      alert("Failed to add attendee.");
      console.error(err);
    }
  };

  const handleDeleteRow = async (index: number) => {
    if (!confirm("Are you sure you want to delete this attendee?")) return;

    try {
      await fetch("/api/sheets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rowIndex: index }),
      });

      setAttendees((prev) => prev.filter((_, i) => i !== index));
      setCheckboxStates((prev) => prev.filter((_, i) => i !== index));

      alert("Attendee deleted!");
    } catch (err) {
      alert("Failed to delete attendee.");
      console.error(err);
    }
  };

  const handleCheckboxToggle = (index: number) => {
    setCheckboxStates((prev) =>
      prev.map((checked, i) => (i === index ? !checked : checked))
    );
  };

  const handleSendEmail = async (index: number, email: string) => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to send email");

      // Update the "sent" status in Google Sheets
      const updatedAttendees = [...attendees];
      updatedAttendees[index][3] = "Yes";
      setAttendees(updatedAttendees);

      await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowIndex: index,
          values: updatedAttendees[index],
        }),
      });

      alert("Email sent successfully!");
    } catch (err) {
      alert("Failed to send email.");
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Attendee List</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Add New Attendee</h2>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Name"
            value={newAttendee.name}
            onChange={(e) =>
              setNewAttendee({ ...newAttendee, name: e.target.value })
            }
          />
          <Input
            type="email"
            placeholder="Email"
            value={newAttendee.email}
            onChange={(e) =>
              setNewAttendee({ ...newAttendee, email: e.target.value })
            }
          />
          <select
            value={newAttendee.role}
            onChange={(e) =>
              setNewAttendee({ ...newAttendee, role: e.target.value })
            }
            className="border rounded p-2">
            <option value="normal">Normal</option>
            <option value="bachelor">Bachelor</option>
            <option value="bachelorette">Bachelorette</option>
          </select>
          <Button onClick={handleAddRow}>Add Attendee</Button>
        </div>
      </div>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Role</th>
            <th className="border border-gray-300 p-2">Sent</th>
            <th className="border border-gray-300 p-2">Actions</th>
            <th className="border border-gray-300 p-2">Checkbox</th>{" "}
            <th className="border border-gray-300 p-2">Send Email</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee, index) => (
            <tr key={index}>
              {editIndex === index ? (
                <>
                  <td className="border border-gray-300 p-2">
                    <Input
                      type="text"
                      value={tempValues[0]}
                      onChange={(e) => handleInputChange(e, 0)}
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      type="email"
                      value={tempValues[1]}
                      onChange={(e) => handleInputChange(e, 1)}
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <select
                      value={tempValues[2]}
                      onChange={(e) => handleSelectChange(e, 2)}
                      className="border rounded p-1">
                      <option value="normal">Normal</option>
                      <option value="bachelor">Bachelor</option>
                      <option value="bachelorette">Bachelorette</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 p-2">
                    {tempValues[3]}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Button onClick={handleSaveClick}>Save</Button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border border-gray-300 p-2">{attendee[0]}</td>
                  <td className="border border-gray-300 p-2">{attendee[1]}</td>
                  <td className="border border-gray-300 p-2">{attendee[2]}</td>
                  <td className="border border-gray-300 p-2">{attendee[3]}</td>

                  <td className="border border-gray-300 p-2 text-center">
                    <Button
                      onClick={() => handleEditClick(index)}
                      variant={"outline"}>
                      <EditIcon size={16} />
                    </Button>{" "}
                    <Button
                      onClick={() => handleDeleteRow(index)}
                      variant={"destructive"}>
                      <TrashIcon size={16} />
                    </Button>{" "}
                  </td>

                  <td className="border border-gray-300 p-2 text-center">
                    <Button
                      onClick={() => handleSendEmail(index, attendee[1])}
                      disabled={attendee[3] === "Yes"}>
                      {attendee[3] === "Yes" ? "Sent" : "Send Email"}
                    </Button>
                  </td>

                  <td className="border border-gray-300 p-2 text-center">
                    {checkboxStates[index] ? (
                      <FaCheckSquare
                        onClick={() => handleCheckboxToggle(index)}
                        className="text-green-500 cursor-pointer"
                      />
                    ) : (
                      <FaRegSquare
                        onClick={() => handleCheckboxToggle(index)}
                        className="cursor-pointer"
                      />
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HomePage;
