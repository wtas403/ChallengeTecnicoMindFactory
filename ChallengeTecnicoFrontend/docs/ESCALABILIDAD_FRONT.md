# Escalabilidad Frontend

## Escalar a 20 formularios similares

La estrategia recomendada es mantener organizacion por feature, pero extraer patrones repetidos a una capa comun liviana:

- `shared/ui/` para primitivas visuales reutilizables
- `shared/forms/` para helpers de formularios, mensajes de error y adaptadores
- `shared/validation/` para reglas puras reutilizables
- `core/http/` para errores, interceptores y contratos transversales

Cada feature nueva deberia conservar su propia capa `domain`, `application` e `infrastructure` para evitar que la logica de negocio quede centralizada en componentes.

## Componentes reutilizables y libreria UI interna

Conviene construir una libreria interna chica, enfocada en piezas de negocio reales:

- `PageHeader`
- `SectionCard`
- `FormField`
- `FieldError`
- `StatusBanner`
- `ConfirmAction`
- `DataListToolbar`
- `PaginationControls`

La libreria no deberia abstraer todo demasiado pronto. Primero conviene consolidar 2 o 3 features reales y extraer solo patrones estables.

## Convenciones de formularios y validadores

- Validaciones de negocio como funciones puras testeables.
- Adaptadores a Angular Forms solo en la capa de UI.
- Errores de backend normalizados a una estructura unica con mensaje global y `fieldErrors`.
- Componentes de formulario pequenos, con responsabilidades acotadas.
- `Facade` o store local para orquestacion, evitando logica HTTP en componentes.

## Manejo de errores

Para sostener consistencia entre muchas pantallas:

- un interceptor central mapea errores HTTP a `ApiError`
- `422` se representa con mensajes accionables y errores por campo
- errores recuperables se muestran inline
- errores bloqueantes se muestran en banners visibles y accesibles

## Observabilidad frontend

Una evolucion natural para produccion incluye:

- captura de errores JS no controlados
- medicion de Web Vitals
- trazas de requests y latencias por pantalla
- eventos de negocio: alta, edicion, baja, reasignacion de titular
- dashboards por errores `4xx/5xx`, abandono de formulario y tiempos de guardado

## Plan de evolucion

1. Incorporar design tokens formales para tipografia, color, spacing y sombras.
2. Estandarizar componentes UI internos con ejemplos y contratos claros.
3. Agregar `i18n` si el producto necesita multiples regiones.
4. Introducir feature flags para cambios de flujo o releases graduales.
5. Sumar quality gates en CI: build, tests, cobertura minima y chequeos de accesibilidad.
6. Evaluar server-side pagination y filtros remotos cuando el volumen de datos lo justifique.
