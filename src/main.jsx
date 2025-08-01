import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import 'antd/dist/reset.css';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <ToastContainer />
  </StrictMode>
);
