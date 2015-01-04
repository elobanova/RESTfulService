var conferenceNameInput,
	createNewConferenceButton,
	localStream,
	extensionInstalled = false,
	servers = null,
	pc,
	configuration = {
		'iceServers' : [{
				'url' : 'stun:stun.l.google.com:19302'
			}
		]
	};

navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;

window.onload = function () {
	conferenceNameInput = document.getElementById('conference-name');
	createNewConferenceButton = document.getElementById('start-conferencing');

	if (createNewConferenceButton) {
		createNewConferenceButton.onclick = startConference;
	}
}

function startConference() {
	// send screen-sharer request to content-script
	if (!extensionInstalled) {
		var message = 'Please install the extension:\n' +
			'1. Go to chrome://extensions\n' +
			'2. Check: "Enable Developer mode"\n' +
			'3. Click: "Load the unpacked extension..."\n' +
			'4. Choose "extension" folder from the repository\n' +
			'5. Reload this page';
		alert(message);
	}
	window.postMessage({
		type : 'SS_UI_REQUEST',
		text : 'start'
	}, '*');

	pc = new webkitRTCPeerConnection(configuration);

	pc.onnegotiationneeded = function () {
		pc.createOffer(localDescCreated, logError);
	}

	pc.onaddstream = function (event) {
		remoteView.src = URL.createObjectURL(event.stream);
	};
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

function createVideoElement() {
	var h1Element = document.getElementsByTagName("h1")[0],
	videoElement = document.createElement('video');
	videoElement.style.width = '640px';
	videoElement.style.height = '480px';
	videoElement.autoplay = true;
	videoElement.controls = true;
	videoElement.id = 'video';
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
		localStream = screenStream;

		var videoElement = createVideoElement();
		videoElement.src = URL.createObjectURL(screenStream);
		videoElement.play();
	},
		function (err) {
		console.log('getUserMedia failed!: ' + err);
	});
}
