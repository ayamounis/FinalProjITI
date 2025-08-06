import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./login/login.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { RegisterComponent } from "./register/register.component";
import { DesignToolComponent } from "./design-tool/components/design-tool.component";
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { FooterComponent } from './footer/footer.component';
import { NotificationComponent } from './notification/notification.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ChatWindowComponent, DesignToolComponent, FooterComponent, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'loginProj';
}
