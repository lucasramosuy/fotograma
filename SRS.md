# SRS - Fotograma

## Alcance
- Un acertijo diario común a todos según la fecha de Uruguay (UTC−3), a partir del 27/09/2026. El pool contiene 28 fotos y palabras curadas; después se repite hasta agregar más contenido y desplegar manualmente. No prometer contenido nuevo indefinidamente sin curaduría.
- Fotografía hotlinkeada desde `photo.urls` de la API de Unsplash, con fotógrafo y enlaces de atribución.
- Hasta cinco intentos para adivinar una palabra de longitud variable. Verde = posición exacta, ocre = letra en otra posición, gris = ausente. Las repetidas respetan los conteos disponibles. El contador muestra intentos usados al jugar y al terminar.
- Teclado táctil y físico, borrar y enviar, una pista por partida. Estado por ID del acertijo en este dispositivo.
- Al terminar, generar en Canvas una imagen vertical de 1080 × 1920 con foto del acertijo, Nº, puntuación, grilla de intentos y crédito. Vista previa, descarga y Web Share API de archivos donde esté disponible; sin subir la partida al servidor.
- Mantener la copia de número, intentos, grilla de emojis y enlace como alternativa de texto, sin revelar respuesta; selección manual si falla el portapapeles.
- Racha de días consecutivos ganados en `localStorage`, por fechas del acertijo; no se sincroniza entre dispositivos.
- Archivo de acertijos anteriores en `/fotograma/?archivo`: lista con foto, Nº, fecha, largo de la palabra y estado propio por acertijo (sin jugar, en juego, resuelto) leído del mismo `localStorage`. Jugar un acertijo viejo (`/fotograma/?n=N`) usa la misma pantalla de juego en modo archivo: no suma ni rompe la racha diaria, no recarga al cambiar el día y avisa que la racha queda intacta. El acertijo del día aparece primero con marca HOY y abre el juego diario normal.
- La clave de Unsplash se guarda solo como secreto del Worker; solo sirve metadata necesaria. `/fotograma/api/today` da el acertijo del día, `/fotograma/api/puzzle?n=N` uno anterior (404 si no existe o es futuro) y `/fotograma/api/archive` la lista completa con miniaturas. La metadata de cada foto se cachea 24 horas por instancia y la lista del archivo 10 minutos, para no acercarse al límite de 50 solicitudes/hora del modo demo de Unsplash. Si falta la clave o falla la API, mostrar error sin secretos.
- Hosting en Worker + Static Assets de Cloudflare bajo `/fotograma/`; despliegue manual mediante GitHub Actions.

## Fuera de alcance
- Generación automática de acertijos, cuentas, estadísticas compartidas, ranking, contenido nuevo indefinido sin mantenimiento, costes pagos o cambios en el Worker proxy general.
