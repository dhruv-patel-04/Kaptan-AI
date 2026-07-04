const statusClasses = {
  CONFIRMED: "bg-blue-50 text-blue-700",
  Seated: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

function ReservationTable({ reservations, onReschedule, onCancel }) {
  const isCancelled = (reservation) => reservation.status === "CANCELLED";
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <th className="px-4 py-4 sm:px-6">Booking ID</th>
              <th className="px-4 py-4 sm:px-6">Customer</th>
              <th className="px-4 py-4 sm:px-6">Mobile</th>
              <th className="px-4 py-4 sm:px-6">Time</th>
              <th className="px-4 py-4 sm:px-6">Persons</th>
              <th className="px-4 py-4 sm:px-6">Tables</th>
              <th className="px-4 py-4 sm:px-6">Status</th>
              <th className="px-4 py-4 sm:px-6">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {reservations.map((reservation) => (
              <tr key={reservation.bookingId} className="align-top">
                <td className="px-4 py-4 text-sm font-semibold text-slate-900 sm:px-6">
                  {reservation.bookingId}
                </td>
                <td className="px-4 py-4 text-sm text-slate-700 sm:px-6">
                  {reservation.customerName}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 sm:px-6">
                  {reservation.mobile}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 sm:px-6">
                  {reservation.slot}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 sm:px-6">
                  {reservation.persons}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 sm:px-6">
                  {reservation.tablesAllocated.join(", ")}
                </td>
                <td className="px-4 py-4 sm:px-6">
                  <span
                    className={`status-badge ${statusClasses[reservation.status] || "bg-slate-100 text-slate-700"}`}
                  >
                    {reservation.status}
                  </span>
                </td>
                <td className="px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isCancelled(reservation)}
                      onClick={() => onReschedule(reservation)}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition
    ${
      isCancelled(reservation)
        ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
        : "border border-slate-200 text-slate-700 hover:border-blue-200 hover:text-blue-600"
    }`}
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      disabled={isCancelled(reservation)}
                      onClick={() => onCancel(reservation)}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition
    ${
      isCancelled(reservation)
        ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
        : "border border-rose-200 text-rose-600 hover:bg-rose-50"
    }`}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReservationTable;
