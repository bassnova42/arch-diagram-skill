<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README.en.md">English</a> · <b>Español</b> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.th.md">ไทย</a>
</p>

# RokoAI arch-diagram · Skill de diagramas de arquitectura

Funciona con **Claude Code** y **Codex**.

Dale un repositorio de GitHub, un artículo técnico, un PDF o un proyecto local. Claude Code o Codex entiende la estructura y dibuja un diagrama de arquitectura: por defecto oscuro, estilo "plano de terminal", o en cualquiera de otros siete estilos (ver [Estilos](#estilos)). Por los cables circulan paquetes animados, y el log inferior añade una línea en tiempo real cada vez que dos módulos intercambian datos.

**Abajo: la arquitectura del proyecto de código abierto [morluto/rea](https://github.com/morluto/rea), generada por esta skill a partir de su repositorio de GitHub:**

![arquitectura de morluto/rea](examples/rea.gif)

Más ejemplos (un artículo, un repositorio de GitHub, un documento de requisitos) en [Ejemplos](#ejemplos), al final.

## Qué hace

- **Estructura según el contenido**: sistema por capas, pipeline, proceso con bucles, hub y radios, carriles o jerarquía. Sin plantilla fija.
- **Colores con significado**: las cajas se colorean por tipo; los cables se distinguen por color y trazo según el tipo de flujo (petición, escritura, respuesta, asíncrono…); los marcos de grupo indican contención.
- **Log de trazas en vivo**: cuando un paquete llega al final de un cable, se añade abajo una línea `tiempo · tipo · A → B · detalle`.
- **Autocomprobación**: Chrome sin interfaz detecta cajas superpuestas, texto desbordado, cables que atraviesan cajas y etiquetas tapadas, y Claude lo corrige hasta que el diseño queda limpio.
- **Ocho estilos**: Terminal nocturna, Plano azul, Papel de dibujo, Pizarra a mano, Brutal atrevido, CRT fósforo, Tarjetas suaves y Maqueta isométrica, con una sola frase.
- **Muchos formatos de salida**:
  - HTML interactivo en un solo archivo
  - PNG (resolución 2×)
  - MP4: 20 segundos por defecto, la duración que pidas, bucle perfecto de 4 segundos
  - GIF: un ciclo
  - Diagrama de flujo Mermaid

## El diagrama habla el idioma de tu prompt

El diagrama se escribe en el idioma en que lo pides:

- Si escribes el prompt en **español**, todo el diagrama sale en español
- En **inglés**, sale en inglés
- En **chino**, títulos, descripciones, etiquetas y log salen en chino
- En **japonés**, todo el contenido sale en japonés

Esto se cumple aunque el artículo o el código original estén en otro idioma. Los identificadores, rutas y comandos se mantienen tal cual. Los textos de interfaz, como leyendas y etiquetas de estado, vienen incluidos en chino, inglés, japonés, coreano, español y tailandés; para otros idiomas, Claude los escribe en el tuyo.

## Instalación

Requiere Node ≥ 18 y Chrome, Chromium o Edge. Para vídeo y GIF también hace falta `ffmpeg` (`brew install ffmpeg`).

**Opción 1: npm** (la más sencilla)

```bash
npx @rokoai/arch-diagram install
```

Se instala en `~/.claude/skills/arch-diagram`. Con `--project` se instala en `.claude/skills/` del proyecto actual. Vuelve a ejecutarlo para actualizar; para desinstalar, `npx @rokoai/arch-diagram uninstall`.

Si tienes Codex instalado (existe `~/.codex`), también se instala en `~/.codex/skills/arch-diagram`. Añade `--claude` o `--codex` para instalarlo solo en uno de ellos.

> Si ejecutas `npx @rokoai/arch-diagram …` dentro de un clon de este repositorio, falla con `arch-diagram: command not found`: npm toma el directorio actual como el propio paquete y no añade su comando al PATH. Ejecútalo desde otro directorio o, dentro del clon, usa `node bin/cli.mjs install` (mismas opciones, p. ej. `--codex`).

**Opción 2: plugin**. En Claude Code, ejecuta:

```
/plugin marketplace add bassnova42/arch-diagram-skill
/plugin install arch-diagram@arch-diagram
```

En Codex CLI:

```bash
codex plugin marketplace add bassnova42/arch-diagram-skill
codex plugin add arch-diagram@arch-diagram
```

**Opción 3: copia manual**

```bash
git clone https://github.com/bassnova42/arch-diagram-skill
cp -R arch-diagram-skill/skills/arch-diagram ~/.claude/skills/
cp -R arch-diagram-skill/skills/arch-diagram ~/.codex/skills/   # Codex
```

Reinicia Claude Code o Codex después de instalar.

## Uso

Pídelo directamente en Claude Code o Codex, por ejemplo:

- `Dibuja la arquitectura de https://github.com/plausible/analytics`
- `Convierte este artículo en un diagrama de flujo: <URL>, exporta un vídeo de 30 segundos`
- `Exporta ese diagrama como imagen` / `como mermaid`
- Para llamar a la skill de forma explícita: `/arch-diagram <URL>` en Claude Code, `$arch-diagram <URL>` en Codex

El origen de cada diagrama es `<slug>.spec.json`. Para cambiarlo, pide a Claude Code o Codex que edite el spec y lo regenere. También puedes usar la línea de comandos:

```bash
npx @rokoai/arch-diagram build  my.spec.json my.html
npx @rokoai/arch-diagram check  my.html
npx @rokoai/arch-diagram export my.html my.png my.mp4 --seconds 30
```

## Estilos

El estilo por defecto es **Terminal nocturna** (`terminal`), y hay siete más. Basta con nombrar el estilo en tu petición, por ejemplo `dibújalo como un plano azul`, `usa el estilo pizarra`, `hazlo isométrico`; si no indicas ninguno, se usa el de por defecto.

- **Solo cambia el aspecto**: el mismo spec se dibuja en todos los estilos. Cambiar de estilo no toca la estructura, los textos ni las coordenadas, y la autocomprobación es la misma. Un diagrama existente se redibuja con una frase: "pásalo a Tarjetas suaves".
- **Los colores conservan su significado**: cada estilo tiene su paleta, pero azul, cian, verde, ámbar y morado siguen marcando los mismos tipos de elemento, así que la leyenda se lee igual.
- **Todas las salidas funcionan**: HTML, PNG, MP4 y GIF se exportan en cualquier estilo (Mermaid se maqueta solo y no tiene estilo).

El mismo diagrama (el ejemplo Elephant-Goldfish) en los ocho estilos:

| | |
|---|---|
| <img src="themes/terminal.jpg" width="420"><br>**Terminal nocturna (por defecto)** · `terminal` | <img src="themes/blueprint.jpg" width="420"><br>**Plano azul** · `blueprint` |
| <img src="themes/drafting.jpg" width="420"><br>**Papel de dibujo** · `drafting` | <img src="themes/whiteboard.jpg" width="420"><br>**Pizarra a mano** · `whiteboard` |
| <img src="themes/brutalism.jpg" width="420"><br>**Brutal atrevido** · `brutalism` | <img src="themes/crt.jpg" width="420"><br>**CRT fósforo** · `crt` |
| <img src="themes/saas.jpg" width="420"><br>**Tarjetas suaves** · `saas` | <img src="themes/isometric.jpg" width="420"><br>**Maqueta isométrica** · `isometric` |

En la línea de comandos usa `--theme`, o pon `"theme": "blueprint"` en el spec:

```bash
npx @rokoai/arch-diagram build my.spec.json my.html --theme whiteboard
```

Los siete estilos nuevos en detalle. Cada ejemplo es el diagrama de [morluto/rea](https://github.com/morluto/rea), el mismo spec que el del principio de esta página.

### Plano azul · `blueprint`

![Plano azul](themes/blueprint.gif)

- **Aspecto**: Tinta blanca sobre azul de plano, con una cuadrícula de 20px / 100px y un marco doble. Cruces de registro en las esquinas de cada caja, etiquetas en cursiva y guiones largos para los cables asíncronos. La paleta pasa a tonos claros para seguir distinguiéndose sobre el azul.
- **Ideal para**: Revisiones de diseño, propuestas técnicas, cualquier cosa que deba parecer un plano de ingeniería.
- **Cómo pedirlo**: `dibújalo como un plano azul` · `estilo blueprint`

[▶ Vídeo de 20 segundos (MP4)](themes/blueprint.mp4)

### Papel de dibujo · `drafting`

![Papel de dibujo](themes/drafting.gif)

- **Aspecto**: Tinta sobre papel de dibujo envejecido con textura, letra con serifa y marco doble. Cada componente lleva un globo numerado en su esquina superior izquierda para explicarlo punto por punto; los cables empiezan con un punto y los asíncronos son de trazo y punto.
- **Ideal para**: Impresión, PDF, manuales y figuras de artículos, o explicaciones por número.
- **Cómo pedirlo**: `estilo dibujo técnico` · `como un manual técnico`

[▶ Vídeo de 20 segundos (MP4)](themes/drafting.mp4)

### Pizarra a mano · `whiteboard`

![Pizarra a mano](themes/whiteboard.gif)

- **Aspecto**: Rotulador sobre pizarra blanca: contornos algo temblorosos, rellenos de color rayados, puntas de flecha abiertas y un subrayado de marcador bajo el título. El temblor usa una semilla fija, así que cada render es idéntico y los vídeos siguen en bucle sin cortes.
- **Ideal para**: Lluvias de ideas, discusiones iniciales de diseño, explicaciones para quien no es ingeniero, ilustraciones de blog.
- **Cómo pedirlo**: `dibujado a mano` · `estilo pizarra` · `como un boceto`
- **Nota**: Se ve más manuscrito con una fuente de escritura a mano instalada (Chalkboard SE, Segoe Print…); sin ella el texto usa la fuente del sistema y los trazos siguen siendo a mano.

[▶ Vídeo de 20 segundos (MP4)](themes/whiteboard.mp4)

### Brutal atrevido · `brutalism`

![Brutal atrevido](themes/brutalism.gif)

- **Aspecto**: Fondo crema, contornos negros de 2px con sombras duras de 6px, rellenos planos y vivos en el color de cada elemento, letra muy gruesa. Cables gruesos, etiquetas en placas blancas con borde negro y el título sobre un bloque negro.
- **Ideal para**: Imagen principal del README, redes sociales, diapositivas y pósteres: donde haya que captar la atención a la primera.
- **Cómo pedirlo**: `estilo brutalista` · `que destaque` · `aspecto de póster`

[▶ Vídeo de 20 segundos (MP4)](themes/brutalism.mp4)

### CRT fósforo · `crt`

![CRT fósforo](themes/crt.gif)

- **Aspecto**: Un tubo negro verdoso: texto y cables con brillo de fósforo, cajas con doble línea, líneas de barrido y viñeta sobre la página, y un prompt `>` delante del título.
- **Ideal para**: Temas de seguridad, ingeniería inversa e infraestructura, charlas retro, miniaturas de vídeo.
- **Cómo pedirlo**: `terminal retro` · `estilo CRT` · `verde fósforo`

[▶ Vídeo de 20 segundos (MP4)](themes/crt.mp4)

### Tarjetas suaves · `saas`

![Tarjetas suaves](themes/saas.gif)

- **Aspecto**: Fondo claro con rejilla de puntos y tarjetas blancas con esquinas redondeadas, una fina franja de color arriba y sombras suaves. Esquinas de cable redondeadas, etiquetas en forma de píldora y cables asíncronos punteados.
- **Ideal para**: Documentación de producto, webs, presentaciones externas y sitios de documentación claros (Notion, Confluence…).
- **Cómo pedirlo**: `estilo claro y limpio` · `estilo documentación de producto` · `estilo SaaS`

[▶ Vídeo de 20 segundos (MP4)](themes/saas.mp4)

### Maqueta isométrica · `isometric`

![Maqueta isométrica](themes/isometric.gif)

- **Aspecto**: El diagrama ya maquetado y comprobado se tumba sobre una rejilla isométrica, y cada caja se vuelve un bloque con volumen y sombra. Cabecera, leyenda y log se quedan rectos. El lienzo se ensancha (unas 1,5 veces) en vez de encoger el texto.
- **Ideal para**: Portadas, imágenes promocionales, vistas generales de sistemas con pocos componentes.
- **Cómo pedirlo**: `estilo 3D` · `isométrico` · `en 3D`
- **Nota**: El texto se inclina con el suelo, así que funciona mejor con unos 12 nodos como máximo; para diagramas densos elige otro estilo.

[▶ Vídeo de 20 segundos (MP4)](themes/isometric.mp4)

## Estructura

```
skills/arch-diagram/
  SKILL.md            flujo: leer la fuente → elegir estructura → maquetar → autocomprobar → exportar
  assets/             motor de renderizado, estilos, plantilla; themes/ tiene una hoja de estilos por estilo
  scripts/            build / check / export
  references/         campos del spec, estilo visual
  examples/           rea (repositorio), plausible (repositorio), elephant-goldfish (artículo)
bin/cli.mjs           comandos npm: install / uninstall / build / check / export
```

## Ejemplos

### 1. Arquitectura de un artículo

Fuente: artículo de Dave Rensin «Elephants, Goldfish, and the New Golden Age of Software Engineering»  
<https://drensin.medium.com/elephants-goldfish-and-the-new-golden-age-of-software-engineering-c33641a48874>

![Arquitectura de un artículo](examples/elephant-goldfish.gif)

[▶ Vídeo completo (MP4, 30 s)](examples/elephant-goldfish.mp4)

### 2. Arquitectura de un repositorio de GitHub

Fuente: <https://github.com/morluto/rea>

![Arquitectura de un repositorio de GitHub](examples/rea.gif)

[▶ Vídeo completo (MP4, 20 s)](examples/rea.mp4)

### 3. Arquitectura de un documento de requisitos

Fuente: el documento de requisitos (PRD) y el código de Ballet, una miniapp que puntúa movimientos de ballet. Proyecto privado, sin enlace público.

![Arquitectura de un documento de requisitos](examples/ballet.gif)

[▶ Vídeo completo (MP4, 20 s)](examples/ballet.mp4)

## Licencia

MIT
