var getSongNumberCell = function(number){
    return $('.song-item-number[data-song-number="' + number + '"]');
}


var createSongRow = function(songNumber, songName, songLength){
  var template =
    '<tr class="album-view-song-item">'
      + '<td class = "song-item-number" data-song-number="' +  songNumber + '">' +  songNumber + '</td>'
      + '<td class="song-item-title">' + songName + '</td>'
      + '<td class="song-item-duration">' + songLength + '</td>'
      + '</tr>'
      ;

      var $row = $(template);

      var clickHandler = function() {
          var songNumber = parseInt($(this).attr('data-song-number'));

          if (currentlyPlayingSongNumber !== null) {
              // Revert to song number for currently playing song because user started playing new song.
              var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);

              currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
              currentlyPlayingCell.html(currentlyPlayingSongNumber);
          }

          if (currentlyPlayingSongNumber !== songNumber) {
              // Switch from Play -> Pause button to indicate new song is playing.
              $(this).html(pauseButtonTemplate);
              setSong(songNumber);
              currentSoundFile.play();
              currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
              updateSeekBarWhileSongPlays();
              updatePlayerBarSong();

              var $volumeFill = $('.volume .fill');
              var $volumeThumb = $('.volume .thumb');
              $volumeFill.width(currentVolume + '%');
              $volumeThumb.css({ left: currentVolume + '%' });

              // $(this).html(pauseButtonTemplate);
              // updatePlayerBarSong();
          } else if (currentlyPlayingSongNumber === songNumber) {
              // Switch from Pause -> Play button to pause currently playing song.
              if (currentSoundFile.isPaused()) {
                  $(this).html(pauseButtonTemplate);
                  $('.main-controls .play-pause').html(playerBarPauseButton);
                  currentSoundFile.play();
                  updateSeekBarWhileSongPlays();
              } else {
                  $(this).html(playButtonTemplate);
                  $('.main-controls .play-pause').html(playerBarPlayButton);
                  currentSoundFile.pause();
              }
          }

      };

      var onHover = function(event) {
        // Placeholder for function logic
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
      };

      var offHover = function(event) {
        // Placeholder for function logic
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }

        // console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
      };

      $row.find('.song-item-number').click(clickHandler);
      // $('.play-pause').click(clickHandler);
      $row.hover(onHover, offHover);

      return $row;
};


var setSong = function(songNumber){
    if (currentSoundFile) {
        currentSoundFile.stop();
    }

    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });

    setVolume(currentVolume);
};


var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};


var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

// var albumTitle = document.getElementsByClassName('album-view-title')[0];
// var albumArtist = document.getElementsByClassName('album-view-artist')[0];
// var albumReleaseInfo = document.getElementsByClassName('album-view-release-info')[0];
// var albumImage = document.getElementsByClassName('album-cover-art')[0];
// var albumSongList = document.getElementsByClassName('album-view-song-list')[0];


var setCurrentAlbum = function(album)  {
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.name);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);


  $albumSongList.empty();


  for(var i=0; i<album.songs.length; i++){
      var $newRow = createSongRow(i+1, album.songs[i].name, album.songs[i].length);
      $albumSongList.append($newRow);
  }
};


var setCurrentTimeInPlayerBar = function(currentTime) {
    var $currentTimeElement = $('.seek-control .current-time');
    $currentTimeElement.text(currentTime);
};


var setTotalTimeInPlayerBar = function(totalTime) {
    var $totalTimeElement = $('.seek-control .total-time');
    $totalTimeElement.text(totalTime);
};


var filterTimeCode = function(timeInSeconds) {
    var seconds = Number.parseFloat(timeInSeconds);
    var wholeSeconds = Math.floor(seconds);
    var minutes = Math.floor(wholeSeconds / 60);

    var remainingSeconds = wholeSeconds % 60;
    var output = minutes + ':';

    if (remainingSeconds < 10) {
        output += '0';
    }

    output += remainingSeconds;
    return output;
};


var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
            var currentTime = this.getTime();
            var songLength = this.getDuration();
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');

            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(filterTimeCode(currentTime));
        });
    }
};


var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;

    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};


var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');

    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;

        if ($(this).parent().attr('class') == 'seek-control') {
          seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
          setVolume(seekBarFillRatio * 100);
        }

        updateSeekPercentage($(this), seekBarFillRatio);
    });

    $seekBars.find('.thumb').mousedown(function(event) {
        var $seekBar = $(this).parent();

        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio);
            }

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });

        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};


var updatePlayerBarSong = function() {

    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);

    $('.main-controls .play-pause').html(playerBarPauseButton);
    setTotalTimeInPlayerBar(filterTimeCode(currentSongFromAlbum.length));
};


var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
}

var nextSong = function() {
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);

    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var previousSong = function() {
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);

    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};


var togglePlayFromPlayerBar = function() {

    var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);

    if (currentSoundFile.isPaused()) {
        $(currentlyPlayingCell).html(pauseButtonTemplate);
        $(this).html(playerBarPauseButton);
        currentSoundFile.play();
        // updateSeekBarWhileSongPlays();
    }

    else {
        $(currentlyPlayingCell).html(playButtonTemplate);
        $(this).html(playerBarPlayButton);
        currentSoundFile.pause();
    }
};

// Album Button Templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate= '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>'
var playerBarPauseButton = '<span class="ion-pause"></span>'
// Store state of playing songs

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;


var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playerBarPlayToggle = $('.main-controls .play-pause');


$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  $playerBarPlayToggle.click(togglePlayFromPlayerBar);

  // for (var i = 0; i < songRows.length; i++) {
  //     songRows[i].addEventListener('click', function(event) {
  //            clickHandler(event.target);
  //     });
  // }
  // var albums = [albumPicasso, albumMarconi, albumAnjunaBeats];
  // var index = 1;
  // albumImage.addEventListener("click", function(event){
  //   setCurrentAlbum(albums[index]);
  //   index++;
  //   if(index == albums.length){
  //     index = 0;
  //   }
  // });
});
