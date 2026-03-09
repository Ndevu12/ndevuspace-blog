import { ContactMessage, MessageFilters, MessageStats } from "@/types/message";

// Mock contact messages - these would come from your contact form submissions
const mockMessages: ContactMessage[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    subject: "Project Collaboration Opportunity",
    message: "Hi! I came across your portfolio and I'm really impressed with your work. I have a project that I think would be perfect for your skills. Would you be interested in discussing a potential collaboration? The project involves building a modern e-commerce platform with React and Node.js.",
    receivedAt: "2025-01-15T10:30:00Z",
    isRead: false,
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike.chen@techcorp.com",
    subject: "Job Opportunity - Senior Full Stack Developer",
    message: "Hello, we're looking for a talented full-stack developer to join our team at TechCorp. Your experience with React and TypeScript caught our attention. We'd love to schedule a call to discuss this opportunity. The role offers competitive salary and remote work options.",
    receivedAt: "2025-01-14T14:20:00Z",
    isRead: true,
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    email: "emma.r@startup.io",
    subject: "Freelance Web Development",
    message: "Hi! I'm reaching out regarding a freelance web development project. We need someone to help us build a responsive website for our startup. The timeline is flexible and we're looking for someone with strong React skills.",
    receivedAt: "2025-01-13T09:15:00Z",
    isRead: false,
  },
  {
    id: "4",
    name: "David Kim",
    email: "david@agency.com",
    message: "Hey there! I don't have a specific project in mind yet, but I wanted to connect and potentially collaborate in the future. I really like your design aesthetic and coding style.",
    receivedAt: "2025-01-12T16:45:00Z",
    isRead: true,
  },
  {
    id: "5",
    name: "Lisa Wang",
    email: "lisa.wang@company.com",
    subject: "Question about your blog post",
    message: "Hi! I read your recent blog post about React performance optimization and found it really helpful. I have a question about one of the techniques you mentioned - would you mind if I asked you about it?",
    receivedAt: "2025-01-11T11:30:00Z",
    isRead: false,
  },
  {
    id: "6",
    name: "Alex Thompson",
    email: "alex@freelancer.com",
    subject: "Portfolio Review and Feedback",
    message: "I've been following your work and would love to get some feedback on my own portfolio. Would you be willing to take a look and provide some constructive criticism?",
    receivedAt: "2025-01-10T13:20:00Z",
    isRead: true,
  },
  {
    id: "7",
    name: "Maria Garcia",
    email: "maria.garcia@nonprofit.org",
    subject: "Website Development for Non-Profit",
    message: "Hello! Our non-profit organization is looking for a developer to help us create a new website. We have a limited budget but are passionate about our cause. Would you be interested in discussing this opportunity?",
    receivedAt: "2025-01-09T08:45:00Z",
    isRead: false,
  },
  {
    id: "8",
    name: "James Wilson",
    email: "j.wilson@university.edu",
    subject: "Guest Lecture Request",
    message: "Good morning! I'm a professor at the University and would like to invite you to give a guest lecture to our computer science students about modern web development practices. Would you be available sometime next month?",
    receivedAt: "2025-01-08T10:15:00Z",
    isRead: false,
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Message Service - Mock API integration layer
 * This service acts as a bridge between components and data layer,
 * simulating real API calls with proper error handling and response formatting
 */

export class MessageService {
  private static instance: MessageService;

  private constructor() {}

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  /**
   * Private method to get messages with filtering
   */
  private async getMessagesData(filters: any = {}): Promise<ContactMessage[]> {
    await delay(800);
    
    let filteredMessages = [...mockMessages];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredMessages = filteredMessages.filter(message =>
        message.name.toLowerCase().includes(searchLower) ||
        message.email.toLowerCase().includes(searchLower) ||
        message.subject?.toLowerCase().includes(searchLower) ||
        message.message.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply read status filter
    if (filters.isRead !== undefined) {
      filteredMessages = filteredMessages.filter(message => message.isRead === filters.isRead);
    }
    
    // Sort by received date (newest first)
    return filteredMessages.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }

  /**
   * Private method to mark message as read
   */
  private async markAsReadData(id: string, isRead: boolean): Promise<ContactMessage> {
    await delay(500);
    
    const messageIndex = mockMessages.findIndex(message => message.id === id);
    if (messageIndex === -1) {
      throw new Error('Message not found');
    }
    
    mockMessages[messageIndex] = {
      ...mockMessages[messageIndex],
      isRead,
    };
    
    return mockMessages[messageIndex];
  }

  /**
   * Private method to delete message
   */
  private async deleteMessageData(id: string): Promise<void> {
    await delay(500);
    
    const messageIndex = mockMessages.findIndex(message => message.id === id);
    if (messageIndex === -1) {
      throw new Error('Message not found');
    }
    
    mockMessages.splice(messageIndex, 1);
  }

  /**
   * Private method to get unread count
   */
  private async getUnreadCountData(): Promise<number> {
    await delay(200);
    return mockMessages.filter(message => !message.isRead).length;
  }

  /**
   * Public method: Fetch messages with optional filtering
   */
  async fetchMessages(filters?: MessageFilters): Promise<ContactMessage[]> {
    try {
      const messages = await this.getMessagesData(filters);
      return messages;
    } catch (error) {
      console.error("MessageService: Failed to fetch messages", error);
      throw new Error("Failed to fetch messages. Please try again.");
    }
  }

  /**
   * Public method: Mark a message as read or unread
   */
  async markMessageAsRead(messageId: string, isRead: boolean): Promise<ContactMessage> {
    try {
      const updatedMessage = await this.markAsReadData(messageId, isRead);
      return updatedMessage;
    } catch (error) {
      console.error(`MessageService: Failed to mark message ${messageId} as ${isRead ? 'read' : 'unread'}`, error);
      throw new Error("Failed to update message status. Please try again.");
    }
  }

  /**
   * Public method: Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await this.deleteMessageData(messageId);
    } catch (error) {
      console.error(`MessageService: Failed to delete message ${messageId}`, error);
      throw new Error("Failed to delete message. Please try again.");
    }
  }

  /**
   * Public method: Get count of unread messages
   */
  async getUnreadMessagesCount(): Promise<number> {
    try {
      const count = await this.getUnreadCountData();
      return count;
    } catch (error) {
      console.error("MessageService: Failed to get unread messages count", error);
      return 0;
    }
  }

  /**
   * Public method: Get recent messages (last 5)
   */
  async getRecentMessages(): Promise<ContactMessage[]> {
    try {
      const messages = await this.fetchMessages();
      return messages.slice(0, 5);
    } catch (error) {
      console.error("MessageService: Failed to get recent messages", error);
      return [];
    }
  }
}

// Export singleton instance
export const messageService = MessageService.getInstance();
