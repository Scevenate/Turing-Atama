import { useInitialStore } from "@/store/initial";
import { BookOpenText, MessageCircleX, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Initial({ setMode }: { setMode: (mode: "Turing machine") => void }) {
  const setInitial = useInitialStore((s) => s.setInitial);
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-bg w-max mx-auto">
      <h1 className="text-3xl mb-4">Which best describes you?</h1>
      <button className="bg-surface hover:bg-surface-2 text-text border border-border px-4 py-2 rounded-md w-full cursor-pointer" onClick={() => setMode("Turing machine")}>
        <BookOpenText strokeWidth={1.5} color="#6e6" className="w-10 h-10 mt-1.5 mb-2 mr-4 float-left" />
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-left">What's a Turing machine?</h3>
          <p className="text-sm text-text-muted text-left">Learn about Turing machine and how it works. Full tutorial.</p>
        </div>
      </button>
      <button className="bg-surface hover:bg-surface-2 text-text border border-border px-4 py-2 rounded-md w-full cursor-pointer" onClick={() => { setInitial(); navigate("/level/0"); }}>
        <ScrollText strokeWidth={1.5} color="#ee6" className="w-10 h-10 mt-1.5 mb-2 mr-4 float-left" />
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-left">How do I script?</h3>
          <p className="text-sm text-text-muted text-left">Learn about Turing atama scripting. Minimal tutorial.</p>
        </div>
      </button>
      <button className="bg-surface hover:bg-surface-2 text-text border border-border px-4 py-2 rounded-md w-full cursor-pointer" onClick={() => { setInitial(); }}>
        <MessageCircleX strokeWidth={1.5} color="#e66" className="w-10 h-10 mt-1.5 mb-2 mr-4 float-left" />
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-left">Shut up.</h3>
          <p className="text-sm text-text-muted text-left">I know how it works.</p>
        </div>
      </button>
    </div>
  );
}