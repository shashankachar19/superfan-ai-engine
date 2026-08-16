import React, { useState, useEffect } from "react";
import { useUniverse } from "../../context/UniverseContext";
import { ApiClient } from "../../api/client";
import "./QuizGame.css";

interface QuizGameProps {
  onClose: () => void;
  mode?: "daily" | "deepdive";
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function QuizGame({ onClose, mode = "daily" }: QuizGameProps) {
  const { selectedUniverse } = useUniverse();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true);
        let userContext = "";
        try {
          const storedUser = localStorage.getItem("superfan_mock_user");
          if (storedUser) {
            const u = JSON.parse(storedUser);
            if (u.favorite_characters?.length > 0) {
              userContext = "Favorite Characters: " + u.favorite_characters.join(", ");
            }
          }
        } catch (e) {}

        const difficulty = mode === "deepdive" ? "hard" : "medium";
        const data = await ApiClient.generateQuiz(selectedUniverse.name, difficulty, userContext);
        setQuestions(data.questions);
      } catch (error) {
        console.error("Failed to load quiz", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuiz();
  }, [selectedUniverse.name]);

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks
    setSelectedAnswer(index);
    
    if (index === questions[currentIndex].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setIsGameOver(true);
    }
  };

  return (
    <div className="quiz-overlay" onClick={onClose}>
      <div 
        className="quiz-modal" 
        onClick={e => e.stopPropagation()}
        style={{ '--accent': selectedUniverse.accent, '--accent-glow': selectedUniverse.accentGlow } as React.CSSProperties}
      >
        <div className="quiz-header">
          <div className="quiz-title-area">
            <span className="quiz-icon">[?]</span>
            <div>
              <h3>{mode === "deepdive" ? "DEEP DIVE CHALLENGE" : "AI TRIVIA CHALLENGE"}</h3>
              <p>{selectedUniverse.name} Universe</p>
            </div>
          </div>
          <button className="quiz-close" onClick={onClose}>×</button>
        </div>

        <div className="quiz-body">
          {isLoading ? (
            <div className="quiz-loading">
              <div className="quiz-spinner" style={{ borderTopColor: selectedUniverse.accent }}></div>
              <p>Generating adaptive questions...</p>
            </div>
          ) : isGameOver ? (
            <div className="quiz-game-over">
              <h2>Quiz Complete!</h2>
              <div className="quiz-score-circle" style={{ borderColor: selectedUniverse.accent, color: selectedUniverse.accent, boxShadow: `0 0 20px ${selectedUniverse.accentGlow}` }}>
                {score} / {questions.length}
              </div>
              <p>You proved your knowledge of the {selectedUniverse.name} universe!</p>
              <button 
                className="quiz-btn-primary"
                onClick={onClose}
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          ) : (
            <div className="quiz-question-container">
              <div className="quiz-progress-text">
                Question {currentIndex + 1} of {questions.length}
              </div>
              <div className="quiz-progress-bar">
                <div 
                  className="quiz-progress-fill" 
                  style={{ 
                    width: `${((currentIndex) / questions.length) * 100}%`,
                    background: selectedUniverse.accent 
                  }}
                ></div>
              </div>
              
              <h2 className="quiz-question-text">{questions[currentIndex]?.question}</h2>
              
              <div className="quiz-options">
                {questions[currentIndex]?.options.map((option, idx) => {
                  let optionClass = "quiz-option";
                  let optionStyle: React.CSSProperties = {};
                  
                  if (selectedAnswer !== null) {
                    if (idx === questions[currentIndex].correctIndex) {
                      optionClass += " correct";
                    } else if (idx === selectedAnswer) {
                      optionClass += " incorrect";
                    }
                  } else {
                    optionClass += " selectable";
                  }

                  return (
                    <button 
                      key={idx} 
                      className={optionClass}
                      style={optionStyle}
                      onClick={() => handleAnswerSelect(idx)}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="quiz-feedback fade-in">
                  <div className={`quiz-feedback-title ${selectedAnswer === questions[currentIndex].correctIndex ? 'correct' : 'incorrect'}`}>
                    {selectedAnswer === questions[currentIndex].correctIndex ? 'Correct!' : 'Incorrect!'}
                  </div>
                  <p>{questions[currentIndex].explanation}</p>
                  <button 
                    className="quiz-btn-next"
                    onClick={handleNext}
                  >
                    {currentIndex < questions.length - 1 ? 'NEXT QUESTION' : 'SEE RESULTS'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
