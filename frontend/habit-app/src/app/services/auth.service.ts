import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, Observable } from "rxjs"
import { tap, catchError } from "rxjs/operators"
import { Router } from "@angular/router"
import { environment } from "../../environments/environment"
import { of } from "rxjs"

export interface User {
  id: number
  email: string
  username: string
  is_active: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadCurrentUser()
  }

  register(email: string, username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, {
      email,
      username,
      password,
    })
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        username,
        password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem("access_token", response.access_token)
          this.loadCurrentUser()
        }),
      )
  }

  logout(): void {
    localStorage.removeItem("access_token")
    this.currentUserSubject.next(null)
    this.router.navigate(["/login"])
  }

  getToken(): string | null {
    return localStorage.getItem("access_token")
  }

  isLoggedIn(): boolean {
    return !!this.getToken()
  }

  loadCurrentUser(): void {
    const token = this.getToken()
    
    // Si no hay token, no intentar cargar usuario
    if (!token) {
      this.currentUserSubject.next(null)
      return
    }

    this.http
      .get<User>(`${this.apiUrl}/me`)
      .pipe(
        catchError((error) => {
          console.error("Error loading current user:", error)
          
          // Solo hacer logout si es un error de autenticación
          // Y NO si es un error de red o servidor
          if (error.status === 401 || error.status === 403) {
            console.log("Token inválido o expirado, cerrando sesión")
            this.logout()
          } else {
            // Para otros errores (500, timeout, etc), mantener el token
            // y reintentar después
            console.log("Error temporal, manteniendo sesión")
          }
          
          return of(null)
        }),
      )
      .subscribe({
        next: (user) => {
          if (user) {
            this.currentUserSubject.next(user)
          }
        },
      })
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }
}