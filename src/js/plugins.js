// PLUGINS ////////////////////////////////////////////////////////

// Debounce
// Responsive Video
// Keyboard Focus
// ARIA Controls
// Stuff

// Debounce ///////////////////////////////////////////////////////
// https://davidwalsh.name/javascript-debounce-function

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate, signal, signal_delay) {
  var timeout, delay;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
      delay = window.setTimeout(function() {
        $('html').removeClass(signal);
      }, signal_delay);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    clearTimeout(delay);
    timeout = window.setTimeout(later, wait);
    $('html').addClass(signal);
    if (callNow) func.apply(context, args);
  };
};

// Responsive Video ///////////////////////////////////////////////
// Keep relative height on video iframes
$(function() {
  var $allVideos = $("iframe[src*='//player.vimeo.com'], iframe[src*='//www.youtube.com'], object, embed");
  $allVideos.each(function() {
    $(this)
      .attr('data-aspectRatio', this.height / this.width)
      .removeAttr('height')
      .removeAttr('width');
  });

  $(window).resize(function() {
    $allVideos.each(function() {
      var $el = $(this),
          new_width = $el.parent().width();
      $el.width( new_width )
         .height(new_width * $el.attr('data-aspectRatio'));
    });
  }).resize();
});

// Keyboard Focus /////////////////////////////////////////////////
// jquery.keyboard-focus.js (defines classes for when focus was obtained via the keyboard)
// @author Andrew Ramsden
// @see http://irama.org/web/dhtml/key-focus/
// @license Common Public License Version 1.0 <http://www.opensource.org/licenses/cpl1.0.txt>
// @requires jQuery (tested with version 1.3.1) <http://jquery.com/>
jQuery.keyFocus = {};
jQuery.keyFocus.conf = {
  keyFocusClass   : '_focus_keys',
  mouseFocusClass : '_focus_mouse',
  focusClass      : '_focus_both',
  mouseTimeout    : 50
};

(function($){ /* start closure (protects variables from global scope) */

  $(document).ready(function(){
    $('body').trackFocus();
  });

  /**
   * @see http://www.w3.org/TR/wai-aria-practices/#kbd_generalnav
   * @param DOMNode this The container element that acts as "toolbar" for the controls.
   * @param jQuerySelector controlSelector Individual controls to navigate between.
   * @param Object options A set of options to override the $.AKN.defaultOptions.
   */
  $.fn.trackFocus = function () {
    $(this).data('last-device-used', '');

    $(this)
      .bind('mousedown', function(e){
        $(this).data('last-device-used', 'mouse');
        $(this).data('last-device-used-when', new Date().getTime());
      })
      .bind('keydown', function(e){
        $(this).data('last-device-used', 'keyboard');
      })
      .bind('focusin', function(e){
        // Keyboard events sometimes go undetected (if tabbing in from outside the document,
        // but mouse clicks used to focus will always be closely
        // followed by the focus event. Clearing the last-device-used
        // after a short timeout and assuming keyboard when no device is known
        // works!
          if ($(this).data('last-device-used') != 'mouse' || new Date().getTime()-50 > $(this).data('last-device-used-when')) {
            $(e.target).addClass($.keyFocus.conf.keyFocusClass);
          } else {
            $(e.target).addClass($.keyFocus.conf.mouseFocusClass);
          }
          $(e.target).addClass($.keyFocus.conf.focusClass);
      })
      .bind('focusout', function(e){
        $('.'+$.keyFocus.conf.keyFocusClass+', .'+$.keyFocus.conf.mouseFocusClass).removeClass($.keyFocus.conf.keyFocusClass+' '+$.keyFocus.conf.mouseFocusClass);
        $(e.target).removeClass($.keyFocus.conf.focusClass);
      })
    ;
  };

})(jQuery);

// ARIA Controls //////////////////////////////////////////////////
initARIA();

function initARIA() {
  initARIAButtons();
  initARIAPressers();
  initARIACheckers();
  initARIATablists();
  initARIAExpanders();
  initARIASorters();
  initComboBoxes();
}

// Buttons should be activated with Space bar if also focussed
function initARIAButtons() {
  $(document).on('keydown', '[role="button"]', function(event){
    var $button = $(this);
    var k_space = 32;

    if (
      event.keyCode == k_space &&
      $button.not(':disabled').not('.disabled').is(':focus')
    ) {
      $button.click();
    }
  });
}

// [aria-pressed] defines a toggle button
function initARIAPressers(el) {
  $(el || '[aria-pressed]').click(function() {
    var $this = $(this),
        pressed = $this.attr('aria-pressed');

    if (pressed == 'false') {
      $this.attr('aria-pressed', true);
    } else {
      $this.attr('aria-pressed', false);
    }
  });
}

// [aria-checked] defines a checkable element
function initARIACheckers(el) {
  $(el || '[aria-checked]').click(function() {
    var $this = $(this),
        pressed = $this.attr('aria-checked');

    if (pressed == 'false') {
      $this.attr('aria-checked', true);
    } else {
      $this.attr('aria-checked', false);
    }
  });
}

function initARIATablists(el) {
  $(el || '[role="tablist"]').each(function() {
    var $list = $(this),
        $tabs = $list.find('[aria-controls]'),
        $displays = $('#' + $tabs.first().attr('aria-controls'));

    var k_enter = 13, k_space = 32, k_up = 38, k_down = 40;

    $tabs.each(function(i) {
      if (!i) {
        return true;
      }
      var $tab = $(this);
          $tab.removeAttr('href');

      var $display = $('#' + $tab.attr('aria-controls'));
      $displays = $displays.add($display);
    });

    function makeActive(el) {
      var $tab = $(el),
          $display = $('#' + $tab.attr('aria-controls'));

      $tabs.removeAttr('aria-selected');
      $displays.attr('aria-hidden', true);

      $tab.attr('aria-selected', true);
      $display.removeAttr('aria-hidden');
    }

    $tabs.click(function(e) {
      e.preventDefault();
      makeActive(this);
    });

    $tabs.keydown(function(e) {
      switch (e.which) {
        // case k_enter:
        case k_space:
          e.preventDefault();
          makeActive(this);
          break;
      }
    })
  });
}

function initARIAExpanders(el) {
  $(el || '[aria-expanded][aria-controls]').each(function() {
    var $control = $(this),
        controls_id = $control.attr('aria-controls'),
        $display = $('#' + controls_id),
        $other_controls = $('[aria-controls="' + controls_id + '"]').not($control);

    var k_enter = 13, k_space = 32, k_up = 38, k_down = 40;

    function setState(state) {
      if (state === 'true') {
        $display.removeAttr('aria-hidden');
        $control.attr('aria-expanded', true);
        $other_controls.attr('aria-expanded', true);
      } else {
        $display.attr('aria-hidden', true);
        $control.attr('aria-expanded', false);
        $other_controls.attr('aria-expanded', false);
      }

      window.dispatchEvent(new Event('resize'));
    }

    function toggleState() {
      var state = $control.attr('aria-expanded');
      setState(state === 'false' ? 'true' : 'false');
    }

    setState($control.attr('aria-expanded'));

    $control.click(function() {
      toggleState();
    });

    $control.keydown(function(e) {
      switch (e.which) {
        case k_enter:
        // case k_space:
        // case k_up:
        // case k_down:
          toggleState();
          break;
      }
    });
  });
}

function initARIASorters(el) {
  $(el || '[aria-sort]').click(function() {
    var $this = $(this),
        options = ['ascending', 'descending'],
        current = $this.attr('aria-sort'),
        index = options.indexOf(current),
        new_index = index + 1;

    if (new_index === options.length) {
      new_index = 0;
    }

    $this.parents('thead').find('th').attr('aria-sort', 'none');
    $this.attr('aria-sort', options[new_index]);
  });
}

function initComboBoxes(el) {
  $(el || '[role=combobox]').each(function() {
    var $input = $(this),
        $list  = $('#' + $input.attr('aria-owns')),
        $options = $list.find('[role=option]'),
        $selected;

    var list_hidden = true;

    var k_enter = 13, k_space = 32, k_up = 38, k_down = 40, k_esc = 27;

    function handleKeyDown(e) {
      switch (e.which) {
        case k_enter:
          insertSelected();
          e.preventDefault();
          break;
        case k_up:
          selectPrev();
          e.preventDefault();
          break;
        case k_down:
          selectNext();
          e.preventDefault();
          break;
      }
    }

    function handleKeyUp(e) {
      switch (e.which) {
        case k_esc:
          e.preventDefault();
          hideList();
          break;
      }
      updateList();
    }

    function handleFocus(e) {
      if ($input.val()) {
        updateList();
      } else {
        hideList();
      }
    }

    function handleBlur(e) {
      hideList();
    }

    function handleClick(e) {
      if ( $(e.target).is('[role=option]') ) {
        updateSelected( $(e.target) );
        $input.focus();
        insertSelected();
      }
    }

    function selectNext() {
      if (list_hidden) {
        return;
      }

      var $shown = getShownOptions();

      for (var i = 0; i < $shown.length; i++) {
        var $opt = $shown.eq(i);
        if ($opt.is($selected)) {
          if ($shown.eq(i + 1).length) {
            updateSelected($shown.eq(i + 1));
            return;
          }
        }
      }

      if (!$selected && $shown.length) {
        updateSelected($shown.first());
      }
    }

    function selectPrev() {
      if (list_hidden) {
        return;
      }

      var $shown = getShownOptions();

      for (var i = $shown.length - 1; i > 0; i--) {
        var $opt = $shown.eq(i);
        console.log(i, $opt);
        if ($opt.is($selected)) {
          if ($shown.eq(i - 1).length) {
            console.log($shown.eq(i - 1));
            updateSelected($shown.eq(i - 1));
            return;
          }
        }
      }

      if (!$selected && $shown.length) {
        updateSelected($shown.last());
      }
    }

    function getShownOptions() {
      return $list.find('[role=option]:visible');
    }

    function updateSelected($el) {
      if (!$el) {
        return
      }

      if ($selected) { $selected.removeAttr('aria-selected'); }
      $selected = $el;
      $el.attr('aria-selected', true);
      $input.attr('aria-activedescendant', $el.attr('id'));
    }

    function insertSelected() {
      if ($selected) {
        if ($input.val()) {
          $input.val($selected.text());
        }
        clearSelected();
      }
    }

    function clearSelected() {
      if ($selected) {
        $input.removeAttr('aria-activedescendant');
        $selected.removeAttr('aria-selected');
      }
      $selected = null;
      hideList();
    }

    function hideList() {
      list_hidden = true;
      $input.attr('aria-expanded', false);
      $list.attr('aria-hidden', true);
    }

    function showList() {
      list_hidden = false;
      $input.attr('aria-expanded', true);
      $list.removeAttr('aria-hidden');
    }

    function updateList() {
      showList();
      filterList();
    }

    function filterList() {
      var val = $input.val().toUpperCase(),
          matches = 0;

      if (!val) {
        hideList();
        return;
      }

      $options.each(function() {
        var $opt = $(this),
            text = $opt.text().toUpperCase();

        if (text.indexOf(val) < 0 || val == text) {
          $opt.attr('aria-hidden', true);
        } else {
          $opt.removeAttr('aria-hidden');
          matches++;
        }
      });

      if (!matches) {
        hideList();
      }
    }

    $input
      .keyup(handleKeyUp)
      .keydown(handleKeyDown)
      .focus(handleFocus)
      .blur(handleBlur);

    $list.click(handleClick);

  });
}


// Stuff //////////////////////////////////////////////////////////
String.prototype.classify = function() {
  return this.trim().toLowerCase().replace(/\s/g, '_');
};
