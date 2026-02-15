# Guía paso a paso: Crear colecciones en Firestore

Sigue estos pasos en orden. En Firebase Console → Firestore Database, haz clic en **+ Iniciar colección** o **+ Agregar colección** según corresponda.

---

## 1. Colección `portfolio`

1. Clic en **+ Iniciar colección**
2. **ID de la colección:** `portfolio`
3. Clic en **Siguiente**

### Documento `hero`

4. **ID del documento:** `hero`
5. Agrega los campos (tipo string):

| Campo | Tipo | Valor |
|-------|------|-------|
| subtitle | string | Desarrollador Full Stack |
| name | string | Angel Lugo |
| tagline | string | Creo soluciones web y móviles con JavaScript, React, Node.js y más. Interfaces intuitivas y arquitecturas escalables. |
| cvUrl | string | /Angel-Lugo-CV.pdf |
| githubUrl | string | https://github.com/Angel17x |
| linkedinUrl | string | https://www.linkedin.com/in/angel-lugo-fullstack-developer |

6. Clic en **Guardar**

### Documento `about` (en la misma colección portfolio)

7. Clic en **+ Agregar documento** (o el icono + junto a la colección portfolio)
8. **ID del documento:** `about`
9. Agrega los campos:

| Campo | Tipo | Valor |
|-------|------|-------|
| title | string | Estudiante de Ingeniería Informática |
| subtitle | string | Un poco de mi trayectoria |
| paragraphs | array | Pulsa "agregar elemento" y añade: 1) "Soy estudiante de Ingeniería Informática..." 2) "Me especializo en la creación de interfaces intuitivas..." |
| languages | array | Añade 2 mapas: {label: "Español", level: "Nativo"} y {label: "Inglés", level: "Lectura"} |

10. Clic en **Guardar**

### Documento `contact` (en portfolio)

11. Clic en **+ Agregar documento**
12. **ID del documento:** `contact`
13. Agrega los campos (todos string):

| Campo | Tipo | Valor |
|-------|------|-------|
| title | string | ¿Tienes un proyecto en mente? |
| description | string | Estoy disponible para nuevas oportunidades. No dudes en contactarme. |
| email | string | angel26078613@gmail.com |
| phone | string | +58 414 237 4668 |
| cvUrl | string | /Angel-Lugo-CV.pdf |
| githubUrl | string | https://github.com/Angel17x |
| linkedinUrl | string | https://www.linkedin.com/in/angel-lugo-fullstack-developer |
| location | string | Venezuela |

14. Clic en **Guardar**

---

## 2. Colección `experiences`

1. Clic en **+ Agregar colección**
2. **ID de la colección:** `experiences`
3. Clic en **Siguiente**
4. **ID del primer documento:** `exp-0`
5. Agrega los campos:

| Campo | Tipo | Valor |
|-------|------|-------|
| order | number | 0 |
| title | string | Desarrollador Backend |
| company | string | Global Resource |
| period | string | Abril 2025 - Actualidad |
| current | boolean | true |
| description | string | Diseño de soluciones empresariales robustas con microservicios... |

6. Clic en **Guardar**
7. Repite con **+ Agregar documento** para cada experiencia (exp-1, exp-2, etc.), incrementando `order` en cada una.

---

## 3. Colección `projects`

1. Clic en **+ Agregar colección**
2. **ID de la colección:** `projects`
3. Clic en **Siguiente**
4. **ID del documento:** `proj-0`
5. Agrega los campos:

| Campo | Tipo | Valor |
|-------|------|-------|
| order | number | 0 |
| title | string | App con IA - Chatbot Salomón |
| stack | array | ["Next.js", "Node.js", "Flutter", "Drizzle", "IA"] |
| description | string | Aplicación web y móvil centrada en IA con chatbot... |
| icon | string | bot |

Valores válidos para `icon`: `bot`, `globe`, `smartphone`, `shield`

6. Repite para cada proyecto, incrementando `order`.

---

## 4. Colección `skillGroups`

1. Clic en **+ Agregar colección**
2. **ID de la colección:** `skillGroups`
3. Clic en **Siguiente**
4. **ID del documento:** `sg-0`
5. Agrega los campos:

| Campo | Tipo | Valor |
|-------|------|-------|
| order | number | 0 |
| title | string | Avanzado |
| level | number | 90 |
| accent | string | from-primary to-primary/70 |
| skills | array | ["Node.js", "JavaScript"] |

6. Crea sg-1 (Intermedio, level 65) y sg-2 (Básico, level 40) con sus respectivas skills.

---

## 5. Colección `education`

1. Clic en **+ Agregar colección**
2. **ID de la colección:** `education`
3. Clic en **Siguiente**
4. **ID del documento:** `edu-0`
5. Agrega los campos:

| Campo | Tipo | Valor |
|-------|------|-------|
| order | number | 0 |
| degree | string | Ingeniero Informático |
| institution | string | CULTCA |
| period | string | Actualmente, 2023 |

6. Crea edu-1 y edu-2 para las demás formaciones.

---

## Resumen del orden

1. **portfolio** (documentos: hero, about, contact)
2. **experiences** (documentos con order 0, 1, 2...)
3. **projects** (documentos con order 0, 1, 2...)
4. **skillGroups** (documentos con order 0, 1, 2)
5. **education** (documentos con order 0, 1, 2)

---

**Nota:** Si falta `FIREBASE_SERVICE_ACCOUNT` en tu `.env.local`, la app usará los datos por defecto del código. Para que Firestore funcione en servidor, necesitas la cuenta de servicio (JSON) en esa variable.
