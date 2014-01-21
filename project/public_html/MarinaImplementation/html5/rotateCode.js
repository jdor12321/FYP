// Invisible rotation control.
// Somewhat related SO question: http://stackoverflow.com/questions/12309306/transform-move-scale-rotate-shapes-with-kineticjs
// Offset: http://stackoverflow.com/questions/11365349/using-the-kineticjs-how-to-rotate-an-image-object-in-place

function radians (degrees) {return degrees * (Math.PI/180)}
function degrees (radians) {return radians * (180/Math.PI)}
// Calculate the angle between two points.
// cf. http://stackoverflow.com/a/12221474/257568
function angle (cx, cy, px, py) {var x = cx - px; var y = cy - py; return Math.atan2 (-y, -x)}
function distance (p1x, p1y, p2x, p2y) {return Math.sqrt (Math.pow ((p2x - p1x), 2) + Math.pow ((p2y - p1y), 2))}

jQuery (function(){
  var stage = new Kinetic.Stage ({container: 'kineticDiv', width: 800, height: 300})
  var layer = new Kinetic.Layer(); stage.add (layer)

  var status = new Kinetic.Text ({
    x: 0, y: 0, fill: 'black'
  }); layer.add (status)
  var group = new Kinetic.Group ({
    x: 100, y: 100
  }); layer.add (group)
  var text = new Kinetic.Text ({
    x: 0, y: 0, fill: 'black', text: 'ॐ', scale: 3
  }); group.add (text)
  group.setOffset (text.getWidth() * text.getScale().x / 2, text.getHeight() * text.getScale().y / 2)
  var center = new Kinetic.Circle ({
    x: group.getOffset().x, y: group.getOffset().y, fill: 'green', opacity: 0.2, radius: 10
  }); group.add (center)
  function linePoints (dis) {return [
    [text.getWidth() * text.getScale().x + 7, group.getOffset().y],
    [text.getWidth() * text.getScale().x + Math.max (dis, 7), group.getOffset().y]
  ]}
  var line = new Kinetic.Line ({
    points: linePoints (57), stroke: 'black', opacity: 0
  }); group.add (line)
  var controlGroup = new Kinetic.Group ({
    x: group.getPosition().x + text.getWidth() * text.getScale().x + 55,
    y: group.getPosition().y,
    opacity: 0, draggable: true
  }); layer.add (controlGroup)
  var sign = new Kinetic.Path({
    x: -10, y: -10,
    // Path from http://www.html5canvastutorials.com/kineticjs/html5-canvas-kineticjs-path-tutorial/
    data: 'M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z',
    scale: 0.4, fill: 'black'
  }); controlGroup.add (sign)
  var control = new Kinetic.Circle ({
    x: 0, y: 0, fill: 'yellow', opacity: 0, radius: 17
  }); controlGroup.add (control)

  controlGroup.setDragBoundFunc (function (pos) {
    var groupPos = group.getPosition()
    var rotation = degrees (angle (groupPos.x, groupPos.y, pos.x, pos.y))
    var dis = distance (groupPos.x, groupPos.y, pos.x, pos.y)
    status.setText ('x: ' + pos.x + '; y: ' + pos.y + '; rotation: ' + rotation + '; distance:' + dis)
    group.setRotationDeg (rotation)
    line.setPoints (linePoints (dis - 33))
    layer.draw()
    return pos
  })

  var signOpacity = 0; var animationTick = 0
  var signOpacityAnimation = new Kinetic.Animation (function (frame) {
    var opacity = controlGroup.getOpacity()
    //status.setText ('animationTick: ' + animationTick++)
    //status.setText ('signOpacity: ' + signOpacity + '; opacity: ' + opacity)
    if (opacity == signOpacity) {signOpacityAnimation.stop(); return}
    if (opacity < signOpacity) opacity += frame.timeDiff / 200; else opacity -= frame.timeDiff / 200
    if (opacity < 0) opacity = 0; if (opacity > 1) opacity = 1
    controlGroup.setOpacity (opacity)
    line.setOpacity (opacity / 2)
  }, layer); signOpacityAnimation.start()
  function calcSignOpacity() {
    var mousePos = stage.getMousePosition()
    if (mousePos) {
      var controlPos = controlGroup.getPosition(), groupPos = group.getPosition()
      var dis = Math.min (
        distance (mousePos.x, mousePos.y, controlPos.x, controlPos.y),
        distance (mousePos.x, mousePos.y, groupPos.x, groupPos.y))
      //status.setText ('distance: ' + dis)
      signOpacity = dis <= 50 ? 1 : 0
    } else signOpacity = 0
    if (controlGroup.getOpacity() != signOpacity && !signOpacityAnimation.isRunning()) signOpacityAnimation.start()
  }
  stage.getContainer().addEventListener ('mousemove', calcSignOpacity, false);

  controlGroup.on ('dragend', function() {
    // cf. http://stackoverflow.com/questions/3996687/how-do-i-only-allow-dragging-in-a-circular-path
    var radius = text.getWidth() * text.getScale().x + 55, angle = group.getRotation(), groupPos = group.getPosition()
    //controlGroup.setPosition ({
    //  x: groupPos.x + radius * Math.cos (angle),
    //  y: groupPos.y + radius * Math.sin (angle)})
    controlGroup.transitionTo ({
      x: groupPos.x + radius * Math.cos (angle),
      y: groupPos.y + radius * Math.sin (angle),
      duration: 0.2,
      callback: calcSignOpacity
    })
    line.setPoints (linePoints (57))
    // https://github.com/ericdrowell/KineticJS/issues/123
    //line.transitionTo ({points: linePoints (57), duration: 1})
    layer.draw()
  })

  layer.draw()
})