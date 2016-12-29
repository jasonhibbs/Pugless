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

  var $allVideos = $("iframe[src^='http://player.vimeo.com'], iframe[src^='http://www.youtube.com'], object, embed"),
  $fluidEl = $('figure');

  $allVideos.each(function() {

    $(this)
      .attr('data-aspectRatio', this.height / this.width)
      .removeAttr('height')
      .removeAttr('width');
  });

  $(window).resize(function() {

    var newWidth = $fluidEl.width();
    $allVideos.each(function() {

      var $el = $(this);
      $el.width(newWidth)
         .height(newWidth * $el.attr('data-aspectRatio'));
    });

  }).resize();

});

////////////////////////////////////////////////////////////////
/* jquery.keyboard-focus.js (defines classes for when focus was obtained via the keyboard)
 * @author Andrew Ramsden
 * @see http://irama.org/web/dhtml/key-focus/
 * @license Common Public License Version 1.0 <http://www.opensource.org/licenses/cpl1.0.txt>
 * @requires jQuery (tested with version 1.3.1) <http://jquery.com/>
 */

jQuery.keyFocus = {};
jQuery.keyFocus.conf = {
  keyFocusClass   : 'focus_keys',
  mouseFocusClass : 'focus_mouse',
  focusClass      : 'focus_both',
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
}

// Buttons should be activated with Space bar if also focussed
function initARIAButtons() {
  $(document).on('keydown', 'a[role="button"]', function(event){
    var $button = $(this);

    if (
      event.keyCode == 32 &&
      $button.not(':disabled').not('.disabled').is(':focus')
    ) {
      $(this).click();
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
        //case 13:
        case 32:
          makeActive(this);
          break;
      }
    })
  });
}

function initARIAExpanders(el) {
  $(el || '[aria-expanded][aria-controls]').each(function() {
    var $control = $(this),
        controls = $control.attr('aria-controls'),
        $display = $('#' + controls);

    function setState(state) {
      if (state === 'true') {
        $display.removeAttr('aria-hidden');
        $control.attr('aria-expanded', true);
      } else {
        $display.attr('aria-hidden', true);
        $control.attr('aria-expanded', false);
      }
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
        case 13:
        case 32:
        case 38:
        case 40:
          toggleState();
          break;
      }
    });
  });
}


// Stuff //////////////////////////////////////////////////////////
String.prototype.classify = function() {
  return this.trim().toLowerCase().replace(/\s/g, '_');
};
