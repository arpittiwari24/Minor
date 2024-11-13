// app/api/courses/[id]/quiz/route.ts
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

async function generateQuizQuestions(course: { title: string; description: string }) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a quiz generator. Generate 5 multiple-choice questions based on the course topic. 
        Return ONLY a JSON array of questions with this exact structure, no additional text or formatting:
        [
          {
            "id": 1,
            "question": "Question text here?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": 0
          }
        ]`
      },
      {
        role: "user",
        content: `Create a quiz for the course titled: "${course.title}" with description: "${course.description}"`
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('No content received from OpenAI');
  }

  // Parse and validate the response
  const parsedResponse = JSON.parse(content);
  const questions = parsedResponse.questions || parsedResponse;
  
  // Validate the structure of each question

  if (Array.isArray(questions)) {
    questions.forEach((question: { id: any; question: any; options: string | any[]; correctAnswer: any; }) => {
        if (!question.id || !question.question || !Array.isArray(question.options) || 
            question.options.length !== 4 || typeof question.correctAnswer !== 'number') {
          throw new Error('Invalid question format');
        }
      });
} else {
    return questions;
}

  return questions;
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      // Find the course and enrollment with correct query syntax
      const [course ] = await Promise.all([
        prisma.course.findUnique({
          where: { id: params.id }
        }),
      ]);
  
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
  
      let questions: QuizQuestion[];

      questions = course.quizData as QuizQuestion[];
  
      // Remove correct answers before sending to client
      const clientQuestions = questions.map(({ id, question, options }) => ({
        id,
        question,
        options
      }));
  
      return NextResponse.json({ questions: clientQuestions });
  
    } catch (error) {
      console.error('Error in quiz generation:', error);
      return NextResponse.json(
        { error: 'Failed to generate quiz' },
        { status: 500 }
      );
    }
  }

  export async function POST(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      // Get the user session
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      // Parse the request body
      const body = await request.json();
      const { answers } = body;
  
      // Fetch the course to get questions and check if the user is enrolled
      const course = await prisma.course.findUnique({
        where: { id: params.id },
        include: {
          enrollments: {
            where: {
              userId: session.user.id
            }
          }
        }
      });

      const enrollment = await prisma.enrollment.findFirst({
        where: { courseId: params.id, userId: session.user.id }
      });
  
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
  
      if (!course.enrollments?.[0]) {
        return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 });
      }
  
    //   if (!course.questions || course.questions.length === 0) {
    //     return NextResponse.json(
    //       { error: 'Quiz questions not found' },
    //       { status: 404 }
    //     );
    //   }
  
      // Initialize correct answer count
      let correctAnswers = 0;
  
      // Evaluate each answer against the course questions
      Object.entries(answers).forEach(([questionId, selectedAnswer]) => {
        const question = course.quizData.find(q => q.id === parseInt(questionId));
        if (question && question.correctAnswer === selectedAnswer) {
          correctAnswers++;
        }
      });
  
      // Calculate score as a percentage
      const score = Math.round((correctAnswers / course.quizData.length) * 100);
  
      // Update only the enrollment with score and completion status
      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: enrollment?.id },
        data: {
          completed: true,
          quizScore: score
        }
      });
  
      // Return the score and updated enrollment data
      return NextResponse.json({
        score,
        enrollment: updatedEnrollment
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return NextResponse.json(
        { error: 'Failed to submit quiz' },
        { status: 500 }
      );
    }
  }