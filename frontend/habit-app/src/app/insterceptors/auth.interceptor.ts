import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Aquí puedes agregar tokens de autenticación si los necesitas
    const authReq = req.clone({
      headers: req.headers.set('Content-Type', 'application/json')
    });
    
    return next.handle(authReq);
  }
}