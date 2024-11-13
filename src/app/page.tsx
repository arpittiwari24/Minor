'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from "@/components/ui/button"
import { BookOpen, Video, Users, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { signIn, useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

interface TestimonialProps {
  content: string
  author: string
  rating: number
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}

const Testimonial = ({ content, author, rating }: TestimonialProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border p-6"
    >
      <div className="mb-4 flex">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-primary text-primary" />
        ))}
      </div>
      <p className="mb-4 text-muted-foreground">{content}</p>
      <p className="font-semibold">{author}</p>
    </motion.div>
  )
}

export default function Component() {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const {data: session} = useSession()

  if(session && session.user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center ">
      <header className="flex h-16 items-center justify-between w-full border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-6 w-6" />
          <span>Quizify</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline" href="#">
            Courses
          </Link>
          <Link className="text-sm font-medium hover:underline" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline" href="#">
            Pricing
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              ref={heroRef}
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className=""
            >
              <div className="flex flex-col items-center justify-center space-y-10 text-center">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold sm:text-5xl xl:text-6xl text-center">
                    Today learners change the world
                  </h1>
                  <p className=" text-muted-foreground md:text-xl text-center">
                    Choose from 100,000+ online video courses with new additions published every month
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" onClick={() => signIn("github")}>Get Started</Button>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        <section className="w-full bg-muted/50 py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold">Explore our features</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={<BookOpen className="h-6 w-6" />}
                title="Virtual Classroom"
                description="Interactive online learning environment with real-time collaboration"
              />
              <FeatureCard
                icon={<Video className="h-6 w-6" />}
                title="Audio & Video"
                description="High-quality video lessons and audio content for immersive learning"
              />
              <FeatureCard
                icon={<Users className="h-6 w-6" />}
                title="Group Learning"
                description="Collaborative learning experiences with peers worldwide"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold">What our students say</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Testimonial
                content="The AI-powered learning platform has transformed how I study. Highly recommended!"
                author="Alex Thompson"
                rating={5}
              />
              <Testimonial
                content="Incredible platform with personalized learning paths and engaging content."
                author="Sarah Chen"
                rating={5}
              />
              <Testimonial
                content="The interactive features and AI assistance make learning enjoyable and effective."
                author="Michael Rodriguez"
                rating={5}
              />
            </div>
          </div>
        </section>
        <section className="w-full bg-primary text-primary-foreground py-12 md:py-24 lg:py-32">
          <div className="container flex flex-col items-center gap-4 px-4 text-center md:px-6">
            <h2 className="text-3xl font-bold">Ready to start learning?</h2>
            <p className="max-w-[600px] text-primary-foreground/90 md:text-xl">
              Join thousands of learners already transforming their lives through AI-powered education
            </p>
            <Button size="lg" variant="secondary">
              Start Learning Today
            </Button>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2024 Quizify Platform. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}