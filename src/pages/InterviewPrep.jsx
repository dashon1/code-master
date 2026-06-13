import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase, Clock, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function InterviewPrep() {
  const [problems, setProblems] = useState([]);
  const [user, setUser] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [problemsData, userData] = await Promise.all([
      base44.entities.InterviewProblem.list(),
      base44.auth.me().catch(() => null)
    ]);
    
    setProblems(problemsData);
    setUser(userData);
    setLoading(false);
  };

  const filteredProblems = problems.filter(problem => 
    (activeLanguage === "all" || problem.language === activeLanguage) &&
    (activeCategory === "all" || problem.category === activeCategory)
  );

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-red-100 text-red-800"
    };
    return colors[difficulty] || colors.easy;
  };

  const getCategoryIcon = (category) => {
    return "📊";
  };

  const categories = ["all", "arrays", "strings", "linked_lists", "trees", "sorting", "recursion", "dynamic_programming", "other"];

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
              <Briefcase className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Interview Preparation</h1>
            </div>
            <p className="text-gray-600">
              Practice coding interview problems and ace your technical interviews
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Get Interview Ready!</h2>
                <p className="text-indigo-100">
                  Practice common coding interview questions with timed challenges. Master data structures and algorithms
                  to succeed in technical interviews at top companies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Problems</p>
                  <p className="text-3xl font-bold">{problems.length}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Solved</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Success Rate</p>
                  <p className="text-3xl font-bold">0%</p>
                </div>
                <Target className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="capitalize"
                >
                  {category.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

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
                <p className="text-gray-600">Loading problems...</p>
              </div>
            ) : filteredProblems.length > 0 ? (
              <div className="space-y-4">
                {filteredProblems.map((problem, index) => (
                  <Card key={problem.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                              {index + 1}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{problem.title}</h3>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge className={getDifficultyColor(problem.difficulty)}>
                              {problem.difficulty}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {getCategoryIcon(problem.category)} {problem.category.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {problem.time_limit_minutes} min
                            </Badge>
                          </div>

                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {problem.problem_statement.substring(0, 200)}...
                          </p>
                        </div>

                        <Link to={`${createPageUrl("InterviewProblemDetail")}?id=${problem.id}`}>
                          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                            Solve Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Problems Available
                  </h3>
                  <p className="text-gray-600">
                    Interview problems will be added soon!
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