/* Copyright (c) 2012 Mobile Developer Solutions. All rights reserved.
 * This software is available under the MIT License:
 * The MIT License
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies 
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

function roundNumber(num) {  // Helper function
    var dec = 2;
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}

var accel_buf1_disponible = true, escrito1 = false, escrito2 = true;
var accel_buf1=[];
var accel_buf2=[];

// api-accelerometer
var accelerationWatch = null;
function updateAcceleration(acceleration) {
    document.getElementById('x').innerHTML = roundNumber(acceleration.x);
    document.getElementById('y').innerHTML = roundNumber(acceleration.y);
    document.getElementById('z').innerHTML = roundNumber(acceleration.z);
    document.getElementById('accel_timestamp').innerHTML = acceleration.timestamp;
    
    // Guardamos los datos usando una tecnica de doble buffer, que cambia
    // al almacenar 100 tripletas (x,y,z)
    if(accel_buf1_disponible){
    	accel_buf1.push("{\"x\":"+acceleration.x);
	    accel_buf1.push("\"y\":"+acceleration.y);
	    accel_buf1.push("\"z\":"+acceleration.z);
	    accel_buf1.push("\"timestamp\":"+acceleration.timestamp+"}");
		//accel_buf1.push(acceleration);
	    
	}
	else{
		//accel_buf2.push(acceleration);
		//vaciar_buf1 = true;
		accel_buf2.push("\"x\":"+acceleration.x);
	    accel_buf2.push("\"y\":"+acceleration.y);
	    accel_buf2.push("\"z\":"+acceleration.z);
	    accel_buf2.push("\"timestamp\":"+acceleration.timestamp);
	}
	
	// Si esta lleno...
	if(accel_buf1.length>=10 && escrito2){
		escrito2 = false;
		accel_buf1_disponible = false;
		// Vaciamos el buffer en el fichero
		writeFile();
	}
	
	// Una vez confirmada la escritura y el vaciado del bufer 1, tenemos que vaciar 
	// el buffer 2 cuando llegue a 100 y volver a activar el 1
	if(accel_buf2.length>=10 && escrito1){
		escrito1 = false;
		accel_buf1_disponible = true;
		// Vaciamos el buffer en el fichero
		writeFile();
	}
	
}
function toggleAccel() {
    if (accelerationWatch !== null) {
        navigator.accelerometer.clearWatch(accelerationWatch);
        updateAcceleration({
            x : "",
            y : "",
            z : "",
            timestamp: ""
        });
        accelerationWatch = null;
    } else {
        var options = {};
        options.frequency = 1000;
        accelerationWatch = navigator.accelerometer.watchAcceleration(
                updateAcceleration, function(ex) {
                    alert("Accelerometer Error!");
                }, options);
    }
}

function getAccel() {
    if (accelerationWatch !== null) {
        navigator.accelerometer.clearWatch(accelerationWatch);
        updateAcceleration({
            x : "",
            y : "",
            z : "",
            timestamp: ""
        });
        accelerationWatch = null;
    }
    navigator.accelerometer.getCurrentAcceleration(
            updateAcceleration, function(ex) {
                alert("Accelerometer Error!");
            });
}