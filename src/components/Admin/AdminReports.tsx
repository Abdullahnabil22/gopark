import { useQuery } from "@tanstack/react-query";
import { getParkingStateReport, type ParkingStateReportEntry } from "../../services/api";
import { Badge } from "../ui/Badge";

export default function AdminReports() {
  

  const { data: parkingStateReport, isLoading , isError, error} = useQuery<ParkingStateReportEntry[]>({
    queryKey: ["parkingStateReport"],
    queryFn: () => getParkingStateReport(),
  });


  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Parking State Report</h2>
        <p className="text-sm text-gray-500">Metrics per zone</p>
      </div>
      {isError && (
        <div className="text-sm text-red-600" role="alert">{error?.message}</div>
      )}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr className="text-left">
              <th className="px-3 py-2">Zone</th>
              <th className="px-3 py-2">Total Slots</th>
              <th className="px-3 py-2">Occupied</th>
              <th className="px-3 py-2">Free</th>
              <th className="px-3 py-2">Reserved</th>
              <th className="px-3 py-2">Available for Visitors</th>
              <th className="px-3 py-2">Available for Subscribers</th>
              <th className="px-3 py-2">Subscribers</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-4" colSpan={9}>Loading...</td>
              </tr>
            ) : parkingStateReport?.length === 0 ? (
              <tr>
                <td className="px-3 py-4" colSpan={9}>No zones</td>
              </tr>
            ) : (
              parkingStateReport?.map((z) => (
                <tr key={z.zoneId} className="border-t">
                  <td className="px-3 py-2 font-medium">{z.name}</td>
                  <td className="px-3 py-2">{z.totalSlots}</td>
                  <td className="px-3 py-2">{z.occupied}</td>
                  <td className="px-3 py-2">{z.free}</td>
                  <td className="px-3 py-2">{z.reserved}</td>
                  <td className="px-3 py-2">{z.availableForVisitors}</td>
                  <td className="px-3 py-2">{z.availableForSubscribers}</td>
                  <td className="px-3 py-2">{z.subscriberCount}</td>
                  <td className="px-3 py-2">
                    <Badge className={z.open ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {z.open ? "Open" : "Closed"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
