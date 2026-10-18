import React, { createContext, useContext, useState, useEffect } from 'react';
import { SoundFX } from '../game/SoundFX';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (val: number) => void;
}

const AudioContext = createContext<AudioContextType>({
  isMuted: false,
  toggleMute: () => {},
  volume: 0.5,
  setVolume: () => {}
});

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('odyssey_audio_muted') === 'true';
  });
  const [volume, setVolumeState] = useState<number>(0.5);

  useEffect(() => {
    SoundFX.setMuted(isMuted);
    localStorage.setItem('odyssey_audio_muted', isMuted ? 'true' : 'false');
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    SoundFX.setVolume(val);
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, volume, setVolume }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
