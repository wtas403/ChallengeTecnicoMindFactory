# ESCALABILIDAD_FRONT.md

## Objetivo

La solución actual resuelve un caso de negocio concreto: listar, crear, editar y eliminar automotores, validando reglas importantes como dominio, CUIT, fecha de fabricación y la eventual creación de un sujeto cuando el CUIT no existe. Sin embargo, el valor real de una arquitectura frontend no se mide solamente por resolver el caso actual, sino por su capacidad de acompañar el crecimiento del producto sin perder consistencia, sin degradar la experiencia de usuario y sin volver costoso cada nuevo cambio.

Si esta aplicación evolucionara hasta incluir 20 formularios similares, el desafío principal no sería técnico en el sentido de “hacer más pantallas”, sino organizacional y de diseño de software: lograr que los nuevos formularios compartan patrones, que la validación no se reescriba una y otra vez, que los errores se manejen de forma uniforme, que la experiencia visual sea coherente y que el equipo pueda incorporar funcionalidades nuevas sin que cada feature se convierta en un caso especial.

La estrategia de escalabilidad propuesta busca justamente eso: construir una base que permita crecer de manera ordenada, reutilizando lo que realmente aporta valor y evitando tanto la duplicación como la sobreingeniería.

---

## Estrategia para escalar a 20 formularios similares

Si el sistema creciera hasta tener 20 formularios de negocio parecidos, no sería conveniente pensar cada uno como una implementación aislada. Aunque los formularios puedan tener diferencias en sus campos o en ciertas reglas puntuales, probablemente compartirían una gran cantidad de comportamientos: carga inicial de datos, validaciones, manejo de submit, estados de loading, renderizado de errores, feedback al usuario, bloqueo por cambios sin guardar, integración con endpoints REST y adaptación entre datos de formulario, modelos de dominio y DTOs.

Por eso, la estrategia de escalado no debería basarse en copiar un formulario existente y modificarlo, sino en consolidar un patrón técnico común. Ese patrón debería definir cómo se construyen los formularios, dónde vive la lógica de validación, cómo se transforma la información antes de enviarla al backend, cómo se interpreta la respuesta del servidor y cómo se presenta cada estado en pantalla.

En términos de arquitectura, mantendría una organización por features. Cada dominio de negocio tendría su propio espacio, con sus componentes, páginas, servicios y adaptadores, pero apoyándose sobre una base compartida. Esa base compartida no tendría lógica de negocio particular, sino herramientas comunes: componentes UI, validadores reutilizables, helpers de formularios, utilidades de error, mecanismos de observabilidad y contratos internos consistentes.

La clave para escalar no está en hacer una arquitectura demasiado abstracta desde el comienzo, sino en identificar qué patrones se repiten y consolidarlos progresivamente. En un escenario de 20 formularios, lo importante es que agregar uno nuevo implique ensamblar piezas conocidas, no volver a decidir de cero cómo se valida, cómo se muestra un error o cómo se integra un submit.

También sería importante mantener una separación clara entre presentación y orquestación. Los componentes visuales deberían concentrarse en mostrar datos, exponer eventos y reflejar estados de la interfaz. La lógica de negocio, la coordinación con servicios, la interpretación de errores HTTP y la preparación de datos para el backend deberían vivir fuera de esos componentes. De esa forma, el crecimiento del sistema no ensucia la UI y cada pantalla sigue siendo comprensible incluso cuando la lógica del flujo se vuelve más rica.

Escalar este frontend, entonces, no significa solamente soportar más formularios. Significa definir una manera estable de construir formularios, de integrarlos y de mantenerlos.

---

## Diseño de componentes reutilizables y librería interna UI

A medida que un frontend crece, uno de los mayores riesgos es la fragmentación visual y técnica. Diferentes formularios empiezan a resolver los mismos problemas con implementaciones levemente distintas: un campo muestra el error debajo, otro lo hace arriba; un botón tiene un estado loading, otro no; un diálogo se comporta distinto al resto; un listado maneja estados vacíos de una forma, otro de otra. Esa variación no sólo afecta la experiencia del usuario, también vuelve más costoso mantener y evolucionar el producto.

Para evitarlo, propondría construir una librería interna UI pequeña pero sólida. No la pensaría como un framework paralelo ni como una capa excesivamente abstracta, sino como un conjunto de componentes compartidos que representen decisiones visuales y funcionales ya acordadas por el producto. Su objetivo sería encapsular consistencia, accesibilidad y estilo, no esconder la lógica del negocio.

En una primera etapa, esta librería debería cubrir principalmente los componentes con mayor repetición: botones, headers de página, tarjetas, contenedores visuales, mensajes de estado, skeletons de carga, tablas, paginación, cajas de búsqueda, diálogos de confirmación y componentes de formulario. En particular, los campos de formulario merecen especial atención, porque suelen concentrar duplicación de label, hint, estados inválidos, mensajes de error, focus visible y atributos de accesibilidad. Si cada pantalla implementa eso por separado, el costo acumulado crece muy rápido.

Por eso, convendría definir componentes reutilizables de campos que no intenten “resolver todo”, pero sí establezcan una convención estable. Por ejemplo, un campo de texto debería resolver de forma homogénea cómo se muestra la etiqueta, cómo se asocia el error al input, cómo se presenta el hint y cómo se reflejan los estados de validación. La ventaja de esta aproximación es que la accesibilidad y la consistencia visual dejan de depender del cuidado manual en cada pantalla.

Además, esta librería debería evolucionar con criterio. No conviene abstraer demasiado temprano. Hay un punto en el que una abstracción deja de ahorrar trabajo y empieza a ocultar comportamiento. Por eso, la librería interna debería crecer a partir de patrones ya probados dentro del proyecto. Si un mismo diseño o comportamiento aparece dos o tres veces, ahí ya hay evidencia suficiente para consolidarlo. Antes de eso, es preferible mantener la solución local y observar si realmente vale la pena generalizarla.

En un escenario de crecimiento mayor, esta librería podría complementarse con un catálogo visual como Storybook. No porque el desafío lo exija obligatoriamente, sino porque documentar componentes, estados y variantes se vuelve muy valioso cuando varias personas trabajan sobre una base compartida. Storybook ayudaría a revisar estados de error, loading, vacío y variaciones visuales sin depender de navegar toda la aplicación, además de servir como soporte para pruebas visuales y revisión de accesibilidad.

La librería interna UI, en definitiva, sería una herramienta para sostener calidad y velocidad al mismo tiempo. Cada nuevo formulario debería sentirse parte del mismo producto y, a nivel técnico, debería apoyarse en piezas ya confiables.

---

## Convenciones de formularios, validadores y manejo de errores

En un frontend con muchos formularios, la consistencia no puede quedar librada al estilo personal de cada implementación. Si no se establecen convenciones, el proyecto empieza a fragmentarse rápidamente: distintos nombres para los controles, diferentes criterios para disparar errores, validaciones dispersas, mensajes heterogéneos y flujos de submit poco previsibles.

Por eso, una parte central de la escalabilidad consiste en definir cómo se construye un formulario y qué responsabilidades lo rodean. Cada formulario debería tener una estructura clara: una definición de sus campos, un builder o fábrica que centralice su creación, un conjunto de validadores asociados, una capa de mapeo entre formulario y payload, y una lógica uniforme para tratar respuestas exitosas y errores del backend. La intención no es burocratizar el desarrollo, sino evitar que cada pantalla invente su propia solución.

En cuanto a las validaciones, haría una distinción entre validadores compartidos y validadores específicos de cada feature. Reglas como CUIT, dominio o fecha de fabricación en formato YYYYMM son reglas candidatas a vivir en una capa compartida, porque son independientes de una pantalla puntual y representan conocimiento reutilizable del dominio. En cambio, validaciones más contextuales o flujos particulares deberían quedar dentro de la feature correspondiente.

Esta separación es importante porque evita dos problemas opuestos: por un lado, duplicar lógica en distintas pantallas; por otro, convertir una carpeta global de validadores en un lugar caótico donde se mezclan reglas comunes con reglas demasiado específicas. La escalabilidad requiere reutilización, pero también requiere límites claros.

Otro punto clave es la forma en que se muestran los errores. En un sistema con muchos formularios, no conviene hardcodear mensajes directamente en cada componente. Lo ideal es trabajar con una convención de errores conocida: cada validador produce una clave reconocible y existe una estrategia uniforme para traducir esa clave en un mensaje legible para el usuario. Esto simplifica la consistencia de UX, reduce duplicación y deja una base mucho más preparada para i18n. También evita que una misma regla termine expresada con mensajes levemente distintos en distintas pantallas.

El manejo de errores del backend merece un tratamiento aún más cuidadoso. Si cada componente interpreta directamente los `HttpErrorResponse`, el sistema se vuelve frágil y poco mantenible. La UI no debería depender de detalles de bajo nivel del transporte HTTP. Lo correcto sería normalizar esos errores en una capa intermedia, transformándolos en un modelo de error más cercano a la aplicación. De esa manera, el componente no piensa en códigos crudos o estructuras arbitrarias, sino en categorías conocidas: error de red, error inesperado, recurso inexistente, conflicto, validación de negocio o fallo de servidor.

El caso de `422 Unprocessable Entity` es especialmente importante en este desafío. Si el backend devuelve validaciones de negocio, el frontend debería poder representarlas con precisión, idealmente distinguiendo entre errores globales del formulario y errores específicos de campos concretos. Eso permite mostrar mensajes útiles junto al control correcto, mejorar la experiencia del usuario y evitar el típico mensaje genérico de “ocurrió un error” que no ayuda a resolver nada.

También definiría una convención de submit compartida entre formularios. El usuario debería encontrarse siempre con el mismo comportamiento: validación previa en cliente, bloqueo de doble envío, indicador de carga mientras se procesa la operación, feedback claro al finalizar y aplicación consistente de errores de backend. Esta uniformidad mejora la experiencia, pero además reduce muchísimo la complejidad técnica, porque las piezas necesarias para cada submit se vuelven predecibles y reutilizables.

Escalar formularios, entonces, no consiste sólo en poder renderizar muchos campos, sino en establecer un lenguaje técnico común para construirlos, validarlos y recuperarse de los errores.

---

## Estrategia de observabilidad frontend

Si este frontend fuera a crecer de verdad, la observabilidad no debería verse como un agregado opcional, sino como una capacidad fundamental de la aplicación. En desarrollo, muchas veces alcanza con abrir la consola, revisar una petición fallida o reproducir el flujo manualmente. Pero cuando una solución empieza a usarse en contextos reales, aparecen problemas que no siempre se pueden inferir solamente leyendo código: lentitud en ciertas rutas, interacciones que se sienten pesadas, errores de JavaScript que ocurren sólo bajo determinadas condiciones, problemas esporádicos en navegadores concretos o degradaciones de UX luego de una release.

Por eso, propondría una estrategia de observabilidad frontend orientada a responder tres preguntas. La primera es si la experiencia está siendo rápida y estable para el usuario. La segunda es si están ocurriendo errores del lado cliente y con qué impacto. La tercera es si los flujos de negocio más importantes se completan correctamente o se rompen en algún punto intermedio.

En relación con performance real, usaría métricas Web Vitals como base de observabilidad. En particular, LCP, INP y CLS permiten tener una señal bastante clara sobre la experiencia de carga, respuesta a la interacción y estabilidad visual. Estas métricas son más valiosas que medir sólo tiempos técnicos locales, porque reflejan mejor lo que el usuario percibe. La idea no sería simplemente “medir por medir”, sino registrar estas métricas por ruta o por feature para poder detectar regresiones cuando el sistema crezca o cuando se incorporen nuevas dependencias visuales.

Por otro lado, instrumentaría el frontend para capturar errores de JavaScript no manejados, promesas rechazadas sin tratamiento y fallos inesperados en runtime. Un error aislado en consola puede parecer menor durante el desarrollo, pero si ocurre en producción sobre una acción crítica —por ejemplo, guardar un formulario o abrir una edición— se transforma en un problema real de negocio. Registrar esos errores con contexto mínimo, como ruta, navegador, feature involucrada y timestamp, permite no sólo detectarlos, sino también priorizarlos.

Además de los errores puramente técnicos, me interesa especialmente la trazabilidad de eventos de negocio. En una aplicación como esta, hay ciertos flujos cuya salud conviene monitorear explícitamente: apertura del formulario, búsqueda, creación de automotor, edición, baja, intento de creación con CUIT inexistente, apertura del flujo inline para crear sujeto, submit con error 422 y submit exitoso. Estas trazas no tienen por qué ser invasivas ni excesivas, pero sí ayudan a entender dónde hay fricción real. Por ejemplo, si un alto porcentaje de formularios termina en error 422 por un mismo campo, no sólo hay una señal técnica: también puede haber un problema de UX, de copy o de diseño del flujo.

La observabilidad también debería incluir cierta correlación con el backend. Si la aplicación pudiera asociar errores o requests a un identificador compartido, sería mucho más fácil reconstruir incidentes entre frontend y API. En una etapa inicial esto puede ser simple, pero a mediano plazo aporta mucho valor, especialmente cuando el producto empieza a tener más rutas, más features y más integraciones.

No implementaría toda esta estrategia de una sola vez. La plantearía como una evolución progresiva. Primero capturaría Web Vitals, errores globales y fallos relevantes de HTTP. Luego avanzaría hacia eventos de negocio y dashboards más claros. Más adelante, ya con mayor madurez, incorporaría alertas, comparativas por release y análisis por feature flag. Lo importante es que la base quede preparada desde temprano para que crecer en observabilidad no implique rehacer la aplicación.

---

## Plan de evolución: i18n, feature flags, design tokens y CI quality gates

Una arquitectura escalable no sólo resuelve bien el presente, también deja margen para incorporar capacidades futuras sin que el costo de cambio se dispare. En este sentido, hay varias líneas de evolución que no necesariamente son prioritarias para la primera versión, pero sí conviene contemplar desde el diseño.

Una de ellas es la internacionalización. Aunque este desafío no exige soporte multilenguaje, la manera en que se escriben textos en la aplicación puede facilitar o dificultar mucho una futura adopción de i18n. Si labels, mensajes de error, textos de acciones y mensajes de sistema quedan hardcodeados de forma desordenada dentro de los componentes, luego migrarlos a un esquema internacionalizable será costoso. En cambio, si desde temprano se centralizan textos importantes y se desacoplan de la lógica visual, la base queda mucho más preparada. No hace falta implementar i18n completo desde el día uno, pero sí evitar decisiones que lo encarezcan innecesariamente.

Otra línea de evolución importante son los feature flags. En productos que crecen, no siempre conviene desplegar una funcionalidad nueva para todos los usuarios al mismo tiempo. A veces es útil activar progresivamente una nueva tabla, una versión renovada de un formulario, un comportamiento experimental o una estrategia diferente de búsqueda. Los feature flags permiten hacer eso con menor riesgo. Sin embargo, tampoco conviene introducir una plataforma compleja demasiado temprano. Empezaría con una solución simple, tipada y bien delimitada, enfocada en casos concretos, y cuidaría especialmente la limpieza posterior. Un sistema lleno de flags permanentes y olvidados también se vuelve una deuda.

Los design tokens representan otra inversión importante para la escalabilidad. Cuando una interfaz empieza a crecer, trabajar con colores, tamaños y espaciados definidos de manera dispersa genera inconsistencias visuales y hace muy costoso cualquier ajuste posterior. Tener tokens para colores semánticos, tipografía, spacing, radios, sombras y breakpoints permite consolidar la identidad visual del producto y facilita tanto el mantenimiento como futuras evoluciones, incluyendo theming o mejoras de accesibilidad. Además, los design tokens se integran naturalmente con una librería interna UI, porque le dan una base estable sobre la cual construir componentes reutilizables.

Finalmente, un frontend que crece no puede depender exclusivamente de revisión manual para sostener calidad. Por eso, el pipeline de integración continua debería evolucionar hacia quality gates cada vez más útiles. En una primera etapa, al menos debería ejecutar lint, typecheck, tests y build de producción. Eso ya establece una barrera básica contra regresiones evidentes. A partir de ahí, incorporaría progresivamente cobertura mínima sobre piezas críticas, chequeos de accesibilidad, control de tamaño de bundle y, si el proyecto ganara madurez visual, pruebas de regresión o validación de componentes en Storybook.

La idea no es endurecer el pipeline por gusto, sino garantizar que el crecimiento del sistema no degrade silenciosamente la mantenibilidad, la performance o la experiencia. Cada quality gate debería tener una razón clara: detectar errores antes de mergear, sostener estándares compartidos y dar confianza al equipo para iterar más rápido.
