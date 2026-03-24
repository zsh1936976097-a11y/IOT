import { createBrowserRouter } from "react-router";
import { Overview } from "./screens/Overview";
import { Dynamics } from "./screens/Dynamics";
import { Profile } from "./screens/Profile";
import { Logic } from "./screens/Logic";
import { Settings } from "./screens/Settings";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Overview },
      { path: "dynamics", Component: Dynamics },
      { path: "profile", Component: Profile },
      { path: "logic", Component: Logic },
      { path: "settings", Component: Settings },
    ],
  },
]);