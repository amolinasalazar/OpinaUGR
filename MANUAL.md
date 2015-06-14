=== CONFIGURACIÓN DE OPINAUGR v1.0 ===

Desde el fichero "configuration.js" que se encuentra en OpinaUGR/www/js/configuration.js pueden cambiarse facilmente algunos parámetros de la aplicación:

 - WS_short_name: se trata del campo "shortname" que pertenece al servicio Moodle el cual queremos usar. Por defecto es "opinaws" y este valor debe coincidir con el "shortname" que se encuentre en la tabla "mdl_external_services" de la base de datos de Moodle.
 
 - login_img: ruta de la imagen que se carga en la pantalla de login de la app. Si se desea cambiar, asegurarse de que la imagen se encuentra en formato PNG.
 
 - login_URL: es la URL que se carga al tocar la imagen anterior, lo cual facilita la identificación en una plataforma Moodle determinada.