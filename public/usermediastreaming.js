var conferenceNameInput,
	createNewConferenceButton,
	extensionInstalled = false,
	iceServers = [],
	socket,
	eventsHandler = {
		openSocket : function (jsonConfigurationObject) {
			console.log('Opening socket ' + jsonConfigurationObject);
		},
	},
	defaultSocket = {},
	peerConfig = {
		attachStream : eventsHandler.attachStream,
		onICE : function (candidate) {
			if (socket) {
				socket.send({
					candidate : {
						sdpMLineIndex : candidate.sdpMLineIndex,
						candidate : JSON.stringify(candidate.candidate)
					}
				});
			}
		},
		onRemoteStream : function (screenStream) {
			var videoElement = createVideoElement();
			videoElement.src = URL.createObjectURL(screenStream);
			videoElement.play();
		}
	};

navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;

// Google has this server as described in http://io13webrtc.appspot.com/#52
iceServers.push({
    url: 'stun:stun.l.google.com:19302'
});

iceServers = {
    iceServers: iceServers
};

window.onload = function () {
	conferenceNameInput = document.getElementById('conference-name');
	createNewConferenceButton = document.getElementById('start-conferencing');

	if (createNewConferenceButton) {
		createNewConferenceButton.onclick = startConference;
	}
	openDefaultSocket();
}

function startConference() {
	// send screen-sharer request to content-script
	if (!extensionInstalled) {
		var message = 'Please install the extension:\n' +
			'1. Go to chrome://extensions\n' +
			'2. Check: "Enable Developer mode"\n' +
			'3. Click: "Load the unpacked extension..."\n' +
			'4. Choose "extension" folder from https://github.com/elobanova/RESTfulService/tree/master/public\n' +
			'5. Reload this page';
		alert(message);
	}
	window.postMessage({
		type : 'SS_UI_REQUEST',
		text : 'start'
	}, '*');
	socket = io('https://localhost');
	clearPage();
}

function clearPage() {
	var groups = document.getElementsByClassName('form-group');
	for (var i = 0; i < groups.length; i++) {
		groups[i].style.display = 'none';
	}
	createNewConferenceButton.style.display = 'none';
}

function insertAfter(elem, refElem) {
	return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
}

function createVideoElement(id) {
	var h1Element = document.getElementsByTagName("h1")[0],
	videoElement = document.createElement('video');
	videoElement.style.width = '640px';
	videoElement.style.height = '480px';
	videoElement.autoplay = true;
	videoElement.controls = true;
	videoElement.id = id;
	insertAfter(videoElement, h1Element);
	return videoElement;
}

// listen for messages from the content-script
window.addEventListener('message', function (event) {
	if (event.origin != window.location.origin)
		return;

	// content-script will send a 'SS_PING' msg if extension is installed
	if (event.data.type && (event.data.type === 'SS_PING')) {
		extensionInstalled = true;
	}

	// user chose a stream
	if (event.data.type && (event.data.type === 'SS_DIALOG_SUCCESS')) {
		startScreenStreamFrom(event.data.streamId);
	}

	// user clicked on 'cancel' in choose media dialog
	if (event.data.type && (event.data.type === 'SS_DIALOG_CANCEL')) {
		console.log('User cancelled!');
	}
});

function startScreenStreamFrom(streamId) {
	navigator.webkitGetUserMedia({
		audio : false,
		video : {
			mandatory : {
				chromeMediaSource : 'desktop',
				chromeMediaSourceId : streamId,
				maxWidth : window.screen.width,
				maxHeight : window.screen.height
			}
		}
	},
		function (screenStream) {
		console.log('getUserMedia succeeded!');
		eventsHandler.attachStream = screenStream;

		var videoElement = createVideoElement('video');
		videoElement.src = URL.createObjectURL(screenStream);
		videoElement.play();
	},
		function (err) {
		console.log('getUserMedia failed!: ' + err);
	});
}

//We''ll pass the peerConfig here as parameter
function createRTCPeerConnection(jsonArg) {
	var pc;
	try {
		pc = new webkitRTCPeerConnection(iceServers);
		pc.onicecandidate = onIceCandidate;
		console.log("Created webkitRTCPeerConnection");
	} catch (e) {
		console.log("Error in webkitRTCPeerConnection, exception: " + e.message);
		return;
	}

	pc.onconnecting = onSessionConnecting;
	pc.onopen = onSessionOpened;
	pc.onaddstream = function (event) {
		var remoteMediaStream = event.stream;

		remoteMediaStream.onended = function () {
			console.log('Stream ended here');
		};

		if (jsonArg.onRemoteStream)
			jsonArg.onRemoteStream(remoteMediaStream);
	};
	pc.onremovestream = onRemoteStreamRemoved;
}

function openSubSocket() {
	var peer;
	function initPeer(offerSDP) {
		if (offerSDP) {
			peerConfig.offerSDP = offerSDP;
		}
		peer = RTCPeerConnection(peerConfig);
	}
}

function openDefaultSocket() {
	defaultSocket = eventsHandler.openSocket({
			onmessage : defaultSocketResponse,
			callback : function (socket) {
				defaultSocket = socket;
			}
		});
}

function defaultSocketResponse(response) {
	openSubSocket();
}