import MachineBGSVG from "@/assets/machine-bg.svg";
import TuringMachineSVG from "@/assets/Turing-machine.svg";
import TuringMachine2SVG from "@/assets/Turing-machine-2.svg";
import TuringMachine3SVG from "@/assets/Turing-machine-3.svg";
import { ArrowRight, BookOpenText } from "lucide-react";
import { useInitialStore } from "@/store/initial";
import { useNavigate } from "react-router-dom";

export function Machine() {
  const setInitial = useInitialStore((s) => s.setInitial);
  const navigate = useNavigate();
  return (
    <>
      <img src={MachineBGSVG} alt="" className="fixed w-screen h-screen top-0 left-0 "></img>
      <div className="fixed w-screen h-screen flex flex-row justify-center overflow-scroll bg-transparent">
        <div className="flex flex-col items-center h-min md:w-2/3 md:px-20 p-10 md:border-x-2 md:border-border mx-auto bg-[rgba(30,30,30,0.8)]">
          <div className="w-full">
            <div className="bg-surface border-border py-2 px-3 rounded-xl border w-max">
              <BookOpenText strokeWidth={1.5} color="#6e6" className="inline -translate-y-0.5" />
              <p className="inline text-text ml-2 text-xl">Tutorial</p>
            </div>
          </div>
          <h1 className="text-5xl my-10 text-left w-full font-semibold">So, what's a <em>Turing machine</em>?</h1>  
          
          <img src={TuringMachineSVG} alt="Turing machine" className="w-full" />
          
          <p className="text-left w-full text-xl my-5">Turing machine. Whoa, big thing.</p>
          <p className="text-left w-full text-xl my-5">Like almost everything else in computer science, Turing machine is pooly named. Alan Turing himself, being a true legend, made the name <i>Turing machine</i> sounds very deep and complex, that understanding Turing machine would require professional expertise and years of study, definitely not something the public could do. In this sense, the machine is really, really terribly named. For anyone who has taken an actual look at the machine, it is shockingly simple, almost trivial. When we sit down and actually explain it, the <i>"Bob machine"</i>, or <i>"Seth machine"</i>, I would call, would perfectly fit in a three minutes read.</p>
          <p className="text-left w-full text-xl my-5">A "Turing machine" is a <a href="https://en.wikipedia.org/wiki/Punched_tape" target="_blank" className="text-accent underline hover:text-accent-2">punched tape</a> machine. It's a kind of computer back in Turing's days, when we don't have memory sticks yet. People would store data on a physical tape with punched holes. The machine has a track for the tape, and inside, a wheel could move the tape back and forth, and a head could read holes from the punched tape. That's exactly what a Turing machine is: A tape and a head moving on it. Turing had used an analogy that should be easy for people to understand, but clearly he did not predicted well how crazy future technology would become.</p>
          <p className="text-left w-full text-xl my-5">Okay, so with the physical analogy in mind, we're ready to define the abstract Turing machine with ease. A Turing machine consists:</p>
          <ol className="w-full text-xl pl-10">
            <li className="mb-5">1. <em>An infinitely long tape.</em> The tape contains a list of cells, the center one is cell 0, and it goes infinite on both positive and negative sides. Each cell may contain a character, it can be anything, from regular characters like 0, 1, or the name of your favorite philosopher, or leave it blank ('blank' is also a character!). Anything, it doesn't matter.</li>
            <li className="my-5">2. <em>A head.</em> The head is on the tape, and may read or write the cell directly under it. Additionally, the head persists a state, which can also be anything, 0, 1, or Descartes. The head may also read or write the state in it, just like the character under.</li>
          </ol>
          <img src={TuringMachine2SVG} alt="Turing machine" className="w-full" />
          <p className="text-left w-full text-xl my-5">Now we have a static picture of what a Turing machine is. It might not make much sense due to how trivial it is. I'm sorry to disappoint you, but the operation of Turing machine is as trivial - spoiler, you only do one thing! There's no much going on. We just do one simple thing, repeatitively.</p>
          <p className="text-left w-full text-xl my-5">Say you're the head. What you can do is bounded by what you know, but unfortunately, you don't know much. As the head, surely you know your own state, and the character under you, but that's it - you actually don't know the rest of the tape. You only know your state, and the single cell under you. That's it.</p>
          <p className="text-left w-full text-xl my-5">With these two piece of information, you ask the program what to do. A Turing machine program is a predefined encyclopedia that tells the Turing machine what to do given the current state and character. Yes, you just blindly follow what you're told to do. And more specifically, the program must instruct you to do the exact three things, in the exact given order:</p>
          <ol className="w-full text-xl pl-10">
            <li className="mb-5">1. Overwrite your current state to the given state;</li>
            <li className="my-5">2. Overwrite the current cell to the given character;</li>
            <li className="my-5">3. Move the head one cell left or one cell right.</li>
          </ol>
          <p className="text-left w-full text-xl my-5">There's one exception, that the program may skip some of the instructions, only doing part of it. For example, for the Turing machine given above, the program might say, <i>"When in state rfind_N, and the character is 1, do not overwrite state, do not overwrite character, and move the head right one cell."</i>. After this step, the Turing machine would be like:</p>
          <img src={TuringMachine3SVG} alt="Turing machine" className="w-full" />
          <p className="text-left w-full text-xl my-5">Then the Turing machine just repeats. The Turing machine now queries the program what to do when the state is rfind_N and the character is 3, and so on.</p>
          <p className="text-left w-full text-xl my-5">And that's a Turing machine. You might still have some questions, but the best way to learn is to do. Thankfully, what you've just learned is enough to get your hands a little dirty!</p>
          <button className="my-5 flex flex-row items-center bg-accent border border-border rounded-xl p-2 shadow shadow-black hover:-translate-y-0.5 hover:bg-accent-2 transition-transform cursor-pointer" onClick={() => { setInitial(); navigate('/level/1'); }}><p className="text-xl px-1 text-text">Continue</p> <ArrowRight className="w-5"></ArrowRight></button>
        </div>
      </div>
    </>
  );
}