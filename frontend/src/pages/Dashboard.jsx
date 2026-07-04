import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import StatCard from "../components/StatCard";
import { getDashboardData } from "../services/api";
import ReservationModal from "../components/ReservationModal";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  async function refreshDashboard() {
    const data = await getDashboardData();

    setDashboardData(data);
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboardData();

        setDashboardData(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadDashboard();
    const interval = setInterval(
      loadDashboard,

      30000,
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white"
        >
          + New Reservation
        </button>

        <ReservationModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={refreshDashboard}
        />
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardData && (
          <>
            <StatCard
              title="Restaurant Status"
              value={dashboardData.restaurant.isOpen ? "Open" : "Closed"}
              helper={`Open ${dashboardData.restaurant.openingTime} - ${dashboardData.restaurant.closingTime}`}
              trend="Live"
              tone="success"
            />

            <StatCard
              title="Today's Reservations"
              value={dashboardData.summary.todayReservations}
              helper="Today's bookings"
              trend=""
              tone="primary"
            />

            <StatCard
              title="Occupied Tables"
              value={dashboardData.summary.occupiedTables}
              helper="Currently occupied"
              trend=""
              tone="warning"
            />

            <StatCard
              title="Available Tables"
              value={dashboardData.summary.availableTables}
              helper="Ready for booking"
              trend=""
              tone="neutral"
            />
          </>
        )}
      </section>

      <section className="panel overflow-hidden">
        <div className="panel-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              Service Queue
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Upcoming Reservation
            </h2>
          </div>
        </div>

        {!dashboardData ? (
          <div className="p-6">Loading...</div>
        ) : dashboardData.nextReservation ? (
          <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-5">
            <div>
              <p className="font-semibold">
                {dashboardData.nextReservation.customerName}
              </p>

              <p>{dashboardData.nextReservation.mobile}</p>
            </div>

            <div>
              <p>Booking ID</p>
              <p>{dashboardData.nextReservation.bookingId}</p>
            </div>

            <div>
              <p>Time</p>
              <p>{dashboardData.nextReservation.slot}</p>
            </div>

            <div>
              <p>Persons</p>
              <p>{dashboardData.nextReservation.persons}</p>
            </div>

            <div>
              <p>Table</p>
              <p>{dashboardData.nextReservation.tablesAllocated.join(", ")}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-gray-500">
            No upcoming reservations today.
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
