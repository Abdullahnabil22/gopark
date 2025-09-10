import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  getTicket,
  ticketCheckout,
  type CheckoutResponse,
  type Ticket,
} from "../../services/api";
import { LuScan } from "react-icons/lu";
import { useToast } from "../../hooks/useToast";

type RecentTicket = { id: string; when: number };

export default function CheckoutPanel() {
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [recent, setRecent] = useState<RecentTicket[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { showError, showSuccess, ToastContainer } = useToast();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function pushRecent(id: string) {
    setRecent((prev) => {
      const without = prev.filter((r) => r.id !== id);
      const next = [{ id, when: Date.now() }, ...without].slice(0, 5);
      return next;
    });
  }

  const scanMutation = useMutation({
    mutationFn: async (id: string) => getTicket(id),
    onMutate: () => {
      setTicket(null);
      setCheckout(null);
    },
    onSuccess: (t) => {
      setTicket(t);
      pushRecent(t.id);
    },
    onError: (e: unknown) => {
      const message =
        (e as { message?: string })?.message || "Failed to load ticket";
      showError(message);
    },
    onSettled: () => {
      inputRef.current?.focus();
    },
  });

  function handleScan() {
    if (!ticketId.trim()) return;
    scanMutation.mutate(ticketId.trim());
  }

  const checkoutMutation = useMutation({
    mutationFn: (vars: { forceConvertToVisitor?: boolean }) =>
      ticketCheckout({
        ticketId: ticket!.id,
        forceConvertToVisitor: vars.forceConvertToVisitor,
      }),
    onSuccess: (co) => {
      setCheckout(co);
      showSuccess(
        `Checkout successful. Charged $${co.amount.toFixed(2)} for ticket ${
          co.ticketId
        }.`
      );
      setTicketId("");
      setTicket(null);
    },
    onError: (e: unknown) => {
      const message = (e as { message?: string })?.message || "Payment failed";
      showError(message);
    },
    onSettled: () => {
      inputRef.current?.focus();
    },
  });

  return (
    <div className=" p-4 md:p-6">
      <ToastContainer />
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-gray-500 text-sm">
          Process vehicle exit and payments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Scan Ticket</h2>
            <div className="space-y-1 flex flex-col">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div className="space-y-1 flex flex-col">
                  <label htmlFor="ticketId" className=" text-sm font-medium">
                    Ticket ID
                  </label>

                  <input
                    id="ticketId"
                    ref={inputRef}
                    className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Scan or enter ticket ID"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleScan();
                    }}
                  />
                </div>

                <Button onClick={handleScan} disabled={scanMutation.isPending}>
                  {scanMutation.isPending ? "Scanning..." : "Scan"}
                </Button>
              </form>

              {recent.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Recent</div>
                  <div className="space-y-2">
                    {recent.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setTicketId(r.id)}
                        className="w-full text-left px-3 py-2 border rounded-md hover:bg-gray-50"
                      >
                        <div className="font-mono text-sm">{r.id}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(r.when).toLocaleTimeString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {!ticket ? (
              <div className="text-center py-8 text-gray-500">
                <LuScan className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm">Scan a ticket to view details</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Ticket ID</div>
                    <div className="font-mono">{ticket.id}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Type</div>
                    <Badge
                      variant={
                        ticket.type === "subscriber" ? "info" : "default"
                      }
                    >
                      {ticket.type}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-gray-500">Zone</div>
                    <div className="font-mono">{ticket.zoneId}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Gate</div>
                    <div className="font-mono">{ticket.gateId}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Check-in</div>
                    <div>{new Date(ticket.checkinAt).toLocaleString()}</div>
                  </div>
                </div>
                {checkout && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-green-600">
                        {`$${checkout.amount.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {ticket && (
          <Card className="lg:col-span-2">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="space-y-2">
                  <h2 className="text-sm font-medium">Payment Method</h2>
                  <select className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Cash</option>
                    <option>Credit Card</option>
                    <option>Debit Card</option>
                    <option>Mobile Payment</option>
                  </select>
                </div>
                {checkout && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Amount Due</div>
                    <div className="text-2xl font-bold">
                      {`$${checkout.amount.toFixed(2)}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {checkout.breakdown.length} rate segment(s)
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Actions</div>
                  <div className="space-y-2">
                    <Button
                      onClick={() =>
                        checkoutMutation.mutate({
                          forceConvertToVisitor: false,
                        })
                      }
                      disabled={!ticket || checkoutMutation.isPending}
                      className="w-full"
                    >
                      {checkoutMutation.isPending
                        ? "Processing..."
                        : "Checkout & Pay"}
                    </Button>
                    {ticket.type === "subscriber" && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          checkoutMutation.mutate({
                            forceConvertToVisitor: true,
                          })
                        }
                        disabled={checkoutMutation.isPending}
                        className="w-full"
                      >
                        Convert to Visitor & Pay
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {checkout && (
                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">Breakdown</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-4">From</th>
                          <th className="py-2 pr-4">To</th>
                          <th className="py-2 pr-4">Mode</th>
                          <th className="py-2 pr-4">Hours</th>
                          <th className="py-2 pr-4">Rate</th>
                          <th className="py-2 pr-0 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {checkout.breakdown.map((b, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2 pr-4">
                              {new Date(b.from).toLocaleString()}
                            </td>
                            <td className="py-2 pr-4">
                              {new Date(b.to).toLocaleString()}
                            </td>
                            <td className="py-2 pr-4">
                              <Badge
                                variant={
                                  b.rateMode === "special"
                                    ? "warning"
                                    : "default"
                                }
                              >
                                {b.rateMode}
                              </Badge>
                            </td>
                            <td className="py-2 pr-4">{b.hours}</td>
                            <td className="py-2 pr-4">
                              ${b.rate.toFixed(2)}/h
                            </td>
                            <td className="py-2 pr-0 text-right">
                              ${b.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
