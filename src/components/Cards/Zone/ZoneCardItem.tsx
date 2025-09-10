import { type Zone } from "../../../services/api";
import { Card, CardContent } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { getCategoryColor } from "../../../utils/categoryUtils";

type ZoneCardItemProps = {
  zone: Zone;
  categoryName: string;
  selectedZone: Zone;
  onSelect: (zone: Zone) => void;
  isDisabled: boolean;
  subscriptionValid?: boolean;
};

const getStatusColor = (isOpen: boolean, availableSlots: number) => {
  if (!isOpen) return "bg-red-100 text-red-800";
  if (availableSlots === 0) return "bg-orange-100 text-orange-800";
  return "bg-green-100 text-green-800";
};

export default function ZoneCardItem({
  zone,
  categoryName,
  selectedZone,
  onSelect,
  isDisabled,
  subscriptionValid = true,
}: ZoneCardItemProps) {
  const availableSlots =
    zone.availableForVisitors || zone.availableForSubscribers;
  const occupancyRate = (zone.occupied! / zone.totalSlots!) * 100;
  const currentRate = zone.rateSpecial || zone.rateNormal;
  const isRushHour = false;
  const disabled =
    isDisabled || !zone.open || availableSlots === 0 || !subscriptionValid;

  return (
    <Card
      className={`h-full transition-all hover:shadow-md ${
        selectedZone?.id === zone.id ? "border-4 border-primary" : ""
      }`}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{zone.name}</h3>
            <Badge className={getCategoryColor(categoryName)}>
              {categoryName}
            </Badge>
          </div>
          <Badge className={getStatusColor(zone.open, availableSlots!)}>
            {zone.open ? (availableSlots! > 0 ? "Open" : "Full") : "Closed"}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Occupancy:</span>
            <span className="font-medium">
              {zone.occupied}/{zone.totalSlots} ({occupancyRate.toFixed(0)}%)
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all bg-blue-600"
              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <h2 className="text-gray-500 col-span-2">Availability:</h2>
            <div className="text-center p-2 bg-gray-100 rounded">
              <div className="font-medium">
                {zone.availableForVisitors || 0}
              </div>
              <div className="text-gray-500">Visitor slots</div>
            </div>
            <div className="text-center p-2 bg-gray-100 rounded">
              <div className="font-medium">
                {zone.availableForSubscribers || 0}
              </div>
              <div className="text-gray-500">Subscriber slots</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Current rate:</span>
              <span className="font-medium">
                ${currentRate!.toFixed(2)}/hour
              </span>
            </div>
            {isRushHour && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Normal rate:</span>
                <span className="text-gray-500">
                  ${zone.rateNormal!.toFixed(2)}/hour
                </span>
              </div>
            )}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => onSelect(zone)}
          disabled={disabled}
          variant="primary"
        >
          {!zone.open
            ? "Zone Closed"
            : availableSlots === 0
            ? "No Slots Available"
            : "Select Zone"}
        </Button>
      </CardContent>
    </Card>
  );
}
