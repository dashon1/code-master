import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Target } from "lucide-react";

export default function QuizGame({ game, onComplete, onClose }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  const questions = game.game_data?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  if (!game.game_data || !questions.length) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">⚠️ Quiz Data Missing</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">This quiz doesn't have valid questions configured yet.</p>
          <Button onClick={onClose} variant="outline">Back to Games</Button>
        </CardContent>
      </Card>
    );
  }

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setGameEnded(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = (optionIndex) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(optionIndex);
    const correct = optionIndex === currentQuestion.correct_answer;
    
    if (correct) {
      const points = Math.round(game.points / questions.length);
      setScore(score + points);
      setCorrectCount(correctCount + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        endGame();
      }
    }, 2000);
  };

  const endGame = () => {
    setGameEnded(true);
    setTimeout(() => {
      onComplete({
        score: score,
        completed: true,
        attempts: 1,
        completion_time: 0
      });
    }, 2000);
  };

  if (!gameStarted) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">❓ {game.title}</CardTitle>
          <p className="text-gray-600">{game.description}</p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{game.points}</div>
              <div className="text-sm text-gray-600">Max Points</div>
            </div>
          </div>
          <Button onClick={startGame} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl text-lg">
            <Target className="w-5 h-5 mr-2" />
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameEnded) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">🎉 Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{correctCount} / {questions.length}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={startGame} variant="outline" className="flex-1">Play Again</Button>
            <Button onClick={onClose} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white">Continue Learning</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Badge variant="outline">Question {currentQuestionIndex + 1} of {questions.length}</Badge>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold">{score} points</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Exit Game
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
          {currentQuestion.code && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-left">
              <pre>{currentQuestion.code}</pre>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options?.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              variant="outline"
              className={`p-4 h-auto text-left hover:bg-blue-50 transition-colors ${
                selectedAnswer !== null && index === currentQuestion.correct_answer 
                  ? 'bg-green-50 border-green-500 text-green-700' 
                  : selectedAnswer !== null && index === selectedAnswer 
                  ? 'bg-red-50 border-red-500 text-red-700' 
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-mono">{option}</span>
                {selectedAnswer !== null && index === currentQuestion.correct_answer && (
                  <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                )}
                {selectedAnswer !== null && index === selectedAnswer && index !== currentQuestion.correct_answer && (
                  <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                )}
              </div>
            </Button>
          ))}
        </div>
        {selectedAnswer !== null && currentQuestion.explanation && (
          <div className="bg-blue-50 border-l-4 border-blue-200 text-blue-700 p-4 rounded-lg">
            <p className="font-semibold">Explanation:</p>
            <p className="text-sm">{currentQuestion.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}