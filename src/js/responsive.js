// Responsive Video ///////////////////////////////////////////////

// Keep relative height on video iframes
$(function() {
  var $all_videos = $("iframe[src*='//player.vimeo.com'], iframe[src*='//www.youtube.com'], object, embed");
  $all_videos.each(function() {
    $(this)
      .attr('data-aspect-ratio', this.height / this.width)
      .removeAttr('height')
      .removeAttr('width');
  });

  $(window).resize(function() {
    $all_videos.each(function() {
      var $el = $(this),
          new_width = $el.parent().width();
      $el.width( new_width )
         .height(new_width * $el.attr('data-aspect-ratio'));
    });
  }).resize();
});
