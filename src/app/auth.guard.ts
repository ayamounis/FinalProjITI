import { CanActivateFn } from '@angular/router';
// import e from 'express';
import { inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  
 const _PLATFORM_ID = inject(PLATFORM_ID);
 const _router = inject(Router);
  // Check if the platform is browser
  if (isPlatformBrowser(_PLATFORM_ID)) {
    if (localStorage.getItem('token')) {
      return true;
    }
    else {
      _router.navigate(['/auth']);
      return false;
    }
  } else {
    return false;
  }



};
