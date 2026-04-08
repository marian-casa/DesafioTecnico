# 🔐 Desafío Técnico — Login & Seguridad
### Módulo Full Stack II · Instituto Superior Politécnico Córdoba (ISPC)
**Tecnicatura Superior en Desarrollo de Software**  
Docentes: Florencia García y Ramiro Ceballes

---

## 📋 Descripción del proyecto

Sistema de autenticación Full Stack con flujo completo de login, registro y recuperación de cuenta mediante OTP (One-Time Password).

**Backend:** Django + Django REST Framework + JWT  
**Frontend:** Angular 21 + HTML + CSS + Boostrap

### Funcionalidades implementadas

- Registro de usuarios
- Login con JWT (Access Token + Refresh Token)
- "Recordarme" (persiste la sesión en localStorage)
- Recuperación de contraseña mediante OTP de 6 dígitos
- Validaciones en tiempo real en los formularios
- Feedback visual: loaders, alertas de error y éxito
- Diseño responsivo con estética glassmorphism
- Pantalla de bienvenida con datos del usuario autenticado
- Cierre de sesión

---

## 🗂️ Estructura del proyecto

```
desafioTecnico/
├── backend/          # Django REST API
│   ├── accounts/     # App principal (modelos, vistas, serializers)
│   ├── backend/      # Configuración del proyecto Django
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    └── login-frontend/   # Aplicación Angular
        └── src/
            └── app/
                ├── login/    # Componente de login, registro y recuperación
                └── home/     # Pantalla de bienvenida
```

---

## ⚙️ Requisitos previos

- Python 3.10+
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)
- PostgreSQL

---

## 🚀 Cómo correr el proyecto

### 1. Clonar el repositorio

```bash
mkdir desafioTecnico
cd desafioTecnico
git clone https://github.com/marian-casa/DesafioTecnico.git 
* backend y frontend juntos *
```

---

### 2. Configurar el Backend

#### 2.1 Crear y activar entorno virtual

```bash
cd backend

# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux / Mac
python -m venv .venv
source .venv/bin/activate
```

#### 2.2 Instalar dependencias

```bash
pip install -r requirements.txt
```

#### 2.3 Configurar la base de datos PostgreSQL

> ⚠️ **Importante:** Antes de continuar, necesitás crear la base de datos y ajustar las credenciales.

**Crear la base de datos en PostgreSQL:**

```sql
CREATE DATABASE backend_db;
```

**Editar las credenciales en `backend/backend/settings.py`:**

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'backend_db',
        'USER': 'postgres',           # ← Cambiá por tu usuario de PostgreSQL
        'PASSWORD': 'tu_contraseña',  # ← Cambiá por tu contraseña de PostgreSQL
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

#### 2.4 Aplicar migraciones y correr el servidor

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

El backend queda disponible en `http://localhost:8000`

---

### 3. Configurar el Frontend

```bash
cd frontend/login-frontend
npm install
ng serve
```

El frontend queda disponible en `http://localhost:4200`


---

## 🔗 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/register/` | Registro de usuario |
| POST | `/api/login/` | Login, devuelve tokens JWT |
| POST | `/api/forgot-password/` | Solicitar código OTP |
| POST | `/api/verify-otp/` | Verificar código OTP |
| POST | `/api/reset-password/` | Cambiar contraseña con OTP |

### Ejemplos de uso con Postman

**Registro:**
```json
POST /api/register/
{
    "username": "usuario",
    "email": "usuario@email.com",
    "password": "pass1234"
}
```

**Login:**
```json
POST /api/login/
{
    "username": "usuario",
    "password": "pass1234"
}
```

**Recuperar contraseña:**
```json
POST /api/forgot-password/
{ "email": "usuario@email.com" }

POST /api/verify-otp/
{ "email": "usuario@email.com", "code": "483920" }

POST /api/reset-password/
{ "email": "usuario@email.com", "code": "483920", "new_password": "nueva1234" }
```

> 📌 **Nota sobre el OTP:** Como aún no hay integración con un servicio de email, el código OTP se imprime en la consola del servidor (terminal donde corre `python manage.py runserver`) y también aparece en la alerta de la pantalla de recuperación en el frontend (modo desarrollo).

---

## 🔐 Seguridad implementada

- Contraseñas hasheadas con el sistema de Django (`set_password`)
- Autenticación stateless con JWT (Access Token de 5 min, Refresh Token de 1 día)
- "Recordarme": token en `localStorage` (persiste al cerrar el navegador) o `sessionStorage` (se borra al cerrar la pestaña)
- OTP de uso único: se invalida automáticamente después de ser utilizado
- OTP con expiración de 10 minutos
- Los OTPs anteriores se invalidan al solicitar uno nuevo
- El endpoint de forgot-password responde igual exista o no el email (para no revelar usuarios registrados)
- Campos encriptados en base de datos con `django-encrypted-model-fields`

---

## 📦 Dependencias principales

### Backend
```
Django
djangorestframework
djangorestframework-simplejwt
django-cors-headers
django-encrypted-model-fields
psycopg2
```

### Frontend
```
@angular/core ^21
@angular/forms
@angular/common/http
```

---

## 🌿 Rama de entrega

La entrega se encuentra en la rama: main
```

---

*Instituto Superior Politécnico Córdoba — Tecnicatura Superior en Desarrollo de Software — 2025*
