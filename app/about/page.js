"use client";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Login from "@/components/shared/Login";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

const about = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [signInClicked, setSignInClicked] = useState(false);
  const router = useRouter()
    const { data: session } = useSession();

  useEffect(() => {
    if(session){
      router.push("/")
    }
  }, [session, router])
  

  useEffect(() => {
    document.body.style.overflow = showLogin ? "hidden" : "auto";
  }, [showLogin]);
  return (
    <>
      <Navbar
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        signInClicked={signInClicked}
        setSignInClicked={setSignInClicked}
      />
      <div className="bg-black h-0.5 opacity-90"></div>
      <div className="min-h-screen bg-[#FFFDF9] text-[#1C1C1C]">
        {/* Hero Section */}
        <section className="text-center py-20 px-6">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Welcome, <span className="text-[#5A2A27]">Writer</span>
          </h1>
          <p className="mt-6 text-lg text-[#6A6A6A] max-w-2xl mx-auto leading-relaxed">
            A home for every writer, thinker, and storyteller. StoryHub is where
            your words find their audience — a timeless space built for
            creativity, clarity, and authenticity.
          </p>
        </section>

        {/* Vision Section */}
        <section className="bg-[#F8F3E9] py-16 px-8 rounded-t-[3rem]">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#5A2A27] mb-4">
                Our Vision
              </h2>
              <p className="text-[#6A6A6A] leading-relaxed">
                We believe stories have the power to move people, shape ideas,
                and leave a legacy. StoryHub’s mission is to provide a serene,
                elegant space where words take center stage and writers can
                express themselves freely.
              </p>
            </div>

            <div className="relative">
              <div className="bg-[#C5A572] opacity-30 rounded-full w-64 h-64 absolute -top-10 -left-10 blur-3xl"></div>
              <div className="bg-[#5A2A27] opacity-20 rounded-full w-72 h-72 absolute bottom-0 right-0 blur-3xl"></div>
              <div className="relative z-10 bg-white rounded-3xl shadow-md p-8">
                <h3 className="text-xl font-semibold mb-3">Our Core Values</h3>
                <ul className="list-disc pl-5 text-[#6A6A6A] space-y-2">
                  <li>Authenticity in expression</li>
                  <li>Elegance in design</li>
                  <li>Empathy in communication</li>
                  <li>Creativity in storytelling</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-[#5A2A27]">
            The Story Behind StoryHub
          </h2>
          <p className="text-[#6A6A6A] leading-relaxed max-w-3xl mx-auto">
            Born from a love for timeless writing and thoughtful design,
            StoryHub was crafted for those who believe that every idea deserves
            to be told beautifully. It combines elegance and simplicity to
            create a writing experience that feels as natural as pen and paper.
          </p>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-[#F6EFE3] text-[#1C1C1C] text-center">
          <h2 className="text-3xl font-bold mb-4">Your Words, Your Legacy</h2>
          <p className="text-lg text-[#6A6A6A] mb-8 max-w-2xl mx-auto leading-relaxed">
            Start writing with StoryHub and share your voice with the world —
            where every story becomes a part of something greater.
          </p>
          <button
            onClick={() => {
              setShowLogin(true);
            }}
            className="inline-block bg-[#C5A572] text-white font-medium px-6 py-3 rounded-full shadow-md hover:bg-[#b9985e] transition-colors"
          >
            Start Writing
          </button>
        </section>
        <AnimatePresence>
          {showLogin && (
            <div
              onClick={() => {
                setShowLogin(false);
                setSignInClicked(false);
              }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            >
              <Login />
            </div>
          )}
        </AnimatePresence>
      </div>
      <div className="bg-black h-0.5 opacity-90"></div>
      <Footer />
    </>
  );
};

export default about;
