$(function() {

  if (!(/^Win/.test(window.navigator.platform))) {
    try { Typekit.load(); }
    catch (e) {}
  }

  $.fn.addID = function() {
    return $(this).each(function() {
      $(this).attr("id", $(this).text().toLowerCase().replace(" ", "-"));
    });
  };

  var $main = $(".main");

  if ($("#conveyor").is(":visible")) {
    buildExternalNav();
  } else {
    $("#wrapper").prepend($("<img/>", {src: "/images/bg_mobile.png"}));
    collapseContent();
  }

  if (window.location.hash) {
    jQuery.fx.off = true;
    $(window.location.hash.replace("!", "")).trigger("click");
    jQuery.fx.off = false;
  }

  function collapseContent() {
    var $h3s = $main.find("h3").addID();
    var $content = $main.children().not("h3");
    $content.hide();
    $h3s.click(function() {
      var $new = $(this).nextUntil("h3");
      $content.not($new).hide();
      $new.toggle();
      window.scrollTo(0, $(this).offset().top);
      window.location.hash = $(this).attr("id");
    });
  }

  function buildExternalNav() {
    $main.detach();
    var $nav = $("<nav />");
    var $ul = $("<ul />").appendTo($nav);
    var $article;
    $main.children().detach().each(function() {
      var $el = $(this);
      if ($el[0].nodeName === "H3") {
        $("<li />").text($el.detach().text()).appendTo($ul).addID();
        $article = $("<article />").appendTo($main);
      } else {
        $el.appendTo($article);
      }
    });

    $nav.insertAfter($(".opening"));
    $main.insertAfter($nav);
    $main.find("article").hide().first().show();

    $nav.find("li").click(function() {

      var $li = $(this);
      var $a = $main.find("article");
      var $new = $a.eq($li.addClass("selected").index());

      if ($new.is(":hidden")) {
        window.location.hash = "!" + $(this).attr("id");
        $nav.find("li").not($li).removeClass();
        $main.css("height", $main.height());

        $a.filter(":visible").fadeOut(200, function() {
          $main.animate({
            height: $new.height()
          }, 200, function() {
            $new.fadeIn(200);
          });
        });
      }

      return false;
    }).filter(":first").click();
  }

  (function($conveyor) {

    var $row = $("#items");
    var $items = $row.children();
    var $puncher = $("#puncher");
    var $panel = $("#panel");
    var $cutout = $("#cutout");
    var $glow = $("#glow");
    var $fire = $("#catcher div");

    if($conveyor.is(":visible")) {
      walk();
    };

    function walk() {
      populate();
      $conveyor.stop(true, false);
      var elementsAreVisible = function() {
        var st = $(window).scrollTop();
        return (st < $("#placer").height() || st + $(window).height() > $("#catcher_back").offset().top);
      };
      if(elementsAreVisible()) {
        $items.animate({
          right: "-=132px",
          bottom: "-=76px"
        }, 200, function(e) {
            if ($conveyor.find(":animated").length == 1) {
              placePanel();
              punchPanel();
            }
        });
      } else {
        setTimeout(walk, 1000);
      }
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
            "right": 590 - 132 * i + "px",
            "bottom": 760 - 76 * i + "px"
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
      $glow.delay(600).animate({opacity: 0.3}, 600, function() {
        $panel.animate({ top: 206 }, 100, function() {
          $panel.css({ top: 94 });
          $row.find(":eq(5)").addClass("filled");
          $glow.animate({opacity: 0}, 400, walk);
        });
      });
    }

    function punchPanel() {
      $puncher.animate({ top: -60 }, 400, function() {
        $cutout.show().css("top", 80);
        $puncher.animate({ top: 0 }, 50, function() {
            $row.animate({ paddingTop: 10 }, 50).animate({ paddingTop: 0 }, 50);
            $row.find(":eq(3)").addClass("punched");
            $cutout.animate({ top: $(document).height() + 400 }, 1000);
            $fire.delay(600).fadeIn(50).fadeOut(800);
            $puncher.delay(50).animate({ top: -100 }, 200);
        });
      });
    }
  })($("#conveyor"));

});