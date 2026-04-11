## 1. Flujo de creación de Automotor como transacción atómica

### Contexto

El flujo requería validar la existencia de un titular por CUIT y permitir su creación en caso de no existir.

### Decisión

Se decidió **centralizar la validación en el endpoint `POST /automotores`**, evitando llamadas previas a `GET /sujetos/by-cuit`.

El backend:

* valida la existencia del CUIT,
* responde con `422` si no existe,
* y permite reintentar luego de crear el sujeto.

### Alternativas consideradas

* Validar previamente el CUIT desde el frontend usando `valueChanges` + RxJS (`debounceTime`, `switchMap`).
* Flujo de doble request: primero validar, luego crear automotor.

### Trade-offs

**Ventajas:**

* Menor cantidad de requests.
* Flujo más simple y predecible.
* Garantiza atomicidad → evita estados inconsistentes (ej: automotor creado con titular inválido).

**Desventajas:**

* Feedback menos inmediato al usuario.
* Se delega más responsabilidad al backend.

### Impacto

* Mejora consistencia del sistema.
* Reduce complejidad en frontend.
* Ligero impacto negativo en UX inmediata, compensado con manejo claro de errores `422`.

---

## 2. Uso de Tailwind CSS en lugar de librerías UI

### Contexto

Se requería construir una UI simple, funcional y responsive.

### Decisión

Se utilizó **Tailwind CSS + clases utilitarias**, evitando librerías como Angular Material o PrimeNG.

### Alternativas consideradas

* Angular Material (componentes listos, accesibilidad integrada).
* PrimeNG (mayor cantidad de componentes complejos).

### Trade-offs

**Ventajas:**

* Menor peso de bundle.
* Mayor control visual.
* Evita dependencias innecesarias.

**Desventajas:**

* Mayor esfuerzo manual en UI.
* Falta de componentes avanzados (ej: toasts, dialogs complejos).

### Impacto

* Mejora performance (menos JS/CSS).
* Mantiene la solución simple y alineada al alcance del challenge.

---

## 3. Estructura de carpetas orientada a features

### Contexto

La aplicación requiere escalabilidad y separación clara de responsabilidades.

### Decisión

Se adoptó una **estructura basada en features (ej: `automotores/`)** en lugar de una organización técnica (components/services globales).

### Alternativas consideradas

* Estructura por tipo (components/, services/, models/).
* Arquitectura monolítica sin separación por dominio.

### Trade-offs

**Ventajas:**

* Alta cohesión por dominio.
* Facilita escalabilidad (nuevas features independientes).
* Mejora mantenibilidad.

**Desventajas:**

* Puede duplicar ciertas utilidades si no se controla.

### Impacto

* Base sólida para escalar a múltiples formularios.
* Alineado con buenas prácticas modernas de Angular.

---

## 4. Optimización de render con OnPush y trackBy 

### Contexto

El listado de automotores puede crecer y generar renders innecesarios.

### Decisión

* Uso de `ChangeDetectionStrategy.OnPush`
* Uso de `trackBy` en listas

### Alternativas consideradas

* Change Detection por defecto
* No usar trackBy

### Trade-offs

**Ventajas:**

* Reduce renders innecesarios.
* Mejora performance en listas grandes.
* Mayor control sobre cambios en UI.

**Desventajas:**

* Requiere mayor entendimiento del flujo de datos.
* Puede generar bugs si no se manejan bien las referencias.

### Impacto

* Mejora directa en performance de render.
* Cumple con buenas prácticas de Angular.

---

## 5. Manejo centralizado de errores HTTP con interceptor

### Contexto

Se necesitaba manejar errores HTTP de forma consistente (especialmente `422`).

### Decisión

Se implementó un **interceptor global** que:

* mapea errores HTTP a un tipo de error de aplicación,
* desacopla la UI de `HttpErrorResponse`.

### Alternativas consideradas

* Manejo de errores en cada componente.
* Mapper local por servicio.

### Trade-offs

**Ventajas:**

* Consistencia global.
* Reduce duplicación.
* Simplifica componentes.

**Desventajas:**

* Puede volverse complejo si se sobrecarga.
* Riesgo de lógica de negocio en capa incorrecta.

### Impacto

* Mejora mantenibilidad.
* Facilita manejo de errores de negocio (`422`).

---

## 6. Uso de DTOs y mappers para desacoplar dominio

### Contexto

La API y el dominio frontend pueden evolucionar de forma independiente.

### Decisión

Se utilizaron:

* DTOs para comunicación con API
* Mappers para transformar a modelos de dominio

### Alternativas consideradas

* Usar directamente los DTOs en toda la app.

### Trade-offs

**Ventajas:**

* Desacoplamiento fuerte.
* Mayor control sobre cambios de API.
* Mejora testabilidad.

**Desventajas:**

* Más código (mappers).
* Overhead inicial.

### Impacto

* Mejora mantenibilidad y escalabilidad.

---

## 7. Uso de patrón Facade + Signals para manejo de estado

### Contexto

Se necesitaba manejar estado sin sobre-ingeniería (evitando NgRx completo).

### Decisión

Se implementó:

* **Patrón Facade**: capa intermedia que expone métodos y estado a los componentes.
* **Store por componente basado en Signals**.

El facade:

* encapsula lógica de negocio,
* orquesta llamadas a servicios,
* expone estado listo para UI.

### Alternativas consideradas

* Store global (NgRx).
* Manejo directo en componentes.

### Trade-offs

**Ventajas:**

* Bajo acoplamiento.
* Simplicidad.
* Fácil evolución hacia store más complejo si escala.

**Desventajas:**

* No es tan robusto como NgRx para apps grandes.
* Requiere disciplina en diseño.

### Impacto

* Excelente balance entre simplicidad y escalabilidad.
* Mejora claridad en componentes (solo presentación).

---

## 8. Reducción de requests innecesarias en validaciones

### Contexto

Validar CUIT en tiempo real puede generar múltiples requests.

### Decisión

Se evitó validación en tiempo real contra backend, priorizando validación en el `POST`.

### Alternativas consideradas

* Validación reactiva con RxJS (`debounceTime`, `switchMap`).

### Trade-offs

**Ventajas:**

* Menor tráfico de red.
* Menor carga en backend.
* Simplicidad.

**Desventajas:**

* Menor feedback inmediato.

### Impacto

* Mejora performance de red.
* Reduce complejidad.

Perfecto, agrego esa decisión manteniendo el mismo nivel:

---

## 9. Lazy Loading por features en páginas

### Contexto

La aplicación puede crecer en cantidad de pantallas (listado, formulario, futuras features), lo que impacta directamente en el tamaño del bundle inicial.

### Decisión

Se implementó **lazy loading por features (pages)**, cargando cada módulo/pantalla bajo demanda mediante routing.

### Alternativas consideradas

* Carga eager de todos los módulos al inicio.
* Lazy loading parcial (solo algunas rutas).

### Trade-offs

**Ventajas:**

* Reduce el tamaño del bundle inicial.
* Mejora el tiempo de carga inicial (TTI).
* Escala mejor a medida que crece la aplicación.

**Desventajas:**

* Puede introducir una pequeña latencia al navegar por primera vez a una ruta.
* Requiere una correcta organización del routing.

### Impacto

* Mejora directa en performance de carga inicial.
* Alineado con buenas prácticas modernas de Angular.
* Facilita escalabilidad futura sin degradar la experiencia inicial.
