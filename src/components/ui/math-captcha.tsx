import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "./button";

interface MathCaptchaProps {
  onVerify: (isValid: boolean) => void;
  error?: string;
}

const generateMathProblem = () => {
  const operators = ["+", "-", "×"] as const;
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let num1: number, num2: number, answer: number;
  
  switch (operator) {
    case "+":
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      answer = num1 + num2;
      break;
    case "-":
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * num1);
      answer = num1 - num2;
      break;
    case "×":
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      break;
  }
  
  return { num1, num2, operator, answer };
};

export const MathCaptcha = ({ onVerify, error }: MathCaptchaProps) => {
  const [problem, setProblem] = useState(generateMathProblem);
  const [userAnswer, setUserAnswer] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const refreshProblem = useCallback(() => {
    setProblem(generateMathProblem());
    setUserAnswer("");
    setIsVerified(false);
    onVerify(false);
  }, [onVerify]);

  useEffect(() => {
    const numericAnswer = parseInt(userAnswer, 10);
    if (!isNaN(numericAnswer) && numericAnswer === problem.answer) {
      setIsVerified(true);
      onVerify(true);
    } else if (isVerified) {
      setIsVerified(false);
      onVerify(false);
    }
  }, [userAnswer, problem.answer, onVerify, isVerified]);

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-medium text-foreground">
        Verificação de segurança
      </label>
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border">
          <span className="font-mono text-base font-semibold text-foreground whitespace-nowrap">
            {problem.num1} {problem.operator} {problem.num2} =
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9-]/g, ""))}
            className="w-14 h-8 text-center font-mono text-base bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="?"
          />
          {isVerified && (
            <span className="text-green-500 text-lg">✓</span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={refreshProblem}
          className="h-9 w-9 shrink-0"
          title="Nova questão"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};
