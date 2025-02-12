export const fetchSheetData = async (
  sheet: string,
  setter: Function,
  setError: Function
) => {
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

export const handleSaveClick = async (
  editIndex: { index: number; location: string } | null,
  tempValues: any[],
  setHanoiAttendees: Function,
  setGuangzhouAttendees: Function,
  setEditIndex: Function
) => {
  if (!editIndex) return;

  const sheetName = editIndex.location === "hanoi" ? "Hanoi" : "Guangzhou";

  try {
    await fetch("/api/sheets", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rowIndex: editIndex.index,
        values: tempValues,
        sheet: sheetName,
      }),
    });

    if (editIndex.location === "hanoi") {
      setHanoiAttendees((prev: any[]) => {
        const newAttendees = [...prev];
        newAttendees[editIndex.index] = tempValues;
        return newAttendees;
      });
    } else {
      setGuangzhouAttendees((prev: any[]) => {
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

export const handleEditClick = (
  index: number,
  location: string,
  attendees: any[],
  setEditIndex: Function,
  setTempValues: Function
) => {
  const selectedAttendee = [...attendees[index]];
  setTempValues(selectedAttendee);
  setEditIndex({ index, location });
};

export const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  columnIndex: number,
  tempValues: any[],
  setTempValues: Function
) => {
  const updatedValues = [...tempValues];
  updatedValues[columnIndex] = e.target.value;
  setTempValues(updatedValues);
};

export const handleSelectChange = (
  e: React.ChangeEvent<HTMLSelectElement>,
  columnIndex: number,
  tempValues: any[],
  setTempValues: Function
) => {
  const updatedValues = [...tempValues];
  updatedValues[columnIndex] = e.target.value;
  setTempValues(updatedValues);
};

export const handleAddRow = async (
  newAttendee: any,
  setHanoiAttendees: Function,
  setGuangzhouAttendees: Function,
  setNewAttendee: Function
) => {
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
      newAttendee.attend,
      newAttendee.plusOne,
      newAttendee.note,
      newAttendee.role,
      newAttendee.sent,
    ];

    await fetch("/api/sheets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: newRow,
        sheet: newAttendee.location === "hanoi" ? "Hanoi" : "Guangzhou",
      }),
    });

    if (newAttendee.location === "hanoi") {
      setHanoiAttendees((prev: any[]) =>
        Array.isArray(prev) ? [...prev, newRow] : [newRow]
      );
    } else {
      setGuangzhouAttendees((prev: any[]) =>
        Array.isArray(prev) ? [...prev, newRow] : [newRow]
      );
    }

    alert("New attendee added!");
    setNewAttendee({
      name: "",
      email: "",
      attend: "Happily Accepted",
      plusOne: "No",
      note: "",
      role: "normal",
      sent: "No",
      location: "hanoi",
    });
  } catch (err) {
    alert("Failed to add attendee.");
    console.error(err);
  }
};

export const handleDeleteRow = async (
  index: number,
  location: string,
  setHanoiAttendees: Function,
  setGuangzhouAttendees: Function,
  setError: Function
) => {
  if (!confirm("Are you sure you want to delete this attendee?")) return;

  if (location === "hanoi") {
    setHanoiAttendees((prev: any[]) => prev.filter((_, i) => i !== index));
  } else {
    setGuangzhouAttendees((prev: any[]) => prev.filter((_, i) => i !== index));
  }

  try {
    const response = await fetch("/api/sheets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowIndex: index, sheet: location }),
    });

    if (!response.ok) throw new Error("Failed to delete row");

    fetchSheetData(
      location,
      location === "hanoi" ? setHanoiAttendees : setGuangzhouAttendees,
      setError
    );
  } catch (error: any) {
    console.error("Error deleting row:", error);
    setError(error.message);
    alert("Failed to delete row. Please check the console for error details.");
  }
};

export const handleSendEmail = async (
  index: number,
  email: string,
  sheetType: "hanoi" | "guangzhou",
  setHanoiAttendees: Function,
  setGuangzhouAttendees: Function
) => {
  try {
    const emailResponse = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: "Wedding Invitation",
        message: "Hello, you are invited to our wedding!",
      }),
    });

    if (!emailResponse.ok) {
      const emailData = await emailResponse.json();
      throw new Error(emailData.message || "Failed to send email");
    }

    alert("Email sent successfully!");

    let currentAttendees: any[] = [];
    if (sheetType === "hanoi") {
      setHanoiAttendees((prev: any[]) => {
        currentAttendees = [...prev];
        return prev;
      });
    } else {
      setGuangzhouAttendees((prev: any[]) => {
        currentAttendees = [...prev];
        return prev;
      });
    }
    const updatedAttendees = currentAttendees;
    if (!updatedAttendees[index]) {
      console.error(`Error: No attendee found at index ${index}`);
      return;
    }
    updatedAttendees[index][3] = "Yes";

    if (sheetType === "hanoi") {
      setHanoiAttendees([...updatedAttendees]);
    } else {
      setGuangzhouAttendees([...updatedAttendees]);
    }

    await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rowIndex: index,
        values: updatedAttendees[index],
        sheetType,
      }),
    });

    alert("Email sent and attendee updated!");
  } catch (err: any) {
    console.error("Error:", err.message);
    alert(`Failed to send email: ${err.message}`);
  }
};
