import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Lightbulb, Code, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CodeEditor from "../components/lessons/CodeEditor";

export default function AIPracticeBuilder() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(0);

  // Form state
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("python");
  const [difficulty, setDifficulty] = useState("beginner");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [sessionsData, userData] = await Promise.all([
      base44.entities.CustomPracticeSession.list("-created_date"),
      base44.auth.me().catch(() => null)
    ]);
    
    setSessions(sessionsData.filter(s => s.user_email === userData?.email));
    setUser(userData);
    setLoading(false);
  };

  const generatePractice = async () => {
    if (!topic.trim() || !user) return;

    setGenerating(true);

    const prompt = `You are an expert programming instructor. Generate 5 progressive coding exercises for a ${difficulty} level student learning about: "${topic}" in ${language}.

For each exercise, provide:
1. A clear title
2. A detailed description explaining what to build
3. Starter code that provides a template
4. A complete solution
5. 2-3 progressive hints

Make sure exercises build on each other and are practical. Format your response as JSON:
{
  "exercises": [
    {
      "title": "string",
      "description": "string",
      "starter_code": "string",
      "solution": "string",
      "hints": ["string", "string", "string"]
    }
  ]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                starter_code: { type: "string" },
                solution: { type: "string" },
                hints: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    const session = await base44.entities.CustomPracticeSession.create({
      user_email: user.email,
      topic: topic,
      language: language,
      difficulty: difficulty,
      generated_exercises: result.exercises,
      completed_exercises: [],
      status: "ready"
    });

    setActiveSession(session);
    setSelectedExercise(0);
    setTopic("");
    setGenerating(false);
    loadData();
  };

  const markExerciseComplete = async (exerciseIndex) => {
    if (!activeSession) return;

    const completedExercises = [...(activeSession.completed_exercises || [])];
    if (!completedExercises.includes(exerciseIndex)) {
      completedExercises.push(exerciseIndex);
    }

    await base44.entities.CustomPracticeSession.update(activeSession.id, {
      completed_exercises: completedExercises,
      status: completedExercises.length === activeSession.generated_exercises.length ? "completed" : "in_progress"
    });

    setActiveSession({
      ...activeSession,
      completed_exercises: completedExercises
    });

    if (exerciseIndex < activeSession.generated_exercises.length - 1) {
      setSelectedExercise(exerciseIndex + 1);
    }
  };

  const isExerciseCompleted = (index) => {
    return activeSession?.completed_exercises?.includes(index);
  };

  if (activeSession) {
    const exercise = activeSession.generated_exercises[selectedExercise];

    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" onClick={() => setActiveSession(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-900">{activeSession.topic}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="capitalize">{activeSession.language}</Badge>
                <Badge variant="outline" className="capitalize">{activeSession.difficulty}</Badge>
                <span className="text-sm text-gray-600">
                  {activeSession.completed_exercises?.length || 0} / {activeSession.generated_exercises.length} completed
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Exercise List */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Exercises
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {activeSession.generated_exercises.map((ex, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedExercise(index)}
                        className={`w-full text-left p-4 hover:bg-purple-50 transition-colors border-l-4 rounded-r-lg ${
                          selectedExercise === index 
                            ? 'border-purple-500 bg-purple-100' 
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isExerciseCompleted(index)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isExerciseCompleted(index) ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {ex.title}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exercise Content */}
            <div className="lg:col-span-3 space-y-8">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {exercise.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{exercise.description}</p>
                  
                  {exercise.hints && exercise.hints.length > 0 && (
                    <div className="mt-4">
                      <details className="group">
                        <summary className="flex items-center gap-2 cursor-pointer text-purple-600 font-medium hover:text-purple-700">
                          <Lightbulb className="w-4 h-4" />
                          Show Hints
                        </summary>
                        <div className="mt-3 space-y-2 pl-6">
                          {exercise.hints.map((hint, i) => (
                            <p key={i} className="text-sm text-gray-600">
                              {i + 1}. {hint}
                            </p>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </CardContent>
              </Card>

              <CodeEditor
                initialCode={exercise.starter_code}
                language={activeSession.language}
              />

              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  disabled={selectedExercise === 0}
                  onClick={() => setSelectedExercise(selectedExercise - 1)}
                >
                  Previous Exercise
                </Button>
                <Button
                  onClick={() => markExerciseComplete(selectedExercise)}
                  disabled={isExerciseCompleted(selectedExercise)}
                  className="bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600"
                >
                  {isExerciseCompleted(selectedExercise) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    "Mark Complete"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">AI Practice Builder</h1>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">NEW</Badge>
            </div>
            <p className="text-gray-600">
              Tell us what you want to learn, and AI will create custom practice exercises for you
            </p>
          </div>
        </div>

        {/* Create New Session */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-violet-600 text-white mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Create Custom Practice</h2>
                <p className="text-purple-100">
                  Describe what you want to learn and our AI will generate personalized exercises
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">What do you want to learn?</label>
                <Textarea
                  placeholder="e.g., 'recursion and backtracking', 'file I/O operations', 'object-oriented design patterns'..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">🐍 Python</SelectItem>
                      <SelectItem value="java">☕ Java</SelectItem>
                      <SelectItem value="c">⚡ C</SelectItem>
                      <SelectItem value="javascript">🟨 JavaScript</SelectItem>
                      <SelectItem value="sql">🗄️ SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generatePractice}
                disabled={!topic.trim() || generating}
                className="w-full bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Exercises...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Practice Exercises
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previous Sessions */}
        {sessions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Practice Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <Card key={session.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{session.topic}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className="capitalize">{session.language}</Badge>
                          <Badge variant="outline" className="capitalize">{session.difficulty}</Badge>
                        </div>
                      </div>
                      {session.status === "completed" && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-bold">
                          {session.completed_exercises?.length || 0} / {session.generated_exercises?.length || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${((session.completed_exercises?.length || 0) / (session.generated_exercises?.length || 1)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setActiveSession(session);
                        setSelectedExercise(session.completed_exercises?.length || 0);
                      }}
                      className="w-full"
                      variant={session.status === "completed" ? "outline" : "default"}
                    >
                      {session.status === "completed" ? "Review" : "Continue"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}