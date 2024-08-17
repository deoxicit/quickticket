export interface Event {
    id: string;
    name: string;
    displayPicture: string;
    dateTime: string;
    description: string;
    maxParticipants: number;
    ticketPrice: string;
    location: string;
    mainGuests: string[];
  }