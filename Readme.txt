# Sistema de Gestión para Licorería - Documentación del Sistema

Este documento describe el estado actual del sistema, su arquitectura implementada y las funcionalidades operativas disponibles.

## 1. Visión General y Arquitectura
El sistema sigue una arquitectura **Monorepo** utilizando **TurboRepo**, separando claramente las responsabilidades en dos aplicaciones principales conectadas mediante APIs RESTful.
La lógica de negocio del Backend sigue una **Arquitectura Hexagonal (Ports & Adapters)**, garantizando que el núcleo del dominio (reglas de negocio) permanezca agnóstico a la infraestructura (base de datos o frameworks web).

### Stack Tecnológico Implementado
- **Backend:** Node.js, Fastify, TypeScript, Zod (Validación), Prisma ORM (Persistencia).
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui, Zustand (Estado Global: Carrito, Caja), TanStack Query.
- **Base de Datos:** PostgreSQL (Relacional, Transaccional).
- **Infraestructura:** Docker & Docker Compose (Entornos de Desarrollo y Producción).

## 2. Funcionalidades Implementadas

### A. Gestión de Inventario (Core)
El sistema gestiona productos con lógica **FEFO (First-Expired, First-Out)** para el control de lotes, crucial para productos perecederos.
- **Productos:** CRUD completo (Crear, Editar, Eliminar, Listar) con imágenes y stock mínimo.
- **Lotes (Batches):** Registro de entradas de stock con fecha de vencimiento.
- **Alertas:** Notificación automática en el Dashboard de lotes próximos a vencer (< 30 días).

### B. Punto de Venta (POS)
Interfaz optimizada para operación rápida en mostrador.
- **Carrito de Compras:** Búsqueda rápida de productos, control de cantidades y cálculo de subtotales/totales.
- **Validación de Stock:** El sistema impide la venta si no hay stock suficiente en los lotes disponibles.
- **Selección de Pago:** Soporte para múltiples métodos:
    - Efectivo
    - Tarjeta
    - QR / Transferencia
- **Ticket Digital:** Generación automática de recibo tras la venta con opción de impresión inmediata (compatible con impresoras térmicas).

### C. Gestión de Caja y Dinero (Cash Management)
Módulo de control financiero para turnos de trabajo.
- **Apertura de Turno:** Bloqueo del POS hasta que se abra caja con un fondo inicial (Change Fund).
- **Cierre de Turno:** Registro del monto final en caja y cierre de operaciones.
- **Bloqueo Operativo:** La interfaz impide realizar ventas si no existe un turno activo para el usuario.
- **Persistencia:** Estado de caja sincronizado entre Backend y Frontend.

### D. Seguridad y Autenticación
- **JWT (JSON Web Tokens):** Protección de rutas API y sesiones de usuario.
- **Login:** Interfaz de acceso seguro.
- **Roles:** Sistema preparado para multi-usuario (actualmente configurado con Admin).

## 3. Modelo de Datos (Resumen)
- **Product:** Entidad base. Relación 1:N con Batches.
- **Batch:** Stock real con fecha de expiración.
- **CashShift:** Turno de caja (Usuario, Monto Inicial/Final, Estado).
- **Sale:** Cabecera de venta (Total, Método Pago, Vinculación a Turno).
- **SaleItem:** Detalle de venta (Producto, Cantidad, Precio).

## 4. Instrucciones de Despliegue
El sistema está contenerizado para facilitar su ejecución.

### Requisitos
- Docker & Docker Compose
- Node.js & PNPM (para desarrollo local fuera de contenedores)

### Comandos Principales
```bash
# Iniciar todo el ecosistema (Base de Datos + Backend + Frontend)
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Detener sistema
docker-compose down
```

### Accesos
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Credenciales por defecto:** admin / admin123 (ver semilla de base de datos).
