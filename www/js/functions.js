/*
	@ Universidad de Granada. Granada @ 2014
	@ Rosana Montes Soldado y Alejandro Molina Salazar (amolinasalazar@gmail.com). Granada @ 2014

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

	// If the box is checked, save the data
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
 * the saved content in the local storage to the text boxes on the login page. 
 */
function cargarDatos(){
	
	// Load image using the path in js/configuration.js
	$("#login_img").attr("src",login_img);
	
	// Recovery login data from local storage
	var urlsitio = window.localStorage.getItem("urlsitio");	
   	var u = window.localStorage.getItem("username");
   	var p = window.localStorage.getItem("password");

	// If we have stored data and the remember box was checked
	if(urlsitio!=null && u!=null && p!=null){
		// Fill the text box
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

	// Retrieve info of User: courses and enrolled feedbacks
	moodleWSCall("core_webservice_get_site_info", {}, function(data_user){

		// Return the course list with some additional info(skip course ID=1)
		moodleWSCall("core_enrol_get_users_courses", {userid: data_user.userid}, function(user_courses){
			
			// Generate a ID list of the courses (now including general feedbacks of course ID=1)
			id_cursos = null;
			id_cursos = [];
			id_cursos[0] = 1;
			for(var i=0; i<user_courses.length; i++){
				// Skip hidden courses
				if(user_courses[i].visible)
					id_cursos[i+1] = user_courses[i].id;
			}
			
			// Retrieve info about enrolled feedback of the user 
			moodleWSCall("local_fbplugin_get_feedbacks_by_courses", {courseids: id_cursos}, function(feedbacks){
				moodleWSCall("mod_sepug_get_sepug_instance", {}, function(sepug_instance){
					moodleWSCall("mod_sepug_get_not_submitted_enrolled_courses_as_student", {}, function(sepug_courses){

				// Declarations
				id_cursos = null;
				id_cursos = [];
				var nombres_cursos = [];
				var nombre_sepug = "";
				var fb_cursos = [];
				var fb_generales = [];
				var fb_curso = false;
				var sepug_cursos = [];
				
				// Retrieve ID list of courses that they have at least one feedback				
    			for(var i=0; i<feedbacks.length; i++){
    				// General feedback
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
        	
				
    			//-- SEPUG --//
				if(sepug_instance!=null){
					
					// If is not close already
					var current_time=new Date().getTime()/1000;
					if(!(sepug_instance.timeopen > current_time || sepug_instance.timeclose < current_time || 
							sepug_instance.timeclosestudents < current_time)){
						nombre_sepug = sepug_instance.name;
						for(var i=0; i<sepug_courses.length; i++){
							
							sepug_cursos.push(sepug_courses[i]);

						}
					}	
				}
			
			// Previus feedback cleaned
			$("#grupo_general").empty();
			$("#grupo_cursos").empty();
			
			// Locate DOM elements of HOME
			var grupo_general = document.getElementById("grupo_general");
			var grupo_cursos = document.getElementById("grupo_cursos");
			
			// General FB
			if(fb_generales.length != 0){
				
				for(var i=0; i<fb_generales.length; i++){
					var a = document.createElement("a");
					// If we don't do this, it will return a random i value
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
			
			// Courses FB
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
					
					// Add a feedback button
					var a = document.createElement("a");
					// If we don't do this, it will return a random i value
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
			if(sepug_cursos.length != 0){
				for(var i=0; i<sepug_cursos.length; i++){
					
					// Search for previus DIV containers of the course
					var div = document.getElementById(sepug_cursos[i].fullname);
					
					// If the course doesn't have a DIV container, we create a new one
					if(div==null){
						div = document.createElement("div");
						div.setAttribute('data-role', 'collapsible');
						div.setAttribute('id', sepug_cursos[i].fullname);
						div.innerHTML = "<h3>" + sepug_cursos[i].fullname + "</h3>";
					}
					
					// Add a feedback button
					var a = document.createElement("a");
					// If we don't do this, it will return a random i value
					a.onclick = (function() {
						var currentI = i;
						return function() { 
							cargarPaginaInfoSepug(currentI, sepug_cursos, sepug_instance);
						}
					})();
					a.setAttribute('data-role', 'button');
					a.setAttribute('data-icon', 'carat-r');
					if(sepug_courses[i].groupid == 0){
						a.innerHTML = nombre_sepug;
					}
					else{
						a.innerHTML = nombre_sepug+" - Grupo: "+sepug_courses[i].groupname;
					}
					div.appendChild(a);
					grupo_cursos.appendChild(div);
				}
			}

			if(fb_cursos.length == 0 && sepug_cursos.length == 0){
				var p = document.createElement("p");		
				p.innerHTML = "En estos momentos, usted no dispone de ninguna encuesta asociada a algun curso.";
				p.setAttribute('align', 'justify');
				var div = document.createElement("div");
				div.setAttribute('data-role', 'content');
				div.appendChild(p);
				grupo_cursos.appendChild(div);
			}
			

			// Change the page to HOME
			$("#home").trigger("create");
			$("#panel").trigger( "updatelayout" );
        	$.mobile.changePage("#home",{allowSamePageTransition:true,reloadPage:false,changeHash:true,transition:"pop"});
        	$.mobile.loading("hide");
        	
			});});});
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
	
	// Loader
	$.mobile.loading( "show", {
	  text: "Cargando...",
	  textVisible: true,
	  theme: "b",
	  html: ""
	});
	
	// Clean screen
	$("#info").empty();
	
	// Create elements of the information page of the feedback
	var info = document.getElementById("info");
	
	// TITLE AND DESCRIPTION
	info.innerHTML = "<h2>"+fb[id_btn].name+"</h2><h3>"+fb[id_btn].intro+"</h3>";
	
	// TABLE
	var table = document.createElement("table");
	table.setAttribute('class', 'ui-responsive table-stroke');
	table.setAttribute('data-model', 'columntoggle');
	table.innerHTML = "<thead><tr><td>                        </td><td>                 </td></tr></thead>";
	
	// ANONYMOUS
	if(fb[id_btn].anonymous==1){
		table.innerHTML += "<tbody><tr><td>Anónima</td><th>Sí</th></tr>";
	}
	else{
		table.innerHTML += "<tbody><tr><td>Anónima</td><th>No</th></tr>";
	}
		
	// MULTIANSWER
	if(fb[id_btn].multiple_submit==1){
		table.innerHTML += "<tr><td>Multi-respuesta</td><th>Sí</th></tr>";
	}
	else{
		table.innerHTML += "<tr><td>Multi-respuesta</td><th>No</th></tr>";
	}
		
	// TIME OPEN-CLOSE
	var current_time=new Date().getTime()/1000;
	// FEEDBACK CLOSED
	if(fb[id_btn].timeopen > current_time || (fb[id_btn].timeclose < current_time && fb[id_btn].timeclose > 0)){
		table.innerHTML += "<tr><td>Plazo</td><th>Cerrado</th></tr></tbody>";
		info.appendChild(table);
		
		var date_open = new Date(fb[id_btn].timeopen*1000);
		var date_close = new Date(fb[id_btn].timeclose*1000);
		
		// Only has timeclose and is closed
		if(fb[id_btn].timeopen == 0){
			info.innerHTML += "<h4><code>La encuesta se cerró el día "+date_close.getDate()+"/"+(+date_close.getMonth()+1)+"/"+date_close.getFullYear()+
			" a las "+date_close.getHours()+":"+date_close.getMinutes()+" horas.</code></h4><p></p>";
		}
		// Only has timeopen and is closed
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
	
	// OPEN FEEDBACK
	else{
		table.innerHTML += "<tr><td>Plazo</td><th>Abierto</th></tr></tbody><p></p>";
		info.appendChild(table);
		
		// If it has a timeclose, we alert about the date
		if(fb[id_btn].timeclose != 0){
			var date_close = new Date(fb[id_btn].timeclose*1000);
			info.innerHTML += "<h4><code>La encuesta se cerrará el día "+date_close.getDate()+"/"+(+date_close.getMonth()+1)+"/"+date_close.getFullYear()+
			" a las "+date_close.getHours()+":"+date_close.getMinutes()+" horas.</code></h4><p></p>";
		}
		
		// Start feedback button
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
	
	// Create styles again, change page and hide loader
	$("#info-fb").trigger("create");
	$.mobile.changePage("#info-fb",{allowSamePageTransition:true,reloadPage:false,changeHash:true,transition:"slide"});
	$.mobile.loading("hide");
}

/**
 * Using the content obtained before in the "cargarHome()" function, it 
 * charges the information page of the feedback selected and "info-fb" pass to 
 * be the active page.
 * 
 * @param {int} id_btn The index to navigate on the "sepug_cursos" object and access 
 *  to the selected feedback data.
 * @param {Object} fb Contains the id of the course.
 * @param {Object} fb Contains all the data of the SEPUG instance.
 */
function cargarPaginaInfoSepug(id_btn, sepug_cursos, sepug_instance){
	
	// Loader
	$.mobile.loading( "show", {
	  text: "Cargando...",
	  textVisible: true,
	  theme: "b",
	  html: ""
	});
	
	// Clean screen
	$("#info").empty();
	
	// Create elements of the information page of the feedback
	var info = document.getElementById("info");
	
	// TITLE AND DESCRIPTION
	info.innerHTML = "<h2>"+sepug_instance.name+"</h2><h3 align=\"justify\">SEPUG: Sistema de Evaluación del Profesorado de la Universidad de Granada, " +
			"es una herramienta de control de calidad y evaluación del profesorado, para la valoración de las tareas docentes " +
			"por parte del alumnado en las titulaciones de grado o posgrado. Los estudiantes a través de la cumplimentación ANÓNIMA " +
			"de un BREVE cuestionario, pueden valorar a los profesores de las asignaturas que cursan.</h3>";
	
	// TABLE
	var table = document.createElement("table");
	table.setAttribute('class', 'ui-responsive table-stroke');
	table.setAttribute('data-model', 'columntoggle');
	table.innerHTML = "<thead><tr><td>                        </td><td>                 </td></tr></thead>";
	
	// ANONYMOUS
	table.innerHTML += "<tbody><tr><td>Anónima</td><th>Sí</th></tr>";
		
	// MULTIANSWER
	table.innerHTML += "<tr><td>Multi-respuesta</td><th>No</th></tr>";
	
	// OPEN SURVEY
	table.innerHTML += "<tr><td>Plazo</td><th>Abierto</th></tr></tbody><p></p>";
	info.appendChild(table);
	
	// If it has a timeclose, we alert about the date
	if(sepug_instance.timeclosestudents != 0){
		var date_close = new Date(sepug_instance.timeclosestudents*1000);
		info.innerHTML += "<h4><code>La encuesta se cerrará el día "+date_close.getDate()+"/"+(+date_close.getMonth()+1)+"/"+date_close.getFullYear()+
		" a las "+date_close.getHours()+":"+date_close.getMinutes()+" horas.</code></h4><p></p>";
	}
	
	// Start survey button
	var a = document.createElement("a");
	a.onclick = (function() {
		var currentId = id_btn;
		return function() { 
			cargarSEPUG(currentId, sepug_cursos);
		}
	})();
	a.setAttribute('data-role', 'button');
	a.setAttribute('data-icon', 'carat-r');
	var texto = document.createTextNode("Comenzar Encuesta");
	a.appendChild(texto);
	info.appendChild(a);
	
	// Create styles again, change page and hide loader
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
	
	// Loader
	$.mobile.loading( "show", {
	  text: "Generando encuesta...",
	  textVisible: true,
	  theme: "b",
	  html: ""
	});
	
	// Clean elements
	$("#fb_content").empty();
	$("#btn_fb_cancelar").empty();
	$("#btn_fb_enviar").empty();
	
	var fb_title = document.getElementById("fb_head");
	fb_title.innerHTML = "<h1>"+fb[id_btn].name+"</h1>";
	
	// Load questions
	moodleWSCall("local_fbplugin_get_feedback_questions", {feedbackid: fb[id_btn].id}, function(fb_questions){

		// If there is at least one question that can be answered
		if(fb_questions.length!=0){
			
			var contestable = false;
			var fb_content = document.getElementById("fb_content");
				
			// Sort questions by position
			fb_questions.sort(function(a, b){return a.position-b.position;});
			
			// Create FB elements
			for(var i=0; i<fb_questions.length; i++){
				
				var div = document.createElement("div");
				div.setAttribute('class','ui-body');
				fb_content.appendChild(div);
				
				// Check if it's a mandatory question or not
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
				
				// SHORT TEXT - range chars: 5-255
				if(fb_questions[i].typ == "textfield"){
					
					contestable = true;
					
					// Retrieve max. characters
					var maxcarac = fb_questions[i].presentation.split("|");
					
					// Create label
					var label = document.createElement("label");
					label.setAttribute('for', 'p'+i);
					label.innerHTML = fb_questions[i].name+" (caracteres máx.: "+maxcarac[1]+")";
					if(required)
						label.innerHTML += "*";
					
					// Create input
					var input = document.createElement("input");
					input.setAttribute('type', 'text');
					input.setAttribute('id', 'p'+i);
					input.setAttribute('maxlength', maxcarac[1]);
					
					div.appendChild(label);
					div.appendChild(input);
					fb_content.appendChild(div);
					
				}
				
				// LARGE TEXT - row*col (we give it a fixed size)
				if(fb_questions[i].typ == "textarea"){
					
					contestable = true;
					
					// Create label
					var label = document.createElement("label");
					label.setAttribute('for', 'p'+i);
					label.innerHTML = fb_questions[i].name;
					if(required)
						label.innerHTML += "*";
					
					// Create textarea
					var textarea = document.createElement("textarea");
					textarea.setAttribute('id', 'p'+i);
					textarea.setAttribute('cols', '40');
					textarea.setAttribute('rows', '8');
					
					div.appendChild(label);
					div.appendChild(textarea);
					fb_content.appendChild(div);
					
				}
				
				// NUMERIC INPUT - SLIDER
				if(fb_questions[i].typ == "numeric"){
					
					contestable = true;
					
					// Retrieve range
					var rangonum = fb_questions[i].presentation.split("|");
					
					// Create label
					var label = document.createElement("label");
					label.setAttribute('for', 'p'+i);
					label.innerHTML = fb_questions[i].name+" (rango: "+rangonum[0]+"-"+rangonum[1]+")";
					if(required)
						label.innerHTML += "*";
						
					// Create input
					var input = document.createElement("input");
					input.setAttribute('type', 'range');
					input.setAttribute('min', rangonum[0]);
					input.setAttribute('max', rangonum[1]);
					input.setAttribute('id', 'p'+i);
					
					div.appendChild(label);
					div.appendChild(input);
					fb_content.appendChild(div);
				}
				
				// MULTICHOICE
				if(fb_questions[i].typ == "multichoice"){
					
					contestable = true;
					
					// Field "presentation":
					// d>>>>>: dropdown list
					// r>>>>>: radio buttons
					// c>>>>>: check buttons
					// at the end of "presentation":
					// <<<<<1: horizontal view
					// nada: vertical view
					
					// Options:
					// i: not analized empty sends (DON'T CARE)
					// h: hidden option "No Seleccionada" (ONLY WORKS WITH RADIO BUTTONS, SO WE WILL AVOID ADD THE OPTION IN THE OTHER TYPES)
					
					// Delete head of "presentation" (and tail if exists) 
					var respuestas_juntas = fb_questions[i].presentation.substring(6, fb_questions[i].presentation.length);
					// If is horizontal view
					var horizontal = false;
					if (respuestas_juntas.match(/<<<<<1/g) != null){ // vertical
						respuestas_juntas = respuestas_juntas.substring(0, respuestas_juntas.length-6);
						horizontal = true;
					}
					
					// Save all possible answers in array
					var respuestas = [];
					respuestas = respuestas_juntas.split("|");
					
					// Resolve type of multichoice: radio or checkbox
					if(fb_questions[i].presentation.charAt(0) == 'r' || fb_questions[i].presentation.charAt(0) == 'c'){
						
						if(fb_questions[i].presentation.charAt(0) == 'r'){
							var tipo_multi = "radio";
							// OPTIONS (SOLO EN RADIO BUTTON)
							// Check if "No Seleccionada" is active and add the option
							if(fb_questions[i].options.match(/h/g) == null){
								respuestas.splice(0,0,"No Seleccionada");
							}
						}
						else
							var tipo_multi = "checkbox";
						
						// Create fieldset
						var fieldset = document.createElement("fieldset");
						fieldset.setAttribute('data-role', 'controlgroup');
						if(horizontal)
							fieldset.setAttribute('data-type', 'horizontal');
						
						// Create legend (question)
						var legend = document.createElement("legend");
						legend.innerHTML = fb_questions[i].name;
						if(required)
							legend.innerHTML += "*";
						
						// Each answer:
						for(var j=0; j<respuestas.length ; j++){	
							var input = document.createElement("input");
							input.setAttribute('type', tipo_multi);
							input.setAttribute('name', 'p'+i);
							input.setAttribute('id', 'p'+i+'r'+j); // question number and answer number
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
						// SELECT (dropdown list)
						
						// By default, we add a blank option at the beginning (not answered)
						respuestas.splice(0,0,"");
	
						// Create general label
						var label = document.createElement("label");
						label.setAttribute('for', 'p'+i+'r'+j);
						label.setAttribute('class', 'select');
						label.innerHTML = fb_questions[i].name;
						if(required)
							label.innerHTML += "*";
						
						// Create select
						var select = document.createElement("select");
						select.setAttribute('id', 'p'+i);
					
						// Each answer:
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
			
			// If there is at least one question that can be answered
			if(contestable){
			
				var btn_fb_enviar = document.getElementById("btn_fb_enviar");
				var btn_fb_cancelar = document.getElementById("btn_fb_cancelar");
				
				// Cancel button
				var a = document.createElement("a");
				a.setAttribute('data-role', 'button');
				a.setAttribute('data-rel', 'back');
				a.setAttribute('data-icon', 'delete');
				a.innerHTML = "Cancelar";
				btn_fb_cancelar.appendChild(a);
				
				// Send button
				var a = document.createElement("a");
				a.setAttribute('data-role', 'button');
				a.setAttribute('data-icon', 'check');
				a.onclick = function(){enviarFB(fb_questions, fb[id_btn].id);};
				a.innerHTML = "Enviar";
				btn_fb_enviar.appendChild(a);
			}
			else{
				
				// Delete printed elements that can not be answered
				$("#fb_content").empty();
				var div = document.createElement("div");
				div.setAttribute('class','ui-body');
				fb_content.appendChild(div);
				
				var p = document.createElement("p");		
				p.innerHTML = "Esta encuesta no dispone de ninguna pregunta todavía.";
				div.appendChild(p);
				fb_content.appendChild(div);
				
				// Cancel button
				var a = document.createElement("a");
				a.setAttribute('data-role', 'button');
				a.setAttribute('data-rel', 'back');
				a.setAttribute('data-icon', 'delete');
				a.innerHTML = "Cancelar";
				fb_content.appendChild(a);
			}
			
		}// end if
		
		// If there are no questions..
		else{
			var fb_content = document.getElementById("fb_content");
			
			var div = document.createElement("div");
			div.setAttribute('class','ui-body');
			fb_content.appendChild(div);
			
			var p = document.createElement("p");		
			p.innerHTML = "Esta encuesta no dispone de ninguna pregunta todavía.";
			div.appendChild(p);
			fb_content.appendChild(div);
			
			// Cancel button
			var a = document.createElement("a");
			a.setAttribute('data-role', 'button');
			a.setAttribute('data-rel', 'back');
			a.setAttribute('data-icon', 'delete');
			a.innerHTML = "Cancelar";
			fb_content.appendChild(a);
		}
		
		// Create styles again, change page and hide loader
		$("#fb").trigger("create");
		$.mobile.changePage("#fb",{allowSamePageTransition:true,reloadPage:false,changeHash:true,transition:"pop"});
		$( ".selector" ).loader( "hide" );
	});	
}

/**
 * Using the same content obtained before in the "cargarHome()" function and 
 * more extra data about the questions of the feedback calling "get_feedback_questions" 
 * Web Service function, it generates a feedback and changes the active page by "sepug_cursos".
 * 
 * @param {int} id_btn The index to navigate on the "sepug_cursos" object and access 
 *  to the selected survey data.
 * @param {Object} sepug_cursos Contains the id of the course.
 */
function cargarSEPUG(id_btn, sepug_cursos){
	
	// Loader
	$.mobile.loading( "show", {
	  text: "Generando encuesta...",
	  textVisible: true,
	  theme: "b",
	  html: ""
	});
	
	// Clean elementsBorramos los elementos para volver a generarlos
	$("#fb_content").empty();
	$("#btn_fb_cancelar").empty();
	$("#btn_fb_enviar").empty();
	
	var fb_title = document.getElementById("fb_head");
	fb_title.innerHTML = "<h1>"+"SEPUG - "+sepug_cursos[id_btn].fullname+"</h1>";
	
	// Load questions
	moodleWSCall("mod_sepug_get_survey_questions", {courseid: sepug_cursos[id_btn].id}, function(sepug_questions){

		// If there is at least one question
		if(sepug_questions.length!=0){
			
			var respuestas = [];
			var fb_content = document.getElementById("fb_content");
			
			// Create FB elements
			for(var i=0; i<sepug_questions.length; i++){
				
				var div = document.createElement("div");
				div.setAttribute('class','ui-body');
				fb_content.appendChild(div);
				
				// Save each answer in array
				respuestas = null;
				respuestas = sepug_questions[i].options.split(",");
				
				// SEPUG has only two types, typo 1: radio y typo 2: select
				
				// MULTICHOICE - radio
				if(sepug_questions[i].type == 1){

					// Create fieldset
					var fieldset = document.createElement("fieldset");
					fieldset.setAttribute('data-role', 'controlgroup');
					
					// Create legend (question)
					var legend = document.createElement("legend");
					legend.innerHTML = sepug_questions[i].text;
					legend.innerHTML += "*";
					
					// Each answer:
					for(var j=0; j<respuestas.length ; j++){	
						var input = document.createElement("input");
						input.setAttribute('type', 'radio');
						input.setAttribute('name', 'p'+i);
						input.setAttribute('id', 'p'+i+'r'+j); // question number and answer number
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
				} // end if
				
				// MULTICHOICE - select
				if(sepug_questions[i].type == 2){
				
					// By default, we add a blank option at the beginning (not answered)
					respuestas.splice(0,0,"");
	
					// Create general label
					var label = document.createElement("label");
					label.setAttribute('for', 'p'+i+'r'+j);
					label.setAttribute('class', 'select');
					label.innerHTML = sepug_questions[i].text;
					label.innerHTML += "*";
					
					// Create select
					var select = document.createElement("select");
					select.setAttribute('id', 'p'+i);

					// Each answer:
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
				
				
			} // end for
			
			var btn_fb_enviar = document.getElementById("btn_fb_enviar");
			var btn_fb_cancelar = document.getElementById("btn_fb_cancelar");
			
			// Cancel button
			var a = document.createElement("a");
			a.setAttribute('data-role', 'button');
			a.setAttribute('data-rel', 'back');
			a.setAttribute('data-icon', 'delete');
			a.innerHTML = "Cancelar";
			btn_fb_cancelar.appendChild(a);
			
			// Send button
			var a = document.createElement("a");
			a.setAttribute('data-role', 'button');
			a.setAttribute('data-icon', 'check');
			a.onclick = function(){enviarSEPUG(sepug_questions, sepug_cursos[id_btn]);};
			a.innerHTML = "Enviar";
			btn_fb_enviar.appendChild(a);
	
		}// end if
		
		// Create styles again, change page and hide loader
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
	
	// DATABASE STRUCTURE OF TABLE "FEEDBACK_VALUE"
	// MULTICHOICE:
	// RADIO BUTTON(change, sum 1 to the ID or maybe leave it equal) -> options with id[1..N], "No seleccionada" as first option with id=0, ex: 2
	// CHECK BOX(sum 1 to the ID's) -> options with id[1..N], "No seleccionada" doesn't work here (don't do anything), ex: 2|3 
	// SELECT(same as JQuery) -> add blank option with id=0, "No seleccionad" doesn't work here (just a blank option), ex: 1 
	
	// Create object to send to the DB
	var valores = [];
	var value;
	var salir = false;
	
	for(var i=0; i<fb_questions.length && salir != true; i++){
		
		value = "";
		
		// If its a expected type
		if(fb_questions[i].typ == "multichoice" || fb_questions[i].typ == "numeric" || fb_questions[i].typ == "textarea" ||
		fb_questions[i].typ == "textfield"){
			
			// If it's a mandatory question, we secure that it has value
			if(fb_questions[i].typ == "multichoice" && fb_questions[i].presentation.charAt(0) != 'd'){
				
				if($('input[name=p'+i+']:checked', '#FBform').val()==undefined && fb_questions[i].required==1){
					navigator.notification.alert("Compruebe si ha respondido todas las preguntas obligatorias.", null, "Información");
					salir = true;
				}
				else{
					if(fb_questions[i].presentation.charAt(0) == 'r'){ // RADIO BUTTON
						
						// "No seleccionada" is checked or not
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
						// Delete last slash
						value = value.slice(0,value.length-1);
					}
				}			
			}
			else{

				// SELECT
				if(fb_questions[i].typ == "multichoice" && fb_questions[i].presentation.charAt(0) == 'd'){
					// If the first option (blank) is selected..
					if(($("#p"+i).val()==0 || $("#p"+i).val()=="") && fb_questions[i].required==1){
						navigator.notification.alert("Compruebe si ha respondido todas las preguntas obligatorias.", null, "Información");
						salir = true;
					}
					else{
						value = $("#p"+i).val();
					}
				}
				else{
					// OTHER TYPES
					if($("#p"+i).val()=="" && fb_questions[i].required==1){
						navigator.notification.alert("Compruebe si ha respondido todas las preguntas obligatorias.", null, "Información");
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
	
	// If all is ok, start the send
	if(salir == false){
		
		moodleWSCall("local_fbplugin_complete_feedback", {feedbackid: fb_id , itemvalues: valores}, function(result){		
            
            navigator.notification.alert("Encuesta registrada satisfactoriamente.", null, "Información");
            $.mobile.back();
            
    	});
	}
}

/**
 * Using the question data obtained in "cargarSEPUG(id_btn, fb)" function, it will process
 * the completed feedback by the user and will send the results to register them in 
 * the Moodle data base by calling "mod_sepug_submit_survey" Web Service function.
 * 
 * @param {Object} sepug_questions Contains all the questions of the survey.
 * @param {Object} sepug_course Contains the course id and group id, necessary to store correctly the data
 */
function enviarSEPUG(sepug_questions, sepug_course){ 
	
	// Create the object to send
	var valores = [];
	var value;
	var salir = false;
	
	var current_time=new Date().getTime()/1000;
	
	for(var i=0; i<sepug_questions.length && salir != true; i++){
		
		value = null;
		
		// If it's a expected type
		if(sepug_questions[i].type == 1){
			
			if($('input[name=p'+i+']:checked', '#FBform').val()==undefined){
				navigator.notification.alert("Compruebe si ha respondido todas las preguntas obligatorias.", null, "Información");
				salir = true;
			}
			else{
				value = +$('input[name=p'+i+']:checked', '#FBform').val()+1;
			}			
		}
		
		else if(sepug_questions[i].type == 2){
			
			// If the first option (blank) is selected..
			if(($("#p"+i).val()==0 || $("#p"+i).val()=="")){
				navigator.notification.alert("Compruebe si ha respondido todas las preguntas obligatorias.", null, "Información");
				salir = true;
			}
			else{
				value = +$("#p"+i).val();
			}
		}

		valores.push({questionid: sepug_questions[i].id, time: parseInt(current_time), answer: value});
	}
	
	// If all is ok, start the send
	if(salir == false){
		
		moodleWSCall("mod_sepug_submit_survey", {courseid: sepug_course.id, groupid: sepug_course.groupid, itemvalues: valores}, function(result){		
            
            navigator.notification.alert("Encuesta registrada satisfactoriamente.", null, "Información");
            $.mobile.back();
            
    	});
	}
}

/**
 * SAML login
 */
function customLogin(){

	URL = $('#urlsitio').val();
	passport = Math.random() * 1000;
	
	var launchSiteURL = URL + "/local/fbplugin/launch.php?service=" + WS_short_name + "&passport=" + passport;
	var ref = cordova.InAppBrowser.open(encodeURI(launchSiteURL), '_blank', 'location=yes');
	
	
	ref.addEventListener('loadstart', function(event) { 
		ref.close();
		var serverLaunchFound = event.url.search("opinaugr://token=");
		if(serverLaunchFound!=-1){
			appLaunchedByURL(event.url);
		}
	});
	
	ref.addEventListener('loaderror', function(event) { 
		navigator.notification.alert("No es posible cargar el sitio Web.", null, "Error");
		return;
	});
	
    return;
}

/**
 * SAML login
 */
function appLaunchedByURL(url) {

    url = url.replace("opinaugr://token=", "");
        	// Decode from base64.
    url = atob(url);
    var params = url.split(":::");
    var signature = hex_md5(URL + passport);
    
    if (signature != params[0]) {
	    if (URL.indexOf("https://") != -1) {
	        URL = URL.replace("https://", "http://");
	    } else {
	        URL = URL.replace("http://", "https://");
	    }
	    signature = hex_md5(URL + passport);
	}

    if (signature == params[0]) {
        login_state = true;
        mytoken = params[1];
        cargarHome();
        return;
        		
    } else {

      	console.log("Invalid signature in the URL request yours: " + params[0] + " mine: " + signature + "for passport " + passport);
        login_state = false;
    }
    return false;

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
	
	// User data
	URL = $("#urlsitio").val();
    username = $("#nombredeusuario").val();
    var password = $("#clave").val();
    
    if(URL=="" || username=="" || password==""){
    	navigator.notification.alert("Comprueba si has rellenado todos los campos.", null, "Información");
    	$.mobile.loading("hide");
    	return;
    }
    
    var loginURL = URL+'/login/token.php';
    mytoken = "";
    login_state = false;

    // Try to obtain a valid token
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
    	if (respuesta.error) {
    		var error = "compruebe su usuario y contraseña.";

            if (typeof(respuesta.error) != 'undefined') {
                error = respuesta.error;
            }
            navigator.notification.alert(error, null, "Acceso denegado");
            login_state = false;
            $.mobile.loading("hide");
    		
    	}
    	else{
    		
    		if(respuesta.token){
    			//NORMAL LOGIN
            	// Store token to use it later for the WS queries
            	mytoken = respuesta.token;
                login_state = true;
    		}
    		
    	}
        
        return;
    },
        
    error:function(xhr, textStatus, errorThrown) {
    	
        var error = "compruebe si los datos introducidos son correctos o intentelo de nuevo más tarde.";
        if (xhr.status == 404) {
        	error = "no es posible conectar con el servidor, intentelo de nuevo más tarde.";
        }
        
        navigator.notification.alert(error, null, "Información");

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
        	
            // Some functions can return null
            if(data != null){
            	
				// If returns an error..
	            if (typeof(data.exception) != 'undefined') {
	                if (data.errorcode == "invalidtoken" || data.errorcode == "accessexception") {
	                    // Connection lost
	                    navigator.notification.alert('Vuelva a iniciar sesión en la aplicación.', null, "Error");
	                    $.mobile.changePage("#inicio");
	                    $.mobile.loading("hide");
	                    return;
	                } else {
	                	navigator.notification.alert(data.message, null, "Información");
	                	$.mobile.loading("hide");
	                }
	                return;
	            }
	
	            if (typeof(data.debuginfo) != 'undefined') {
	            	navigator.notification.alert(data.message, null, "Información");
	                $.mobile.loading("hide");
	                return;
	            }
	
				// If all is ok, we get the data object
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
            navigator.notification.alert(xhr.status+": "+thrownError, null, "Error");
            $.mobile.loading("hide");
    	}
	});
}
