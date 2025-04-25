export const subjects = {
    PRG: {
        name: 'Programación',
        topics: [
            {
                value: 'java', label: 'Java',
                subtopics: [
                    { title: 'Declaración de variables', comment: '', files: [] },
                    { title: 'Tipos de datos, operadores y expresiones', comment: '', files: [] },
                    { title: 'Bucles y condicionales', comment: '', files: [] },
                    { title: 'Uso de Break y Continue', comment: '', files: [] },
                    { title: 'Clases y objetos', comment: '', files: [] },
                    { title: 'Comandos try, catch y finally', comment: '', files: [] },
                    { title: 'Manejo de excepciones', comment: '', files: [] }
                ]
            }
        ]
    },
    CORE: {
        name: 'Computación en Red',
        topics: [
            {
                value: 'plataformaweb', label: 'Plataforma Web',
                subtopics: [ 
                    { title: 'Características principales', comment: `Este es el resumen de la materia desarrollada en clase. La plataforma web y su arquitectura basada en el modelo cliente-servidor. Se inicia con los orígenes de Internet (ARPANET, 1983) y la Web (propuesta por Tim Berners-Lee en 1989), resaltando la introducción de tecnologías clave como URL, HTML y HTTP. Estas tecnologías permitieron el acceso a documentos interconectados mediante hipervínculos, dando lugar a la actual Web hipermedia.
                        Se describen diferentes etapas de la evolución tecnológica:
                        -En los 90, predominaban páginas estáticas y lógica en el servidor.
                        -En los 2000, surge AJAX, permitiendo interacción asíncrona con el servidor sin recargar toda la página.
                        -Posteriormente, se desarrollan las SPA (Single Page Applications), donde la lógica se traslada mayoritariamente al cliente, y el servidor se encarga principalmente del almacenamiento de datos.
                        Las aplicaciones web actuales se construyen sobre una arquitectura distribuida que consta de tres capas:                        
                        -Cliente: Interfaz de usuario.                        
                        -Servidor: Lógica de negocio.                        
                        -Base de datos: Persistencia de la información.                        
                        El cliente (navegador o app móvil) consume servicios ofrecidos por servidores web, que pueden ser físicos o virtuales, alojados en la nube. Los navegadores usan HTML, CSS y JavaScript, mientras que los servidores pueden programarse en múltiples lenguajes como Node.js, Python (Django), Ruby on Rails, PHP (Zend), Java (Spring), etc.`, files: [] },               
                    { title: 'URLs', comment: `Este es el resumen de la materia desarrollada en clase. Una URL (Localizador Uniforme de Recursos) es la dirección que permite acceder a un recurso en Internet. Es un caso específico de los URI (Identificadores Uniformes de Recursos) y fue desarrollada como parte fundamental de la Web. El formato estándar de una URL es: "scheme://user:password@host:port/path?query#fragment" 
                        - Scheme indica el protocolo (como http, https, ftp, mailto, etc.).
                        - User:password es opcional y permite autenticación.
                        - Host es el nombre del servidor.
                        - Port define el puerto (por defecto 80 para HTTP).
                        - Path especifica la ruta al recurso.
                        - Query incluye parámetros en forma clave=valor, separados por &.
                        - Fragment señala una parte específica del documento, asociado a un identificador interno (id).

                        Ejemplos:
                        - http://upm.es/dir/pagina.html: recurso en la ruta /dir/pagina.html del servidor upm.es.
                        - https://upm.es/registro?id=23&nombre=Luis: incluye una query con dos parámetros.
                        - mailto:felix@upm.es: URL para correo electrónico.

                        Dado que no todos los caracteres son válidos directamente en una URL, se utiliza el URL encoding (escapado). Solo se permiten ciertos caracteres ASCII y los conflictivos (como &, +, =, /, ?, @, etc.) deben ser codificados. Esto se hace en UTF-8, sustituyendo caracteres especiales por % seguido del valor hexadecimal. Por ejemplo, el espacio se convierte en + o %20, y la letra í (í acentuada) se representa como %C3%AD.
                        Los navegadores realizan este proceso automáticamente, pero en otras aplicaciones debe hacerlo el desarrollador manualmente.`, files: [] },
                    { title: 'HTTP y Cabeceras', comment: `Este es el resumen de la materia desarrollada en clase. HTTP (Hypertext Transfer Protocol) es un protocolo de comunicación sin estado basado en un modelo de petición-respuesta entre cliente y servidor. Toda transacción se inicia desde el cliente (normalmente un navegador), que envía una solicitud HTTP y recibe una respuesta HTTP del servidor. Ambas tienen una estructura común: una cabecera y, opcionalmente, un cuerpo (body).
                        La cabecera se compone de una primera línea y varios parámetros. En la solicitud, la primera línea contiene el método (como GET, POST, PUT, DELETE), la ruta al recurso y la versión del protocolo (HTTP/1.1). En la respuesta, contiene la versión HTTP, un código de estado (como 200 OK, 404 Not Found, etc.) y un mensaje.
                        Las cabeceras HTTP permiten intercambiar información adicional entre cliente y servidor. Algunas comunes son:
                        - Host: identifica el servidor.
                        - Content-Type: indica el tipo MIME del contenido (por ejemplo, text/html).
                        - Content-Length: longitud del cuerpo en bytes.
                        - Accept: tipos MIME que acepta el cliente.
                        - Accept-Language: idiomas preferidos.
                        - Cookie / Set-Cookie: para enviar y recibir cookies.
                        - Authorization: para autenticación.
                        - User-Agent: identifica el software del cliente.
                        Otras cabeceras avanzadas controlan caché (Etag, If-Modified-Since, Cache-Control), seguridad (Strict-Transport-Security, Content-Security-Policy), codificación (Content-Encoding, Transfer-Encoding) y control de acceso (Access-Control-Allow-Origin).
                        HTTP ha evolucionado desde la versión 1.0 hasta HTTP/2 y HTTP/3, que mejoran la eficiencia con conexiones persistentes, compresión de cabeceras y uso de QUIC sobre UDP.`, files: [] },
                    { title: 'Interfaz HTTP, REST, Estado y Carga de Páginas', comment: `Este es el resumen de la materia desarrollada en clase. El interfaz HTTP permite que el cliente acceda a servicios del servidor mediante rutas (URLs) y métodos HTTP (GET, POST, PUT, DELETE). Se distingue entre:
                        - Servicio estático: sirve recursos fijos (como ficheros HTML) mediante GET.
                        - Servicio programable: gestiona datos en bases de datos usando una interfaz REST basada en CRUD (Create, Read, Update, Delete).
                        El modelo REST (Representational State Transfer) define una arquitectura para aplicaciones distribuidas, sin estado, basada en recursos identificados por URLs únicas. Los clientes manipulan estos recursos con métodos HTTP. Las respuestas contienen el nuevo estado (en HTML, JSON, XML, etc.) y pueden ser cacheadas si el método es seguro e idempotente. Por ejemplo:
                        - GET /clientes/22 → obtiene un cliente.
                        - PUT /clientes/22?name=Ana → actualiza datos.
                        - DELETE /clientes/22 → elimina.
                        HTTP es stateless, es decir, no guarda información entre peticiones. Para mantener el estado (por ejemplo, sesiones de usuario) se usan:
                        - Parámetros ocultos (en rutas, queries o campos hidden de formularios).
                        - Cookies, almacenadas en el navegador y enviadas en cada solicitud.
                        Una sesión es una secuencia de interacciones con un cliente. Se puede gestionar mediante un identificador de sesión (guardado en una cookie), mientras el estado real se almacena en el servidor (por ejemplo, con express-session en Node.js).
                        Finalmente, al cargar una página web, el navegador puede establecer múltiples conexiones para obtener recursos adicionales (CSS, imágenes, etc.), incluso desde diferentes servidores.`, files: [] }
                ]
            },
            {
                value: 'html', label: 'HTML',
                subtopics: [
                    { title: 'Estructura de documento HTML', 
                      comment: `Este es el resumen de la materia desarrollada en clase. 
                      HTML es un lenguaje de marcas para formatear y estructurar un documento, que puede leerse en cualquier navegador. Las marcas se emplean para el estructurado semántico del contenido. 
                        Las marcas se definen con los siguientes elementos:
                        - < : Inicio de una etiqueta.
                        - nombre de la etiqueta : Define el tipo de etiqueta que es. Por ejemplo, <html>, <head>, <body>, <div>, <p>, etc.
                        - atributo = valor : Atributos opcionales que añaden información a la etiqueta. Por ejemplo, <img src="imagen.jpg" alt="Descripción de la imagen">.
                        - / : Cierre de una etiqueta.
                        - > : Fin de una etiqueta.
                        Asi por ejemplo una etiqueta de titulo se define como <h1 class="title"> Titulo </h1>.
                        Se pueden añadir comentarios dentro del HTML usando la sintaxis <!-- comentario -->.
                        Entre algunas de las marcas para estructurar el contenido encontramos:
                        - <!doctype html>: Tipo de contenido
                        - <html>: Elemento raíz del documento.
                        - <head>: Contiene metadatos y enlaces a recursos externos. Dentro de head se encuentran algunos elementos básicos como:
                            - <title>: Título de la ventana o pestaña.
                            - <meta>: Metadatos del documento. Ejemplo: charset, viewport, etc.
                            - <link>: Enlace a recursos externos (CSS, iconos, etc.).
                            - <style>: Estilos CSS internos.
                            - <script>: Código JavaScript interno o enlace a scripts externos.
                        - <body>: Contenido visible del documento. Dentro de body se encuentran los elementos que estructuran el contenido, como:
                            - <header>: Encabezado del documento.
                            - <nav>: Navegación del documento.
                            - <main>: Contenido principal del documento.
                            - <section>: Sección del documento.
                            - <article>: Artículo independiente.
                            - <aside>: Contenido relacionado o secundario.
                            - <footer>: Pie de página del documento.
                        Con estas etiquetas se define una estructura básica de la página web. A parte, dentro de esas etiquetas se pueden añadir otros elementos como listas, formularios, imágenes, etc.
                    `, files: [] },

                    { title: 'Atributos de etiquetas', 
                      comment: `Este es el resumen de la materia desarrollada en clase. 
                      Las etiquetas HTML tienen una serie de atributos que permiten definir diferentes propiedades de las etiquetas. Algunos de los atributos más comunes son:
                        - id: Atributo que define el identificador de la etiqueta. Este identificador debe ser único dentro del documento HTML. Se utiliza para identificar la etiqueta en el CSS o JavaScript.
                        - class: Atributo que define la clase de la etiqueta. Este atributo se utiliza para aplicar estilos CSS a la etiqueta. Se pueden añadir varias clases separadas por espacios. Por ejemplo, class="clase1 clase2".
                        - style: Atributo que define el estilo CSS de la etiqueta. Este atributo se utiliza para aplicar estilos CSS a la etiqueta. Por ejemplo, style="color: red; font-size: 16px;".
                        - data-*: Atributo que define un atributo personalizado de la etiqueta. Este atributo se utiliza para almacenar información adicional en la etiqueta a la que se puede acceder posteriormente desde Javascript. Por ejemplo, data-id="23".
                        - contenteditable: Atributo que define si el contenido de la etiqueta es editable. Este atributo se utiliza para permitir al usuario editar el contenido de la etiqueta. Por ejemplo, contenteditable="true".
                        Existen otros muchos tipos de atributos dependiendo de las etiquetas. Por ejemplo, en la etiqueta <a> se pueden usar atributos como href o en form se pueden usar atributos como action o method.
                    `, files: [] },

                    { title: 'Etiquetas', 
                      comment: `Este es el resumen de la materia desarrollada en clase. 
                      Dentro de HTML se pueden encontrar diferentes etiquetas que permiten definir diferentes tipos de contenido. Algunas de las etiquetas más comunes son:
                        - De tipo texto. Permite definir texto dentro del HTML. Dentro de estas etiquetas se pueden añadir elementos de texto como:
                            - <h1> a <h6>: Títulos de diferentes niveles.
                            - <p>: Párrafo.
                            - <span>: Texto en línea.
                            - <pre>: Texto preformateado. Permite definir elementos como código
                            - <blockquote>: Cita en bloque.
                            Se pueden añadir etiquetas para enfatizar texto como:
                            - <strong>: Texto en negrita.
                            - <em>: Texto en cursiva.
                            - <code>: Texto de código.
                            - <mark>: Texto resaltado.
                            - <small>: Texto pequeño.
                            - <cite>: Texto de cita.
                            - <abbr>: Texto abreviado.
                            - <u>: Texto subrayado.
                            - <s>: Texto tachado.
                            - <sub>: Texto subíndice.
                            - <sup>: Texto superíndice.
                            Existen otras como:
                            - <br>: Salto de línea.
                            - <hr>: Línea horizontal.
                            - <address>: Información de contacto. Ejemplo: "<address> Creado por <a href="mailto:pepe@ejemplo.es">Pepe</a>. </address>"
                        - De tipo lista. Permite definir listas dentro del HTML. Dentro de las listas se pueden añadir elementos de lista como:
                            - <ul>: Lista desordenada. Es decir con bulletpoints. O <ol>: Lista ordenada. Es decir con números. Dentro de estas listas se pueden añadir elementos de lista como:
                                - <li>: Elemento de lista.
                            - <dl>: Lista de definiciones. Dentro de estas listas se pueden añadir elementos de definición como:
                                - <dt>: Término de definición.
                                - <dd>: Definición del término.
                        - De tipo tabla. Permite definir tablas dentro del HTML. Dentro de las tablas se pueden añadir filas y columnas. Para definir una tabla se utilizan las siguientes etiquetas:
                            - <table>: Tabla.
                            - <tr>: Fila de la tabla.
                            - <th>: Encabezado de la tabla.
                            - <td>: Celda de la tabla.
                        - De navegación. Permite definir enlaces dentro del HTML. Dentro de los enlaces se pueden añadir elementos de navegación como:
                            - <a>: Enlace. Permite definir enlaces dentro del HTML. Dentro de los enlaces se pueden añadir elementos de navegación como:
                                - href: Atributo que define la URL del enlace. Esta URL puede ser absoluta o relativa. Por ejemplo, href="http://www.ejemplo.com" o href="/dir/pagina.html" respectivamente. Se pueden añadir query strings a la URL como href="/dir/pagina.html?id=23&nombre=Luis".
                                - target: Atributo que define el destino del enlace. Por ejemplo, _blank para abrir en una nueva pestaña.
                        - De tipo bloque. Permite definir bloques dentro del HTML. Dentro de los bloques se pueden añadir elementos de bloque como:
                            - <div>: División. Permite definir un bloque dentro del HTML. No tiene ningún significado semántico. Se utiliza para agrupar otros elementos y aplicar estilos o scripts.
                            - <section>: Sección. Permite definir una sección dentro del HTML.
                            - <article>: Artículo. Permite definir un artículo dentro del HTML.
                            - <nav>: Navegación. Permite definir un menú de navegación dentro del HTML. Estos menús de navegación se suele componer de listas desordenadas donde cada uno de los elementos de la lista contiene un enlace definido con <a>. Por ejemplo:
                                    "<nav>
                                        <ul>
                                            <li><a href="index.html">Inicio</a></li>
                                            <li><a href="productos.html">Productos</a></li>
                                            <li><a href="contacto.html">Contacto</a></li>
                                        </ul>
                                    </nav>"
                            - <aside>: Contenido relacionado. Permite definir contenido relacionado dentro del HTML.
                            - <header>: Encabezado. Permite definir un encabezado dentro del HTML.
                            - <footer>: Pie de página. Permite definir un pie de página dentro del HTML.
                        - De tipo formulario. Permite definir campos rellenables por los usuarios. Dentro de los formularios se pueden añadir elementos de formulario como:
                            - <form>: Formulario. Permite definir un formulario dentro del HTML. Los formularios tienen 2 atributos principales:
                                - action: Atributo que define la URL a la que se envía el formulario. Esta URL puede ser absoluta o relativa. Por ejemplo, action="http://www.ejemplo.com" o action="/dir/pagina.html" respectivamente. Se pueden añadir query strings a la URL como action="/dir/pagina.html?id=23&nombre=Luis".
                                - method: Atributo que define el método de envío del formulario. Por ejemplo, GET o POST. Si se define GET el formulario se envía como parámetros en la URL. Si se define POST el formulario se envía como parámetros en el cuerpo de la petición según se especifique en el atributo enctype.                        
                            Dentro de los forumularios se pueden añadir elementos de formulario como:
                                - <label>: Etiqueta. Permite definir una etiqueta para un campo de entrada dentro del HTML. Dentro de la etiqueta se pueden añadir atributos como:
                                    - for: Atributo que define el campo de entrada al que se refiere la etiqueta. Este atributo debe coincidir con el atributo id del campode entrada.
                                - <input>: Campo de entrada. Permite definir un campo de entrada dentro del HTML. Dentro de los campos de entrada se pueden añadir elementos de entrada como:
                                    - type: Atributo que define el tipo de campo de entrada. Por ejemplo, text, password, email, number, date, file, radio, checkbox, hidden, etc. Dependiendo del tipo de campo de entrada se pueden añadir atributos adicionales como:
                                        - value: Valor por defecto del campo de entrada.
                                        - name: Nombre del campo de entrada. Este nombre se utiliza para identificar el campo de entrada en el servidor.
                                        - placeholder: Texto que se muestra en el campo de entrada cuando está vacío.
                                        - required: Atributo que indica que el campo de entrada es obligatorio.
                                        - disabled: Atributo que indica que el campo de entrada está deshabilitado.
                                        - min y max: Atributos que definen los valores mínimo y máximo del campo de entrada. Por ejemplo, min="0" y max="100".
                                        - step: Atributo que define el paso del campo de entrada. Por ejemplo, step="0.1".
                                - <textarea>: Área de texto. Permite definir un área de texto dentro del HTML. Dentro del área de texto se pueden añadir elementos como:
                                    - rows: Atributo que define el número de filas del área de texto.
                                    - cols: Atributo que define el número de columnas del área de texto.
                                - <select>: Lista desplegable. Permite definir una lista desplegable dentro del HTML. Dentro de la lista desplegable se pueden añadir elementos como:
                                    - <option>: Opción. Permite definir una opción dentro de la lista desplegable. Dentro de la opción se pueden añadir elementos como:
                                        - value: Atributo que define el valor de la opción.
                                        - selected: Atributo que indica que la opción está seleccionada por defecto.
                                - <button>: Botón. Permite definir un botón dentro del HTML. Dentro del botón se pueden añadir elementos como:
                                    - type: Atributo que define el tipo de botón. Si se define type="subit" el botón envía el formulario. Si se define type="reset" el botón reinicia el formulario. Si se define type="button" el botón no hace nada.
                        - De tipo objeto. Permite definir objetos dentro del HTML. Dentro de los objetos se pueden añadir elementos de objeto como:
                            - <object>: Objeto. Permite definir un objeto dentro del HTML. Dentro del objeto se pueden añadir elementos de objeto como:
                                - data: Atributo que define la URL del objeto. Esta URL puede ser absoluta o relativa. Por ejemplo, data="http://www.ejemplo.com" o data="/dir/pagina.html" respectivamente. Se pueden añadir query strings a la URL como data="/dir/pagina.html?id=23&nombre=Luis".
                                - type: Atributo que define el tipo de objeto. Por ejemplo, image/png, image/jpeg, etc.
                            - <iframe>: Permite importar objetos de forma segura con marco de navegación propio. Se puede usar para embeber otras páginas web dentro de la página actual.
                            - <img>: Imagen. Permite definir una imagen dentro del HTML. Dentro de la imagen se pueden añadir elementos como:
                                - src: Atributo que define la URL de la imagen. Esta URL puede ser absoluta o relativa. Por ejemplo, src="http://www.ejemplo.com" o src="/dir/pagina.html" respectivamente. Se pueden añadir query strings a la URL como src="/dir/pagina.html?id=23&nombre=Luis".
                                - alt: Atributo que define el texto alternativo de la imagen. Este texto se muestra si la imagen no se puede cargar.
                                - width y height: Atributos que definen el ancho y alto de la imagen.
                            - <video>: Video. Permite definir un video dentro del HTML.
                            - <audio>: Audio. Permite definir un audio dentro del HTML.
                    `, files: [] }
                ]
            },
            {
                value: 'css', label: 'CSS',
                subtopics: [
                    { title: 'Como añadir estilo CSS a una página', 
                      comment: `Este es el resumen de la materia desarrollada en clase. 
                        CSS controla el aspecto gráfico, indicando al navegador cómo deben visualizarse los elementos del documento HTML. Las navegadores tienen unos valores CSS por defecto para cada etiqueta HTML que puede varias dependiendo del navegador. Estos estilos se pueden sobrescribir y se puede añadir más estilos CSS de tres maneras:
                            - En línea: Usando el atributo style en la etiqueta HTML. Por ejemplo, <h1 style="color: red;">Título</h1>.
                            - Interno: Usando la etiqueta <style> dentro de la sección <head> del documento HTML.
                            - Externo: Usando la etiqueta <link> dentro de la sección <head> del documento HTML. Este método es el más recomendado, ya que permite separar el contenido del estilo y reutilizar el mismo CSS en múltiples documentos HTML. Por ejemplo, <link rel="stylesheet" type="text/css" href="estilos.css">.
                        Al existir varias formas de definir estilos CSS, el navegador tiene que decidir qué estilo aplicar. Para ello, se sigue un orden de prioridad (cascada) teniendo mayor prioridad:
                            - Primero se aplican los valores por defecto del navegador.
                            - Luego se aplican con mayor prioridad los estilos especificados en ficheros externos (link).
                            - Sobre lo anterior, tienen mayor prioridad los especificados con la etiqueta <style>.
                            - Después tienen prioridad los especificados con el atributo style en las etiquetas HTML.
                        Se puede marcar un estilo CSS como !important para que tenga mayor prioridad que los demás estilos. Por ejemplo, color: red !important;.
                        Una regla CSS se compone de:​
                        - Selector: Indica el elemento HTML al que se aplicará el estilo.
                        - Bloque de declaración: Encerrado entre llaves {}, contiene una o más declaraciones.
                        - Declaración: Consiste en una propiedad y su valor, separados por dos puntos y finalizados con un punto y coma.​
                        Los selectores pueden ser:
                            - Selector de tipo: Selecciona todos los elementos de un tipo. Por ejemplo, h1 { color: red; } selecciona todos los elementos <h1>.
                            - Selector de clase: Selecciona todos los elementos con una clase. Por ejemplo, .clase { color: red; } selecciona todos los elementos con la clase "clase". Se puede añadir más de una clase separada por espacios. 
                            - Selector de id: Selecciona todos los elementos con un id. Por ejemplo, #id { color: red; } selecciona todos los elementos con el id "id". Este id debe ser único dentro del documento HTML.
                            - Selector de atributo: Selecciona todos los elementos con un atributo. Por ejemplo, [type="text"] { color: red; } selecciona todos los elementos con el atributo type="text". 
                            - Selector de descendiente: Selecciona todos los elementos que son descendientes de otro elemento. Por ejemplo, div p { color: red; } selecciona todos los elementos <p> que son descendientes de un elemento <div>. 
                            - Selector de hijo: Selecciona todos los elementos que son hijos de otro elemento. Por ejemplo, div > p { color: red; } selecciona todos los elementos <p> que son hijos de un elemento <div>. 
                      `, files: [] },
                    { title: 'Propiedades CSS', 
                      comment: `Este es el resumen de la materia desarrollada en clase. 
                        Modelo de cajas. Todos los elementos HTML son representados como cajas rectangulares mediante el modelo de cajas de CSS, que permite definir el tamaño, la posición y los espacios de los elementos. Este modelo está compuesto por:
                            - Contenido: El texto o imagen del elemento.
                            - Padding (relleno): Espacio entre el contenido y el borde.
                            - Borde (border): Límite del elemento.
                            - Margen (margin): Espacio entre el borde y los elementos adyacentes.
                        Las propiedades margin, padding y border pueden aplicarse de forma global (todos los lados a la vez) o específica para cada lado (margin-top, margin-left, etc.). Por ejemplo:

                        Dimensiones y unidades. El tamaño de las cajas se define con propiedades como:
                        - width, height: anchura y altura.
                        - min-width, max-width: anchura mínima y máxima.
                        - min-height, max-height: altura mínima y máxima.

                        Las unidades de medida pueden ser:
                            - Absolutas: px, cm, in, etc.
                            - Relativas al texto: em, rem.
                            - Relativas al viewport: vw, vh, vmin, vmax.
                            - Relativas al contenedor padre: porcentajes %.
                        Los colores pueden definirse por nombre (red), por hexadecimal (#ff0000) o por valores RGB (rgb(255, 0, 0)).
                        Se puede usar la propiedad calc() para realizar cálculos con las dimensiones. Por ejemplo, width: calc(100% - 20px);.

                        Posicionamiento. CSS permite controlar la posición de los elementos mediante la propiedad position, que puede tomar los siguientes valores:
                            - static: posición por defecto.
                            - relative: relativa a su posición original.
                            - absolute: relativa al primer ancestro posicionado.
                            - fixed: relativa a la ventana del navegador.
                            - sticky: cambia entre relativa y fija según el scroll.

                        Se pueden combinar con top, right, bottom y left para ajustar la ubicación. Otra propiedad importante es z-index, que controla la superposición de elementos en el eje Z.

                        Display y distribución. La propiedad display define cómo se muestran los elementos. Valores comunes incluyen:
                            - block, inline, inline-block, none, etc
                            - flex. En flex tenemos las siguientes propiedades:                            
                                - flex-direction: dirección de los elementos (row, column, row-reverse, column-reverse).
                                - justify-content: alineación horizontal (flex-start, flex-end, center, space-between, space-around).
                                - align-items: alineación vertical (stretch, flex-start, flex-end, center).
                                - flex-wrap: control de envoltura (nowrap, wrap, wrap-reverse).
                            - grid. En grid tenemos las siguientes propiedades:
                                - grid-template-columns: define las columnas de la cuadrícula.
                                - grid-template-rows: define las filas de la cuadrícula.
                                - grid-area: define el área de un elemento en la cuadrícula.
                                - grid-gap: espacio entre filas y columnas.

                        Bordes y sombras. CSS permite personalizar los bordes de los elementos con propiedades como:
                        - border: 1px solid black; Esto añade un borde de 1px de grosor.
                        - border-color: Color del borde.
                        - border-style: Estilo del borde (solid, dashed, dotted, double, groove, ridge, inset, outset).
                        - border-radius: Radio de los bordes (redondeado).
                        - box-shadow: Sombra del elemento. Permite definir la sombra de un elemento. Por ejemplo, box-shadow: 2px 2px 5px #000000;.
                        - text-shadow: Sombra del texto. Permite definir la sombra del texto. Por ejemplo, text-shadow: 2px 2px 5px #000000;.

                        Otras propiedades comunes. CSS ofrece muchas más propiedades que permiten personalizar el aspecto visual:
                            - background-color: Color de fondo
                            - background-image: Imagen de fondo
                            - color: Color del texto
                            - font-family: Tipo de fuente
                            - font-size: Tamaño de la fuente
                            - text-align: Alineación del texto
                            - text-decoration: Subrayado, tachado, etc.
                            - box-shadow: Sombra en la caja
                            - opacity: Opacidad del elemento
                            - visibility: Visibilidad (visible/oculto)
                            - overflow: Comportamiento del contenido desbordado
                            - cursor: Tipo de cursor al pasar el ratón
                            - transition: Efectos de transición
                            - animation: Efectos de animación

                        Un punto importante de CSS es el diseño adaptativo o responsive. Esto se refiere a la capacidad de una página web para adaptarse a diferentes tamaños de pantalla y dispositivos. Para ello, se pueden usar unidades relativas (como %, em, rem) y media queries. Las media queries permiten aplicar estilos CSS específicos según el tamaño de la pantalla o el dispositivo.
                        Se definen con @media para especificar las propiedades a aplicar según el tipo de media o las características del dispositivo. Los dispositivos se diferencian en función de:
                            - El ancho o alto de su viewport.
                            - El ancho o alto del dispositivo.
                            - La resolución.
                            - La orientación. 
                        Por ejemplo:
                        @media (max-width: 600px) {
                            body { background-color: lightblue; }
                        }

                        En este contexto es importante configurar el viewport de la página web. El viewport es el área visible de una página web en un dispositivo. Para configurarlo, se utiliza la etiqueta <meta name="viewport" content="width=device-width, initial-scale=1.0"> dentro de la sección <head> del documento HTML. Esta etiqueta permite definir el ancho y la escala inicial del viewport. Por ejemplo:
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">.
                      `, files: [] }
                ]
            },
            {
                value: 'javascript', label: 'Lenguaje JavaScript',
                subtopics: [
                    { title: 'Javascript de cliente', 
                      comment: `Este es el resumen de la materia desarrollada en clase. 
                        JavaScript se diseño para animar páginas Web con pequeños scripts que se ejecutan en el navegador del cliente. El navegador proporciona APIs para manejar muchas funcionalidades desde los scripts JavaScript.

                        Los navegadores ejecutan javascript incluido en la etiqueta <script> del HTML. Este script puede ser interno o externo en un fichero separado. Pueden ser: 
                            - Sripts tradicionales: <script type="text/javascript">...</script>
                            - Scripts ECMAScript: <script src="script.js" type="module"></script>. 
                        También pueden escribirse como manejador de eventos (<button onclick="f()">pulsar</button>) o como sentencias en la consola del navegador.
                        
                        Los navegadores tienen un entorno global de ejecución para JavaScript llamado window, que incluye objetos y funciones predefinidos. Algunos de los objetos globales más comunes son: Document, Location, History, Navigator, Screen, Console, etc.

                        El DOM (Document Object Model) es una API que permite manipular el contenido y la estructura de un documento HTML. El DOM representa el documento como un árbol objetos que representa una parte del documento. A través de métodos se pueden obtener referencias a los nodos del árbol y manipularlos. Algunos de los métodos más comunes son:
                            - document.getElementById("id"): Devuelve el elemento con el id especificado.
                            - document.getElementsByClassName("clase"): Devuelve una colección de elementos con la clase especificada.
                            - document.querySelector("selector"): Devuelve el primer elemento que coincide con el selector CSS especificado.
                        Cada objeto tiene propiedades para acceder a las distintas partes: innerHTML, outerHTML y value.

                        Los eventos son la ocurrencia de un suceso, por ejemplo click, mousenter, mouseleave, dbclick o load. Un manejador de eventos es un bloque de código o función que se ejecuta al ocurrir el evento. Estos manejadores pueden añadirse de varias formas:
                            - A través de atributos HTML (onclick, onmouseover, etc.). Por ejemplo: <button onclick="f()">pulsar</button>.
                            - A través de addEventListener() en el script. Por ejemplo: document.getElementById("boton").addEventListener("click", f);.
                            - Usando bubbling. Por ejemplo se podrían registrar todos los manejadores de eventos en el elemento document y luego filtrar el evento según el elemento que lo ha generado. Por ejemplo: document.addEventListener("click", function(event) { if (event.target.matches(".boton")) { f(); } });.

                        Los navegadores también permiten añadir varios temporizadores para cambiar el momento de la ejecución del código como:
                            - setTimeout(f, 1000): Ejecuta la función f después de 1 segundo.
                            - setInterval(f, 1000): Ejecuta la función f cada segundo.
                        Con la función clearTimeout o clearInterval se puede cancelar la ejecución de la función f.

                        Los navegadores también permiten añadir persistencia a los scripts JavaScript. Esto se puede hacer de varias formas:
                            - localStorate: Permite almacenar datos en el navegador de forma persistente. Los datos se almacenan como pares clave-valor y se pueden recuperar posteriormente. Por ejemplo, localStorage.setItem("clave", "valor"); y localStorage.getItem("clave").
                            - sessionStorage: Similar a localStorage, pero los datos se eliminan al cerrar la pestaña o el navegador. Por ejemplo, sessionStorage.setItem("clave", "valor"); y sessionStorage.getItem("clave").

                        Los navegadores permiten añadir ventanas de Popup como:
                            - alert(mensaje): Muestra un cuadro de alerta con el mensaje especificado.
                            - confirm(mensaje): Muestra un cuadro de confirmación con el mensaje especificado. Devuelve true o false según la respuesta del usuario.
                            - prompt(mensaje): Muestra un cuadro de entrada con el mensaje especificado. Devuelve el valor introducido por el usuario o null si se cancela.
                        
                        Desde Javascript se pueden acceder a propiedades stule para cambiar el estilo CSS de los elementos HTML. Por ejemplo, document.getElementById("id").style.color = "red";.

                        Los navegadores también permiten lanzar peticiones AJAX para obtener datos de forma asíncrona. Esto se puede hacer de varias formas pero lo más común es usar fetch.
                      `, files: [] },
                    { title: 'Tipos', 
                      comment: `Este es el resumen de la materia desarrollada en clase. 
                        Javascript tiene 3 formas de declarar variables: var, let y const. La diferencia entre ellas es el ámbito de la variable. Las variables declaradas con var tienen un ámbito global o de función, mientras que las variables declaradas con let y const tienen un ámbito de bloque. Las variables declaradas con const no pueden ser reasignadas.
                        
                        Javascript tiene tipos primitivos como numeros, strings, booleanos, symbol, undefined, null y bigint. Los 3 primeros son los más comúnes:
                            - Números: Pueden ser enteros o decimales. Por ejemplo, 23, 3.14, -5, etc. Incluso Nan (Not a Number) y Infinity. Tienen una serie de métodos y librerías como:
                                - Math: Objeto que proporciona funciones matemáticas como Math.sqrt(), Math.pow(), Math.random(), etc.
                                - Number: Objeto que proporciona funciones para trabajar con números como Number.isInteger(), Number.isNaN(), Number.isFinite(), etc.
                                - n.toFixed(n): Método que devuelve una cadena con el número formateado con n decimales.
                                - n.tiPrent(): Método que devuelve el número redondeado hacia abajo.
                            - Strings: Cadenas de texto. Se pueden definir con comillas simples, dobles o backticks. Por ejemplo, "Hola", 'Hola', Hola. Tienen una serie de métodos como:
                                - length: Propiedad que devuelve la longitud de la cadena.
                                - indexOf(subcadena): Método que devuelve la posición de la primera aparición de la subcadena en la cadena. Devuelve -1 si no se encuentra.
                                - toUpperCase(): Método que convierte la cadena a mayúsculas.
                                - toLowerCase(): Método que convierte la cadena a minúsculas.
                                - Se pueden concatenar cadenas con el operador + o con el método concat(). Por ejemplo, "Hola" + " " + "mundo".
                            - Booleanos: Valores lógicos que pueden ser true o false. Se utilizan para realizar comparaciones y condiciones. Por ejemplo, 5 > 3 devuelve true y 5 < 3 devuelve false. Se pueden hacer varias operaciones como:
                                - !: Negación. Por ejemplo, !true devuelve false y !false devuelve true.
                                - &&: Y lógico. Por ejemplo, true && false devuelve false y true && true devuelve true.
                                - ||: O lógico. Por ejemplo, true || false devuelve true y false || false devuelve false.
                                - ==: Igualdad. Compara dos valores y devuelve true si son iguales. Por ejemplo, 5 == "5" devuelve true.
                                - ===: Igualdad estricta. Compara dos valores y devuelve true si son iguales y del mismo tipo. Por ejemplo, 5 === "5" devuelve false.
                                - !=: Desigualdad. Compara dos valores y devuelve true si son diferentes. Por ejemplo, 5 != "5" devuelve false.
                        
                        Javascript también tiene tipos de referencia como objetos, arrays y funciones. 

                      `, files: [] },
                    { title: 'Arrays y objetos', 
                      comment: `Este es el resumen de la materia desarrollada en clase. El índice de inicio es inclusivo y la cantidad es el número de elementos a eliminar.
                        Los objetos son colecciones de pares clave-valor donde el valor puede ser de cualquier tipo como strings, booleanos, numeros, arrays, objetos, funciones, etc. Se pueden definir de la siguiente forma:
                            var objeto = { clave1: valor1, clave2: valor2, ... };. Por ejemplo, var persona = { nombre: "Juan", edad: 23, ciudad: "Madrid" };.
                        Para acceder a los valores de un objeto se pueden usar dos formas:
                            - Notación de punto: objeto.clave. Por ejemplo, persona.nombre devuelve "Juan".
                                - Si el objeto esta anidado se puede acceder a los valores de la siguiente forma: objeto.clave1.clave2. Por ejemplo, persona.direccion.calle devuelve "Calle Mayor". Se puede usar encadenado opcional ?. para evitar errores si la clave no existe. Por ejemplo, persona?.direccion?.calle devuelve undefined si la clave no existe.
                            - Notación de corchetes: objeto["clave"]. Por ejemplo, persona["nombre"] devuelve "Juan".
                        Se puede borrar una clave de un objeto con el operador delete. Por ejemplo, delete persona.edad;.
                        Los objetos disponen de una serie de métodos como:
                            - Object.keys(objeto): Devuelve un array con las claves del objeto.
                            - Object.values(objeto): Devuelve un array con los valores del objeto.
                            - Object.entries(objeto): Devuelve un array con los pares clave-valor del objeto.
                        Existen 3 formas de clonar objetos:
                            - Object.assign({}, objeto): Clonado superficial
                            - { ...objeto }: Clonado superficial.
                            - JSON.parse(JSON.stringify(objeto)): Clonado profundo.
                        
                        Los arrays son colecciones de valores ordenados donde cada valor tiene un índice numérico. Se pueden definir de la siguiente forma:
                            var array = [valor1, valor2, ...];. Por ejemplo, var numeros = [1, 2, 3, 4, 5];.
                        Para acceder a los valores de un array se puede usar el índice numérico. Por ejemplo, numeros[0] devuelve 1. Para obtener el número total de elementos de un array se puede usar la propiedad length. Por ejemplo, numeros.length devuelve 5.
                        Los arrays tienen una serie de métodos como:
                            - push(valor): Añade un valor al final del array.
                            - pop(): Elimina el último valor del array y lo devuelve.
                            - reverse(): Invierte el orden de los elementos del array.
                            - sort(): Ordena los elementos del array.
                            - concat(array): Une dos o más arrays y devuelve un nuevo array.
                            - slice(inicio, fin): Devuelve una copia de una parte del array. El índice de inicio es inclusivo y el índice de fin es exclusivo.
                            - splice(inicio, cantidad, valor): Cambia el contenido de un array eliminando o reemplazando elementos existentes y/o agregando nuevos elementos en su lugar. Por ejemplo, numeros.splice(2, 2, 6, 7) elimina 2 elementos a partir del índice 2 y añade 6 y 7.
                            - join(separador): Une todos los elementos de un array en una cadena de texto. Por ejemplo, numeros.join(", ") devuelve "1, 2, 3, 4, 5".
                            - indexOf(valor): Devuelve el índice de la primera aparición del valor en el array. Devuelve -1 si no se encuentra.
                            - forEach(): Ejecuta una función para cada elemento del array. Por ejemplo, numeros.forEach(function(numero) { console.log(numero); });.
                            - map(): Crea un nuevo array con los resultados de aplicar una función a cada elemento del array. Por ejemplo, numeros.map(function(numero) { return numero * 2; }); devuelve [2, 4, 6, 8, 10].
                            - find(): Devuelve el primer elemento que cumple una condición. Por ejemplo, numeros.find(function(numero) { return numero > 3; }); devuelve 4.
                            - findIndex(): Devuelve el índice del primer elemento que cumple una condición. Por ejemplo, numeros.findIndex(function(numero) { return numero > 3; }); devuelve 3.
                            - filter(): Crea un nuevo array con los elementos que cumplen una condición. Por ejemplo, numeros.filter(function(numero) { return numero > 3; }); devuelve [4, 5].
                            - reduce(): Aplica una función a cada elemento del array y devuelve un único valor. Por ejemplo, numeros.reduce(function(acumulador, numero) { return acumulador + numero; }, 0); devuelve 15.
                        Al igual que los objetos, los arrays se pueden clonar de las mismas 3 formas.
                      `, files: [] },
                      { title: 'Estructuras de control', 
                        comment: `Este es el resumen de la materia desarrollada en clase. 
                            Javascript tiene una serie de estructuras de control como:
                                Estructuras de control de flujo:
                                    - if else: Permite ejecutar un bloque de código si se cumple una condición. Por ejemplo:
                                        if (condicion) {
                                            // Código a ejecutar
                                        } else {
                                            // Código a ejecutar si la condición no se cumple
                                        }
                                    - switch: Permite ejecutar un bloque de código según el valor de una variable. Por ejemplo:
                                        switch (variable) {
                                            case valor1:
                                                // Código a ejecutar si variable es igual a valor1
                                                break;
                                            case valor2:
                                                // Código a ejecutar si variable es igual a valor2
                                                break;
                                            default:
                                                // Código a ejecutar si variable no coincide con ninguno de los valores anteriores
                                        }
                                Estructuras iterativas:
                                    - for: Permite ejecutar un bloque de código un número determinado de veces. Existen 3 tipos de bucles for:
                                        - for (let i=0 ; i<10 ; i++) {sentencias}: Bucle for tradicional. Se ejecuta un número determinado de veces determinado por la condición.
                                        - for (let i of array) {sentencias}: Bucle for of. Se ejecuta para cada elemento del array. Por ejemplo, for (let numero of numeros) { console.log(numero); }.
                                        - for (let i in objeto) {sentencias}: Bucle for in. Se ejecuta para cada clave del objeto. Por ejemplo, for (let clave in persona) { console.log(clave); }.
                                    - while: Permite ejecutar un bloque de código mientras se cumpla una condición. El número de ejecuciones es indeterminado.                
                                    Los bucles además tienen funciones como break y continue. La función break permite salir del bucle y continuar la ejecución del código después del bucle. La función continue permite saltar a la siguiente iteración del bucle.

                                Estructuras de control de excepción:
                                    - try catch: Permite manejar errores en el código. Si se produce un error en el bloque try, se ejecuta el bloque catch. Por ejemplo:
                                        try {
                                            // Código a ejecutar
                                        } catch (error) {
                                            // Código a ejecutar si se produce un error
                                        } finally {
                                            // Código a ejecutar siempre, haya o no error
                                        }
                                    - throw: Permite lanzar un error de forma manual. Por ejemplo, throw new Error("Mensaje de error");.
                      `, files: [] },
                    { title: 'Funciones y clases', 
                        comment: `Este es el resumen de la materia desarrollada en clase. 
                            Las funciones son bloques de código que se pueden reutilizar. Una función se compone de:
                                - Nombre: Nombre de la función. Por ejemplo, function nombreFuncion() { // Código a ejecutar }.
                                - Parámetros: Variables que se pasan a la función. Por ejemplo, function nombreFuncion(parametros) { // Código a ejecutar }. El último parámetro puede ser un spread operator (...parametros) que permite pasar un número indeterminado de parámetros a la función. Por ejemplo, function nombreFuncion(...parametros) { // Código a ejecutar }.
                                - Cuerpo: Código que se ejecuta al llamar a la función. Por ejemplo, function nombreFuncion(parametros) { // Código a ejecutar }.

                            Se pueden definir de varias formas:
                                - Declaración de función: function nombreFuncion(parametros) { // Código a ejecutar }.
                                - Expresión de función: var nombreFuncion = function(parametros) { // Código a ejecutar };.
                                - Función Arrow: var nombreFuncion = (parametros) => { // Código a ejecutar };. La diferencia entre la función arrow y la normal es que la función arrow no tiene su propio this, por lo que se utiliza el this del contexto donde se define. Esto es útil para evitar problemas de contexto en funciones anidadas.
                            
                            Dentro de una función, this apunta al al objeto que llama a la función. Esto puede causar problemas si se usa this dentro de una función anidada. Para evitar esto, se puede usar el método bind() para crear una nueva función con un contexto específico. Por ejemplo, var nuevaFuncion = nombreFuncion.bind(objeto);. También se puede usar el operador arrow => para definir funciones anidadas que no tengan su propio this. Por ejemplo:

                            Las funciones tienen 3 métodos:
                                - bind(): Permite crear una nueva función con un contexto específico. Por ejemplo, var nuevaFuncion = nombreFuncion.bind(objeto);.
                                - call(): Permite llamar a una función con un contexto específico. Por ejemplo, nombreFuncion.call(objeto);.
                                - apply(): Similar a call(), pero permite pasar los parámetros como un array. Por ejemplo, nombreFuncion.apply(objeto, [parametros]);.

                            Las clases son plantillas para crear objetos. Se definen con la palabra clave class y pueden tener propiedades y métodos. Por ejemplo:
                                class NombreClase {
                                    constructor(parametros) {
                                        // Código a ejecutar al crear el objeto
                                    }
                                    metodo(parametros) {
                                        // Código a ejecutar al llamar al método
                                    }
                                }
                            Las instancias de una clase se crean con new.
                            Una clase puede heredar a otra clase usando la palabra clave extends. Por ejemplo:
                                
                                    class ClaseHija extends ClasePadre {
                                        constructor(parametros) {
                                            super(parametros); // Llama al constructor de la clase padre
                                            // Código a ejecutar al crear el objeto
                                        }
                                        metodo(parametros) {
                                            // Código a ejecutar al llamar al método
                                        }
                                    }
                            La clase hija heredará todas las propiedades y métodos de la clase padre. Además, se pueden sobrescribir los métodos de la clase padre en la clase hija. 

                      `, files: [] },
                    { title: 'Programación asíncrona', 
                        comment: `Este es el resumen de la materia desarrollada en clase. 
                            La programación síncrona ejecuta las instrucciones de forma secuencial, una tras otra. Esto puede causar problemas si una instrucción tarda mucho tiempo en ejecutarse, ya que bloqueará la ejecución del resto del código. Por ejemplo, si se hace una petición a un servidor y se espera a que responda antes de continuar con el resto del código.

                            JavaScript tiene un modelo de funcionamiento asíncrono y no bloqueante, con un bucle de eventos implementado con un único thread.  La programación asíncrona permite ejecutar instrucciones de forma no secuencial, lo que significa que se pueden ejecutar varias instrucciones al mismo tiempo. Esto se puede hacer de varias formas:
                                - Callbacks: Funciones que se pasan como parámetros a otras funciones y se ejecutan cuando se completa una tarea. Por ejemplo:
                                    function funcionAsincrona(callback) {
                                        // Código asíncrono
                                        callback(); // Llama a la función de callback cuando se completa la tarea
                                    }
                                - Promises: Objetos que representan el resultado de una operación asíncrona. Una promesa puede estar en 3 estados: pendiente, cumplida o rechazada. Se pueden encadenar varias promesas usando el método then(). Por ejemplo:
                                    function funcionAsincrona() {
                                        return new Promise((resolve, reject) => {
                                            // Código asíncrono
                                            if (exito) {
                                                resolve(resultado); // Resuelve la promesa si se completa la tarea
                                            } else {
                                                reject(error); // Rechaza la promesa si hay un error
                                            }
                                        }
                                    }

                                    Y luego para ejecutar la promesa se puede usar:
                                    funcionAsincrona().then(resultado => {
                                        // Código a ejecutar
                                        console.log(resultado);
                                    .catch(error => {
                                        // Código a ejecutar si hay un error
                                        console.log(error);
                                    }
                                - Async/Await: Sintaxis que permite escribir código asíncrono de forma más legible. Se basa en promesas y permite usar la palabra clave await para esperar a que se resuelva una promesa. Por ejemplo:

                      `, files: [] },
                    { title: 'Conceptos avanzados', 
                        comment: `Este es el resumen de la materia desarrollada en clase. 

                            Los módulos en ES6 permiten dividir el código en archivos separados y reutilizarlos en diferentes partes de la aplicación. Se pueden importar y exportar módulos usando las palabras clave import y export.

                            El objeto JSON permite trabajar con datos en formato JSON (JavaScript Object Notation). Se puede convertir un objeto JavaScript a JSON usando el método JSON.stringify() y convertir un JSON a un objeto JavaScript usando el método JSON.parse().

                            Los generadores son funciones que pueden pausar su ejecución manteniendo su estado. Se definen con la palabra clave function* y se utilizan con la palabra clave yield para guardar el estado de la función. Cuando ejecuta la función, se devuelve un objeto iterable que se ejecuta secuencialmente con el método next().

                            Las expresiones regulares son patrones que se utilizan para buscar y manipular cadenas de texto. Se definen entre barras (/) y se pueden usar con métodos como test() y exec(). Por ejemplo, /patron/.test(cadena) devuelve true si la cadena coincide con el patrón. Se suelen ejecutar junto con los métodos:
                             - match(): Devuelve un array con las coincidencias encontradas.
                             - matchAll(): Devuelve un array con todas las coincidencias encontradas.
                             - replace(): Reemplaza las coincidencias encontradas por otro valor.
                             - replaceAll(): Reemplaza todas las coincidencias encontradas por otro valor.
                             - search(): Devuelve el índice de la primera coincidencia encontrada.
                             - split(): Divide la cadena en un array según el patrón.

                            Además se suelen usar carácteres especiales que tienen un significado especial en las expresiones regulares. Algunos de los más comunes son:
                             - .: Coincide con cualquier carácter excepto el salto de línea.
                             - *: Coincide con 0 o más repeticiones del carácter anterior.
                             - \d: Coincide con un dígito (0-9).
                             - \D: Coincide con cualquier carácter que no sea un dígito.
                             - \w: Coincide con un carácter alfanumérico (letra o número).
                             - [abc]: Coincide con cualquiera de los caracteres entre los corchetes.
                      `, files: [] },
                    { title: 'Node.js', 
                        comment: `Este es el resumen de la materia desarrollada en clase. 
                            Node.js es un intérprete de Javascript que permite ejecutarlo fuera de un navegador. Al igual que javascript de cliente tiene una serie de APIs para manejar muchas funcionalidades desde los scripts JavaScript:
                            - process: Objeto que representa el proceso actual de Node.js. Permite acceder a información sobre el proceso, como el ID del proceso, la ruta del ejecutable, la versión de Node.js, etc. Tiene algunas propiedades y métodos como:
                                - argv: Array que contiene los argumentos pasados al script. Por ejemplo, process.argv[0] devuelve la ruta del ejecutable de Node.js y process.argv[1] devuelve la ruta del script.
                                - env: Objeto que contiene las variables de entorno del proceso. Por ejemplo, process.env.NODE_ENV devuelve el valor de la variable de entorno NODE_ENV.
                                - stdout: Objeto que representa la salida estándar del proceso. Permite escribir en la consola. Por ejemplo, process.stdout.write("Hola mundo");.
                                - stdin: Objeto que representa la entrada estándar del proceso. Permite leer datos de la consola. Por ejemplo, process.stdin.on("data", (data) => { console.log(data); });.
                                - exit: Método que permite salir del proceso. Por ejemplo, process.exit(0);.
                            - fs: Módulo que permite trabajar con el sistema de archivos. Permite leer, escribir, eliminar y manipular archivos y directorios. Por ejemplo, fs.readFile("archivo.txt", (error, datos) => { // Código a ejecutar });. Tiene dos formas de trabajar:
                                - Asincrona: fs.readFile("archivo.txt", (error, datos) => { // Código a ejecutar });.
                                - Sincrona: fs.readFileSync("archivo.txt");.
                            - Temporizadores: Permiten ejecutar código después de un tiempo determinado. Se pueden usar los mismos métodos que en el navegador: setTimeout(), setInterval(), clearTimeout() y clearInterval().
                            - HTTP: Módulo que permite crear servidores y clientes HTTP. Permite manejar peticiones y respuestas HTTP. Por ejemplo, http.createServer((req, res) => { // Código a ejecutar });.
                            - EventEmmiter: Módulo que permite crear y manejar eventos personalizados. Permite emitir y escuchar eventos. Por ejemplo, const EventEmitter = require("events"); const emisor = new EventEmitter(); emisor.on("evento", () => { // Código a ejecutar }); emisor.emit("evento");.
                            - Streams: Módulo que permite trabajar con flujos de datos. Permite leer y escribir datos de forma eficiente. Por ejemplo, const stream = require("stream"); const readable = new stream.Readable(); readable.push("Hola mundo"); readable.push(null);.
                            
                            Por otro lado, node dispone de un gestor de paquetes llamado npm que permite instalar y gestionar librerías y dependencias de forma sencilla. Se puede usar el comando npm install nombre_paquete para instalar un paquete y npm uninstall nombre_paquete para desinstalarlo. También se puede usar el comando npm init para crear un nuevo proyecto y generar un archivo package.json con la configuración del proyecto.
                            npm también permite gestionar scripts personalizados en el archivo package.json. Se pueden definir scripts personalizados en la sección scripts del archivo package.json. El fichero package.json tiene una serie de propiedades como:
                                - name: Nombre del proyecto.
                                - version: Versión del proyecto.
                                - description: Descripción del proyecto.
                                - main: Archivo principal del proyecto.
                                - scripts: Scripts personalizados del proyecto. Por ejemplo:
                                    "scripts": {
                                        "start": "node index.js",
                                        "test": "mocha test.js"
                                    }
                                - dependencies: Dependencias del proyecto. Por ejemplo:
                                    "dependencies": {
                                        "express": "^4.17.1",
                                        "mongoose": "^5.10.9"
                                    }
                                - devDependencies: Dependencias de desarrollo del proyecto. Por ejemplo:
                                    "devDependencies": {
                                        "mocha": "^8.2.1",
                                        "chai": "^4.2.0"
                                    }

                                Cuando se ejecuta npm install, estas dependencias se instalan en la carpeta node_modules del proyecto. Además, se genera un archivo package-lock.json que contiene la información de las dependencias instaladas y sus versiones exactas. Este archivo se utiliza para asegurar que el proyecto se instale con las mismas versiones de las dependencias en diferentes entornos.
                      `, files: [] },
                ]
            },
            

            {

                value: 'bbdd', label: 'bases de datos',

                subtopics: [

                    {

                        title: 'Bases de datos relacionales y ORM',

                        comment: `Este es el resumen de la materia desarrollada en clase. 

                        En este tema se cuenta de forma muy superficial que es una base de datos, y se enumeran algunos tipos de bases de datos.                       

                        Se explican algunos conceptos de las bases de datos relacionales:

                          - Que son la tablas en la bases datos, los registros y los campos.

                          - Que sopn las claves primarias y externas.

                          - Que es el lenguaje SQL (pero sin ver como se usa).                          

                        Se explica qué es un ORM (Object Relational Mapping):

                          - La correspondencia entre tablas y clases, registros e instancias, y columnas y propiedades.

                          - Es un sustituto en programación para no usar directamente SQL. `,

                        files: []

                    },



                    {

                        title: 'Sequelize',

                        comment: `Este es el resumen de la materia desarrollada en clase. 

                        Se explica en detalle Sequelize (un ORM para aplicaciones javascript y node) y su uso con SQLite:

                        Los detalles que se ven de Sequelize y SQLite son:

                          - Instalar los paquetes sqlite3, sequelize y sequelize-cli.

                          - Crear instancia de Sequelize usando una URL para indicar cual es la base de datos SQLite que se va a usar.

                          - Definir los modelos usando la clase Model de Sequelize.

                            * Usar las siguientes opciones al definir los campos de un modelo:  type, primaryKey, unique, allowNull, defaultValue, validate, autoIncrement, references, ...

                          - Uso de los métodos hasOne, belongsTo, hasMany y belongsToMany para definir las relaciones entre los modelos o tablas.

                            * Con estos métodos anteriores se han usado las siguientes opciones : as, foreignKey, otherKey, through, onDelete, onUpdate, ...

                          - Se ha explicado el uso del método sync para actualizar la base de datos siguiendo la definición del modelo hecho con sequelize. Se han explicado las opciones force y alter.

                          - Uso de los siguiente métodos para interactuar con los datos: build, save, create, update, destroy, findAll, findOne, findByPk, findOrCreate, count, ...

                            * Con los métodos anteriores se ha explicado el uso de las opciones where, offset, limit, order, ...

                            * Se ha explicado el uso de la opción include con los métodos findAll, findOne y findByPk para cargar de forma ansiosa los datos de varias tablas relacionadas.

                            * Se han explicado los métodos get*, set*, add*, has*, remove*, ... que se crean automáticamente cuando se definen las relaciones entre los modelos.

                        Se ha explicado el uso de migraciones y seeder uswwndo el paquete sequelize-cli:

                          - Se ha explicado como crear un fichero de migración.

                          - Se ha explicado como ejecutar una migración usando la opción --url.

                          - Se ha explicado como crear un fichero de seeder.

                          - Se ha explicado como ejecutar un seeder usando la opción --url.

                        `,
                        files: []
                    },
                    {

                        title: 'Aplicaciones para manejar BBDD',
                        comment: `Este es el resumen de la materia desarrollada en clase. 

                        Se presentan algunas aplicaciones y herramientas que permiten acceder y usar bases de datos SQLite (y otras).

                          - Se ha explicado el uso del comando sqlite3 que proporciona el sitio oficial de SQLite (https://www.sqlite.org).

                          - Se han enumerado otras aplicaciones disponibles: SQLiteStudio, DBeaver, DB Browser for SQLite, Liya.

                          - Se ha presentado la extensión SQLite Viewers del IDE Visual Studio Code para acceder a bases de datos.

                          - Se ha presentado una extensión incluida en el IDE WebStorm para acceder a bases de datos.
                        `,
                        files: []
                    }
                ]
            },
            {
                value: 'git',
                label: 'Git',
                subtopics: [
                    {
                        title: 'Concepto sobre gestión de versiones',
                        comment: `Este es el resumen de la materia desarrollada en clase. 

                        Se cuenta para que se necesita un sistema de gestión de versiones:

                          - Mantener un historial de todas las versiones desarrolladas de un proyecto.

                          - Poder volver a versiones anteriores del proyecto

                          - Trabajar en equipo.

                          - Sincronizar y fusionar cambios entre versiones.

                          - etc.

                        Y se introduce su funcionamiento usando git.
                        `,
                        files: []
                    },
                    {
                        title: 'Teoría de git',
                        comment: `Este es el resumen de la materia desarrollada en clase. 
                        Se cuentan conceptos básicos usados por git:

                           - Cómo se crea un proyecto nuevo o se clona uno ya existente.

                           - Qué es el area de trabajo.

                           - Qué es el  area stage o index donde se guardan los cambios a introducir en la nueva versión a crear.

                           - Qué es el repositorio donde se mantienen las versiones congeladas.

                           - Cómo se configura git.

                           - Cómo se hacen cambios y se registran en el area stage y cómo se congela una nueva versión.

                           - Cómo se ven los cambios en curso y los cambvios de las diferentes versiones congeladas.

                           - Uso de ramas.

                           - Cuál es la estructura de un árbol de commits.

                           - Qué es la referencia HEAD.

                           - Qué son los remotes.

                           - Qué es el remote llamado origin.

                           - Qué es una rama tracking.

                           - Cómo se descargan y se suben versiones a repositorios remotos.

                           - Cómo se fusionan ramas.
                        `,
                        files: []
                    },
                    {
                        title: 'Prácticas de git',
                        comment: `Este es el resumen de la materia desarrollada en clase. 
                        Todos los conceptos explicados de git se ponen en práctica usando los siguientes comandos:

                           - Para obtener ayuda: "git help COMANDO".

                           - Configurar nombre del desarrollador: "git config --global user.name NOMBRE".

                           - Configurar email del desarrollador: "git email --global user.name EMAIL".

                           - Inicializar un proyecto: "git init".

                           - Clonar un repositorio existente: "git clone URL".

                           - Añadir cambios del directorio de trabajo en el area stage: "git add FICHERO", "git rm FICHERO", "git mv FICHERO1 FICHERO2".

                           - Congelar una versión: "git commit".

                           - Rehacer una versión: "git commit --amend".

                           - Ver el estado de los ficheros del directorio de trabajo: "git status".

                           - Ver cambios en los ficheros del directorio de trabajo que aun no se han añadido al index: "git diff", "git diff FICHERO".

                           - Ver cambios añadidos al index y que irán en la próxima versión que se congele: "git diff --staged FICHERO".

                           - Ver el historial de versiones congeladas: "git log" .

                              * se explican las opciones: -numero --oneline y --graph.

                           - Eliminar las modificaciones realizadas en un fichero del directorio de trabajo, dejándolo igual que la versión del repositorio, y sin cambiarlo en el staged area: "git checkout -- FICHERO".

                           - Restaurar un fichero del directorio de trabajo con la versión existente en el staged area: "git restore -- FICHERO".

                           - Restaurar un fichero del staged area con la versión congelada en el repositorio (apuntada por HEAD): "git restore --staged -- FICHERO".

                           - Restaurar un fichero del directorio de trabajo y del staged area con la versión congelada en el repositorio (apuntada por HEAD): "git restore --staged --worktree -- FICHERO".

                           - Ver ramas existentes: "git branch".

                           - Crear una rama: "git branch NOMBRE_RAMA".

                           - Cambiar de rama: "git checkout NOMBRE_RAMA".

                           - Crear una rama y cambiarse a ella: "git checkout -b NOMBRE_RAMA".

                           - Incorporar a la rama actual los cambios realizados en otra rama: "git merge NOMBRE_RAMA".

                           - Borrar una rama: "git branch -d NOMBRE_RAMA", "git branch -D NOMBRE_RAMA".

                           - Ver los remotes creados: "git remote -v".

                           - Crear un remote: "git remote add NOMBRE_REMOTE URL".

                           - Borrar un remote: "git remote rm NOMBRE_REMOTE".

                           - Renombrar un remote: "git remote rename NOMBRE_VIEJO NOMBRE_NUEVO".

                           - Crear rama tracking: "git checkout -b NOMBRE_RAMA NOMBRE_REMOTE/NOMBRE_RAMA".

                           - Crear rama tracking: "git checkout --track NOMBRE_REMOTE/NOMBRE_RAMA".

                           - Crear rama tracking: "git push -u NOMBRE_REMOTE NOMBRE_RAMA".

                           - Bajar una rama de un remote: "git fetch NOMBRE_REMOTE NOMBRE_RAMA".

                           - Bajar una rama de un remote e integrarla en nuestra rama actual: "git pull NOMBRE_REMOTE NOMBRE_RAMA".

                           - Subir una rama a un remote: "git push NOMBRE_REMOTE NOMBRE_RAMA" (y usar la opción -f para forzar subida).
                        Git tiene muchas más funcionalidades básicas, pero solo se cuentas las descritas anteriormente. 
                        Así, no se cuentan los siguientes comandos de uso habitual: rebase, reset, cherry-pick, revert, stash, describe, show, ...
                        `,
                        files: []
                    }
                ]
            },

            {

                value: 'sockets',
                label: 'Sockets TCP',
                subtopics: [
                    {

                        title: 'Aplicaciones cliente-servidor',
                        comment: `Este es el resumen de la materia desarrollada en clase. 

                        Se realiza una descripción muy breve de lo que son las aplicaciones cliente-servidor.

                        Los servidores ofrecen un servicio al que acceden los clientes.

                        
                        Se explica que son aplicaciones en las que los clientes y servidores se comunican usando los protocolos TCP o UDP. 

                        Para usar estos protocolos, existen APIs. Una de estas API es la proporciona el interface de sockects a las aplicaciones.
                        
                        Se explica que los clientes y servidores corren en máquinas diferentes y usan la interfaz de sockets para comunicarse. 

                        Esta interfaz accede internamente a los protocolos UDP y TCP, que usan el protocolo IP para comunicarse a través de internet.
                        

                        Se explica qué es un puerto, y que los clientes y servidores se identifican en la máquina donde corren por medio del puerto que usan.

                        Así, la comunicación entre un cliente dado y un servidor dado se identifica por las direcciones IP donde corren el cliente y el servidor, más los números de puerto que usan.

                        Estos cuatro valores, las dos direcciones IP y los dos números de puerto, identifican al cliente y servidor que se están comunicando.
                        
                        Se explica que algunos servicios tienen asignado un número de puerto fijo por defecto. 

                        Así, el servicio HTTP usa el puerto 80, el servicio HTTPS usa el puerto 443, etc.

                        Organismos como IANA o IETF son los que ordenan la asignación de puertos de los servicios estándares.
                      

                        Se explica que los terminos cliente y servidor pueden interpretarse de forma diferente según el contexto donde se empleen.

                        Pueden referirse a la máquina donde se ejecutan, o referirse al programa que se esta ejecutando.                        

                        Se comenta qué son las aplicaciones P2P (Peer to Peer). Se explica que son aquellas en las que un mismo programa tiene ambos roles, el de cliente y el de servidor.
                        `,

                        files: []

                    },
                    {
                        title: 'Servicio TCP',
                        comment: `Este es el resumen de la materia desarrollada en clase. 
                        En este tema se cuentan algunos detalles sobre el servico que ofrece el protocolo TCP.

                        Se explica que:

                         - TCP ofrece un servicio orientado a conexión basado en circuitos virtuales.

                         - Los circuitos virtuales o conexiones TCP permiten intercambiar información de forma fiable entre sus extremos.

                           * Se garantiza la entrega de datos, pero a costa de aumentar el retardo porque tiene que retransmitir los paquetes perdidos.

                         - Estos circuitos virtuales o conexiones TCP identifica por los 2 puertos y las 2 direcciones IP de los extremos.

                           * Este identificador debe ser único en internet. No pueden existir dos identificadores iguales.

                         - En una máquina (cliente o servidor) pueden estar usándose muchos puertos simultáneamente por diferentes programas.

                           * Pero un puerto solo puede tener una conexión abierta.
                           
                       Se explican algunas diferencias entre los clientes y los servidores:

                         - El servidor es pasivo: Solo está esperando a que los clientes se conecten.

                         - El servidor es público: Tiene una dirección IP y un puerto conocidos donde los clientes se conectan.

                         - El cliente es el que inicia la conexión al servidor.

                         - Cada cliente tiene su propia dirección IP y puede usar un número de puerto aleatorio.
                        `,
                        files: []
                    },
                    {
                        title: 'Sockets TCP de cliente',
                        comment: `Este es el resumen de la materia desarrollada en clase. 

                        Se explica como se crea un sockets TCP desde el lado del cliente.

                        El socket de cliente envía una solicitud de conexión a un servidor (indicando IP y puerto del servidor) para crear un circuito virtual.

                        La solicitud de conexión se envía desde un puerto del cliente elegido al azar entre los no ocupados.

                        Si el servidor acepta la conexión, se establece el circuito virtual.

                        Una vez establecido se pueden enviar o recibir datos escribiendo o leyendo en el socket.
                       
                        Se explica que el módulo net de node.js exporta una clase llamada Socket para crear y usar sockets de cliente.

                        Se enumeran algunos de los elementos que ofrece la clase Socket:

                          - Métodos estáticos de la clase Socket: createConnection.

                          - Propiedades de las instancias de la clase Socket: remoteAddress.

                          - Métodos de las instancias de la clase Socket: connect, destroy, setTimeout, write.

                          - Eventos de la clase Socket: connect, data, end, close, error.

                         Se explica con ejemplos el uso del método createConnection para crear un socket, y el uso de los elementos anteriores para gestionar la comunicación.
                        `,
                        files: []
                    },
                    {
                        title: 'Sockets TCP de servidor',
                        comment: `Este es el resumen de la materia desarrollada en clase. 
                        Se explica como se crean y funcionan los sockets TCP servidores.

                        Un socket servidor se crea indicando cuál es el puerto donde va a aceptar las conexiones TCP.

                        Una vez creado un socket servidor:

                         - Siempre acepta la conexión de un cliente, salvo que esté saturado.

                         - Crea un socket de cliente para cada conexión establecida. 

                           * El programa servidor usa ese socket de cliente para comunicarse con el cliente.

                           * Se atienden a muchos clientes simultáneamente usando los sockets de cliente que conectan con cada uno de ellos.
                           
                        Se explica que el módulo net de node.js exporta una clase llamada Server para crear y usar sockets de servidor.

                        Se enumeran algunos de los elementos que ofrece la clase Server:

                          - Métodos estáticos de la clase Server: createServer.

                          - Propiedades de las instancias de la clase Server: maxConnections.

                          - Métodos de las instancias de la clase Server: listen, on, close, address.

                          - Eventos de la clase Server: connection, close, error.                         

                        Se explica con ejemplos el uso del método createServer para crear un socket, y el uso de los elementos anteriores para gestionar la comunicación.
                        `,
                        files: []
                    }
                ]
            },
            {
                value: 'servidoresweb',
                label: 'Servidores Web',
                subtopics: [
                    {
                        title: 'Opciones disponibles',
                        comment: `Este es el resumen de la materia desarrollada en clase. 

                        El desarrollo de un servidor web puede realizarse usando diferentres lenguajes de programación, y diferentes librerías y frameworks.


                        A nosotros veremos cómo se puede implementar un servidor web usando javcascript.

                        Para ello, se explica que existen varios paquetes npm que pueden usarse.


                        Se comenta que puede usarse el módulo net para crear los sockets TCP y programarse la logica del protocolo HTTP.

                        Esto sería un desarrollo a muy bajo nivel y es mejor usar otros paquetes de más alto nivel.


                        Se comenta que puede usarse el módulo http que ya gestiona las peticiones HTTP.

                        Sin embargo, existen opciones de más alto nivel que permiten simplificar más el desarrollo de estos programas.


                        Se comenta que el paquete Express es más adecuado para desarrollar un servidor web.

                        Express permite estructurar la arquitectura del program servidor organizando sus componentes, lo cuál permitre desarrollar un código más claro y mantenible.


                        También se comenta que existen otra opciones para desarrollar servidores web con javascript, como Sails, Loopback, Koa, Hapi, Meteor, ...

                        Pero estas opciones ocultan muchos detalles internos del desarrollo, y son menos recomendables desde un punto de vista didáctico para aprender como se hace el desarrollo de un servidor web.

                        Sin embargo, pueden ser muy recomendables cuando ya se domina este tema.
                        `,
                        files: []
                    },
                    {
                        title: 'Paquete net de node',
                        comment: `Este es el resumen de la materia desarrollada en clase. 

                        En este tema se ilusta con varios ejemplos el desarrollo de servidores web usando el paquete net de node. 

                        Primero se hace un ejemplo mínimo, un Hola Mundo, para ilustrar que debe crearse un socket TCP de servidor, aceptar las conexiones de los clientes, y programarse el soporte del protocolo HTTP.

                        El desarrollo de un servidor real es un trabajo muy grande, por lo que solo se implementa una parte muy básica e incompleta en este ejemplo.

                        Se justifica dado que el código que hay que desarrollar ya los proporcionan hecho otros paquetes, como por ejemplo http.


                        Luego se hace un ejemplo muy simplificado de un servidor web de páginas estáticas. 

                        En este ejemplo se lee el fichero que se indica en la URL de la peticion HTTP, y si existe se envía como respuesta al cliente.

                        Para este desarrollo se usan los elements explicados en el rtema anterior.
                        `,
                        files: []
                    },
                    {

                        title: 'Paquete http de node',
                        comment: `Este es el resumen de la materia desarrollada en clase. 
                        En este tema se ilusta con varios ejemplos el desarrollo de servidores web usando el paquete http de node. 
                       
                        Se implementan los mismos ejemplos que se desarrollaron con el paquete net de node.


                        Primero se desarrolla el servidor "Hola Mundo" que siempre responde con un mensaje hola mundo.

                        En este ejemplo se usa el metodo createServer que proporciona el paquete http.

                        Este método crea un servidor que atiende las peticiones de los clientes, y ejecuta una función callback para cada petición recibida.

                        Se explica que ya no es necesario procesar los datos que llegan del servidor para extraer las partes de los mensajes HTTP, ya que esto lo proporciona hecho el paquete http.
                        
                        Luego se desarrolla el servidor web de páginas estáticas. Se ilustra otra vez el uso del metodo createServer del paquete http.

                        Se ve como con este metodo usa una función callback para atender las peticiones de los clientes,
                        `,
                        files: []
                    },
                    {
                        title: 'Paquete express.js',
                        comment: `Este es el resumen de la materia desarrollada en clase. 
                        En este tema de describe el paquete Express.js.                       

                        Se explica que permite organizar el código a desarrollar para que esté más estructurado, sea más claro y fácil de mantener.

                        Se explica que sigue el patrón MVC (Model View Controller).                        

                        Se enumeran las características que proporciona. Las principales características que se tratan son:

                        - Uso de middlewares para trocear el código en elementos más pequeños que se encargen solo de una tarea., 

                        - Definición de rutas para atender las diferentes peticiones HTTP recibidas de los clientes.

                        - Soporte de múltiples motores de plantillas para la generación de  vistas, pero solo se explica el motor de vistas EJS.

                        En este tema se explican con detalle los siguientes puntos:

                        - Cómo se instala el paquete express.

                        - Los diferentes tipos de middlewares que se pueden desarrollar:

                          * middleware normal: "function(req,res,next)".

                          * middleware de error: "function(error,req,res,next)".

                          * middleware de parámetros de ruta: "function(req, res, next, valor, nombre)".

                          * middleware de rutas: Instancias de Router.

                        - Que el paquete express ya proporciona hechos muchos middlewares de interés general: body-parser, morgan, multer, ...

                        - Los detalles de los parámetros req, res y next usados en las funciones midleware.

                          * req es una instancia de la clase Request y se describen sus propiedades y métodos principales.

                          * res es una instancia de la clase Response y se describen sus propiedades y métodos principales.

                          * next es la función que hay que usar para pasar a otro middleware.

                        - Cómo se instalan los middlewares:

                          * usando app.use: proporcionando los middlewares a instalar y los paths a los que afectan.

                        - Dónde se definen las rutas:

                          * Directamente usando el objeto app (Application).

                          * Creando instancias de Router para agrupar las rutas que estén relacionadas entre si.

                        - Cómo se definen las rutas:

                          * Uso de los métodos de Routes y app: all, get, post, put, delete.

                          * Posibles formas de proporcionar el path de una ruta: strings, expresiones regulares, arrays.

                          * Uso de parámetros de ruta.

                        - Cómo se usan los parámetros de ruta:

                          * Creación usando el formato :NOMBRE, y proporcionado una expresion regular para indicar los valores válidos.

                          * Acceso al valor de los parámetros con app.param y router.param.

                        - Propiedades y métodos que proporciona la clase Request: params, query, body, cookie, ...

                        - Propiedades y métodos que proporciona la clase Response: status, type, send, render, redirect, ...

                        - Uso del motor de vistas EJS.

                          * Como se configura el uso de EJS en express.

                          * Uso de las etiquetas de marcado e inclusión de ficheros (vistas parciales).
                        `,
                        files: []
                    },
                    {
                        title: 'Aplicación express-generator',
                        comment: `Este es el resumen de la materia desarrollada en clase. 
                        Se explica que existe una aplicación npm llamada express-generator que permite crear el esqueleto inicial de una aplicación express.                        

                        Se explica cómo se instala, cómo se usa, y los ficheros que genera
                        `,
                        files: []
                    }
                ]
            },
            {
                value: 'miniproyecto1', label: 'Miniproyecto 1',
                subtopics: [
                    { title: 'Estructura proyecto express', comment: `Este es el resumen de la materia desarrollada en clase: - El fichero bin/www es el punto de entrada de un servidor en express. En el se crea el servidor y empieza a escuchar en el puerto configurado. 
                        - Fichero app.js es el módulo principal de la aplicación, donde se instalan todos los middlewares y los routers, incluye también la configuración del servidor estático de express y el middleware que atiende a los errores next(error) que renderiza la vista de error. Si la petición HTTP no devuelve ninguna respuesta existe un último middleware que genera un error 404. 
                        - Carpeta public incluye los ficheros accesibles por el servidor estático. 
                        - Carpeta routes tiene la configuración de los express.Router(). 
                        - Carpeta views se incluye las vistas, en este caso renderizadas con ejs (embedded JavaScript). 
                        - Carpeta controllers se incluyen los controladores. 
                        - Carpeta models se incluyen cada uno de los modelos definidos con Sequelize y el fichero models/index.js establece la conexión a la base de datos, importa los modelos y se declara las relaciones entre modelos. 
                        - Carpeta migrations tiene las migraciones de la base de datos definidas con Sequelize. 
                        - Carpeta seeders tiene los seeders de la base de datos definidos con Sequelize. 
                        - Carpeta node_modules incluye los paquetes instalados de node para el proyecto.
                        - El fichero package.json incluye la información, dependencias, y scripts del proyecto. `, files: [] },
                    { title: 'Comandos inicio proyecto express', comment: `Este es el resumen de la materia desarrollada en clase:  Para iniciar un proyecto de express desde cero hay que ejecutar los siguientes comandos:
                        - npm init -y : inicia el proyecto npm
                        - npm install express-generator
                        - npx express --view ejs nombreProyecto : crea el proyecto nombre Proyecto con motor de vistas ejs
                        - cd nombreProyecto
                        - npm install
                        - npm start 
                        Se puede instalar el módulo supervisor (npm install supervisor) y configurarlo en package.json para no tener que rearrancar el servidor para que los cambios sean visibles.`, files: [] },
                    { title: 'Favicon, layout y consentimiento de cookies', comment: `Este es el resumen de la materia desarrollada en clase: Favicon: El favicon es el icono de nuestra aplicación web que aparece en la pestaña del navegador. Para añadirlo es necesario instalar el módulo serve-favicon y configurarlo en app.js. La imagen con el favicon debe guardarse en la carpeta public.
                        Layout (marco): El layout es la plantilla que compartirán todas las vistas salvo error.ejs. Debe instalarse el paquete express-partials y configurarlo en app.js. El layout se define en views/layout.ejs. En el layout se definen las partes que compartirán todas las páginas (<head>, <header>, <footer>, esqueleto de la página HTML, declaración de los CSS a utilizar, etc.).
                        Consentimiento de cookies: La ley obliga a pedir consentimiento al usuario cuando se usan cookies. Para ello debemos de instalar el módulo cookieconsent y configurarlo en las vistas para que al usuario le aparezca el popup advirtiendo del uso de cookies`, files: [] }
                ]
            },
            {
                value: 'miniproyecto2', label: 'Miniproyecto 2',
                subtopics: [
                    { title: 'Crear modelos, migraciones y seeders', comment: `Este es el resumen de la materia desarrollada en clase: El comando para crear una migración es 'npx sequelize migration:create --name NameMigration'. El comando para crear un seeder 'npx sequelize seed:create --name SeedName'. Una vez el seeder o migración ha sido cumplimentado debe ejecutarse. 
                        - Comando 'sequelize db:migrate --url DatabaseURL' ejecuta todas las migraciones pendientes. Las migraciones ya ejecutadas se guardan en una tabla en la base de datos. Las migraciones ejecutadas no se vuelven a ejecutar. No se puede cambiar el contenido de una migración ya ejecutada porque no va a vovler a ejecutarla. Las migraciones se ejecutan por orden cronológico (el fichero de la migración incluye sigue el formato YYYYMMDDHHmmSS-NameMigration)
                        - Comando 'sequelize db:seed:all --url DatabaseURL' ejecuta todas los seeders. Los seeders ejecutados no se guardan en la base de datos, por lo que siempre se vuelven a ejecutar todos
                        - El modelo en Sequelize por defecto incluye las columnas id, UpdatedAt, CreatedAt. En las migraciones es necesario incluir esas columnas y las relaciones.`, files: [] },
                    { title: 'Mehtod-override', comment: `Este es el resumen de la materia desarrollada en clase: method-override es un middleware de Express que permite usar métodos HTTP como PUT, PATCH y DELETE en entornos donde solo se pueden enviar GET y POST, como en formularios HTML. Dado que los formularios solo soportan GET y POST, method-override intercepta las solicitudes y reemplaza el método original por el que especifiques, permitiendo así seguir una arquitectura RESTful incluso con formularios.
                        Para configurarlo, primero debes instalarlo con npm install method-override. Luego en tu aplicación Express, se configura como middleware antes de definir tus rutas. La forma más común es buscar un parámetro en la URL o en los campos del formulario, por ejemplo _method. Si encuentra ese campo, reemplazará el método de la solicitud por el valor que tenga.
                        Ejemplo: action="/recurso/1?_method=DELETE" method="POST" enviará un POST pero el servidor procesará la solicitud como si fuera un DELETE y así será procesado rutas 'router.delete' y no por 'router.post'`, files: [] },
                    { title: 'Primer CRUD', comment: `Este es el resumen de la materia desarrollada en clase: Para implementar un CRUD (CREATE, READ, UPDATE, DELETE) básico en Express debemos seguir los siguientes pasos:
                        1. Definir los endpoints utilizando los verbos adecuados y la estructura del endpoint adecuada. Por ejemplo, los endpoints de una aplicación de quizzes serían:
                        - GET /quizzes -> Mostrar índice o lista de quizzes
                        - GET /quizzes/:quizId -> Mostrar un quiz específico
                        - GET /quizzes/new -> Obtener un formulario para crear un quiz
                        - POST /quizzes - > Añadir un quiz a la tabla Quizzes
                        - GET /quizzes/:quizId/edit -> Obtener formulario para editar un quiz
                        - PUT /quizzes/:quizId -> Actualizar el quiz en la tabla Quizzes
                        - DELETE /quizzes/:quizId -> Borrar un quiz de la tabla Quizzes
                        2. Definir las migraciones y modelos necesarios. En nuestro ejemplo la migración que genere la tabla Quizzes y el modelo Quiz
                        3. Desarrollar las rutas en express. Crear o adaptar el router. En el ejemplo definir el router quizzes con los middlewares correspondientes
                        4. Desarrollar la lógica en los controladores. En los controladores es donde se definen las funciones que accederán a la base de datos, leerán, modificarán, crearán, o eliminarán las entidades y compondrán la respuesta HTTP.
                        5. Desarrollar la vista de respuesta para el usuario, la redirección, o la respuesta HTTP específica en cada caso.`, files: [] },
                    { title: 'Autoload', comment: `Este es el resumen de la materia desarrollada en clase: En rutas que acceden a un parámetro, como en el miniproyecto :quizId lo habitual es implementar un middleware de autoload. El middleware de autoload lo que hace es en las peticiones que contienen el param :quizId buscar el quiz con ese id en la base de datos, guardarlo en la variable req.load.quiz y propagar la petición a los siguientes middlewares ejecutando next() que tendrán disponible el quiz ya cargado desde la base de datos. El autoload ayuda a organizar el código.`, files: [] },
                    { title: 'Subir ficheros', comment: `Este es el resumen de la materia desarrollada en clase: 
                        1. En el cliente/navegador: Los ficheros se suben desde formularios HTML.
                        - Estos formularios deben usar la codificación multipart/form-data. Para ello, hay que añadir el atributo enctype="multipart/form-data" a las etiquetas form.
                        - Usar una etiqueta input de tipo file para que el formulario muestre un selector de ficheros.
                        2. En el servidor: Para extraer los datos y ficheros subidos en el body multipart se usa el paquete multer.
                        - Multer añade un objeto body y un objeto file o files en el objeto request (req) con los datos subidos por el formulario multipart.
                        - El paquete multer se instala ejecutando: npm install multer
                        - Multer lee el flujo de entrada req, y puede configurarse para guardar los ficheros subidos en ficheros, o mantenerlos en memoria. Los datos recibidos están disponibles en req.file.buffer. El MIME type de esos datos está disponible en req.file.mimetype.
                        3. Almacenamiento: Los ficheros subidos se pueden guardar en el sistema de ficheros, por ejemplo en la carpeta public si van a ser accesibles como estáticos. Otra opción es guardarlos en la base de datos. Para ello se puede utilizar el tipo de datos Sequelize.BLOB (Binary Large Objects)`, files: [] },
                        
                ]
            },
            {
                value: 'miniproyecto3', label: 'Miniproyecto 3',
                subtopics: [
                    { title: 'Inyección de código', comment: `Este es el resumen de la materia desarrollada en clase: La inyección de código es un problema de seguridad que aparece cuando generamos sentencias (para ejecutar) usando datos proporcionados por el usuario. os datos del usuario pueden contener fragmentos de sentencias SQL para borrar una base de datos, strings que al usarse en condiciones booleanas provocan una evaluación siempre verdadera, código javascript para inundar la pantalla de ventanas emergentes, etc. Estos datos pueden llegar al programa al rellenar los campos de un formulario, al recibir una petición HTTP, en una cookie, etc. Hay que validar los datos antes de procesarlos en el servidor. Es necesaria la validación en el servidor porque la validación en cliente no es segura. ORM como sequelize nos ayuda a evitar inyección de tipo SQL.`, files: [] },
                    { title: 'Paginación', comment: `Este es el resumen de la materia desarrollada en clase: La paginación es una técnica que se utiliza para dividir grandes cantidades de datos en partes más pequeñas llamadas páginas, para que el usuario no tenga que cargar o visualizar toda la información de golpe. Esto mejora la velocidad, la experiencia de usuario y el rendimiento de la aplicación. Existen dos formas comunes de implementar paginación: paginación en cliente y paginación en servidor. Aunque ambas tienen el mismo propósito, se aplican en momentos distintos y con impactos diferentes.
                        - Paginación en cliente: En la paginación en cliente, la aplicación descarga todos los datos desde el servidor de una sola vez y luego el cliente (navegador, app, etc.) se encarga de dividir y mostrar esos datos por partes. Facilita la legibilidad ppor parte del usuario. Si hay demasiados datos, puede saturar la memoria del cliente. 
                        - Paginación en servidor: En la paginación en servidor, el cliente solo solicita una parte específica de los datos (por ejemplo, "dame la página 3") y el servidor se encarga de buscar y devolver solo ese conjunto. Normalmente, esto se controla mediante parámetros como limit y offset o page y size en las URLs. Por ejemplo en el miniproyecto 3, la URL /quizzes?pageno=2 indica que se quiere la segunda página. El servidor calcula el offset y el limit y devuelve solo esos datos.
                        En la página HTML y javascript de cliente se suelen incluir una botonera con el número de páginas o un botón de página anterior y página siguiente`, files: [] },
                    { title: 'Filtro de búsqueda', comment: `Este es el resumen de la materia desarrollada en clase: Un filtro de búsqueda es una funcionalidad que permite al usuario buscar datos específicos dentro de una base de datos, normalmente introduciendo un texto en un campo tipo text. En el miniproject la búsqueda se configura en el endpoint GET quizzes?search=textoBusqueda y permite filtrar los quizzes por el campo question. El controller realiza los siguientes pasos: 
                        1. Extrae el parámetro search de query con el texto del patrón de búsqueda.
                        2. Sustituye en el patrón de búsqueda los blancos (uno o más seguidos) por %. Por ejemplo si se ha tecleado "capital ia", quedará %capital%ia%
                        3. Utilizar un filtro con el operador [Op.like] que busca patrones donde % encaja con cualquier carácter sobre la columna question de la tabla Quizzes. %capital%ia% encaja con cualesquiera letras seguidas de capital, seguidas de cualesquiera letras, seguidas de ia, seguidas de cualesquiera letras  
                        4. Devuelve la vista quizzes/index.ejs pasándole solo los quizzes que cumplen el filtro`, files: [] },
                    { title: 'Gestión de Estado', comment: `Este es el resumen de la materia desarrollada en clase: HTTP es un protocolo sin estado (stateless) y no permite guardar datos entre transacciones. Para guardar el estado usaremos sesiones. Las sesiones permiten guardar datos en el servidor para que estén accesibles para las siguientes transacciones de cada cliente. Cada cliente tiene su propia sesión. El paquete express-session proporciona soporte de sesiones.
                        Por defecto, las sesiones se almacenan en una base de datos en memoria (Redis). Pero se puede configurar para guardarlas en las cookies, en una base de datos externa, parámetro de ruta, etc. Para almacenar los datos de las sesiones en una base de datos externa, se puede usar el paquete connect-session-sequelize. En la asignatura guardamos la sesión en la base de datos en una tabla llamada Sessions. 
                        Los datos guardados en la sesión se manejan usando el objeto req.session y en una cookie el cliente envía el id de su sesión. Cada vez que llega una petición HTTP de un cliente, el servidor recupera el estado de ese cliente de la base de datos, y lo deja disponible en req.session. Cada cliente envía un identificador único para indicar cuál es su sesión o estado particular. Ese identificador es una cookie cifrada, llamada connect.sid. Cada vez que se envía la respuesta HTTP, el servidor guarda el estado actual del usuario en la BBDD.
                        Ejemplo de uso:
                        - Guardar un valor en la sesión: req.session.temperatura = 25.4
                        - Recuperar ese valor de la sesión: let temp = req.session.temperatura`, files: [] },
                    { title: 'Mensajes flash', comment: `Este es el resumen de la materia desarrollada en clase: Los mensajes de Flash son mensajes que el servidor guarda en la sesión mientras atiende las peticiones HTTP recibidas de un cliente, y que mostrará en la próxima vista generada. Su uso surge cuando al procesar una petición HTTP del cliente hay redirecciones pues los mensajes informativos generados en la peticiones HTTP anteriores se pierden dado que HTTP no tiene estado. Solución usar mensajes flash: 1. Guardar estos mensajes en la sesión (req.session) para que no se pierdan, y recuperarlos en la siguiente respuesta HTTP que envíe una vista al cliente. 2. La vista mostrará todos los mensajes pendientes almacenados. Módulo express-flash configurado en app.js. Las vistas puedan acceder a los mensajes de flash a través de res.locals.messages. Los mensajes de flash se crean y se guardan en la sesión agrupados por tipos usando la llamada: req.flash(tipo, msg)
                        Ejemplos: req.flash('error', 'Mensaje de error.'); // Mensaje de tipo error
                        req.flash('info', 'Mensaje de información.'); // Mensaje de tipo informativo
                        req.flash('success', 'Mensaje de éxito.'); // Mensaje de tipo éxito.
                        Los mensajes de flash se sacan de la sesión accediendo a res.local.messages.
                        Es necesario modificar las vistas si se quieren pintar los mensajes flash.`, files: [] },
                ]
            },
            {
                value: 'miniproyecto4', label: 'Miniproyecto 4',
                subtopics: [
                    { title:  'Autenticación en express', comment: `Este es el resumen de la materia desarrollada en clase: Implementación de un formulario de login. Para ello se implementa la ruta GET /login que devuelve el formulario con campos user y password. POST /login crea la sesión de login. Busca un usuario dado su nombre y su password. Si no existe el usuario, devuelve null. Si el password es incorrecto, devuelve null. Si el password es correcto entonces se crea un objeto en la sesión con los datos del usuario logueado: req.session.loginUser. Los datos guardado en la sesión son las propiedades de req.session. Un usuario está loqueado si existe req.session.loginUser. Si no existe req.session.loginUser, entonces no hay nadie logueado.`, files: [] },
                    { title: 'Passwords seguras', comment: `Este es el resumen de la materia desarrollada en clase: Cuando un usuario se registra o inicia sesión en una aplicación, es fundamental que su contraseña no se guarde en texto plano en la base de datos, ya que si esa información se filtrara, cualquier persona podría acceder a las cuentas de los usuarios. Por eso, lo correcto es cifrar o encriptar las contraseñas antes de guardarlas. Utilizamos el módulo crypto para esta tarea. El paquete crypto permite transformar la contraseña original en un hash, que es un valor irreconocible y fijo que representa la contraseña original, pero que no se puede revertir fácilmente.
                        Cifrar la contraseña significa aplicar una función matemática que transforma la contraseña en una cadena de texto diferente y segura. Esa cadena es la que se guarda en la base de datos, y no la contraseña real. Cuando el usuario intenta iniciar sesión, lo que se hace es aplicar el mismo cifrado a la contraseña que acaba de introducir y comparar el resultado con el valor almacenado en la base de datos. Si coinciden, es la misma contraseña.
                        Se añade salt a la password en claro. Salt es una cadena aleatoria de caracteres que se añade a una contraseña antes de ser cifrada (hasheada). Esto mejora la seguridad al hacer que sea más difícil para los atacantes descifrar las contraseñas, incluso si conocen el hash de una contraseña.`, files: [] },
                    { title: 'Logout', comment: `Este es el resumen de la materia desarrollada en clase: En las aplicaciones web que usan sesiones para gestionar la autenticación, es importante no solo permitir el inicio de sesión, sino también ofrecer una forma de cerrar sesión de manera segura. Esto se logra a través del proceso conocido como logout. Cuando un usuario hace logout, lo que realmente sucede es que la información que identifica al usuario dentro de la sesión (req.session.loginUser)
                        Además del logout manual, las aplicaciones pueden protegerse aún más usando una expiración automática de la sesión. Esto se controla añadiendo un valor de fecha de expiración: expires: Date.now() + maxIdleTime Donde maxIdleTime es el tiempo máximo que la sesión puede permanecer inactiva (por ejemplo, 30 minutos). Con cada nueva petición que el usuario realice, la fecha de expiración se renueva de nuevo, extendiendo el tiempo de vida de la sesión. Esto significa que mientras el usuario siga interactuando con la aplicación, la sesión permanecerá activa. Sin embargo, si pasa más tiempo del permitido sin realizar ninguna petición, la sesión caducará automáticamente, y el usuario deberá volver a iniciar sesión.`, files: [] }
                ]
            },
            {
                value: 'miniproyecto5', label: 'Miniproyecto 5',
                subtopics: [
                    { title: 'Concepto autorización vs autenticación', comment: `Este es el resumen de la materia desarrollada en clase: Autenticación es el proceso de verificar la identidad de un usuario. En esta etapa, la aplicación comprueba si la persona es quien dice ser, normalmente solicitando un nombre de usuario y una contraseña (o cualquier otro método, como tokens o huellas digitales). Si las credenciales son válidas, se considera que el usuario está autenticado.
                        Autorización, en cambio, es el proceso que determina qué acciones o recursos puede usar un usuario una vez que ya ha sido autenticado. Es decir, no solo importa quién eres, sino también qué tienes permitido hacer dentro de la aplicación. Por ejemplo, un usuario autenticado puede acceder a su perfil, pero solo un usuario con autorización de administrador podría eliminar cuentas de otros usuarios. Los permisos se suelen asignar a través de roles. Un usuario puede tener más de un rol.`, files: [] },
                    { title: 'Autorización en express', comment: `Este es el resumen de la materia desarrollada en clase: En el miniproyect de quizzes se han definido tres niveles de permisos: usuario loggeado, admin, autor de un quiz. Se han definido tres middlewares de protección: 1. loginRequired: comprueba si existe req.sessoin.loginUser 2. adminOrMyselfRequired: comprueba si el usuario loggeado es administrador o si el usuario loggeado coincide con el usuario al que se está accediendo el prefil. 3. adminOrAuthorRquired: comprueba si el usuario loggeado es el administrador o es el mismo que el autor del quiz que se quiere editar. La autorización se implementa protegiendo cada una de las rutas. Por ejemplo: router.delete('/:quizId(\\d+)', quizController.adminOrAuthorRequired, quizController.destroy); protege la eliminación de un quiz. Para ello quizController.adminOrAuthorRequired comprueba si el usuario es Admin o si es el autor del quiz. Si tiene permiso ejecuta next() y se ejecuta el middleware quizController.destroy. Si no tiene permiso responde una petición HTTP con código 403`, files: [] },
                ]
            }            
        ]
    },
    TECW: {
        name: 'Tecnologías Web',
        topics: [
            {
                value: 'http', label: 'HTTP',
                subtopics: [
                    { title: 'URLs', comment: '', files: [] },
                    { title: 'Formato peticiones HTTP', comment: '', files: [] },
                    { title: 'Cabeceras HTTP', comment: '', files: [] },
                    { title: 'Métodos POST, PUT, GET, DELETE, HEAD', comment: '', files: [] },
                    { title: 'Códigos de respuesta', comment: '', files: [] },
                    { title: 'Caché web', comment: '', files: [] },
                    { title: 'Gestión de estado: parámetros ocultos, cookies, sesión', comment: '', files: [] }
                ]
            },
            {
                value: 'html', label: 'HTML',
                subtopics: [
                    { title: 'Estructura básica de un documento HTML', comment: '', files: [] },
                    { title: 'Atributos HTML', comment: '', files: [] },
                    { title: 'Id y clase HTML', comment: '', files: [] },
                    { title: 'Etiquetas de texto', comment: '', files: [] },
                    { title: 'Etiquetas de hipervínculo', comment: '', files: [] },
                    { title: 'Etiquetas de imagen', comment: '', files: [] },
                    { title: 'Etiquetas de lista', comment: '', files: [] },
                    { title: 'Tablas', comment: '', files: [] },
                    { title: 'Formularios', comment: '', files: [] },
                    { title: 'Etiquetas de audio y video', comment: '', files: [] }
                ]
            },
            {
                value: 'css', label: 'CSS',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Sintaxis básica', comment: '', files: [] },
                    { title: 'Selectores y prioridad', comment: '', files: [] },
                    { title: 'Modelo de caja: margin, padding, border', comment: '', files: [] },
                    { title: 'Unidades de medida', comment: '', files: [] },
                    { title: 'Posicionamiento', comment: '', files: [] },
                    { title: 'Display y visibility', comment: '', files: [] },
                    { title: 'Flexbox', comment: '', files: [] },
                    { title: 'Grid', comment: '', files: [] },
                    { title: 'Float y clear', comment: '', files: [] },
                    { title: 'Diseño responsive', comment: '', files: [] },
                    { title: 'Media queries', comment: '', files: [] },
                    { title: 'Variables CSS', comment: '', files: [] }
                ]
            },
            {
                value: 'javascript_cliente', label: 'JavaScript Cliente',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Eventos y manejo de eventos', comment: '', files: [] },
                    { title: 'DOM y manipulación del DOM', comment: '', files: [] },
                    { title: 'Objeto document y window', comment: '', files: [] },
                    { title: 'Temporizadores', comment: '', files: [] },
                    { title: 'SessionStorage y LocalStorage', comment: '', files: [] },
                    { title: 'Alert, confirm y prompt', comment: '', files: [] },
                    { title: 'AJAX y fetch API', comment: '', files: [] }
                ]
            },
            {
                value: 'javascript', label: 'Lenguaje JavaScript',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Sintaxis básica', comment: '', files: [] },
                    { title: 'Tipos de datos', comment: '', files: [] },
                    { title: 'Const, let, var', comment: '', files: [] },
                    { title: 'Funciones', comment: '', files: [] },
                    { title: 'Paso por referencia vs paso por valor', comment: '', files: [] },
                    { title: 'Tipos primitivos', comment: '', files: [] },
                    { title: 'Objetos JavaScript', comment: '', files: [] },
                    { title: 'Clases y herencia', comment: '', files: [] },
                    { title: 'Notación de puntos y corchetes', comment: '', files: [] },
                    { title: 'Clonado de objetos', comment: '', files: [] },
                    { title: 'Notación arrow', comment: '', files: [] },
                    { title: 'This, bind, call, apply', comment: '', files: [] },
                    { title: 'Closures', comment: '', files: [] },
                    { title: 'Modo estricto', comment: '', files: [] },
                    { title: 'Modulos ES6 y CommonJS', comment: '', files: [] },
                    { title: 'Métodos de arrays (forEach, map, filter, reduce)', comment: '', files: [] },
                    { title: 'Asincronía: callbacks, promesas, async/await', comment: '', files: [] },
                    { title: 'Manejo de errores', comment: '', files: [] },
                    { title: 'JSON', comment: '', files: [] }
                ]
            },
            {
                value: 'node', label: 'Node',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Process', comment: '', files: [] },
                    { title: 'NPM y versionado paquetes', comment: '', files: [] },
                    { title: 'File System', comment: '', files: [] },
                    { title: 'Sistema de archivos', comment: '', files: [] },
                    { title: 'Streams', comment: '', files: [] },
                    { title: 'Eventos', comment: '', files: [] },
                    { title: 'package.json', comment: '', files: [] }
                ]
            },
            {
                value: 'sequelize', label: 'ORM: Sequelize',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Ventajas y desventajas', comment: '', files: [] },
                    { title: 'Conexión a la base de datos', comment: '', files: [] },
                    { title: 'Modelos', comment: '', files: [] },
                    { title: 'Migraciones', comment: '', files: [] },
                    { title: 'Streams', comment: '', files: [] },
                    { title: 'Consultas', comment: '', files: [] },
                    { title: 'Asociaciones', comment: '', files: [] }
                ]
            },
            {
                value: 'express', label: 'Express',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Estructura del proyecto', comment: '', files: [] },
                    { title: 'Rutas', comment: '', files: [] },
                    { title: 'Middleware', comment: '', files: [] },
                    { title: 'Manejo de errores', comment: '', files: [] },
                    { title: 'Manejo de archivos', comment: '', files: [] },
                    { title: 'Manejo de formularios', comment: '', files: [] },
                    { title: 'Manejo de cookies', comment: '', files: [] },
                    { title: 'Manejo de sesiones', comment: '', files: [] },
                    { title: 'Manejo de peticiones HTTP', comment: '', files: [] },
                    { title: 'Manejo de respuestas', comment: '', files: [] },
                    { title: 'Paginación', comment: '', files: [] },
                    { title: 'Embed Javascript (EJS)', comment: '', files: [] },
                    { title: 'Mensajes flash', comment: '', files: [] },
                    { title: 'Autenticación', comment: '', files: [] },
                    { title: 'Autorización', comment: '', files: [] }
                ]
            }

        ]
    },
    BBDD: {
        name: 'Bases de Datos No Relacionales',
        topics: [
            {
                value: 'intro_nosql', label: 'Introducción a NoSQL',
                subtopics: [
                    { title: 'las 5 Vs del Big Data', comment: 'Este es el resumen de la materia desarrollada en clase. Volumen: se refiere al gran cantidad de datos que se generan y se recopilan en un sistema de big data. Estos datos pueden provenir de fuentes internas, como bases de datos de una empresa, o externas, como las redes sociales. Variedad: se refiere a la diversidad de tipos de datos que se manejan en un sistema de big data. Estos datos pueden ser estructurados, como las bases de datos relacionales, o no estructurados o semiestructurados, como los datos que se usan en las bases de datos no relacionales, incluso en formato de texto libre o imágenes. Velocidad: se refiere a la capacidad de un sistema de big data para procesar y analizar grandes cantidades de datos en tiempo real. Esto es importante para poder tomar decisiones en tiempo real y adaptarse rápidamente a los cambios en el mercado. Veracidad: se refiere a la confiabilidad y exactitud de los datos que se recopilan y utilizan en un sistema de big data. Es importante tener datos confiables para poder realizar análisis precisos y tomar decisiones correctas. Valor: se refiere al beneficio que se puede obtener al analizar y utilizar los datos en un sistema de big data. El análisis de datos puede ayudar a una empresa a mejorar su eficiencia, aumentar sus ingresos y tomar decisiones estratégicas.', files: [] },
                    { title: 'Data LifeCycle Management', comment: 'Este es el resumen de la materia desarrollada en clase. 1. Generación (creación o captura) de datos. 2. Almacenamiento y protección. 3. Uso. 4. Archivo. 5. Destrucción', files: [] },
                    { title: 'Data Value Pyramid', comment: 'Este es el resumen de la materia desarrollada en clase. La pirámide de valor de los datos representa cómo los datos aumentan de valor a medida que se transforman y procesan. Está dividida en cinco niveles que reflejan la progresión desde la recopilación de datos básicos hasta la toma de decisiones basada en esos datos. El primer nivel es Records (Registros), donde los datos se recopilan y se muestran en su forma bruta. Este nivel corresponde a la simple recolección de datos (Raw Data Gathering), como por ejemplo almacenar datos en una base de datos o en un archivo CSV. El segundo nivel es Charts (Gráficos), donde los datos se limpian, agregan y visualizan para hacerlos más comprensibles. Un ejemplo sería la creación de gráficos o tablas que faciliten la interpretación de la información. El tercer nivel es Reports (Informes), donde se analizan los datos para identificar patrones, estructuras y relaciones. Este análisis permite generar informes con información estructurada que facilite la toma de decisiones. El cuarto nivel es Predictions (Predicciones), donde se aplican métodos de aprendizaje e inferencia para generar recomendaciones o predicciones basadas en los datos analizados. Esto permite obtener información procesable para anticipar comportamientos futuros. Finalmente, el quinto nivel es Actions (Acciones), donde se toman decisiones y se ejecutan acciones basadas en la información obtenida de las predicciones. En este nivel, se extrae el valor real de los datos mediante la automatización de decisiones o la implementación de estrategias basadas en las recomendaciones obtenidas. La pirámide muestra cómo los datos evolucionan desde simples registros hasta información valiosa que puede guiar la toma de decisiones estratégicas, aumentando su valor en cada nivel. ', files: [] },
                    { title: 'Sistema Distribuido, Particionamiento y Replicación', comment: 'Este es el resumen de la materia desarrollada en clase. Un sistema distribuido es una colección de máquinas independientes que aparecen ante el usuario del sistema como una única máquina. Hay tres principales razones por las que se puede querer distribuir una base de datos en varias máquinas: 1. Escalabilidad. Si el volumen de datos, la carga de lectura o la carga de escritura crece más de lo que una sola máquina puede manejar, podemos distribuir la carga a través de múltiples máquinas. 2. Tolerancia a los fallos/alta disponibilidad. Si la aplicación necesita seguir funcionando incluso si una máquina (o varias máquinas, o la red, o un centro de datos entero) se cae, podemos utilizar múltiples máquinas para tener redundancia. Cuando una falla, otra puede tomar el relevo. 3. Latencia. Si tenemos usuarios en todo el mundo, es posible que queramos tener servidores en diferentes localizaciones de manera que cada usuario pueda ser atendido desde un centro de datos que esté geográficamente cerca de ellos. Esto evita que los usuarios tengan que esperar a que los paquetes de red viajen por medio mundo. Ventajas y desventajas. Un sistema distribuido tiene varias ventajas: Escalabilidad, Tolerancia a los fallos/alta disponibilidad y Latencia. Desventajas o problemas: Concurrencia, ya que cada ordenador de la red ejecuta eventos de forma independiente y al mismo tiempo que los otros, Falta de un reloj global, Dificultad de gestión y administración, Seguridad, Dependencia de la Red, Más Hardware (y además heterogéneo), Detectar fallos, gestionar fallos, mitigar fallos, recuperar el sistema.', files: [] },
                    { title: 'Teorema CAP (Consistency, Availability, Partition Tolerance)', comment: 'Este es el resumen de la materia desarrollada en clase. El teorema de CAP también se llama Teorema de Brewer. Dice lo siguiente es imposible para un sistema computacional distribuido ofrecer simultáneamente las siguientes tres garantías: Consistencia (Consistency) – todos los nodos ven los mismos datos al mismo tiempo. Siempre que un dato es actualizado, todos los usuarios tienen acceso a esa última versión. Disponibilidad (Availability)  – garantiza que cada petición recibe una respuesta acerca de si tuvo éxito o no. Cualquier operación puede ser ejecutada sin demora. Tolerancia a la partición (Partition) – los datos son distribuidos a través de dos o más nodos de la red y el sistema puede seguir funcionando, incluso, cuando algunos de estos nodos son totalmente inaccesibles (network partition).', files: [] },
                    { title: 'ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad)', comment: 'Este es el resumen de la materia desarrollada en clase. ACID son las siglas de Atomicidad, Consistencia, aIslamiento y Durabilidad. Una secuencia de operaciones (transacción): Se ejecutará del todo o nada (A). na vez completada, la BD quedará en un estado en el que no se viola ninguna restricción de integridad (C). Las transacciones concurrentes son independientes y no se afectan unas a otras (I). Las modificaciones efectuadas por una transacción podrán recuperarse ante fallas del sistema (D)', files: [] }
                ]
            },
            {
                value: "json", label: "JSON y JSON Schema",
                subtopics: [
                    { title: "Estructura de un documento JSON", comment: "Este es el resumen de la materia desarrollada en clase. JSON son las siglas de JavaScript Object Notation. JSON es un formato ligero de representación, almacenamiento e intercambio de datos  independiente de cualquier lenguaje de programación. Tiene forma de texto plano, de simple de lectura, escritura y generación. Un documento JSON está compuesto por pares clave-valor, donde las claves son cadenas y los valores pueden ser de distintos tipos como números, cadenas, objetos, arrays, booleanos o nulos. Un aspecto en el que se ha insistido en clase es que un objeto es un conjunto no ordenado de pares clave-valor y un array es un conjunto ordenado de valores.", files: [] },
                    { title: "Tipos de datos JSON", comment: "Este es el resumen de la materia desarrollada en clase. JSON admite varios tipos de datos: números, cadenas, booleanos (true/false), objetos, arrays y nulos. Cada tipo de dato permite estructurar la información de manera flexible. En JSON, un array es una lista ordenada de valores y un objeto es una colección de pares clave-valor. Un aspecto en el que se ha insistido en clase es que un objeto es un conjunto no ordenado de pares clave-valor y un array es un conjunto ordenado de valores.", files: [] },
                    { title: "Que es JSON Schema y para que sirve", comment: "Este es el resumen de la materia desarrollada en clase. JSON Schema es un vocabulario para definir la estructura y validación de documentos JSON. Permite asegurar que los datos JSON sigan una estructura predefinida así como documentarlos ya que JSON no admite añadir comentarios. La diferencia entre un documento bien formado y un documento válido es que si decimos que está bien formado es que el formato es JSON y si decimos que es válido es que valida contra un JSON schema.", files: [] },
                    { title: "Estructura de un documento JSON Schema", comment: "Este es el resumen de la materia desarrollada en clase. Un documento JSON Schema define las propiedades, tipos y restricciones de los datos JSON, facilitando la validación y el cumplimiento de formatos específicos así como su documentación. El JSON Schema tiene keywords, que son cualquier propiedad que aparece en el JSON Schema. Hay keywords especiales como ‘$id, $schema, $comment’, Annotation keywords y Validation keywords. Las Anotations keywords ‘title’ y ‘description’ son sólo descriptivas. No añaden restricciones a los datos que se validan. La intención del esquema se establece con estas dos palabras clave. Luego las tres principales Validation keywords son ‘type’ para indicar el tipo de datos que se espera (normalmente Object si estoy en el primer nivel), ‘properties’ para indicar la estructura de las propiedades que debe tener el JSON que estamos validando y ‘required’ para indicar qué propiedades son obligatorias. Dentro del type string el campo ‘format’ se usa para indicar el tipo semántico de un valor de tipo string, como fechas, correos electrónicos o URLs.", files: [] }
                ]
            },
            {
                value: "schema_design", label: "Schema Design en NoSQL y en MongoDB",
                subtopics: [
                    { title: "Modelo de datos no relacional o NoSQL", comment: "Este es el resumen de la materia desarrollada en clase. Un modelo de datos NoSQL se basa en la flexibilidad para almacenar y procesar datos no estructurados o semiestructurados, usando documentos, pares clave-valor, columnas o grafos. ¿Cuándo necesito NoSQL? CUANDO TENGO DATOS NO RELACIONALES, NO ESTRUCTURADOS O SEMIESTRUCTURADOS Y adicionalmente se puede dar uno o varios de los siguientes: Si el volumen de datos es muy muy grande y necesito escalabilidad horizontal. Si busco una alta disponibilidad o tolerancia a fallos o muy baja latencia (lo que implicaría distribuir mi sistema). Si genero muchos datos temporales que no corresponden al almacén de datos principal (carritos de compra, personalización de portales, logs, datos de temperatura, posiciones, etc.). Si mi BBDD ha sido desnormalizada (el esquema de datos ha crecido desproporcionalmente) por razones de rendimiento o por conveniencia para utilizar los datos en una aplicación. Si mi dataset tiene grandes cantidades de texto o imágenes, BLOB (Binary Large Objects). Si hay consultas contra datos que no implican relaciones jerárquicas sencillas; recomendaciones o consultas de inteligencia de negocio o analíticas. Ejemplo: “toda la gente en una red social que no ha comprado un libro este año que ha dejado de seguir a gente que si ha comprado un libro“. Si usas transacciones que no necesitan ser durables (no pasa nada si se pierde un dato o al menos puedo relajar la condición de durabilidad). e.j. Likes (los sites AJAX tienen muchos casos de uso de este estilo). En general se ha insistido en que es un cambio de mentalidad. Para Relacional se crea un modelo de datos normalizado sin pensar en los patrones de acceso. Más adelante podremos ampliarlo cuando surjan nuevas preguntas y necesidades de consulta. Organizaremos cada tipo de datos en su propia tabla. Para NoSQL o No Relacional no empezamos a diseñar el esquema hasta que conozcamos las preguntas a las que tendrá que responder. Es esencial comprender los problemas empresariales y los casos de uso de la aplicación por adelantado. Debe mantener el menor número posible de tablas. Hay 4 familias o tecnologías NoSQL, que ordenadas de menor a mayor por complejidad de los datos que manejan son Clave-valor, Familia de Columnas, Documentos y Grafos. Y ordenadas por tamaño de los datos que manejan son de mayor a menor Clave-valor, Familia de Columnas, Documentos y Grafos. ", files: [] },
                    { title: "Modelo de datos orientado a documentos con MongoDB", comment: "Este es el resumen de la materia desarrollada en clase. MongoDB usa un modelo de datos orientado a documentos, donde los datos se almacenan en formato BSON (similar a JSON) y permiten estructuras complejas y anidadas. El concepto clave aquí es el pre-join o embed de los datos, que consiste en almacenar datos relacionados directamente dentro de un mismo documento para mejorar el rendimiento de las consultas y reducir la necesidad de hacer joins en tiempo de ejecución. Relación 1 a 1: En una relación uno a uno, los datos relacionados se pueden incrustar directamente dentro de un documento principal. Por ejemplo, un perfil de usuario con datos personales podría almacenarse dentro del mismo documento que representa al usuario, evitando la necesidad de hacer una consulta separada para recuperar esos datos. Relación 1 a N: En una relación uno a muchos, los datos relacionados pueden incrustarse como un array dentro de un documento. Por ejemplo, un usuario y sus múltiples direcciones de correo electrónico pueden almacenarse en un array dentro del mismo documento del usuario, de modo que una consulta al documento del usuario también devuelva automáticamente las direcciones asociadas. Esto se hace normalmente en el caso de 1 a N con N pequeño (máximo unos cientos). En la relación 1 a N con N grande no se hace pre-join, por ejemplo ciudadanos y ciudad. En la relación M a N también se puede hacer pre-join como un array, añadiendo redundancia de los datos si es necesario y conveniente.", files: [] }
                ]
            },
            {
                value: "mongosh", label: "MongoDB Shell y Aggregation",
                subtopics: [
                    { title: "Comandos básicos e índices", comment: "Este es el resumen de la materia desarrollada en clase. MongoDB Shell permite interactuar con bases de datos mediante comandos básicos como `show dbs`, `use`, `db.collection.find()` y `exit`. Antes de entrar en la Shell tenemos que importar datos con mongoimport. Se ha dado mucha importancia a los índices, que son una estructura de datos adicional que se utiliza para optimizar determinadas búsquedas. Requiere su propio espacio en disco y contiene una copia de los datos de la tabla. Eso significa que un índice es una redundancia. Crear un índice no cambia los datos de la tabla. El índice se tiene que actualizar cada vez que se inserta, actualiza o borran campos. El índice tiene un funcionamiento similar al índice de un libro, guardando parejas de elementos: el elemento que se desea indexar y su posición en la base de datos. No se puede indexar todos los campos. El comando para crear un índice es db.collection.createIndex", files: [] },
                    { title: "Operaciones CRUD", comment: "Este es el resumen de la materia desarrollada en clase. Las operaciones CRUD (Create, Read, Update, Delete) permiten crear, leer, actualizar y eliminar documentos dentro de una colección de MongoDB. En clase se han hecho muchos ejemplos de queries simples de operaciones CRUD, con diferentes query selectors en el find como $gt, $lt, $gte, $lte, $in, $nin, $or, $and, $exists, sort, skip y limit, projection. En el updateOne y updateMany $set, $unset, $inc, $rename, $min, $max, $push y $pull. ", files: [] },
                    { title: "Operadores de agregación match, group, project, sort", comment: "Este es el resumen de la materia desarrollada en clase. El framework de agregación de MongoDB funciona por fases o stages, cada fase ve la salida del anterior, es decir el conjunto de documentos es inicialmente la colección pero va evolucionando y se va modificando fase a fase. Los operadores de agregación permiten transformar y analizar datos mediante etapas como `$match`, `$group`, `$project` y `$sort`.", files: [] },
                    { title: "Operador de agregación unwind", comment: "Este es el resumen de la materia desarrollada en clase. El operador `$unwind` descompone arrays en múltiples documentos, permitiendo que cada elemento del array se trate como un documento independiente. Este operador lo hemos usado en clase en combinación con el resto de operadores, para descomponer los arrays.", files: [] }
                ]
            }, 
            {
                value: "security",
                label: "Seguridad en NoSQL",
                subtopics: [
                    {
                        title: "Modelo CIA",
                        comment: "Este es el resumen de la materia desarrollada en clase. El objetivo principal de la ciberseguridad es garantizar la confidencialidad, integridad y disponibilidad de la información y los sistemas informáticos, y protegerlos de ataques maliciosos o accidentales. La **confidencialidad** asegura que la información llegue solamente a las personas autorizadas. Contra la confidencialidad pueden darse fugas y filtraciones de información, así como accesos no autorizados. La confidencialidad es una propiedad de difícil recuperación y puede minar la confianza de los demás en la organización. Además, puede suponer el incumplimiento de leyes y compromisos contractuales relativos a la custodia de los datos. La **integridad** consiste en mantener las características de completitud y corrección de los datos. Contra la integridad, la información puede aparecer manipulada, corrupta o incompleta, afectando directamente al correcto desempeño de las funciones de una organización. La integridad incluye la protección contra la modificación o destrucción indebidas de la información y la garantía de no repudio y autenticidad. El **no repudio** es la garantía de que el remitente recibe un comprobante de entrega y que el destinatario tiene una prueba de la identidad del remitente para que ninguno pueda negar posteriormente haber procesado los datos. La **autenticidad** implica que la información es genuina y confiable, permitiendo la confianza en la validez de una transmisión, un mensaje o el originador del mensaje. La **disponibilidad** garantiza que los servicios y los datos estén accesibles cuando se necesiten. La carencia de disponibilidad supone una interrupción del servicio que afecta directamente a la productividad de las organizaciones y también afecta indirectamente a la reputación, la imagen y la ventaja competitiva."
                    },
                    {
                        title: "Modelo AAAA",
                        comment: "Este es el resumen de la materia desarrollada en clase. El modelo AAAA incluye **autenticación**, **autorización**, **contabilidad (accounting)** y **auditoría**. La **autenticación** verifica la identidad del usuario mediante credenciales como contraseñas, tokens de un solo uso (OTP), certificados digitales o parámetros biométricos (huellas dactilares, reconocimiento facial, etc.). Se suele usar el MFA (múltiple factor de autenticación) donde se pide al usuario que verifique su identidad usando dos factores de autenticación (2FA). Los factores de autenticación se deben elegir de dos categorías de autenticación que incluyen: algo que sabes (como una contraseña), algo que tienes (como un dispositivo) y algo que eres (como una característica biométrica). La **autorización** controla qué recursos puede usar un usuario autenticado, estableciendo configuraciones de acceso basadas en derechos de usuario y políticas locales. Esto puede incluir modelos de control de acceso como ACL (Access Control List), RBAC (Role-Based Access Control), ABAC (Attribute-Based Access Control) y PBAC (Policy-Based Access Control). La **contabilidad (accounting)** registra a qué recursos se accedió, en qué momento, quién y qué comandos se emitieron. La información recopilada puede incluir ID de usuario, descripción del servicio, volumen de datos y duración de la sesión, siendo útil para la gestión, planificación y facturación. La **auditoría** combina la autenticidad (asegurar que la información y los usuarios sean genuinos) y la trazabilidad (determinar quién hizo qué y en qué momento). La trazabilidad es clave para analizar incidentes, perseguir atacantes y aprender de las experiencias."
                    },
                    {
                        title: "Caso MongoDB y otras consideraciones",
                        comment: "Este es el resumen de la materia desarrollada en clase. MongoDB proporciona mecanismos de autenticación (SCRAM, certificados x.509 y autenticación externa) y autorización basada en roles y privilegios (RBAC, ABAC). Asegura la integridad mediante backups continuos y snapshots, y la disponibilidad mediante réplicas. También permite cifrado de datos en tránsito (usando TLS/SSL) y en reposo (con 4 opciones principales cifrando el disco entero, todos los datos, solo algunos campos o cifrando usando el ODM). La auditoría permite rastrear las acciones que hacen los usuarios. Y el principio de mínimo privilegio (PoLP) consiste en Cada programa y cada usuario del sistema debe operar utilizando el menor conjunto de privilegios necesarios para completar el trabajo. Principalmente, este principio limita el daño que puede resultar de un accidente o error. Otras consideraciones de seguridad adicionales a los principios CIA y AAAA son: Limitar la exposición de red, no escuchar en 0.0.0.0, porque escuchará en todas las interfaces de red. Configurar adecuadamente el firewall. Ejecutar MongoDB con un usuario dedicado (no como root). Comprobar a menudo la configuración y el despliegue. Comprobar fallos de seguridad oficiales publicados por MongoDB."
                    }
                ]
            },
            {
                value: "odms", label: "ODMs",
                subtopics: [
                    { title: 'Concepto de ODM', comment: 'Este es el resumen de la materia desarrollada en clase. En el desarrollo de una aplicación suelen estar involucradas dos entidades diferentes, por una parte el código que mueve la aplicación y por otra los datos que se manejan. Un ODM (Object Document Mapper o Mapeo Objeto-Documento) es una técnica de programación que se suele materializar en forma de librería o módulo escrita en el lenguaje de programación que estemos usando, permite convertir los objetos de una aplicación a un formato adecuado para ser almacenados en cualquier base de datos. Los ODMs permiten  realizar las acciones CRUD (Create, Read, Update, Delete) sin necesidad de incluir queries en el código. De modo que en lugar de ejecutar queries a nuestras colecciones de documentos (en una BBDD NoSQL) ejecutaremos llamadas a objetos. Existen diversos ODMs para diferentes lenguajes de programación: NodeJS -> Mongoose, HumbleJS.. Java -> OdmManager, Morphia,..Python -> MongoEngine, Mongothon..' },
                    { title: 'Ventajas y Desventajas de los ODMs', comment: 'Este es el resumen de la materia desarrollada en clase. Ventajas: Muchas cosas se hacen automáticamente. Por ej: conectar a la BBDD, convertir tipos (sobretodo problemáticos DATE y TIME). Fomenta/fuerza el patrón MVC (Modelo Vista Controlador) y la app queda más limpia. Separación por capas. DRY (Don’t Repeat Yourself): el código del modelo queda en un sitio, fácil de actualizar, mantener y reutilizar. Abstrae de la BBDD, con lo que se podrá cambiar en el futuro de tecnología de BBDD. Suele evitar inyecciones de código y “sanitiza” en general el código. Desventajas: Para empezar pueden llegar a ser muy complejos. Puede llevar una curva de aprendizaje que podría retrasar el tiempo de desarrollo del proyecto. Se necesita alta estandarización de código y una buena arquitectura de la aplicación.          Hay ocasiones en las que interviene un gran número de registros por cada petición. Puede saturar la memoria de objetos (por ejemplo reportes que incluyan muchísimos datos)' }
                ]
            },
            {
                value: 'replicacion_particionamiento', label: 'Replicación y Particionamiento',
                subtopics: [ 
                    { title: 'Replicación de Datos', comment: `Este es el resumen de la materia desarrollada en clase. 
                        La replicación de datos en bases de datos NoSQL es la técnica de mantener copias idénticas de los datos en diferentes nodos para asegurar la disponibilidad y la tolerancia a fallos. Cuando un nodo falla, otro nodo puede continuar sirviendo las solicitudes de los clientes sin interrupciones.  ¿Por qué?: para Mantener datos a salvo (recuperación frente a desastres), Alta Disponibilidad, Mayor rendimiento de lecturas, Reducir la latencia.
Existen diferentes tipos de replicación, como la replicación síncrona y la replicación asíncrona. En la síncrona el Líder espera respuesta de que al menos un seguidor que ha conseguido replicar los datos esto tiene como ventaja que aumenta la garantía de datos en seguidores pero como desventaja puede bloquear el flujo. En la asíncrona el Líder no espera respuesta de los seguidores y sigue procesando peticiones de escritura, la ventaja es que el Líder procesa datos aún fallando seguidores, pero la desventaja es que pueden perderse datos.
Existen algoritmos para el manejo de la replicación: Líder individual, Líder múltiple y Sin líder. 
En "líder individual" Solo el líder acepta peticiones de escritura Los seguidores aplican los cambios según los logs de replicación y Las peticiones de lectura se pueden enviar al líder o a los seguidores. La replicación se realiza por logs y pueden ser Basados en sentencias, Basado en registros de escritura, Basados en filas, Basado en triggers. Posibles implicaciones cuando el líder cae: En replicación asíncrona, el nuevo líder puede no estar actualizado. Una solución habitual es descartar los cambios que había en el viejo líder (para evitar conflictos) cuando se vuelve a meter en el cluster. 
En "líder individual" en algunos escenarios dos nodos creen que son líderes. Es decir, hay alguna condición de carrera que hace creer al viejo líder que sigue siendo líder y procesa peticiones de escritura lo que da lugar a conflictos. Una forma de abordarlo es apagar los nodos. Con esto ganas que no se generen conflictos y por tanto consistencia de datos pero dejas de dar servicios. Hay que definir el timeout para determinar que un líder cae. Hay veces que por congestión de red al nodo no le han llegado bien los pings  y si pones un timeout muy pequeño puedes provocar restructuraciones del cluster innecesarias dando posibilidades de fallo como las anteriores. Pero si pones uno muy grande, la reacción y recuperación del sistema es mucho más lenta. 
En "líder múltiple" se permite que más de un nodo procese peticiones de escritura. La mayor desventaja es la gestión de conflictos. 
En "Sin líder" cualquier réplica puede aceptar peticiones de escritura Se envían varias peticiones (escritura o lectura) a la vez a varios nodos. Buscan la consistencia de datos mediante Quorums de lectura (r) y escritura (w) + técnicas como read-repair. 
En mongoDB la replicación se maneja de la siguiente forma: la replicación se despliega un clúster llamado “Replica set”. Importante: Es Replicación de líder individual asíncrona, Servidor principal (líder) + secundarios (seguidores), Logs basados en sentencias, Servidores informan de su estado y versión de datos mediante latidos (pings), Limitación de 50 nodos réplica, Servidores tienen prioridad de ser elegidos principal.
                        `},
                    { title: 'Particionamiento de Datos', comment: `Este es el resumen de la materia desarrollada en clase. 
                        El particionamiento de datos es el proceso de dividir una base de datos en múltiples segmentos llamados particiones. Cada partición puede residir en un nodo diferente del sistema. Esto permite distribuir la carga de trabajo y mejorar el rendimiento y la escalabilidad. 
                        El particionamiento  se puede categorizar en función de como se dividen los datos (usando el valor de la clave primaria con rango o hash o introduciendo también índices secundarios que es más complejo), o en función de como se gestionan las particiones, de forma algorítmica o fija o de forma dinámica. 
                        El particionamiento clave-valor, los mas conocidos son rango y hash. 
                        En rango se selecciona en qué partición se va escribir o leer en función de si la clave está dentro de un rango. Por ejemplo la clave primaria puede ser de tipo temporal, alfabética, numérica, etc. Por ejemplo podemos hacer particiones en función del día. Crear un partición con los datos de cada día O hacer la partición ordenando alfabéticamente, de la A a la C en este nodo, de la D a la F en este otro. 
                        En Hash lo que se hace es aplicar un hash a la clave primara antes de procesar la petición de escritura. De esta manera los datos se guardan uniformemente y evitas el problema de los patrones pero pierdes efectividad de búsquedas porque básicamente tienes que mirar en todas las particiones. A parte de la efectividad de búsquedas tiene también problemas de escritura. Por ejemplo en una red social, el hash aplicado a un influencer puede generar mas escrituras en forma de comentarios que otros usuarios, concentrado más registros en una partición que en otra. 
                        En el particionamiento algorítmico o fijo se definen números fijos de particiones. En cuanto a como gestionamos las particiones. La primera es la algorítmica con numero fijo de particiones la App determina a que partición dirigirse. Es decir, implementa una lógica adicional antes de hacer peticiones a las particiones. En general la clave es critica por lo que hemos dicho de que se llenan unos mas que otros. En general, esta aproximación es mejor usarla cuando sabemos que los datos son homogéneos. Rebalanceo complicado sobre todo si hay grandes cantidades de datos. 
                        Por otro lado tenemos el dinámico, donde las particiones se ajustan al tamaño de los datos. Es una forma más eficiente porque el balanceo como veremos a continuación es trivial y porque es mas resistente (por así decir) a que los datos no sean uniformes. Lo malo es que el localizador se convierte en un cuello de botella y es un punto único de fallo (es decir que si falla esto falla toda la app).
                        `},
                    { title: 'Implementación en mongoDB', comment: `Este es el resumen de la materia desarrollada en clase. 
                        Particionamiento + Replicación, Generalmente se suelen aplicar los dos procedimientos a la vez.
                        Una partición suele estar también replicada varias veces.
                        Implementación en mongoDB: 
                        En MongoDB, la particiones se llaman “Shards”. 
                        Es partición dinámica, pero permite definir un set inicial de shards, 
                        El localizador es el llamado Config Server, 
                        Introduce también un router Mongos que provee una interfaz entre los clientes y los shards,
                        Las claves pueden estar basadas en hash o en rango`
                    }
                    ]

            },           
            {
                value: "clave-valor", label: "Clave-valor y Redis",
                subtopics: [
                    { title: "Modelo de datos clave-valor", comment: "Este es el resumen de la materia desarrollada en clase. El modelo de datos clave-valor almacena datos en pares clave-valor, donde cada clave es única y se asocia con un valor. Este modelo es simple y eficiente, permitiendo un acceso rápido a los datos. Es ideal para almacenar datos que no requieren relaciones complejas y que se acceden de forma rápida y sencilla. Algunos ejemplos de casos de uso son: Caché de aplicaciones web, Sesiones de usuarios, Contadores, Listas de tareas, Colas de mensajes, Datos temporales. Modelo de datos muy sencillo: colección de pares clave/valor. Similar a diccionarios o maps. Basadas en DHT (Distributed Hash Tables). La clave es el identificador único que le permite acceder al valor asociado. Ejemplos de clave válidas: nombre de archivo, URI, hash, DNI, número de cuenta, número seguridad social, MAC address, … El valor es lo que se recupera, puede variar desde el contenido de una página HTML, un fichero, una imagen, una lista o incluso otro par clave-valor encapsulado con un objeto. Las operaciones de lectura y escritura tienen un desempeño altísimo, tienen una alta disponibilidad de los datos y son más sencillas de particionar que otras BBDD NoSQL.", files: [] },
                    { title: "Estructurar claves", comment: "Este es el resumen de la materia desarrollada en clase. Es importante estructurar y definir bien las claves para que se pueda obtener el valor correspondiente, para que sea eficiente, para que se particione adecuadamente, para que el código de las aplicaciones sea más legible y mantenible. Para ello se vio en clase cómo introducir abstracciones utilizando los namespaces o categorías separados por algún carácter, típicamente ':'. Ejemplos: Category:identifier (person:12321  user:ebarra   company:nike), Category:identifier:attribute (person:12321:name  person:12321:age  person:12321:address), Category:subcategory:identifier (spain:person:12321  online:order:23659), CategoryShort:identifier ( p:12321   per:12321), CategoryWithDate:identifier (Order24062021:123 ), CategoryWithDate:number:customeridentifier (Order24062021:773:ebarra). Unas últimas recomendaciones fueron No diseñar claves muy largas (una clave de 1024 bytes ocupará mucha memoria e implicará muchas comparaciones costosas para las búsquedas). No diseñar claves muy cortas y poco usables (una clave como 'u1000flw' es poco usable y tiene solo pocos bytes menos que 'user:1000:followers'). Mantenerse fiel a un esquema y no mezclar. Es decir, usamos “:” para los namespaces. “.” y “-” para separar palabras. El carácter separador (':') no se debe permitir en el identificador. Es muy recomendable que la clave sea inmutable, es decir, no es buena idea 'human_resources:person:12321'. ¿Qué pasa si la persona cambia de departamento? ->  implicará cambiar su clave y también todas las referencias a dicha clave.", files: [] }
                ]
            },
            {
                value: "columns", label: "BBDD Columnas y Cassandra",
                subtopics: [
                    { title: "Propiedades de las BBDDD de columnas", comment: "Este es el resumen de la materia desarrollada en clase. Las bases de datos de columnas organizan internamente la información por columnas. Esto permite obtener la información de una columna de manera mucho más rapida. Sin embargo, realizar escrituras es mucho más caro debido a que es necesario insertar información en varios sitios de la memoria. Por ello son BBDD que se utilizan principalmente en aplicaciones análiticas, en las que hay muchas más escrituras que lecturas.", files: [] },
                    { title: "Cassandra", comment: "Este es el resumen de la materia desarrollada en clase. Cassandra es una base de datos de columnas que permite una gran escalabilidad. Cassandra particiona la información y está diseñada para trabajar con un gran número de nodos. Dentro del teorema PAC, Cassandra se situa en Available y Partition Tolerant por defecto, pudiendose incrementar la consistencia a cambio de una menor disponibilidad.", files: [] },
                    { title: "Clave primaria", comment: "Este es el resumen de la materia desarrollada en clase. La clave primaria en Cassandra puede estar formada por varias columnas. A su vez, la clave se divide en la partion key y clustering key. Sobre esta clave se calcula un hash, el cual se utiliza para particionar la información entre los nodos. Al ejecutar busquedas, es necesario introducir todos los valores de la partition key o Cassandra devuelve un error al no saber en que nodo ha de buscar. La clustering key fija la ordenación de la información dentro de los nodos. Es necesario elegir que columnas pertenecen a cada clave teniendo en cuenta que la clave primaria resultante ha de ser única para cada entrada de la fila.", files: [] },
                    { title: "Modelados de datos en Cassandra", comment: "Este es el resumen de la materia desarrollada en clase. El modelado de datos en Cassandra es difente al del resto de BBDD puesto que no se realiza un modelo conceptual entidad-relacion. En su lugar se realiza un diseño basado en queries, de manera que para cada query se diseña una tabla específica para obtener los datos necesarios. Esto se debe a que dependiendo de los valores elegidos para la partition y clustering key, se podrán realizar unas consultas u otras. La información no se ha de normalizar y es habitual y recomendable duplicar la información en varias tablas.", files: [] }
                ]
            },
            {
                value: "graph", label: "Grafos y Neo4j",
                subtopics: [
                    { title: "Características básicas bases de datos orientadas a grafos", "comment": "Las bases de datos orientadas a grafos se caracterízan en que la información se modela como un grafo. Esto hace que sean idóneas para entornos en los que existen muchas relaciones entre los datos ya que con una base de datos relacional se requerían joins anidados lo que es computacionalmente costoso. Existen 2 tipos de base de datos orientadas a grafo: 1) nativas: el procesamiento del grafo y el almacenamiento del grafo es nativo (index-free adjacency) 2) no nativas: procesamiento o almacenamiento del grafo no nativo. A diferencia de otras bases de datos no relacionales el escalado horizontal no es trivial. No hay un lenguaje de consulta único, cada base de datos tiene el suyo, aunque en 2024 see aprobó el Graph Query Language.", files: [] },
                    { title: "Grafos y árboles", "comment": "Un grafo es un conjunto de vértices (nodos) conectado a través de aristas (relaciones). Teoría de grafos desarrollada por Euler. Tipos de grafos: no dirigidos, dirigidos, con pesos, dirigido con pesos. Grado de un nodo: cantidad de aristas que salen o entran de un nodo. Grado positivo: cantidad de aristas que salen de un nodo. Grado negativo: cantidad de aristas qeu entran en un nodo. Grafo conexo: todo par de nodos están conectados al menos por un camino. Grafo fuertemente conexo: grafo dirigido y conexo. Grafo debilmente conexo: grafo conexo si no se tiene en cuenta la dirrección de las aristas. Representaciones de los grafos como lista: lista de incidencia y lista de adyacencia. Representación de un grafo en forma de matriz: matriz de incidencia y matriz de adyacencia. Árbol es un tipo de grafo sin bucles y qeu conecta a todos los vértices. Tipos de nodo en un árbol: raíz, padre, hijo, hoja. Grado de un árbol: número máximo de nodos hijos que tiene alguno de los nodos del árbol. Árbol binario: árbol de grado 2. Algoritmos de grafos: dijkstra, bellman-ford, floyd-warshall, búsqueda en anchura, búsqueda en profundidad.", files: [] },
                    { title: "Casos de uso", "comment": "Casos de uso de bases de datos orientadas a grafos: 1) Redes sociales: sugerencias de amistad, predicción de comportamientos; 2) sistemas de recomendación: e-commerce, sistemas de perfilado, sugerencia de productos; 3) cálculo de rutas óptimas; 4) gestión de redes de comunicación; 5) detección de patrones a través de modelos de IA; 6) sistema de rastreo y detección de fraude.   ", files: [] },
                    { title: "Operaciones CRUD Cypher (Neo4j)", "comment": "Las operaciones CRUD (Create, Read, Update, Delete) permiten crear, leer, actualizar y eliminar propiedades, relaciones y nodos de un grafo. En clase se han hecho muchos ejemplos de queries simples de operaciones CRUD con cypher, con diferentes patrones a través de la sentencia MATCH, incluyendo filtrado por propiedades, relaciones, importancia de indicar o no el sentido en los patrones, y una combinación de ellos. También se han hecho consultas con funciones shortestPath, clausula WHERE, ORDER BY, SKIP y LIMIT. En el CREATE se enseña a crear nodos, relaciones, subgrafos completos. En el SET se enseña a actualizar nodos, propiedades de nodos, propiedades de relaciones, relacioens, y etiquetas de nodo. Con DELETE y DETACH DELETE se enseña a eliminar nodos, relaciones o paths. Con REMOVE se enseña a borrar propiedades o etiquetas.", files: [] },
                ]
            }             
        ]
    },
    IWEB: {
        name: 'Ingeniería Web',
        topics: [
            {
                value: 'react', label: 'React',
                subtopics: [
                    { title: 'Creación y uso de componentes', comment: '', files: [] },
                    { title: 'Ciclo de vida de un componente', comment: '', files: [] },
                    { title: 'Props y State', comment: '', files: [] },
                    { title: 'PropTypes y DefaultProps', comment: '', files: [] },
                    { title: 'UseRef y UseState', comment: '', files: [] },
                    { title: 'Sintaxis y uso de JSX', comment: '', files: [] },
                    { title: 'Hook UseEffect', comment: '', files: [] },
                    { title: 'Manejo de eventos', comment: '', files: [] },
                    { title: 'React Router', comment: '', files: [] },
                    { title: 'Context API', comment: '', files: [] },
                    { title: 'Redux', comment: '', files: [] },
                    { title: 'React Native', comment: '', files: [] },
                    { title: 'Componentes controlados y formulariosI', comment: '', files: [] }
                ]
            },
            {
                value: 'swift', label: 'Swift',
                subtopics: [
                    { title: 'Variables y constantes', comment: '', files: [] },
                    { title: 'Opcionales', comment: '', files: [] },
                    { title: 'Condicionales y bucles', comment: '', files: [] },
                    { title: 'Uso de guard y defer', comment: '', files: [] },
                    { title: 'Clases, estructuras y métodos', comment: '', files: [] },
                    { title: 'Uso de if let y guard let', comment: '', files: [] },
                    { title: 'Nil coalescing', comment: '', files: [] }
                ]
            }
        ]
    },
    CDPS: {
        name: 'Centros de Datos y Provisión de Servicios',
        topics: [
            {
                value: 'python', label: 'Python',
                subtopics: [
                    { title: 'Funciones, argumentos y valores de retorno', comment: '', files: [] },
                    { title: 'Funciones lambda', comment: '', files: [] },
                    { title: 'Condicionales y bucles', comment: '', files: [] },
                    { title: 'Uso de Break y Continue', comment: '', files: [] },
                    { title: 'Listas, tuplas y diccionarios', comment: '', files: [] },
                    { title: 'Clases, objetos y herencia', comment: '', files: [] }
                ]
            }
        ]
    },
    IBDN: {
        name: 'Ingeniería de Big Data en la Nube',
        topics: [
            {
                value: 'big_data', label: 'Introducción a Big Data',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'las 5 Vs del Big Data', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] }
                ]
            },
            {
                value: 'programacion_funcional', label: 'Programación funcional',
                subtopics: [
                    { title: 'Conceptos básicos', comment: '', files: [] },
                    { title: 'Composición de funciones', comment: '', files: [] },
                    { title: 'Funciones puras', comment: '', files: [] },
                    { title: 'Inmutabilidad', comment: '', files: [] },
                    { title: 'Efectos secundarios', comment: '', files: [] },
                    { title: 'Funciones de orden superior', comment: '', files: [] },
                    { title: 'Funciones lambda', comment: '', files: [] },
                    { title: 'Recursividad', comment: '', files: [] },
                    { title: 'Evaluación perezosa', comment: '', files: [] },
                    { title: 'Programación declarativa vs programación imperativa', comment: '', files: [] }
                ]
            },
            {
                value: 'lisp', label: 'Lisp',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Sintaxis básica', comment: '', files: [] },
                    { title: 'CAR, CDR, CONS, EQ', comment: '', files: [] },
                    { title: 'Tipos de datos', comment: '', files: [] },
                    { title: 'Listas', comment: '', files: [] },
                    { title: 'Funciones', comment: '', files: [] },
                    { title: 'Recursividad', comment: '', files: [] }
                ]
            },
            {
                value: 'scala', label: 'Scala',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Scala vs Java', comment: '', files: [] },
                    { title: 'Sintaxis básica', comment: '', files: [] },
                    { title: 'Tipos de datos', comment: '', files: [] },
                    { title: 'Funciones', comment: '', files: [] },
                    { title: 'Clases y objetos', comment: '', files: [] },
                    { title: 'Traits', comment: '', files: [] },
                    { title: 'Pattern matching', comment: '', files: [] },
                    { title: 'Ejecución de programas Scala', comment: '', files: [] },
                    { title: 'map, flatMap, filter, reduce, groupBy', comment: '', files: [] }
                ]
            },
            {
                value: 'sbt', label: 'SBT',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Estructura de un proyecto SBT', comment: '', files: [] },
                    { title: 'Compilación y ejecución de un proyecto', comment: '', files: [] },
                    { title: 'Dependencias', comment: '', files: [] }
                ]
            },
            {
                value: 'actores_akka', label: 'Actores y Akka',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Comunicación síncrona y asíncrona', comment: '', files: [] },
                    { title: 'Concurrencia', comment: '', files: [] },
                    { title: 'Estado compartido', comment: '', files: [] },
                    { title: 'Actores', comment: '', files: [] },
                    { title: 'Mensajes', comment: '', files: [] },
                    { title: 'Akka', comment: '', files: [] }
                ]
            },
            {
                value: 'hadoop', label: 'Hadoop',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Arquitectura', comment: '', files: [] },
                    { title: 'HDFS', comment: '', files: [] },
                    { title: 'MapReduce', comment: '', files: [] },
                    { title: 'YARN', comment: '', files: [] },
                    { title: 'Hive, HBase, Pig, Nifi, Flume, Accumulo, Avro, Chuwka, Mahout, Spark, Zookeeper', comment: '', files: [] },
                    { title: 'Parquet', comment: '', files: [] },
                    { title: 'Bases de Datos no relacionales: Redis, Cassandra, MongoDB', comment: '', files: [] },
                    { title: 'Kafka', comment: '', files: [] }
                ]
            },
            {
                value: 'spark', label: 'Spark',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Arquitectura', comment: '', files: [] },
                    { title: 'Spark vs Hadoop', comment: '', files: [] },
                    { title: 'RDD Dataframes y Datasets', comment: '', files: [] },
                    { title: 'Acciones y Transformaciones', comment: '', files: [] },
                    { title: 'Collect, Count, First, Take, Reduce, Filter, Map, FlatMap, GroupBy, GroupByKey, ReduceByKey', comment: '', files: [] },
                    { title: 'Spark SQL', comment: '', files: [] },
                    { title: 'Spark Streaming', comment: '', files: [] },
                    { title: 'SparkML', comment: '', files: [] },
                    { title: 'spark-submit', comment: '', files: [] }
                ]
            },
            {
                value: 'despliegue_nube', label: 'Despliegue en la nube',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Ventajas y desventajas', comment: '', files: [] },
                    { title: 'IaaS, PaaS, SaaS', comment: '', files: [] },
                    { title: 'Nube pública, privada, híbrida', comment: '', files: [] },
                    { title: 'Proveedores de servicios en la nube', comment: '', files: [] },
                    { title: 'AWS', comment: '', files: [] },
                    { title: 'OpenStack', comment: '', files: [] },
                    { title: 'Seguridad en Cloud', comment: '', files: [] }
                ]
            }
        ]
    }
}