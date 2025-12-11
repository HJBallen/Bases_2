# 🛍️ BOGOGO - Plataforma de E-commerce

BOGOGO es una plataforma de comercio electrónico desarrollada como proyecto final para el curso de Bases de Datos II. La aplicación permite gestionar productos, realizar compras, gestionar pedidos y administrar usuarios con diferentes roles (Administrador, Vendedor, Comprador).

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Despliegue](#despliegue)
- [Autores](#autores)

## ✨ Características

- 🛒 **Catálogo de Productos**: Navegación y búsqueda de productos por categorías
- 🛍️ **Carrito de Compras**: Gestión de carrito con persistencia en localStorage
- 💳 **Proceso de Pago**: Integración con Mercado Pago
- 👥 **Gestión de Usuarios**: Sistema de autenticación con roles (Administrador, Vendedor, Comprador)
- 📊 **Dashboards**: Paneles administrativos con métricas y gráficas
- ⭐ **Sistema de Calificaciones**: Los usuarios pueden calificar a los vendedores
- 📱 **Responsive Design**: Diseño adaptable a diferentes dispositivos

## 🚀 Tecnologías

### Frontend
- **React 18.3.1** - Biblioteca de JavaScript para construir interfaces
- **TypeScript 5.8.3** - Superset tipado de JavaScript
- **Vite 5.4.19** - Herramienta de construcción y desarrollo
- **React Router DOM 6.30.1** - Enrutamiento de la aplicación
- **Tailwind CSS 3.4.17** - Framework de CSS utility-first
- **shadcn/ui** - Componentes de UI basados en Radix UI
- **React Hook Form 7.61.1** - Gestión de formularios
- **Zod 3.25.76** - Validación de esquemas
- **Recharts 2.15.4** - Gráficas y visualizaciones
- **React Query 5.83.0** - Gestión de estado del servidor

### Backend y Base de Datos
- **Supabase** - Backend as a Service (BaaS) con PostgreSQL
- **Supabase Auth** - Autenticación y autorización
- **PostgreSQL** - Base de datos relacional

### Utilidades
- **Lucide React** - Iconos
- **Sonner** - Sistema de notificaciones
- **date-fns** - Manipulación de fechas

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) - [Descargar](https://nodejs.org/)
- **npm** o **yarn** o **pnpm** (incluido con Node.js)
- **Git** - [Descargar](https://git-scm.com/)
- Una cuenta de **Supabase** - [Crear cuenta](https://supabase.com/)

## 🔧 Instalación

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd Bases_2/Final-Project/Code
```

2. **Instalar dependencias**

```bash
npm install
```

o si usas yarn:

```bash
yarn install
```

o si usas pnpm:

```bash
pnpm install
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (`Final-Project/Code/.env`) con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

#### Cómo obtener las credenciales de Supabase:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. Navega a **Settings** > **API**
3. Copia los siguientes valores:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Configuración de la Base de Datos

Asegúrate de que tu base de datos en Supabase tenga las siguientes tablas configuradas:

- `user` - Usuarios del sistema
- `product` - Productos
- `category` - Categorías de productos
- `order` - Órdenes de compra
- `order_item` - Items de las órdenes
- `payment` - Pagos
- `payment_method` - Métodos de pago
- `multimedia` - Imágenes de productos
- `rating` - Calificaciones de vendedores

Consulta la documentación del proyecto para el esquema completo de la base de datos.

## ▶️ Ejecución

### Modo Desarrollo

Ejecuta el proyecto en modo desarrollo:

```bash
npm run dev
```

El servidor de desarrollo se iniciará en `http://localhost:8080`

### Modo Producción

1. **Construir el proyecto**

```bash
npm run build
```

2. **Previsualizar la build de producción**

```bash
npm run preview
```

## 📜 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run build:dev` - Construye la aplicación en modo desarrollo
- `npm run preview` - Previsualiza la build de producción localmente
- `npm run lint` - Ejecuta el linter para verificar el código

## 📁 Estructura del Proyecto

```
Final-Project/Code/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── cart/          # Componentes del carrito
│   │   ├── dashboard/     # Componentes de dashboards
│   │   ├── home/          # Componentes de la página principal
│   │   ├── layout/        # Componentes de layout (Header, Footer)
│   │   ├── product/       # Componentes de productos
│   │   ├── rating/        # Componentes de calificaciones
│   │   ├── ui/            # Componentes de UI (shadcn/ui)
│   │   └── vendor/        # Componentes para vendedores
│   ├── context/           # Contextos de React (Auth, Cart)
│   ├── data/              # Datos mock (para desarrollo)
│   ├── hooks/             # Hooks personalizados
│   ├── integrations/      # Integraciones (Supabase)
│   ├── lib/               # Utilidades y helpers
│   ├── pages/             # Páginas/rutas de la aplicación
│   │   ├── checkout/      # Páginas de checkout
│   │   └── vendor/        # Páginas de vendedor
│   ├── types/             # Definiciones de TypeScript
│   ├── App.tsx            # Componente principal de la aplicación
│   ├── main.tsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── .env                   # Variables de entorno (crear)
├── index.html             # HTML principal
├── package.json           # Dependencias y scripts
├── tailwind.config.ts     # Configuración de Tailwind CSS
├── tsconfig.json          # Configuración de TypeScript
├── vite.config.ts         # Configuración de Vite
└── vercel.json            # Configuración de Vercel (despliegue)
```

## 🌐 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave pública/anónima de Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 🚀 Despliegue

### Despliegue en Vercel

1. **Instalar Vercel CLI** (opcional)

```bash
npm i -g vercel
```

2. **Desplegar**

```bash
vercel
```

O conecta tu repositorio directamente desde el [dashboard de Vercel](https://vercel.com/).

3. **Configurar variables de entorno en Vercel**

En el dashboard de Vercel, agrega las variables de entorno:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Despliegue en otras plataformas

El proyecto es una SPA (Single Page Application) que puede desplegarse en cualquier plataforma que soporte hosting estático:

- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- **Firebase Hosting**

## 🔐 Roles de Usuario

La aplicación soporta tres tipos de usuarios:

1. **Administrador**: Acceso completo al sistema, dashboards, gestión de usuarios, productos, etc.
2. **Vendedor**: Puede gestionar sus propios productos y ver sus ventas
3. **Comprador**: Puede navegar, comprar productos y calificar vendedores

## 📝 Notas Adicionales

- El carrito de compras se almacena en `localStorage` del navegador
- Las sesiones de usuario se mantienen mediante Supabase Auth
- La aplicación está optimizada para producción con Vite
- El diseño es completamente responsive

## 🐛 Solución de Problemas

### Error: "Supabase: faltan variables de entorno"

- Verifica que el archivo `.env` existe en la raíz del proyecto
- Asegúrate de que las variables comienzan con `VITE_`
- Reinicia el servidor de desarrollo después de agregar variables de entorno

### Error de conexión a Supabase

- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que tu proyecto de Supabase esté activo
- Verifica la configuración de RLS (Row Level Security) en Supabase

### El puerto 8080 está en uso

Modifica el puerto en `vite.config.ts`:

```typescript
server: {
  port: 3000, // Cambiar al puerto deseado
}
```

## 👥 Autores

- **Ruben David Montoya Arredondo**  
  📧 rdmontoyaa@udistrital.edu.co

- **Hemerson Julian Ballen Triana**  
  📧 hjballent@udistrital.edu.co

- **Andruew Steven Zabala Serrano**  
  📧 aszabalas@udistrital.edu.co

---

**Universidad Distrital Francisco José de Caldas**  
**Departamento de Ingeniería de Sistemas**  
**Curso: Bases de Datos II**

