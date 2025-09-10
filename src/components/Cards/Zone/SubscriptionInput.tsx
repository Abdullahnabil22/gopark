import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../ui/Button";
import { type Subscription } from "../../../services/api";
import { useSearchParams } from "react-router";
import { getSubscription } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

type SubscriptionInputProps = {
  onSubscriptionValidated: (subscription: Subscription) => void;
};

export default function SubscriptionInput({
  onSubscriptionValidated,
}: SubscriptionInputProps) {
  const [, setSearchParams] = useSearchParams();
  const { showSuccess, showError , ToastContainer} = useToast();
  const [inputId, setInputId] = useState("");
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const {
    mutate: validateSubscription,
    isPending: isValidating,
    isError,
  } = useMutation<Subscription, Error, string>({
    mutationFn: (subscriptionId: string) => getSubscription(subscriptionId),
    onSuccess: (data) => {
      setSubscription(data);
      showSuccess("Subscription validated successfully!");
      onSubscriptionValidated(data);
    },
    onError: () => {
      setSubscription(null);
      showError("Invalid subscription ID");
    },
  });



  const handleValidate = () => {
    if (inputId.trim()) {
      validateSubscription(inputId.trim());
    }
  };

  const handleProceed = () => {
    if (subscription) {
      setSearchParams({ subscriptionId: subscription.id });
    }
  };

  return (
    <div className="space-y-4">
      <ToastContainer />
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Subscription ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter subscription ID..."
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
              isError
                ? "border-red-500 focus:ring-red-500/50"
                : "border-gray-300 focus:ring-green-500/50"
            }`}
            disabled={isValidating}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isValidating) {
                handleValidate();
              }
            }}
          />
          <Button
            onClick={handleValidate}
            disabled={!inputId.trim() || isValidating}
            variant="primary"
            className="px-6"
          >
            {isValidating ? "Validating..." : "Validate"}
          </Button>
        </div>
      </div>


      {subscription && (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              Welcome {subscription.userName}
            </p>
            <div className="mt-2 text-xs text-green-700">
              <p>Subscription ID: {subscription.id}</p>
              {subscription.category && (
                <p>Category: {subscription.category}</p>
              )}
              <p>Status: {subscription.active ? "Active" : "Inactive"}</p>
            </div>
          </div>

          <Button onClick={handleProceed} variant="primary" className="w-full">
            Proceed to Select Zone
          </Button>
        </div>
      )}

      {isValidating && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">Validating subscription...</p>
        </div>
      )}
    </div>
  );
}
