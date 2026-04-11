# Decisiones Generales

## Uso de tailwind sobre clases de CSS puras.
Se uso tailwind sobre aplicar estilos directos con archivos css, debido a que con tailwind nos ahorramos estilos y ya hay clases pre definidas que nos ahorran el trabajo, como hacer componentes responsives.

Tambien se presento la opcion de usar Angular Material, la cual nos provee de componentes ya listos para su implementacion, pero al ser algo simple no vale la pena aumentar el bundle, si fuera una aplicacion mas grande que usa headers, sidebars, por ejemplo, se justificaria usar material.

## Realizar creacion de automotor y sujeto atomica.

En un momento plantee hacer dos solicitudes post diferentes, al crear el automotor y el sujeto.

Pero esto puede causar un estado intermedio, supongamos el caso donde el titular no existe y el formulario se lleno con un dominio ya existente.

Si decidimos hacer dos solicitudes post diferentes, se crearia el titular, pero no el automotor, dejando un titular sin automotor, lo cual en el dominio podria no tener sentido

Es por eso que se hace una sola transaccion que valida y crea tanto el titular como el automotor, en caso de que no exista.

De esta manera nos evitamos estados inconsistentes del sistema.

## Estructura de carpeta

Se decidio una estructura de carpetas orientada a la funcionalidad del negocio.
A su vez se enfatizo en la estructura que separe bien las responsabilidades

application: Donde se manejan los flujos de la aplicacion, en store encontramos las signals de la aplicacion, facades proporciona un conjunto de funciones para desacoplar la funcionalidad de los componentes. Uses-Cases?

components: Usamos los components definidos por angular.

domain: Encapsulamos la logica de negocio, definimos validadores de logica de negocio. Definimos filtros. Automotor vs Automotor draft?

infraestructure: Encapsulamos toda la logica para consumir la api. Los mappers nos permiten tener una capa intermedia por si hay inconsistencias entre respuestas del backend y el modelado del frontend. Aunque con los dtos podria ser suficiente es tambien necesario mapear a las interfaces del frontend.

pages

routes

## Flujo

Obtencion de datos

Components dispara la accion -> Facade expone la api -> llama al repository -> http.repository implementa el repository -> llama a la api del backend.

la api del backend de devuelve un datos, que se mapean a un dto, este dto se convierte en un objeto model.


Creacion. lo mismo, pero el pasa de objeto a dto.



## Patron global de errores.

Usamos un interceptor global de errores, que traduce los errores que nos devuelve el backend u otros sa errores que nuestro frontend puede mostrar de forma amigable para el usuario.


## Paginado en el frontend

Se realiza paginado en el frontend por mayor simplicidad y asumiendo que se manejaran pocos datos.
Con grandes volumenes de datos esto es inviable, ya que cargaria mucho  el cliente.

## Librerias

Libreria de iconos.
Tailwind
rxjs