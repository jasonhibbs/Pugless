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
