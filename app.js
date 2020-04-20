var dir = "./data/";
var faudio = "";
var fnotes = "";

//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia()
var rec;
//Recorder.js object
var input;
//MediaStreamAudioSourceNode we'll be recording
// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext;
//new audio context to help us record
var startbtn = document.getElementById("startbtn");
var stopbtn = document.getElementById("stopbtn");
var savebtn = document.getElementById("savebtn");

// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia */
function startTone(){
	audio = new Audio(audiofile);
	audio.play();
}

function stopTone() {
	audio.pause();
}

function startRecording() {
	var start_time = new Date();
	var timestamp = start_time.getFullYear() + "_" + start_time.getMonth() + "_" + start_time.getDate() + "_" + start_time.getHours() + "_" + start_time.getMinutes() + "_" + start_time.getSeconds();

	startTone();
	startbtn.disabled = true; stopbtn.disabled = false; savebtn.disabled = true;

	console.log("start button clicked");

	/*
	Simple constraints object, for more advanced audio features see
	https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
	var constraints = { audio: true, video:false }

	/*
	We're using the standard promise based getUserMedia()
	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
		/*
		create an audio context after getUserMedia is called
		sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
		the sampleRate defaults to the one set in your OS for your playback device
		*/
		audioContext = new AudioContext();

		//  assign to gumStream for later use
		gumStream = stream;

		// use the stream
		input = audioContext.createMediaStreamSource(stream);

		//Create the Recorder object and configure to record mono sound (1 channel)
		rec = new Recorder(input,{numChannels:1})
		//start the recording process
		rec.record()
		console.log("Recording started");
	}).catch(function(err) {
		console.log(err);
	});
}

function stopRecording() {
	startbtn.disabled = false; stopbtn.disabled = true; savebtn.disabled = false;

	console.log("stopButton clicked")
	//tell the recorder to stop the recording
	rec.stop(); //stop microphone access
	stopTone();

	gumStream.getAudioTracks()[0].stop();
	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(savePressListener);
}

function savePressListener(blob) {
	savebtn.audioBlob = blob; //slicing off the WAV file header
}

function saveRecording() {
	startbtn.disabled = false; stopbtn.disabled = true; savebtn.disabled = true;

	var blob = savebtn.audioBlob;

	var reader = new FileReader();
	reader.readAsArrayBuffer(blob);
	reader.addEventListener("loadend", processBlob);

	//console.log("app.js audio " + text);

	send_audio(dir+fname, blob);

	// if (document.getElementById("googlepixel").checked) model = "Google Pixel";
	//
	// var notes = {
	// 	patient: document.getElementById('person').value,
	// 	exerciseName: exercise,
	// 	repetitions: document.getElementById('repetitions').value,
	// 	phoneLocation: phoneLoc,
	// 	phoneModel: model,
	// 	location: document.getElementById('location').value,
	// 	comments: document.getElementById('comments').value
	// };
	//
	// file_write(dir+fnotes, JSON.stringify(notes));
}

function processBlob() {
	var buffer = this.result;
	var view = new DataView(buffer);
	var samples = [];
	for (var i=0; i<view.byteLength-1; i+=2){
		try {
			samples.push(view.getInt16(i, true));
			//console.log(i + " => " + view.getInt16(i, true));
		} catch (error) {
			console.error("i = " +  i);
			console.error("view byte length = " + view.byteLength);
		}
	}
}
