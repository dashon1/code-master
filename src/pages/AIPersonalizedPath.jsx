import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Sparkles, Brain, CheckCircle, Play, Loader2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";
import CodeEditor from "../components/lessons/CodeEditor";

export default function AIPersonalizedPath() {
  const location = useLocation();
  const language = new URLSearchParams(location.search).get("language");
  
  const [user, setUser] = useState(null);
  const [skillProfile, setSkillProfile] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonPerformance, setLessonPerformance] = useState([]);

  useEffect(() => {
    loadData();
  }, [language]);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Get or create skill profile
      const profiles = await base44.entities.UserSkillProfile.filter({ user_email: userData.email });
      let profile = profiles[0];
      
      if (!profile) {
        profile = await base44.entities.UserSkillProfile.create({
          user_email: userData.email,
          skill_levels: { [language]: "beginner" },
          learning_style: "mixed"
        });
      }
      setSkillProfile(profile);

      // Load AI-generated lessons for this user and language
      const aiLessons = await base44.entities.Lesson.filter({ 
        language: language,
        course_slug: `ai-personalized-${userData.email}-${language}`
      }, "order");
      
      setLessons(aiLessons);

      // Load progress
      const progress = await base44.entities.UserProgress.filter({ 
        user_email: userData.email 
      });
      setUserProgress(progress);

      if (aiLessons.length > 0) {
        const nextLesson = aiLessons.find(l => !progress.some(p => p.lesson_id === l.id && p.completed));
        setCurrentLesson(nextLesson || aiLessons[aiLessons.length - 1]);
      } else {
        // Generate first batch of lessons
        await generateNextLessons(userData, profile, []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const generateNextLessons = async (userData, profile, existingLessons) => {
    setIsGenerating(true);
    try {
      const skillLevel = profile.skill_levels?.[language] || "beginner";
      const completedCount = existingLessons.length;
      
      // Analyze recent performance to adapt difficulty
      const recentPerformance = lessonPerformance.slice(-3);
      const avgPerformance = recentPerformance.length > 0 
        ? recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length 
        : 0.7;

      let adaptedLevel = skillLevel;
      if (avgPerformance > 0.9 && completedCount > 2) {
        adaptedLevel = skillLevel === "beginner" ? "intermediate" : "advanced";
      } else if (avgPerformance < 0.5 && completedCount > 2) {
        adaptedLevel = skillLevel === "intermediate" ? "beginner" : skillLevel;
      }

      const prompt = `You are an expert ${language} programming instructor. Generate 3 progressive ${language} lessons for a student at ${adaptedLevel} level.

Student Context:
- Current skill level: ${skillLevel}
- Lessons completed: ${completedCount}
- Learning style: ${profile.learning_style || "mixed"}
- Career goal: ${profile.career_goal || "general"}
${recentPerformance.length > 0 ? `- Recent performance: ${(avgPerformance * 100).toFixed(0)}% (adapting to ${adaptedLevel})` : ""}

Generate lessons that:
1. Build on previous concepts progressively
2. Include practical, real-world examples
3. Provide clear explanations and working code
4. Match the ${adaptedLevel} difficulty level

Return ONLY a JSON array with this structure:
[
  {
    "title": "Lesson Title",
    "content": "Full lesson content in markdown format with explanations",
    "code_example": "Working ${language} code example",
    "expected_output": "What the code outputs",
    "difficulty": "${adaptedLevel}",
    "order": ${completedCount + 1}
  }
]`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  code_example: { type: "string" },
                  expected_output: { type: "string" },
                  difficulty: { type: "string" },
                  order: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Save generated lessons
      const courseSlug = `ai-personalized-${userData.email}-${language}`;
      const newLessons = response.lessons || [];
      
      for (const lessonData of newLessons) {
        await base44.entities.Lesson.create({
          language: language,
          course_slug: courseSlug,
          title: lessonData.title,
          content: lessonData.content,
          code_example: lessonData.code_example,
          expected_output: lessonData.expected_output,
          order: lessonData.order,
          difficulty: lessonData.difficulty
        });
      }

      await loadData();
    } catch (error) {
      console.error("Error generating lessons:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const markLessonComplete = async (lessonId, performanceScore = 0.8) => {
    if (!user) return;
    
    try {
      await base44.entities.UserProgress.create({
        user_email: user.email,
        course_slug: currentLesson?.course_slug,
        lesson_id: lessonId,
        completed: true,
        completion_date: new Date().toISOString()
      });

      // Track performance for adaptation
      setLessonPerformance([...lessonPerformance, { lessonId, score: performanceScore }]);

      const nextLessonIndex = lessons.findIndex(l => l.id === lessonId) + 1;
      
      if (nextLessonIndex >= lessons.length) {
        // Generate more lessons
        await generateNextLessons(user, skillProfile, lessons);
      } else {
        setCurrentLesson(lessons[nextLessonIndex]);
        await loadData();
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return userProgress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getProgressPercentage = () => {
    if (lessons.length === 0) return 0;
    const completed = userProgress.filter(p => p.completed && 
      lessons.some(l => l.id === p.lesson_id)).length;
    return Math.round((completed / lessons.length) * 100);
  };

  const languageIcons = {
    python: "🐍",
    java: "☕",
    c: "⚡",
    javascript: "🟨",
    sql: "🗄️"
  };

  if (isGenerating && lessons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="relative mb-6">
              <Brain className="w-16 h-16 text-purple-600 mx-auto animate-pulse" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute top-0 right-1/3 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Creating Your Personalized Path
            </h3>
            <p className="text-gray-600 mb-6">
              AI is analyzing your skill level and generating custom {language} lessons just for you...
            </p>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-500">This will take about 10 seconds</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-purple-600" />
              <span className="text-4xl">{languageIcons[language]}</span>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Personalized {language.charAt(0).toUpperCase() + language.slice(1)} Path
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Progress value={getProgressPercentage()} className="flex-1 max-w-xs h-2 [&>div]:bg-purple-500" />
              <span className="text-sm font-medium text-purple-600">
                {getProgressPercentage()}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Adaptive Learning Powered by AI</h3>
                <p className="text-sm text-gray-600">
                  Your lessons are uniquely generated and adapt based on your performance. 
                  Complete lessons to unlock new ones tailored to your progress!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Lesson Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Your Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full text-left p-4 hover:bg-purple-50 transition-colors border-l-4 rounded-r-lg ${
                        currentLesson?.id === lesson.id 
                          ? 'border-purple-500 bg-purple-100' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isLessonCompleted(lesson.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isLessonCompleted(lesson.id) ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {lesson.difficulty}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {isGenerating && (
                    <div className="p-4 text-center">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-600 mx-auto" />
                      <p className="text-xs text-gray-500 mt-2">Generating more...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {currentLesson ? (
              <>
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          {currentLesson.title}
                        </CardTitle>
                        <p className="text-sm text-purple-600 mt-1 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          AI-Generated • {currentLesson.difficulty}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="prose prose-gray max-w-none">
                    <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
                  </CardContent>
                </Card>

                {currentLesson.code_example && (
                  <CodeEditor
                    initialCode={currentLesson.code_example}
                    language={language}
                    expectedOutput={currentLesson.expected_output}
                  />
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={() => markLessonComplete(currentLesson.id)}
                    disabled={isLessonCompleted(currentLesson.id) || isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg"
                  >
                    {isLessonCompleted(currentLesson.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Complete & Continue
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Lessons Yet
                  </h3>
                  <p className="text-gray-600">
                    Click the button below to generate your first personalized lesson!
                  </p>
                  <Button
                    onClick={() => generateNextLessons(user, skillProfile, lessons)}
                    disabled={isGenerating}
                    className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Lessons
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}