$(function() {

  try{Typekit.load();}catch(e){}

  var $cv = $("#conveyor");
  var $row = $("#items");
  var $items = $row.children();
  var $puncher = $("#puncher");
  var $panel = $("#panel");
  var $cutout = $("#cutout");
  var $glow = $("#glow");
  var $fire = $("#catcher div");

  walk();

  function walk() {
    populate();
    $cv.stop(true, false);
    $items.animate({
      right: "-=132px",
      bottom: "-=76px"
    }, 200, function(e) {
        if ($cv.find(":animated").length == 1) {
          placePanel();
          punchPanel();
        }
    });
  };

  function populate() {
    var $original = $items.css({
      right: 590,
      bottom: 760
    });
    $items.removeClass().each(function(i) {
      var $c = $(this);
      if ($c.index() > 0) {
        $c.css({
          right: "-=" + 132 * i + "px",
          bottom: "-=" + 76 * i + "px"
        });
      }
      if (i > 5) {
        $c.addClass("filled");
      } else if (i > 3) {
        $c.addClass("punched");
      }
    });
  }

  function placePanel() {
    $glow.delay(600).fadeIn(600, function() {
      $panel.animate({ top: 206 }, 100, function() {
        $panel.css({ top: 94 });
        $row.find(":eq(5)").addClass("filled");
        $glow.fadeOut(400, walk);
      });
    });
  }

  function punchPanel() {
    $puncher.animate({ top: -60 }, 400, function() {
      $cutout.show().css("top", 80);
      $puncher.animate({ top: 0 }, 50, function() {
          $row.animate({ paddingTop: 10 }, 50).animate({ paddingTop: 0 }, 50);
          $row.find(":eq(3)").addClass("punched");
          $cutout.animate({ top: $(document).height() }, 1000);
          $fire.delay(800).fadeIn(50).fadeOut(800);
          $puncher.delay(50).animate({ top: -100 }, 200);
      });
    });
  }

});