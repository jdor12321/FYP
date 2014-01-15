var allImages = new Array(); //stores reference to all images
var backgroundImageUrl;
var timeline = new Array();
var tweenedFrames = new Array();
var imageData = {};
var set = new Array();
var gifCanvas;
var ctx;
var fps;
var stop = false;
var i;

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
            line.moveToTop();
            stage.draw();
        });
        myImage.on("mouseover", function(){
            this.setStroke('black');
            line.setStroke('black');
            stage.draw();
            document.body.style.cursor = "pointer";
        });
        myImage.on("mouseout", function(){
                this.setStroke('clear');
                line.setStroke('clear');
                stage.draw();
                document.body.style.cursor = "default";
        });
        
       // var points = myImage.getPosition();
        
        var group = new Kinetic.Group({
            x: stage.width,
            y: stage.height,
            width: imageObj.width,
            height: imageObj.height,
            name: 'group',
            offsetX:imageObj.width/4,
            offsetY:imageObj.height/4,
            draggable: true
        });
        
        
        group.add(myImage);
        group.add(line);
        layer.add(group);
        
        addAnchor(group, imageObj.width /4, imageObj.height /4, "centre", "#228B22");
        addAnchor(group, imageObj.width/1.25, imageObj.height/4, "rotate", "#5050E1");
        addAnchor(group, 0, 0, "topLeft", "#fff");
        addAnchor(group, imageObj.width /2, 0, "topRight", "#fff");
        addAnchor(group, imageObj.width /2, imageObj.height /2, "bottomRight", "#fff");
        addAnchor(group, 0, imageObj.height /2, "bottomLeft", "#fff");
        
        stage.add(layer);
        layer.draw();
    
    }; 
    
    var imageObject = new newImage(src, name, stage, layer);
    allImages[allImages.length] = imageObject;
    var layerID = allImages.length -1;
    addLayers(name, layerID);
    assignParents(name, layerID, allImages );
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

function addLayers(layerName, layerId){  //creates layer UI
    $("ul").append("<li id=\"" + layerId + "\" class=\"ui-state-default\" onclick=\"selected(this.id)\">\n\
    <span class=\"ui-icon picture\"></span>" + "&nbsp;" + layerName + "</li><input id=\"checked\" name=\"checked\" onclick=\"visible("+ layerId +")\" type=\"checkbox\" checked>"+ layerName +" Visble?</input>");
}

function assignParents(layerName, layerId){  //creates layer UI
    $("ol").append("<li id=\"" + layerId + "\" class=\"ui-state-default\" onclick=\"selected(this.id)\">\n\
    <span class=\"ui-icon picture\"></span>" + "&nbsp;" + layerName + "</li> Parent: <select id=\"layers\"><option>"+layerName+"</option></input>");
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
}

function update(group, activeAnchor) {
    var topLeft = group.get(".topLeft")[0];
    var topRight = group.get(".topRight")[0];
    var bottomRight = group.get(".bottomRight")[0];
    var bottomLeft = group.get(".bottomLeft")[0];
    var centre = group.get(".centre")[0];
    var rotate = group.get(".rotate")[0];
    var image = group.get(".image")[0];
    
    var anchorX = activeAnchor.getX();
    var anchorY = activeAnchor.getY();
    
    var centreX;
    var centreY;

    var width = group.getWidth();
    var height = group.getHeight();
    // update anchor positions
    switch (activeAnchor.getName()) {
         case 'topLeft':
              topRight.setY(anchorY);
              bottomLeft.setX(anchorX);
              centreX = topLeft.getX()/2;
              centreY = topLeft.getY()/2;
             // centre.setY(centreY);
             // centre.setX(centreX);
              break;
              
        case 'topRight':
              topLeft.setY(anchorY);
              bottomRight.setX(anchorX);
              centreX = topRight.getX()/2;
              centreY = topRight.getY()/2;
             // centre.setY(centreY);
             // centre.setX(centreX);
              break;
              
        case 'bottomRight':
              bottomLeft.setY(anchorY);
              topRight.setX(anchorX);
              centreX = bottomRight.getX()/2;
              centreY = bottomRight.getY()/2;
             // centre.setY(centreY);
             // centre.setX(centreX);
              break;
              
        case 'bottomLeft':
              bottomRight.setY(anchorY);
              topLeft.setX(anchorX);
              //centreY = bottomLeft.getY()/2;
              //centreX = bottomLeft.getX();
              centre.setX(centreX);
              centre.setY(centreY);
             // alert("X: " + centreX + ", Y: "+ centreY)
              break;
              
        case "centre":
              var x = group.getOffsetX();
              var y = group.getOffsetY();
              group.setOffset((anchorX-x)/4, (anchorY-y)/4);
              console.log("X: " + anchorX/4 + ", Y: " +anchorY /4);
              break;
            
        case "rotate":
            var groupPos = group.getPosition();
              group.rotateDeg(10);
              
              break;
    }

    image.setPosition(topLeft.attrs.x, topLeft.attrs.y);

    var width = topRight.attrs.x - topLeft.attrs.x;
    var height = bottomLeft.attrs.y - topLeft.attrs.y;
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
//        var centreX = getCentreX(group);
//        var centreY = getCentreY(group);
        update(group, this);
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

function selected(index) {
    if(stop){
        stop = false;
        return;
    }
    var layer = allImages[index].imageLayer.getLayer();
      if (layer.getVisible() == true) {
      $("#sortable").children().eq(index).css({"background": "#e5ddb0","border-color": "black" });
      
      } else {
      $("#sortable").children().eq(index).css({"background": "#E6E6E6", "border-color": "#D3D3D3"});
      
  }
  
}

function visible(index){
    if(stop){
        stop = false;
        return;
    }
    var layer = allImages[index].imageLayer.getLayer();
    if(layer.getVisible() == true){
      layer.hide();  
      //$("#sortable").children().eq(index).css({"background": "#e5ddb0","border-color": "black" });
      //$("#sortable").children().eq(index).prop("checked", false);
    }
    else{
      layer.show();
     //$("#sortable").children().eq(index).css({"background": "#E6E6E6", "border-color": "#D3D3D3"});
     //$("#sortable").children().eq(index).prop("checked", false);
    }
}


function storeTimeline(){
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
            
            if(isNaN(layer.children[0].children[0].getAbsolutePosition().y)){
                imageData= {
                    x: layer.children[0].attrs.x,
                    y: layer.children[0].attrs.y,
                    width: layer.children[0].children[0].attrs.width,
                    height: layer.children[0].children[0].attrs.height,
                    src: src,
                    visible: visible
                };
            }
            else{
                imageData= {
                    x: layer.children[0].children[0].getAbsolutePosition().x,
                    y: layer.children[0].children[0].getAbsolutePosition().y,
                    width: layer.children[0].children[0].attrs.width,
                    height: layer.children[0].children[0].attrs.height,
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
                tweenedFrames[counter] = new Array();
                for (var j = 0; j < framesNeeded - 1; j++) {

                    var frame = {
                        x: newX,
                        y: newY,
                        width: newWidth,
                        height: newHeight,
                        src: frames[q].src,
                        visible: oldFrames[i].visible
                    };
                    tweenedFrames[counter][j] = frame;
                    newX += Math.round((nextX - x) / framesNeeded);
                    newY += Math.round((nextY - y) / framesNeeded);
                    newWidth += Math.round((nextWidth - width) / framesNeeded);
                    newHeight += Math.round((nextHeight - height) / framesNeeded);
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
      
      var encoder = new GIFEncoder();
      
      encoder.setRepeat(0); //auto-loop
      encoder.setDelay((1000 / fps));
      encoder.setDispose(2);
      //set gif quality
      encoder.setQuality(10);
      encoder.start();

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
                          imgObj.src = tweenedFrames[f][j].src;
                          var visible = tweenedFrames[f][j].visible;
                          
                          if(visible){
                            ctx.drawImage(imgObj, nx, ny, nWidth, nHeight);
                          }
                      }
                      encoder.addFrame(ctx);
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

                  var imgObj = new Image();

                  imgObj.src = timeline[i][index].src;
                  if(timeline[i][index].visible){
                  ctx.drawImage(imgObj, x, y, width, height);   //draw image to canvas
                  }
              }
          


              //add context as frame to gif encoder
              encoder.addFrame(ctx);
              //clear context for next frame
              ctx.clearRect(0, 0, 1000, 600);
          }

      }
      
      encoder.finish();
      $("#gif").css({ "background": "#E6E6E6" });
      $("#gif").button("option", "label", "Create Animated Gif");
      $("#overlay").css({ "display": "none" });

      var store = encoder.stream().getData();
      var data_url = 'data:image/gif;base64,'+encode64(store);
      window.open(data_url);
}

function saveMov(){
     $("#mov").css({ "background": "#E6E6E6" });
     $("#mov").button("option", "label", "Create Animated Gif");
     $("#overlay").css({ "display": "none" });
}
