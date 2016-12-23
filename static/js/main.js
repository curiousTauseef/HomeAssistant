// ------------------------------------------------
//  				  Speech
// ------------------------------------------------

// Let Alfred know whether he's speaking
var setTalkingStatus = function(value) {
	var url = $SCRIPT_ROOT + "/_talking";
	$.getJSON(url, {
		"talking": value,
	}, function(data) {
		console.log("Talking was set to: " + value)
	});
}

function voiceStartCallback() {
	updateStatus("talking");
	setTalkingStatus(1);
}
 
function voiceEndCallback() {
	updateStatus("inactivated");
	setTalkingStatus(0);
}

var speech_parameters = {
	onend: voiceEndCallback
}

var speak = function(new_message){
	console.log("New speech: " + new_message);
	voiceStartCallback();
	responsiveVoice.speak(new_message, "UK English Male", speech_parameters);
}

// ------------------------------------------------
//  				Visuals
// ------------------------------------------------

var updateAlarms = function(alarms){
	$("#alarms").empty();
	var i;
	for(i = 0; i < alarms.length; i++){
		var alarm = alarms[i];
		console.log("Alarm: " + alarm.date + " " + alarm.time);
		$("#alarms").append("<p class='alarm'>" + alarm.date + " " + alarm.time + "</p>");
	}
}

var updateUserMessage = function(new_message){
	console.log("User message: " + new_message);
	$("#user_message").text(new_message);
}

var updateAIMessage = function(new_message){
	console.log("AI message: " + new_message);
	$("#ai_message").text(new_message);
}

var updateStatus = function(status){
	src = ""
	$('.loader').css({'display': 'none'});
	if(status == "talking"){
		var src = $SCRIPT_ROOT + "/static/images/speakers.png";
		$('#recordButton img').css({'animation': 'none'});
		$('#recordButton').css({'cursor': 'default'});
		$('#recordButton').prop('disabled', true);
	}
	else if(status == "thinking"){
		$('#recordButton img').css({'animation': '2s rotate360 infinite linear'});
		var src = $SCRIPT_ROOT + "/static/images/settings.png";
		$('#recordButton').css({'cursor': 'default'});
	}
	else if(status == "listening"){
		var src = $SCRIPT_ROOT + "/static/images/microphone-1.png";
	}
	else{
		var src = $SCRIPT_ROOT + "/static/images/microphone.png";
		$('#recordButton').prop('disabled', false);
		$('#recordButton').css({'cursor': 'pointer'});
	}

	$("#status").attr("src", src);

	console.log("Status: " + status);
}

// -------------
// Google STT 
// -------------
var recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.interimResults = true;

var record = function() {
	updateStatus("listening");
	final_transcript = ""
	interim_transcript = ""
	recognition.onresult = function(event) { 
		var interim_transcript = '';
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			console.log(event.results[i]);
			if (event.results[i].isFinal) {
				final_transcript = event.results[i][0].transcript;
				updateUserMessage(final_transcript);
				updateStatus("thinking");
				var url = $SCRIPT_ROOT + "/_handle_text";
				$.getJSON(url, {
			        text: final_transcript,
			      }, function(data) {
			      	console.log("Response: " + data.ai_message);
			      	if(data.ai_message == " - ") return;
			      	updateAIMessage(data.ai_message);
			      	speak(data.ai_message);
			        final_transcript = "";
			      });
			} else {
				interim_transcript += event.results[i][0].transcript;
				updateUserMessage(interim_transcript);
			}
		}
	}
	recognition.start();
}

console.log("Loaded main.js");

