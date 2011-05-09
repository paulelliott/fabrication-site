$(function() {

  var $cv = $("#conveyor");
  var $items = $("#items");
  var $puncher = $("#puncher");
  var $panel = $("#panel");
  var $cutout = $("#cutout");
  var $glow = $("#glow");

  populate();

  setInterval(function() {
    populate();
    var $c = $items.children();
    var $check = $("<span />", {id: "check"}).appendTo($("body"));
    if ($("body").find("#check").length) {
      $c.animate({
        right: "-=132px",
        bottom: "-=76px"
      }, {
        queue: false,
        duration: 200,
        complete: function() {
          if ($c.index() == 0) {
            $c.last().removeClass().css({
              right: 458,
              bottom: 684
            }).insertBefore($c.eq(0));
            placePanel();
            punchPanel();
          }
        }
      });
      $("#check").detach();
    };
  }, 2000);

  function populate() {
    var $original = $items.children().detach().first().css({
      right: -730,
      bottom: 0
    });
    for (var i = 0, max = 9; i <= max; i++) {
      var $n = $original.clone().prependTo($items).css({
        right: "+=" + 132 * i + "px",
        bottom: "+=" + 76 * i + "px"
      });
      if( i < 5 ) {
        $n.addClass("filled");
      } else if ( i < 7 ) {
        $n.addClass("punched");
      }
    }
  }

  function placePanel() {
    $glow.delay(600).fadeIn(600, function() {
      $panel.animate({ top: 206 }, {
        queue: false,
        duration: 100,
        complete: function() {
        $panel.css({ top: 94 });
        $items.find(":eq(5)").addClass("filled");
        $glow.fadeOut(200);
        }
      });
    });
  }

  function punchPanel() {
    $puncher.animate({ top: -60 }, {
      duration: 400,
      queue: false, 
      complete: function() {
      $cutout.show().css("top", 80);
      $puncher.animate({ top: 0 }, {
        duration: 50,
        queue: false,
        complete: function() {
          $items.animate({ paddingTop: 10 }, 50).animate({ paddingTop: 0 }, 50);
          $items.find(":eq(3)").addClass("punched");
          $cutout.animate({
            top: $(window).height() + 200
          }, { duration: 500, queue: false });
          $puncher.delay(50).animate({ top: -100 }, 200);
        }
      });
      }
    });
  }

});