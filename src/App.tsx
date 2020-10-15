import React from "react";
import { ToastProvider } from "react-toast-notifications";
import Routes from "./routes";

import "leaflet/dist/leaflet.css";
import "./styles/global.css";

const App: React.FC = () => {
  return (
    <ToastProvider autoDismiss autoDismissTimeout={5000}>
      <Routes />
    </ToastProvider>
  );
};

export default App;
