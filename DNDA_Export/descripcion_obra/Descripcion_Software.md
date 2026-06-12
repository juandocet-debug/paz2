# Descripción de la Obra: Observatorio de Prácticas Educativas

**Título de la Obra:** Observatorio de Prácticas Educativas — Paz, Memoria y Derechos Humanos
**Autor Institucional:** Universidad Pedagógica Nacional (UPN) - Colombia

## 1. Objetivo del Software
El "Observatorio de Prácticas Educativas" es una plataforma tecnológica integral diseñada para centralizar, gestionar, analizar y visualizar datos relacionados con prácticas educativas vinculadas a la paz, la memoria histórica y los derechos humanos en Colombia. Su propósito es proveer a investigadores, docentes y administradores de la UPN de una herramienta centralizada para explorar estadísticas, mapas interactivos e inteligencia artificial aplicada a los datos educativos.

## 2. Arquitectura General
El sistema utiliza una arquitectura Cliente-Servidor (Frontend y Backend separados) comunicados a través de una API REST.

- **Frontend (Cliente):** Desarrollado como una Single Page Application (SPA), encargada de la interfaz de usuario, la navegación reactiva y la visualización de datos (gráficas, mapas, tablas).
- **Backend (Servidor):** Proveedor de la lógica de negocio, procesamiento de archivos (cargas masivas de Excel/CSV), interacción con el modelo de IA y persistencia de datos.
- **Base de Datos:** Sistema de almacenamiento relacional para el registro de prácticas, usuarios y analíticas.

## 3. Módulos y Funcionalidades Principales

La plataforma se compone de los siguientes módulos funcionales:

1. **Autenticación (Login):** Acceso seguro al panel administrativo mediante credenciales.
2. **Dashboard de Analíticas:** Panel principal que resume el total de prácticas registradas, métricas clave y gráficas dinámicas sobre el estado de las prácticas a nivel nacional.
3. **Conflictos y Políticas:** Módulo documental/analítico sobre contextos de conflictos armados y políticas públicas relacionadas.
4. **Tabla de Datos (Gestión de Prácticas):** Interfaz para consultar, filtrar y administrar el registro detallado de cada práctica educativa.
5. **Chat con Inteligencia Artificial:** Asistente conversacional integrado para que los usuarios puedan consultar los datos del observatorio mediante lenguaje natural.
6. **Mapa de Calor:** Visualización geográfica interactiva que muestra la concentración de prácticas educativas en diferentes zonas y departamentos de Colombia.
7. **Carga de Archivos e Histórico:** Módulo que permite la carga masiva de nuevas prácticas (mediante archivos Excel/CSV) y el seguimiento histórico de qué usuario subió qué datos y en qué momento.

## 4. Tecnologías Utilizadas

### Frontend (Interfaz de Usuario)
- **Framework:** React 19
- **Empaquetador/Librería de Construcción:** Vite
- **Gráficas:** Recharts
- **Iconografía:** Lucide React
- **Mapas:** Google Maps JS API

### Backend (Lógica y API REST)
- **Entorno de Ejecución:** Node.js
- **Framework Web:** Express.js
- **Autenticación:** JSON Web Tokens (JWT)
- **Gestión de Archivos:** Multer y XLSX (para procesar archivos Excel)
- **Base de Datos:** Soporte híbrido para SQLite (mediante `better-sqlite3` / `sql.js`) y PostgreSQL (`pg`).

## 5. Flujo de Operación
1. El usuario administrador ingresa a la plataforma web.
2. Tras la validación del Token JWT, accede al **Dashboard**.
3. El administrador puede navegar mediante un menú lateral (Sidebar) cambiando el estado de la vista (SPA).
4. El usuario puede dirigirse a **Cargar Archivo** para alimentar el sistema con nuevos datos en formato hoja de cálculo.
5. El backend procesa el archivo, extrae los registros de prácticas educativas y las guarda en la base de datos.
6. Automáticamente, el **Mapa**, las **Gráficas** y la **Tabla de Datos** se actualizan reflejando la nueva información.
7. El usuario puede utilizar el **Chat con IA** para realizar cruces de información complejos sobre la base de datos actualizada.

## 6. Tipo de Usuarios
- **Administrador / Investigador:** Tiene permisos totales para visualizar información, realizar cargas masivas de datos, interactuar con el mapa de calor y el chat de IA.
- **Usuario Público (Vista Pública):** Acceso limitado a información depurada para divulgación (redirección configurada en el sistema).

## 7. Valor Diferencial
La integración de un "Chat con Inteligencia Artificial" enfocado específicamente en consultar la base de datos documental sobre "Paz, Memoria y Derechos Humanos" representa una innovación educativa significativa, ya que transforma una base de datos estática en un observatorio interactivo donde los investigadores pueden "dialogar" con los datos.
