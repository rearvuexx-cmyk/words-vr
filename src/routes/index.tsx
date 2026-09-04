import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Overlay } from "@/components/words-vr/overlay";
import { FloorCanvas } from "@/components/words-vr/experience";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg">
      {ready && <FloorCanvas />}
      <Overlay />
    </div>
  );
}
