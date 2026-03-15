import { useState } from "react";
import { Initial } from "@/components/Initial/initial";
import { Machine } from "@/components/Initial/machine";

export default function InitialRoute() {
  const [mode, setMode] = useState<"Turing machine" | null>(null);
  switch (mode) {
    case "Turing machine":
      return <Machine/>;
    default:
      return <Initial setMode={setMode} />;
  }
}