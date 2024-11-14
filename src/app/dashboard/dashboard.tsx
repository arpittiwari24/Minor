'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Home, LogOut, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, 
         SidebarTrigger, SidebarFooter, SidebarMenu, SidebarMenuItem, 
         SidebarMenuButton } from "@/components/ui/sidebar"
import { signOut, useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  imageUrl: string;
}

interface EnrolledCourse {
  id: string;
  progress: number;
  completed: boolean;
  quizScore?: number | null;
  course: Course;
}


const getCourseImage = (title: string): string => {
  
  switch (title) {
    case 'Machine Learning':
      return '/machine.png';
    
    case 'Artificial Intelligence with Python':
      return '/ai.png';
    
    case 'MERN Stack Tutorial':
      return '/mern.png';

    default:
      return '/mern.png'; // fallback image
  }
};

const CourseCard = ({ enrollment }: { enrollment: EnrolledCourse }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const imageSource = getCourseImage(enrollment.course.title);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {enrollment.course.title}
            {enrollment.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
          <CardDescription>{enrollment.course.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="relative w-full aspect-video bg-gray-100 rounded-md overflow-hidden mb-4">
            <Image
              src={imageSource}
              alt={enrollment.course.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-4">
            {enrollment.completed ? (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-700 font-medium">
                  Completed • Score: {enrollment.quizScore}%
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{enrollment.progress.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link href={`/courses/${enrollment.course.id}`} className="w-full">
            <Button className="w-full" variant={enrollment.completed ? "outline" : "default"}>
              {enrollment.completed ? 'Review Course' : 'Continue Learning'}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await axios.get('/api/dashboard');
        setEnrolledCourses(response.data.enrolledCourses);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  }

  if (!session) {
    redirect('/')
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-4">
              <BookOpen className="h-6 w-6" />
              <span className="text-lg font-semibold">Quizify</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard" className="bg-secondary">
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
          <SidebarFooter className="p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-3xl font-bold">
                Welcome back, {session.user.name}
              </h1>
              <SidebarTrigger />
            </div>

            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-semibold">Your Courses</h2>
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="h-[400px] animate-pulse">
                      <div className="h-full bg-gray-100" />
                    </Card>
                  ))}
                </div>
              ) : enrolledCourses.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {enrolledCourses.map(enrollment => (
                    <CourseCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="py-8">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        No courses yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Get started by exploring our available courses
                      </p>
                      <Button asChild>
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* {enrolledCourses.length > 0 && (
              <section>
                <h2 className="mb-4 text-2xl font-semibold">Explore More Courses</h2>
                <Button asChild>
                  <Link href="/courses">Browse All Courses</Link>
                </Button>
              </section>
            )} */}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}