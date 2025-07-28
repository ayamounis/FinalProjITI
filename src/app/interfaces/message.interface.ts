export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'product' | 'image' | 'file';
  metadata?: {
    productId?: string;
    productType?: 'shirts' | 'pants' | 'hoodies' | 'mugs' | 'phone-cases';
    imageUrl?: string;
    quickReplies?: string[];
    isError?: boolean;
    retryable?: boolean;
    fileType?: string;
    fileName?: string;
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  isActive: boolean;
  sessionData?: {
    customerName?: string;
    customerEmail?: string;
    preferredProducts?: string[];
    currentDesign?: any;
  };
}

export interface BotResponse {
  message: string;
  suggestions?: string[];
  productRecommendations?: ProductRecommendation[];
  requiresFollowUp?: boolean;
  metadata?: {
    responseType?: 'greeting' | 'product_info' | 'support' | 'error';
    confidence?: number;
    processingTime?: number;
  };
}

export interface ProductRecommendation {
  id: string;
  name: string;
  type: 'shirts' | 'pants' | 'hoodies' | 'mugs' | 'phone-cases';
  description: string;
  imageUrl?: string;
  basePrice: number;
  customizationOptions: {
    colors: string[];
    sizes: string[];
    materials: string[];
  };
  popularity: number;
  tags: string[];
}

// إضافة interface للمنتجات المتاحة
export interface Product {
  id: string;
  name: string;
  type: 'shirts' | 'pants' | 'hoodies' | 'mugs' | 'phone-cases';
  description: string;
  basePrice: number;
  imageUrl: string;
  category: string;
  customizationOptions: CustomizationOptions;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

export interface CustomizationOptions {
  colors: ColorOption[];
  sizes: SizeOption[];
  materials: MaterialOption[];
  printAreas: PrintArea[];
  designOptions: DesignOption[];
}

export interface ColorOption {
  name: string;
  hexCode: string;
  available: boolean;
  additionalCost?: number;
}

export interface SizeOption {
  name: string;
  label: string;
  available: boolean;
  additionalCost?: number;
}

export interface MaterialOption {
  name: string;
  description: string;
  available: boolean;
  additionalCost?: number;
}

export interface PrintArea {
  name: string;
  description: string;
  maxWidth: number;
  maxHeight: number;
  additionalCost?: number;
}

export interface DesignOption {
  type: 'text' | 'image' | 'logo' | 'pattern';
  name: string;
  description: string;
  additionalCost?: number;
}

// إضافة interface لإعدادات الشات
export interface ChatSettings {
  language: 'en' | 'ar';
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
}

// إضافة interface للإحصائيات
export interface ChatStatistics {
  totalMessages: number;
  averageResponseTime: number;
  sessionDuration: number;
  userSatisfactionRating?: number;
  resolvedQueries: number;
  unResolvedQueries: number;
}

// إضافة interface لحالة التحميل
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

// إضافة interface للإشعارات
export interface ChatNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  autoHide: boolean;
  duration?: number;
}

// إضافة interface لبيانات المستخدم
export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  preferences: {
    favoriteProducts: string[];
    preferredColors: string[];
    budgetRange: {
      min: number;
      max: number;
    };
    communicationStyle: 'formal' | 'casual' | 'friendly';
  };
  orderHistory: OrderSummary[];
  chatHistory: ChatSession[];
}

export interface OrderSummary {
  id: string;
  products: {
    productId: string;
    quantity: number;
    customizations: any;
  }[];
  totalAmount: number;
  orderDate: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

// إضافة types للـ API responses
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
};

// إضافة enum للأنواع المختلفة من الرسائل
export enum MessageType {
  TEXT = 'text',
  PRODUCT = 'product',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  ERROR = 'error'
}

export enum ProductType {
  SHIRTS = 'shirts',
  PANTS = 'pants',
  HOODIES = 'hoodies',
  MUGS = 'mugs',
  PHONE_CASES = 'phone-cases'
}

export enum ChatEventType {
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  TYPING_START = 'typing_start',
  TYPING_END = 'typing_end',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended'
}