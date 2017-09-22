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
