$(function() {
  $('.edit').on('click', function() {
    $('.options').toggleClass('visible');
  });

  $('.forward').on('click', function() {
    komponist.next();

    updateInfo();
  });

  $('.backward').on('click', function() {
    komponist.previous();

    updateInfo();
  });

  $('.play, .pause').on('click', function() {
    $('.play').toggle();
    $('.pause').toggle();

    komponist.toggle();
  })

  // TODO: set visibility state whether or not playback is on
  $('.pause').hide();

  var $channelTpl = getChannelTemplate();
  $(document).on('click', '.channel', function() {
    var $e = $(this);

    checkSelected($e);
  }).on('keyup', function() {
    var $e = $(this);

    checkInputs($channelTpl, $e);
    checkSelected($e);
  });

  komponist.on('changed', function(system) {
    if(system !== 'player') return;

    updateInfo();
  });
  komponist.once('ready', updateInfo);

  checkInputs($channelTpl);
  checkSelected();
  updateInfo();
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

function updateInfo() {
  komponist.currentsong(function(err, data) {
    var info = [data.Name, data.Title].filter(id).join(' - ');

    $('.info').text(info);
  });
}

function id(a) {return a;}
