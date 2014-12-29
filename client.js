window.onload = function() {
    var sendButton = document.getElementById("send_button");
    sendButton.onclick = requestFromServer;
}

function requestFromServer() {
	var req = createRequest();
	req.onreadystatechange = function() {
		if (req.readyState != 4) return; // Not there yet
		if (req.status != 200) {
			alert("Seems to be a request failure...");
			return;
		}
	
		// Request successful, read the response
		var resp = req.responseText;
		alert("I received the following object from the server: " + resp);
	}
	
	var customUrl= 'http://localhost:3000/sasha/',
		paramInput = document.getElementById("param_input");
	req.open("GET", customUrl + paramInput.value, true);
	req.send();
}


function createRequest() {
  var xmlhttp = null;
  if (window.XMLHttpRequest) {
  // code for IE7+, Firefox, Chrome, Opera, Safari
	xmlhttp=new XMLHttpRequest();
  } else {
  // code for IE6, IE5
	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  return xmlhttp;
}
