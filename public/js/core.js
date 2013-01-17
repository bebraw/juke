$(function() {
  $('.edit').on('click', function() {
    var $opts = $('.options').toggleClass('visible');

    $opts.animate({
      'max-height': $opts.hasClass('visible')? '1000px': 0
    });
  });

  $('.forward').on('click', function() {
    MPDnext();

    updateInfo();
  });

  $('.backward').on('click', function() {
    MPDprevious();

    updateInfo();
  });

  $('.play, .pause').on('click', function() {
    $('.play').toggle();
    $('.pause').toggle();

    komponist.toggle();
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

  komponist.on('changed', function(system) {
    if(system !== 'player') return;

    updateInfo();
  });
  komponist.once('ready', updateInfo);

  updateInfo();
  updatePlayPause();
  updatePlaylist($channelTpl, function() {
    checkSelected();
    checkInputs($channelTpl);
  });
});

function getChannelTemplate() {
  return $('.channel:first').parent().clone();
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

function updatePlayPause() {
  komponist.status(function(err, data) {
    $('.play, .pause').show();
    $('.' + data.state).hide();
  });
}

function updatePlaylist($tpl, done) {
  komponist.playlistinfo(function(err, data) {
    var $c = $('.channels');

    $c.empty();

    $.each(data, function(i, v) {
        var $e = $tpl.clone();

        $('.channel', $e).val(v.file);

        $c.append($e);
    });

    done();
  });
}

function MPDnext() {
  komponist.playlistinfo(function(err, data) {
    console.log(data);
  });

  //komponist.next();
}

function MPDprevious() {
  komponist.previous();
}

function id(a) {return a;}
