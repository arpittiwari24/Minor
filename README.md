# Minor

## Project Description
Minor is an AI-powered learning platform designed to provide users with personalized learning paths, adaptive quizzes, and real-time feedback to help them master any subject. With features such as course enrollment, quiz generation, and progress tracking, it offers an interactive and engaging educational experience.

## Features and Functionality
- **User Authentication**: Secure login using GitHub OAuth.
- **Course Management**: Ability to create, retrieve, and manage courses, including quizzes.
- **Quiz Generation**: AI-generated quizzes based on course content.
- **Progress Tracking**: Users can track their progress through courses, including completed lessons and quiz scores.
- **Responsive Design**: Mobile-friendly interface for learning on-the-go.

## Technology Stack
- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Node.js, Next.js API routes
- **Database**: Prisma with PostgreSQL
- **Authentication**: NextAuth.js for OAuth authentication
- **AI Integration**: OpenAI's GPT-3.5-turbo for quiz generation

## Prerequisites
- Node.js (version 14 or higher)
- PostgreSQL database
- GitHub account for OAuth authentication
- OpenAI API key

## Installation Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/arpittiwari24/Minor.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Minor
   ```
3. Install the necessary dependencies:
   ```bash
   npm install
   ```
4. Set up your environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="your_database_connection_string"
   NEXTAUTH_SECRET="your_nextauth_secret"
   GITHUB_CLIENT_ID="your_github_client_id"
   GITHUB_CLIENT_SECRET="your_github_client_secret"
   OPENAI_API_KEY="your_openai_api_key"
   ```
5. Run the database migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Usage Guide
- Navigate to `http://localhost:3000` in your browser.
- Sign in with your GitHub account to access the platform.
- Explore available courses, enroll, and start learning.
- Complete quizzes to test your knowledge and track your progress.

## API Documentation
The API is structured using Next.js API routes. Below are some key endpoints:

- **Authentication**
  - `GET /api/auth/[...nextauth]`: Handles user authentication.

- **Courses**
  - `GET /api/courses`: Retrieves all courses.
  - `GET /api/courses/[id]`: Retrieves a specific course by ID.
  - `POST /api/courses`: Adds a new course.
  
- **Quizzes**
  - `POST /api/courses/[id]/quiz`: Submits answers for a quiz and returns the user's score.
  - `GET /api/courses/[id]/quiz`: Retrieves quiz questions for a specific course.

## Contributing Guidelines
1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add some feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a Pull Request to the main branch.

## License Information
This project does not currently specify a license. Please check back later for updates.

## Contact/Support Information
For any questions or support, feel free to reach out:
- Email: [your-email@example.com]
- GitHub: [arpittiwari24](https://github.com/arpittiwari24)
