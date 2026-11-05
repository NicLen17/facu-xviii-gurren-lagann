# FACU XVIII · 18 años. Cero límites.

Invitación inspirada íntegramente en **Tengen Toppa Gurren-Lagann**, hecha con HTML, CSS y JavaScript. Sin framework, dependencias, instalación ni compilación. La información del evento se verificó contra https://facu-xviii.vercel.app/ el 5 de noviembre de 2026.

## Abrir y editar

Abrí `dist/index.html` directamente, o ejecutá `npm start` para acceder a http://127.0.0.1:4173. El servidor Node es únicamente una comodidad para la vista previa; no forma parte del sitio. Para alojarlo en cualquier hosting estático, subí el contenido de `dist/`.

- `dist/index.html`: textos, enlaces de WhatsApp, ubicación, alias y CBU.
- `dist/styles.css`: diseño, responsive y animaciones.
- `dist/script.js`: fechas (zona horaria de Argentina), cuenta regresiva, energía espiral, partículas, parallax, portapapeles, calendario y audio.
- `dist/assets/`: imagen, emblema SVG y tipografías locales.

El hero tiene parallax con mouse y scroll, partículas en canvas y un botón de poder espiral que dispara anillos progresivos. El audio es un ambiente sintetizado original mediante Web Audio, **no** música del anime. Se activa sólo con el botón de sonido. Los FX se pueden pausar y se respeta `prefers-reduced-motion`. Se pausa el render del canvas fuera del hero y al ocultar la pestaña.

La cuenta termina el 7/11/2026 a las 22:00 (UTC−3), distingue fiesta en curso de evento finalizado y nunca muestra valores negativos. El calendario incluye el final correcto: 8/11/2026 a las 05:00. WhatsApp abre el mensaje para que el visitante lo envíe. Los regalos mantienen alias **Ramos-02** y CBU **4530000800013418441059**. La apariencia de anime no impone disfraz: se mantiene look libre, elegante sport o disfraz.

Mapa y WhatsApp requieren conexión; ilustración, tipografías, cuenta regresiva, calendario, audio y FX usan recursos locales. No hay formularios ni recolección de datos. La página mantiene `noindex, nofollow` por tratarse de una invitación personal.

## Ilustración y prompt

Generada con la herramienta integrada **ImageGen** y guardada en `dist/assets/hero.png`. Los emblemas, taladros y efectos vectoriales son SVG/CSS/canvas creados para este proyecto. Es una invitación fan, sin afiliación oficial.

Prompt de la ilustración:

> Use case: illustration-story. Asset type: dramatic anime key visual for a Tengen Toppa Gurren-Lagann themed eighteenth birthday website. Create a beautiful cinematic widescreen 3:2 digital anime illustration, faithful to the original Gurren Lagann mecha design: huge red and white angular armored Gurren Lagann robot with golden pointed V crest and iconic black sunglasses on its chest, brilliant green glowing eyes. Dynamic three-quarter low-angle view, massive silver conical spiral drill arm thrust diagonally toward the upper right. Heroic, imposing, bold thick black ink outlines and cel shading with detailed mechanical drawing, screenprinted warm paper highlights. Mecha dominates the right two thirds; bottom left is a small Simon silhouette with blue hair and red cape seen from behind facing it. Background is near-black charcoal cosmic sky with dramatic red-orange explosive radial strokes, sparse bright green spiral-energy arcs, flying debris and orange embers. Strong graphic poster composition with striking ivory red orange and green. Keep LEFT THIRD dark and restrained as it will sit under website typography. Edges especially left and bottom fade into solid near-black #10110f so it can blend with a dark page. No text, no lettering, no watermark. Detailed high quality theatrical anime key art. Landscape.

Tipografías: Barlow Condensed, Space Grotesk e IBM Plex Mono, descargadas de Google Fonts y servidas localmente.
