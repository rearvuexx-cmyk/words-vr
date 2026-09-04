import { create } from "zustand";
import { TRACKS, type Track } from "@/lib/tracks";

export const moveStick = { x: 0, y: 0 };

type FloorSession = {
  entered: boolean;
  cinema: boolean;
  trackId: string;
  vrSupported: boolean;
  enter: () => void;
  setCinema: (open: boolean) => void;
  setTrack: (id: string) => void;
  setVrSupported: (v: boolean) => void;
  track: () => Track;
};

export const useFloor = create<FloorSession>((set, get) => ({
  entered: false,
  cinema: false,
  trackId: TRACKS[0].id,
  vrSupported: false,
  enter: () => set({ entered: true }),
  setCinema: (cinema) => set({ cinema }),
  setTrack: (trackId) => set({ trackId }),
  setVrSupported: (vrSupported) => set({ vrSupported }),
  track: () => TRACKS.find((t) => t.id === get().trackId) ?? TRACKS[0],
}));
