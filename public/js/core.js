$(function() {
  var meta = {
    currentSong: 0
  };

  $('.edit').on('click', function() {
    var $opts = $('.options').toggleClass('visible');

    $opts.animate({
      'max-height': $opts.hasClass('visible')? '1000px': 0
    });
  });

  $('.forward').on('click', function() {
    nextSong(meta);
  });

  $('.backward').on('click', function() {
    previousSong(meta);
  });

  $('.play, .pause').on('click', function() {
    $('.play').toggle();
    $('.pause').toggle();

    if($('.play:visible').length) komponist.stop();
    else komponist.play(meta.currentSong);
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

    updateSong(meta);
  });
  komponist.once('ready', function() {
    updateSong(meta);
    updatePlayPause();
    updatePlaylist($channelTpl, function() {
      checkSelected();
      checkInputs($channelTpl);
    });
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

function updateSong(meta) {
  komponist.currentsong(function(err, data) {
    meta.currentSong = parseInt(data.Pos, 10);

    updateInfo(meta);
  });
}

function updateInfo(meta) {
  komponist.playlistid(function(err, data) {
    var d = data[meta.currentSong];
    var info = [d.Name, d.Title].filter(id).join(' - ');

    $('.info').text(info);
  });
}

function updatePlayPause() {
  komponist.status(function(err, data) {
    var state = data.state == 'play'? 'play': 'pause';

    $('.play, .pause').show();
    $('.' + state).hide();
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

function nextSong(meta) {
  komponist.playlistid(function(err, data) {
    meta.currentSong++;

    if(meta.currentSong == data.length) meta.currentSong = 0;

    komponist.play(meta.currentSong);
    updateInfo(meta);
  });
}

function previousSong(meta) {
  komponist.playlistid(function(err, data) {
    meta.currentSong--;

    if(meta.currentSong < 0) meta.currentSong = data.length - 1;

    komponist.play(meta.currentSong);
    updateInfo(meta);
  });
}

function id(a) {return a;}
