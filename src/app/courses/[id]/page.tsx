'use client';

import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';
import Link from 'next/link';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, 
         SidebarMenuButton, SidebarFooter, SidebarProvider } from '@/components/ui/sidebar';
import { BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

interface Enrollment {
  id: string;
  progress: number;
  completed: boolean;
  quizScore?: number;
}

export default function Page({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isQuizAvailable, setIsQuizAvailable] = useState(false);
  const [progress, setProgress] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchCourse() {
      try {
        const courseResponse = await axios.get(`/api/courses/${params.id}`);
        setCourse(courseResponse.data.course);
        setEnrollment(courseResponse.data.enrollment);
        if (courseResponse.data.enrollment) {
          setProgress(courseResponse.data.enrollment.progress);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    }
    fetchCourse();
  }, [params.id]);

  const handleOnReady = (event: any) => {
    setPlayer(event.target);
    const duration = event.target.getDuration();
    setVideoDuration(duration);
    
    // Calculate the start time based on saved progress
    if (enrollment?.progress) {
      const startTimeInSeconds = (enrollment.progress / 100) * duration;
      // Seek to the saved position
      event.target.seekTo(startTimeInSeconds);
    }
  };

  const handleProgressUpdate = async (event: any) => {
    if (!player || !videoDuration) return;

    const currentTime = player.getCurrentTime();
    const newProgress = (currentTime / videoDuration) * 100;
    
    // Only update if progress has increased
    if (newProgress > progress) {
      setProgress(newProgress);

      // Update backend if progress has changed significantly (e.g., every 1%)
      if (Math.floor(newProgress) > Math.floor(progress)) {
        try {
          await axios.patch(`/api/enrollments/${enrollment?.id}`, {
            progress: newProgress
          });

          if (newProgress >= 95) {
            setIsQuizAvailable(true);
          }
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }
    }
  };

  const handleStartQuiz = () => {
    router.push(`/courses/${params.id}/quiz`);
  };

  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
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
          <SidebarFooter />
        </Sidebar>
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex flex-col items-center justify-between">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
            </div>
            
            <div className="mb-4 aspect-video">
              <YouTube
                videoId={course.videoUrl}
                opts={{
                  height: '100%',
                  width: '100%',
                  playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    controls: 1,
                  },
                }}
                onReady={handleOnReady}
                onStateChange={handleProgressUpdate}
                className="w-full h-full"
              />
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {progress >= 95 && !enrollment?.completed && (
                <div className="text-center">
                  <Button
                    onClick={handleStartQuiz}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    Start Quiz
                  </Button>
                </div>
              )}

              {enrollment?.completed && (
                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <p className="text-green-800 font-semibold">
                    Course Completed! Quiz Score: {enrollment.quizScore}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}