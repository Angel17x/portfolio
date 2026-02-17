# SEO y Analytics - Documentación

## 📊 Sistema de Analytics Implementado

### Firebase y Analytics Gratuito

**Firebase ofrece servicios gratuitos para analytics:**

1. **Firebase Analytics (Gratuito)**
   - Límite: Ilimitado de eventos
   - Ideal para apps móviles principalmente
   - También funciona en web pero con limitaciones

2. **Firestore (Gratuito hasta cierto límite)**
   - **Plan Spark (Gratuito):**
     - 1 GB de almacenamiento
     - 10 GB/mes de transferencia
     - 50K lecturas/día
     - 20K escrituras/día
     - 20K eliminaciones/día
   - **Plan Blaze (Pago por uso):**
     - Mismo límite gratuito + pago por uso adicional
     - Muy económico para proyectos pequeños/medianos

### Sistema Implementado

Hemos creado un **sistema de tracking personalizado** usando **Firestore** que:

✅ **Es completamente gratuito** dentro del plan Spark de Firebase
✅ **Registra cada visita** con información detallada:
   - Ruta visitada
   - Sección visitada
   - Dispositivo (mobile, desktop, tablet)
   - Navegador
   - Sistema operativo
   - User Agent
   - Referrer
   - IP (para identificar visitantes únicos)
   - Timestamp

✅ **Dashboard de Analytics** en el panel de administración con:
   - Total de visitas
   - Visitantes únicos
   - Secciones más visitadas
   - Dispositivos más usados
   - Visitas recientes
   - Estadísticas por fecha

### Cómo Funciona

1. **Tracking Automático**: Cada vez que alguien visita tu sitio, se registra automáticamente
2. **Sin cookies**: Usa sessionId basado en IP + User Agent + fecha
3. **Privacidad**: No almacena información personal identificable
4. **Dashboard**: Accede desde Admin Panel → Analytics

## 🔍 Mejoras de SEO Implementadas

### 1. Metadata Dinámica
- ✅ Metadata mejorada en `layout.tsx` con Open Graph y Twitter Cards
- ✅ Metadata dinámica en `page.tsx` basada en datos de Firebase
- ✅ Keywords optimizados
- ✅ Descripciones personalizadas

### 2. Structured Data (JSON-LD)
Implementado Schema.org para:
- ✅ **Person Schema**: Información personal y profesional
- ✅ **Professional Service Schema**: Servicios profesionales
- ✅ **Work Experience Schema**: Experiencias laborales
- ✅ **Education Schema**: Educación y credenciales
- ✅ **Project Schema**: Proyectos realizados

Esto ayuda a Google a entender mejor tu contenido y mostrarlo en resultados enriquecidos.

### 3. Sitemap.xml
- ✅ Generado automáticamente por Next.js
- ✅ Incluye todas las rutas principales
- ✅ Actualizado dinámicamente
- ✅ Accesible en `/sitemap.xml`

### 4. Robots.txt
- ✅ Configurado para permitir indexación
- ✅ Bloquea rutas de admin y API
- ✅ Referencia al sitemap
- ✅ Accesible en `/robots.txt`

### 5. Optimizaciones Adicionales
- ✅ URLs semánticas y limpias
- ✅ Contenido estructurado con HTML semántico
- ✅ Alt text en imágenes (agregar cuando subas imágenes)
- ✅ Meta descriptions optimizadas

## 📈 Próximos Pasos Recomendados

### Para Mejorar SEO:

1. **Google Search Console**
   - Registra tu sitio en [Google Search Console](https://search.google.com/search-console)
   - Verifica propiedad del sitio
   - Envía el sitemap manualmente

2. **Google Analytics** (Opcional)
   - Si quieres más funcionalidades, puedes agregar Google Analytics
   - El sistema actual es suficiente para la mayoría de casos

3. **Imagen OG (Open Graph)**
   - Crea una imagen `public/og-image.jpg` (1200x630px)
   - Se usará cuando compartas tu sitio en redes sociales

4. **Verificación de Sitio**
   - Agrega códigos de verificación en `layout.tsx` (metadata.verification)
   - Para Google, Bing, etc.

5. **Performance**
   - Optimiza imágenes (usa Next.js Image component)
   - Minimiza JavaScript
   - Usa lazy loading

### Para Mejorar Analytics:

1. **Geolocalización** (Opcional)
   - Puedes agregar un servicio como [ipapi.co](https://ipapi.co) (gratuito hasta 1000 requests/día)
   - Para obtener país y ciudad de los visitantes

2. **Eventos Personalizados**
   - Puedes agregar tracking de eventos específicos (clicks en botones, descargas de CV, etc.)

3. **Retención de Datos**
   - Considera implementar limpieza automática de datos antiguos (>90 días)
   - Para mantener el uso dentro del plan gratuito

## 💰 Costos Estimados

Con el sistema actual usando **Firestore Plan Spark (Gratuito)**:

- **Visitas estimadas que puedes manejar gratis**: ~1,500-2,000 visitas/mes
- **Si superas el límite**: El plan Blaze cobra ~$0.06 por cada 100K lecturas adicionales
- **Muy económico**: Incluso con 10,000 visitas/mes, el costo sería mínimo

## 🚀 Cómo Usar el Dashboard de Analytics

1. Inicia sesión en el Admin Panel
2. Ve a la sección "Analytics"
3. Selecciona el período (7, 30, o 90 días)
4. Revisa las estadísticas:
   - Total de visitas
   - Visitantes únicos
   - Secciones más populares
   - Dispositivos más usados
   - Visitas recientes con detalles

## 📝 Notas Importantes

- El tracking es **automático** y **no invasivo**
- No se almacenan datos personales identificables
- Los datos se almacenan en Firestore bajo la colección `visits`
- Puedes exportar los datos si lo necesitas
- El sistema respeta la privacidad de los visitantes
