# ⚽ Central de Catalunya API

API REST para la gestión integral del club de fútbol **Central de Catalunya**, que incluye equipos masculinos y femeninos.

## 📋 Características

- **Gestión de Socios**: Registro, actualización y control de membresías
- **Equipos**: Administración de equipos masculinos y femeninos por categorías
- **Reserva de Canchas**: Sistema completo de alquiler con precios dinámicos
- **Eventos**: Partidos, entrenamientos, torneos y reuniones
- **Pagos**: Mensualidades, uniformes, equipamiento y otros conceptos
- **Productos**: Tienda de uniformes y equipación con control de stock
- **Pedidos**: Gestión de pedidos con seguimiento de estados

## 🛠️ Tecnologías

- **Node.js** + **Express 5**
- **TypeScript**
- **Firebase Admin SDK** (Firestore)
- **Firebase Authentication**

## 📁 Estructura del Proyecto

```
central-catalunya-api/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Configuración Firebase
│   ├── controllers/
│   │   ├── member.controller.ts
│   │   ├── team.controller.ts
│   │   ├── field.controller.ts  # + BookingController
│   │   ├── event.controller.ts
│   │   ├── payment.controller.ts
│   │   └── product.controller.ts # + OrderController
│   ├── middleware/
│   │   ├── auth.middleware.ts   # Autenticación JWT/Firebase
│   │   ├── error.middleware.ts  # Manejo de errores
│   │   └── validation.middleware.ts
│   ├── models/
│   │   └── index.ts             # Interfaces y tipos
│   ├── routes/
│   │   ├── member.routes.ts
│   │   ├── team.routes.ts
│   │   ├── field.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── event.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── product.routes.ts
│   │   └── order.routes.ts
│   ├── services/
│   │   ├── base.service.ts      # Servicio genérico CRUD
│   │   ├── member.service.ts
│   │   ├── team.service.ts
│   │   ├── field.service.ts
│   │   ├── booking.service.ts
│   │   ├── event.service.ts
│   │   ├── payment.service.ts
│   │   └── product.service.ts   # + OrderService
│   └── index.ts                 # Punto de entrada
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Instalación

### 1. Clonar e instalar dependencias

```bash
cd central-catalunya-api
npm install
```

### 2. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Firestore Database
3. Generar clave de cuenta de servicio (Project Settings > Service Accounts)
4. Guardar el archivo JSON como `serviceAccountKey.json` en la raíz

### 3. Variables de entorno

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

```env
PORT=3000
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

### 4. Ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📡 Endpoints de la API

Base URL: `http://localhost:3000/api/v1`

### Socios (`/members`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/members` | Crear socio |
| GET | `/members` | Listar socios |
| GET | `/members/:id` | Obtener socio |
| PUT | `/members/:id` | Actualizar socio |
| DELETE | `/members/:id` | Eliminar socio |
| GET | `/members/players` | Listar jugadores |
| GET | `/members/coaches` | Listar entrenadores |
| GET | `/members/search?name=` | Buscar por nombre |
| GET | `/members/statistics` | Estadísticas |
| PATCH | `/members/:id/status` | Cambiar estado |
| POST | `/members/:id/teams/:teamId` | Añadir a equipo |
| DELETE | `/members/:id/teams/:teamId` | Quitar de equipo |

### Equipos (`/teams`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/teams` | Crear equipo |
| GET | `/teams` | Listar equipos |
| GET | `/teams/:id` | Obtener equipo |
| PUT | `/teams/:id` | Actualizar equipo |
| DELETE | `/teams/:id` | Eliminar equipo |
| GET | `/teams/female` | Equipos femeninos |
| GET | `/teams/male` | Equipos masculinos |
| GET | `/teams/standings` | Clasificación |
| POST | `/teams/:id/players/:playerId` | Añadir jugador |
| DELETE | `/teams/:id/players/:playerId` | Quitar jugador |
| POST | `/teams/:id/coach/:coachId` | Asignar entrenador |
| POST | `/teams/:id/match-result` | Registrar resultado |

### Canchas (`/fields`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/fields` | Crear cancha |
| GET | `/fields` | Listar canchas |
| GET | `/fields/:id` | Obtener cancha |
| PUT | `/fields/:id` | Actualizar cancha |
| DELETE | `/fields/:id` | Eliminar cancha |
| GET | `/fields/:id/availability?date=&startTime=&endTime=` | Verificar disponibilidad |
| GET | `/fields/:id/available-slots?date=` | Slots disponibles |
| GET | `/fields/:id/calculate-price?...` | Calcular precio |
| GET | `/fields/usage-stats` | Estadísticas de uso |
| PATCH | `/fields/:id/status` | Cambiar estado |

### Reservas (`/bookings`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/bookings` | Crear reserva |
| GET | `/bookings` | Listar reservas |
| GET | `/bookings/:id` | Obtener reserva |
| PUT | `/bookings/:id` | Actualizar reserva |
| DELETE | `/bookings/:id` | Eliminar reserva |
| GET | `/bookings/today` | Reservas de hoy |
| GET | `/bookings/upcoming` | Próximas reservas |
| GET | `/bookings/statistics` | Estadísticas |
| PATCH | `/bookings/:id/confirm` | Confirmar |
| PATCH | `/bookings/:id/cancel` | Cancelar |
| PATCH | `/bookings/:id/complete` | Completar |
| PATCH | `/bookings/:id/pay` | Marcar pagada |

### Eventos (`/events`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/events` | Crear evento |
| GET | `/events` | Listar eventos |
| GET | `/events/:id` | Obtener evento |
| PUT | `/events/:id` | Actualizar evento |
| DELETE | `/events/:id` | Eliminar evento |
| GET | `/events/upcoming` | Próximos eventos |
| GET | `/events/today` | Eventos de hoy |
| GET | `/events/this-week` | Eventos de la semana |
| GET | `/events/matches` | Partidos |
| GET | `/events/statistics` | Estadísticas |
| POST | `/events/:id/participants/:memberId` | Inscribir participante |
| DELETE | `/events/:id/participants/:memberId` | Desinscribir |
| PATCH | `/events/:id/participants/:memberId/confirm` | Confirmar asistencia |
| PATCH | `/events/:id/status` | Cambiar estado |
| PATCH | `/events/:id/cancel` | Cancelar evento |
| PATCH | `/events/:id/postpone` | Posponer evento |
| POST | `/events/:id/match-result` | Registrar resultado |

### Pagos (`/payments`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/payments` | Crear pago |
| GET | `/payments` | Listar pagos |
| GET | `/payments/:id` | Obtener pago |
| PUT | `/payments/:id` | Actualizar pago |
| DELETE | `/payments/:id` | Eliminar pago |
| GET | `/payments/pending` | Pagos pendientes |
| GET | `/payments/overdue` | Pagos vencidos |
| GET | `/payments/statistics` | Estadísticas |
| GET | `/payments/monthly-revenue` | Ingresos mensuales |
| POST | `/payments/monthly-fee` | Crear mensualidad |
| POST | `/payments/generate-monthly-fees` | Generar mensualidades masivas |
| GET | `/payments/monthly-fees/:year/:month` | Mensualidades por periodo |
| PATCH | `/payments/:id/pay` | Registrar pago |
| PATCH | `/payments/:id/cancel` | Cancelar pago |
| POST | `/payments/mark-overdue` | Marcar vencidos |
| GET | `/payments/member/:memberId/history` | Historial de miembro |
| GET | `/payments/member/:memberId/pending-fees` | Mensualidades pendientes |

### Productos (`/products`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/products` | Crear producto |
| GET | `/products` | Listar productos |
| GET | `/products/:id` | Obtener producto |
| PUT | `/products/:id` | Actualizar producto |
| DELETE | `/products/:id` | Eliminar producto |
| GET | `/products/uniforms` | Uniformes |
| GET | `/products/training-kits` | Equipación entrenamiento |
| GET | `/products/search?q=` | Buscar productos |
| PATCH | `/products/:id/stock` | Actualizar stock |
| GET | `/products/:id/availability?size=&quantity=` | Verificar disponibilidad |
| PATCH | `/products/:id/activate` | Activar |
| PATCH | `/products/:id/deactivate` | Desactivar |

### Pedidos (`/orders`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/orders` | Crear pedido |
| GET | `/orders` | Listar pedidos |
| GET | `/orders/:id` | Obtener pedido |
| PUT | `/orders/:id` | Actualizar pedido |
| DELETE | `/orders/:id` | Eliminar pedido |
| GET | `/orders/pending` | Pedidos pendientes |
| GET | `/orders/ready` | Pedidos listos |
| GET | `/orders/statistics` | Estadísticas |
| PATCH | `/orders/:id/confirm` | Confirmar |
| PATCH | `/orders/:id/preparing` | En preparación |
| PATCH | `/orders/:id/ready` | Listo para entrega |
| PATCH | `/orders/:id/deliver` | Entregado |
| PATCH | `/orders/:id/cancel` | Cancelar |
| PATCH | `/orders/:id/discount` | Aplicar descuento |

## 📝 Ejemplos de Uso

### Crear un socio

```bash
curl -X POST http://localhost:3000/api/v1/members \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Maria",
    "lastName": "García",
    "email": "maria@example.com",
    "dni": "12345678A",
    "phone": "+34612345678",
    "birthDate": "1990-05-15",
    "gender": "female",
    "role": "player"
  }'
```

### Crear una reserva

```bash
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "fieldId": "campo-id",
    "bookedBy": "member-id",
    "date": "2024-03-15",
    "startTime": "18:00",
    "endTime": "19:30",
    "purpose": "Entrenamiento equipo femenino",
    "requiresLighting": true,
    "isMember": true
  }'
```

### Generar mensualidades

```bash
curl -X POST http://localhost:3000/api/v1/payments/generate-monthly-fees \
  -H "Content-Type: application/json" \
  -d '{
    "month": 3,
    "year": 2024,
    "amount": 50,
    "dueDate": "2024-03-10"
  }'
```

## 🔐 Autenticación

La API soporta autenticación mediante Firebase Auth. Incluye el token en el header:

```
Authorization: Bearer <firebase-id-token>
```

## 📊 Formato de Respuestas

### Éxito

```json
{
  "success": true,
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error"
  }
}
```

### Paginación

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 📄 Licencia

MIT © Central de Catalunya
