# Decisiones de diseno frontend

## Contexto

El frontend se esta construyendo para el challenge de automotores, tomando a `automotores` como feature principal del negocio.
El flujo de sujeto/titular/dueno por CUIT se modela como parte de esa misma feature y no como una capacidad independiente.

El objetivo de estas decisiones es sostener:

- claridad arquitectonica
- naming consistente
- separacion de responsabilidades
- facilidad de evolucion
- defensa tecnica en revision

## Decisiones adoptadas

### 1. Organizacion orientada a feature con `automotores` como capacidad principal

Se adopto una organizacion por feature y se definio a `automotores` como eje principal del sistema.

Esto implica que todo lo especifico del challenge vive dentro de:

```text
src/app/features/automotores/
```

Incluye:

- pantallas
- componentes
- dominio
- aplicacion
- integracion

No se creo una feature separada para `sujetos`, porque funcionalmente forma parte del flujo de automotores.

Motivacion:

- mantener foco en el dominio principal
- evitar dispersion
- alinear la solucion con el lenguaje del negocio

---

### 2. `titular` como concepto de dominio; `sujeto` solo en contrato API

En el frontend se decidio usar `Titular` como concepto de dominio.

El termino `sujeto` queda reservado para la capa de infraestructura porque el backend expone:

- `GET /api/sujetos/by-cuit`
- `POST /api/sujetos`

Esto se resuelve asi:

- dominio/frontend: `Titular`
- infraestructura/API: `SujetoDto`
- mappers: puente entre ambos

Motivacion:

- mantener un lenguaje del dominio claro en frontend
- respetar el contrato real del backend sin contaminar el dominio

---

### 3. Shell raiz de aplicacion separado del dominio

Los archivos raiz de Angular permanecen en `src/app/`:

- `app.ts`
- `app.html`
- `app.routes.ts`
- `app.config.ts`

Estos archivos representan:

- shell global
- configuracion
- routing principal
- providers globales

No pertenecen al dominio `automotores`, por eso no fueron movidos a la feature.

Motivacion:

- mantener una composicion raiz clara
- seguir una convencion estandar de Angular
- separar bootstrap global de negocio

---

### 4. Separacion en `domain`, `application` e `infrastructure`

Dentro de `features/automotores/` se adopto una separacion explicita por responsabilidades:

- `domain/`
- `application/`
- `infrastructure/`

Criterio:

- `domain`: modelos y reglas del negocio
- `application`: estado y orquestacion del flujo
- `infrastructure`: integracion tecnica con backend

Motivacion:

- evitar logica de negocio dispersa en componentes
- desacoplar UI de HTTP
- mantener una arquitectura defendible sin sobreingenieria

---

### 5. Uso de `domain/types` para tipos auxiliares

Se decidio no crear una subestructura `listing/` ni mezclar todo en `domain/models/`.

En cambio se creo:

```text
domain/types/
```

para alojar tipos auxiliares de la feature:

- `automotores-filters`
- `automotores-sort`
- `automotores-page`

Mientras que `domain/models/` quedo reservado para conceptos centrales:

- `automotor`
- `titular`

Motivacion:

- mantener simple la estructura
- evitar inflar `models/` con tipos auxiliares
- no introducir una subestructura extra sin necesidad real

---

### 6. Validaciones del negocio como funciones puras

Las validaciones de:

- dominio
- CUIT
- fecha fabricacion `YYYYMM`

se implementaron como funciones puras en:

```text
domain/validators/
```

No se implementaron todavia como `ValidatorFn` de Angular.

Motivacion:

- reutilizacion desde formularios, stores y tests
- independencia de Angular Forms
- testeo simple y confiable
- menor acoplamiento tecnico

Tambien se decidio:

- normalizar dominio antes de validar
- normalizar CUIT removiendo caracteres no numericos
- permitir inyectar fecha de referencia en validacion de `YYYYMM` para testabilidad

---

### 7. Integracion HTTP desacoplada con DTOs, mappers y repositories

La integracion con backend se diseno con estas capas:

- `api/`: servicios HTTP con `HttpClient`
- `dtos/`: contratos del backend
- `mappers/`: traduccion DTO <-> dominio
- `repositories/`: abstraccion consumida por la aplicacion

Esto evita que `application/` o los componentes dependan directamente de:

- `HttpClient`
- shapes de Express
- nombres concretos del backend

Motivacion:

- desacople entre frontend y contrato externo
- facilidad para cambiar backend o formato
- claridad de responsabilidades

---

### 8. Base URL `/api` para integracion con Express en el mismo repo

Se definio `/api` como base URL de integracion.

No se uso una URL fija con host y puerto.

Motivacion:

- mejor compatibilidad con Express en el mismo repo
- simplificacion de entornos
- mejor alineacion con Docker y reverse proxy
- menor acoplamiento a desarrollo local

---

### 9. Estrategia de manejo de errores HTTP y `422`

Se definio una estrategia transversal de errores HTTP en `core/http/` con:

- `ApiError`
- `api-error.mapper`
- `api-error.interceptor`

Ademas, se definio para `422` un contrato estructurado como:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "No se pudo procesar la solicitud",
  "errors": [
    {
      "field": "dominio",
      "message": "El dominio ya existe"
    }
  ]
}
```

Motivacion:

- soportar mensajes utiles por campo
- evitar tratamiento inconsistente de errores
- simplificar integracion con formularios
- centralizar el entendimiento del contrato del backend

---

### 10. Traduccion de `404` de sujeto por CUIT a `null` en repositorio

Se definio que:

- la API de Express responda `404` si no existe un sujeto por CUIT
- el repositorio traduzca ese `404` a `null`

Asi, el nivel de aplicacion trabaja con intencion de negocio:

- `null` significa "no existe, ofrecer creacion"
- otros errores significan fallo real

Motivacion:

- separar semantica HTTP de semantica del caso de uso
- simplificar el flujo de busqueda por CUIT
- evitar que stores o componentes deban interpretar codigos HTTP

---

### 11. Angular moderno: standalone, lazy loading, signals y `OnPush`

Hasta este punto se adoptaron decisiones alineadas con Angular moderno:

- componentes standalone
- lazy loading por feature
- estado local con signals
- `ChangeDetectionStrategy.OnPush`

Motivacion:

- rendimiento razonable por defecto
- simplicidad de composicion
- menor overhead
- alineacion con buenas practicas actuales de Angular

## Trade-offs asumidos

- Se priorizo simplicidad sobre una arquitectura mas sofisticada.
- `value-objects/` quedo reservado pero sin implementacion hasta que exista una necesidad real.
- No se creo una feature paralela para `sujetos`.
- Las validaciones se implementaron primero como funciones puras y no como adapters de Angular.
- La semantica del backend se encapsulo en infraestructura para no contaminar el dominio.

## Proximos ajustes esperados

En proximas etapas se espera:

- conectar stores con repositorios HTTP
- modelar estados `loading`, `error`, `empty`
- implementar listado funcional
- implementar formulario y flujo de titular por CUIT
- aprovechar `ApiError` para representar `422` en UI
