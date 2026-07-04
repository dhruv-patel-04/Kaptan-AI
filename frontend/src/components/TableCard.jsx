function TableCard({ table }) {
  return (
    <article className="panel p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            {table.tableId}
          </p>

          <h3 className="mt-2 text-xl font-semibold">{table.tableType}</h3>
        </div>
      </div>

      <dl className="mt-6 space-y-3">
        <div>
          <dt className="text-sm text-slate-500">Capacity</dt>

          <dd className="font-medium">{table.capacity}</dd>
        </div>

        <div>
          <dt className="text-sm text-slate-500">Ideal For</dt>

          <dd className="font-medium">{table.idealFor} People</dd>
        </div>
      </dl>

      <div className="mt-6">
        <h4 className="mb-3 text-sm font-semibold text-slate-700">
          Today's Availability
        </h4>

        <div className="space-y-2">
          {table.timeline.length === 0 ? (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              Available All Day
            </div>
          ) : (
            table.timeline.map((slot, index) => (
              <div
                key={index}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  slot.status === "AVAILABLE"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                <span>
                  {slot.start} - {slot.end}
                </span>

                <div className="text-right">
                  <p className="font-semibold">{slot.status}</p>

                  {slot.status === "RESERVED" && (
                    <p className="text-xs">
                      {slot.customerName} ({slot.bookingId})
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </article>
  );
}

export default TableCard;
