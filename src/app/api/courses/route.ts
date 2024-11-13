import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all courses and user's enrollments in parallel
    const [courses, enrollments] = await Promise.all([
      prisma.course.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          videoUrl: true,
        },
        orderBy: {
          title: 'desc'
        }
      }),
      prisma.enrollment.findMany({
        where: {
          userId: session.user.id
        },
        select: {
          courseId: true,
          completed: true,
          progress: true
        }
      })
    ]);

    return NextResponse.json({
      courses,
      enrollments
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}