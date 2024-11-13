import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming Prisma is set up in your project

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } } // Assuming course ID is provided in the params
) {
  try {
    const { questions } = await request.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty question list provided' }, { status: 400 });
    }

    // Validate that each question object has the required fields
    const validatedQuestions = questions.map((question: QuizQuestion) => {
      if (
        typeof question.id !== 'number' ||
        typeof question.question !== 'string' ||
        !Array.isArray(question.options) ||
        typeof question.correctAnswer !== 'number'
      ) {
        throw new Error('Invalid question format');
      }
      return question;
    });

    // Find the course by ID
    const course = await prisma.course.findUnique({
      where: { id: params.id }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Add questions to the course's quizData field
    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        quizData: validatedQuestions
      }
    });

    return NextResponse.json({ message: 'Quiz questions added successfully', course: updatedCourse });
  } catch (error) {
    console.error('Error adding quiz questions:', error);
    return NextResponse.json({ error: 'Failed to add quiz questions' }, { status: 500 });
  }
}
