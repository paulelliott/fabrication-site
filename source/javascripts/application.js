/*
  http://fabricationgem.org
  by Cameron Daigle http://camerondaigle.com
  for Hashrocket Ventures http://hashrocket.com
*/

//= include snap.svg

$(function() {

  var nav = {
    $el: $("#site_nav"),
    buildNavItem: function($h3) {
      var $li = $("<li />");
      $li.append(
        $("<a />")
          .attr("href", "#" + $h3.text().toLowerCase().replace(/ /g, '-'))
          .text($h3.text())
          .data("heading", $h3)
      );
      return $li;
    },
    buildNav: function() {
      var $ul = nav.$el.find('ul');
      $("main h3").each(function() {
        $ul.append(nav.buildNavItem($(this)));
      });
    },
    navigate: function() {
      $("main h3").removeClass("active");
      $(this).data("heading").addClass("active");
      $(this)
        .closest('li').addClass("active")
        .siblings().removeClass("active");
    },
    openNav: function(e) {
      nav.$el.addClass("open");
      e.stopPropagation();
    },
    closeNav: function() {
      nav.$el.removeClass("open");
    },
    readURL: function() {
      hash = window.location.hash.replace("#", "")
      if (hash.length) {
        this.$el.find("a[href='#" + hash + "']").click();
      } else {
        this.$el.find("li:first a").click();
      }
    },
    init: function() {
      this.buildNav();

      this.$el.on("click", "a.nav_toggle", this.openNav);
      $(document.body).on("click", this.closeNav);

      this.$el.on("click", "li a", this.navigate);

      this.readURL();
    }
  }

  nav.init();

  var gem = Snap.select("#gem");
  var duration = 8000;

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

  var $headertext = $("#site_head h1");

  var pointOrder = "topleft topright right bottom left topleft t1 b1 bottom b2 t2 t3 b3 bottom b4 t4 topright right left";

  var hole_group = gem.g();

  var hole = gem.path(
    "M 230.4 315.4 L 4 184.7 L 230.4 54 L 456.7 184.7 Z"
  ).attr({ fill: gem.gradient("l(0, 0, 0, 1)#222-#000")});

  var hole_shadow = gem.path(
    "M 230.4 315.4 L 4 184.7 L 230.4 54 Z"
  ).attr({ fill: gem.gradient("l(0, 0, 0, 1)#333-#111")});

  hole_group.add(hole, hole_shadow).attr({ transform: "s1.3" });

  var door_container = gem.g();

  var door_cutout = gem.path(
    "M 230.4 315.4 L 4 184.7 L 230.4 54 L 456.7 184.7 Z"
  ).attr({ fill: "white", transform: "s1.31" });

  var door = gem.rect(-70, 0, 600, 400).attr({
    class: "door"
  });

  var panel_group = gem.g();
  var panel_group_inner = gem.g();
  var panel_container = gem.g();

  var cutout = gem.path(
    "M 230.4 315.4 L 4 184.7 L 4 0 L 456.7 0 L 456.7 184.7 Z"
  ).attr({ fill: "white", transform: "s1.3 t0 -7" });

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
    "class": "laser"
  });

  var zap = gem.circle(0, 0, 5).attr({
    "class": "zap",
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

  panel_group_inner.add(panel, panel_l, panel_r, outline, inner)

  door_container.add(door).attr({ mask: door_cutout });
  panel_container.add(panel_group.add(panel_group_inner)).attr({ mask: cutout });

  var drawing = false;
  $("#site_head").click(leave);

  hide(panel_group);
  reset();
  draw();

  function leave() {
    if (drawing) { return; }
    setTimeout(function() {
      panel_group_inner.animate({ transform: 'r40,0,100' }, 400, mina.easout);
    }, 100);
    setTimeout(function() {
      panel_group.animate({ transform: 't0 800' }, 400, mina.easeout, function() {
        draw();
      });
    }, 200);
    door.animate({ transform: 't-900 0' }, 400, mina.easout);
  }

  function wipe() {
    outline.attr({ "stroke-dashoffset": outline_length });
    inner.attr({ "stroke-dashoffset": outline_length });
    panel_group_inner.transform('');
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
      rotation = Math.round(Math.random() * 100) - 50;
      panel_group.transform("t0 -200 r" + rotation);
      panel_group
        .attr({ visibility: "visible" })
        .animate({ transform: 't0 40 r0' }, 1000, mina.bounce, etch)
    });
  }

  function etch() {

    show(laser);
    show(zap);
    $headertext.removeClass("drawing");

    Snap.animate(0, outline_length, function(val) {
      var p = outline.getPointAtLength(val);

      zap.attr({
        cx: p.x,
        cy: p.y + 40
      });

      laser.attr({
        d: "M " + p.x + " -40 L " + p.x + " " + (p.y + 40) + " Z"
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
    var h = Math.random() * 255,
        s = Math.random() * 70,
        color = Snap.hsl(h, s, 70),
        outline_color = Snap.hsl(h, s * 0.8, 50)
        inner_color = Snap.hsl(h, 100, 90)

    panel.attr({ fill: color });

    outline.attr({ stroke: outline_color });
    inner.attr({ stroke: inner_color });
  }

  function show(el) {
    el.removeClass('hidden');
  }

  function hide(el) {
    el.addClass('hidden');
  }

});
