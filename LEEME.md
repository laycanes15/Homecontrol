# 🏠 Gestor del Hogar Valledupar — PWA

## ¿Cómo instalar en tu celular?

### Android (Chrome / Samsung Internet)
1. Abre el archivo `index.html` en tu navegador
2. Verás un banner en la parte superior que dice **"Instala la app en tu celular"**
3. Toca **"Instalar"**
4. La app aparecerá en tu pantalla de inicio como una app normal

### iOS (Safari)
1. Abre el archivo `index.html` en Safari
2. Toca el botón de **Compartir** (cuadrado con flecha hacia arriba)
3. Selecciona **"Añadir a pantalla de inicio"**
4. Toca **"Añadir"**
5. La app aparece en tu pantalla de inicio

---

## ¿Cómo poner la app en línea? (para acceder desde cualquier celular)

### Opción 1: GitHub Pages (GRATIS)
1. Crea una cuenta en github.com
2. Crea un repositorio nuevo (público)
3. Sube todos los archivos de esta carpeta
4. Ve a Settings → Pages → Branch: main → Save
5. Tu app estará en: `https://tu-usuario.github.io/nombre-repo`

### Opción 2: Netlify (GRATIS, más fácil)
1. Ve a netlify.com y crea una cuenta
2. Arrastra la carpeta completa al navegador
3. Listo — te dan una URL para compartir

### Opción 3: Vercel (GRATIS)
1. Ve a vercel.com
2. Conecta con GitHub
3. Importa el repositorio

---

## Archivos del proyecto
```
gastor-hogar-pwa/
├── index.html      ← App principal (toda la lógica aquí)
├── manifest.json   ← Configuración PWA
├── sw.js           ← Service Worker (offline)
└── icons/          ← Íconos para la app
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    └── icon-512.png
```

## Características
- ✅ Funciona sin internet (datos guardados localmente)
- ✅ Se instala como app nativa
- ✅ Exporta PDF, Excel y WhatsApp
- ✅ Descuentos de seguridad social automáticos
- ✅ Servicios de Valledupar incluidos
- ✅ 11 secciones completas
