import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LevelsRoute from "./routes/levels.tsx";
import GameRoute from "./routes/game.tsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LevelsRoute />,
  },
  {
    path: "/level/:id",
    element: <GameRoute />,
  },
]);

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
