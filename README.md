# ✦ Creaciones Ágape — Guía de Configuración

## Archivos del proyecto

```
agape/
├── index.html      ← La tienda pública
├── admin.html      ← Panel para el dueño
├── style.css       ← Estilos
├── app.js          ← Lógica de la tienda
├── config.js       ← ⭐ AQUÍ se configuran los datos
└── README.md       ← Esta guía
```

---

## ⚡ Configuración inicial (solo 1 vez)

### 1. Editar `config.js`

Abre el archivo `config.js` y rellena:

```js
const CONFIG = {
  SHEET_ID: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms", // ← ID de tu Google Sheet
  WHATSAPP: "521234567890",   // ← Tu número (código país + número, sin + ni espacios)
  EMAIL: "tucorreo@gmail.com", // ← Tu correo
  CURRENCY: "$",
  STORE_NAME: "Creaciones Ágape",
};
```

### 2. Crear el Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com)
2. Crea una hoja nueva
3. En la **fila 1** escribe estos encabezados exactos:

| nombre | descripcion | precio | categoria | imagen | disponible |
|--------|-------------|--------|-----------|--------|------------|
| Llavero corazón | Hecho a mano | 150 | Llaveros | https://... | si |

4. Agrega tus productos en las filas siguientes
5. Ve a **Archivo → Compartir → Publicar en la web**
6. Selecciona tu hoja y elige **"Valores separados por comas (.csv)"**
7. Clic en **Publicar**
8. Copia el **ID** de la URL (la parte entre `/d/` y `/edit`)

### 3. Para las imágenes

Sube tus fotos gratis a [imgbb.com](https://imgbb.com) y pega la URL directa en la columna `imagen` de tu Sheet.

---

## 🌐 Publicar la página (GRATIS)

### Opción A: GitHub Pages (recomendado)
1. Crea cuenta en [github.com](https://github.com)
2. Nuevo repositorio → sube todos los archivos
3. Ve a Settings → Pages → Branch: main
4. Tu tienda estará en: `https://tuusuario.github.io/nombre-repo`
5. Para el dominio propio: Settings → Pages → Custom domain → escribe tu dominio

### Opción B: Netlify
1. Crea cuenta en [netlify.com](https://netlify.com)
2. Arrastra la carpeta de archivos
3. Dominio propio: Site Settings → Domain Management → Add custom domain

---

## 🔐 Panel de administración

- Accede en: `tu-sitio.com/admin.html`
- Contraseña por defecto: **agape2024**
- **¡Cambia la contraseña!** Abre `admin.html`, busca la línea:
  ```js
  const ADMIN_PASSWORD = "agape2024";
  ```
  y cámbiala por algo seguro.

---

## 📦 Gestión de productos (el dueño lo hace solo)

El dueño de la tienda solo necesita abrir su **Google Sheet** y:
- ✅ Agregar fila = nuevo producto
- ✏️ Editar celda = actualizar nombre/precio/descripción
- ❌ Escribir `no` en la columna `disponible` = ocultar producto
- 📁 Cambiar `categoria` = reorganizar el catálogo

Los cambios se reflejan en la tienda en ~1 minuto automáticamente.

---

## 💰 Costos

| Servicio | Costo |
|----------|-------|
| Google Sheets | Gratis |
| imgbb.com (imágenes) | Gratis |
| GitHub Pages / Netlify | Gratis |
| Dominio (.com) | ~$12 USD/año |
| **Total anual** | **~$12 USD** |
