# Configuración de Firebase para el Portafolio

Este portafolio usa **Firestore** para cargar el contenido de forma dinámica. Así puedes actualizar experiencias, proyectos, habilidades, etc. desde la consola de Firebase sin necesidad de redesplegar la aplicación.

## 1. Crear proyecto en Firebase

1. Entra a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto (o usa uno existente)
3. Activa **Firestore Database** en modo producción
4. En la configuración del proyecto (⚙️ > Configuración general), copia los datos de la app web

## 2. Variables de entorno

El portafolio usa **Firebase Admin** en el servidor (Server Components). Crea `.env.local` con:

```env
# Obligatorio: JSON de la cuenta de servicio
# Firebase Console > Configuración > Cuentas de servicio > Generar nueva clave privada
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"tu-proyecto",...}
```

Copia el contenido completo del archivo JSON de la cuenta de servicio (como texto en una sola línea).

## 3. Reglas de seguridad de Firestore

En Firestore > Reglas, configura lectura pública (los datos del portafolio son públicos):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /portfolio/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    match /experiences/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    match /projects/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    match /skillGroups/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    match /education/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 4. Estructura de Firestore

### Colección `portfolio` (documentos individuales)

| Documento | Campos |
|-----------|--------|
| `hero` | `subtitle`, `name`, `tagline`, `cvUrl`, `githubUrl`, `linkedinUrl` |
| `about` | `title`, `subtitle`, `paragraphs` (array), `languages` (array de `{label, level}`) |
| `contact` | `title`, `description`, `email`, `phone`, `cvUrl`, `githubUrl`, `linkedinUrl`, `location` |

### Colección `experiences`

Cada documento: `title`, `company`, `period`, `current` (boolean), `description`, `order` (number para ordenar)

### Colección `projects`

Cada documento: `title`, `stack` (array), `description`, `icon` (`"bot"` \| `"globe"` \| `"smartphone"` \| `"shield"`), `order`

### Colección `skillGroups`

Cada documento: `title`, `level` (0-100), `accent` (string de clases Tailwind), `skills` (array), `order`

### Colección `education`

Cada documento: `degree`, `institution`, `period`, `order`

## 5. Poblar datos iniciales

### Opción A: Desde la consola de Firebase

Crea manualmente los documentos y colecciones siguiendo la estructura anterior. Los valores actuales están en `src/lib/portfolio-defaults.ts`.

### Opción B: Script de seed (requiere Firebase Admin)

1. Instala Firebase Admin: `npm install firebase-admin`
2. Descarga el JSON de la cuenta de servicio desde Firebase Console > Configuración > Cuentas de servicio
3. Ejecuta:

```bash
# Con variable de entorno
set GOOGLE_APPLICATION_CREDENTIALS=ruta\a\tu-service-account.json
node scripts/seed-firestore.mjs
```

O pasa las credenciales en JSON como `FIREBASE_SERVICE_ACCOUNT`.

## 6. Guía paso a paso

Para crear las colecciones documento por documento, sigue **FIRESTORE_COLLECTIONS.md**.

## 7. Sin Firebase

Si no configuras `FIREBASE_SERVICE_ACCOUNT`, el portafolio usa los datos por defecto del código. La app funciona igual; solo que los cambios requerirían redeploy.
