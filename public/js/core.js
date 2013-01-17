$(function() {
  $('.edit').on('click', function() {
    $('.options').toggleClass('visible');
  });

  var $channelTpl = getChannelTemplate();
  $(document).on('click', '.channel', function() {
    var $e = $(this);

    checkSelected($e);
  }).on('keyup', function() {
    var $e = $(this);

    checkInputs($channelTpl, $e);
    checkSelected($e);
  });
  checkInputs($channelTpl);
  checkSelected();
});

function getChannelTemplate() {
  var $e = $('.channel:first').parent().clone();

  $('.channel', $e).val('');

  return $e;
}

function checkInputs($tpl, $e) {
  var empties = $('.channel').filter(function(i, e) {
    return $(e).val().trim().length === 0;
  });

  if(!empties.length) {
    $('.channels').append($tpl.clone());
  }
  if(empties.length > 1) {
    empties.not($e).remove();
  }
}

function checkSelected($e) {
  var $ch = $('.selected.channel:first');

  $('.channel').removeClass('selected');
  if(!$ch.length) $('.channel:first').addClass('selected');
  if($e) $e.addClass('selected');
}

