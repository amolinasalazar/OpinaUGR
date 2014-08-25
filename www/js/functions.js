/*
	© Universidad de Granada. Granada – 2014
	© Rosana Montes Soldado y Alejandro Molina Salazar (amolinasalazar@gmail.com). Granada – 2014

    This program is free software: you can redistribute it and/or 
    modify it under the terms of the GNU General Public License as 
    published by the Free Software Foundation, either version 3 of 
    the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses>. */

/**
 * Save the login values in the local storage, in case of check the "remember" option. 
 */
function recordar(){
	var c = $("#check");

	// Si esta marcada la opcion de recordar, guardamos los datos
	if(c.is(":checked")){
		var urlsitio = $("#urlsitio").val();
	    var u = $("#nombredeusuario").val();
	    var p = $("#clave").val();
	     
	    window.localStorage.setItem("urlsitio", urlsitio);
	    window.localStorage.setItem("username", u);
	    window.localStorage.setItem("password", p);
   	}
   	else{
   		window.localStorage.clear();
   	}
}

/**
 * This funtion is called always at the beginning (body onLoad) and it will load 
 * the saved content in the local storage to the textboxes on the login page. 
 */
function cargarDatos(){
	
	// Recuperamos los datos a traves del localStorage
	var urlsitio = window.localStorage.getItem("urlsitio");	
   	var u = window.localStorage.getItem("username");
   	var p = window.localStorage.getItem("password");

	// Si se han introducido todos los datos previamente y se le dio a recordar
	if(urlsitio!=null && u!=null && p!=null){
		// Y completamos los textbox
		$("#urlsitio").val(urlsitio);
	   	$("#nombredeusuario").val(u); 
	   	$("#clave").val(p);
		// Nota: si lo ejecutamos asi, el boton estara checkeado, pero no se visualiza en pantalla
		// es un posible error de JQuery, asi que los checkeamos siempre por defecto en el index
	   	$("#check").prop("checked", true);
	}
}

/**
 * Download all the general information about the feedbacks using three WebServices 
 * functions and will load the content of the home page.
 */
function cargarHome(){
	
	// Loader
	$.mobile.loading( "show", {
	  text: "Cargando...",
	  textVisible: true,
	  theme: "b",
	  html: ""
	});

	// Obtenemos la informacion del usuario: cursos y sus encuestas asociadas
	moodleWSCall("core_webservice_get_site_info", {}, function(data_user){

		// Nos devuelve la lista de cursos con la info justa (no incluye el curso ID=1 "general")
		moodleWSCall("core_enrol_get_users_courses", {userid: data_user.userid}, function(user_courses){
			
			// Creamos una lista de IDs de los cursos (incluyendo las encuestas generales del curso ID=1)
			id_cursos = null;
			id_cursos = [];
			id_cursos[0] = 1;
			for(var i=0; i<user_courses.length; i++){
				// Excluimos los cursos ocultos
				if(user_courses[i].visible)
					id_cursos[i+1] = user_courses[i].id;
			}

			// Obtenemos informacion sobre las encuestas asociadas al usuario 
			moodleWSCall("local_fbplugin_get_feedbacks_by_courses", {courseids: id_cursos}, function(feedbacks){
				
				// Eliminamos las posibles encuestas ya cargadas
				$("#grupo_general").empty();
				$("#grupo_cursos").empty();
    		
    			// Obtenemos la lista de IDs de los cursos actualizada solo con los cursos 
    			// que tengan alguna encuesta 
    			id_cursos = null;
				id_cursos = [];
				var nombres_cursos = [];
				var fb_cursos = [];
				var fb_generales = [];
				var fb_curso = false;
				
    			for(var i=0; i<feedbacks.length; i++){
    				// Es encuesta general
    				if(feedbacks[i].course == 1){
    					fb_generales.push(feedbacks[i]);
    				}
    				else{
						for(var j=0; j<user_courses.length && !fb_curso; j++){
							if(feedbacks[i].course == user_courses[j].id){
								fb_cursos.push(feedbacks[i]);
								nombres_cursos.push(user_courses[j].fullname);
								fb_curso = true;
							}
						}
						fb_curso = false;
					}
				}				
					
				// Localizamos los elementos HTML de HOME
				var grupo_general = document.getElementById("grupo_general");
				var grupo_cursos = document.getElementById("grupo_cursos");
				
				// FB generales
				if(fb_generales.length != 0){
					
					for(var i=0; i<fb_generales.length; i++){
						var a = document.createElement("a");
						// Si no hacemos esto, devolvera un valor de i cualquiera
						a.onclick = (function() {
							var currentI = i;
							return function() { 
						    	cargarPaginaInfo(currentI, fb_generales);
							}
						})();
						a.setAttribute('data-role', 'button');
						a.setAttribute('data-icon', 'carat-r');
						a.innerHTML = fb_generales[i].name;
						grupo_general.appendChild(a);
					}
				}
				else{
					var p = document.createElement("p");		
					p.innerHTML = "En estos momentos, usted no dispone de ninguna encuesta general.";
					p.setAttribute('align', 'justify');
					var div = document.createElement("div");
					div.setAttribute('data-role', 'content');
					div.appendChild(p);
					grupo_general.appendChild(div);
				}
				
				// FB cursos
				if(fb_cursos.length != 0){
					
					for(var i=0; i<fb_cursos.length; i++){
						// Intentamos buscar el contenedor del curso, por si lo hubieramos creado previamente
						var div = document.getElementById(nombres_cursos[i]);
						
						// Si no hemos creado ya el contenedor del curso, lo creamos ahora
						if(div==null){
							div = document.createElement("div");
							div.setAttribute('data-role', 'collapsible');
							div.setAttribute('id', nombres_cursos[i]);
							div.innerHTML = "<h3>" + nombres_cursos[i] + "</h3>";
						}
						
						// Añadimos el boton de la encuesta
						var a = document.createElement("a");
						// Si no hacemos esto, devolvera un valor de i cualquiera
						a.onclick = (function() {
							var currentI = i;
							return function() { 
						    	cargarPaginaInfo(currentI, fb_cursos);
							}
						})();
						a.setAttribute('data-role', 'button');
						a.setAttribute('data-icon', 'carat-r');
						a.innerHTML = fb_cursos[i].name;
						div.appendChild(a);
						grupo_cursos.appendChild(div);
				
					}
				}
				else{
					var p = document.createElement("p");		
					p.innerHTML = "En estos momentos, usted no dispone de ninguna encuesta asociada a algun curso.";
					p.setAttribute('align', 'justify');
					var div = document.createElement("div");
					div.setAttribute('data-role', 'content');
					div.appendChild(p);
					grupo_cursos.appendChild(div);
				}

    			// Cambiamos la pagina a "home"
    			$("#home").trigger("create");
    			$("#panel").trigger( "updatelayout" );
            	$.mobile.changePage("#home",{allowSamePageTransition:true,reloadPage:false,changeHash:true,transition:"pop"});
            	$.mobile.loading("hide");
            	
        	});	
		});
	});
}

/**
 * Using the content obtained before in the "cargarHome()" function, it 
 * charges the information page of the feedback selected and "info-fb" pass to 
 * be the active page.
 * 
 * @param {int} id_btn The index to navigate on the "fb" object and access 
 *  to the selected feedback data.
 * @param {Object} fb Contains all the data related with the user feedbacks.
 */
function cargarPaginaInfo(id_btn, fb){
	
	// Mostramos loader
	$.mobile.loading( "show", {
	  text: "Cargando...",
	  textVisible: true,
	  theme: "b",
	  html: ""
	});
	
	// Limpiamos la pantalla antes de comenzar
	$("#info").empty();
	
	// Creamos los elementos de la pagina de información general de la encuesta
	var info = document.getElementById("info");
	
	// TITULO Y DESCRIPCION
	info.innerHTML = "<h2>"+fb[id_btn].name+"</h2><h3>"+fb[id_btn].intro+"</h3>";
	
	// TABLE
	var table = document.createElement("table");
	table.setAttribute('class', 'ui-responsive table-stroke');
	table.setAttribute('data-model', 'columntoggle');
	table.innerHTML = "<thead><tr><td>                        </td><td>                 </td></tr></thead>";
	
	// ANONYMOUS
	if(fb[id_btn].anonymous==1){
		//info.innerHTML += "<dl><dt>Anónima: </dt><dd>Sí</dd>";
		table.innerHTML += "<tbody><tr><td>Anónima</td><th>Sí</th></tr>";
	}
	else{
		//info.innerHTML += "<dl><dt>Anónima: </dt><dd>No</dd>";
		table.innerHTML += "<tbody><tr><td>Anónima</td><th>No</th></tr>";
	}
		
	// MULTIANSWER
	if(fb[id_btn].multiple_submit==1){
		//info.innerHTML += "<dt>Multi-respuesta: </dt><dd>Sí</dd>";
		table.innerHTML += "<tr><td>Multi-respuesta</td><th>Sí</th></tr>";
	}
	else{
		//info.innerHTML += "<dt>Multi-respuesta: </dt><dd>No</dd>";
		table.innerHTML += "<tr><td>Multi-respuesta</td><th>No</th></tr>";
	}
		
	// TIME OPEN-CLOSE
	var current_time=new Date().getTime()/1000;
	// ENCUESTA CERRADA
	if(fb[id_btn].timeopen > current_time || (fb[id_btn].timeclose < current_time && fb[id_btn].timeclose > 0)){
		table.innerHTML += "<tr><td>Plazo</td><th>Cerrado</th></tr></tbody>";
		info.appendChild(table);
		
		var date_open = new Date(fb[id_btn].timeopen*1000);
		var date_close = new Date(fb[id_btn].timeclose*1000);
		
		// Solo tiene fecha de cierre y esta cerrado
		if(fb[id_btn].timeopen == 0){
			info.innerHTML += "<h4><code>La encuesta se cerró el día "+date_close.getDate()+"/"+(+date_close.getMonth()+1)+"/"+date_close.getFullYear()+
			" a las "+date_close.getHours()+":"+date_close.getMinutes()+" horas.</code></h4><p></p>";
		}
		// Solo tiene fecha de apertura y esta cerrado
		if(fb[id_btn].timeclose == 0){
			info.innerHTML += "<h4><code>La encuesta se abrirá el día "+date_open.getDate()+"/"+(+date_open.getMonth()+1)+"/"+date_open.getFullYear()+
			" a las "+date_open.getHours()+":"+date_open.getMinutes()+" horas.</code></h4><p></p>";
		}
		// Tiene fecha de apertura y cierre y esta cerrado
		if(fb[id_btn].timeopen != 0 && fb[id_btn].timeclose != 0){
			info.innerHTML += "<h4><code>El plazo de apertura es desde el "+date_open.getDate()+"/"+(+date_open.getMonth()+1)+"/"+date_open.getFullYear()+
			" a las "+date_open.getHours()+":"+date_open.getMinutes()+" horas hasta el "+date_close.getDate()+
			"/"+(+date_close.getMonth()+1)+"/"+date_close.getFullYear()+" a las "+date_close.getHours()+":"+date_close.getMinutes()+" horas.</code></h4><p></p>";
		}
	}
	
	// ENCUESTA ABIERTA
	else{
		table.innerHTML += "<tr><td>Plazo</td><th>Abierto</th></tr></tbody><p></p>";
		info.appendChild(table);
		
		// Si tiene una fecha de cierre, avisamos
		if(fb[id_btn].timeclose != 0){
			var date_close = new Date(fb[id_btn].timeclose*1000);
			info.innerHTML += "<h4><code>La encuesta se cerrará el día "+date_close.getDate()+"/"+(+date_close.getMonth()+1)+"/"+date_close.getFullYear()+
			" a las "+date_close.getHours()+":"+date_close.getMinutes()+" horas.</code></h4><p></p>";
		}
		
		// Boton comenzar encuesta
		var a = document.createElement("a");
		a.onclick = (function() {
			var currentId = id_btn;
			return function() { 
		    	cargarFB(currentId, fb);
			}
		})();
		a.setAttribute('data-role', 'button');
		a.setAttribute('data-icon', 'carat-r');
		var texto = document.createTextNode("Comenzar Encuesta");
		a.appendChild(texto);
		info.appendChild(a);
	}
	
	// Vuelve a recrear los estilos, cambia de página y oculta el loader
	$("#info-fb").trigger("create");
	$.mobile.changePage("#info-fb",{allowSamePageTransition:true,reloadPage:false,changeHash:true,transition:"slide"});
	$.mobile.loading("hide");
}

/**
 * Using the same content obtained before in the "cargarHome()" function and 
 * more extra data about the questions of the feedback calling "get_feedback_questions" 
 * Web Service function, it generates a feedback and changes the active page by "fb".
 * 
 * @param {int} id_btn The index to navigate on the "fb" object and access 
 *  to the selected feedback data.
 * @param {Object} fb Contains all the data related with the user feedbacks.
 */
function cargarFB(id_btn, fb){
	
	$.mobile.loading( "show", {
	  text: "Generando encuesta...",
	  textVisible: true,
	  theme: "b",
	  html: ""
	});
	
	// Borramos los elementos para volver a generarlos
	$("#fb_content").empty();
	$("#btn_fb_cancelar").empty();
	$("#btn_fb_enviar").empty();
	
	// Cargar preguntas
	moodleWSCall("local_fbplugin_get_feedback_questions", {feedbackid: fb[id_btn].id}, function(fb_questions){

		// Si hay alguna pregunta que contestar..
		if(fb_questions.length!=0){
			
			var contestable = false;
			var fb_content = document.getElementById("fb_content");
				
			// Ordenamos las preguntas segun la posicion en la que deben mostrarse
			fb_questions.sort(function(a, b){return a.position-b.position;});
			
			// Creamos los elementos del FB
			for(var i=0; i<fb_questions.length; i++){
				
				var div = document.createElement("div");
				div.setAttribute('class','ui-body');
				fb_content.appendChild(div);
				
				// Comprobamos si esta es una pregunta de respuesta obligatoria o no
				var required = false;
				if(fb_questions[i].required==1)
					required = true;
				
				// LABEL
				if(fb_questions[i].typ == "label"){		
					
					var p = document.createElement("p");		
					p.innerHTML = fb_questions[i].presentation;
					div.appendChild(p);
					fb_content.appendChild(div);
				}
				
				// TEXTO CORTO - rango caracteres: 5-255
				if(fb_questions[i].typ == "textfield"){
					
					contestable = true;
					
					// Obtenemos el maximo de caracteres
					var maxcarac = fb_questions[i].presentation.split("|");
					
					// Creamos el label (pregunta)
					var label = document.createElement("label");
					label.setAttribute('for', 'p'+i);
					label.innerHTML = fb_questions[i].name+" (caracteres máx.: "+maxcarac[1]+")";
					if(required)
						label.innerHTML += "*";
					
					// Creamos el input
					var input = document.createElement("input");
					input.setAttribute('type', 'text');
					input.setAttribute('id', 'p'+i);
					input.setAttribute('maxlength', maxcarac[1]);
					
					div.appendChild(label);
					div.appendChild(input);
					fb_content.appendChild(div);
					
				}
				
				// TEXTO LARGO - filas*columnas (nosotros le damos un tamaño estandar)
				if(fb_questions[i].typ == "textarea"){
					
					contestable = true;
					
					// Creamos el label (pregunta)
					var label = document.createElement("label");
					label.setAttribute('for', 'p'+i);
					label.innerHTML = fb_questions[i].name;
					if(required)
						label.innerHTML += "*";
					
					// Creamos el textarea
					var textarea = document.createElement("textarea");
					textarea.setAttribute('id', 'p'+i);
					textarea.setAttribute('cols', '40');
					textarea.setAttribute('rows', '8');
					
					div.appendChild(label);
					div.appendChild(textarea);
					fb_content.appendChild(div);
					
				}
				
				// INPUT NUMERICO - SLIDER
				if(fb_questions[i].typ == "numeric"){
					
					contestable = true;
					
					// Obtenemos el rango
					var rangonum = fb_questions[i].presentation.split("|");
					
					// Creamos el label (pregunta)
					var label = document.createElement("label");
					label.setAttribute('for', 'p'+i);
					label.innerHTML = fb_questions[i].name+" (rango: "+rangonum[0]+"-"+rangonum[1]+")";
					if(required)
						label.innerHTML += "*";
						
					// Creamos el input
					var input = document.createElement("input");
					input.setAttribute('type', 'range');
					input.setAttribute('min', rangonum[0]);
					input.setAttribute('max', rangonum[1]);
					input.setAttribute('id', 'p'+i);
					
					div.appendChild(label);
					div.appendChild(input);
					fb_content.appendChild(div);
					
					/* PRESENTACION EN FORMATO INPUT
					// Creamos el label (pregunta)
					var label = document.createElement("label");
					label.setAttribute('for', 'p'+i);
					label.innerHTML = fb_questions[i].name+" (rango:"+fb_questions[i].presentation+")";
					if(required)
						label.innerHTML += "*";
					
					// Creamos el input
					var input = document.createElement("input");
					input.setAttribute('type', 'number');
					input.setAttribute('data-clear-btn', 'false');
					input.setAttribute('pattern', '[0-9]*');
					input.setAttribute('id', 'p'+i);
					
					div.appendChild(label);
					div.appendChild(input);
					fb_content.appendChild(div);*/
				}
				
				// MULTICHOICE
				if(fb_questions[i].typ == "multichoice"){
					
					contestable = true;
					
					// Estructura del presentation:
					// d>>>>>: lista desplegable
					// r>>>>>: seleccion radio
					// c>>>>>: check button
					// Al final:
					// <<<<<1: visualizacion horizontal
					// nada: visualizacion vertical
					
					// Options:
					// i: No analiza los envios vacios (NO CONTEMPLADO)
					// h: la opcion "No Seleccionada" oculto (SOLO FUNCIONA EN MOODLE CON RADIO BUTTON, ASI QUE
					//	EVITAREMOS AÑADIR LA RESPUESTA EN LOS OTROS DOS TIPOS)
					
					// Eliminamos la cabecera del presentation (y la cola si la hubiera) 
					var respuestas_juntas = fb_questions[i].presentation.substring(6, fb_questions[i].presentation.length);
					// Contemplamos si la visualizacion es horizontal 
					var horizontal = false;
					if (respuestas_juntas.match(/<<<<<1/g) != null){ // vertical
						respuestas_juntas = respuestas_juntas.substring(0, respuestas_juntas.length-6);
						horizontal = true;
					}
					
					// Guardamos cada posible respuesta en un vector
					var respuestas = [];
					respuestas = respuestas_juntas.split("|");
					
					// Detectamos tipo de multichoice: radio o checkbox
					if(fb_questions[i].presentation.charAt(0) == 'r' || fb_questions[i].presentation.charAt(0) == 'c'){
						
						if(fb_questions[i].presentation.charAt(0) == 'r'){
							var tipo_multi = "radio";
							//OPCIONES (SOLO EN RADIO BUTTON)
							// Contemplamos si "No Seleccionada" esta activo y añadimos la opción
							if(fb_questions[i].options.match(/h/g) == null){
								respuestas.splice(0,0,"No Seleccionada");
							}
						}
						else
							var tipo_multi = "checkbox";
						
						// Creamos el fieldset
						var fieldset = document.createElement("fieldset");
						fieldset.setAttribute('data-role', 'controlgroup');
						if(horizontal)
							fieldset.setAttribute('data-type', 'horizontal');
						
						// Creamos legend (enunciado pregunta)
						var legend = document.createElement("legend");
						legend.innerHTML = fb_questions[i].name;
						if(required)
							legend.innerHTML += "*";
						
						// Cada respuesta:
						for(var j=0; j<respuestas.length ; j++){	
							var input = document.createElement("input");
							input.setAttribute('type', tipo_multi);
							input.setAttribute('name', 'p'+i);
							input.setAttribute('id', 'p'+i+'r'+j); // numero pregunta y respuesta
							input.setAttribute('value', j);
							var label = document.createElement("label");
							label.setAttribute('for', 'p'+i+'r'+j);
							label.innerHTML = respuestas[j];
							legend.appendChild(label);	
							legend.appendChild(input);			
						}
						
						fieldset.appendChild(legend);
						div.appendChild(fieldset);
						fb_content.appendChild(div);
						
					}else{
						// SELECT (lista desplegable)
						
						// Se añade por defecto un hueco en blanco al principio 
						// para contemplar la no contestacion de la pregunta
						respuestas.splice(0,0,"");
	
						// Creamos el label general
						var label = document.createElement("label");
						label.setAttribute('for', 'p'+i+'r'+j);
						label.setAttribute('class', 'select');
						label.innerHTML = fb_questions[i].name;
						if(required)
							label.innerHTML += "*";
						
						// Creamos el select
						var select = document.createElement("select");
						select.setAttribute('id', 'p'+i);
						select.setAttribute('data-native-menu', 'false');
					
						// Cada respuesta:
						for(var j=0; j<respuestas.length ; j++){	
							var option = document.createElement("option");
							option.setAttribute('value', j);
							option.innerHTML = respuestas[j];
							select.appendChild(option);
						}
						
						div.appendChild(label);
						div.appendChild(select);
						fb_content.appendChild(div);
					}
					
				} // end if
			} // end for
			
			// Comprobamos ahora si existe al menos alguna pregunta contestable
			if(contestable){
			
				var btn_fb_enviar = document.getElementById("btn_fb_enviar");
				var btn_fb_cancelar = document.getElementById("btn_fb_cancelar");
				
				// Boton Cancelar
				var a = document.createElement("a");
				a.setAttribute('data-role', 'button');
				a.setAttribute('data-rel', 'back');
				a.setAttribute('data-icon', 'delete');
				a.innerHTML = "Cancelar";
				btn_fb_cancelar.appendChild(a);
				
				// Boton Enviar
				var a = document.createElement("a");
				a.setAttribute('data-role', 'button');
				a.setAttribute('data-icon', 'check');
				a.onclick = function(){enviarFB(fb_questions, fb[id_btn].id);};
				a.innerHTML = "Enviar";
				btn_fb_enviar.appendChild(a);
			}
			else{
				
				// Borramos los posibles elementos no contestables imprimidos
				$("#fb_content").empty();
				var div = document.createElement("div");
				div.setAttribute('class','ui-body');
				fb_content.appendChild(div);
				
				var p = document.createElement("p");		
				p.innerHTML = "Esta encuesta no dispone de ninguna pregunta todavía.";
				div.appendChild(p);
				fb_content.appendChild(div);
				
				// Boton Cancelar
				var a = document.createElement("a");
				a.setAttribute('data-role', 'button');
				a.setAttribute('data-rel', 'back');
				a.setAttribute('data-icon', 'delete');
				a.innerHTML = "Cancelar";
				fb_content.appendChild(a);
			}
			
		}// end if
		
		// Si no hay preguntas que contestar
		else{
			var fb_content = document.getElementById("fb_content");
			
			var div = document.createElement("div");
			div.setAttribute('class','ui-body');
			fb_content.appendChild(div);
			
			var p = document.createElement("p");		
			p.innerHTML = "Esta encuesta no dispone de ninguna pregunta todavía.";
			div.appendChild(p);
			fb_content.appendChild(div);
			
			// Boton Cancelar
			var a = document.createElement("a");
			a.setAttribute('data-role', 'button');
			a.setAttribute('data-rel', 'back');
			a.setAttribute('data-icon', 'delete');
			a.innerHTML = "Cancelar";
			fb_content.appendChild(a);
		}
		
		// Vuelve a recrear los estilos, cambia de página y oculta el loader
		$("#fb").trigger("create");
		$.mobile.changePage("#fb",{allowSamePageTransition:true,reloadPage:false,changeHash:true,transition:"pop"});
		$( ".selector" ).loader( "hide" );
	});	
}

/**
 * Using the questions data obtained in "cargarFB(id_btn, fb)" function, it will process
 * the completed feedback by the user and will send the results to register them in 
 * the Moodle data base by calling "complete_feedback" Web Service function.
 * 
 * @param {Object} fb_questions Contains all the questions data about the completed feedback.
 * @param {int} fb_id The moodle index of the completed feedback.
 */
function enviarFB(fb_questions, fb_id){ 
	
	// ESTRUCTURA DE DATOS DE LA BD PARA "FEEDBACK_VALUE"
	// MULTICHOICE:
	// RADIO BUTTON(cambia, sumar 1 a los ids o dejar como esta) -> opciones con id[1..N], no seleccionada como primera opcion con id=0, ej: 2
	// CHECK BOX(sumar 1 a los ids) -> opciones con id[1..N], no funciona no seleccionada (simplemente no marcar ninguna), ej: 2|3 
	// SELECT(bien) -> se añade un hueco en blanco como primera opcion con id=0, no funciona no seleccionada (hueco en blanco), ej: 1 
	
	// Creamos el object a enviar a la BD
	var valores = [];
	var value;
	var salir = false;
	
	for(var i=0; i<fb_questions.length && salir != true; i++){
		
		value = "";
		
		// Si es alguno de los tipos contemplados y contestables..
		if(fb_questions[i].typ == "multichoice" || fb_questions[i].typ == "numeric" || fb_questions[i].typ == "textarea" ||
		fb_questions[i].typ == "textfield"){
			
			//COMPROBACIONES
			// Si es una pregunta obligatoria, nos aseguramos que tenga valor
			if(fb_questions[i].typ == "multichoice" && fb_questions[i].presentation.charAt(0) != 'd'){
				
				if($('input[name=p'+i+']:checked', '#FBform').val()==undefined && fb_questions[i].required==1){
					alert("Error: compruebe si ha respondido todas las preguntas obligatorias.");
					salir = true;
				}
				else{
					if(fb_questions[i].presentation.charAt(0) == 'r'){ // RADIO BUTTON
						// Contemplamos si "No Seleccionada" esta activo
						if(fb_questions[i].options.match(/h/g) == null){
							value = $('input[name=p'+i+']:checked', '#FBform').val();
						}
						else{
							value = +$('input[name=p'+i+']:checked', '#FBform').val()+1;
						}
					}
					else{ // CHECK BOX
						jQuery('input[name=p'+i+']:checked').each(function() {
							if(this.checked){
								value += +this.value+1+'|';
							}
						});
						// Eliminamos el ultimo separador sobrante
						value = value.slice(0,value.length-1);
					}
				}			
			}
			else{

				// SELECT
				if(fb_questions[i].typ == "multichoice" && fb_questions[i].presentation.charAt(0) == 'd'){
					// Tanto no haber seleccionado nada, como tener marcada la primera opcion que esta en blanco..
					if(($("#p"+i).val()==0 || $("#p"+i).val()=="") && fb_questions[i].required==1){
						alert("Error: compruebe si ha respondido a todas las preguntas obligatorias.");
						salir = true;
					}
					else{
						value = $("#p"+i).val();
					}
				}
				else{
					// RESTO DE TIPOS
					if($("#p"+i).val()=="" && fb_questions[i].required==1){
						alert("Error: compruebe si ha respondido a todas las preguntas obligatorias.");
						salir = true;
					}
					else{
						value = $("#p"+i).val();
					}
				}
			}

			valores.push({itemid: fb_questions[i].id, value: value, typ: fb_questions[i].typ});
		}
	}
	
	// Si todo ha ido bien, procedemos a realizar el envio
	if(salir == false){
		
		moodleWSCall("local_fbplugin_complete_feedback", {feedbackid: fb_id , itemvalues: valores}, function(result){		
            
            alert("Encuesta registrada satisfactoriamente.");
            $.mobile.back();
            
    	});
	}
}

/**
 * A moodle WebService call to login.
 */
function login(){
	
	// Loader
	$.mobile.loading( "show", {
	  text: "Identificando...",
	  textVisible: true,
	  theme: "b",
	  html: ""
	});
	
	// Datos usuario
	URL = $("#urlsitio").val();
    username = $("#nombredeusuario").val();
    var password = $("#clave").val();
    var loginURL = URL+'/login/token.php';
    mytoken = "";
    login_state = false;

    // Intentamos obtener un token valido
	$.ajax({
		async: false,
	    url:loginURL,
	    type:'POST',
	    data:{
	    	username: username,
	        password: password,
	        service: WS_short_name
    },
    dataType:"json",
    
    success:function(respuesta) {
    	
        if (typeof(respuesta.token) != 'undefined') {
        	// Almacenamos el token que usaremos para el resto de consultas
        	mytoken = respuesta.token;
            //alert("Login correcto, su token es:"+mytoken);
            login_state = true;
            
		}else {
            var error = "compruebe su usuario y contraseña.";

            if (typeof(respuesta.error) != 'undefined') {
                error = respuesta.error;
            }
            alert("Acceso denegado: "+error);
            login_state = false;
            $.mobile.loading("hide");
        }
        return;
    },
        
    error:function(xhr, textStatus, errorThrown) {
        var error = "no es posible la conexión, compruebe si dispone de acceso a internet.";
        if (xhr.status == 404) {
        	error = "no es posible conectar con el servidor, intentelo de nuevo más tarde.";
        }
        
        alert("Problema de red: "+error);
        login_state = false;
        $.mobile.loading("hide");
        return;
    }
    });

	return false;
}

/**
 * A wrapper function for a moodle WebService call.
 *
 * @param {string} method The WebService method to be called.
 * @param {Object} json Arguments to pass to the method.
 */
function moodleWSCall(method, json, callback) {

    json.wsfunction = method;
    json.wstoken = mytoken;
    json.moodlewsrestformat = 'json';       
	
    var wsURL = URL+'/webservice/rest/server.php';

    // Main jQuery Ajax call, returns in json format.
    return $.ajax({
        type: 'POST',
        data: json,
        url: wsURL,

        success: function(data) {
        	
            // Algunas funciones pueden devolver null
            if(data != null){
            	
				// Si devuelve un error..
	            if (typeof(data.exception) != 'undefined') {
	                if (data.errorcode == "invalidtoken" || data.errorcode == "accessexception") {
	                    // Conexion perdida
	                    alert('Error: vuelva a iniciar sesión en la aplicación.');
	                    $.mobile.changePage("#inicio");
	                    $.mobile.loading("hide");
	                    return;
	                } else {
	                	alert('Error: ' + data.message);
	                	$.mobile.loading("hide");
	                }
	                return;
	            }
	
	            if (typeof(data.debuginfo) != 'undefined') {
	                alert('Error: ' + data.message);
	                $.mobile.loading("hide");
	                return;
	            }
	
				// Si todo ha ido bien, obtenemos nuestro data..
	            if (typeof(data) == 'object') {
	                callback(data);
	                return data;
	            }
			}
			
			else{
				callback(data);
	        	return data;
			}
        },
        
        error: function(xhr, ajaxOptions, thrownError) {

            var error = "no es posible la conexión, compruebe si dispone de acceso a internet.";
            if (xhr.status == 404) {
                error = "no es posible conectar con el servidor, intentelo de nuevo más tarde.";
            }
            
            // Error para desarrollador
            //alert('WS: error on ' + method + ' error: ' + error);
            
            alert("Problema de red: "+error);
            
            $.mobile.loading("hide");
    	}
	});
}