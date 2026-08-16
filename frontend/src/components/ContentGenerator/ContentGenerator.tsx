import React, { useState, useEffect } from "react";
import { useUniverse } from "../../context/UniverseContext";
import { ApiClient } from "../../api/client";
import { BookOpen, Smile, Clapperboard, PenTool, Image as ImageIcon, Smartphone } from "lucide-react";
import "./ContentGenerator.css";

interface ContentGeneratorProps {
  onClose: () => void;
  initialPrompt?: string;
}

const CONTENT_TYPES = [
  { id: "story", label: "Story", icon: BookOpen },
  { id: "meme_caption", label: "Meme", icon: Smile },
  { id: "poster_tagline", label: "Poster", icon: Clapperboard },
  { id: "fan_fiction", label: "Fan Fiction", icon: PenTool },
  { id: "wallpaper_description", label: "Wallpaper", icon: ImageIcon },
  { id: "social_post", label: "Social Post", icon: Smartphone },
];

export default function ContentGenerator({ onClose, initialPrompt = "" }: ContentGeneratorProps) {
  const { selectedUniverse } = useUniverse();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [contentType, setContentType] = useState("story");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [displayedContent, setDisplayedContent] = useState("");

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedContent(null);
    setGeneratedImage(null);
    setDisplayedContent("");

    try {
      const response = await ApiClient.generateContent(selectedUniverse.name, prompt, contentType);
      setGeneratedContent(response.content);
      if (response.image_url) setGeneratedImage(response.image_url);
    } catch (error) {
      console.error("Content generation failed:", error);
      setGeneratedContent("An error occurred while connecting to the creative core. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Typewriter effect
  useEffect(() => {
    if (generatedContent) {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedContent(generatedContent.substring(0, i));
        i += 3; // Speed of typing
        if (i > generatedContent.length) {
          clearInterval(interval);
          setDisplayedContent(generatedContent);
        }
      }, 10);
      return () => clearInterval(interval);
    }
  }, [generatedContent]);

  const currentType = CONTENT_TYPES.find(t => t.id === contentType) || CONTENT_TYPES[0];

  return (
    <div className="content-gen-overlay" onClick={onClose}>
      <div 
        className="content-gen-modal" 
        onClick={e => e.stopPropagation()}
        style={{ '--accent': selectedUniverse.accent, '--accent-glow': selectedUniverse.accentGlow } as React.CSSProperties}
      >
        <div className="content-gen-header">
          <div className="content-gen-title-area">
            <span className="content-gen-icon"><currentType.icon size={32} /></span>
            <div>
              <h3>AI {currentType.label.toUpperCase()} STUDIO</h3>
              <p>Generating in the {selectedUniverse.name} universe</p>
            </div>
          </div>
          <button className="content-gen-close" onClick={onClose}>×</button>
        </div>

        {/* Content Type Selector */}
        <div className="content-type-tabs">
          {CONTENT_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => { setContentType(type.id); setGeneratedContent(null); setDisplayedContent(""); }}
                className={`content-type-tab ${contentType === type.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        <div className="content-gen-body">
          {!generatedContent && !isGenerating ? (
            <div className="content-gen-prompt-state">
              <div className="prompt-suggestions">
                <h4>Try asking for:</h4>
                <div className="suggestion-chips">
                  {contentType === "story" && (
                    <>
                      <button onClick={() => setPrompt("Write an epic battle scene between the main characters.")}>An Epic Battle</button>
                      <button onClick={() => setPrompt("Write a quiet, emotional character moment.")}>An Emotional Moment</button>
                      <button onClick={() => setPrompt("Create a funny 'what if' scenario crossover.")}>A 'What If' Scenario</button>
                    </>
                  )}
                  {contentType === "meme_caption" && (
                    <>
                      <button onClick={() => setPrompt("The main character being overpowered")}>OP Main Character</button>
                      <button onClick={() => setPrompt("Filler episodes be like")}>Filler Pain</button>
                      <button onClick={() => setPrompt("When your favorite character finally gets screen time")}>Screen Time Joy</button>
                    </>
                  )}
                  {contentType === "poster_tagline" && (
                    <>
                      <button onClick={() => setPrompt("The final battle - everything on the line")}>Final Battle Poster</button>
                      <button onClick={() => setPrompt("The hero's origin story")}>Origin Story</button>
                      <button onClick={() => setPrompt("Villain redemption arc")}>Villain Redemption</button>
                    </>
                  )}
                  {contentType === "fan_fiction" && (
                    <>
                      <button onClick={() => setPrompt("A crossover where characters from two universes meet")}>Crossover Event</button>
                      <button onClick={() => setPrompt("What happened after the final episode")}>After the Ending</button>
                      <button onClick={() => setPrompt("A slice of life day with the main cast")}>Slice of Life</button>
                    </>
                  )}
                  {contentType === "wallpaper_description" && (
                    <>
                      <button onClick={() => setPrompt("The hero standing against a sunset")}>Heroic Sunset</button>
                      <button onClick={() => setPrompt("An intense battle scene with dynamic poses")}>Battle Scene</button>
                      <button onClick={() => setPrompt("A peaceful moment with the whole crew")}>Crew Together</button>
                    </>
                  )}
                  {contentType === "social_post" && (
                    <>
                      <button onClick={() => setPrompt("Hot take about the main character's decisions")}>Hot Take</button>
                      <button onClick={() => setPrompt("Appreciation post for the best arc")}>Arc Appreciation</button>
                      <button onClick={() => setPrompt("Power ranking of the top 5 characters")}>Power Rankings</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="content-gen-result-state">
              {isGenerating ? (
                <div className="generating-indicator">
                  <div className="gen-spinner" style={{ borderTopColor: selectedUniverse.accent }}></div>
                  <p>Channeling the creative core...</p>
                </div>
              ) : (
                <div className="generated-story-container">
                  {generatedImage && (
                    <div className="generated-image-container mb-6">
                      <img src={generatedImage} alt="Generated visual content" className="w-full max-h-[40vh] object-cover rounded-sm border border-accentBorder" />
                    </div>
                  )}
                  <div className="story-text">
                    {displayedContent.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                  <button
                    onClick={() => { setGeneratedContent(null); setGeneratedImage(null); setDisplayedContent(""); }}
                    className="regenerate-btn"
                  >
                    ← Generate Another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <form className="content-gen-footer" onSubmit={handleGenerate}>
          <textarea 
            placeholder={`Describe the ${currentType.label.toLowerCase()} you want to create...`}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={isGenerating}
            rows={2}
          />
          <button 
            type="submit" 
            className="generate-btn"
            disabled={!prompt.trim() || isGenerating}
            style={{ 
              background: (!prompt.trim() || isGenerating) ? 'rgba(255,255,255,0.1)' : selectedUniverse.accent,
              color: (!prompt.trim() || isGenerating) ? 'rgba(255,255,255,0.3)' : '#000',
              boxShadow: (!prompt.trim() || isGenerating) ? 'none' : `0 0 20px ${selectedUniverse.accentGlow}`
            }}
          >
            GENERATE
          </button>
        </form>
      </div>
    </div>
  );
}

