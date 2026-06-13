import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Brain, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    pythonLevel: "",
    javaLevel: "",
    cLevel: "",
    javascriptLevel: "",
    sqlLevel: "",
    learningStyle: "",
    careerGoal: ""
  });

  const totalSteps = 7;

  const updateAnswer = (key, value) => {
    setAnswers({ ...answers, [key]: value });
  };

  const handleComplete = async () => {
    try {
      const user = await base44.auth.me();
      
      await base44.entities.UserSkillProfile.create({
        user_email: user.email,
        skill_levels: {
          python: answers.pythonLevel || "beginner",
          java: answers.javaLevel || "beginner",
          c: answers.cLevel || "beginner",
          javascript: answers.javascriptLevel || "beginner",
          sql: answers.sqlLevel || "beginner"
        },
        learning_style: answers.learningStyle || "mixed",
        career_goal: answers.careerGoal || "general"
      });

      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const canProgress = () => {
    switch(step) {
      case 1: return answers.pythonLevel !== "";
      case 2: return answers.javaLevel !== "";
      case 3: return answers.cLevel !== "";
      case 4: return answers.javascriptLevel !== "";
      case 5: return answers.sqlLevel !== "";
      case 6: return answers.learningStyle !== "";
      case 7: return answers.careerGoal !== "";
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md mb-4">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-900">Welcome to UCodeWise</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Let's Personalize Your Learning
          </h1>
          <p className="text-gray-600">
            Answer a few quick questions to help us tailor your experience
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-blue-600" />
        </div>

        {/* Question Cards */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && "🐍 Python Experience"}
              {step === 2 && "☕ Java Experience"}
              {step === 3 && "⚡ C Programming Experience"}
              {step === 4 && "🟨 JavaScript Experience"}
              {step === 5 && "🗄️ SQL Database Experience"}
              {step === 6 && "🎓 Learning Style"}
              {step === 7 && "🎯 Career Goal"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Python */}
            {step === 1 && (
              <RadioGroup value={answers.pythonLevel} onValueChange={(v) => updateAnswer("pythonLevel", v)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="beginner" id="py-beginner" />
                    <Label htmlFor="py-beginner" className="cursor-pointer flex-1">
                      <div className="font-semibold">Never coded before</div>
                      <div className="text-sm text-gray-500">I'm brand new to programming</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="intermediate" id="py-intermediate" />
                    <Label htmlFor="py-intermediate" className="cursor-pointer flex-1">
                      <div className="font-semibold">Some experience</div>
                      <div className="text-sm text-gray-500">I know basic syntax and concepts</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="advanced" id="py-advanced" />
                    <Label htmlFor="py-advanced" className="cursor-pointer flex-1">
                      <div className="font-semibold">Advanced</div>
                      <div className="text-sm text-gray-500">I've built projects and understand advanced concepts</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}

            {/* Java */}
            {step === 2 && (
              <RadioGroup value={answers.javaLevel} onValueChange={(v) => updateAnswer("javaLevel", v)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-orange-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="beginner" id="java-beginner" />
                    <Label htmlFor="java-beginner" className="cursor-pointer flex-1">
                      <div className="font-semibold">Never used Java</div>
                      <div className="text-sm text-gray-500">I'm new to Java</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-orange-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="intermediate" id="java-intermediate" />
                    <Label htmlFor="java-intermediate" className="cursor-pointer flex-1">
                      <div className="font-semibold">Some experience</div>
                      <div className="text-sm text-gray-500">I understand OOP and basic Java concepts</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-orange-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="advanced" id="java-advanced" />
                    <Label htmlFor="java-advanced" className="cursor-pointer flex-1">
                      <div className="font-semibold">Advanced</div>
                      <div className="text-sm text-gray-500">I've built applications with Java</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}

            {/* C */}
            {step === 3 && (
              <RadioGroup value={answers.cLevel} onValueChange={(v) => updateAnswer("cLevel", v)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="beginner" id="c-beginner" />
                    <Label htmlFor="c-beginner" className="cursor-pointer flex-1">
                      <div className="font-semibold">Never used C</div>
                      <div className="text-sm text-gray-500">I'm new to C programming</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="intermediate" id="c-intermediate" />
                    <Label htmlFor="c-intermediate" className="cursor-pointer flex-1">
                      <div className="font-semibold">Some experience</div>
                      <div className="text-sm text-gray-500">I understand pointers and memory management</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="advanced" id="c-advanced" />
                    <Label htmlFor="c-advanced" className="cursor-pointer flex-1">
                      <div className="font-semibold">Advanced</div>
                      <div className="text-sm text-gray-500">I've built systems-level programs</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}

            {/* JavaScript */}
            {step === 4 && (
              <RadioGroup value={answers.javascriptLevel} onValueChange={(v) => updateAnswer("javascriptLevel", v)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-yellow-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="beginner" id="js-beginner" />
                    <Label htmlFor="js-beginner" className="cursor-pointer flex-1">
                      <div className="font-semibold">Never used JavaScript</div>
                      <div className="text-sm text-gray-500">I'm new to JavaScript</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-yellow-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="intermediate" id="js-intermediate" />
                    <Label htmlFor="js-intermediate" className="cursor-pointer flex-1">
                      <div className="font-semibold">Some experience</div>
                      <div className="text-sm text-gray-500">I can build interactive web pages</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-yellow-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="advanced" id="js-advanced" />
                    <Label htmlFor="js-advanced" className="cursor-pointer flex-1">
                      <div className="font-semibold">Advanced</div>
                      <div className="text-sm text-gray-500">I've built full applications with frameworks</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}

            {/* SQL */}
            {step === 5 && (
              <RadioGroup value={answers.sqlLevel} onValueChange={(v) => updateAnswer("sqlLevel", v)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-emerald-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="beginner" id="sql-beginner" />
                    <Label htmlFor="sql-beginner" className="cursor-pointer flex-1">
                      <div className="font-semibold">Never used SQL</div>
                      <div className="text-sm text-gray-500">I'm new to databases</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-emerald-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="intermediate" id="sql-intermediate" />
                    <Label htmlFor="sql-intermediate" className="cursor-pointer flex-1">
                      <div className="font-semibold">Some experience</div>
                      <div className="text-sm text-gray-500">I can write basic queries and joins</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-emerald-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="advanced" id="sql-advanced" />
                    <Label htmlFor="sql-advanced" className="cursor-pointer flex-1">
                      <div className="font-semibold">Advanced</div>
                      <div className="text-sm text-gray-500">I can optimize queries and design databases</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}

            {/* Learning Style */}
            {step === 6 && (
              <RadioGroup value={answers.learningStyle} onValueChange={(v) => updateAnswer("learningStyle", v)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="visual" id="visual" />
                    <Label htmlFor="visual" className="cursor-pointer flex-1">
                      <div className="font-semibold">Visual Learner</div>
                      <div className="text-sm text-gray-500">I learn best with diagrams and visuals</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="hands_on" id="hands_on" />
                    <Label htmlFor="hands_on" className="cursor-pointer flex-1">
                      <div className="font-semibold">Hands-On Learner</div>
                      <div className="text-sm text-gray-500">I learn by doing and coding</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="theoretical" id="theoretical" />
                    <Label htmlFor="theoretical" className="cursor-pointer flex-1">
                      <div className="font-semibold">Theoretical Learner</div>
                      <div className="text-sm text-gray-500">I learn by understanding concepts deeply</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed" className="cursor-pointer flex-1">
                      <div className="font-semibold">Mixed Approach</div>
                      <div className="text-sm text-gray-500">I like a combination of all methods</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}

            {/* Career Goal */}
            {step === 7 && (
              <RadioGroup value={answers.careerGoal} onValueChange={(v) => updateAnswer("careerGoal", v)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="frontend_dev" id="frontend" />
                    <Label htmlFor="frontend" className="cursor-pointer flex-1">
                      <div className="font-semibold">Frontend Developer</div>
                      <div className="text-sm text-gray-500">Build user interfaces and web experiences</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="backend_dev" id="backend" />
                    <Label htmlFor="backend" className="cursor-pointer flex-1">
                      <div className="font-semibold">Backend Developer</div>
                      <div className="text-sm text-gray-500">Work with servers, databases, and APIs</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="fullstack_dev" id="fullstack" />
                    <Label htmlFor="fullstack" className="cursor-pointer flex-1">
                      <div className="font-semibold">Full-Stack Developer</div>
                      <div className="text-sm text-gray-500">Master both frontend and backend</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="data_science" id="data" />
                    <Label htmlFor="data" className="cursor-pointer flex-1">
                      <div className="font-semibold">Data Science / ML</div>
                      <div className="text-sm text-gray-500">Analyze data and build ML models</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="systems_programming" id="systems" />
                    <Label htmlFor="systems" className="cursor-pointer flex-1">
                      <div className="font-semibold">Systems Programming</div>
                      <div className="text-sm text-gray-500">Low-level programming and systems</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="interview_prep" id="interview" />
                    <Label htmlFor="interview" className="cursor-pointer flex-1">
                      <div className="font-semibold">Interview Preparation</div>
                      <div className="text-sm text-gray-500">Get ready for coding interviews</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="general" id="general" />
                    <Label htmlFor="general" className="cursor-pointer flex-1">
                      <div className="font-semibold">General Learning</div>
                      <div className="text-sm text-gray-500">Just exploring programming</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6"
          >
            Back
          </Button>
          
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProgress()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProgress()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}