var allImages = new Array(); //stores reference to all images
var backgroundImageUrl;
var timeline = new Array();
var tweenedFrames = new Array();
var imageData = {};
var set = new Array();
var images = new Array();
var gifCanvas;
var ctx;
var fps;
var stop = false;
var i;
var count = 0;
var groups = new Array();
var hierarchy = new Array();

$(document).ready(function () {

    var stage = new Kinetic.Stage({
        container: 'container',
        width: 1000,
        height: 600
    });

    $('#addImg').on('click', function () {
        addImage(stage);
    });
    $('#bgImg').on('click', function () {
        setBgImage();
    });
    $('#gif').on('click', function () {
        if (timeline.length > 0) {
            $("#gif").css({ "background": "#008080" });
            $("#gif").button("option", "label", "Creating animation...");
            $("#overlay").css({ "display": "block" });
            setTimeout(function () {
                saveGif();
            }, 1000);
        }
        else {
            alert("Your animation doesn't have any keyframes, please set keyframes using the timeline.");
        }
    });
    $('#mov').on('click', function () {
        if (timeline.length > 0) {
            $("#mov").css({ "background": "#008080" });
            $("#mov").button("option", "label", "Creating animation...");
            $("#overlay").css({ "display": "block" });
            setTimeout(function () {
                saveMov();
            }, 1000);
        }
        else {
            alert("Your animation doesn't have any keyframes, please set keyframes using the timeline.");
        }
    });
    $('#up').on('click', function () {
        if (!confirm("Are you sure you want to reset your animation?")) {
            return;
        }
        stage.removeChildren();
        $("#sortable > li").each(function (n, item) {
            $(item).remove();
        });
        allImages = [];
        tweenedFrames = [];
        for (var i = 0; i < timeline.length; i++) {
            $("#time li").eq(i).css({ "color": "black" });
        }
        timeline = [];
        set = [];
        imageData = {};
        backgroundImageUrl = "";
        $("#slider-range-max").slider({
            value: 0
        });
        $("#amountHidden").val(0);
        $("#container div").css({ "background": "none" });
    });
    $('#sortable').sortable({
        update: function (event, ui) {
            var layerArray = $(this).sortable('toArray');
            updateLayers(layerArray);
            stop = true;
        }
    });
    $('#parents').sortable({
        update: function (event, ui) {
            var layerArray = $(this).sortable('toArray');
            updateLayers(layerArray);
            stop = true;
        }
    });
    
    $('#saveParents').on('click', function () {
        
        // for loop
        for (var i = 0; i <= allImages.length; i++) {
        
        var list = document.getElementsByClassName('layersList')[i];
        
        var parentLayerId = list.options[list.selectedIndex].value;
        
        var childLayerId = document.getElementById("parents").getElementsByTagName("li")[i].id;
        
        console.log(i);
        
        saveParents(parentLayerId, childLayerId, allImages); 
        
        }
        
    });
    
    //Alert window when refreshing page. commented out for the moment during developement
   /* window.onbeforeunload = function () {
        return "Woah! Are you sure you want to do this? You will lose your animation...";
    };*/

});

function addImage(stage){
    
    var layer = new Kinetic.Layer();
    var imageObj = new Image();
    var f = document.getElementById('uploadimage').files[0];
    var name = f.name;
    var url = window.URL;
    var src = url.createObjectURL(f);
    imageObj.src = src;
      
    imageObj.onload = function() {
      var myImage = new Kinetic.Image({
          image: imageObj,
          x: stage.getWidth, 
          y: stage.getHeight, 
          width: imageObj.width / 2,
          height: imageObj.height / 2,
          stroke: 'black',
          strokeWidth: 10,
          name: "image",
          id: allImages.length
        });
        
        
        
        myImage.setStroke('clear');
        
        myImage.on("dragstart", function(){
            this.moveToTop();
            stage.draw();
        });
        myImage.on("mouseover", function(){
            this.setStroke('black');
            stage.draw();
            document.body.style.cursor = "pointer";
        });
        myImage.on("mouseout", function(){
                this.setStroke('clear');
                stage.draw();
                document.body.style.cursor = "default";
        });
        
       // var points = myImage.getPosition();
        
        var group = new Kinetic.Group({
            x: imageObj.width/4,
            y: imageObj.height/4,
            width: imageObj.width,
            height: imageObj.height,
            name: 'group',
            scale: 1,
            draggable: true
        });
        
        
        var rotate = new Kinetic.Circle({
            x: imageObj.width/1.25,
            y: imageObj.height/4,
            radius: 3,
            fill: "#5050E1",
            stroke: "#666",
            strokeWidth: 1,
            draggable : true
        });
        
        
        group.add(myImage);
        group.add(rotate);
        layer.add(group);
        
        
        
        rotate.setDragBoundFunc (function (pos) {
           var groupPos = group.getPosition();
           var rotation = degrees (angle (groupPos.x, groupPos.y, pos.x, pos.y));
           group.setRotationDeg (rotation);
    
           layer.draw();
           return pos;
        });
        
       
        
       
        addAnchor(group, imageObj.width /4, imageObj.height /4, "centre", "#228B22");
        //addAnchor(group, imageObj.width/1.25, imageObj.height/4, "rotate", "#5050E1");
        addAnchor(group, 0, 0, "topLeft", "#fff");
        addAnchor(group, imageObj.width /2, 0, "topRight", "#fff");
        addAnchor(group, imageObj.width /2, imageObj.height /2, "bottomRight", "#fff");
        addAnchor(group, 0, imageObj.height /2, "bottomLeft", "#fff");
        
         //sets the centre of the image
        
        group.setOffset (myImage.getWidth() * myImage.getScale().x / 2, myImage.getHeight() * myImage.getScale().y / 2);

        groups[allImages.length-1] = group;

        stage.add(layer);
        layer.draw();
        
        rotate.on("dragstart", function(){
            var pos = rotate.getPosition();
            console.log("start x: " + pos.x + " start y: " + pos.y + " ");
        });
        rotate.on("dragend", function(){
            var pos = rotate.getPosition();
            console.log("end x: " + pos.x + " end y: " + pos.y + " ");
        });
    
    }; 
    
    var imageObject = new newImage(src, name, stage, layer);
    allImages[allImages.length] = imageObject;
    var layerID = allImages.length -1;
    addLayers(name, layerID);
    assignParents(name, layerID);
    $("uploadimage").val("");
}

function setBgImage(){
    var imageObj = new Image();
    var f = document.getElementById('uploadbkimage').files[0];
    var url = window.URL;
    var src = url.createObjectURL(f);
    imageObj.src = src;
    backgroundImageUrl = src;
    
    $("#container div").css({"background": "url(" + src +")", "background-size" : "1000px 600px"});
    $("uploadbkimage").val("");
}

function newImage(url, name, stage, layer) { //Image constructor function
    var imageLink;
    var imageName;
    var imageStage;
    var imageLayer;
    
    this.imageLink = url;
    this.imageName = name;
    this.imageStage = stage;
    this.imageLayer = layer;
}

function newRelationship(parent, child, layer1, layer2, id1, id2) { //Image constructor function
    var parentGroup;
    var childGroup;
    var parentLayer;
    var childLayer;
    var parentId;
    var childId;
    
    this.parentGroup = parent;
    this.childGroup = child;
    this.parentLayer = layer1;
    this.childLayer = layer2;
    this.parentId = id1;
    this.childId = id2;
}

function addLayers(layerName, layerId){  //creates layer UI
    $("ul").append("<li onclick=\"visible(this.id)\" id=\"" + layerId + "\" class=\"ui-state-default\">\n\
    <span class=\"ui-icon picture\"></span>" + "&nbsp;" + layerName + "</li>");
}

function assignParents(layerName, layerId){  //creates layer UI
    $("#parents").append("<li id=\"" + layerId + "\" class=\"ui-state-default\" onclick=\"selected(this.id)\">\n\
    <span class=\"ui-icon picture\"></span>" + "&nbsp;" + layerName + "</li> Parent: <select class=\"layersList\"></select>");
    
    populateList(layerId, layerName, images);
}

function populateList(layerId, layerName, images) {

images[layerId] = layerName;

for (var i = 0; i <= images.length; i++){
    for (var j = 0; j < images.length; j++){
  var list = document.getElementsByClassName('layersList')[i];
  list.options[j] = new Option(images[j], j);
}
}
  
}


function updateLayers(layerOrder){    //change the order of layers on canvas
    var myLayer;
    var temp;
    var index = 0;
    var diff;
    //Note UI interaction is the canvas layering inverted
    while(index == layerOrder[index]){
        index++;
    }
    //UI move up
    var target;
    if(index == layerOrder[index+1]){
        target = layerOrder[index];
        diff = target - index;
        myLayer = allImages[target].imageLayer;
        while(diff > 0)
        {
            myLayer.moveDown();
            diff--;
            var temp = allImages[target];
            allImages[target] = allImages[target-1];
            allImages[target-1] = temp;
            target--;
        }
    }
    else{  //UI move down
        for (var i = 0; i<layerOrder.length; i++)
        {
            if(layerOrder[i] == index)
            {
                target = i;
                break;
            }        
        }
        diff = target - index;
        myLayer = allImages[index].imageLayer;
        while(diff > 0){
            myLayer.moveUp();
            diff--;
            var temp = allImages[index];
            allImages[index] = allImages[index+1];
            allImages[index+1] = temp;
            index++;
        }
    }
    resetSortableIds();
}

function resetSortableIds(){
    var childrenCount = $("#sortable").children().length;
    for(var i = 0; i<childrenCount; i++)
    {
        $("#sortable").children().eq(i).attr("id", i);
    }
    
    var childrenCount = $("#parents").children().length;
    for(var i = 0; i<childrenCount; i++)
    {
        $("#parents").children().eq(i).attr("id", i);
    }
}

function update(group, activeAnchor) {
    var topLeft = group.get(".topLeft")[0];
    var topRight = group.get(".topRight")[0];
    var bottomRight = group.get(".bottomRight")[0];
    var bottomLeft = group.get(".bottomLeft")[0];
    var centre = group.get(".centre")[0];
    var image = group.get(".image")[0];
    
    var anchorX = activeAnchor.getX();
    var anchorY = activeAnchor.getY();
    
    var centreX = group.getOffsetX();
    var centreY = group.getOffsetY();
    
    var absolute = group.getPosition();

    var width = group.getWidth();
    var height = group.getHeight();
    // update anchor positions
    switch (activeAnchor.getName()) {
         case 'topLeft':
              topRight.setY(anchorY);
              bottomLeft.setX(anchorX);
              centreX = anchorX/2;
              centreY = anchorY/2;
              centre.setX(centreX);
              centre.setY(centreY);
             // centre.setY(centreY);
             // centre.setX(centreX);
              break;
              
        case 'topRight':
              topLeft.setY(anchorY);
              bottomRight.setX(anchorX);
              centreX = anchorX/2;
              centreY = anchorY/2;
              centre.setX(centreX);
              centre.setY(centreY);
             // centre.setY(centreY);
             // centre.setX(centreX);
              break;
              
        case 'bottomRight':
              bottomLeft.setY(anchorY);
              topRight.setX(anchorX);
              centreX = anchorX/2;
              centreY = anchorY/2;
              centre.setX(centreX);
              centre.setY(centreY);
              //centre.setY(centreX/anchorX);
              //centre.setX(centreY/anchorY);
              //group.setOffset(centreX/anchorX, centreY/anchorY);
              break;
              
        case 'bottomLeft':
              bottomRight.setY(anchorY);
              topLeft.setX(anchorX);
              centreY = (topRight.getY() - bottomRight.getY())/2;
              centreX = (topRight.getX() - topLeft.getX())/2;
              centre.setX(centreX);
              centre.setY(centreY);
              break;
              
        case "centre":
              
              //group.setOffset({x:anchorX, y:anchorY});
              
              activeAnchor.on("dragend", function(){
                 group.setOffset(anchorX, anchorY);
                 
              });
              
              group.setPosition(topLeft.x, topLeft.y);
              
      }
      
      
    var offsetX = group.getOffsetX();
    var offsetY = group.getOffsetY();

    image.setPosition({x:topLeft.getX(), y:topLeft.getY()});

    //image.setOffset(offsetX, offsetY);

    var width = topRight.getX() - topLeft.getX();
    var height = bottomLeft.getY() - topLeft.getY();
    if(width && height) {
        image.setSize(width, height);
    }
}
function addAnchor(group, x, y, name, color) {
    var stage = group.getStage();
    var layer = group.getLayer();

    var anchor = new Kinetic.Circle({
        x: x,
        y: y,
        stroke: "#666",
        fill: color,
        strokeWidth: 1,
        radius: 3,
        name: name,
        draggable: true
    });

    anchor.on("dragmove", function() {
        update(group, this, layer);
        layer.draw();
    });
    anchor.on("mousedown touchstart", function() {
        group.setDraggable(false);
        this.moveToTop();
    });
    anchor.on("dragend", function() {
        group.setDraggable(true);
        layer.draw();
    });
    // add hover styling
    anchor.on("mouseover", function() {
        var layer = this.getLayer();
        document.body.style.cursor = "pointer";
        this.setStrokeWidth(4);
        layer.draw();
    });
    anchor.on("mouseout", function() {
        var layer = this.getLayer();
        document.body.style.cursor = "default";
        this.setStrokeWidth(2);
        layer.draw();
    });

    group.add(anchor);
}

function visible(index){
    if(stop){
        stop = false;
        return;
    }
    var layer = allImages[index].imageLayer.getLayer();
    if(layer.getVisible() == true){
      layer.hide();  
      $("#sortable").children().eq(index).css({"background": "#e5ddb0","border-color": "black" });
    }
    else{
      layer.show();
      $("#sortable").children().eq(index).css({"background": "#E6E6E6", "border-color": "#D3D3D3"});
    }
}


function storeTimeline(group){
    var selection = $('#amountHidden').val();
    
    if(selection != null){
        if(timeline[selection] !== undefined){
            if(!confirm("This key frame already has a value, do you wish to overwrite it?"))
                return;
        }
        var i=0;
        timeline[selection] = new Array(allImages.length);
        for(i;i<allImages.length;i++){
            var layer = allImages[i].imageLayer.getLayer();
            var src = allImages[i].imageLink;
            var visible = allImages[i].imageLayer.getVisible();
            
            console.log(layer.children[0].getRotationDeg());
            
            if(isNaN(layer.children[0].children[0].getAbsolutePosition().y)){
                imageData= {
                    x: layer.children[0].getX(),
                    y: layer.children[0].getY(),
                    width: layer.children[0].children[0].getWidth(),
                    height: layer.children[0].children[0].getHeight(),
                    rotation: layer.children[0].getRotationDeg(),
                    src: src,
                    visible: visible
                };
            }
            else{
                imageData= {
                    x: layer.children[0].children[0].getAbsolutePosition().x,
                    y: layer.children[0].children[0].getAbsolutePosition().y,
                    width: layer.children[0].children[0].getWidth(),
                    height: layer.children[0].children[0].getHeight(),
                    rotation: layer.children[0].getRotationDeg(),
                    src: src,
                    visible: visible
                };
            }
            
            timeline[selection][i] = imageData;
        }

        $.extend($.gritter.options, {
		    class_name: 'gritter-light', // for light notifications (can be added directly to $.gritter.add too)
		    position: 'top-left', // possibilities: bottom-left, bottom-right, top-left, top-right
                    fade_in_speed: 0, // how fast notifications fade in (string or int)
                    fade_out_speed: 500, // how fast the notices fade out
                    time: 1000 // hang on the screen for...
        });
        $.gritter.add({
                // (string | mandatory) the heading of the notification
                title: 'Key Frame Added',
                // (string | mandatory) the text inside the notification
                text: 'You have successfully added a key frame at second: ' + selection
        });
        $("#time li").eq(selection).css({"color": "#008080"});
    }
}

function tween(frames, oldFrames, difference){   //retrieve current keyframe, old keyframe and time difference between them for new frames
    var counter = 0;
    tweenedFrames = new Array();
     for (var i = 0; i < oldFrames.length; i++) {
        for (var q = 0; q < frames.length; q++) {  
            
            if (frames[q].src == oldFrames[i].src) {       //check if the two array indexes are refering to the same image
                var framesNeeded = difference * fps;  //this sets 5fps 

                //get oldFrame x coord and next user set x coord, then calculate the new coord for first tweened frame
                var x = oldFrames[i].x;
                var nextX = frames[q].x;
                var newX = Math.round((x + ((nextX - x) / framesNeeded)));

                //get oldFrame y coord and next user set y coord, then calculate the new coord for first tweened frame
                var y = oldFrames[i].y;
                var nextY = frames[q].y;
                var newY = Math.round((y + ((nextY - y) / framesNeeded)));

                //get oldFrame width and next user set width, then calculate the new width for first tweened frame
                var width = oldFrames[i].width;
                var nextWidth = frames[q].width;
                var newWidth = Math.round((width + ((nextWidth - width) / framesNeeded)));

                //get oldFrame height and next user set height, then calculate the new height for first tweened frame
                var height = oldFrames[i].height;
                var nextHeight = frames[q].height;
                var newHeight = Math.round((height + ((nextHeight - height) / framesNeeded)));
                
                //get oldFrame rotation and next user sets rotation, then calculate the new rotation for first tweened frame
                
                var rotation = oldFrames[i].rotation;
                console.log("OldFrame: " + rotation);
                var nextRotation = frames[q].rotation;
                console.log("NextFrame: " + nextRotation);
                var newRotation = Math.round((rotation + ((nextRotation - rotation) / framesNeeded)));
                console.log("newRotation: " + newRotation);
                
                tweenedFrames[counter] = new Array();
                for (var j = 0; j < framesNeeded - 1; j++) {

                    var frame = {
                        x: newX,
                        y: newY,
                        width: newWidth,
                        height: newHeight,
                        rotation: radians(newRotation),
                        src: frames[q].src,
                        visible: oldFrames[i].visible
                    };
                    
                    tweenedFrames[counter][j] = frame;
                    newX += Math.round((nextX - x) / framesNeeded);
                    newY += Math.round((nextY - y) / framesNeeded);
                    newWidth += Math.round((nextWidth - width) / framesNeeded);
                    newHeight += Math.round((nextHeight - height) / framesNeeded);
                    newRotation += Math.round((nextRotation - rotation) /framesNeeded);
                }
                counter++;
            }
        }
    }
}

function saveGif(){
  
      try{
      	fps = $("#fps").val();
      	fps = parseInt(fps);
      	console.log("fps:" + fps);
      }
      catch(e){
      	fps = 5;
      }
      var imageObj = new Image();      
      
      gifCanvas = document.getElementById("gifOutput");
      ctx = gifCanvas.getContext("2d"); 
      
      var encoder = new GIF({
          workers: 5,
          workerScript: '/project/js/gif.worker.js',
          quality: 10,
          setRepeat: 0,
          width: 1000,
          height: 600
          
      });
      
      //encoder.setRepeat(0); //auto-loop
     // encoder.setDelay((1000 / fps));
      //encoder.setDispose(2);
      //set gif quality
      //encoder.setQuality(10);
      //encoder.start();

      for (var i = 0; i < timeline.length; i++) { //outer loop timeline entries

          if (timeline[i] !== undefined) {
              if (set.length > 0) {
                  number = set.pop();
                  var difference = i - number;
                  set.push(i);
              }
              else {
                  set.push(i);
                  var number = i;
                  var difference = i;
              }     
              imageObj.src = backgroundImageUrl;
              ctx.drawImage(imageObj, 0, 0, 1000, 600); //set background on canvas

              if (i > 0) {  //call tweening on this and previous frame
                  tween(timeline[i], timeline[number], difference);

                  console.log(tweenedFrames);
                  for (var j = 0; j < tweenedFrames[0].length; j++) {  //inner loop object data

                      //redraw images to gifCanvas using standard canvas api
                      for (var f = 0; f < tweenedFrames.length; f++) {
                          var nx = tweenedFrames[f][j].x;
                          var ny = tweenedFrames[f][j].y;
                          var nWidth = tweenedFrames[f][j].width;
                          var nHeight = tweenedFrames[f][j].height;
                          var nRotation = tweenedFrames[f][j].rotation;
                          imgObj.src = tweenedFrames[f][j].src;
                          var visible = tweenedFrames[f][j].visible;
                          
                          if(visible){
                            ctx.save();
                            ctx.translate( nWidth/4, nHeight/4 );
                            ctx.rotate(nRotation);
                            ctx.translate( -nWidth/4, -nHeight/4 );
                            ctx.drawImage(imgObj, nx, ny, nWidth, nHeight);
                            ctx.restore();

                            
                            
                            
                          }
                      }
                      encoder.addFrame(ctx, {delay:1000 / fps,copy: true});
                      ctx.clearRect(0, 0, 1000, 600);
                      ctx.drawImage(imageObj, 0, 0, 1000, 600);
                  }
              }
              // ctx.drawImage(imageObj,0,0,300,150);*/
              //retrieve data for images from timeline 2-dimensional array
              for (var index = 0; index < timeline[i].length; index++) {

                  var x = timeline[i][index].x;
                  var y = timeline[i][index].y;
                  var width = timeline[i][index].width;
                  var height = timeline[i][index].height;
                  var rotation = timeline[i][index].rotation;

                  var imgObj = new Image();

                  imgObj.src = timeline[i][index].src;
                  if(timeline[i][index].visible){
                   ctx.save();
                            //ctx.translate( width/4, height/4 );
                            ctx.rotate(rotation);
                            ctx.translate( -width/4, -height/4 );
                            ctx.drawImage(imgObj, x, y, width, height);
                            ctx.restore();   //draw image to canvas
                  
                  }
              }
          


              //add context as frame to gif encoder
              encoder.addFrame(ctx, {delay:1000 / fps, copy: true});
              //clear context for next frame
              ctx.clearRect(0, 0, 1000, 600);
              
             
          }

      }
      
       encoder.on('finished', function(blob) {
              window.open(URL.createObjectURL(blob));
              $("#gif").css({ "background": "#E6E6E6" });
              $("#gif").button("option", "label", "Create Animated Gif");
              $("#overlay").css({ "display": "none" });
            });

       encoder.render();
      
      //encoder.finish();
      

      //var store = encoder.stream().getData();
      //var data_url = 'data:image/gif;base64,'+encode64(store);
      //window.open(data_url);
}

function saveMov(){
    
    try{
      	fps = $("#fps").val();
      	fps = parseInt(fps);
      	console.log("fps:" + fps);
      }
      catch(e){
      	fps = 5;
      }
      var imageObj = new Image();      
      
      gifCanvas = document.getElementById("gifOutput");
      ctx = gifCanvas.getContext("2d"); 
    
    for (var i = 0; i < timeline.length; i++) { //outer loop timeline entries

          if (timeline[i] !== undefined) {
              if (set.length > 0) {
                  number = set.pop();
                  var difference = i - number;
                  set.push(i);
              }
              else {
                  set.push(i);
                  var number = i;
                  var difference = i;
              }     
              imageObj.src = backgroundImageUrl;
              ctx.drawImage(imageObj, 0, 0, 1000, 600); //set background on canvas

              if (i > 0) {  //call tweening on this and previous frame
                  tween(timeline[i], timeline[number], difference);

                  console.log(tweenedFrames);
                  for (var j = 0; j < tweenedFrames[0].length; j++) {  //inner loop object data

                      //redraw images to gifCanvas using standard canvas api
                      for (var f = 0; f < tweenedFrames.length; f++) {
                          var nx = tweenedFrames[f][j].x;
                          var ny = tweenedFrames[f][j].y;
                          var nWidth = tweenedFrames[f][j].width;
                          var nHeight = tweenedFrames[f][j].height;
                          var nRotation = tweenedFrames[f][j].rotation;
                          imgObj.src = tweenedFrames[f][j].src;
                          var visible = tweenedFrames[f][j].visible;
                          
                          if(visible){
                            ctx.rotate(nRotation);
                            ctx.drawImage(imgObj, nx, ny, nWidth, nHeight);
                            
                          }
                      }
                      //encoder.addFrame(ctx, {delay:1000 / fps,copy: true});
                      ctx.clearRect(0, 0, 1000, 600);
                      ctx.drawImage(imageObj, 0, 0, 1000, 600);
                  }
              }
              // ctx.drawImage(imageObj,0,0,300,150);*/
              //retrieve data for images from timeline 2-dimensional array
              for (var index = 0; index < timeline[i].length; index++) {

                  var x = timeline[i][index].x;
                  var y = timeline[i][index].y;
                  var width = timeline[i][index].width;
                  var height = timeline[i][index].height;
                  var rotation = timeline[i][index].rotation;

                  var imgObj = new Image();

                  imgObj.src = timeline[i][index].src;
                  if(timeline[i][index].visible){
                  ctx.rotate(rotation);
                  ctx.drawImage(imgObj, x, y, width, height);   //draw image to canvas
                  
                  }
              }
              
              convertCanvasToImage(gifCanvas);
              
//              var xmlhttp=new XMLHttpRequest();
//              
//              
//              xmlhttp.open("GET","http://cs1.ucc.ie/~jdor1/private/image.php?q="+url1,true);
//              xmlhttp.send();
              
              
     $("#mov").css({ "background": "#E6E6E6" });
     $("#mov").button("option", "label", "Create Animated MOV");
     $("#overlay").css({ "display": "none" });
     
          }
      }
}

function saveParents(parent, child, allImages) {
   
     var parentLayer = allImages[parent].imageLayer.getLayer();
     var childLayer = allImages[child].imageLayer.getLayer();
     
     
     var parentGroup = parentLayer.children[0];
     var childGroup = childLayer.children[0];
     
     
     if (parent == child){
         return;
     }
     
     if (hierarchy.length != 0){
         
         console.log("If 1");
         
         for (var i = 0; i < count; i++){
             
             console.log("Loop count: " + count);
             
             var parentLayer1 = hierarchy[i].parentLayer.getLayer();
             var childLayer1 = hierarchy[i].childLayer.getLayer();
             
             var parentGroup1 = parentLayer1.children[0];
             var childGroup1 = childLayer1.children[0];
             
             var parentId = hierarchy[i].parentId;
             var childId = hierarchy[i].childId;
             
             //console.log("parent: " + parent + " , child: " + child + " , parent id: " + parentId + ", child id: " + childId);
             
             if(childGroup1 == parentGroup) {
                 alert('true');
                 parentGroup = parentGroup1;
                 parentLayer = parentLayer1;
             }
             
         }
         
     }
     
        parentGroup.add(childGroup);
               
        parentLayer.add(parentGroup);

        parentLayer.draw();
        
        
        var relationshpObject = new newRelationship(parentGroup, childGroup, parentLayer, childLayer, parentId, childId);
        
        hierarchy[count] = relationshpObject;
                   
        count++;
        
        console.log("Parent: " + parent + ", Child: " + child);
        
      alert('Success');
      
     $("#saveParents").css({ "background": "#E6E6E6" });
    
}

//conmvert degrees to radians
function radians (degrees) {
    return degrees * (Math.PI/180);
}
//convert radians to degrees
function degrees (radians) {
    return radians * (180/Math.PI);
}

//calculate the angle between two points
function angle (cx, cy, px, py) {
    var x = cx - px; 
    var y = cy - py; 
    
    return Math.atan2 (-y, -x)
}

function distance (p1x, p1y, p2x, p2y) {
    return Math.sqrt (Math.pow ((p2x - p1x), 2) + Math.pow ((p2y - p1y), 2))
}

function convertCanvasToImage(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	return image;
}
