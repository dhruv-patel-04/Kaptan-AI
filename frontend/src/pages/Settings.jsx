import { useEffect, useState } from "react";
import { getSettings, updateRestaurantStatus } from "../services/api";

function Settings() {
  const [formData, setFormData] = useState({
    restaurantId: "",
    cityCode: "",
    isOpen: false,
    openingTime: "",
    closingTime: "",
    tableConfiguration: {},
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getSettings();

      setFormData({
        restaurantId: data.restaurant.restaurantId,
        cityCode: data.restaurant.cityCode,
        isOpen: data.restaurant.isOpen,
        openingTime: data.restaurant.openingTime,
        closingTime: data.restaurant.closingTime,
        tableConfiguration: data.tableConfiguration,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggle(event) {
    const newValue = event.target.checked;

    const confirmed = window.confirm(
      newValue
        ? "Open restaurant and start accepting reservations?"
        : "Close restaurant and stop accepting reservations?",
    );

    if (!confirmed) return;

    try {
      await updateRestaurantStatus(newValue);
      window.location.reload();

      setFormData((current) => ({
        ...current,
        isOpen: newValue,
      }));
    } catch (err) {
      console.error(err);
      alert("Unable to update restaurant status.");
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Restaurant Administration
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Settings
          </h2>
        </div>
      </div>

      <div className="panel-body space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="mb-6 text-lg font-semibold text-slate-900">
            Restaurant Information
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Restaurant ID</p>
              <p className="mt-1 text-lg font-semibold">
                {formData.restaurantId}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">City Code</p>
              <p className="mt-1 text-lg font-semibold">{formData.cityCode}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Opening Time</p>
              <p className="mt-1 text-lg font-semibold">
                {formData.openingTime}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Closing Time</p>
              <p className="mt-1 text-lg font-semibold">
                {formData.closingTime}
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <div>
              <p className="font-semibold text-slate-900">Restaurant Open</p>

              <p className="text-sm text-slate-500">
                Toggle reservation availability.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.isOpen}
                onChange={handleToggle}
                className="peer sr-only"
              />

              <span className="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-blue-600" />

              <span className="absolute left-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="mb-6 text-lg font-semibold text-slate-900">
            Table Configuration
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-3">Type</th>

                  <th className="pb-3">Count</th>

                  <th className="pb-3">Capacity</th>

                  <th className="pb-3">Ideal For</th>
                </tr>
              </thead>

              <tbody>
                {Object.entries(formData.tableConfiguration).map(
                  ([type, table]) => (
                    <tr key={type} className="border-b border-slate-100">
                      <td className="py-4 font-semibold">{type}</td>

                      <td>{table.count}</td>

                      <td>{table.capacity}</td>

                      <td>{table.idealFor}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Settings;
