import CryptoJS from "crypto-js";
import type { ChatConversation, ChatMessage } from "./firebaseService";

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY as string;
const CONVERSATIONS_KEY = "haven_conversations";
const MESSAGES_KEY = "haven_messages";

function encryptData(data: any): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

function decryptData(encrypted: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const str = bytes.toString(CryptoJS.enc.Utf8);
    if (!str) return null;
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function getAllConversations(): ChatConversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    const parsed = decryptData(raw) ?? [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((conversation: any) => ({
      ...conversation,
      startedAt: new Date(conversation.startedAt),
      lastMessageAt: new Date(conversation.lastMessageAt)
    })) as ChatConversation[];
  } catch {
    return [];
  }
}

function getAllMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const parsed = decryptData(raw) ?? [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp)
    })) as ChatMessage[];
  } catch {
    return [];
  }
}

function saveConversations(conversations: ChatConversation[]) {
  localStorage.setItem(CONVERSATIONS_KEY, encryptData(conversations));
}

function saveMessages(messages: ChatMessage[]) {
  localStorage.setItem(MESSAGES_KEY, encryptData(messages));
}

export async function createConversation(
  userId: string,
  sessionType: string,
  aiPersonality: string
): Promise<string> {
  try {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const conversation: ChatConversation = {
      conversationId,
      userId,
      title: "New Conversation",
      startedAt: new Date(),
      lastMessageAt: new Date(),
      isActive: true,
      sessionType,
      aiPersonality
    };
    const existing = getAllConversations();
    saveConversations([...existing, conversation]);
    return conversationId;
  } catch (error) {
    console.error("localChatStorage.createConversation error:", error);
    return "";
  }
}

export async function addMessage(
  conversationId: string,
  sender: string,
  content: string,
  messageType: string,
  metadata?: any
): Promise<string> {
  try {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message: ChatMessage = {
      messageId,
      conversationId,
      sender,
      content,
      timestamp: new Date(),
      messageType,
      ...(metadata && { metadata })
    };
    const existing = getAllMessages();
    saveMessages([...existing, message]);

    const conversations = getAllConversations();
    const updated = conversations.map((c) =>
      c.conversationId === conversationId ? { ...c, lastMessageAt: new Date() } : c
    );
    saveConversations(updated);

    return messageId;
  } catch (error) {
    console.error("localChatStorage.addMessage error:", error);
    return "";
  }
}

export async function getConversationMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  try {
    const messages = getAllMessages();
    return messages
      .filter((m) => m.conversationId === conversationId)
      .sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  } catch (error) {
    console.error("localChatStorage.getConversationMessages error:", error);
    return [];
  }
}

export async function getUserConversations(
  userId: string
): Promise<ChatConversation[]> {
  try {
    const conversations = getAllConversations();
    return conversations
      .filter((c) => c.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
  } catch (error) {
    console.error("localChatStorage.getUserConversations error:", error);
    return [];
  }
}

export async function deleteConversation(
  conversationId: string
): Promise<void> {
  try {
    const conversations = getAllConversations().filter(
      (c) => c.conversationId !== conversationId
    );
    saveConversations(conversations);

    const messages = getAllMessages().filter((m) => m.conversationId !== conversationId);
    saveMessages(messages);
  } catch (error) {
    console.error("localChatStorage.deleteConversation error:", error);
  }
}
