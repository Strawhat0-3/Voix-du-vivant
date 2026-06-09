import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AudioTrack {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  slug?: string;
}

interface AudioPlayerContextValue {
  current: AudioTrack | null;
  play: (track: AudioTrack) => void;
  close: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(
  undefined,
);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [current, setCurrent] = useState<AudioTrack | null>(null);

  const play = useCallback((track: AudioTrack) => setCurrent(track), []);
  const close = useCallback(() => setCurrent(null), []);

  const value = useMemo(
    () => ({ current, play, close }),
    [current, play, close],
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
};