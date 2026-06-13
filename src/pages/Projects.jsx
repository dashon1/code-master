import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code, Clock, CheckCircle, Trophy, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [user, setUser] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [projectsData, progressData, userData] = await Promise.all([
      base44.entities.Project.list("order"),
      base44.entities.UserProjectProgress.list(),
      base44.auth.me().catch(() => null)
    ]);
    
    setProjects(projectsData);
    setUserProgress(progressData);
    setUser(userData);
    setLoading(false);
  };

  const getProjectProgress = (projectId) => {
    return userProgress.find(p => p.project_id === projectId && p.user_email === user?.email);
  };

  const filteredProjects = projects.filter(project => 
    activeLanguage === "all" || project.language === activeLanguage
  );

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800"
    };
    return colors[difficulty] || colors.beginner;
  };

  const getStatusIcon = (progress) => {
    if (!progress) return null;
    if (progress.status === "portfolio_ready") return <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
    if (progress.status === "completed") return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (progress.status === "in_progress") return <Code className="w-5 h-5 text-blue-500" />;
    return null;
  };

  const getCompletedCount = () => {
    return userProgress.filter(p => p.user_email === user?.email && p.status === "completed").length;
  };

  const getPortfolioCount = () => {
    return userProgress.filter(p => p.user_email === user?.email && p.status === "portfolio_ready").length;
  };

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
              <Code className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Real-World Projects</h1>
            </div>
            <p className="text-gray-600">
              Build practical applications and create your portfolio
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Available Projects</p>
                  <p className="text-3xl font-bold">{projects.length}</p>
                </div>
                <Code className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completed</p>
                  <p className="text-3xl font-bold">{getCompletedCount()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Portfolio Ready</p>
                  <p className="text-3xl font-bold">{getPortfolioCount()}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Language Tabs */}
        <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-4 bg-white/90 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                All Projects
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
                <p className="text-gray-600">Loading projects...</p>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => {
                  const progress = getProjectProgress(project.id);
                  
                  return (
                    <Card key={project.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift bg-white/90 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getDifficultyColor(project.difficulty)}>
                            {project.difficulty}
                          </Badge>
                          {getStatusIcon(progress)}
                        </div>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {project.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {project.estimated_hours || 4}h
                          </div>
                          {project.milestones && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              {project.milestones.length} milestones
                            </div>
                          )}
                        </div>

                        <Link to={`${createPageUrl("ProjectDetail")}?id=${project.id}`}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                            {progress?.status === "in_progress" ? "Continue Project" : 
                             progress?.status === "completed" ? "View Project" : 
                             "Start Project"}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Projects Available
                  </h3>
                  <p className="text-gray-600">
                    {activeLanguage === "all" 
                      ? "Projects will be added soon. Check back later!"
                      : `${activeLanguage.charAt(0).toUpperCase() + activeLanguage.slice(1)} projects will be added soon!`
                    }
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