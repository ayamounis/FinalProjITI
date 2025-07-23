// import { Component, inject } from '@angular/core';
// import { RouterModule, RouterOutlet } from '@angular/router';
// import { LoginComponent } from '../login/login.component';
// import { AuthService } from '../auth.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-navbar',
//   standalone: true,
//   imports: [RouterModule],
//   templateUrl: './navbar.component.html',
//   styleUrl: './navbar.component.css'
// })
// export class NavbarComponent {
//   isLoggedIn: boolean = false;
//   _authService = inject(AuthService);
//   _router = inject(Router);

//   constructor() {
//     this._authService.userData.subscribe({
//       next: (res) => {
//         this.isLoggedIn = res ? true : false;
//         console.log(res, "Welcome in Our Website");
//       },
//       error: (err) => {
//         console.log(err);
//       }
//     })
//     console.log(this._authService.userData.value, "Hello Welcome in Our Website");


//   }
//   logout() {
//     this._authService.logout(); //Logout
//     this._router.navigate(['/auth']); //Redirect to Login Page
//   }
// }
import { Component, OnInit, OnDestroy,inject } from '@angular/core';
import { AuthService } from '../auth.service'; // تأكد من المسار الصحيح
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isSeller: boolean = false;
  userRole: string = '';
  _router = inject(Router);
  private authSubscription: Subscription = new Subscription();
  private roleSubscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // الاشتراك في تغييرات حالة تسجيل الدخول
    this.authSubscription = this.authService.userData.subscribe(token => {
      this.isLoggedIn = !!token;
    });

    // الاشتراك في تغييرات دور المستخدم
    this.roleSubscription = this.authService.userRole.subscribe(role => {
      this.userRole = role;
      this.isSeller = role.toLowerCase() === 'seller';
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.roleSubscription.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this._router.navigate(['/auth']);
    // يمكنك إضافة navigation للصفحة الرئيسية هنا إذا أردت
  }
}