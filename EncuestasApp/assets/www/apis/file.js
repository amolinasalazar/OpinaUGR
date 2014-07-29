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

var myFS = 0;
var myFileEntry = 0;
function failFS(evt) {
    console.log("File System Error: " + evt.target.error.code);
    //document.getElementById('file-system-text').innerHTML = 
      //  "<strong>File System Error: " + evt.target.error.code + "</strong>";  
}
function writeFail(error) {
    console.log("Create/Write Error: " + error.code);
    //document.getElementById('file-status').innerHTML = 
        //"Create/Write <strong>Error: " + error.code + "</strong>";   
}

// api-file  Create
function createGotNewFile(file){
    //document.getElementById('file-status').innerHTML = "Created: <strong>" + file.fullPath + "</strong>";
    document.getElementById('file-read-text').innerHTML = '';  
    document.getElementById('file-read-dataurl').innerHTML = '';
}
function createGotFileEntry(fileEntry) {
    myFileEntry = fileEntry;
    fileEntry.file(createGotNewFile, writeFail);
}
function gotFS(fileSystem) {
    myFS = fileSystem;
    console.log(fileSystem.name);
    console.log(fileSystem.root.name);
    //document.getElementById('file-system-text').innerHTML = "File System: <strong>" + fileSystem.name + "</strong> " +
           //"Root: <strong>" + fileSystem.root.name + "</strong>";
    fileSystem.root.getFile("salida.json", {create: true, exclusive: false}, createGotFileEntry, writeFail);
}
function createFile() { // button onclick function
    if (myFS) {
        gotFS(myFS);
    } else {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, failFS);
    }
}

//api-file  FileWriter
function gotFileWriter(writer) {
	

	// Escribimos el primer caracter necesario JSON
	if(primer_caracter){
		writer.seek(writer.length);
		writer.write("[");
	}
	else{
		// Terminamos de parsear el fichero con estrucutura JSON
	    if(off){
	    	writer.seek(writer.length);
			writer.write(","+wifi_buf.toString()+","+geo_buf.toString()+"]");
		}
		else{
			// Escribimos en el fichero con la tecnica del doble buffer
			if(accel_buf1_disponible){
				writer.seek(writer.length);
		    	writer.write(accel_buf2.toString());
		    	var text = "escribimos en fichero desde bufer2 elementos: "+accel_buf2.length;
		    	document.getElementById('escritura_buffer1').innerHTML = text;
		    	accel_buf2 = null;
		    	accel_buf2 = [];
		    	escrito2 = true;
		    }else{
		    	writer.seek(writer.length);
		    	writer.write(accel_buf1.toString());
		    	var text = "escribimos en fichero desde bufer1 elementos:"+accel_buf1.length;
		    	document.getElementById('escritura_buffer2').innerHTML = text;
		    	accel_buf1 = null;
		    	accel_buf1 = [];
		    	escrito1 = true;
		    }
	    }   
	}
}
function gotFileEntry(fileEntry) {
    fileEntry.createWriter(gotFileWriter, writeFail);
}
function writeFile() { // button onclick function
    if (myFileEntry) {
        gotFileEntry(myFileEntry);        
    } else {
        document.getElementById('file-status').innerHTML ="Status: <strong>Error: File Not Created!</strong>";
    }
}

// api-file  FileReader
function readFail(error) {
    console.log("Read Error: " + error.code);
    document.getElementById('file-read-text').innerHTML ="<strong>Read Error: " + error.code + "</strong>";
    document.getElementById('file-read-dataurl').innerHTML = '';
}
function readerreadDataUrl(file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        console.log("Read as data URL");
        console.log(evt.target.result);
        document.getElementById('file-read-dataurl').innerHTML =
            "<strong>" + evt.target.result.slice(0, 38) + "...</strong>";
    };
    reader.readAsDataURL(file);
}
function readerreadAsText(file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        console.log("Read as text");
        console.log(evt.target.result);
        document.getElementById('file-read-text').innerHTML = "<strong>" + evt.target.result + "</strong>";
    };
    reader.readAsText(file);
}
function readerGotFile(file){
    readerreadDataUrl(file);
    readerreadAsText(file);
}
function readerGotFileEntry(fileEntry) {
    fileEntry.file(readerGotFile, readFail);
}
function readFile() { // button onclick function
    if (myFileEntry) {
        readerGotFileEntry(myFileEntry);        
    } else {
        document.getElementById('file-status').innerHTML = "Status: <strong>Error: File Not Created!</strong>";
        return false;
    }    
}

// api-file  Remove File
function removeSuccess(entry) {
    document.getElementById('file-status').innerHTML = "Removed: <strong>readme.txt</strong>"; 
    document.getElementById('file-contents').innerHTML = "<br/>Contents:";
    document.getElementById('file-read-dataurl').innerHTML = '';  
    document.getElementById('file-read-text').innerHTML = '';
}
function removeFail(error) {
    console.log("Remove File Error: " + error.code);
    document.getElementById('file-status').innerHTML = "Status: <strong>Remove Error: " + error.code + "</strong>";       
}
function removeFileEntry(fileEntry) {
    fileEntry.remove(removeSuccess, removeFail);
}
function removeFile() { // button onclick function
    if (myFileEntry) {
        removeFileEntry(myFileEntry);        
    } else {
        document.getElementById('file-status').innerHTML = "Status: <strong>Error: File Not Created!</strong>";
    }    
}
