var port = chrome.runtime.connect(chrome.runtime.id);

port.onMessage.addListener(function(msg) {
	window.postMessage(msg, '*');
});

window.addEventListener('message', function(event) {
	// We only accept messages from ourselves
	if (event.source != window) return;

	if (event.data.type && ((event.data.type === 'SS_UI_REQUEST') ||
							(event.data.type === 'SS_UI_CANCEL'))) {
		port.postMessage(event.data);
	}
}, false);

window.postMessage({ type: 'SS_PING', text: 'start' }, '*');