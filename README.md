# Fotograma

Una foto, una palabra. Juego breve de cinco intentos. Proyecto aparte de Leydle, bajo la identidad de lucasramos.uy. **Piloto: un acertijo curado.** No promete aún un puzzle distinto todos los días.

## Estado

El PR deja el juego listo para revisar, no lo publica. Falta que Lucas incorpore la `UNSPLASH_ACCESS_KEY` en un secreto del Worker `fotograma` y que se conecte la ruta `/fotograma/*` del proxy del dominio al Worker. No poner la clave en este repositorio ni en el frontend. Sin clave, la UI explica por qué no puede cargar. No hay costes previstos en el volumen de este piloto, sujeto a límites de los planes gratuitos de Cloudflare y Unsplash.

## Desarrollo

```bash
pnpm install
pnpm prepare
pnpm dev
```

Usar un secreto local de Wrangler, no versionado, para probar la foto. El Worker consulta `GET /photos/:id` con `Client-ID`; la web usa `photo.urls.regular` directamente y enlaza tanto al fotógrafo como a Unsplash. Las fuentes del kit se copian desde paquetes @fontsource versionados al build y se sirven localmente, sin CDN externo en tiempo de ejecución. Cachea metadata una hora por instancia, con caché HTTP una hora. No descarga ni sirve copias de imágenes. En modo demo, Unsplash limita la API a 50 solicitudes/hora por aplicación, así que se debe vigilar el consumo real antes de hacer pública la ruta. El guardado de intentos y pista es local a cada dispositivo. No hay cuentas ni leaderboard.

```bash
pnpm exec wrangler secret put UNSPLASH_ACCESS_KEY
pnpm deploy
```

Para conectar `https://lucasramos.uy/fotograma/` hay que actualizar el Worker proxy del dominio en una tarea de despliegue separada, después de merge y revisión. La ruta en `wrangler.toml` queda en `workers.dev` para una prueba inicial; no modificar DNS ni desplazar rutas existentes sin read-back.

Fuentes: https://unsplash.com/documentation · Reglas visuales: https://github.com/lucasramosuy/brand/blob/main/BRAND.md
