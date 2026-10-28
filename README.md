# AsistenciasItabo

Control de asistencia en HTML + CSS + JS puro (PWA, funciona offline, datos en el dispositivo).

## Cuentas de prueba (clave `1234`)
| Usuario | Rol | Puede |
|---|---|---|
| gerente | Gerente | Todo: informes con filtros/CSV/PDF, equipo, horarios, ajustes |
| cajero | Cajero | Marcar entrada/salida, ver su historial |
| asistente | Asistente | Lo anterior + informe del día (solo lectura) |

## Probar en local
`cd www && python3 -m http.server 8080` y abrir http://localhost:8080

## Hosting gratis (GitHub Pages)
1. Crear repo en GitHub y subir todo este proyecto (rama `main`).
2. Settings → Pages → Source: **GitHub Actions**.
3. El workflow `pages.yml` publica `www/` en `https://TU_USUARIO.github.io/NOMBRE_REPO/`.
   (Alternativas: arrastrar la carpeta `www` a https://app.netlify.com/drop o a Cloudflare Pages.)

## APK
**Opción A (recomendada, sin instalar nada):** en GitHub → Actions → "Generar APK" → Run workflow →
al terminar, descargar el artefacto `AsistenciasItabo-apk` (contiene `app-debug.apk`) y enviarlo al profe.
**Opción B:** con la web ya publicada, entrar a https://www.pwabuilder.com, pegar la URL y elegir Android.
**Opción C (local):** requiere Node 18+, JDK 17 y Android Studio:
`npm install && npx cap add android && npx cap sync android && cd android && ./gradlew assembleDebug`
(el APK queda en `android/app/build/outputs/apk/debug/`). Añadir en AndroidManifest los permisos
CAMERA y ACCESS_FINE_LOCATION (el workflow ya lo hace).

Para instalar el APK, el profe debe permitir "Instalar apps de orígenes desconocidos".
