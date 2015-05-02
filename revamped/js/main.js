/* 
  (c) 2015 Gautam Mittal
  
*/

 var urlChunks = window.location.pathname;
 var room;

 $("#buttonInputText").hide();

 if (urlChunks.substring(urlChunks.length-1) === "/") {
    room = decodeURI(urlChunks.substring(1, urlChunks.length-1).toUpperCase());
 } else {
    room = decodeURI(urlChunks.substring(1, urlChunks.length).toUpperCase());
 }

var db = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase());
var db_queue = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase() + '/queue');
var db_history = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase() + '/history');
var db_chat = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase() + '/chat');
var db_pause = new Firebase('https://youparty.firebaseio.com/' + room.toUpperCase() + '/paused');
var db_time = new Firebase('https://youparty.firebaseio.com/'+ room.toUpperCase() + '/time');
var db_numUsers = new Firebase('https://youparty.firebaseio.com/'+ room.toUpperCase() + '/connections');

 $(".tapRoom").text("#"+room);
 $("title").text("#"+room);


// for (var i =0; i < 10; i++) {
//   if ((i % 2) == 0) {
//       db_queue.push({'.value':'3Rqcg7BJwJM', '.priority': i});
//   } else {
//       db_queue.push({'.value':'9bZkp7q19f0', '.priority': i});
//   }
  
// }


// Extra code to remove any HTML or JavaScript a user might try to embed within their chat messages
function strip(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}


function stripScripts(s) {
  var div = document.createElement('div');
  div.innerHTML = s;
  var scripts = div.getElementsByTagName('script');
  var i = scripts.length;
  while (i--) {
    scripts[i].parentNode.removeChild(scripts[i]);
  }
  return div.innerHTML;
}


function isHTML(str) {
    var a = document.createElement('div');
    a.innerHTML = str;
    for (var c = a.childNodes, i = c.length; i--; ) {
        if (c[i].nodeType == 1) return true; 
    }
    return false;
}



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
              // console.log("Video ended");

              // if (user_id == 1) {
                // console.log("YAY");
                db_history.push({'.value':extractParameters(player.getVideoUrl())['v'], '.priority':null});  
              // }
              

              db_queue.once('value', function (snapshot) {
                if (snapshot.val() == null) {

                  player.stopVideo();
                  // player.clearVideo();
                } else {
                    

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

                } // END IF ELSE STATEMENT

                



                
              });
  
            } else if (event.data === 1) { // IF VIDEO IS PLAYING
              db_pause.set('playing');
              document.getElementById("pausePlay").src = "img/pause-icon.png";



            } else if (event.data === 2) { // IF VIDEO IS PAUSED
              db_pause.set('paused');
              document.getElementById("pausePlay").src = "img/play-icon.png";

            } // END VIDEO PAUSED/PLAYING CONDITIONAL
        }
      }
    });
}  

function onPlayerReady(event) {
    // var startVid = getFirstObjectInQueue('val');
    db_pause.set('playing');

    db_queue.limitToFirst(1).once('value', function (snapshot) {


      for (var keys in snapshot.val()) {

        db_time.once('value', function (sTimeVal) {
          player.loadVideoById(snapshot.val()[keys], sTimeVal.val(), "large");
          event.target.playVideo();
          updateVideoInfo(snapshot.val()[keys]);

        });
          
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

              // db_queue.once('value', function (sCHECKS) {
              //   if (sCHECKS.val() != null) {
                    
              //   } 
                
              // });



          }); // END REMOVE


          
        });

    } else {
      player.stopVideo();
      // player.clearVideo();
      displayQueue();
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
                console.log("YOOOOOOO I JUST SET SOMETHING'S TO PRIORITY 1");
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

        document.getElementById("songTile").src = "http://i.ytimg.com/vi/"+ id +"/hqdefault.jpg";

    });
  });
}



// var htmlD = " ";
// You need synchronous ajax calls for this to work.... unforunately, I don't think it
function displayQueue() {
  var htmlD = " ";
  // $("#queueArea").html("");
  db_queue.once('value', function (snapData) {
    snapData.forEach(function (dataSnapVids) {

      $.ajax({
          type: "GET",
          url: 'http://gdata.youtube.com/feeds/api/videos/'+dataSnapVids.val()+'?v=2&alt=jsonc',
          async: false,
          success : function(data) {
              var songTitle = data.data.title;
              var views = numeral(data.data.viewCount).format('0,0') + " views";
              htmlD += '<div class="queueCard"><b>'+songTitle+'</b><br />'+views+'<br/></div>';

              $("#queueArea").html(htmlD);
          }
      });


    });

  });
}

/* EXPERIMENTAL QUEUE */

// var queuePriorities = [];
// db_queue.on('child_added', function (snapData) {
//   // alert(snapData.getPriority());
  

//   $.getJSON('http://gdata.youtube.com/feeds/api/videos/'+snapData.val()+'?v=2&alt=jsonc', function (data) {
  
//       var songTitle = data.data.title;
//       var views = numeral(data.data.viewCount).format('0,0') + " views";
//       $.get('https://gdata.youtube.com/feeds/api/users/'+data.data.uploader+'?v=2.1', function (xmlData) {
      
//           $xml = $(xmlData),
//           $title = $xml.find("title");
      
//           var artist = $title.text()
//           if (snapData.getPriority() < queuePriorities[0]) {
//             $("#queueArea").prepend('<div class="queueCard"><b>'+songTitle+'</b><br />'+views+'<br/></div>');

//           } else {
//             $("#queueArea").append('<div class="queueCard"><b>'+songTitle+'</b><br />'+views+'<br/></div>');

//           }
          



//           queuePriorities.push(snapData.getPriority());
//       });
//     });
  
// });

// db_queue.on('child_removed', function() {

//   var card = document.getElementsByClassName("queueCard")[0];
//   card.parentNode.removeChild(card);
//   // document.removeChild(document.querySelector("#"))
// });









// SYNC VIDEO ACROSS CLIENTS -- THIS IS LITERALLY THE COOLEST PART
db_queue.limitToFirst(1).on('value', function (snapshot) {
      // displayQueue();

      for (var keys in snapshot.val()) {

          player.loadVideoById(snapshot.val()[keys], 0, "large");
          event.target.playVideo();

          updateVideoInfo(snapshot.val()[keys]);

      }
 

});


db_queue.on('value', function() {
  displayQueue();
});


var chat_name;
// ALL CHAT FUNCTION ARE HERE
$("#chatBoxInput").focus(function() {
  $("#chatBoxInput").keydown(function (evt) {
      if (evt.which == 13) {
        var chat_text = document.getElementById("chatBoxInput").value;
        document.getElementById("chatBoxInput").value = "";

        if (isHTML(chat_text)) {
          chat_text = jQuery(stripScripts(chat_text)).text();
        }

        // console.log(chat_text.substring(0, 5));
        


        if (chat_text.length > 0) {
          // db_chat.push(chat_text);
          // commands
          if (chat_text.substring(0, 5) == "/name") {
            chat_name = chat_text.substring(6, chat_text.length);
          } else if (typeof chat_name !== "undefined" && /\S/.test(chat_name)) {
            db_chat.push("<b class=\"chat_id_name\">"+chat_name+": </b>" + chat_text + "<br />");
          } else {
            db_chat.push("<b class=\"chat_id_name\">A"+user_id+": </b>" + chat_text + "<br />");
          }
          
          // db_chat.push("<b>A"+user_id+": </b>" + chat_text + "<br />");
        
        }

        return false;
        
      }

  });
});



db_chat.limitToLast(500).on('child_added', function (s_chat) {
  
  $("#chaatArea").append(s_chat.val());
  $("#chaatArea").scrollTop($("#chaatArea")[0].scrollHeight);
});




// ADDING VIDEOS TO QUEUE
$("#addVideo").click(function() {
  $("#buttonAddText").hide();
  $("#buttonInputText").show();
  // window.location = "#modal";



});

$("#buttonInputText").focus(function() {
  $("#buttonInputText").keydown(function (evt) {
    if (evt.which == 13) {
      
      pushVideoToQueue(extractParameters(document.getElementById("buttonInputText").value)["v"]);
      document.getElementById("buttonInputText").value = "";
      $("#buttonAddText").show();
      $("#buttonInputText").hide();
      // $("#buttonInputText").blur();

      return false;
    }
  });
});

function pushVideoToQueue(id) {
  console.log(id);
  db_queue.limitToLast(1).once('value', function (sVals) {

    db_queue.push({'.value': id, '.priority': sVals.getPriority() + 1});
  });

}

// REGULATE PAUSING/PLAYING ACROSS CLIENTS
db_pause.on('value', function (sPause) {
  if (sPause.val() == "playing") {
    player.playVideo();
  } else if (sPause.val() == "paused") {
    player.pauseVideo();
  }

});

$("#pausePlay").click(function() {
  if (player.getPlayerState() == 1) { // video is currently playing
    player.pauseVideo();
  } else {
    player.playVideo();
  }
});


// FIND OUT NUM_USERS
var num_users = 0;


// var amOnline = new Firebase('https://<demo>.firebaseio.com/.info/connected');

var user_id;
var user_key = db_numUsers.push().key();

var userRef = new Firebase('https://youparty.firebaseio.com/'+ room.toUpperCase() + '/connections/' + user_key);
db_numUsers.on('value', function(snapshot) {

    userRef.onDisconnect().set('offline');
    userRef.set('online');
  
});
    

db_numUsers.on('value', function (sNum) {
  num_users = 0;
  var htmlData = " ";
  sNum.forEach(function (sNumData) {
    if (sNumData.val() == "online") {
      var rand_char = Math.floor(Math.random() * 5) + 1;

      var areaW = $(".partyGoers").width();
      var areaH = $(".partyGoers").height();

      var x = Math.floor(Math.random() * areaW) + 0;
      var y = Math.floor(Math.random() * 20) + 10;

      var cssStr = "style='margin-top: "+y+"px; margin-left:"+x+"px;'";

      var htmlStr = " ";
      if (rand_char == 1) {
        htmlStr = '<img src="../img/joe.png" ' + cssStr + ' />';
      } else if (rand_char == 2) { 
        htmlStr = '<img src="../img/fred.png" ' + cssStr + ' />';

      } else if (rand_char == 3) {
        htmlStr = '<img src="../img/bob.png" ' + cssStr + ' />';

      } else if (rand_char == 4) {
        htmlStr = '<img src="../img/klik.png" ' + cssStr + ' />';

      } else if (rand_char == 5) {
        htmlStr = '<img src="../img/klak.png" ' + cssStr + ' />';

      }
      
      htmlData += htmlStr;
      // $(".partyGoers").html(htmlData); // uncomment to add little dudes each time somebody connects
      num_users++;

      if (sNumData.key() == user_key) {
        user_id = num_users;
      }

    }
    
  });
  
  if (num_users == 1) {
    $(".numUsers").text(num_users + ' watcher');
  } else {
    $(".numUsers").text(num_users + ' watchers'); 
  }
  
});


// MAKE THE LITTLE DUDES JUMP
function jump() {
  $( ".partyGoers img" ).each(function( index ) {
    // console.log( index + ": " + $( this ).text() );
    $(this).animate({
      // opacity: 0.25,
      top: "-=3"
    }, 100, function() {
      // Animation complete.
      $(this).animate({
        // opacity: 0.25,
        top: "+=3"
      }, 100);
    });

    // jump();


  });


}


setInterval(jump, 1200);



setInterval(function() {
  updateVideoInfo(extractParameters(player.getVideoUrl())['v']);
  if (user_id == 1) {
    db_time.set(Math.round(player.getCurrentTime()*100)/100);
  }

  
 

}, 750);
 




// Emojis :)
setInterval(function() {
  emojify.run(document.getElementById('chatBox')); // Emojis :)
}, 100);





  

