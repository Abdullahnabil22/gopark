/**
 * HTTP API client and typed endpoints for the GoPark frontend.
 * Centralizes base URL, auth header injection, timeouts, and JSON parsing.
 */
const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as ImportMeta).env?.VITE_API_BASE_URL) ||
  "http://localhost:3000/api/v1";

/** Allowed HTTP methods */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** Options supported by the API client */
type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
};

/** Build a URL query string from a plain object. Skips null/undefined. */
function buildQueryString(query?: RequestOptions["query"]) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Read the persisted auth token from storage, if available. */
function getAuthToken(): string | undefined {
  try {
    const Store =
      typeof localStorage !== "undefined"
        ? JSON.parse(localStorage.getItem("auth-storage") || "{}")
        : null;
    
    const token = Store.state.token;
    return token || undefined;
  } catch {
    return undefined;
  }
}

/** Try to parse JSON from a response if the content-type is JSON. */
async function parseJsonSafe(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Minimal fetch-based API client with JSON handling and timeout support.
 */
class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /** Perform an HTTP request against the configured base URL. */
  async request<T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = "GET",
      headers = {},
      query,
      body,
      signal,
      timeoutMs = 20000,
    } = options;

    const authToken = getAuthToken();
    const mergedHeaders: Record<string, string> = {
      Accept: "application/json",
      ...headers,
    };

    const isJsonBody = body !== undefined && !(body instanceof FormData);
    if (isJsonBody) {
      mergedHeaders["Content-Type"] =
        mergedHeaders["Content-Type"] || "application/json";
    }
    if (authToken && !mergedHeaders["Authorization"]) {
      mergedHeaders["Authorization"] = `Bearer ${authToken}`;
    }

    const url = `${this.baseUrl}${path}${buildQueryString(query)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    if (signal) {
      signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }

    try {
      const res = await fetch(url, {
        method,
        headers: mergedHeaders,
        body: isJsonBody
          ? JSON.stringify(body)
          : (body as BodyInit | undefined),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorPayload = (await parseJsonSafe(res)) || {};
        const maybeMessage = (errorPayload as Record<string, unknown>)[
          "message"
        ];
        const message =
          typeof maybeMessage === "string"
            ? maybeMessage
            : `Request failed with ${res.status}`;
        const error = new Error(message) as Error & {
          status?: number;
          payload?: unknown;
        };
        error.status = res.status;
        error.payload = errorPayload;
        throw error;
      }

      const data = (await parseJsonSafe(res)) as T;
      return data as T;
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "name" in err &&
        (err as { name?: string }).name === "AbortError"
      ) {
        throw new Error("Request timed out");
      }
      throw err;
    }
  }

  /** Convenience GET helper */
  get<T = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  /** Convenience POST helper */
  post<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  /** Convenience PUT helper */
  put<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  /** Convenience DELETE helper */
  delete<T = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient(API_BASE_URL);

// ========= Entity Types =========
/** Zone state as returned by the API */
export type Zone = {
  id: string;
  name?: string;
  categoryId?: string;
  gateIds?: string[];
  totalSlots?: number;
  occupied?: number;
  free?: number;
  reserved?: number;
  availableForVisitors?: number;
  availableForSubscribers?: number;
  rateNormal?: number;
  rateSpecial?: number;
  open: boolean;
};

/** Category description with optional pricing */
export type Category = {
  id: string;
  name?: string;
  description?: string;
  rateNormal?: number;
  rateSpecial?: number;
};

/** Rush hour window specification */
export type RushHour = {
  id?: string;
  weekDay?: number; // 0..6
  from?: string; // HH:MM
  to?: string; // HH:MM
};

/** Vacation period for special pricing */
export type Vacation = {
  id?: string;
  name?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
};

/** Response payload for successful login */
export type LoginResponse = {
  user: { id: string; username: string; role: string };
  token: string;
};

export type User = { id: string; username: string; role: string };

/** Subscriber record with vehicles and active check-ins */
export type Subscription = {
  id: string;
  active: boolean;
  category?: string;
  userName?: string;
  categories?: string[];
  currentCheckins?: Array<{
    ticketId: string;
    zoneId: string;
    checkinAt: string;
  }>;
  cars?: Array<{ plate: string; brand: string; model: string; color: string }>;
};

/** Parking ticket for visitors or subscribers */
export type Ticket = {
  id: string;
  type: "visitor" | "subscriber";
  zoneId: string;
  gateId: string;
  checkinAt: string;
  checkoutAt: string | null;
  subscriptionId?: string | null;
};

/** Aggregated view used for admin parking state report */
export type ParkingStateReportEntry = {
  zoneId: string;
  name: string;
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  subscriberCount: number;
  open: boolean;
};

// ======================= Zones ================================
/** Get zones for admin management */
export async function getAdminZones(): Promise<Zone[]> {
  return api.get<Zone[]>("/admin/zones");
}

/** Get zones visible at a given gate */
export async function getZones(gateId?: string): Promise<Zone[]> {
  return api.get<Zone[]>("/master/zones", { query: { gateId } });
}

/** Create a new zone */
export async function addZone(data: Partial<Zone>): Promise<Zone> {
  return api.post<Zone>("/admin/zones", data);
}

/** Update an existing zone */
export async function updateZone(
  zoneId: string,
  data: Partial<Zone>
): Promise<Zone> {
  return api.put<Zone>(`/admin/zones/${zoneId}`, data);
}

/** Delete a zone */
export async function deleteZone(
  zoneId: string
): Promise<{ success?: boolean } | unknown> {
  return api.delete<{ success?: boolean } | unknown>(`/admin/zones/${zoneId}`);
}

// ======================= Gates ================================
/** Get all gates for admin */
export async function getAdminGates(): Promise<Gate[]> {
  return api.get<Gate[]>("/admin/gates");
}

export type Gate = {
  id: string;
  name: string;
  zoneIds: string[];
  location: string;
};

/** Get gate list for operational views */
export async function getGates(): Promise<Gate[]> {
  return api.get<Gate[]>("/master/gates");
}

/** Create a gate */
export async function addGate(data: Partial<Gate>): Promise<Gate> {
  return api.post<Gate>("/admin/gates", data);
}

/** Update a gate */
export async function updateGate(
  gateId: string,
  data: Partial<Gate>
): Promise<Gate> {
  return api.put<Gate>(`/admin/gates/${gateId}`, data);
}

/** Delete a gate */
export async function deleteGate(
  gateId: string
): Promise<{ success?: boolean } | unknown> {
  return api.delete<{ success?: boolean } | unknown>(`/admin/gates/${gateId}`);
}

// ======================= Categories ================================
/** Get all categories for admin */
export async function getAdminCategories(): Promise<Category[]> {
  return api.get<Category[]>("/admin/categories");
}

/** Get public categories */
export async function getCategories(): Promise<Category[]> {
  return api.get<Category[]>("/master/categories");
}

/** Create a category */
export async function addCategory(data: Partial<Category>): Promise<Category> {
  return api.post<Category>("/admin/categories", data);
}

/** Update a category */
export async function updateCategory(
  categoryId: string,
  data: Partial<Category>
): Promise<Category> {
  return api.put<Category>(`/admin/categories/${categoryId}`, data);
}

/** Delete a category */
export async function deleteCategory(
  categoryId: string
): Promise<{ success?: boolean } | unknown> {
  return api.delete<{ success?: boolean } | unknown>(
    `/admin/categories/${categoryId}`
  );
}

// ======================= Rush hours ================================
/** Get configured rush hours */
export async function getRushHours(): Promise<RushHour[]> {
  return api.get<RushHour[]>("/admin/rush-hours");
}

/** Create a rush hour window */
export async function addRushHour(
  data: Omit<RushHour, "id">
): Promise<RushHour> {
  return api.post<RushHour>("/admin/rush-hours", data);
}

/** Update a rush hour window */
export async function updateRushHour(
  id: string,
  data: Partial<RushHour>
): Promise<RushHour> {
  return api.put<RushHour>(`/admin/rush-hours/${id}`, data);
}

/** Delete a rush hour window */
export async function deleteRushHour(
  id: string
): Promise<{ success?: boolean } | unknown> {
  return api.delete<{ success?: boolean } | unknown>(`/admin/rush-hours/${id}`);
}

// ======================= Vacations ================================
/** Get configured vacations */
export async function getVacations(): Promise<Vacation[]> {
  return api.get<Vacation[]>("/admin/vacations");
}

/** Create a vacation period */
export async function addVacation(
  data: Omit<Vacation, "id">
): Promise<Vacation> {
  return api.post<Vacation>("/admin/vacations", data);
}

/** Update a vacation period */
export async function updateVacation(
  id: string,
  data: Partial<Vacation>
): Promise<Vacation> {
  return api.put<Vacation>(`/admin/vacations/${id}`, data);
}

/** Delete a vacation period */
export async function deleteVacation(
  id: string
): Promise<{ success?: boolean } | unknown> {
  return api.delete<{ success?: boolean } | unknown>(`/admin/vacations/${id}`);
}

// ======================= Auth & Users ================================
/** Log in and receive a token */
export async function login(data: {
  username: string;
  password: string;
}): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/login", data);
}

/** Create a user */
export async function addUser(data: {
  username: string;
  password: string;
  role: string;
}): Promise<User> {
  return api.post<User>("/admin/users", data);
}

/** Get users */
export async function getUsers(): Promise<User[]> {
  return api.get<User[]>("/admin/users");
}

// ======================= Subscriptions ================================
/** Fetch a subscription by id */
export async function getSubscription(id: string): Promise<Subscription> {
  return api.get<Subscription>(`/subscriptions/${id}`);
}

/** Create a subscription */
export async function addSubscription(
  data: Partial<Subscription>
): Promise<Subscription> {
  return api.post<Subscription>("/admin/subscriptions", data);
}

/** Update a subscription */
export async function updateSubscription(
  id: string,
  data: Partial<Subscription>
): Promise<Subscription> {
  return api.put<Subscription>(`/admin/subscriptions/${id}`, data);
}

// ======================= Tickets ================================

/** Response returned on successful check-in */
export type CheckinResponse = { ticket: Ticket; zoneState: Zone };
/** Check-in a visitor ticket */
export async function ticketCheckinVisitor(
  data: Ticket
): Promise<CheckinResponse> {
  return api.post<CheckinResponse>("/tickets/checkin", data);
}

/** Check-in a subscriber ticket */
export async function ticketCheckinSubscriber(
  data: Ticket
): Promise<CheckinResponse> {
  return api.post<CheckinResponse>("/tickets/checkin", data);
}

/** Line-item of a checkout breakdown */
export type CheckoutBreakdown = {
  from: string;
  to: string;
  hours: number;
  rateMode: "normal" | "special";
  rate: number;
  amount: number;
};
/** Response returned on successful checkout */
export type CheckoutResponse = {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: CheckoutBreakdown[];
  amount: number;
  zoneState: Zone;
};
/** Perform a ticket checkout */
export async function ticketCheckout(data: {
  ticketId: string;
  forceConvertToVisitor?: boolean;
}): Promise<CheckoutResponse> {
  return api.post<CheckoutResponse>("/tickets/checkout", {
    forceConvertToVisitor: false,
    ...data,
  });
}

/** Fetch a ticket by id */
export async function getTicket(id: string): Promise<Ticket> {
  return api.get<Ticket>(`/tickets/${id}`);
}

/** Get admin ticket list */
export async function getAdminTickets(params?: {
  status?: string;
}): Promise<Ticket[]> {
  return api.get<Ticket[]>("/admin/tickets", {
    query: { status: params?.status },
  });
}

// ======================= Admin Reports & Zone ops ================================
/** Fetch the current parking state report */
export async function getParkingStateReport(): Promise<
  ParkingStateReportEntry[]
> {
  return api.get<ParkingStateReportEntry[]>("/admin/reports/parking-state");
}

/** Toggle zone open/closed state */
export async function setZoneOpen(
  zoneId: string,
  open: boolean
): Promise<{ zoneId: string; open: boolean }> {
  return api.put<{ zoneId: string; open: boolean }>(
    `/admin/zones/${zoneId}/open`,
    { open }
  );
}
