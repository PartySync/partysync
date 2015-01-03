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


// for (var i =0; i < 10; i++) {
//   if ((i % 2) == 0) {
//       db_queue.push({'.value':'3Rqcg7BJwJM', '.priority': i});
//   } else {
//       db_queue.push({'.value':'mSoPJevJyeE', '.priority': i});
//   }
  
// }


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
       

                var count = [];
                snapshot.forEach(function (dataSnap) {
                  count.push(dataSnap.key());
                });

                var tmp = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase() + '/queue/' + count[0]);

                tmp.remove(function () {
                    db_queue.limitToFirst(1).once('value', function (snapshot) {

                      for (var keys in snapshot.val()) {

                          player.loadVideoById(snapshot.val()[keys], 0, "large");
                          event.target.playVideo();

                          updateVideoInfo(snapshot.val()[keys]);

                      }
                    });

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


      for (var keys in snapshot.val()) {

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




function skip() {
  db_queue.once('value', function (s2) {
    if (s2.val() != null) {
        db_history.push(extractParameters(player.getVideoUrl())['v']);
        db_queue.once('value', function (snapshot) {


          var count = [];
          snapshot.forEach(function (dataSnap) {
            count.push(dataSnap.key());
          });

          var tmp = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase() + '/queue/' + count[0]);

          tmp.remove(function () {

              db_queue.limitToFirst(1).once('value', function (snapshot) {

                for (var keys in snapshot.val()) {

                    player.loadVideoById(snapshot.val()[keys], 0, "large");
                    event.target.playVideo();

                    updateVideoInfo(snapshot.val()[keys]);

                }
              });

          });


          
        });

    }
  });
  


}


function rewind_back() {
  db_history.limitToLast(1).once('value', function (snapshotData) {
    // console.log(snapshotData.val());
    for (var keyVals in snapshotData.val()) {
          var tmp_hist = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase() + '/history/' + keyVals);
          console.log(tmp_hist.key());

          console.log(snapshotData.val()[keyVals]);

          // prepend the object
          db_queue.limitToFirst(1).once('value', function (snap) { 
            // alert("YO");
            if (snap.val() !== null) {
              snap.forEach(function (s) { 

                console.log(s.getPriority());
               
                db_queue.push({'.value': snapshotData.val()[keyVals], '.priority': s.getPriority()-1});

              });

            } else {
                db_queue.push({'.value': snapshotData.val()[keyVals], '.priority': 1});

            }

          });

          

          tmp_hist.remove(function () {
            db_queue.limitToFirst(1).once('value', function (s1) {
            // console.log(s1.val());
              for (var keys in s1.val()) {

                  player.loadVideoById(s1.val()[keys], 0, "large");
                  event.target.playVideo();

                  updateVideoInfo(extractParameters(player.getVideoUrl())['v']);

              }
            });
          });

          


    } // end for loop

    

  });

}

$("#back").click(function() {
  rewind_back();
});

$("#skip").click(function() {
  skip();
});


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

// You need synchronous ajax calls for this to work.... unforunately, I don't think it
function displayQueue() {
  $("#queueArea").html("");
  db_queue.once('value', function (snapData) {
    for (var k in snapData.val()) {
      console.log(snapData.val()[k]);

      


    }



  });
}



var queuePriorities = [];
db_queue.on('child_added', function (snapData) {
  // alert(snapData.getPriority());
  

  $.getJSON('http://gdata.youtube.com/feeds/api/videos/'+snapData.val()+'?v=2&alt=jsonc', function (data) {
  
      var songTitle = data.data.title;
      var views = numeral(data.data.viewCount).format('0,0') + " views";
      $.get('https://gdata.youtube.com/feeds/api/users/'+data.data.uploader+'?v=2.1', function (xmlData) {
      
          $xml = $(xmlData),
          $title = $xml.find("title");
      
          var artist = $title.text()
          if (snapData.getPriority() < queuePriorities[0]) {
            $("#queueArea").prepend('<div class="queueCard"><b>'+songTitle+'</b><br />'+views+'<br/></div>');

          } else {
            $("#queueArea").append('<div class="queueCard"><b>'+songTitle+'</b><br />'+views+'<br/></div>');

          }
          



          queuePriorities.push(snapData.getPriority());
      });
    });
  
});

db_queue.on('child_removed', function() {

  var card = document.getElementsByClassName("queueCard")[0];
  card.parentNode.removeChild(card);
  // document.removeChild(document.querySelector("#"))
});



setInterval(function() {
  updateVideoInfo(extractParameters(player.getVideoUrl())['v']);
  // displayQueue();
}, 750);
