'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, 
         SidebarMenuItem, SidebarMenuButton, SidebarFooter, 
         SidebarProvider } from '@/components/ui/sidebar';
import { BookOpen, CheckCircle, Home, Library, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

interface Enrollment {
  courseId: string;
  completed: boolean;
  progress: number;
  quizScore?: number;
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
      return '/ai.png'; // fallback image
  }
};

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('/api/courses');
        setCourses(response.data.courses);
        
        // Convert enrollments array to a map
        const enrollmentMap = response.data.enrollments.reduce(
          (acc: Record<string, Enrollment>, enrollment: Enrollment) => {
            acc[enrollment.courseId] = enrollment;
            return acc;
          },
          {}
        );
        setEnrollments(enrollmentMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchData();
    }
  }, [session]);

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await axios.post(`/api/enroll/`,{
        courseId,
        userId: session?.user.id
      });
      setEnrollments(prev => ({
        ...prev,
        [courseId]: response.data.enrollment
      }));
      toast.success('Successfully enrolled in course');
      redirect(`/courses/${courseId}`);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    }
  };

  const getButtonConfig = (courseId: string) => {
    const enrollment = enrollments[courseId];

    if (!enrollment) {
      return {
        text: 'Start Learning',
        onClick: () => handleEnroll(courseId),
        disabled: false,
        variant: 'default' as const,
        href: undefined
      };
    }

    if (enrollment.completed) {
      return {
        text: 'Completed',
        onClick: undefined,
        disabled: true,
        variant: 'outline' as const,
        href: undefined,
        icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
      };
    }

    return {
      text: 'Continue Learning',
      onClick: undefined,
      disabled: false,
      variant: 'default' as const,
      href: `/courses/${courseId}`,
      icon: <BookOpen className="h-4 w-4 mr-2" />
    };
  };

  if (status === "loading" || loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen">
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 p-4">
                <Library className="h-6 w-6" />
                <span className="text-lg font-semibold">Learning Platform</span>
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
                    <Link href="/courses" className="bg-secondary">
                      <BookOpen className="h-5 w-5" />
                      All Courses
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
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!session) {
    redirect('/');
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-4">
              <Library className="h-6 w-6" />
              <span className="text-lg font-semibold">Learning Platform</span>
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
                  <Link href="/courses" className="bg-secondary">
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

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Available Courses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const buttonConfig = getButtonConfig(course.id);
                const enrollment = enrollments[course.id];
                const imageSource = getCourseImage(course.title);

                return (
                  <Card key={course.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {course.title}
                        {enrollment?.completed && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="relative w-full aspect-video mb-4 rounded-md overflow-hidden">
                        <Image
                          src={imageSource}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform hover:scale-105 duration-300"
                          onError={(e: any) => {
                            e.target.src = '/courseImages/default-course.jpg';
                          }}
                        />
                      </div>
                      <p className="text-gray-600">{course.description}</p>
                      {enrollment && !enrollment.completed && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(enrollment.progress)}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {enrollment?.completed && enrollment.quizScore && (
                        <div className="mt-4 bg-green-50 p-3 rounded-lg">
                          <p className="text-green-700 font-medium">
                            Quiz Score: {enrollment.quizScore}%
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {buttonConfig.href ? (
                        <Link href={buttonConfig.href} className="w-full">
                          <Button
                            className="w-full"
                            variant={buttonConfig.variant}
                            disabled={buttonConfig.disabled}
                          >
                            {buttonConfig.icon}
                            {buttonConfig.text}
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          className="w-full"
                          variant={buttonConfig.variant}
                          onClick={buttonConfig.onClick}
                          disabled={buttonConfig.disabled}
                        >
                          {buttonConfig.icon}
                          {buttonConfig.text}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}