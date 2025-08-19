import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // إذا كان المستخدم admin، امنعه من الوصول للصفحة ووجهه للداش بورد
  if (authService.isLoggedIn() && authService.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }

  // إذا لم يكن admin، اتركه يفتح الصفحة
  return true;
};
