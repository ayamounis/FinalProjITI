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
 isMinimized: boolean = false;

  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = true;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.chatbotService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.shouldScrollToBottom = true;
      });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
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
    
    // إذا فتح الشات، scroll للأسفل
    if (!this.isMinimized) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.chatbotService.clearChat();
      this.shouldScrollToBottom = true;
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
    
    // إضافة دعم للـ Escape لإغلاق النوافذ المفتوحة
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

  // إضافة method للتحقق من نوع الرسالة
  isUserMessage(message: ChatMessage): boolean {
    return message.sender === 'user';
  }

  isBotMessage(message: ChatMessage): boolean {
    return message.sender === 'bot';
  }

  // method لإنشاء ID فريد
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // إضافة method للتعامل مع الرسائل الطويلة
  shouldTruncateMessage(content: string): boolean {
    return content.length > 500;
  }

  truncateMessage(content: string, length: number = 500): string {
    if (content.length <= length) return content;
    return content.substring(0, length) + '...';
  }

  // method لإعادة إرسال الرسالة في حالة الفشل
  retryMessage(message: ChatMessage): void {
    if (message.sender === 'user' && !this.isTyping) {
      this.sendMessage();
    }
  }

  // إضافة دعم للـ drag and drop للصور (للمستقبل)
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      // معالجة الملفات المرفوعة - يمكن تطويرها لاحقاً
      console.log('Files dropped:', files);
    }
  }

  // method لحفظ المحادثة (للمستقبل)
  saveConversation(): void {
    const conversation = {
      messages: this.messages,
      timestamp: new Date(),
      sessionId: this.generateId()
    };
    
    // يمكن حفظها في localStorage أو إرسالها للسيرفر
    console.log('Saving conversation:', conversation);
  }

  // method للبحث في المحادثة
  searchInConversation(query: string): ChatMessage[] {
    if (!query.trim()) return [];
    
    return this.messages.filter(message => 
      message.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  // method لتصدير المحادثة كـ text
  exportConversation(): string {
    let exportText = `CustomCraft Chat Conversation - ${new Date().toLocaleDateString()}\n\n`;
    
    this.messages.forEach(message => {
      const time = this.formatTime(message.timestamp);
      const sender = message.sender === 'user' ? 'You' : 'Assistant';
      exportText += `[${time}] ${sender}: ${message.content}\n\n`;
    });
    
    return exportText;
  }

  // method لتحميل المحادثة كملف
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