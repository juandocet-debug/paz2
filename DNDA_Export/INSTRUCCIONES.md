# Herramientas de Exportación DNDA

He preparado todo en esta carpeta para que puedas generar fácilmente la evidencia requerida.

## 1. Documentos Generados
En las carpetas correspondientes encontrarás:
- `/descripcion_obra/Descripcion_Software.md`: Contiene la descripción técnica, arquitectura y stack.
- `/manual/Manual_Usuario.md`: Contiene el instructivo paso a paso.

*(Puedes abrir estos archivos con cualquier editor de texto o en VSCode y exportarlos a PDF usando alguna extensión como "Markdown PDF").*

## 2. Automatización de Capturas
Como me pediste, he creado un script que abrirá un navegador de forma automatizada e irá tomando capturas de cada sección.

### Pasos para usarlo:
1. Asegúrate de que el frontend de tu aplicación (`npm run dev`) y el backend estén encendidos y funcionando.
2. Abre la terminal en esta carpeta (`DNDA_Export`).
3. Instala la dependencia necesaria ejecutando:
   ```bash
   npm install
   ```
4. Abre el archivo `tomar_capturas.js` y asegúrate de que `FRONTEND_URL`, `USUARIO_TEST` y `PASSWORD_TEST` sean correctos para tu entorno local.
5. Ejecuta el script:
   ```bash
   npm run capturas
   ```

Una vez terminado, verás todas las imágenes guardadas en la carpeta `/screenshots`. Luego, puedes insertar esas imágenes en tu documento del Manual de Usuario y exportarlo.
