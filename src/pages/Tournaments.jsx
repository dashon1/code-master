import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Calendar, Users, Award, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [userScores, setUserScores] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [tournamentsData, scoresData, userData] = await Promise.all([
      base44.entities.Tournament.list("-start_date"),
      base44.entities.UserTournamentScore.list(),
      base44.auth.me().catch(() => null)
    ]);
    
    setTournaments(tournamentsData);
    setUserScores(scoresData);
    setUser(userData);
    setLoading(false);
  };

  const getUserScore = (tournamentId) => {
    return userScores.find(s => s.tournament_id === tournamentId && s.user_email === user?.email);
  };

  const getStatusBadge = (tournament) => {
    const now = new Date();
    const start = new Date(tournament.start_date);
    const end = new Date(tournament.end_date);

    if (now < start) {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
    } else if (now >= start && now <= end) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
    }
  };

  const getTimeRemaining = (tournament) => {
    const now = new Date();
    const end = new Date(tournament.end_date);
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const activeTournaments = tournaments.filter(t => {
    const now = new Date();
    const end = new Date(t.end_date);
    return now <= end;
  });

  const pastTournaments = tournaments.filter(t => {
    const now = new Date();
    const end = new Date(t.end_date);
    return now > end;
  });

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
              <Trophy className="w-8 h-8 text-yellow-600" />
              <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
            </div>
            <p className="text-gray-600">
              Compete with other learners and climb the leaderboards
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Active Tournaments</p>
                  <p className="text-3xl font-bold">{activeTournaments.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Your Participations</p>
                  <p className="text-3xl font-bold">{userScores.filter(s => s.user_email === user?.email).length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Best Rank</p>
                  <p className="text-3xl font-bold">
                    {userScores.filter(s => s.user_email === user?.email && s.rank).length > 0
                      ? `#${Math.min(...userScores.filter(s => s.user_email === user?.email && s.rank).map(s => s.rank))}`
                      : "-"}
                  </p>
                </div>
                <Award className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Tournaments */}
        {activeTournaments.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-green-600" />
              Active Tournaments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTournaments.map((tournament) => {
                const userScore = getUserScore(tournament.id);
                
                return (
                  <Card key={tournament.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl">{tournament.title}</CardTitle>
                        {getStatusBadge(tournament)}
                      </div>
                      <p className="text-gray-600 text-sm">{tournament.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(tournament.start_date), 'MMM d')} - {format(new Date(tournament.end_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeRemaining(tournament)}</span>
                        </div>
                        {tournament.prize_description && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Award className="w-4 h-4" />
                            <span>{tournament.prize_description}</span>
                          </div>
                        )}
                      </div>

                      {userScore && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Your Progress</span>
                            <span className="text-sm font-bold text-blue-600">
                              {userScore.total_score} pts
                              {userScore.rank && ` • Rank #${userScore.rank}`}
                            </span>
                          </div>
                        </div>
                      )}

                      <Link to={`${createPageUrl("TournamentDetail")}?id=${tournament.id}`}>
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600">
                          {userScore ? "Continue" : "Join Tournament"}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Tournaments */}
        {pastTournaments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-gray-600" />
              Past Tournaments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastTournaments.map((tournament) => {
                const userScore = getUserScore(tournament.id);
                
                return (
                  <Card key={tournament.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl">{tournament.title}</CardTitle>
                        {getStatusBadge(tournament)}
                      </div>
                      <p className="text-gray-600 text-sm">{tournament.description}</p>
                    </CardHeader>
                    <CardContent>
                      {userScore && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Final Results</span>
                            <span className="text-sm font-bold text-gray-900">
                              {userScore.total_score} pts
                              {userScore.rank && ` • Rank #${userScore.rank}`}
                            </span>
                          </div>
                        </div>
                      )}

                      <Link to={`${createPageUrl("TournamentDetail")}?id=${tournament.id}`}>
                        <Button variant="outline" className="w-full">
                          View Results
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No Tournaments */}
        {tournaments.length === 0 && !loading && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Tournaments Available
              </h3>
              <p className="text-gray-600">
                Tournaments will be announced soon. Check back later!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}