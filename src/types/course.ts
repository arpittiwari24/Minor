export interface Course {
    id: string
    title: string
    description: string
    duration: string
    thumbnail: string
    lessons: Lesson[]
    quizzes: Quiz[]
  }
  
  export interface Lesson {
    id: string
    title: string
    content: string
    duration: string
    order: number
  }
  
  export interface Quiz {
    id: string
    title: string
    questions: Question[]
  }
  
  export interface Question {
    id: string
    text: string
    options: string[]
    correctOption: number
  }
  
  export interface CourseProgress {
    completed: boolean
    completedLessons: string[]
    quizScores: QuizScore[]
    certificateEligible: boolean
  }
  
  export interface QuizScore {
    quizId: string
    score: number
    completedAt: Date
  }
  