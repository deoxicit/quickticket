export type Event = {
  id: bigint;
  creator: string;
  name: string;
  date: bigint;
  ticketPrice: bigint;
  maxParticipants: bigint;
  ticketsSold: bigint;
  isActive: boolean;
  imageUrl: string;
  description: string;
  location: string;
};
