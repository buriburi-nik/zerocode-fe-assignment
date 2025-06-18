import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

function VoiceControls({ onVoiceInput, autoSpeak = true }) {
  const { toast } = useToast();
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: voiceRecognitionSupported,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: speechSynthesisSupported,
    voices,
    setSelectedVoice: setVoice,
    setRate,
    setPitch,
  } = useSpeechSynthesis();

  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const isSupported = voiceRecognitionSupported && speechSynthesisSupported;

  // Handle voice input completion
  useEffect(() => {
    if (transcript && !isListening) {
      onVoiceInput?.(transcript);
      resetTranscript();

      toast({
        title: "Voice input received",
        description: `"${transcript.substring(0, 50)}${transcript.length > 50 ? "..." : ""}"`,
      });
    }
  }, [transcript, isListening, onVoiceInput, resetTranscript, toast]);

  // Handle interim transcript display
  useEffect(() => {
    if (interimTranscript && isListening) {
      // Show interim results as toast for user feedback
      toast({
        title: "Listening...",
        description:
          interimTranscript.substring(0, 100) +
          (interimTranscript.length > 100 ? "..." : ""),
      });
    }
  }, [interimTranscript, isListening, toast]);

  // Handle voice recognition errors
  useEffect(() => {
    if (voiceError) {
      // Check if it's a network error and provide specific guidance
      const isNetworkError = voiceError.toLowerCase().includes("network");
      const isEdge =
        navigator.userAgent.includes("Edge") ||
        navigator.userAgent.includes("Edg/");

      let title = "Voice Recognition Error";
      let description = voiceError;

      if (isNetworkError) {
        title = "Speech Recognition Network Error";
        if (isEdge) {
          description =
            "Known issue with Edge browser. Try refreshing the page or using Chrome for better speech recognition.";
        } else {
          description =
            voiceError +
            " Check your internet connection and microphone permissions.";
        }
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    }
  }, [voiceError, toast]);

  // Initialize voice settings
  useEffect(() => {
    if (speechSynthesisSupported && voices.length > 0) {
      // Try to find a good default voice (prefer English)
      const englishVoice =
        voices.find(
          (voice) => voice.lang.startsWith("en") && voice.localService,
        ) ||
        voices.find((voice) => voice.lang.startsWith("en")) ||
        voices[0];

      if (englishVoice) {
        setVoice(englishVoice);
      }

      setRate(0.9); // Slightly slower for better understanding
      setPitch(1.0); // Normal pitch
    }
  }, [voices, speechSynthesisSupported, setVoice, setRate, setPitch]);

  const toggleListening = () => {
    if (!isSupported) {
      toast({
        title: "Voice features not supported",
        description:
          "Your browser does not support voice recognition and synthesis.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleVoiceOutput = () => {
    if (!speechSynthesisSupported) {
      toast({
        title: "Speech synthesis not supported",
        description: "Your browser does not support text-to-speech.",
        variant: "destructive",
      });
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      toast({
        title: "Voice output stopped",
        description: "Text-to-speech has been stopped.",
      });
    } else {
      const newVoiceEnabled = !voiceEnabled;
      setVoiceEnabled(newVoiceEnabled);

      if (newVoiceEnabled) {
        speak(
          "Voice output is now enabled. AI responses will be spoken aloud.",
        );
        toast({
          title: "Voice output enabled",
          description: "AI responses will now be spoken aloud.",
        });
      } else {
        toast({
          title: "Voice output disabled",
          description: "AI responses will no longer be spoken.",
        });
      }
    }
  };

  // Method to speak AI responses (called from parent component)
  const speakResponse = (text) => {
    if (voiceEnabled && speechSynthesisSupported && text) {
      speak(text);
    }
  };

  // Expose speakResponse method to parent
  useEffect(() => {
    if (typeof onVoiceInput === "function") {
      // Store the speakResponse function for parent access
      window.voiceControlsSpeakResponse = speakResponse;
    }

    return () => {
      if (window.voiceControlsSpeakResponse) {
        delete window.voiceControlsSpeakResponse;
      }
    };
  }, [voiceEnabled, speechSynthesisSupported]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleListening}
            disabled={!voiceRecognitionSupported}
            className={
              isListening
                ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                : "hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            }
          >
            {isListening ? (
              <div className="flex items-center space-x-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <Mic className="w-4 h-4" />
              </div>
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isListening
            ? "Stop voice input (listening...)"
            : "Start voice input"}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleVoiceOutput}
            disabled={!speechSynthesisSupported}
            className={
              voiceEnabled || isSpeaking
                ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            }
          >
            {isSpeaking ? (
              <div className="flex items-center space-x-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <Volume2 className="w-4 h-4" />
              </div>
            ) : voiceEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSpeaking
            ? "Speaking... (click to stop)"
            : voiceEnabled
              ? "Voice output enabled (click to disable)"
              : "Enable voice output for AI responses"}
        </TooltipContent>
      </Tooltip>

      {/* Show interim transcript while listening */}
      {isListening && interimTranscript && (
        <div className="text-xs text-gray-600 dark:text-gray-400 max-w-40 truncate">
          "{interimTranscript}"
        </div>
      )}
    </div>
  );
}

export default VoiceControls;
