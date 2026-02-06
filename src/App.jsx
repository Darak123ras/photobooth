import { useState } from "react";
import LandingPage from "./components/LandingPage";
import Studio from "./components/Studio";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
      {page === "landing" && (
        <LandingPage onStart={() => setPage("studio")} />
      )}

      {page === "studio" && <Studio />}
    </>
  );
}
