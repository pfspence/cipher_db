var alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var app = new Vue({
  el: '#app',
  data: {
    file_infos: [],
    alphabet: alphabet,
    name: 'a',
    prepend: '',
    append: '',
    autoSequence: true,
    autobox: {
    	width: 50,
    	height: 50
    },
    showLabels: true,
    cipher_name: ''
  },
  methods: {
    processImages: processImages,
    updateSequence: updateSequence,
    updateAutobox: updateAutobox
  }
})

function updateSequence(event){
	if (app.autoSequence){
		var index = alphabet.indexOf(event.target.value);
		app.autoSequence  = (typeof index == 'number');
	}
}
function updateAutobox(){
	canvasState.shapes[0].w = app.autobox.width + 2;
	canvasState.shapes[0].h = app.autobox.height + 2;
}

function processImages(event){
	if (canvasState.shapes.length > 1){
		for (var i = 1; i < canvasState.shapes.length; i++) {
			canvasState.loadCropped(canvasState.shapes[i], canvasState.backgroundImg);
		}
	}
}



function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function Shape(x, y, w, h, stroke, filename) {
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;
  this.strokeStyle = stroke || '#ff0000';
  this.fill = 'rgba(255,255,255,0)';
  this.filename = filename;
}

function Line(x1, y1, x2, y2, strokeStyle){
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.strokeStyle = strokeStyle;
}

function Text(text, color, x, y){
	this.font = "15px Arial";
	this.fillStyle = color || "#000";
	this.text = text;
	this.x = x;
	this.y = y;
}

Shape.prototype.draw = function(ctx) {
  ctx.fillStyle = this.fill;
  ctx.strokeStyle = this.strokeStyle;
  ctx.strokeRect(this.x, this.y, this.w, this.h);
}

Line.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.moveTo(this.x1, this.y1);
  ctx.lineTo(this.x2, this.y2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = this.strokeStyle;
  ctx.stroke();
}

Text.prototype.draw = function(ctx) {
	ctx.font = this.font;
	ctx.fillStyle = this.fillStyle;
	ctx.fillText(this.text, this.x, this.y);
}

Shape.prototype.contains = function(mx, my) {
  return  (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
}

function CanvasState(canvas, img) {
  // **** First some setup! ****
  
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;
  this.ctx = canvas.getContext('2d');
  this.padding = {
  	x: 50,
  	y: 50
  }
  this.backgroundImg = img;
  this.ctx.drawImage(this.backgroundImg, 0,0, this.width, this.height, 50, 50, this.width, this.height);
  //this.ctx.drawImage(this.backgroundImg, 0,0);

  var that = this;
	// this.backgroundImg.onload = function() {
	// 	that.ctx.drawImage(that.backgroundImg, 0, 0);
	// };

  // This complicates things a little but but fixes mouse co-ordinate problems
  // when there's a border or padding. See getMouse for more detail
  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
  }
  // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
  // They will mess up mouse coordinates and this fixes that
  var html = document.body.parentNode;
  this.htmlTop = html.offsetTop;
  this.htmlLeft = html.offsetLeft;

  // **** Keep track of state! ****
  
  this.valid = false; // when set to false, the canvas will redraw everything
  this.shapes = [];  // the collection of things to be drawn
  this.lines = [];
  this.texts = [];
  this.dragging = false; // Keep track of when we are dragging
  // the current selected object. In the future we could turn this into an array for multiple selection
  this.selection = null;
  this.dragoffx = 0; // See mousedown and mousemove events for explanation
  this.dragoffy = 0;
  
  // **** Then events! ****
  
  // This is an example of a closure!
  // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
  // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
  // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
  // This is our reference!
  var myState = this;
  
  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
  // Up, down, and move are for dragging
  canvas.addEventListener('mousedown', function(e) {
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    //myState.shapes = [];
	//myState.addShape(new Shape(mx,my,0,0, 'rgba(245, 222, 179, .7)'));
    var shapes = myState.shapes;


    for (var i = 1; i < shapes.length; i++) {
      if (shapes[i].contains(mx, my)) {
        shapes.splice(i,1);
	    }
	}
      //   // Keep track of where in the object we clicked
    //myState.dragoffx = mx;
    //myState.dragoffy = my;
    //myState.dragging = true;
      //   myState.selection = mySel;
      //   myState.valid = false;
      //   return;
      // }

    //}
    // havent returned means we have failed to select anything.
    // If there was an object selected, we deselect it
    // if (myState.selection) {
    //   myState.selection = null;
      //myState.valid = false; // Need to clear the old selection border
    //}
  }, true);
  canvas.addEventListener('mousemove', function(e) {

    if (true){
    	var mouse = myState.getMouse(e);
    	var box = myState.shapes[0];
    	box.y = mouse.y - parseInt((app.autobox.height / 2) + 1);
    	box.x = mouse.x - parseInt((app.autobox.width /2) + 1);
    //   // We don't want to drag the object by its top-left corner, we want to drag it
    //   // from where we clicked. Thats why we saved the offset and use it here
    //   myState.selection.x = mouse.x - myState.dragoffx;
    //   myState.selection.y = mouse.y - myState.dragoffy;   
    	myState.valid = false; // Something's dragging so we must redraw
    }
    // var horiz = myState.lines[0];
    // var vert = myState.lines[1];
    // var mouse = myState.getMouse(e);
    // horiz.y1 = horiz.y2 = mouse.y;
    // vert.x1 = vert.x2 = mouse.x;


    myState.valid = false;

  }, true);


  canvas.addEventListener('mouseup', function(e) {
    myState.dragging = false;
    //myState.loadCropped(myState.shapes[0]);
  }, true);
  // double click for making new shapes
  canvas.addEventListener('dblclick', function(e) {
    var mouse = myState.getMouse(e);

	var context = this.getContext('2d');
	// var horizSize = app.autobox.width;
	// var vertSize = app.autobox.height;
	var x = mouse.x - (app.autobox.width / 2) -1;
	var y = mouse.y - (app.autobox.height / 2) -1;
	 console.log(app.autobox.width, app.autobox.height);
    var p = context.getImageData(x, y, app.autobox.width, app.autobox.height).data;
    var coord = mouse.x + " " + mouse.y;

    var data = [];
    console.log(data)

    for (var i = 0; i < p.length; i = i + 4){
    	data.push(parseInt((p[i] +  p[i+1] +  p[i+2]) / 3));
    }
    var data2d = [];

    for (var i = 0; i < app.autobox.height; i++) {
    	data2d[i] = new Array(app.autobox.width);
    	for (var j = 0; j < app.autobox.width; j++){
    		data2d[i][j] = parseInt(data[(i * app.autobox.width)+j] / 100);
    	}
    }

    for (var i = 0; i < data2d.length; i++){
    	//console.log(data2d[i].join(''))
    }

    var relimits = getLimits(data2d);


    var abslimits = [];
    abslimits[0] = relimits[0] + x; //Left
    abslimits[1] = relimits[1] + y; //Top
    abslimits[2] = relimits[2] + x; //Right
    abslimits[3] = relimits[3] + y; //Bottom


    //context.fillStyle = 'red';
  	//context.fillRect(abslimits[0], abslimits[1], relimits[2] - relimits[0], relimits[3] - relimits[1]);
  	var combined_name = app.prepend + app.name + app.append;
  	if (app.autoSequence){
  		var index = alphabet.indexOf(app.name);
  		index = typeof index == 'number' ? index + 1 : 0;
  		app.name = alphabet.charAt(index);
  	}
  	else {
  		$('#name').focus();
  		$('#name').select();
  	}
	myState.addShape(new Shape(abslimits[0], abslimits[1], relimits[2] - relimits[0], relimits[3] - relimits[1], '#ffaaaa', combined_name));
	myState.addText(new Text(combined_name, '#ddd', abslimits[2], abslimits[3] + 15));
	
  }, true);
  
  // **** Options! ****
  
  this.selectionColor = '#CC0000';
  this.selectionWidth = 2;  
  this.interval = 30;
  setInterval(function() { myState.draw(); }, myState.interval);
}

function getLimits(data){
	var height = data.length;
	var width = data[0].length;
	var left, right, top, bottom;
	top = 0;
	bottom = height;
	left = 0;
	right = width;

	//find bottom
	for (var i = height -1; i >= 0; i--){
		var hasBlack = false;
		for (var j = 0; j < width; j++){
			if (data[i][j] == 0 || data[i][j] == 1){
				hasBlack = true;
				break;
			}
		}
		if (hasBlack){
			bottom = i + 1;
			break;
		}
	}

	//find top
	for (var i = 0; i < height; i++){
		var hasBlack = false;
		for (var j = 0; j < width; j++){
			if (data[i][j] == 0 || data[i][j] == 1){
				hasBlack = true;
				break;
			}
		}
		if (hasBlack){
			top = i;
			break;
		}
	}

	//find right
	for (var i = width - 1; i >=0; i--){
		var hasBlack = false;
		for (var j = 0; j < height; j++){
			if (data[j][i] == 0 || data[j][i] == 1){
				hasBlack = true;
				break;
			}
		}
		if (hasBlack){
			right = i + 1;
			break;
		}
	}

	//find left;
	for (var i = 0; i < width; i++){
		var hasBlack = false;
		for (var j = 0; j < height; j++){
			if (data[j][i] == 0 || data[j][i] == 1){
				hasBlack = true;
				break;
			}
		}
		if (hasBlack){
			left = i;
			break;
		}
	}
	return [left, top, right, bottom];


}


CanvasState.prototype.addShape = function(shape) {
  this.shapes.push(shape);
  this.valid = false;
}

CanvasState.prototype.addLine = function(line) {
  this.lines.push(line);
  this.valid = false;
}

CanvasState.prototype.addText = function(text) {
	this.texts.push(text);
	this.valid = false;
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {
  // if our state is invalid, redraw and validate!
  if (!this.valid) {
    var ctx = this.ctx;
    var shapes = this.shapes;
    var lines = this.lines;
    var texts = this.texts;
    this.clear();
    
    // ** Add stuff you want drawn in the background all the time here **
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0, this.width, this.height);
    this.ctx.drawImage(this.backgroundImg, 0,0, this.width, this.height, 50, 50, this.width, this.height);
    //this.ctx.drawImage(this.backgroundImg, 0,0);

    // draw all shapes
    var l = shapes.length;
    for (var i = 0; i < l; i++) {
      var shape = shapes[i];
      // We can skip the drawing of elements that have moved off the screen:
      if (shape.x > this.width || shape.y > this.height ||
          shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
      shapes[i].draw(ctx);
    }
    for (var i = 0; i < lines.length; i++) {
      lines[i].draw(ctx);
    }
    if (app.showLabels){
    	for (var i = 0; i < texts.length; i++) {
	      texts[i].draw(ctx);
	    }
    }



    // draw selection
    // right now this is just a stroke along the edge of the selected Shape
    if (this.selection != null) {
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = this.selectionWidth;
      var mySel = this.selection;
      ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
    }
    
    // ** Add stuff you want drawn on top all the time here **
    
    this.valid = true;
  }
}

var getScores = function(filepath){

	$.get( "score?filepath=" + encodeURIComponent(filepath), function( data ) {
		var matches = []
		for (var i = 0; i < data.length; i++){
			var match = JSON.parse(data[i]);
			match.score = parseInt(match.score);
			match.character = match.character.split('.')[0];
			matches.push(match);
		}
		var filepathArr = filepath.split('/');
		var filename = filepathArr[filepathArr.length - 1];

		app.file_infos = [];
		app.file_infos.push({candidate_path: filepath, candidate_name: filename, matches: matches});
	});
}

function reqListener () {
  //success(this.responseText);
}

CanvasState.prototype.loadCropped = function(box, imageObj){

		// draw cropped image
		// console.log(this)
		// var box = this.shapes[0];

		//var canvas = document.createElement('canvas');
		var canvas = document.getElementById('canvas2');
        canvas.width = box.w;
        canvas.height = box.h;
		var context = canvas.getContext('2d');

		var sourceX = box.x;
		var sourceY = box.y;
		var sourceWidth = box.w;
		var sourceHeight = box.h;
		var destWidth = sourceWidth;
		var destHeight = sourceHeight;
		var destX = canvas.width / 2 - destWidth / 2;
		var destY = canvas.height / 2 - destHeight / 2;

		// context.fillStyle = 'white';
	 //  	context.fillRect(0, 0, canvas.width, canvas.height);

		//this.ctx.drawImage(this.backgroundImg, 0,0, this.width, this.height, 50, 50, this.width, this.height);
	    context.fillStyle = "#fff";
	    context.fillRect(0,0, this.width, this.height);
		context.drawImage(imageObj, sourceX - 50, sourceY - 50, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);

		var dataURL = canvas.toDataURL("image/jpeg");
 
		var xhr = new XMLHttpRequest();
		xhr.addEventListener("load", reqListener);
		xhr.onreadystatechange = function(ev){
			document.getElementById('status').innerHTML = 'Uploaded';
		};

		xhr.open('POST', 'upload_dataurl', true);
		xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		console.log(app.cipher_name)
		var data = 'cipher=' + app.cipher_name + ',filename=' + box.filename + ',image=' + dataURL;
		//var data = 'image=' + dataURL;
		xhr.send(data);
}


// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function(e) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
  
  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  // Add padding and border style widths to offset
  // Also add the <html> offsets in case there's a position:fixed bar
  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;
  
  // We return a simple javascript object (a hash) with x and y defined
  return {x: mx, y: my};
}

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag

// var canvas = document.getElementById('canvas2');
// var context = canvas.getContext('2d');

init();
var canvasState;
function init() {


}
var img
function loadImage() {
	var input = document.getElementById('imgfile');
	var file = input.files[0];
	fr = new FileReader();
	fr.onload = createImage;
	fr.readAsDataURL(file);
}

function createImage() {
	img = new Image();
	img.onload = imageLoaded;
	img.src = fr.result;
}

function imageLoaded() {
	var padding = {width:100, height: 100}
	var canvas = document.getElementById("canvas")
	canvas.width = img.width + padding.width;
	canvas.height = img.height + padding.height;
	canvasState = new CanvasState(canvas, img);
	canvasState.addShape(new Shape(0,0,app.autobox.width + 2,app.autobox.height + 2, '#ccc'));

	//var ctx = canvas.getContext("2d");
}

// Now go make something amazing!
 
