'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Home, LogOut, Search, Settings, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { signOut, useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface Course {
  id: string
  title: string
  description: string
  progress: number
  image: string
}

const userCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to AI',
    description: 'Learn the basics of Artificial Intelligence',
    progress: 60,
    image: '/placeholder.svg'
  },
  {
    id: '2',
    title: 'Machine Learning Fundamentals',
    description: 'Understand core concepts of Machine Learning',
    progress: 30,
    image: '/placeholder.svg'
  },
]

const CourseCard = ({ course }: { course: Course }) => {
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
          <CardDescription>{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            src={course.image}
            alt={course.title}
            width={300}
            height={200}
            className="rounded-md object-cover"
          />
          {course.progress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            {course.progress > 0 ? 'Continue Course' : 'Start Course'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function Dashboard() {

  const {data : session} = useSession()

  if(!session) {
    redirect('/')
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button onClick={() => signOut()}>
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
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
            <h1 className="text-3xl font-bold">Welcome back, {session?.user.name}</h1>
            <SidebarTrigger />
          </div>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">Your Courses</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Explore More Courses</h2>
            <Button asChild>
              <Link href="/courses">Browse All Courses</Link>
            </Button>
          </section>
        </main>
      </div>
    </SidebarProvider>
  )
}