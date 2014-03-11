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
var relationships = new Array();
var checked = new Array();
var progress = 1;

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
    $( "#progressbar" ).progressbar({
                value: 0
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
        $("#parents > li").each(function (n, item) {
            $(item).remove();
        });
        var listCount = $(".layersList")[0].length;
   
        for(var i = 0; i < listCount; i++ ){
            $(".layersList")[i].remove();
            $(".label")[i].remove();
 
        }
        $("#inheritances > li").each(function (n, item) {
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
        
        $('#saveParents').removeAttr("disabled");
        $("#saveParents").css({ "background": "#e6e6e6" });
        $("#saveParents").button("option", "label", "Save Parent");
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
        
        $('#saveParents').attr("disabled", "disabled");
        $("#saveParents").css({ "background": "#C0C0C0" });
        $("#saveParents").button("option", "label", "Parents feature can only be used once");
        // for loop
        for (var i = 0; i < allImages.length; i++) {
        
            var list = document.getElementsByClassName('layersList')[i];
            
            var parentLayerId = list.options[list.selectedIndex].value;
            var childLayerId = document.getElementById("parents").getElementsByTagName("li")[i].id;
       
            saveParents(parentLayerId, childLayerId, allImages); 
        
            if (allImages.length == count) {
                alert('Parents Sucessfully added');
            }
        
        }
        
    });
    
//    $('#play').on('click', function () {
//        
//        
//           if(allImages.length == 0){
//             alert("No Images have been added to the stage. Please add images before continuing");
//           } else {
//             tweenKinetic();  
//           }
//           
//    });
    
    
    //Alert window when refreshing page. commented out for the moment during developement
    window.onbeforeunload = function () {
        return "Woah! Are you sure you want to do this? You will lose your animation...";
    };

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
        
        var group = new Kinetic.Group({
            x: imageObj.width/4,
            y: imageObj.height/4,
            width: imageObj.width,
            height: imageObj.height,
            draggable: true,
            name: 'group',
            scale: 1
            
        });
        
      var myImage = new Kinetic.Image({
          image: imageObj,
          //x: group.getWidth, 
         // y: group.getHeight, 
          width: imageObj.width / 2,
          height: imageObj.height / 2,
          stroke: 'black',
          strokeWidth: 10,
          name: "image",
          id: allImages.length,
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
        

        
        var rotate = new Kinetic.Circle({
            x: imageObj.width/1.25,
            y: imageObj.height/4,
            radius: 3,
            fill: "yellow",
            stroke: "#666",
            name: 'rotate',
            strokeWidth: 1,
            draggable : true,
            dragBoundFunc: (function (pos) {
                var groupPos = group.getPosition();
                var rotation = degrees (angle (groupPos.x, groupPos.y, pos.x, pos.y));
                group.setRotationDeg(rotation);
    
                return pos;
            })
        });

       
   
        
        
        
        
        group.add(myImage);
        group.add(rotate);
        
        layer.add(group);
        
               
        addAnchor(group, imageObj.width /4, imageObj.height /4, "centre", "#228B22");
        //addAnchor(group, imageObj.width/1.25, imageObj.height/4, "rotate", "#5050E1");
        addAnchor(group, 0, 0, "topLeft", "#fff");
        addAnchor(group, imageObj.width /2, 0, "topRight", "#fff");
        addAnchor(group, imageObj.width /2, imageObj.height /2, "bottomRight", "#fff");
        addAnchor(group, 0, imageObj.height /2, "bottomLeft", "#fff");
        
         //sets the centre of the image
        
        group.setOffset (myImage.getWidth() * myImage.getScale().x / 2, myImage.getHeight() * myImage.getScale().y / 2);

        stage.add(layer);
        layer.draw();
        group.setName(name);
        
        
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

function newRelationship(parentId, childId, parentName, childName, parentLayer, childLayer) { //Relationships Constructor
    var pId;
    var cId;
    var pName;
    var cName;
    var pLayer;
    var cLayer;
    
    this.pId = parentId;
    this.cId = childId;
    this.pName = parentName;
    this.cName = childName;
    this.pLayer = parentLayer;
    this.cLayer = childLayer;
}


function addLayers(layerName, layerId){  //creates layer UI
    $("ul").append("<li onclick=\"visible(this.id)\" id=\"" + layerId + "\" class=\"ui-state-default\">\n\
    <span class=\"ui-icon picture\"></span>" + "&nbsp;" + layerName + "</li>");
}

function assignParents(layerName, layerId){  //creates layer UI
    $("#parents").append("<li id=\"" + layerId + "\" class=\"ui-state-default\" onclick=\"selected(this.id)\">\n\
    <span class=\"ui-icon picture\"></span>" + "&nbsp;" + layerName + "</li> <span class=\"label\">Parent: </span><select class=\"layersList\"></select> <br />");
    
//    <input type=\"checkbox\" class=\"sendToBack\" id=\""+layerId+"\"/> <label style='background-color:white;' for=\"sendToBack\">Behind " +allImages[0].imageName+ "?</label></div><br />" (Moved from end of assigned parents field)
    
    populateList(layerId, layerName, images);
}

function populateList(layerId, layerName, images) {

images[layerId] = layerName;

for (var i = 0; i < images.length; i++){
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
        $("#parents").children().eq(i).attr("id", i);
    }
    $("#parents").sort();
    
    
    var parentCount = $(".layersList")[0].length;
    
    
    
        for(var i = 0; i < allImages.length; i++ ){
            var selectbox = $(".layersList")[i]
            for(var j = 0; j < parentCount; j++)
            {
               selectbox.remove(i);
            }
        }
        
        for (var i = 0; i <= allImages.length; i++){
            for (var j = 0; j < allImages.length; j++){
                var list = document.getElementsByClassName('layersList')[i];
                list.options[j] = new Option(allImages[j].imageName, j);
            }
        }
        
        

    
    console.log(parentCount);

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
    
    var posX;
    var posY;

    var width = group.getWidth();
    var height = group.getHeight();
    // update anchor positions
    switch (activeAnchor.getName()) {
         case 'topLeft':
              topRight.setY(anchorY);
              bottomLeft.setX(anchorX);
//              centreY = topRight.getY();
//              centreX = bottomLeft.getX();
//              centre.setX(centreX);
//              centre.setY(centreY);
              break;
              
        case 'topRight':
              bottomRight.setX(anchorX);
              topLeft.setY(anchorY);
              
//              centreX = anchorX/1;
//              centreY = anchorY*2;
//              centre.setX(centreX);
//              centre.setY(centreY);

              break;
              
        case 'bottomRight':
              bottomLeft.setY(anchorY);
              topRight.setX(anchorX);
//              centreX = anchorX/2;
//              centreY = anchorY/2;
//              centre.setX(centreX);
//              centre.setY(centreY);
//              //centre.setY(centreX/anchorX);
//              //centre.setX(centreY/anchorY);
//              //group.setOffset(centreX/anchorX, centreY/anchorY);
              break;
              
        case 'bottomLeft':
              bottomRight.setY(anchorY);
              topLeft.setX(anchorX);
//              centreY = (topRight.getY() - bottomRight.getY())/2;
//              centreX = (topRight.getX() - topLeft.getX())/2;
//              centre.setX(centreX);
//              centre.setY(centreY);
              break;
              
        case "centre":
              
              activeAnchor.on("dragend", function(){
                group.setOffset(anchorX, anchorY);
              });
              
              group.setPosition(topLeft.x, topLeft.y);
              
      }
      
      

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
                    offsetX: layer.children[0].getOffsetX(),
                    offsetY: layer.children[0].getOffsetY(),
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
                    offsetX: layer.children[0].getOffsetX(),
                    offsetY: layer.children[0].getOffsetY(),
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
    var posIx = 0;
    var posQx = 0;
    var posIy = 0;
    var posQy = 0;
    tweenedFrames = new Array();
     for (var i = 0; i < oldFrames.length; i++) {
        for (var q = 0; q < frames.length; q++) {  
            
            if (frames[q].src == oldFrames[i].src) {       //check if the two array indexes are refering to the same image
                var framesNeeded = difference * fps;  //this sets 5fps 

//if (nRotation == pRotation) {
//                                ctx.translate(nx, ny);
//                            } else {
//                                ctx.translate(x, y);
//                            } 

                //get oldFrame rotation and next user sets rotation, then calculate the new rotation for first tweened frame
                
                var rotation = oldFrames[i].rotation;
                console.log("OldFrame: " + rotation);
                var nextRotation = frames[q].rotation;
                console.log("NextFrame: " + nextRotation);
                var newRotation = Math.round((rotation + ((nextRotation - rotation) / framesNeeded)));
                console.log("newRotation: " + newRotation);

                //get oldFrame x coord and next user set x coord, then calculate the new coord for first tweened frame
                var x = oldFrames[i].x;
                var nextX = frames[q].x;               
//                if(rotation == nextRotation){
//                    posIx = i;
//                    posQx = q;
//                    var x = oldFrames[i].x;
//                    var nextX = frames[q].x;
//                
//                } else {
//                    x = oldFrames[posIx].x;
//                    nextX = frames[posQx].x;
//                }
                var newX = Math.round((x + ((nextX - x) / framesNeeded)));

                //get oldFrame y coord and next user set y coord, then calculate the new coord for first tweened frame
//                if(rotation == nextRotation){
//                    console.log("true");
//                    posIy = i;
//                    posQy = q;
//                    var y = oldFrames[i].y;
//                    var nextY = frames[q].y;
//                
//                } else {
//                    console.log("false");
//                    y = oldFrames[posIy].y;
//                    nextY = frames[posQy].y;
//                }
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
                        rotation: newRotation,
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
    
      var scrollPosition = [
        self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
        self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
      ];
    
      var html = jQuery('html'); // it would make more sense to apply this to body, but IE7 won't have that
      html.data('scroll-position', scrollPosition);
      html.data('previous-overflow', html.css('overflow'));
      html.css('overflow', 'hidden');
  
  
      try{
      	fps = $("#fps").val();
      	fps = parseInt(fps);
      	console.log("fps:" + fps);
      }
      catch(e){
      	fps = 5;
      }
      var imageObj = new Image();      
      
      var stage = allImages[0].imageStage.getStage();
      var objects = stage.getChildren();
      
      gifCanvas = document.getElementById("gifOutput");
      ctx = gifCanvas.getContext("2d"); 
      
      var encoder = new GIF({
          workers: fps,
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
          
          var layer = allImages[0].imageLayer.getLayer();
          var group = layer.children[0];
          var offsetX = group.getOffsetX();
          var offsetY = group.getOffsetY();
      
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
                          var px = nx;
                          var py = ny;
                          var nWidth = tweenedFrames[f][j].width;
                          var nHeight = tweenedFrames[f][j].height;
                          var nRotation = tweenedFrames[f][j].rotation;
                          var pRotation = nRotation;  
//                          if (j != 0) {
//                              px = tweenedFrames[f][j-1].x;
//                              py = tweenedFrames[f][j-1].y;
//                              pRotation = tweenedFrames[f][j-1].rotation;
//                          }
                          imgObj.src = tweenedFrames[f][j].src;
                          var visible = tweenedFrames[f][j].visible;
                          
                          if(visible){                   
                            ctx.save();
                            //ctx.clearRect(0, 0, 1000, 600);
//                            if (nRotation == pRotation && px == nx && py == ny) {
//                                ctx.translate(nx, ny);
//                            } else {
//                                ctx.translate(x, y);
//                            } 
                            ctx.translate(nx,ny);
                            ctx.translate(offsetX, offsetY);
                            ctx.rotate(radians(nRotation));
                            ctx.drawImage(imgObj, -offsetX, -offsetY, nWidth, nHeight);                        
                            ctx.restore();
                            
                            for (var z = 0; z < objects.length; z++){
                                console.log("length: " + objects.length + "z: " + z);
                                if (z == 0) {
                                    var torsoLayer = objects[z].getLayer();
                                    var torsoGroup = torsoLayer.children[0];
                                    if (torsoGroup.getName != 'torso.png') {
                                        alert("You MUST import the torso image FIRST");
                                        
                                    }
                                }else {
                                    console.log(z + ": here");
                                    var layer = objects[z].getLayer();
                                    var layerGroup = layer.children[0].children[0];
                                        
                                    layerGroup.setRotationDeg(nRotation);
                                    
                            }
                        }
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

                  var offsetX = timeline[i][index].offsetX;
                  var offsetY = timeline[i][index].offsetY;

                  var imgObj = new Image();

                  imgObj.src = timeline[i][index].src;
                  if(timeline[i][index].visible){
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.translate(offsetX, offsetY);
                    ctx.rotate(radians(rotation));
                    ctx.drawImage(imgObj, -offsetX, -offsetY, width, height);
                    ctx.restore();
                  }
              }
          


              //add context as frame to gif encoder
              encoder.addFrame(ctx, {delay:1000 / fps, copy: true});
              //clear context for next frame
              ctx.clearRect(0, 0, 1000, 600);
              
             
          }
          
//                            progress = ((i/(timeline.length - 1)))*100;
//                            progress = parseInt(progress);
//                            console.log(progress);
//
//              
//                            $( "#progressbar" ).progressbar({
//                                value: progress
//                            });
//                            
//                            $("progressbar").append("<p>"+progress+"Percent</p>");
            

      }
      
      var startTime;
      var sec;
      var calc;
      
      
      
      
      
       encoder.on('start', function() {
      
      window.scrollTo(scrollPosition[0], scrollPosition[1]);
            var d1 = new Date();
            startTime = d1.getTime();
            console.log(startTime);
              
              $('#timeSec').text ("");
              $('#msg').text ("");
       });
      
       encoder.on('finished', function(blob) {
       
              var d2 = new Date();
              sec = d2.getTime();
              calc = (sec - startTime)/1000;
              console.log(sec);
              console.log(calc);
              window.alert("Encoding finished in " + calc + " seconds.");
              $('#percent').text ("100% Complete.");
              $('#timeSec').text ("Encoding finished in " + calc + " seconds.");
              $('#msg').text ("Your animation will open in 5 seconds.");
              
              setTimeout(function(){window.open(URL.createObjectURL(blob));
              $("#gif").css({ "background": "#E6E6E6" });
              $("#gif").button("option", "label", "Create Animated GIF");
              $("#overlay").css({ "display": "none" }); 
              var html = jQuery('html');
              var scrollPosition = html.data('scroll-position');
              html.css('overflow', html.data('previous-overflow'));
              window.scrollTo(scrollPosition[0], scrollPosition[1])},
              
              5000);
       });

       
       encoder.on('progress', function(p) {
            
              $( "#progressbar" ).progressbar({
                  value: Math.round(p * 100)
              });
              
              $('#percent').text(Math.round(p * 100) + '% Complete');
       });

       encoder.render();
      
      //encoder.finish();
      

      //var store = encoder.stream().getData();
      //var data_url = 'data:image/gif;base64,'+encode64(store);
      //window.open(data_url);
}

//function saveMov(){
//    
//    try{
//      	fps = $("#fps").val();
//      	fps = parseInt(fps);
//      	console.log("fps:" + fps);
//      }
//      catch(e){
//      	fps = 5;
//      }
//      var imageObj = new Image();      
//      
//      gifCanvas = document.getElementById("gifOutput");
//      ctx1 = gifCanvas.getContext("2d"); 
//      var xmlhttp=new XMLHttpRequest();
//    
//    for (var i = 0; i < timeline.length; i++) { //outer loop timeline entries
//
//          if (timeline[i] !== undefined) {
//              if (set.length > 0) {
//                  number = set.pop();
//                  var difference = i - number;
//                  set.push(i);
//              }
//              else {
//                  set.push(i);
//                  var number = i;
//                  var difference = i;
//              }     
//              imageObj.src = backgroundImageUrl;
//              ctx.drawImage(imageObj, 0, 0, 1000, 600); //set background on canvas
//
//              if (i > 0) {  //call tweening on this and previous frame
//                  tween(timeline[i], timeline[number], difference);
//
//                  console.log(tweenedFrames);
//                  for (var j = 0; j < tweenedFrames[0].length; j++) {  //inner loop object data
//
//                      //redraw images to gifCanvas using standard canvas api
//                      for (var f = 0; f < tweenedFrames.length; f++) {
//                          var nx = tweenedFrames[f][j].x;
//                          var ny = tweenedFrames[f][j].y;
//                          var nWidth = tweenedFrames[f][j].width;
//                          var nHeight = tweenedFrames[f][j].height;
//                          var nRotation = tweenedFrames[f][j].rotation;
//                          imgObj.src = tweenedFrames[f][j].src;
//                          var visible = tweenedFrames[f][j].visible;
//                          
//                          if(visible){
//                            ctx.save();
//                            ctx.translate(x,y);
//                            ctx
//                            ctx.rotate(nRotation);
//                            ctx.drawImage(imgObj, nx, ny, nWidth, nHeight);
//                            
//                            
//                            
//                          }
//                      }
//                      //encoder.addFrame(ctx, {delay:1000 / fps,copy: true});
//                      ctx.clearRect(0, 0, 1000, 600);
//                      ctx.drawImage(imageObj, 0, 0, 1000, 600);
//                      
//                            progress = ((j/fps))*100;
//                            progress = parseInt(progress);
//                            console.log(progress);
//
//              
//                            $( "#progressbar" ).progressbar({
//                                value: progress
//                            });
//                  }
//              }
//              // ctx.drawImage(imageObj,0,0,300,150);*/
//              //retrieve data for images from timeline 2-dimensional array
//              for (var index = 0; index < timeline[i].length; index++) {
//
//                  var x = timeline[i][index].x;
//                  var y = timeline[i][index].y;
//                  var width = timeline[i][index].width;
//                  var height = timeline[i][index].height;
//                  var rotation = timeline[i][index].rotation;
//
//                  var imgObj = new Image();
//
//                  imgObj.src = timeline[i][index].src;
//                  if(timeline[i][index].visible){
//                  ctx.rotate(rotation);
//                  ctx.drawImage(imgObj, x, y, width, height);   //draw image to canvas
//
//                  }
//              }
//              
//              //var image = convertCanvasToImage(gifCanvas);
//              
//              
//              
//              
//              
////              
////              
////              
////              
//              
//              
//     $("#mov").css({ "background": "#E6E6E6" });
//     $("#mov").button("option", "label", "Create Animated MOV");
//     $("#overlay").css({ "display": "none" });
//     
//          }
//      }
//}

function saveParents(parent, child, allImages) {
    
     if (parent == child){
         return;
     }
     
     
   
     var parentLayer = allImages[parent].imageLayer.getLayer();
     var childLayer = allImages[child].imageLayer.getLayer();
     
     for (var i = 0; i < allImages.length; i++){
        if (allImages[i].imageName == "torso.png"){
            var torsoLayer = allImages[i].imageLayer.getLayer();
            var torsoGroup = torsoLayer.children[0];
            break
        } else {
            console.log("ERROR: No Torso Layer");
        }
     }
     
     var parentGroup = parentLayer.children[0];
     var childGroup = childLayer.children[0];
     
     var childX = childGroup.getX()/6;
     var childY = childGroup.getY()/2;
     
     var parentName = parentGroup.getName();
     var childName = childGroup.getName();
     
     //var layerId = allImages.length;
        
        
        
     
        parentGroup.add(childGroup);
        
        
        childLayer.add(torsoGroup);

        
        childGroup.setPosition(childX, childY);
        
        //childGroup.setPosition(parentGroup.x-100,parentGroup.y-100);
        
       //parentLayer.setPosition(childGroup.x,childGroup.y);
        
        
//        childGroup.get(".rotate")[0].setdragBoundFunc( (function (pos) {
//                var groupPos = childGroup.getPosition();
//                var rotation = degrees (angle (groupPos.x, groupPos.y, pos.x, pos.y));
//                childGroup.setRotationDeg(rotation*2);
//    
//                return pos;
//            }));
        
        //childLayer.hide();


        parentLayer.draw();
       
        
        console.log("Parent: " + parent + ", Child: " + child + " , parent name: " + parentName + ", child name: " + childName);
        
        
        relationships[count] = new newRelationship(parent, child, parentName, childName, parentLayer, childLayer);
        
             
        count++;
        
        
           
        

        
//        if (count == allImages.length - 1){
//            
//            $('.sendToBack:checkbox:checked').each(function () {
//               var sThisVal = this.id;
//               checked[checked.length] = sThisVal;
//               console.log(sThisVal);
//            });
//            
//            for (var i = 0; i < count; i++){
//                
//               var parentIn = relationships[i].pId;
//               var childIn = relationships[i].cId;
//                
//               var childNameIn = relationships[i].cName;
//               
//                           
//                
//               $("#sortable").children().eq(childIn).remove();
//               $("#sortable").children().eq(parentIn).append(", " + childNameIn);
//               
//               
//               
//                
//            }
//            
////            for(var i = 0; i < checked.length; i++){
////                   var pos = checked[i]-1;
////                
////                   var parentChecked = relationships[pos].pId;
////                   var childChecked = relationships[pos].cId;
////                
////                   var childNameChecked = relationships[pos].cName;
////                   var parentNameChecked = relationships[pos].pName;
////                
////                   var childLayerChecked = relationships[pos].cLayer.getLayer();
////                   var childGroupChecked = childLayerChecked.children[0];
////                   
////                   
////                   var parentLayerChecked = relationships[0].pLayer.getLayer();
////                   var parentGroupChecked = childLayerChecked.children[0];
////                   var parentSrcChecked = allImages[0].imageLink;
////                   
////                   if(parentNameChecked == "torso.png"){
////                       parentLayerChecked.moveUp();
////                       parentGroupChecked.moveToTop();
////                       break;
////                   } else {
////                       childLayerChecked.moveDown();
////                       childGroupChecked.moveDown();
////                   }
////                   
//////                   if (parentChecked == 0) {
//////                       var parentLayerChecked = relationships[pos].pLayer.getLayer();
//////                       var parentGroupChecked = parentLayerChecked.children[0];
//////                       
//////                       parentLayerChecked.moveToTop();
//////                       parentGroupChecked.moveToTop();
//////                       
//////                   }
////
////                   //childLayerChecked.moveDown();
////                   //childGroupChecked.moveDown();
////
////                   if(i == 0){
////                       //parentGroupChecked.moveToTop();
////                       //parentLayerChecked.moveToTop();
////                       
////                   }
////                                   
////                   
////                   
////                   
////                   
////                }
//               
//            }
            
        
        $("#inheritances").append("<li style='background-color:white;' >Parent: " + parentName + "<br />Child: " + childName + "</li><br />");
         
         alert("Image Inheritances Completed");
      
      $("ul").append("<li onclick=\"visible(this.id)\" id=\"" + parent + "\" class=\"ui-state-default\">\n\
      <span class=\"ui-icon picture\"></span>" + "&nbsp;" + parentName + ", " + childName + "</li>");
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

function obvious() {
    
    var stage = allImages[0].imageStage.getStage();
    console.log(stage);
    
    var objects = stage.getChildren();
    
    
    var torsoLayer = objects[0].getLayer();
    var rightUpperLayer = objects[1].getLayer();
    var rightLowerLayer = objects[2].getLayer();
    var rightFootLayer = objects[3].getLayer();
    
    var torso = torsoLayer.children[0];
    var rightupperleg = rightUpperLayer.children[0];
    var rightlowerleg = rightLowerLayer.children[0];
    var rightfoot = rightFootLayer.children[0];
    
    //var torso = objects.get(".torso")[0];
    console.log(torso.getName());
    //var rightupperleg = stage.get(".rightupperleg")[0];
    console.log(rightupperleg.getName());
    //var rightlowerleg = stage.get(".rightlowerleg")[0];
    console.log(rightlowerleg.getName());
    //var rightfoot = stage.get(".rightfoot")[0];
    console.log(rightfoot.getName());
    
    var torsoLayer = torso.getLayer();
    var rightUpperLayer = rightupperleg.getLayer();
    var rightLowerLayer = rightlowerleg.getLayer();
    
    torso.add(rightupperleg);
    torsoLayer.add(torso);
    torsoLayer.draw();
    
    rightupperleg.add(rightlowerleg);
    rightUpperLayer.add(torso);
    rightUpperLayer.draw();
    
    rightlowerleg.add(rightfoot);
    rightLowerLayer.add(torso);
    rightLowerLayer.draw();
    
    alert("Obvious Complete");
    
    
}

function tweenKinetic(){
    
    var layer = allImages[0].imageLayer.getLayer();
    var group = layer.children[0];
    
    var angularSpeed = 360 / 4;
    var amplitude = 100;
      var period = 1000;
      // in ms
      var centerX = group.getX();
    var animation = new Kinetic.Animation( function(frame){
        //group.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
        group.rotate(frame.time * angularSpeed / 1000);
    }, layer);
    
    animation.start();
    
    $('#pause').on('click', function () {
        
           animation.stop();
    });
}