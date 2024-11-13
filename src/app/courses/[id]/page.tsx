'use client';

import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';
import Link from 'next/link';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { BookOpen, Home } from 'lucide-react';

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
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isQuizAvailable, setIsQuizAvailable] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fetch course and enrollment details
    async function fetchCourse() {
      const courseResponse = await axios.get(`/api/courses/${params.id}`);
      setCourse(courseResponse.data.course);
      setEnrollment(courseResponse.data.enrollment);
    }
    fetchCourse();
  }, [params.id]);

  const handleProgressUpdate = async (e: any) => {
    const currentTime = e.target.getCurrentTime();
    const duration = e.target.getDuration();
    setProgress((currentTime / duration) * 100);

    // Update progress in the backend
    await axios.patch(`/api/enroll/${enrollment?.id}`, { progress });

    if (progress >= 95) {
      setIsQuizAvailable(true);
    }
  };

  const handleQuizSubmit = async () => {
    const response = await axios.post(`/api/enroll/${enrollment?.id}/quiz`, { score: quizScore });
    setEnrollment(response.data.enrollment);
    alert('Quiz score submitted!');
  };

  if (!course) return <p>Loading...</p>;

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
          <SidebarFooter>
            {/* Add footer content if needed */}
          </SidebarFooter>
        </Sidebar>
        <main className="overflow-y-auto p-8 w-full">
          <div className="mb-8 flex flex-col items-center justify-between">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
          </div>
          <div className="mb-4 flex justify-center">
    <YouTube
      videoId={course.videoUrl}
      opts={{
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          controls: 1,
        },
      }}
      onStateChange={handleProgressUpdate}
    //   style={{
    //     width: '100%',
    //     height: '100%',
    //   }}
    />
</div>
          <div className=''>
          <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.toFixed(2)}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${progress.toFixed(2)}%` }}
                />
              </div>
            </div>
          </div>
          {isQuizAvailable && (
            <div className="quiz-section mt-4">
              <h2 className="text-2xl font-semibold mb-2">Quiz</h2>
              <label className="block mb-2">Enter your score:</label>
              <input
                type="number"
                value={quizScore ?? ''}
                onChange={(e) => setQuizScore(parseInt(e.target.value))}
                className="border rounded p-1 mb-2"
              />
              <button onClick={handleQuizSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
                Submit Quiz
              </button>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
