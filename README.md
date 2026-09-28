# Fotograma

Una foto, una palabra. Juego diario de cinco intentos bajo la identidad de lucasramos.uy. El primer acertijo fue NIEBLA (27/09/2026).

## Juego diario

El Worker selecciona un acertijo curado de `PUZZLES` en `worker.js` según la fecha de Uruguay (UTC−3), empezando el 27/09/2026. La selección es igual para todos los jugadores y cambia a las 00:00 de Uruguay. El cliente carga `/fotograma/api/today` sin usar caché, usa el ID y la fecha que entrega la API y recarga la página cuando termina el día. Cada acertijo tiene foto, respuesta y pista revisadas: no se deduce la respuesta de etiquetas ambiguas de Unsplash.

**El pool inicial contiene 14 acertijos distintos.** Tras el día 14 se repite el orden; antes de agotar el pool, añadir acertijos curados y ejecutar el deploy manual para mantener el juego nuevo. Cambiar el orden de los acertijos existentes cambia fechas futuras; no cambiar la fecha de inicio ni reutilizar IDs del día, ya que los intentos se guardan por ID. Este mecanismo no publica acertijos nuevos por sí solo de manera infinita.

La racha cuenta **días consecutivos ganados** según la fecha del acertijo en Uruguay. Una derrota no suma; si pasa un día sin ganar, la racha visible vuelve a cero. Se guarda en `localStorage` del dispositivo: no sincroniza entre equipos y puede perderse al borrar los datos del navegador. Los intentos y la pista también se guardan por acertijo en el dispositivo. Después de ganar o perder se puede generar y descargar una imagen PNG vertical (1080 × 1920) con la foto real, el Nº, la puntuación, la grilla de intentos y el crédito fotográfico. Todo se crea en el navegador con Canvas, sin subir la partida a un servidor. En navegadores que admitan Web Share API con archivos aparece además «Compartir imagen»; si la foto no puede usarse en Canvas, queda disponible el resultado en texto. «Copiar resultado como texto» mantiene la grilla de 🟩, 🟨 y ⬜, número, intentos (`X/5` si se perdió) y enlace, sin revelar la palabra. Si falla el portapapeles, se muestra el texto para seleccionarlo manualmente.

## Desarrollo

```bash
pnpm install
pnpm prepare
pnpm run check
pnpm dev
```

Usar un secreto local de Wrangler, no versionado, para probar fotos reales. El Worker consulta `GET /photos/:id` con `Client-ID`; la web usa `photo.urls.regular` directamente y enlaza tanto al fotógrafo como a Unsplash. Las fuentes del kit se copian desde paquetes @fontsource versionados al build y se sirven localmente. La metadata se cachea una hora por instancia, pero nunca más allá de la medianoche uruguaya en la respuesta HTTP; el cliente siempre solicita el puzzle actual sin caché. No se descargan ni sirven copias de las imágenes. Unsplash en modo demo limita la API a 50 solicitudes/hora por aplicación: vigilar el consumo real antes de difundir el juego. No hay cuentas ni leaderboard.

## Despliegue

Después del merge: Actions > **Desplegar Fotograma** > **Run workflow** en `main`. El workflow instala pnpm, ejecuta `check` y `prepare`, y despliega Worker, assets y secreto en un solo comando. No hay auto-deploy por merge. Las credenciales `CLOUDFLARE_API_TOKEN` y `UNSPLASH_ACCESS_KEY` quedan en GitHub Actions > Repository secrets, nunca en el repo o frontend. La configuración incluye `lucasramos.uy/fotograma` y `lucasramos.uy/fotograma/*`, más específicas que la ruta del proxy general; no modifica el código de `normativa` ni otras rutas. También hay `workers.dev` para diagnóstico.

Fuentes: https://unsplash.com/documentation · Reglas visuales: https://github.com/lucasramosuy/brand/blob/main/BRAND.md
