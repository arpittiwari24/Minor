'use client'
import { signIn } from "next-auth/react";

export default function Hero() {
    return (
      <div className="relative isolate pt-14">
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Learn Faster with AI-Powered Quizzes
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Personalized learning paths, adaptive quizzes, and real-time feedback to help you master any subject.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button onClick={() => signIn("github")} className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                  Get started
                </button>
                <a href="/demo" className="text-sm font-semibold leading-6 text-gray-900">
                  Try Demo <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }