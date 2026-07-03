"use client";
import { AnimatePresence, motion } from "framer-motion";

export default function DecorativeSvgs({}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute left-[22%] top-[10%] text-[#C5A572] opacity-35"
        animate={{
          y: [-8, 8, -8],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Book SVG */}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="40px"
          viewBox="0 -960 960 960"
          width="40px"
          fill="currentColor"
        >
          <path d="M480-160q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q58 0 113.5 15T480-740v484q51-32 107-48t113-16q36 0 70.5 6t69.5 18v-480q15 5 29.5 10.5T898-752q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm80-200v-380l200-200v400L560-360Zm-160 65v-396q-33-14-68.5-21.5T260-720q-37 0-72 7t-68 21v397q35-13 69.5-19t70.5-6q36 0 70.5 6t69.5 19Zm0 0v-396 396Z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute right-[13%] top-[9%] text-[#C5A572] opacity-35"
        animate={{
          y: [8, -8, 8],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 17,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Feather SVG */}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="40px"
          viewBox="0 -960 960 960"
          width="40px"
          fill="currentColor"
        >
          <path d="m490-527 37 37 217-217-37-37-217 217ZM200-200h37l233-233-37-37-233 233v37Zm355-205L405-555l167-167-29-29-219 219-56-56 218-219q24-24 56.5-24t56.5 24l29 29 50-50q12-12 28.5-12t28.5 12l93 93q12 12 12 28.5T828-678L555-405ZM270-120H120v-150l285-285 150 150-285 285Z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute left-[24%] bottom-[42%] text-[#C5A572] opacity-35"
        animate={{
          y: [-8, 8, -8],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Page SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="40px"
          viewBox="0 -960 960 960"
          width="40px"
          fill="currentColor"
        >
          <path d="M280-280h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm-80 480q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute right-[8%] bottom-[42%] text-[#C5A572] opacity-35"
        animate={{
          y: [8, -8, 8],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Leaf SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="40px"
          viewBox="0 -960 960 960"
          width="40px"
          fill="currentColor"
        >
          <path d="M216-176q-45-45-70.5-104T120-402q0-63 24-124.5T222-642q35-35 86.5-60t122-39.5Q501-756 591.5-759t202.5 7q8 106 5 195t-16.5 160.5q-13.5 71.5-38 125T684-182q-53 53-112.5 77.5T450-80q-65 0-127-25.5T216-176Zm112-16q29 17 59.5 24.5T450-160q46 0 91-18.5t86-59.5q18-18 36.5-50.5t32-85Q709-426 716-500.5t2-177.5q-49-2-110.5-1.5T485-670q-61 9-116 29t-90 55q-45 45-62 89t-17 85q0 59 22.5 103.5T262-246q42-80 111-153.5T534-520q-72 63-125.5 142.5T328-192Zm0 0Zm0 0Z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute left-[56%] top-[6%] -translate-x-1/2 text-[#C5A572] opacity-35"
        animate={{
          y: [-6, 6, -6],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* light bulb SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="40px"
          viewBox="0 -960 960 960"
          width="40px"
          fill="currentColor"
        >
          <path d="M423.5-103.5Q400-127 400-160h160q0 33-23.5 56.5T480-80q-33 0-56.5-23.5ZM320-200v-80h320v80H320Zm10-120q-69-41-109.5-110T180-580q0-125 87.5-212.5T480-880q125 0 212.5 87.5T780-580q0 81-40.5 150T630-320H330Zm24-80h252q45-32 69.5-79T700-580q0-92-64-156t-156-64q-92 0-156 64t-64 156q0 54 24.5 101t69.5 79Zm126 0Z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute right-[21%] top-[34%] text-[#C5A572] opacity-35"
        animate={{
          y: [-10, 10, -10],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Flower SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="40px"
          viewBox="0 -960 960 960"
          width="40px"
          fill="currentColor"
        >
          <path d="M381-116q-44-36-55-92-53 17-107-2t-83-66q-30-48-22-106.5t52-97.5q-42-38-50.5-94T134-678q27-48 81.5-69.5T324-752q11-56 55-92t101-36q57 0 101 36t55 92q56-17 108.5 3t81.5 71q27 50 19.5 104.5T794-480q44 39 52.5 96.5T828-276q-29 51-81.5 68T638-208q-11 56-55 92T482-80q-57 0-101-36Zm101-44q47 0 70.5-40.5T552-280l-28-46q-11 3-21 4.5t-21 1.5q-10 0-20.5-1.5T440-326l-28 46q-24 39-.5 79.5T482-160ZM202-320q24 41 70.5 41t69.5-41l26-46q-8-8-15-17t-12-19q-5-9-9-18.5t-7-19.5h-53q-47 0-70 39.5t0 80.5Zm416 0q23 41 69.5 41t70.5-41q23-41 0-80.5T688-440h-53q-2 10-6.5 19.5T619-402q-5 10-12 19t-15 17l26 46ZM480-480Zm-155-40q3-11 7.5-21.5T342-561q5-9 11.5-17t14.5-16l-26-46q-23-41-69.5-41T202-640q-23 41 0 80.5t70 39.5h53Zm363 0q47 0 70-39.5t0-80.5q-24-41-70.5-41T618-640l-26 46q8 8 14.5 16t11.5 17q5 9 9.5 19.5T635-520h53ZM437-634q11-3 21.5-4.5T480-640q11 0 21.5 1.5T523-634l27-46q23-39 0-79.5T480-800q-47 0-70 40t0 80l27 46Zm0 0q11-3 21.5-4.5T480-640q11 0 21.5 1.5T523-634q-11-3-21.5-4.5T480-640q-11 0-21.5 1.5T437-634Zm-96 232q-5-9-9-18.5t-7-19.5q3 10 7 19.5t9 18.5q5 10 12 19t15 17q-8-8-15-17t-12-19Zm-16-118q3-11 7.5-21.5T342-561q5-9 11.5-17t14.5-16q-8 8-14.5 16T342-561q-5 9-9.5 19.5T325-520Zm157 200q-10 0-20.5-1.5T440-326q11 3 21.5 4.5T482-320q11 0 21-1.5t21-4.5q-11 3-21 4.5t-21 1.5Zm110-46q8-8 15-17t12-19q5-9 9.5-18.5T635-440q-2 10-6.5 19.5T619-402q-5 10-12 19t-15 17Zm43-154q-3-11-7.5-21.5T618-561q-5-9-11.5-17T592-594q8 8 14.5 16t11.5 17q5 9 9.5 19.5T635-520Zm-98.5 96.5Q560-447 560-480t-23.5-56.5Q513-560 480-560t-56.5 23.5Q400-513 400-480t23.5 56.5Q447-400 480-400t56.5-23.5Z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute left-[10%] top-[33%] text-[#C5A572] opacity-35"
        animate={{
          y: [-10, 10, -10],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* coffee SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="40px"
          viewBox="0 -960 960 960"
          width="40px"
          fill="currentColor"
        >
          <path d="M440-240q-117 0-198.5-81.5T160-520v-240q0-33 23.5-56.5T240-840h500q58 0 99 41t41 99q0 58-41 99t-99 41h-20v40q0 117-81.5 198.5T440-240ZM240-640h400v-120H240v120Zm200 320q83 0 141.5-58.5T640-520v-40H240v40q0 83 58.5 141.5T440-320Zm280-320h20q25 0 42.5-17.5T800-700q0-25-17.5-42.5T740-760h-20v120ZM160-120v-80h640v80H160Zm280-440Z" />
        </svg>
      </motion.div>
    </div>
  );
}
