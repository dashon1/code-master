import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Award, CheckCircle, Lock, Download, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Certifications() {
  const [certifications, setCertifications] = useState([]);
  const [userCertificates, setUserCertificates] = useState([]);
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [certificationsData, certificatesData, userData, lessonsData, projectsData, gamesData, challengesData] = await Promise.all([
      base44.entities.Certification.list(),
      base44.entities.UserCertificate.list(),
      base44.auth.me().catch(() => null),
      base44.entities.UserProgress.list(),
      base44.entities.UserProjectProgress.list(),
      base44.entities.GameProgress.list(),
      base44.entities.UserChallengeProgress.list()
    ]);
    
    setCertifications(certificationsData);
    setUserCertificates(certificatesData);
    setUser(userData);
    
    // Calculate user progress
    const progress = {
      lessons: lessonsData.filter(l => l.user_email === userData?.email && l.completed).length,
      projects: projectsData.filter(p => p.user_email === userData?.email && p.status === "completed").length,
      games: gamesData.filter(g => g.user_email === userData?.email && g.completed).length,
      challenges: challengesData.filter(c => c.user_email === userData?.email && c.completed).length
    };
    
    setUserProgress(progress);
    setLoading(false);
  };

  const hasCertificate = (certificationId) => {
    return userCertificates.find(c => c.certification_id === certificationId && c.user_email === user?.email);
  };

  const canEarnCertification = (certification) => {
    const criteria = certification.criteria;
    return (
      (!criteria.lessons_required || userProgress.lessons >= criteria.lessons_required) &&
      (!criteria.projects_required || userProgress.projects >= criteria.projects_required) &&
      (!criteria.games_required || userProgress.games >= criteria.games_required) &&
      (!criteria.challenges_required || userProgress.challenges >= criteria.challenges_required)
    );
  };

  const getProgressPercentage = (certification) => {
    const criteria = certification.criteria;
    let completed = 0;
    let total = 0;

    if (criteria.lessons_required) {
      total++;
      if (userProgress.lessons >= criteria.lessons_required) completed++;
    }
    if (criteria.projects_required) {
      total++;
      if (userProgress.projects >= criteria.projects_required) completed++;
    }
    if (criteria.games_required) {
      total++;
      if (userProgress.games >= criteria.games_required) completed++;
    }
    if (criteria.challenges_required) {
      total++;
      if (userProgress.challenges >= criteria.challenges_required) completed++;
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const earnedCertificates = certifications.filter(c => hasCertificate(c.id));
  const availableCertificates = certifications.filter(c => !hasCertificate(c.id));

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
              <Award className="w-8 h-8 text-yellow-600" />
              <h1 className="text-3xl font-bold text-gray-900">Certifications</h1>
            </div>
            <p className="text-gray-600">
              Earn certificates to showcase your programming skills
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Certificates Earned</p>
                  <p className="text-3xl font-bold">{earnedCertificates.length}</p>
                </div>
                <Award className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Lessons Completed</p>
                  <p className="text-3xl font-bold">{userProgress.lessons || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Projects Done</p>
                  <p className="text-3xl font-bold">{userProgress.projects || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Games Won</p>
                  <p className="text-3xl font-bold">{userProgress.games || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earned Certificates */}
        {earnedCertificates.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-600" />
              Your Certificates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnedCertificates.map((certification) => {
                const certificate = hasCertificate(certification.id);
                
                return (
                  <Card key={certification.id} className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl">{certification.badge_icon || "🏆"}</span>
                        <Badge className="bg-yellow-500 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Earned
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{certification.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{certification.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full" disabled>
                          <Download className="w-4 h-4 mr-2" />
                          Download Certificate
                        </Button>
                        <Button variant="outline" className="w-full" disabled>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share on LinkedIn
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Certificates */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {earnedCertificates.length > 0 ? "More Certifications" : "Available Certifications"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCertificates.map((certification) => {
              const canEarn = canEarnCertification(certification);
              const progress = getProgressPercentage(certification);
              
              return (
                <Card key={certification.id} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  canEarn ? 'bg-green-50 border-2 border-green-300' : 'bg-white/90 backdrop-blur-sm'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">{certification.badge_icon || "🎓"}</span>
                      {canEarn ? (
                        <Badge className="bg-green-500 text-white">
                          Ready to Claim!
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{certification.title}</CardTitle>
                    <p className="text-gray-600 text-sm">{certification.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-bold">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 [&>div]:bg-green-500" />
                      </div>

                      <div className="space-y-2 text-sm">
                        <h4 className="font-semibold text-gray-900">Requirements:</h4>
                        {certification.criteria.lessons_required && (
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Complete {certification.criteria.lessons_required} lessons</span>
                            <CheckCircle className={`w-4 h-4 ${
                              userProgress.lessons >= certification.criteria.lessons_required ? 'text-green-500' : 'text-gray-300'
                            }`} />
                          </div>
                        )}
                        {certification.criteria.projects_required && (
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Complete {certification.criteria.projects_required} projects</span>
                            <CheckCircle className={`w-4 h-4 ${
                              userProgress.projects >= certification.criteria.projects_required ? 'text-green-500' : 'text-gray-300'
                            }`} />
                          </div>
                        )}
                        {certification.criteria.games_required && (
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Win {certification.criteria.games_required} games</span>
                            <CheckCircle className={`w-4 h-4 ${
                              userProgress.games >= certification.criteria.games_required ? 'text-green-500' : 'text-gray-300'
                            }`} />
                          </div>
                        )}
                        {certification.criteria.challenges_required && (
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Solve {certification.criteria.challenges_required} challenges</span>
                            <CheckCircle className={`w-4 h-4 ${
                              userProgress.challenges >= certification.criteria.challenges_required ? 'text-green-500' : 'text-gray-300'
                            }`} />
                          </div>
                        )}
                      </div>

                      {canEarn && (
                        <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                          Claim Certificate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {certifications.length === 0 && !loading && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Certifications Available
              </h3>
              <p className="text-gray-600">
                Certification programs will be added soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}