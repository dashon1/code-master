import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, RotateCcw, Copy, Check, Keyboard } from "lucide-react";

export default function CodeEditor({ 
  initialCode = "", 
  language = "python",
  expectedOutput = "",
  onCodeChange 
}) {
  const [code, setCode] = useState(initialCode);
  const [userCode, setUserCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPractice, setShowPractice] = useState(true);

  const handleRunCode = async () => {
    setIsRunning(true);
    // Simulate code execution
    const codeToRun = showPractice && userCode ? userCode : code;
    setTimeout(() => {
      setOutput(expectedOutput || "Code executed successfully!");
      setIsRunning(false);
      onCodeChange?.(codeToRun);
    }, 1500);
  };

  const handleReset = () => {
    setCode(initialCode);
    setUserCode("");
    setOutput("");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyToInput = () => {
    setUserCode(code);
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
            Code Example
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="hover:bg-gray-100"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="hover:bg-gray-100"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={code}
            readOnly
            className="font-mono text-sm min-h-32 bg-gray-100 border-gray-200 cursor-default"
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-blue-50/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-blue-600" />
              Practice Typing
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPractice(!showPractice)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {showPractice ? "Hide" : "Show"}
            </Button>
          </CardTitle>
        </CardHeader>
        {showPractice && (
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 mb-2">
              Type or paste the code above to practice. Your code will be executed when you click Run.
            </div>
            <Textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="font-mono text-sm min-h-32 bg-white border-blue-200 focus:border-blue-400 transition-colors"
              placeholder={`Type or paste your ${language} code here...`}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCopyToInput}
                variant="outline"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Example
              </Button>
              <Button
                onClick={handleRunCode}
                disabled={isRunning || !userCode}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run My Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {output && (
        <Card className="border-0 shadow-lg bg-gray-900 text-green-400">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white">Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}