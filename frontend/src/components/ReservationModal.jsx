import { useState } from "react";
import { bookReservation } from "../services/api";
import { useEffect } from "react";
import { rescheduleReservation } from "../services/api";

function ReservationModal({
  open,
  onClose,
  onSuccess,
  mode = "BOOK",
  reservation = null,
}) {
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [persons, setPersons] = useState(2);
  const [slot, setSlot] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "BOOK") {
      setCustomerName("");

      setMobile("");

      setPersons(2);

      setSlot("18:00");

      return;
    }

    if (!reservation) return;

    setCustomerName(reservation.customerName);

    setMobile(reservation.mobile);

    setPersons(reservation.persons);

    setSlot(reservation.slot);
  }, [reservation, mode]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      if (mode === "BOOK") {
        await bookReservation({
          customerName,

          mobile,

          persons,

          slot,
        });
      } else {
        await rescheduleReservation({
          last3: reservation.bookingId.slice(-3),

          newSlot: slot,
        });
      }

      await onSuccess();

      onClose();

      setCustomerName("");

      setMobile("");

      setPersons(2);

      setSlot("18:00");
    } catch (err) {
      alert("Booking failed");

      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function generateTimeSlots() {
    const slots = [];

    for (let h = 18; h <= 22; h++) {
      slots.push(`${h}:00`);

      if (h !== 22) slots.push(`${h}:30`);
    }

    return slots;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold">
          {mode === "BOOK" ? "New Reservation" : "Reschedule Reservation"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded border p-2"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />

          <input
            className="w-full rounded border p-2"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />

          <input
            className="w-full rounded border p-2"
            type="number"
            placeholder="Persons"
            value={persons}
            onChange={(e) => setPersons(e.target.value)}
            required
          />

          <select
            className="w-full rounded border p-2"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
          >
            {generateTimeSlots().map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              {loading
                ? mode === "BOOK"
                  ? "Booking..."
                  : "Saving..."
                : mode === "BOOK"
                  ? "Book"
                  : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservationModal;
