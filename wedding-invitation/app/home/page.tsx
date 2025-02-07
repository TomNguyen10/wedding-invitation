"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditIcon } from "lucide-react";
import { TrashIcon } from "lucide-react";

const HomePage: React.FC = () => {
  const [hanoiAttendees, setHanoiAttendees] = useState<any[]>([]);
  const [guangzhouAttendees, setGuangzhouAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<{
    index: number;
    location: string;
  } | null>(null);
  const [newAttendee, setNewAttendee] = useState({
    name: "",
    email: "",
    role: "normal",
    sent: "No",
    location: "",
  });

  useEffect(() => {
    const fetchSheetData = async (sheet: string, setter: Function) => {
      try {
        const response = await fetch(`/api/sheets?sheet=${sheet}`);
        if (!response.ok) throw new Error(`Failed to fetch ${sheet} data`);
        const data = await response.json();
        setter(data.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    Promise.all([
      fetchSheetData("Hanoi", setHanoiAttendees),
      fetchSheetData("Guangzhou", setGuangzhouAttendees),
    ]).finally(() => setLoading(false));
  }, []);

  const handleEditClick = (index: number, location: string) => {
    setEditIndex({ index, location });
    setTempValues(
      location === "hanoi" ? hanoiAttendees[index] : guangzhouAttendees[index]
    );
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
    if (!editIndex) return;

    try {
      await fetch("/api/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rowIndex: editIndex.index,
          values: tempValues,
          location: editIndex.location,
        }),
      });

      if (editIndex.location === "hanoi") {
        setHanoiAttendees((prev) => {
          const newAttendees = [...prev];
          newAttendees[editIndex.index] = tempValues;
          return newAttendees;
        });
      } else {
        setGuangzhouAttendees((prev) => {
          const newAttendees = [...prev];
          newAttendees[editIndex.index] = tempValues;
          return newAttendees;
        });
      }
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
        body: JSON.stringify({
          rowIndex:
            newAttendee.location === "hanoi"
              ? hanoiAttendees.length
              : guangzhouAttendees.length,
          values: newRow,
          location: newAttendee.location,
        }),
      });

      if (newAttendee.location === "hanoi") {
        setHanoiAttendees((prev) => [...prev, newRow]);
      } else {
        setGuangzhouAttendees((prev) => [...prev, newRow]);
      }

      alert("New attendee added!");
      setNewAttendee({
        name: "",
        email: "",
        role: "normal",
        sent: "No",
        location: "hanoi",
      });
    } catch (err) {
      alert("Failed to add attendee.");
      console.error(err);
    }
  };

  const handleDeleteRow = async (index: number, location: string) => {
    if (!confirm("Are you sure you want to delete this attendee?")) return;

    try {
      await fetch("/api/sheets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rowIndex: index, location }),
      });

      if (location === "hanoi") {
        setHanoiAttendees((prev) => prev.filter((_, i) => i !== index));
      } else {
        setGuangzhouAttendees((prev) => prev.filter((_, i) => i !== index));
      }

      alert("Attendee deleted!");
    } catch (err) {
      alert("Failed to delete attendee.");
      console.error(err);
    }
  };

  const handleSendEmail = async (
    index: number,
    email: string,
    sheetType: "hanoi" | "guangzhou"
  ) => {
    try {
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Your Subject",
          message: "Your Message",
        }),
      });

      if (!emailResponse.ok) {
        const emailData = await emailResponse.json();
        throw new Error(emailData.message || "Failed to send email");
      }

      const emailData = await emailResponse.json();
      alert(emailData.message);

      const updatedAttendees =
        sheetType === "hanoi" ? [...hanoiAttendees] : [...guangzhouAttendees];
      updatedAttendees[index][3] = "Yes";

      if (sheetType === "hanoi") {
        setHanoiAttendees([...updatedAttendees]);
      } else {
        setGuangzhouAttendees([...updatedAttendees]);
      }

      const sheetsResponse = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowIndex: index,
          values: updatedAttendees[index],
          sheetType,
        }),
      });

      const sheetsData = await sheetsResponse.json();
      if (!sheetsResponse.ok) {
        throw new Error(sheetsData.message || "Failed to update Google Sheets");
      }

      alert("Email sent and attendee updated!");
    } catch (err: any) {
      console.error("Error:", err.message);
      alert(`Failed to send email: ${err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Attendee List</h1>

      {/* Add New Attendee Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Attendee</h2>
        <div className="flex gap-2 flex-wrap">
          <Input
            type="text"
            placeholder="Name"
            className="flex-1 min-w-[200px]"
            value={newAttendee.name}
            onChange={(e) =>
              setNewAttendee({ ...newAttendee, name: e.target.value })
            }
          />
          <Input
            type="email"
            placeholder="Email"
            className="flex-1 min-w-[200px]"
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
            className="border rounded p-2 h-10">
            <option value="normal">Normal</option>
            <option value="bachelor">Bachelor</option>
            <option value="bachelorette">Bachelorette</option>
          </select>
          <select
            value={newAttendee.location}
            onChange={(e) =>
              setNewAttendee({ ...newAttendee, location: e.target.value })
            }
            className="border rounded p-2 h-10">
            <option value="hanoi">Hanoi</option>
            <option value="guangzhou">Guangzhou</option>
          </select>
          <Button onClick={handleAddRow}>Add Attendee</Button>
        </div>
      </div>

      {/* Hanoi Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Hanoi Attendees</h2>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Name</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Role</th>
              <th className="border border-gray-300 p-2">Sent</th>
              <th className="border border-gray-300 p-2">Actions</th>
              <th className="border border-gray-300 p-2">Send Email</th>
            </tr>
          </thead>
          <tbody>
            {hanoiAttendees.map((attendee, index) => (
              <tr key={index}>
                {editIndex?.index === index &&
                editIndex?.location === "hanoi" ? (
                  <>
                    <td className="border border-gray-300 p-2">
                      <Input
                        value={tempValues[0]}
                        onChange={(e) => handleInputChange(e, 0)}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input
                        value={tempValues[1]}
                        onChange={(e) => handleInputChange(e, 1)}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        value={tempValues[2]}
                        onChange={(e) => handleSelectChange(e, 2)}
                        className="border rounded p-1 w-full">
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
                    <td className="border border-gray-300 p-2">
                      {attendee[0]}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {attendee[1]}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {attendee[2]}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {attendee[3]}
                    </td>
                    <td className="border border-gray-300 p-2 space-x-2">
                      <Button
                        onClick={() => handleEditClick(index, "hanoi")}
                        variant="outline"
                        size="sm">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteRow(index, "hanoi")}
                        variant="destructive"
                        size="sm">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Button
                        onClick={() =>
                          handleSendEmail(index, attendee[1], "hanoi")
                        }
                        disabled={attendee[3] === "Yes"}>
                        {attendee[3] === "Yes" ? "Sent" : "Send"}
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Separator */}
      <div className="my-8 border-t-2 border-gray-200" />

      {/* Guangzhou Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Guangzhou Attendees</h2>
        <table className="min-w-full border-collapse border border-gray-300">
          {/* Similar structure as Hanoi table */}
          <tbody>
            {guangzhouAttendees.map((attendee, index) => (
              <tr key={index}>
                {editIndex?.index === index &&
                editIndex?.location === "guangzhou" ? (
                  // Edit mode fields same as Hanoi table
                  <>
                    <td className="border border-gray-300 p-2">
                      <Input
                        value={tempValues[0]}
                        onChange={(e) => handleInputChange(e, 0)}
                      />
                    </td>
                    {/* ... other editable fields ... */}
                    <td className="border border-gray-300 p-2">
                      <Button onClick={handleSaveClick}>Save</Button>
                    </td>
                  </>
                ) : (
                  // Display mode fields
                  <>
                    <td className="border border-gray-300 p-2">
                      {attendee[0]}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {attendee[1]}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {attendee[2]}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {attendee[3]}
                    </td>
                    <td className="border border-gray-300 p-2 space-x-2">
                      <Button
                        onClick={() => handleEditClick(index, "guangzhou")}
                        variant="outline"
                        size="sm">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteRow(index, "guangzhou")}
                        variant="destructive"
                        size="sm">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Button
                        onClick={() =>
                          handleSendEmail(index, attendee[1], "guangzhou")
                        }
                        disabled={attendee[3] === "Yes"}>
                        {attendee[3] === "Yes" ? "Sent" : "Send"}
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomePage;
