'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Home, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { useSession } from 'next-auth/react'

interface Course {
  id: string
  title: string
  description: string
  image: string
}

const allCourses: Course[] = [
  {
    id: '673474ed4fe9020760d6067c',
    title: 'Machine Learning',
    description: 'This course is a practical and hands-on introduction to Machine Learning with Python and Scikit-Learn for beginners with basic knowledge of Python and statistics.',
    image: '/machine.png'
  },
  {
    id: '6734756a4fe9020760d60684',
    title: 'Artificial Intelligence with Python',
    description: 'This course from Harvard University explores the concepts and algorithms at the foundation of modern artificial intelligence, diving into the ideas that give rise to technologies like large language models, game-playing engines, handwriting recognition, and machine translation.',
    image: '/ai.png'
  },
  {
    id: '673475e24fe9020760d6068b',
    title: 'MERN Stack Tutorial',
    description: 'Learn to build full-stack web applications using MongoDB, Express.js, React, and Node.js, AKA the MERN stack.',
    image: '/mern.png'
  },
]

const CourseCard = ({ course, onEnroll }: { course: Course, onEnroll: (courseId: string) => void }) => {
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
    >
      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          <CardDescription className='line-clamp-2'>{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            src={course.image}
            alt={course.title}
            width={300}
            height={200}
            className="rounded-md object-cover w-full"
          />
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => onEnroll(course.id)}>Enroll Now</Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function Courses() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onEnroll = async (courseId: string) => {
    if (!session?.user?.id) {
      alert("Please log in to enroll.")
      return
    }
    const userId = session.user.id

    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, userId }),
      })

      if (response.ok) {
        alert("Enrollment successful!")
      } else {
        alert("Enrollment failed. Please try again.")
      }
    } catch (error) {
      console.error("Error enrolling:", error)
      alert("An error occurred. Please try again.")
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-4">
              <BookOpen className="h-6 w-6" />
              <span className="text-lg font-semibold">AI Learning</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <Home className="h-5 w-5" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/courses">
                    <BookOpen className="h-5 w-5" />
                    Explore Courses
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {/* Add footer content if needed */}
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Explore Courses</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <SidebarTrigger />
            </div>
          </div>

          <section>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} onEnroll={onEnroll} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </SidebarProvider>
  )
}
