import { LuMoveRight } from "react-icons/lu";
import { Button } from "../../ui/Button";
import type { Zone } from "../../../services/api";

type CheckinButtonProps = {
  selectedZone: Zone;
  isCheckingIn: boolean;
  isDisabled: boolean;
  onCheckin: () => void;
};

export default function CheckinButton({
  selectedZone,
  isCheckingIn,
  isDisabled,
  onCheckin,
}: CheckinButtonProps) {
  if (!selectedZone) return null;

  return (
    <div className="sticky bottom-4 p-4 w-full flex justify-center">
      <Button
        onClick={onCheckin}
        disabled={isDisabled}
        className="bg-secondary text-background"
        variant="custom"
        size="lg"
      >
        {isCheckingIn ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : (
          <>
            Generate Ticket for {selectedZone.name} <LuMoveRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
