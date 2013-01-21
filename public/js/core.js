$(function() {
  var meta = {
    currentSong: 0
  };

  initialize(components, meta);
});

function initialize(components, meta) {
  for(var name in components) components[name](meta);
}

var components = {
  footer: function() {
    $('.footer').on('click', function() {
      var $opts = $('.options').toggleClass('visible');

      $opts.animate({
        'max-height': $opts.hasClass('visible')? '1000px': 0
      });
    });
  },
  forward: function(meta) {
    $('.forward').on('click', function() {
      nextSong(meta);
    });
  },
  backward: function(meta) {
    $('.backward').on('click', function() {
      previousSong(meta);
    });
  },
  playPause: function(meta) {
    $('.play, .pause').on('click', function() {
      $('.play').toggle();
      $('.pause').toggle();

      if($('.play:visible').length) komponist.stop();
      else komponist.play(meta.currentSong);
    });
  },
  channels: function(meta) {
    var $channelTpl = templates.channel();

    $(document).on('click', '.channel', function() {
      var $e = $(this);

      selectChannel($e, meta);
      resume(meta.currentSong);
    }).on('keyup', function() {
      var $e = $(this);

      checkInputs($channelTpl, $e);
      selectChannel($e, meta);
    });
  },
  komponist: function(meta) {
    var $channelTpl = templates.channel();

    komponist.on('changed', function(system) {
      if(system !== 'player') return;

      updateSong(meta);
    });
    komponist.once('ready', function() {
      updateSong(meta);
      updatePlayPause();

      createPlaylist($channelTpl, function() {
        updatePlaylist(meta);
        checkInputs($channelTpl);
      });
    });
  }
};

var templates = {
  channel: function() {
    return $('.channel:first').parent().clone();
  }
};

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

function selectChannel($e, meta) {
  $('.channel').removeClass('selected');
  if($e) $e.addClass('selected');

  var id = $e.parent().index();
  var emptyId = $('channel[value=""]:first').parent().index();
  if(-1 < emptyId && emptyId < id) id--;

  meta.currentSong = id;
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
  playerState(function(err, state) {
    $('.play, .pause').show();
    $('.' + state).hide();
  });
}

function createPlaylist($tpl, done) {
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

function updatePlaylist(meta) {
  $('.channel').removeClass('selected');
  $('.channel[value!=""]').eq(meta.currentSong).addClass('selected');
}

function nextSong(meta) {
  komponist.playlistid(function(err, data) {
    meta.currentSong++;

    if(meta.currentSong == data.length) meta.currentSong = 0;

    resume(meta.currentSong);
    updateInfo(meta);
    updatePlaylist(meta);
  });
}

function previousSong(meta) {
  komponist.playlistid(function(err, data) {
    meta.currentSong--;

    if(meta.currentSong < 0) meta.currentSong = data.length - 1;

    resume(meta.currentSong);
    updateInfo(meta);
    updatePlaylist(meta);
  });
}

function resume(song) {
  playerState(function(err, state) {
    if(state == 'play') komponist.play(song);
  });
}

function playerState(cb) {
  komponist.status(function(err, data) {
    cb(err, data.state == 'play'? 'play': 'pause');
  });
}

function id(a) {return a;}
