 var urlChunks = window.location.pathname;
 var room;

 if (urlChunks.substring(urlChunks.length-1) === "/") {
    room = urlChunks.substring(1, urlChunks.length-1).toUpperCase();
 } else {
    room = urlChunks.substring(1, urlChunks.length).toUpperCase();
 }

var db = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase());
var db_queue = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase() + '/queue');
var db_history = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase() + '/history');
var db_chat = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase() + '/chat');

 $(".tapRoom").text("#"+room);
 $("title").text("#"+room);


// for (var i =0; i < 6; i++) {
//   if ((i % 2) == 0) {
//       db_queue.push('wQOHUPTOtik');
//   } else {
//       db_queue.push('mSoPJevJyeE');
//   }
  
// }

// db.set(videos);


var player;

function onYouTubePlayerAPIReady() {
    player = new YT.Player('mainVideo', {
      height: '420',
      width: '640',
      playerVars: {
            controls: 0
      },


      events: {
        'onReady': onPlayerReady,
        'onStateChange': function (event) {    

            // WHEN VIDEO ENDS -- THIS IS WHAT YOU SHOULD
            if (event.data === 0) {
           
              db_history.push(extractParameters(player.getVideoUrl())['v']);
              db_queue.once('value', function (snapshot) {
                if (snapshot.val() == null) {
              
                  db_history.once('value', function (s) {
                    db_queue.set(s.val());
                    db_history.remove();
                  });
                }

                var count = [];
                snapshot.forEach(function (dataSnap) {
                  count.push(dataSnap.key());
                });

                var tmp = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase() + '/queue/' + count[0]);

                tmp.remove();


                db_queue.limitToFirst(1).once('value', function (snapshot) {

                  for (var keys in snapshot.val()) {

                      


                      player.loadVideoById(snapshot.val()[keys], 0, "large");
                      event.target.playVideo();

                      updateVideoInfo(snapshot.val()[keys]);

                  }
                });
                
              });
  
            }
        }
      }
    });
}  

function onPlayerReady(event) {
    // var startVid = getFirstObjectInQueue('val');
    db_queue.limitToFirst(1).once('value', function (snapshot) {
      if (snapshot.val() == null) {
          db_history.once('value', function (s) {
            db_queue.set(s.val());
            db_history.remove();

            for (var keys in snapshot.val()) {
                if (snapshot.val() == null) {
                  db_history.once('value', function (s) {
                    db_queue.set(s.val());
                    db_history.remove();
                  });
                }

                player.loadVideoById(snapshot.val()[keys], 0, "large");
                event.target.playVideo();
                updateVideoInfo(snapshot.val()[keys]);


            }

          });
        }

      for (var keys in snapshot.val()) {
          if (snapshot.val() == null) {
            db_history.once('value', function (s) {
              db_queue.set(s.val());
              db_history.remove();
            });
          }

          player.loadVideoById(snapshot.val()[keys], 0, "large");
          event.target.playVideo();
          updateVideoInfo(snapshot.val()[keys]);


      }
    });

    


    
    
}



function extractParameters(url)
{
  var query = url.match(/.*\?(.*)/)[1];
  var assignments = query.split("&");
  var pair, parameters = {};
  for (var ii = 0; ii < assignments.length; ii++)
  { 
      pair = assignments[ii].split("=");
      parameters[pair[0]] = pair[1];
  }
  return parameters;
}


function getFirstObjectInQueue(typeVal) {
  // var keys0 = "yo";

  if (typeVal =='key') {
    
    db_queue.once('value', function (snapshot) {
      for (var keys in snapshot.val()) {
          console.log(keys);

          return keys;
      }
    });

  } else if (typeVal == 'val') {
    
    db_queue.limitToFirst(1).once('value', function (snapshot) {
      for (var keys in snapshot.val()) {
       
          return snapshot.val()[keys];
      }
    });

  }
  
} 

function updateVideoInfo(id) {
  $.getJSON('http://gdata.youtube.com/feeds/api/videos/'+id+'?v=2&alt=jsonc', function (data) {
    $("#songName").text(data.data.title);
    $("#views").text(numeral(data.data.viewCount).format('0,0') + " Views");
    $.get('https://gdata.youtube.com/feeds/api/users/'+data.data.uploader+'?v=2.1', function (xmlData) {
        // alert(data);
        $xml = $(xmlData),
        $title = $xml.find("title");
        $("#artistName").text($title.text());

    });
  });
}




