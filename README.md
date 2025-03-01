# 🎵 Spotify Widget

Un widget de Spotify minimalista creado con Electron y React, que permite visualizar y controlar la música desde el escritorio sin depender de la API de Spotify.

## 🚀 Características

✅ Controla la música sin depender de la API de Spotify.  
✅ Guarda la última canción reproducida cuando no se está escuchando música.  
✅ Se minimiza en la bandeja del sistema y permite restaurarse con un clic.  
✅ Soporte para **Windows, macOS y Linux**.  

---

## 🛠 Instalación y Uso

### 1️⃣ Clonar el repositorio  

```sh
git clone https://github.com/pipetboy2001/spotify-widget.git
cd spotify-widget
```

### 2️⃣ Instalar dependencias  

```sh
npm install
```

### 3️⃣ Ejecutar en modo desarrollo  

```sh
npm run dev
```

Esto abrirá el widget y te permitirá hacer cambios en tiempo real.

---

## 📦 Cómo generar el instalador  

Puedes construir el widget para los tres sistemas operativos:

### 🔹 Windows  

```sh
npm run build:win
```

Esto generará un archivo `.exe` en la carpeta `dist`.

### 🔹 macOS  

```sh
npm run build:mac
```

Esto generará un archivo `.dmg` para instalarlo en Mac.

### 🔹 Linux  

```sh
npm run build:linux
```

Esto generará un archivo `.AppImage` o `.deb` dependiendo de la configuración.

---

## 🔧 Tecnologías utilizadas  

🚀 **Electron** → Para la creación de la aplicación de escritorio.  
🎨 **React** → Para la interfaz de usuario.  
📦 **Electron Builder** → Para generar los instaladores.  

---

💻 Hecho con ❤️ por pipetboy
