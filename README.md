# Fotograma

Una foto, una palabra. Juego breve de cinco intentos. Proyecto aparte de Leydle, bajo la identidad de lucasramos.uy. **Piloto: un acertijo curado.** No promete aún un puzzle distinto todos los días.

## Estado

El juego se publica al ejecutar manualmente el workflow **Desplegar Fotograma** desde la pestaña Actions, después de revisar y mergear el PR. Las dos credenciales (`CLOUDFLARE_API_TOKEN` y `UNSPLASH_ACCESS_KEY`) deben estar en GitHub Actions > Repository secrets. La primera tiene únicamente Workers Scripts (Read/Write) para Lucas Space y Workers Routes (Read/Write) en lucasramos.uy. Nunca ponerlas en el repositorio ni en el frontend. La key de Unsplash se carga como secreto del Worker en el mismo despliegue, sin una versión pública intermedia sin key. Sin clave, la UI explica por qué no puede cargar. No hay costes previstos en el volumen de este piloto, sujeto a límites de los planes gratuitos de Cloudflare y Unsplash.

## Desarrollo

```bash
pnpm install
pnpm prepare
pnpm dev
```

Usar un secreto local de Wrangler, no versionado, para probar la foto. El Worker consulta `GET /photos/:id` con `Client-ID`; la web usa `photo.urls.regular` directamente y enlaza tanto al fotógrafo como a Unsplash. Las fuentes del kit se copian desde paquetes @fontsource versionados al build y se sirven localmente, sin CDN externo en tiempo de ejecución. Cachea metadata una hora por instancia, con caché HTTP una hora. No descarga ni sirve copias de imágenes. En modo demo, Unsplash limita la API a 50 solicitudes/hora por aplicación, así que se debe vigilar el consumo real antes de hacer pública la ruta. El guardado de intentos y pista es local a cada dispositivo. No hay cuentas ni leaderboard.

Despliegue manual: Actions > **Desplegar Fotograma** > **Run workflow** en `main`. El workflow instala pnpm, ejecuta `check` y `prepare`, y despliega Worker, assets y secreto en un solo comando. La configuración incluye `lucasramos.uy/fotograma` y `lucasramos.uy/fotograma/*`. Ambas son más específicas que `lucasramos.uy/*` del Worker proxy, de modo que Fotograma se sirve directamente sin modificar el código de `normativa` ni las rutas existentes. También queda `workers.dev` para diagnóstico. Futuros cambios de código requieren ejecutar el workflow de nuevo; no hay auto-deploy por merge.

Fuentes: https://unsplash.com/documentation · Reglas visuales: https://github.com/lucasramosuy/brand/blob/main/BRAND.md
