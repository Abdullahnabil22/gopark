import CheckoutPanel from "../components/Checkout/CheckoutPanel";
import CheckoutHeader from "../components/Headers/CheckoutHeader";

import Login from "../components/Login/login";
import { useAuth } from "../hooks/useAuth";

export default function CheckPoint() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div>
      <CheckoutHeader />
      <CheckoutPanel />
    </div>
  );
}
