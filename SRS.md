# SRS — Fotograma

## Alcance del piloto
- El jugador ve una fotografía hotlinkeada desde `photo.urls` de la API de Unsplash, con fotógrafo y enlaces de atribución.
- Intenta adivinar una palabra de seis letras en cinco turnos. Indicación verde = posición exacta, ocre = letra en otra posición, gris = ausente; las letras repetidas se evalúan según conteos disponibles.
- Teclado táctil y físico, tecla borrar y enter, una pista por partida; estado guardado por acertijo en el dispositivo.
- Primer acertijo curado: NIEBLA. El número y la fecha identifican el piloto; añadir puzzles curados antes de prometer variedad diaria. No inferir palabras de etiquetas ambiguas de la API.
- El Worker guarda la Access Key como secreto, sirve sólo metadata necesaria, cachea una hora y no descarga fotos. Si falta clave o falla Unsplash, mostrar error sin revelar secretos.
- Hosting objetivo: Worker + Static Assets de Cloudflare en `/fotograma/`, usando el proxy de lucasramos.uy cuando se apruebe su despliegue.

## No alcance
- Publicación automática o cambios en el proxy actual, cuentas, estadísticas compartidas, rankings, búsqueda libre, generación de acertijos con IA o costes de servicios pagos.
