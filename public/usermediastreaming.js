var conferenceNameInput,
	createNewConferenceButton;

window.onload = function() {
	conferenceNameInput = document.getElementById('conference-name');
	createNewConferenceButton = document.getElementById('start-conferencing');
	
	if (createNewConferenceButton) {
		createNewConferenceButton.onclick = startConference;
	}
}

function startConference() {
    captureUserMedia(function() {
        console.log('capturing');
    });
    clearPage();
}

function captureUserMedia(callback) {
    var video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.setAttribute('controls', true);

    getUserMedia({
        video: video,
        onsuccess: function(stream) {
            console.log('stream accessed');
            if (callback) {
				callback();
			}

            video.setAttribute('muted', true);
        },
        onerror: function() {
            console.log('no webcam on');
            if (callback) {
				callback();
			}
        }
    });
}

window.getUserMedia = function(options) {
	console.log('requesting media');
}

function clearPage() {
    var groups = document.getElementsByClassName('form-group');
    for (var i = 0; i < groups.length; i++) {
        groups[i].style.display = 'none';
    }
	createNewConferenceButton.style.display = 'none';
}