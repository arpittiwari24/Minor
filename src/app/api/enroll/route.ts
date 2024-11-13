import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export  async function POST(req: Request) {
try {
    const { userId, courseId } = await req.json();
  
    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId, progress: 0, completed: false }
    });
    
    return NextResponse.json({ enrollment },{status: 201});
} catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Error enrolling'},{ status: 500 });
}
}
