
carrier_freq = 10000;


(function(window, document, undefined) {
  function gotStream(stream) {
    if (typeof AudioContext !== "undefined") {
      context = new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
      context = new webkitAudioContext();
    } else if (typeof mozAudioContext !== "undefined") {
      context = new mozAudioContext();
  } else {
  }

    streamSource = context.createMediaStreamSource(stream);

    var waterfall = Waterfall({
      stream: streamSource,
      context: context
    });

    window.waterfall = waterfall;
    document.getElementById('tonetest').addEventListener("click", function(){
      seq = [[carrier_freq, 1000000]];
      waterfall.sequence(seq);
    });

    document.getElementById('tonetest_stop').addEventListener("click", function(){
      waterfall.stop();
    });

  }

  function handleError(err) {
    console.log("An error occurred: " + err);
  }

  navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  navigator.getMedia({ audio: true }, gotStream, handleError);
}(window, document));
