"use client";

import IntradayTable from "./components/IntradayTable";
import LastOrdersTable from "./components/LastOrderTable";
import CryptoTable from "./components/CryptoTable";
import PendingTable from "./components/PendingTable";

export default function Home() {
  const hiddenColumns = ["PPP1", "Intraday", "PPP2", "PnL-acumulado"];
  return (
    <div className="space-y-8 gap-8 bg-gray-900 p-2 sm:p-8 h-auto">
      <IntradayTable hiddenColumns={hiddenColumns} />
      <LastOrdersTable />
      <CryptoTable />
      <PendingTable />
      <div className="flex max-w-7xl mx-auto flex-col">
        <div className="divider"></div>
        <div className="card bg-base-300 rounded-box grid h-20 place-items-center">
          <footer className="text-center">
            Desarrollado por Vulcan Tech ©
          </footer>
        </div>
      </div>
    </div>
  );
}
