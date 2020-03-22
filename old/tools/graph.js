// [["from", "to"], ["from", "to2"], ...]
// Names aren't forced to be unique, so it is possible two accounts got merged
// I do have unique ids, but lessons learned for the next time
// The ? are usually unicode characters, they display correctly on the site
// but the database doesn't like them a lot

// Dot format, for use in graphviz
var graph = "digraph graphname {";
graph += 'graph [outputorder=edgesfirst,overlap=false]\n';
graph += 'node [shape=box,style=filled]\n';

var util = require("util");

var from = {};

// Variable I used to generate subsets of the data
var max = reputations.length;

var nodes = {};

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function pad (n) {
	return ("0" + n.toString(16)).substr(-2);
}

var colors = {};

function color (str) {
    var h = Math.random();
	var s = Math.random() * 0.2 + 0.8;
	var l = Math.random() * 0.2 + 0.4;
	var rgb = hslToRgb(h, s, l);
	return "#" + pad(rgb[0]) + pad(rgb[1]) + pad(rgb[2]);
}

function node (name) {
	return '"' + name + '" [fillcolor="' + color(name) + '"]\n';
}

function edge (from, to) {
	return '"' +  safeFrom + '" -> "' + safeTo + '" [color="' + color(safeFrom) + "96" + '"]\n';
}

for (var k = 0; k < max; k++) {
	// No people with no name, accounts before I saved names
	// I can give them a unique id, but since I forgot to do that this time around
	// before exporting it form the database, I don't feel like going trough the trouble
	if (reputations[k][0] == null || reputations[k][1] == null) continue;

	// Let every from -> to combination appear only once
	from[reputations[k][0]] = from[reputations[k][0]] || [];
	if (from[reputations[k][0]].indexOf(reputations[k][1]) !== -1) continue;
	from[reputations[k][0]].push(reputations[k][1]);
	
	// Keep a list of nodes, I should have probably used an array with their name
	// and joined them, but yolo this works
	nodes[reputations[k][0]] = true;
	nodes[reputations[k][1]] = true;
	
	// Those pesky people with a " in their name
	var safeFrom = reputations[k][0].replace('"', '\"');
	var safeTo = reputations[k][1].replace('"', '\"');
	
	// Add an edge to the graph
	graph += edge(safeFrom, safeTo);
}

// Style all the nodes
for (var key in nodes) {
	graph += node(key);
}

graph += "}";

// Put it in the clipboard for pasting in gvedit (graphviz)
require('child_process').spawn('clip').stdin.end(util.inspect(graph));