$(function() {
  var meta = {
    currentSong: 0
  };

  initialize(components, meta);
});

function initialize(components, meta) {
  for(var name in components) components[name].init(meta);
}

var components = {
  footer: {
    init: function() {
      $('.footer').on('click', function() {
        var $opts = $('.options').toggleClass('visible');

        $opts.animate({
          'max-height': $opts.hasClass('visible')? '1000px': 0
        });
      });
    }
  },
  forward: {
    init: function(meta) {
      $('.forward').on('click', function() {
        playlist.next(meta, function() {
          components.info.update(meta);
          components.channels.update(meta);
        });
      });
    }
  },
  backward: {
    init: function(meta) {
      $('.backward').on('click', function() {
        playlist.previous(meta, function() {
          components.info.update(meta);
          components.channels.update(meta);
        });
      });
    }
  },
  playPause: {
    init: function() {
      $('.play, .pause').on('click', function() {
        $('.play, .pause').toggle();
        playlist.toggle();
      });
    },
    update: function() {
      playlist.state(function(err, state) {
        $('.play, .pause').show();
        $('.' + state).hide();
      });
    }
  },
  channels: {
    init: function(meta) {
      var $tpl = templates.channel();

      $(document).on('click', '.channel', function() {
        var $e = $(this);

        if(components.channels.select($e, meta)) {
          playlist.resume(meta.currentSong);
        }
      }).on('keyup', function() {
        var $e = $(this);

        components.channels.check($tpl, $e);
        components.channels.select($e, meta);
      });
    },
    check: function($tpl, $e) {
      var empties = $('.channel').filter(function(i, e) {
        return $(e).val().trim().length === 0;
      });

      if(!empties.length) {
        $('.channels').append($tpl.clone());
      }
      if(empties.length > 1) {
        empties.not($e).remove();
      }
    },
    select: function($e, meta) {
      if(!$e.val().trim()) return;

      $('.channel').removeClass('selected');
      if($e) $e.addClass('selected');

      var id = $e.parent().index();
      var emptyId = $('channel[value=""]:first').parent().index();
      if(-1 < emptyId && emptyId < id) id--;

      meta.currentSong = id;

      return true;
    },
    update: function(meta) {
      $('.channel').removeClass('selected');
      $('.channel[value!=""]').eq(meta.currentSong).addClass('selected');
    }
  },
  song: {
    init: noop,
    update: function(meta) {
      komponist.currentsong(function(err, data) {
        meta.currentSong = parseInt(data.Pos, 10);

        components.info.update(meta);
      });
    }
  },
  edit: {
    init: function() {
      $(document).on('click', '.channels .edit', function(i, e) {
        var $e = $(this);
        var $ch = $e.siblings('.channel:first');
        var name = $ch.data('name');
        var url = $ch.data('url');

        if($ch.prop('readonly')) {
          $ch.val(url).prop('readonly', false);
        }
        else {
          $ch.data('url', $ch.val()).val(name).prop('readonly', true);
          // TODO: update playlist item now
        }
      });
    }
  },
  info: {
    init: noop,
    update: function(meta) {
      komponist.playlistid(function(err, data) {
        var d = data[meta.currentSong];
        var info = [d.Name, d.Title].filter(id).join(' - ');

        $('.info').text(info);
      });
    }
  },
  komponist: {
    init: function(meta) {
      var $tpl = templates.channel();

      komponist.on('changed', function(system) {
        if(system !== 'player') return;

        components.song.update(meta);
      });
      komponist.once('ready', function() {
        components.song.update(meta);
        components.playPause.update();

        playlist.get(function(err, data) {
          var $c = $('.channels');

          $c.empty();

          $.each(data, function(i, v) {
            var $e = $tpl.clone();

            $('.channel', $e).val(v.Name).data({name: v.Name, url: v.file});

            $c.append($e);
          });

          components.channels.update(meta);
          components.channels.check($tpl);
        });
      });
    }
  }
};

var templates = {
  channel: function() {
    return $('.channel:first').parent().clone();
  }
};

var playlist = {
  get: function(done) {
    komponist.playlistinfo(done);
  },
  next: function(meta, done) {
    komponist.playlistid(function(err, data) {
      meta.currentSong++;

      if(meta.currentSong == data.length) meta.currentSong = 0;

      playlist.resume(meta.currentSong);
      done();
    });
  },
  previous: function(meta, done) {
    komponist.playlistid(function(err, data) {
      meta.currentSong--;

      if(meta.currentSong < 0) meta.currentSong = data.length - 1;

      playlist.resume(meta.currentSong);
      done();
    });
  },
  toggle: function(song) {
    playlist.state(function(err, state) {
      if(state == 'play') komponist.stop();
      else komponist.play();
    });
  },
  resume: function(song) {
    playlist.state(function(err, state) {
      if(state == 'play') komponist.play(song);
    });
  },
  state: function(cb) {
    komponist.status(function(err, data) {
      cb(err, data.state == 'play'? 'play': 'pause');
    });
  }
};

function id(a) {return a;}
function noop() {}
