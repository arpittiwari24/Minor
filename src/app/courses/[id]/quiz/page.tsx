'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface QuizState {
  questions: Question[];
  currentQuestion: number;
  answers: Record<number, number>;
  loading: boolean;
  submitting: boolean;
  score: number | null;
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [state, setState] = useState<QuizState>({
    questions: [],
    currentQuestion: 0,
    answers: {},
    loading: true,
    submitting: false,
    score: null
  });

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await axios.get(`/api/courses/${params.id}/quiz`);
        setState(prev => ({
          ...prev,
          questions: response.data.questions,
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to load quiz questions');
        router.push(`/courses/${params.id}`);
      }
    }
    fetchQuestions();
  }, [params.id, router]);

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answerIndex
      }
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(state.answers).length !== state.questions.length) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    setState(prev => ({ ...prev, submitting: true }));
    try {
      const response = await axios.post(`/api/courses/${params.id}/quiz`, {
        answers: state.answers
      });
      
      setState(prev => ({ ...prev, score: response.data.score }));
      toast.success(`Quiz completed! Your score: ${response.data.score}%`);
      
      // Redirect to course page after showing score
      setTimeout(() => {
        router.push(`/courses/${params.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    }
    setState(prev => ({ ...prev, submitting: false }));
  };

  if (state.loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4">Loading quiz questions...</p>
      </div>
    );
  }

  const progress = (Object.keys(state.answers).length / state.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Course Quiz</h1>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      
      {state.score !== null ? (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="pt-6 pb-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-green-800">
                Quiz Completed!
              </h2>
              <p className="text-xl">
                Your score: <span className="font-bold">{state.score}%</span>
              </p>
              <p className="text-gray-600">
                Redirecting to course page...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {state.questions.map((question, index) => (
            <Card key={question.id} className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  onValueChange={(value) => 
                    handleAnswerSelect(question.id, parseInt(value))
                  }
                  value={state.answers[question.id]?.toString()}
                  className="space-y-3"
                >
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-3 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                      <RadioGroupItem
                        value={optionIndex.toString()}
                        id={`q${question.id}-${optionIndex}`}
                      />
                      <Label 
                        htmlFor={`q${question.id}-${optionIndex}`}
                        className="flex-grow cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleSubmit}
              disabled={state.submitting || Object.keys(state.answers).length !== state.questions.length}
              className="px-8 py-3 text-lg"
            >
              {state.submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : 'Submit Quiz'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}