import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage, ChatSession, BotResponse } from './interfaces/message.interface';

type ProductType = 'shirts' | 'pants' | 'hoodies' | 'mugs' | 'phone-cases';

interface ProductInfo {
  name: string;
  description: string;
  priceRange: string;
  materials: string[];
  sizes: string[];
  colors: string[];
  features: string[];
  compatibility?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
 // using mock responses
  
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  
  private currentSession: ChatSession | null = null;

  // معلومات الموقع مضمنة مباشرة
  private readonly websiteDetails = `
Welcome to CustomCraft - Your Ultimate Custom Product Store!

About Our Store:
We specialize in creating personalized, custom-made products that reflect your unique style and personality. Our mission is to provide high-quality customizable items that allow you to express yourself creatively.

Available Products:
1. T-Shirts - Custom printed shirts with your own designs, text, or images
   - Materials: 100% Cotton, Cotton blend, Premium organic cotton
   - Sizes: XS, S, M, L, XL, XXL, 3XL
   - Colors: White, Black, Navy, Red, Blue, Green, Gray, Yellow, Purple
   - Price: $15.99 - $35.99

2. Pants - Personalized pants and jeans with custom embroidery or prints
   - Types: Jeans, Casual pants, Joggers, Sweatpants
   - Materials: Denim, Cotton twill, Fleece
   - Sizes: 28-42 waist, Regular/Long lengths
   - Colors: Blue denim, Black, Khaki, Gray, Navy
   - Price: $35.99 - $75.99

3. Hoodies - Cozy custom hoodies with your favorite designs and colors
   - Styles: Pullover, Zip-up, Oversized
   - Materials: Cotton fleece, Polyester blend, Premium cotton
   - Sizes: XS, S, M, L, XL, XXL, 3XL
   - Colors: Black, Gray, Navy, Maroon, White, Forest Green
   - Price: $39.99 - $80.99

4. Mugs - Personalized coffee mugs perfect for gifts or personal use
   - Types: Ceramic mugs, Travel mugs, Color-changing mugs
   - Sizes: 11oz standard, 15oz large, 20oz travel
   - Colors: White, Black, Blue, Red, Clear
   - Features: Dishwasher safe, Microwave safe
   - Price: $11.99 - $25.99

5. Phone Cases - Custom phone cases for various models with your unique designs
   - Compatibility: iPhone, Samsung, Google Pixel, OnePlus
   - Materials: Soft TPU, Hard plastic, Leather wallet
   - Features: Wireless charging compatible, Drop protection
   - Colors: Clear, Black, White, custom printed
   - Price: $14.99 - $45.99
`;

  constructor(private http: HttpClient) {
    this.initializeSession();
  }

  private initializeSession(): void {
    this.currentSession = {
      id: this.generateId(),
      messages: [],
      startTime: new Date(),
      lastActivity: new Date(),
      isActive: true
    };

    // رسالة ترحيب
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      content: '👋 Welcome to CustomCraft! I\'m your personal shopping assistant. I can help you find the perfect custom products and guide you through our design process. What would you like to customize today?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        quickReplies: [
          '🛍️ Show me available products',
          '🎨 How does customization work?',
          '🚚 What are your shipping options?',
          '💰 Tell me about pricing'
        ]
      }
    };

    this.addMessage(welcomeMessage);
  }

  public sendMessage(content: string): Observable<BotResponse> {
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    this.addMessage(userMessage);

    return new Observable(observer => {
      // Simulate API delay
      setTimeout(() => {
        this.getBotResponse(content).then(response => {
          const botMessage: ChatMessage = {
            id: this.generateId(),
            content: response.message,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
            metadata: {
              quickReplies: response.suggestions
            }
          };

          this.addMessage(botMessage);
          observer.next(response);
          observer.complete();
        }).catch(error => {
          console.error('Error getting bot response:', error);
          const errorMessage: ChatMessage = {
            id: this.generateId(),
            content: 'Sorry, I encountered an error. Please try again or contact our support team at support@customcraft.com for assistance.',
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
            metadata: {
              isError: true,
              quickReplies: [
                'Try again',
                'Contact support',
                'Show me products instead'
              ]
            }
          };
          this.addMessage(errorMessage);
          observer.error(error);
        });
      }, 1000); // Simulate 1 second delay
    });
  }

  // Mock response function - replace with real API later
  private async getBotResponse(userMessage: string): Promise<BotResponse> {
    const lowerMessage = userMessage.toLowerCase();
    
    let response = '';

    // Smart responses based on user input
    if (lowerMessage.includes('product') || lowerMessage.includes('show') || lowerMessage.includes('available')) {
      response = '🛍️ We have 5 amazing product categories:\n\n• **T-Shirts** ($15.99-$35.99) - Cotton tees with custom designs\n• **Pants** ($35.99-$75.99) - Jeans & casual pants with embroidery\n• **Hoodies** ($39.99-$80.99) - Cozy hoodies in pullover & zip styles\n• **Mugs** ($11.99-$25.99) - Ceramic & travel mugs with photos\n• **Phone Cases** ($14.99-$45.99) - Custom cases for all major brands\n\nWhich category interests you most?';
    } 
    else if (lowerMessage.includes('shirt') || lowerMessage.includes('t-shirt') || lowerMessage.includes('tee')) {
      response = '👕 Our custom t-shirts are perfect for expressing your style! Available in:\n\n• **Materials**: 100% Cotton, Cotton Blend, Premium Organic\n• **Sizes**: XS to 3XL\n• **Colors**: 9 vibrant options including White, Black, Navy, Red\n• **Price**: Starting at $15.99\n• **Features**: Screen printing, DTG printing, embroidery\n\nWould you like to see design options or learn about customization?';
    }
    else if (lowerMessage.includes('hoodie') || lowerMessage.includes('sweatshirt')) {
      response = '🧥 Our custom hoodies are super cozy and stylish! Here\'s what we offer:\n\n• **Styles**: Pullover, Zip-up, Oversized fits\n• **Materials**: Cotton Fleece, Polyester Blend, Premium Cotton\n• **Sizes**: XS to 3XL\n• **Colors**: Black, Gray, Navy, Maroon, White, Forest Green\n• **Price**: $39.99-$80.99\n\nPerfect for custom designs, logos, or personal artwork!';
    }
    else if (lowerMessage.includes('mug') || lowerMessage.includes('cup') || lowerMessage.includes('coffee')) {
      response = '☕ Our custom mugs make perfect gifts! Choose from:\n\n• **Types**: Ceramic, Travel, Color-changing mugs\n• **Sizes**: 11oz, 15oz, 20oz options\n• **Colors**: White, Black, Blue, Red, Clear\n• **Features**: Dishwasher & microwave safe\n• **Price**: $11.99-$25.99\n\nGreat for photos, quotes, or company logos!';
    }
    else if (lowerMessage.includes('phone') || lowerMessage.includes('case')) {
      response = '📱 Protect your phone in style with our custom cases!\n\n• **Compatible**: iPhone, Samsung, Google Pixel, OnePlus\n• **Materials**: Soft TPU, Hard Plastic, Leather wallet styles\n• **Features**: Wireless charging compatible, drop protection\n• **Colors**: Clear, Black, White, or fully custom printed\n• **Price**: $14.99-$45.99\n\nUpload your favorite photo or design!';
    }
    else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      response = '💰 Here\'s our pricing breakdown:\n\n• **T-Shirts**: $15.99 - $35.99\n• **Pants**: $35.99 - $75.99\n• **Hoodies**: $39.99 - $80.99\n• **Mugs**: $11.99 - $25.99\n• **Phone Cases**: $14.99 - $45.99\n\n🎫 **Special Offers**:\n• First-time customers: 15% off with WELCOME15\n• Student discount: 10% off\n• Bulk orders: Up to 25% discount\n• Free shipping on orders $75+';
    }
    else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      response = '🚚 We offer flexible shipping options:\n\n• **Standard Shipping**: 5-7 days ($5.99)\n• **Express Shipping**: 2-3 days ($12.99)\n• **FREE Shipping**: On orders over $75!\n• **Processing Time**: 2-3 business days\n\n📦 All orders include tracking and 30-day satisfaction guarantee. International shipping available too!';
    }
    else if (lowerMessage.includes('custom') || lowerMessage.includes('design') || lowerMessage.includes('personalize')) {
      response = '🎨 Our customization process is super easy!\n\n• **Design Tool**: Easy drag-and-drop interface\n• **Upload**: Your own images (PNG, JPG, SVG)\n• **Templates**: Choose from our design library\n• **Text**: Add custom text with various fonts\n• **Preview**: See your design in real-time\n• **Layers**: Multiple design elements supported\n\nYou can create something truly unique in just minutes!';
    }
    else if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('contact')) {
      response = '💬 We\'re here to help 24/7!\n\n• **Live Chat**: Right here with me!\n• **Email**: support@customcraft.com\n• **Phone**: 1-800-CUSTOM-1\n• **Video Help**: Design assistance available\n• **Returns**: 30-day satisfaction guarantee\n\nWhat specific question can I help you with?';
    }
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = '👋 Hello there! Great to see you at CustomCraft! I\'m here to help you create amazing custom products. Whether you\'re looking for t-shirts, hoodies, mugs, phone cases, or pants - we\'ve got you covered!\n\nWhat would you like to customize today?';
    }
    else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      response = '😊 You\'re so welcome! I\'m happy to help you find the perfect custom products. Is there anything else you\'d like to know about our products, customization process, or services?';
    }
    else {
      // Generic helpful response
      response = '🤔 I\'d love to help you with that! At CustomCraft, we specialize in custom t-shirts, hoodies, pants, mugs, and phone cases. \n\nCould you tell me more about what you\'re looking for? For example:\n• What type of product interests you?\n• Are you looking for pricing information?\n• Do you need help with customization?\n• Questions about shipping or our process?\n\nI\'m here to make your custom product journey amazing!';
    }

    return {
      message: response,
      suggestions: this.generateSuggestions(userMessage),
      requiresFollowUp: false
    };
  }

  private generateSuggestions(userMessage: string): string[] {
    const lowerMessage = userMessage.toLowerCase();
    
    // اقتراحات ذكية بناء على محتوى الرسالة
    if (lowerMessage.includes('shirt') || lowerMessage.includes('t-shirt') || lowerMessage.includes('tee')) {
      return [
        '👕 Show me t-shirt options',
        '🎨 T-shirt customization guide',
        '💰 T-shirt pricing details'
      ];
    } else if (lowerMessage.includes('pant') || lowerMessage.includes('jean') || lowerMessage.includes('trouser')) {
      return [
        '👖 View pants collection',
        '📏 Pants sizing guide',
        '🎯 Custom embroidery options'
      ];
    } else if (lowerMessage.includes('hoodie') || lowerMessage.includes('sweatshirt')) {
      return [
        '🧥 Browse hoodies',
        '🌡️ Hoodie materials guide',
        '🎨 Design placement options'
      ];
    } else if (lowerMessage.includes('mug') || lowerMessage.includes('cup') || lowerMessage.includes('coffee')) {
      return [
        '☕ See mug options',
        '🖼️ Photo mug examples',
        '🎁 Gift mug ideas'
      ];
    } else if (lowerMessage.includes('phone') || lowerMessage.includes('case') || lowerMessage.includes('cover')) {
      return [
        '📱 Phone case compatibility',
        '🛡️ Protection levels',
        '🎨 Case design examples'
      ];
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return [
        '💰 View all pricing',
        '🏷️ Bulk discounts available',
        '🎫 Current promotions'
      ];
    } else if (lowerMessage.includes('ship') || lowerMessage.includes('delivery') || lowerMessage.includes('receive')) {
      return [
        '🚚 Shipping options',
        '📦 Order tracking',
        '🌍 International shipping'
      ];
    } else if (lowerMessage.includes('design') || lowerMessage.includes('custom') || lowerMessage.includes('personalize')) {
      return [
        '🎨 Design tool tutorial',
        '📤 Upload your artwork',
        '🎯 Design templates'
      ];
    } else {
      // اقتراحات عامة
      return [
        '🛍️ Browse all products',
        '🎨 How to customize',
        '💬 Talk to support',
        '📋 Check my order'
      ];
    }
  }

  private addMessage(message: ChatMessage): void {
    if (this.currentSession) {
      this.currentSession.messages.push(message);
      this.currentSession.lastActivity = new Date();
      this.messagesSubject.next([...this.currentSession.messages]);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public getMessages(): ChatMessage[] {
    return this.currentSession?.messages || [];
  }

  public clearChat(): void {
    this.initializeSession();
  }

  // Fixed: Added proper typing and type guards for product info
  public getProductInfo(productType: string): ProductInfo | null {
    // Type guard to ensure productType is valid
    const validProductTypes: ProductType[] = ['shirts', 'pants', 'hoodies', 'mugs', 'phone-cases'];
    
    if (!validProductTypes.includes(productType as ProductType)) {
      return null;
    }

    const products: Record<ProductType, ProductInfo> = {
      'shirts': {
        name: 'Custom T-Shirts',
        description: 'High-quality cotton t-shirts with custom prints',
        priceRange: '$15.99 - $35.99',
        materials: ['100% Cotton', 'Cotton Blend', 'Premium Organic Cotton'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        colors: ['White', 'Black', 'Navy', 'Red', 'Blue', 'Green', 'Gray', 'Yellow', 'Purple'],
        features: ['Screen printing', 'DTG printing', 'Embroidery options']
      },
      'pants': {
        name: 'Custom Pants',
        description: 'Comfortable pants with personalization options',
        priceRange: '$35.99 - $75.99',
        materials: ['Denim', 'Cotton Twill', 'Fleece'],
        sizes: ['28-42 waist', 'Regular/Long lengths'],
        colors: ['Blue Denim', 'Black', 'Khaki', 'Gray', 'Navy'],
        features: ['Custom embroidery', 'Patch applications', 'Custom tags']
      },
      'hoodies': {
        name: 'Custom Hoodies',
        description: 'Cozy hoodies perfect for custom designs',
        priceRange: '$39.99 - $80.99',
        materials: ['Cotton Fleece', 'Polyester Blend', 'Premium Cotton'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        colors: ['Black', 'Gray', 'Navy', 'Maroon', 'White', 'Forest Green'],
        features: ['Pullover & Zip-up styles', 'Front/back printing', 'Embroidered details']
      },
      'mugs': {
        name: 'Custom Mugs',
        description: 'Ceramic mugs perfect for personalization',
        priceRange: '$11.99 - $25.99',
        materials: ['Ceramic', 'Stainless Steel'],
        sizes: ['11oz Standard', '15oz Large', '20oz Travel'],
        colors: ['White', 'Black', 'Blue', 'Red', 'Clear'],
        features: ['Photo printing', 'Text customization', 'Color-changing options']
      },
      'phone-cases': {
        name: 'Custom Phone Cases',
        description: 'Protective cases with your custom design',
        priceRange: '$14.99 - $45.99',
        materials: ['Soft TPU', 'Hard Plastic', 'Leather'],
        sizes: [], // Phone cases don't have traditional sizes
        colors: ['Clear', 'Black', 'White', 'Custom Printed'],
        features: ['Wireless charging', 'Drop protection', 'Custom artwork'],
        compatibility: ['iPhone', 'Samsung', 'Google Pixel', 'OnePlus']
      }
    };

    return products[productType as ProductType];
  }

  // إحصائيات الجلسة
  public getSessionStats(): any {
    if (!this.currentSession) return null;

    return {
      messageCount: this.currentSession.messages.length,
      sessionDuration: Date.now() - this.currentSession.startTime.getTime(),
      lastActivity: this.currentSession.lastActivity,
      isActive: this.currentSession.isActive
    };
  }
}