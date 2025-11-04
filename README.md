# 🏦 AFI Reservas - Dashboard de Fondos de Inversión

<div align="center">
  <img src="/public/afi-reservas.png" alt="AFI Reservas Logo" width="200"/>
  
  ### 📊 Dashboard Interactivo para la Gestión de Fondos de Inversión
  
  <p align="center">
    <img src="https://img.shields.io/badge/React-18.3.1-blue.svg?style=flat&logo=react"/>
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=flat&logo=typescript"/>
    <img src="https://img.shields.io/badge/Tailwind%20CSS-3.0-blue.svg?style=flat&logo=tailwind-css"/>
    <img src="https://img.shields.io/badge/Vite-5.0-blue.svg?style=flat&logo=vite"/>
    <img src="https://img.shields.io/badge/Recharts-2.12-blue.svg?style=flat&logo=chart.js"/>
  </p>
</div>

## 🎯 Descripción General

**AFI Reservas** es una aplicación web moderna y completa diseñada para la gestión y visualización de fondos de inversión. Desarrollada con React y TypeScript, ofrece una interfaz intuitiva para administrar múltiples fondos, realizar seguimiento de movimientos y analizar el rendimiento de inversiones a través de visualizaciones interactivas.

### ✨ Características Principales

- 🏛️ **Gestión de Múltiples Fondos**: Administración completa de diversos fondos de inversión
- 📈 **Visualizaciones Interactivas**: Gráficos de líneas y barras con Recharts
- 📱 **Diseño Responsivo**: Interfaz adaptativa para todos los dispositivos
- 💾 **Almacenamiento Local**: Persistencia de datos mediante localStorage
- 📊 **Análisis de Rendimiento**: Cálculo automático de retornos mensuales y anuales
- 📤 **Importación de Estados de Cuenta**: Carga masiva de movimientos desde archivos
- 🎨 **UI Moderna**: Componentes personalizados con Tailwind CSS y animaciones
- 🔐 **Seguridad**: Base de datos SQLite en el navegador con sql.js

## 🚀 Tecnologías Utilizadas

### Frontend Core
- **[React 18.3.1](https://react.dev/)** - Biblioteca de interfaz de usuario
- **[TypeScript](https://www.typescriptlang.org/)** - Superset de JavaScript con tipado estático
- **[Vite](https://vitejs.dev/)** - Herramienta de construcción rápida y moderna

### UI/UX
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de utilidades CSS
- **[Lucide React](https://lucide.dev/)** - Iconos modernos y personalizables
- **[Radix UI](https://www.radix-ui.com/)** - Componentes de interfaz accesibles y personalizables

### Visualización de Datos
- **[Recharts](https://recharts.org/)** - Biblioteca de gráficos para React
- **[Chart.js](https://www.chartjs.org/)** - Gráficos interactivos y responsivos

### Base de Datos y Almacenamiento
- **[sql.js](https://github.com/sql-js/sql.js)** - SQLite compilado a WebAssembly
- **[localStorage](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)** - Almacenamiento persistente en el navegador

### Utilidades
- **[date-fns](https://date-fns.org/)** - Manipulación de fechas
- **[uuid](https://github.com/uuidjs/uuid)** - Generación de identificadores únicos
- **[clsx](https://github.com/lukeed/clsx)** - Utilidad para construir clases CSS

## 📦 Instalación y Configuración

### Requisitos Previos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/afi-reservas.git
   cd afi-reservas
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter de ESLint

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── ui/             # Componentes de interfaz base
│   ├── ConfirmDialog.tsx
│   ├── CustomInput.tsx
│   ├── CustomSelect.tsx
│   ├── FundIcon.tsx
│   ├── FundInfoDialog.tsx
│   ├── ImportAccountStatements.tsx
│   └── InfoButton.tsx
├── hooks/              # Hooks personalizados
│   └── useDatabase.ts
├── lib/                # Utilidades y configuraciones
│   ├── accountStatementParser.ts
│   ├── dataJson.ts
│   ├── database.ts
│   └── utils.ts
├── types.ts            # Definiciones de tipos TypeScript
├── fundPresets.ts      # Configuración predefinida de fondos
├── App.tsx             # Componente principal
├── main.tsx            # Punto de entrada de React
└── index.css           # Estilos globales
```

### Estructura de Datos

#### Tipo `Fund`
```typescript
type Fund = {
  id: string;
  name: string;
  adminFeePct: number;
  logoDataUrl?: string;
}
```

#### Tipo `Movement`
```typescript
type Movement = {
  id: string;
  fundId: string;
  date: string;
  concept: string;
  shares: number;
  amount: number;
  nav: number;
  type?: string;
  periodReturnPct?: number;
  annualReturnPct?: number;
}
```

## 🎨 Fondos de Inversión Disponibles

El sistema incluye 8 fondos de inversión preconfigurados:

### 🏛️ Fondo Quisqueya
- **Tipo**: Fondo abierto en pesos
- **Perfil**: Corto plazo, sin permanencia mínima
- **Características**: Alta liquidez y rendimiento competitivo

### 🌳 Fondo Caoba
- **Tipo**: Fondo de renta fija
- **Perfil**: Inversiones en instrumentos de deuda
- **Características**: Estabilidad y seguridad

### 🏗️ Fondo de Desarrollo
- **Tipo**: Fondo de capital privado
- **Perfil**: Inversiones en proyectos de infraestructura
- **Características**: Largo plazo, alto potencial de crecimiento

### 🏢 Fondo Inmobiliario
- **Tipo**: Fondo de inversión inmobiliaria
- **Perfil**: Activos raíces comerciales y residenciales
- **Características**: Diversificación y protección contra inflación

### 💎 Fondo Larimar
- **Tipo**: Fondo mixto
- **Perfil**: Combinación de renta fija y variable
- **Características**: Balance entre riesgo y rentabilidad

### 🏝️ Fondo Bohío
- **Tipo**: Fondo de inversión turística
- **Perfil**: Proyectos turísticos y hoteleros
- **Características**: Exposición al sector turismo

### 🏭 Fondo de Desarrollo II
- **Tipo**: Fondo de capital de riesgo
- **Perfil**: Empresas en crecimiento
- **Características**: Alto potencial de retorno

### 🏪 Fondo Inmobiliario II
- **Tipo**: Fondo de inversión inmobiliaria especializado
- **Perfil**: Desarrollos inmobiliarios estratégicos
- **Características**: Especialización geográfica

## 📊 Funcionalidades Detalladas

### Dashboard Principal
- **Resumen General**: Vista consolidada de todos los fondos
- **Gráficos de Rendimiento**: Visualización temporal del valor de las cuotas
- **Análisis de Retornos**: Cálculo automático de rendimientos mensuales y anuales
- **Alertas y Notificaciones**: Sistema de notificaciones para eventos importantes

### Gestión de Fondos
- **CRUD Completo**: Crear, leer, actualizar y eliminar fondos
- **Información Detallada**: Descripción, documentación y características
- **Iconos Personalizados**: Cada fondo tiene su icono e imagen representativa

### Movimientos y Transacciones
- **Registro de Movimientos**: Depósitos, retiros y dividendos
- **Importación Masiva**: Carga de estados de cuenta desde archivos
- **Validación de Datos**: Verificación automática de consistencia
- **Cálculo de NAV**: Valor de activos netos por cuota

### Análisis y Reportes
- **Gráficos Interactivos**: Líneas de tiempo y barras comparativas
- **Exportación de Datos**: Generación de reportes en formato JSON
- **Filtros Avanzados**: Búsqueda y filtrado por fecha, fondo y tipo de movimiento

## 🔧 Configuración y Personalización

### Variables de Entorno
```env
VITE_APP_NAME=AFI Reservas
VITE_APP_VERSION=1.0.0
VITE_API_URL=http://localhost:3000
```

### Personalización de Temas
La aplicación utiliza Tailwind CSS con configuración personalizable:

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-color: #1e40af;
  --secondary-color: #3b82f6;
  --accent-color: #60a5fa;
}
```

### Configuración de Fondos
Los fondos predefinidos se configuran en `src/fundPresets.ts`:

```typescript
export const FUND_PRESETS: FundPreset[] = [
  {
    key: 'quisqueya',
    name: 'Fondo Quisqueya',
    adminFeePct: 2,
    icon: '/iconos/fondo_quisqueya.svg',
    description: 'Descripción del fondo...',
    // ... más configuración
  }
];
```

## 🧪 Desarrollo y Testing

### Estructura de Testing
```
tests/
├── unit/              # Tests unitarios
├── integration/       # Tests de integración
└── e2e/              # Tests end-to-end
```

### Comandos de Testing
```bash
npm run test          # Ejecuta todos los tests
npm run test:unit     # Tests unitarios
npm run test:e2e      # Tests end-to-end
npm run test:coverage # Coverage de código
```

## 📱 Diseño Responsivo

La aplicación está optimizada para:
- **Desktop**: Resoluciones de 1024px y superiores
- **Tablet**: Resoluciones de 768px a 1023px
- **Mobile**: Resoluciones de 320px a 767px

### Breakpoints de Tailwind
```css
/* Small (sm): 640px */
/* Medium (md): 768px */
/* Large (lg): 1024px */
/* Extra Large (xl): 1280px */
/* 2X Large (2xl): 1536px */
```

## 🔒 Seguridad

### Medidas Implementadas
- **Sanitización de Datos**: Validación de entrada de usuarios
- **Encriptación Local**: Datos sensibles en localStorage
- **CORS Configurado**: Protección contra ataques cross-origin
- **Content Security Policy**: Headers de seguridad HTTP

### Mejores Prácticas
- No almacenar información sensible en texto plano
- Validación de tipos con TypeScript
- Uso de componentes controlados en formularios
- Implementación de rate limiting

## 🚀 Despliegue

### Construcción para Producción
```bash
npm run build
```

### Optimizaciones
- **Code Splitting**: División automática de código
- **Lazy Loading**: Carga perezosa de componentes
- **Tree Shaking**: Eliminación de código muerto
- **Minificación**: Compresión de archivos CSS y JS

### Servidores Recomendados
- **Vercel**: Despliegue automático desde GitHub
- **Netlify**: Hosting con CI/CD integrado
- **AWS S3 + CloudFront**: Solución escalable de AWS
- **GitHub Pages**: Hosting gratuito para proyectos open source

## 📈 Rendimiento

### Métricas de Performance
- **Tiempo de Carga**: < 3 segundos
- **First Contentful Paint**: < 1.5 segundos
- **Time to Interactive**: < 5 segundos
- **Lighthouse Score**: > 90

### Optimizaciones Aplicadas
- **Compresión Gzip**: Reducción de tamaño de archivos
- **Imágenes Optimizadas**: Formatos WebP y SVG
- **Caching Inteligente**: Estrategias de caché del navegador
- **Service Workers**: Funcionalidad offline

## 🤝 Contribución

### Guía de Contribución
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Estándares de Código
- **ESLint**: Configuración de reglas de calidad
- **Prettier**: Formateo automático de código
- **Conventional Commits**: Estandarización de mensajes de commit
- **TypeScript**: Tipado estricto habilitado

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  <p><strong>AFI Reservas Dashboard</strong> - Desarrollado con ❤️ por Darling Fajardo</p>
  <p>
    <a href="#">Volver al inicio</a> •
    <a href="https://darlingcv.dev/">Portafolio</a>
  </p>
</div>
