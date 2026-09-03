export interface Leg {
  journeyLabel: string;
  fromStation: string;
  toStation: string;
  departure: Date;
  arrival: Date;
  platform: string | null;
}

export type Phase =
  | "start"
  | "loading-board"
  | "choosing-departure"
  | "loading-passlist"
  | "choosing-stop"
  | "arrived"
  | "error";
