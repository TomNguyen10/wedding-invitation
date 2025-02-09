"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditIcon } from "lucide-react";
import { TrashIcon } from "lucide-react";
import { Mail } from "lucide-react";
import {
  fetchSheetData,
  handleSaveClick,
  handleAddRow,
  handleDeleteRow,
  handleSendEmail,
  handleEditClick,
} from "../lib/attendeeServices";

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
    attend: "Happily Accepted",
    plusOne: "No",
    note: "",
    role: "normal",
    sent: "False",
    location: "hanoi",
  });

  useEffect(() => {
    Promise.all([
      fetchSheetData("Hanoi", setHanoiAttendees, setError),
      fetchSheetData("Guangzhou", setGuangzhouAttendees, setError),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.error("Error fetching data:", error);
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Attendee List</h1>

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
          <Button
            onClick={() =>
              handleAddRow(
                newAttendee,
                setHanoiAttendees,
                setGuangzhouAttendees,
                setNewAttendee
              )
            }>
            Add Attendee
          </Button>
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
              <th className="border border-gray-300 p-2">Attend</th>
              <th className="border border-gray-300 p-2">Bring Plus One</th>
              <th className="border border-gray-300 p-2">Note</th>
              <th className="border border-gray-300 p-2">Role</th>
              <th className="border border-gray-300 p-2">Send Email</th>
              <th className="border border-gray-300 p-2">Edit</th>
              <th className="border border-gray-300 p-2">Delete</th>
              <th className="border border-gray-300 p-2">Send Email</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(hanoiAttendees) &&
              hanoiAttendees.map((attendee, index) => (
                <tr key={index}>
                  {editIndex?.index === index &&
                  editIndex?.location === "hanoi" ? (
                    <>
                      <td className="border border-gray-300 p-2">
                        <Input
                          value={tempValues[0] ?? ""}
                          onChange={(e) =>
                            setTempValues((prev) => {
                              const newValues = [...prev];
                              newValues[0] = e.target.value;
                              return newValues;
                            })
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Input
                          value={tempValues[1]}
                          onChange={(e) =>
                            setTempValues((prev) => {
                              const newValues = [...prev];
                              newValues[1] = e.target.value;
                              return newValues;
                            })
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <select
                          value={tempValues[2]}
                          onChange={(e) =>
                            setTempValues((prev) => {
                              const newValues = [...prev];
                              newValues[2] = e.target.value;
                              return newValues;
                            })
                          }
                          className="border rounded p-1 w-full">
                          <option value="Happily Accepted">
                            Happily Accepted
                          </option>
                          <option value="Regretfully Declined">
                            Regretfully Declined
                          </option>
                        </select>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <select
                          value={tempValues[3]}
                          onChange={(e) =>
                            setTempValues((prev) => {
                              const newValues = [...prev];
                              newValues[3] = e.target.value;
                              return newValues;
                            })
                          }
                          className="border rounded p-1 w-full">
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Input
                          value={tempValues[4]}
                          onChange={(e) =>
                            setTempValues((prev) => {
                              const newValues = [...prev];
                              newValues[4] = e.target.value;
                              return newValues;
                            })
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <select
                          value={tempValues[5]}
                          onChange={(e) =>
                            setTempValues((prev) => {
                              const newValues = [...prev];
                              newValues[5] = e.target.value;
                              return newValues;
                            })
                          }
                          className="border rounded p-1 w-full">
                          <option value="normal">Normal</option>
                          <option value="bachelor">Bachelor</option>
                          <option value="bachelorette">Bachelorette</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 p-2">
                        {tempValues[6]}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Button
                          onClick={() =>
                            handleSaveClick(
                              editIndex,
                              tempValues,
                              setHanoiAttendees,
                              setGuangzhouAttendees,
                              setEditIndex
                            )
                          }>
                          Save
                        </Button>
                      </td>
                      <td className="border border-gray-300 p-2">
                        {tempValues[8]}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {tempValues[9]}
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
                      <td className="border border-gray-300 p-2">
                        {attendee[4]}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {attendee[5]}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {attendee[6]}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Button
                          onClick={() =>
                            handleEditClick(
                              index,
                              "hanoi",
                              hanoiAttendees,
                              setEditIndex,
                              setTempValues
                            )
                          }>
                          <EditIcon size={16} />
                        </Button>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Button
                          onClick={() =>
                            handleDeleteRow(
                              index,
                              "Hanoi",
                              attendee,
                              setHanoiAttendees,
                              setError
                            )
                          }>
                          <TrashIcon size={16} color="red" />
                        </Button>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Button
                          onClick={() =>
                            handleSendEmail(
                              index,
                              "hanoi",
                              attendee,
                              setHanoiAttendees,
                              setError
                            )
                          }>
                          <Mail size={16} />
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
