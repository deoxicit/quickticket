// @/utils/emailService.ts

interface TicketDetails {
    eventName: string;
    eventDate: string;
    ticketPrice: string;
    // Add any other relevant ticket details
  }
  
  export const sendTicketEmail = async (email: string, ticketDetails: TicketDetails): Promise<void> => {
    try {
      console.log('Sending email to', email, 'with details:', ticketDetails);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };