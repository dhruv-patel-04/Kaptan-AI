import { useEffect, useState } from "react";
import TableCard from "../components/TableCard";
import { getTables } from "../services/api";

function Tables() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    async function loadTables() {
      try {
        const data = await getTables();

        setTables(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadTables();
    const interval = setInterval(
      loadTables,

      30000,
    );

    return () => clearInterval(interval);
  }, []);

  // const t2Tables = tables.filter((table) => table.tableType === "T2");

  // const t4Tables = tables.filter((table) => table.tableType === "T4");

  const groupedTables = tables.reduce((groups, table) => {
    if (!groups[table.tableType]) {
      groups[table.tableType] = [];
    }

    groups[table.tableType].push(table);

    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* <section className="panel">
        <div className="panel-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              Seating Map
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              T2 Tables
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Two-seat tables for couples and quick dining.
          </p>
        </div>

        <div className="panel-body grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {t2Tables.map((table) => (
            <TableCard key={table.tableId} table={table} />
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              Seating Map
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              T4 Tables
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Four-seat tables suited for families and groups.
          </p>
        </div>

        <div className="panel-body grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {t4Tables.map((table) => (
            <TableCard key={table.tableId} table={table} />
          ))}
        </div>
      </section> */}

      {Object.entries(groupedTables).map(([tableType, group]) => (
        <section key={tableType} className="panel">
          <div className="panel-header">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                Seating Map
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {tableType} Tables
              </h2>
            </div>

            <p className="text-sm text-slate-500">{group.length} Tables</p>
          </div>

          <div className="panel-body grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.map((table) => (
              <TableCard key={table.tableId} table={table} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default Tables;
