import { useAppStore } from "../../store/app";
import { useEffect } from "react";

export default function AdminAudit() {
  const { adminLog, connectToGate, disconnect, wsConnected } = useAppStore();
  
  useEffect(() => {
    connectToGate("gate_1");
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live Admin Audit</h2>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded ${wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {wsConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span className="text-xs text-gray-500">Latest 50</span>
        </div>
      </div>
      <div className="border rounded-lg max-h-64 overflow-auto">
        {adminLog.length === 0 ? (
          <div className="p-3 text-sm text-gray-500">No updates yet</div>
        ) : (
          <ul className="divide-y">
            {adminLog.map((log, idx) => (
              <li
                key={idx}
                className="p-3 text-sm flex items-center justify-between"
              >
                <div>
                  <span className="font-medium">{log.action}</span>
                  <span className="text-gray-500"> on {log.targetType} </span>
                  <span className="font-mono">{log.targetId}</span>
                </div>
                <div className="text-xs text-gray-500">
                  by <span className="font-mono">{log.adminId}</span> at{" "}
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}