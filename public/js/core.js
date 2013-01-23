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
    init: function(meta) {
      $('.play, .pause').on('click', function() {
        $('.play, .pause').toggle();
        playlist.toggle(meta.currentSong);
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

      $(document).on('click change', '.channel', function() {
        var $e = $(this);

        if(!$e.hasClass('edited')) components.channels.select($e, meta);
        else {
          url = $e.val();

          if(url.trim().length > 0) {
            console.log($e.index(), $('.channel').length);
            if($e.index() + 1 == $('.channel').length) {
              playlist.add(url, function() {
                components.channels.add();

                playlist.stats(meta.currentSong, function(err, data) {
                  console.log(data);
                  $e.data({name: data.Name, url: url});
                });
                playlist.resume(meta.currentSong);
              });
            }
            else {
              playlist.update(meta.currentSong, url, function() {
                playlist.resume(meta.currentSong);
              });
            }
          }
          else {
            $e.remove();
            playlist.del(meta.currentSong);
          }
        }
      });
    },
    populate: function(meta) {
      playlist.get(function(err, data) {
        console.log('populate', data);
        $('.channels').empty();

        $.each(data, function(i, v) {
          components.channels.add(v.Name, v.file);
        });

        components.channels.add();

        components.channels.update(meta);
      });
    },
    add: function(name, url) {
      var $e = templates.channel();
      $('.channel', $e).val(name).data({name: name, url: url});

      $('.channels').append($e);
    },
    select: function($e, meta) {
      if(!$e.val().trim()) return;

      $('.channel').removeClass('selected');
      if($e) $e.addClass('selected');

      var id = $e.parent().index();
      var emptyId = $('channel[value=""]:first').parent().index();
      if(-1 < emptyId && emptyId < id) id--;

      meta.currentSong = id;

      playlist.resume(meta.currentSong);
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
          $ch.val(url).prop('readonly', false).addClass('edited');
        }
        else {
          $ch.val(name).prop('readonly', true).trigger('change').removeClass('edited');
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
      komponist.on('changed', function(system) {
        if(system !== 'player') return;

        components.song.update(meta);
      });
      komponist.once('ready', function() {
        components.song.update(meta);
        components.playPause.update();
        components.channels.populate(meta);
      });
    }
  }
};

var templates = {
  channel: function() {
    return $('<li>' +
        '<input type="text" class="channel" readonly="readonly" />' +
        '<i class="icon icon-edit edit"></i>' +
      '</li>'
    );
  }
};

var playlist = {
  get: function(done) {
    komponist.playlistinfo(function(err, data) {
      parallel(function(d, cb) {
        playlist.stats(d.Pos, cb);
      }, data, function(err, data) {
        done(err, data.sort(function(a, b) {
          return parseInt(a.Pos, 10) > parseInt(b.Pos, 10);
        }));
      });
    });
  },
  next: function(meta, done) {
    playlist.length(function(err, len) {
      meta.currentSong++;

      if(meta.currentSong == len) meta.currentSong = 0;

      playlist.resume(meta.currentSong);
      done();
    });
  },
  length: function(done) {
    komponist.playlistid(function(err, data) {
      done(err, data.length);
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
      if(state == 'play') playlist.stop();
      else playlist.play(song);
    });
  },
  resume: function(song, done) {
    playlist.state(function(err, state) {
      if(state == 'play') playlist.play(song, done);
    });
  },
  play: function(song) {
    komponist.play(song);
  },
  stop: function() {
    komponist.stop();
  },
  state: function(done) {
    komponist.status(function(err, data) {
      done(err, data.state == 'play'? 'play': 'pause');
    });
  },
  add: function(url, done) {
    komponist.add(url, done);
  },
  update: function(song, url, done) {
    // TODO
    console.log('update playlist song');
    done();
  },
  del: function(song, done) {
    komponist['delete'](song, done);
  },
  stats: function(song, done) {
    komponist.playlistid(function(err, data) {
      var s = data[song];

      $.getJSON('/channel_meta?url=' + s.file, function(data) {
        s.Name = data['icy-name'];
        s.Genre = data['icy-genre'];
        s.Bitrate = data['icy-br'];

        done(err, s);
      }, function(jqXHR, textStatus, errorThrown) {
        alert('error ' + textStatus + " " + errorThrown);
     });
   });
  }
};

function parallel(operation, data, done) {
  var accumData = [];

  for(var i = 0, len = data.length; i < len; i++) {
    operation(data[i], accumulate);
  }

  function accumulate(err, d) {
    if(err) return done(err);

    accumData.push(d);

    if(accumData.length == len) done(null, accumData);
  }
}

function id(a) {return a;}
function noop() {}
