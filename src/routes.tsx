import { createBrowserRouter } from "react-router";
import App from "./App";
import Admin from "./pages/admin";
import CheckPoint from "./pages/checkPoint";
import Gates from "./pages/gates";
import ZoneCard from "./components/Cards/Zone/ZoneCard";
import Home from "./pages";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "/admin",
        element: <Admin />,
      },
      {
        path: "/checkpoint",
        element: <CheckPoint />,
      },
      {
        path: "/gate/:id",
        element: <Gates />,
      },
    ],
  },
  {
    path: "*",
    element: <ZoneCard />,
  },
]);

export default router;
