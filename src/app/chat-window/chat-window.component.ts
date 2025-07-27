import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatbotService } from '../chatbot.service';
import { ChatMessage } from '../interfaces/message.interface';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isTyping: boolean = false;
  isMinimized: boolean = true;
  unreadCount: number = 0;
  hasNewMessage: boolean = false;

  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = true;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.chatbotService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        const previousCount = this.messages.length;
        this.messages = messages;
        
        // إذا كان الشات مصغر وجاءت رسالة جديدة
        if (this.isMinimized && messages.length > previousCount) {
          const newMessages = messages.slice(previousCount);
          const hasNewBotMessage = newMessages.some(msg => msg.sender === 'bot');
          
          if (hasNewBotMessage) {
            this.unreadCount++;
            this.hasNewMessage = true;
            
            // إزالة الـ pulse effect بعد 3 ثواني
            setTimeout(() => {
              this.hasNewMessage = false;
            }, 3000);
          }
        }
        
        this.shouldScrollToBottom = true;
      });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && !this.isMinimized) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isTyping) return;

    this.isTyping = true;
    const message = this.newMessage.trim();
    this.newMessage = '';

    this.chatbotService.sendMessage(message)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isTyping = false;
          this.shouldScrollToBottom = true;
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.isTyping = false;
          
          // إضافة رسالة خطأ للمستخدم
          const errorMessage: ChatMessage = {
            id: this.generateId(),
            content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          };
          this.messages.push(errorMessage);
          this.shouldScrollToBottom = true;
        }
      });
  }

  onSuggestionClick(suggestion: string): void {
    if (this.isTyping) return;
    
    this.newMessage = suggestion;
    this.sendMessage();
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
    
    // إذا فتح الشات، إعادة تعيين العدادات
    if (!this.isMinimized) {
      this.unreadCount = 0;
      this.hasNewMessage = false;
      
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }
  }

  // للتحكم في الدائرة المصغرة
  onMinimizedClick(): void {
    if (this.isMinimized) {
      this.toggleMinimize();
    }
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.chatbotService.clearChat();
      this.shouldScrollToBottom = true;
      this.unreadCount = 0;
      this.hasNewMessage = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer && this.messagesContainer.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
    
    if (event.key === 'Escape') {
      // يمكن استخدامها لاحقاً لإغلاق modals أو menus
    }
  }

  formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  isUserMessage(message: ChatMessage): boolean {
    return message.sender === 'user';
  }

  isBotMessage(message: ChatMessage): boolean {
    return message.sender === 'bot';
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  shouldTruncateMessage(content: string): boolean {
    return content.length > 500;
  }

  truncateMessage(content: string, length: number = 500): string {
    if (content.length <= length) return content;
    return content.substring(0, length) + '...';
  }

  retryMessage(message: ChatMessage): void {
    if (message.sender === 'user' && !this.isTyping) {
      this.sendMessage();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      console.log('Files dropped:', files);
    }
  }

  saveConversation(): void {
    const conversation = {
      messages: this.messages,
      timestamp: new Date(),
      sessionId: this.generateId()
    };
    
    console.log('Saving conversation:', conversation);
  }

  searchInConversation(query: string): ChatMessage[] {
    if (!query.trim()) return [];
    
    return this.messages.filter(message => 
      message.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  exportConversation(): string {
    let exportText = `CustomCraft Chat Conversation - ${new Date().toLocaleDateString()}\n\n`;
    
    this.messages.forEach(message => {
      const time = this.formatTime(message.timestamp);
      const sender = message.sender === 'user' ? 'You' : 'Assistant';
      exportText += `[${time}] ${sender}: ${message.content}\n\n`;
    });
    
    return exportText;
  }

  downloadConversation(): void {
    const content = this.exportConversation();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-conversation-${new Date().getTime()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}