import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's enrolled courses with all necessary information
    const enrolledCourses = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            videoUrl: true,
          }
        }
      }
    });

    return NextResponse.json({ enrolledCourses });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}