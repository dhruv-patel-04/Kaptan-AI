import { useEffect, useState } from "react";
import { getSettings } from "../services/api";

function Navbar() {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    try {
      const data = await getSettings();

      setIsOpen(data.restaurant.isOpen);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
          Operations Overview
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          ABC Pizzeria Dashboard
        </h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Current Date
          </span>
          <span className="mt-1 block font-semibold text-slate-800">
            {currentDate}
          </span>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-sm shadow-sm border ${
            isOpen
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <span
            className={`block text-xs font-medium uppercase tracking-[0.2em] ${
              isOpen ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            Restaurant Status
          </span>

          <span
            className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-[0.18em] text-white ${
              isOpen ? "bg-emerald-500" : "bg-rose-500"
            }`}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
