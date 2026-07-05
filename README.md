# ComercioTech

Aplicación de gestión de clientes, productos y pedidos, construida con Node.js, Express, MongoDB y EJS.

## Requisitos previos

Antes de empezar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 16 o superior recomendada)
- npm (viene incluido con Node.js)
- Git

## Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/heavenobscured/turepo.git
   cd turepo
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto, usando `.env.example` como plantilla:

   ```bash
   cp .env.example .env
   ```

   Luego abre `.env` y completa la variable con la URI real de MongoDB (pídela al encargado del proyecto, no la compartas por chats públicos ni la subas a GitHub):

   ```
   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/?appName=NombreCluster
   ```

4. **Ejecutar el proyecto**

   ```bash
   npm run dev   ```

   Si todo salió bien, deberías ver en la consola:

   ```
   te conectaste a MongoDB
   servidor en http://localhost:3000
   ```

5. **Abrir en el navegador**

   Ve a [http://localhost:3000](http://localhost:3000)

## Estructura del proyecto

```
├── app.js              # Servidor principal (rutas y lógica)
├── views/              # Vistas EJS (home, clientes, productos, pedidos)
├── public/             # Archivos estáticos (CSS, JS, imágenes)
├── .env                # Variables de entorno (NO se sube a git)
├── .env.example        # Plantilla de variables de entorno
└── .gitignore
```

## Funcionalidades

- **Clientes**: crear, listar, actualizar (datos y dirección) y eliminar clientes.
- **Productos**: crear, listar, actualizar y eliminar productos.
- **Pedidos**: crear pedidos asociados a clientes y productos, con detalle mediante `$lookup`.

## Rutas principales

| Método | Ruta                          | Descripción                          |
|--------|-------------------------------|---------------------------------------|
| GET    | `/`                            | Redirige a `/home`                    |
| GET    | `/home`                        | Página de inicio                      |
| GET    | `/clientes`                    | Lista todos los clientes              |
| POST   | `/clientes`                    | Crea un nuevo cliente                 |
| PUT    | `/clientes/:id`                | Actualiza un cliente                  |
| PUT    | `/clientes/:id/direccion`      | Actualiza solo la dirección           |
| GET    | `/clientes/ciudad/:ciudad`     | Busca clientes por ciudad             |
| DELETE | `/clientes/:id`                | Elimina un cliente                    |
| GET    | `/productos`                   | Lista todos los productos             |
| POST   | `/productos`                   | Crea un nuevo producto                |
| PUT    | `/productos/:id`               | Actualiza un producto                 |
| DELETE | `/productos/:id`               | Elimina un producto                   |
| GET    | `/pedidos`                     | Lista todos los pedidos               |
| POST   | `/pedidos`                     | Crea un nuevo pedido                  |

## Notas para colaboradores

- Nunca subas el archivo `.env` con credenciales reales.
- Si agregas nuevas variables de entorno, actualiza también `.env.example`.
- Antes de hacer `push`, verifica que `node_modules/` y `.env` estén en `.gitignore`.

## Contribuir

1. Crea una rama nueva para tu cambio: `git checkout -b nombre-de-tu-feature`
2. Haz tus cambios y commitea: `git commit -m "Descripción del cambio"`
3. Sube tu rama: `git push origin nombre-de-tu-feature`
4. Abre un Pull Request en GitHub para revisión antes de fusionar a `main`.