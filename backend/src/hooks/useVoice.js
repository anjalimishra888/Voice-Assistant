import { useState, useEffect, useCallback, useRef } from 'react';

const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const noSpeechTimeoutRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition not supported in this browser. Try Chrome.');
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      if (noSpeechTimeoutRef.current) clearTimeout(noSpeechTimeoutRef.current);
      const result = event.results[0];
      if (result?.isFinal && result[0]?.transcript?.trim()) {
        const text = result[0].transcript;
        setTranscript(text);
        setIsListening(false);
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        setIsListening(false);
        return;
      }
      setVoiceError(`Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (noSpeechTimeoutRef.current) clearTimeout(noSpeechTimeoutRef.current);
    };
  }, []);

  const startListening = useCallback(() => {
    setVoiceError(null);
    setTranscript('');
    if (!recognitionRef.current) {
      setVoiceError('Speech recognition not available. Please use Chrome browser.');
      return;
    }
    try {
      const recognition = recognitionRef.current;
      // Abort any existing session first
      try { recognition.abort(); } catch {}
      // Small delay to ensure clean restart
      setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
          
          // Auto-stop after 10 seconds if no speech
          if (noSpeechTimeoutRef.current) clearTimeout(noSpeechTimeoutRef.current);
          noSpeechTimeoutRef.current = setTimeout(() => {
            try { recognition.stop(); } catch {}
            setIsListening(false);
          }, 10000);
        } catch (e) {
          setIsListening(false);
        }
      }, 100);
    } catch {
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (noSpeechTimeoutRef.current) clearTimeout(noSpeechTimeoutRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (!synthRef.current) { resolve(); return; }
      
      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Get a natural-sounding voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (v) => v.name.includes('Google UK English Female') || 
              v.name.includes('Google US English') ||
              v.name.includes('Samantha') ||
              v.name.includes('female')
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      synthRef.current.speak(utterance);
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (noSpeechTimeoutRef.current) clearTimeout(noSpeechTimeoutRef.current);
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    voiceError,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};

export default useVoice;