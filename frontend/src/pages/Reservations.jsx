import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import ReservationTable from "../components/ReservationTable";
import { getReservations, cancelReservation } from "../services/api";
import ReservationModal from "../components/ReservationModal";

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalMode, setModalMode] = useState("BOOK");

  async function loadReservations() {
    try {
      const data = await getReservations();

      setReservations(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleReschedule(reservation) {
    setSelectedReservation(reservation);

    setModalMode("RESCHEDULE");

    setShowModal(true);
  }

  async function handleCancel(reservation) {
    const confirmCancel = window.confirm(
      `Cancel reservation ${reservation.bookingId}?`,
    );

    if (!confirmCancel) return;

    try {
      await cancelReservation(reservation.bookingId.slice(-3));

      await loadReservations();
    } catch (err) {
      console.error(err);

      alert("Unable to cancel reservation.");
    }
  }

  useEffect(() => {
    loadReservations();

    const interval = setInterval(
      loadReservations,

      30000,
    );

    return () => clearInterval(interval);
  }, []);

  const filteredReservations = reservations.filter((reservation) => {
    const query = searchTerm.toLowerCase();

    return (
      reservation.bookingId.toLowerCase().includes(query) ||
      reservation.customerName.toLowerCase().includes(query) ||
      reservation.mobile.toLowerCase().includes(query) ||
      reservation.status.toLowerCase().includes(query)
    );
  });

  return (
    <section className="panel">
      <div className="panel-header flex-col items-start sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Guest Management
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Reservations
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedReservation(null);

            setModalMode("BOOK");

            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          New Reservation
        </button>
      </div>

      <div className="panel-body space-y-5">
        <label className="relative block">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by booking ID, customer, mobile, or status"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
          />
        </label>

        <ReservationTable
          reservations={filteredReservations}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
        />
        <ReservationModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={loadReservations}
          mode={modalMode}
          reservation={selectedReservation}
        />
      </div>
    </section>
  );
}

export default Reservations;
