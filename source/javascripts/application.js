/*
  http://fabricationgem.org
  by Cameron Daigle http://camerondaigle.com
  for Hashrocket Ventures http://hashrocket.com
*/

//= include snap.svg
//= include randomColor

$(function() {

  var gem = Snap.select("#gem");
  var duration = 1000;

  var points = {
    topright: "356 129.8",
    topleft: "235.9 60.5",
    left: "169 57.3",
    bottom: "155 176.5",
    right: "361.5 168.4",
    t1: "333.7 116.9",
    t2: "309.2 102.7",
    t3: "258.3 73.4",
    t4: "282.8 87.5",
    b1: "325.7 147.7",
    b2: "286.4 125",
    b3: "204.9 78",
    b4: "244.1 100.6"
  };

  var pointOrder = "topleft topright right bottom left topleft t1 b1 bottom b2 t2 t3 b3 bottom b4 t4 topright right left";

  var hole = gem.path(
    "M 230.4 315.4 L 4 184.7 L 230.4 54 L 456.7 184.7 Z"
  ).attr({ class: "hole", transform: "s1.3 t0 10" });

  var door_container = gem.g();

  var door_cutout = gem.path(
    "M 230.4 315.4 L 4 184.7 L 230.4 54 L 456.7 184.7 Z"
  ).attr({ fill: "white", transform: "s1.3 t0 10" });

  var door = gem.rect(-70, 0, 600, 400).attr({
    class: "door"
  });

  var panel_group = gem.g();
  var panel_container = gem.g();

  var cutout = gem.path(
    "M 230.4 315.4 L 4 184.7 L 4 0 L 456.7 0 L 456.7 184.7 Z"
  ).attr({ fill: "white", transform: "s1.3 t0 10" });

  var panel = gem.path(
    "M 230.4 275.4 L 4 144.7 L 4 134.7 L 230.4 4 L 456.7 134.7 L 456.7 144.7 Z"
  )

  var panel_l = gem.path(
    "M 230.4 265.4 L 4 134.7 L 4 144.7 L 230.4 275.4 Z"
  ).attr({ "class": "panel_l" })

  var panel_r = gem.path(
    "M 230.4 265.4 L 456.7 134.7 L 456.7 144.7 L 230.4 275.4 Z"
  ).attr({ "class": "panel_r" })

  var laser = gem.path(
    "M 235.9 0 L " + points.topleft + " Z"
  ).attr({
    "transform": "t0 50",
    "class": "laser"
  });

  var zap = gem.circle(0, 0, 5).attr({
    "class": "zap",
    "transform": "t0 50",
    fill: gem.gradient("r(0.5, 0.5, 0.5)white-yellow:20-rgba(255,0,0,.7):40-rgba(255,0,0,0)")
  });

  var outline = gem.path(buildFromPoints(pointOrder));
  var inner = gem.path(buildFromPoints(pointOrder)).transform("t0 2");

  var outline_length = outline.getTotalLength();

  outline.attr({
    "class": "outline",
    "stroke-dasharray": outline_length + " " + outline_length
  });

  inner.attr({
    "class": "inner",
    "stroke-dasharray": outline_length + " " + outline_length
  });

  panel_group.add(panel, panel_l, panel_r, outline, inner)
    .attr({
      visibility: "hidden"
    });

  door_container.add(door).attr({ mask: door_cutout });
  panel_container.add(panel_group).attr({ mask: cutout });

  var drawing = false;
  gem.click(leave);

  reset();
  draw();

  function leave() {
    if (drawing) { return; }
    door.animate({ transform: 't-900 0' }, 400, mina.easout, function() {
      panel_group
        .animate({ transform: 't0 800' }, 400, mina.easeout, draw);
    });
  }

  function wipe() {
    outline.attr({ "stroke-dashoffset": outline_length });
    inner.attr({ "stroke-dashoffset": outline_length });
  }

  function reset() {
    hide(laser);
    hide(zap);
    drawing = false;
  }

  function draw() {
    drawing = true;
    wipe();
    recolor();
    door.animate({ transform: 't0 0' }, 400, mina.easout, function() {
      panel_group.transform("t0 -200");
      panel_group
        .attr({ visibility: "visible" })
        .animate({ transform: 't0 50' }, 1000, mina.bounce, etch)
    });
  }

  function etch() {

    show(laser);
    show(zap);

    Snap.animate(0, outline_length, function(val) {
      var p = outline.getPointAtLength(val);

      zap.attr({
        cx: p.x,
        cy: p.y
      });

      laser.attr({
        d: "M " + p.x + " -50 L " + p.x + " " + p.y + " Z"
      });

      inner.attr({
        "stroke-dashoffset": outline_length - val
      });

      outline.attr({
        "stroke-dashoffset": outline_length - val
      });

    }, duration, reset);
  }

  function buildFromPoints(str) {
    return "M " + str.split(" ").map(function(p) { return points[p] }).join(" L ") + " Z";
  }

  function recolor() {
    var c = Snap.color(randomColor({luminosity: 'light'})),
        outline_color = Snap.hsl(c.h, c.s, c.l * 0.8)
        lighter_l = c.l * 1.2,
        inner_color = Snap.hsl(c.h, c.s, lighter_l > 1 ? 1 : lighter_l )

    panel.attr({ fill: c.hex });

    outline.attr({ stroke: outline_color });
    inner.attr({ stroke: inner_color });
  }

  function show(el) {
    el.attr({ visibility: 'visible' });
  }

  function hide(el) {
    el.attr({ visibility: 'hidden' });
  }

});
