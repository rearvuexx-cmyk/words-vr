export type Track = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  kicker: string;
  driveId?: string;
  youtubeId?: string;
};

export const TRACKS: Track[] = [
  {
    id: "words",
    title: "WORDS",
    artist: "RearVuez × Al3X MiX",
    duration: "4:27",
    kicker: "Sir, yes sir",
    driveId: "1IbOZzHCGOSntTL4crc55jzmiNYW3x6Pm",
  },
  {
    id: "floor",
    title: "The Dance Floor Knows",
    artist: "RearVuez",
    duration: "4:53",
    kicker: "Cut 2",
    driveId: "1ng5C_7haPWwmyU8-HV96fdGka4GSgHxY",
  },
  {
    id: "chk",
    title: "CHK N’ DKN",
    artist: "RearVuez × Al3X MiX",
    duration: "3:20",
    kicker: "Official video",
    driveId: "11L5yVgV72x8iXV9twBDucNle_1Ni2dqK",
  },
  {
    id: "people",
    title: "Found My People",
    artist: "RearVuez",
    duration: "5:00",
    kicker: "Original mix",
    youtubeId: "6q5fHjS-82U",
  },
];

export function filmSrc(track: Track): string {
  if (track.youtubeId) {
    return `https://www.youtube.com/embed/${track.youtubeId}?rel=0&modestbranding=1`;
  }
  if (track.driveId) {
    return `https://drive.google.com/file/d/${track.driveId}/preview`;
  }
  return "";
}

export function filmOpenUrl(track: Track): string {
  if (track.youtubeId) return `https://www.youtube.com/watch?v=${track.youtubeId}`;
  if (track.driveId) return `https://drive.google.com/file/d/${track.driveId}/view`;
  return "";
}
