# LightJS

This is the LightJS library for HTML5.
It assumes an available canvas and context object.

This library can draw light, coming from a single light source,
segments and the shadows they cast on the 2D plain.

To use it you must include it in your HTML5 page before the script that will use it.

The light.js file contains geometric functions,
a Vector class, a Segment class and a LightEngine class.

To start rendering the light envirorment you should create an instance of that class,
specifying arguments to its constructor, which customize the light envirorment.

The arguments are specified in the following order:

lr - light radius(how far it can illuminate)

lc - an RGB tuple specifying the color of the light

bg - a style string(can be HEX, RGB, CSS color string...), specifying background color

lv - an instance of Vector with the coordinates of the light source

sc - an RGB tuple specifying the color of the segments

sw - an integer specifying the width of the segments


var lsource = new Vector(0, 0);

var lengine = new LightEngine(200, [255, 255, 255], 'black', lsource, [0, 255, 0], 5);

//update light envirorment

lengine.update();

//draw light envirorment

lengine.draw();

//To add a new segment do the following:

var start = new Vector(x1, y1);

var end = new Vector(x2, y2);

lengine.segments.push( new Segment(start, end) );

//if you want the light envirorment to respond to the new segment:

lengine.update();

lengine.draw();

//The demo folder contains a small demo, showcasing some example usage of the library.

//The demo is using the canvasJS wrapper library.
