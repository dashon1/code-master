import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Target, Zap, CheckCircle, Trophy, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [user, setUser] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [challengesData, progressData, userData] = await Promise.all([
      base44.entities.Challenge.list("order"),
      base44.entities.UserChallengeProgress.list(),
      base44.auth.me().catch(() => null)
    ]);
    
    setChallenges(challengesData);
    setUserProgress(progressData);
    setUser(userData);
    setLoading(false);
  };

  const filteredChallenges = challenges.filter(challenge => 
    activeLanguage === "all" || challenge.language === activeLanguage
  );

  const getSeries = () => {
    const seriesMap = {};
    filteredChallenges.forEach(challenge => {
      if (!seriesMap[challenge.series_id]) {
        seriesMap[challenge.series_id] = [];
      }
      seriesMap[challenge.series_id].push(challenge);
    });
    return seriesMap;
  };

  const getSeriesProgress = (seriesId) => {
    const seriesChallenges = challenges.filter(c => c.series_id === seriesId);
    const completed = userProgress.filter(p => 
      p.user_email === user?.email && 
      p.series_id === seriesId && 
      p.completed
    ).length;
    
    return {
      total: seriesChallenges.length,
      completed,
      percentage: seriesChallenges.length > 0 ? Math.round((completed / seriesChallenges.length) * 100) : 0
    };
  };

  const isCompleted = (challengeId) => {
    return userProgress.some(p => 
      p.challenge_id === challengeId && 
      p.user_email === user?.email && 
      p.completed
    );
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-red-100 text-red-800"
    };
    return colors[difficulty] || colors.easy;
  };

  const getTotalCompleted = () => {
    return userProgress.filter(p => p.user_email === user?.email && p.completed).length;
  };

  const getCurrentStreak = () => {
    // Simple streak calculation based on recent completions
    const userCompletions = userProgress
      .filter(p => p.user_email === user?.email && p.completed)
      .sort((a, b) => new Date(b.completion_date) - new Date(a.completion_date));
    
    if (userCompletions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let completion of userCompletions) {
      const completionDate = new Date(completion.completion_date);
      completionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - completionDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const series = getSeries();

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Challenge Series</h1>
            </div>
            <p className="text-gray-600">
              Master programming concepts through progressive challenges
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Completed</p>
                  <p className="text-3xl font-bold">{getTotalCompleted()}</p>
                </div>
                <Trophy className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Current Streak</p>
                  <p className="text-3xl font-bold">{getCurrentStreak()} days</p>
                </div>
                <Flame className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Available</p>
                  <p className="text-3xl font-bold">{challenges.length}</p>
                </div>
                <Zap className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Language Tabs */}
        <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-4 bg-white/90 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                All Languages
              </TabsTrigger>
              <TabsTrigger value="python" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                🐍 Python
              </TabsTrigger>
              <TabsTrigger value="java" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                ☕ Java
              </TabsTrigger>
              <TabsTrigger value="c" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                ⚡ C
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeLanguage}>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading challenges...</p>
              </div>
            ) : Object.keys(series).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(series).map(([seriesId, seriesChallenges]) => {
                  const progress = getSeriesProgress(seriesId);
                  
                  return (
                    <Card key={seriesId} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl capitalize">
                                {seriesId.replace(/_/g, ' ')} Series
                              </CardTitle>
                              <p className="text-sm text-gray-600">
                                {progress.completed} / {progress.total} completed
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
                            {progress.percentage}%
                          </Badge>
                        </div>
                        <Progress value={progress.percentage} className="h-2 [&>div]:bg-purple-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {seriesChallenges.map((challenge, index) => (
                            <Card key={challenge.id} className={`border transition-all duration-300 ${
                              isCompleted(challenge.id) ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                      isCompleted(challenge.id) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {isCompleted(challenge.id) ? <CheckCircle className="w-5 h-5" /> : index + 1}
                                    </div>
                                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                                      {challenge.difficulty}
                                    </Badge>
                                  </div>
                                </div>
                                <h4 className="font-semibold mb-2 text-gray-900">{challenge.title}</h4>
                                <Link to={`${createPageUrl("ChallengeDetail")}?id=${challenge.id}`}>
                                  <Button size="sm" className="w-full" variant={isCompleted(challenge.id) ? "outline" : "default"}>
                                    {isCompleted(challenge.id) ? "Review" : "Solve"}
                                  </Button>
                                </Link>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Challenges Available
                  </h3>
                  <p className="text-gray-600">
                    Challenges will be added soon. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}