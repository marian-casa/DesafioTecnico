import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

type Vista = 'login' | 'forgot' | 'verify' | 'reset' | 'register';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  vista = signal<Vista>('login');
  loading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  showPassword = signal(false);
  emailParaReset = '';

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  otpForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6),]]
  });

  resetForm: FormGroup = this.fb.group({
    new_password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', Validators.required]
  }, { validators: this.passwordsMatch });

  registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', Validators.required]
  }, { validators: this.passwordsMatch });

  passwordsMatch(group: AbstractControl) {
    const pass = group.get('new_password')?.value;
    const confirm = group.get('confirm_password')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  fieldError(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control || !control.touched || !control.errors) return '';
    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    return '';
  }

  limpiarMensajes(){
    this.errorMsg.set('');
    this.successMsg.set('');
  }

  cambiarVista(v: Vista){
    this.vista.set(v);
    this.limpiarMensajes();
  }

  togglePassword(){
    this.showPassword.update(v => !v)
  }

  onSubmit() {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.limpiarMensajes();

    const { username, password, rememberMe } = this.loginForm.value;
    this.http.post<any>('http://localhost:8000/api/login/', { username, password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('access_token', res.access);
        storage.setItem('refresh_token', res.refresh);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMsg.set('Usuario o contraseña incorrectos.')
      }
    });
  }

  onForgot(){
    if (this.forgotForm.invalid) { this.forgotForm.markAllAsTouched(); return; }
    this.loading.set(true)
    this.limpiarMensajes()
    
    const { email } = this.forgotForm.value;
    this.emailParaReset = email;

    this.http.post<any>('http://localhost:8000/api/forgot-password/', {email}).subscribe({
      next: (res) => {
        this.loading.set(false)
        const otpMsg = res.dev_otp
        this.successMsg.set(otpMsg)
        setTimeout(() => this.cambiarVista('verify'), 1500)
      },
      error: () => {
        this.loading.set(false)
        this.errorMsg.set('Error al enviar el codigo. Intenta de nuevo')
      }
    })
  }
  onVerify() {
    if (this.otpForm.invalid) { this.otpForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.limpiarMensajes();

    const { code } = this.otpForm.value;
    this.http.post('http://localhost:8000/api/verify-otp/', {
      email: this.emailParaReset, code
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Código verificado correctamente.');
        setTimeout(() => this.cambiarVista('reset'), 1500);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Código incorrecto o expirado.');
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.limpiarMensajes();

    const { username, email, password } = this.registerForm.value;
    this.http.post('http://localhost:8000/api/register/', { username, email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('¡Cuenta creada! Ya podés iniciar sesión.');
        setTimeout(() => this.cambiarVista('login'), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.username?.[0] || err.error?.email?.[0] || 'Error al registrarse.';
        this.errorMsg.set(msg);
      }
    });
  }

  // ── RESET PASSWORD ──
  onReset() {
    if (this.resetForm.invalid) { this.resetForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.limpiarMensajes();

    const { new_password } = this.resetForm.value;
    const code = this.otpForm.value.code;

    this.http.post('http://localhost:8000/api/reset-password/', {
      email: this.emailParaReset, code, new_password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('¡Contraseña actualizada! Redirigiendo...');
        setTimeout(() => this.cambiarVista('login'), 2000);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Error al actualizar la contraseña.');
      }
    });
  }
}
