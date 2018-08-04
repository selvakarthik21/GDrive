<?php /*
<!doctype html>
<html>
<head>
<title>Gmail API demo</title>
<meta charset="UTF-8">

<link rel="stylesheet"
	href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
<link rel="stylesheet"
	href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">
<style>
iframe {
	width: 100%;
	border: 0;
	min-height: 80%;
	height: 600px;
	display: flex;
}
</style>
</head>
<body>
	<div class="container">
		<h1>Gmail API demo</h1>

		<a href="#compose-modal" data-toggle="modal" id="compose-button"
			class="btn btn-primary pull-right hidden">Compose</a>

		<button id="authorize-button" class="btn btn-primary hidden">Authorize</button>

		<table class="table table-striped table-inbox hidden">
			<thead>
				<tr>
					<th>From</th>
					<th>Subject</th>
					<th>Date/Time</th>
				</tr>
			</thead>
			<tbody></tbody>
		</table>
	</div>

	<div class="modal fade" id="compose-modal" tabindex="-1" role="dialog">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal"
						aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
					<h4 class="modal-title">Compose</h4>
				</div>
				<form onsubmit="return sendEmail();">
					<div class="modal-body">
						<div class="form-group">
							<input type="email" class="form-control" id="compose-to"
								placeholder="To" required />
						</div>

						<div class="form-group">
							<input type="text" class="form-control" id="compose-subject"
								placeholder="Subject" required />
						</div>

						<div class="form-group">
							<textarea class="form-control" id="compose-message"
								placeholder="Message" rows="10" required></textarea>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						<button type="submit" id="send-button" class="btn btn-primary">Send</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<div class="modal fade" id="reply-modal" tabindex="-1" role="dialog">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal"
						aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
					<h4 class="modal-title">Reply</h4>
				</div>
				<form onsubmit="return sendReply();">
					<input type="hidden" id="reply-message-id" />

					<div class="modal-body">
						<div class="form-group">
							<input type="text" class="form-control" id="reply-to" disabled />
						</div>

						<div class="form-group">
							<input type="text" class="form-control disabled"
								id="reply-subject" disabled />
						</div>

						<div class="form-group">
							<textarea class="form-control" id="reply-message"
								placeholder="Message" rows="10" required></textarea>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						<button type="submit" id="reply-button" class="btn btn-primary">Send</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<script src="//code.jquery.com/jquery-1.11.3.min.js"></script>
	<script
		src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>

	<script src="js/options.js"></script>
	<script
		src="https://apis.google.com/js/api.js?onload=handleClientLoad"></script>
</body>
</html>*/
?>
<!DOCTYPE html>
<html>
  <head>
    <title>Drive API Quickstart</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <p>Drive API Quickstart</p>

    <!--Add buttons to initiate auth sequence and sign out-->
    <button id="authorize_button" style="display: none;">Authorize</button>
    <button id="signout_button" style="display: none;">Sign Out</button>

    <pre id="content"></pre>

    <script type="text/javascript">
      // Client ID and API key from the Developer Console
      var CLIENT_ID = '453486582246-qr4dr1lbclp9149pead96tbtetuvcduj.apps.googleusercontent.com';
      var API_KEY = 'AIzaSyBPUJKB5QecgWwtdU4CmX9SrDnXpf0V3w8';
      var daysDiff = 7*24*60*60*1000;
      // Array of API discovery doc URLs for APIs used by the quickstart
      var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      var SCOPES = 'https://www.googleapis.com/auth/drive';

      var authorizeButton = document.getElementById('authorize_button');
      var signoutButton = document.getElementById('signout_button');

      /**
       *  On load, called to load the auth2 library and API client library.
       */
      function handleClientLoad() {
        gapi.load('client:auth2', initClient);
      }

      /**
       *  Initializes the API client library and sets up sign-in state
       *  listeners.
       */
      function initClient() {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          authorizeButton.onclick = handleAuthClick;
          signoutButton.onclick = handleSignoutClick;
        });
      }

      /**
       *  Called when the signed in status changes, to update the UI
       *  appropriately. After a sign-in, the API is called.
       */
      function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
          authorizeButton.style.display = 'none';
          signoutButton.style.display = 'block';
          listFiles();
        } else {
          authorizeButton.style.display = 'block';
          signoutButton.style.display = 'none';
        }
      }

      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node. Used to display the results of the API call.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var target = document.getElementById('content');
        target.insertAdjacentHTML( 'beforeend', message + '\n' );
        
      }

      /**
       * Print files.
       */
      function listFiles() {
          var callback = loadAllFiles;
          var modifiedAfter = (new Date(new Date()-daysDiff)).toISOString().split(".")[0]
    	  var getPageOfFiles = function(request, result) {
    			request.execute(function(resp) {
    				//result = resp.messages;
    				resp.files = resp.files || [];
    				result = result.concat(resp.files);
    				var nextPageToken = resp.nextPageToken;
    				if (nextPageToken) {
    					request = gapi.client.drive.files.list({
    						  'q' : 'modifiedTime >'+modifiedAfter,
    				          'pageSize': 1000,
    				          'pageToken': nextPageToken,
    				          'fields': "nextPageToken, files(id, name)"
    				        });
    					getPageOfFiles(request, result);
    				} else {
    					callback(result);
    				}
    			});
    		};
    		var initialRequest = gapi.client.drive.files.list({
        		  'q' : 'modifiedTime >'+modifiedAfter,
    	          'pageSize': 1000,
    	          'fields': "nextPageToken, files(id, name)"
    	        });
    		getPageOfFiles(initialRequest, []);
      }
      function loadAllFiles(files){
    	  if (files && files.length > 0) {
              for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var href = '<a target="_blank" href="https://drive.google.com/file/d/'+file.id +'/view">'+file.name + '</a>';
                appendPre(href);
                listAllComments(href, file.id);
              }
            } else {
              appendPre('No files found.');
            }
          
      }
	function listAllComments(href,fileId){
		var callback = loadAllComments;
  	  var getPageOfComments = function(request, result) {
  			request.execute(function(resp) {
  				//result = resp.messages;
  				resp.comments = resp.comments || [];
  				result = result.concat(resp.comments);
  				var nextPageToken = resp.nextPageToken;
  				if (nextPageToken) {
  					request = gapi.client.drive.comments.list({
  						  'fileId' : fileId,
  				          'pageSize': 100,
  				          'pageToken': nextPageToken,
  				          'fields': "nextPageToken, files(id, name)"
  				        });
  					getPageOfFiles(request, result);
  				} else {
  					callback(href, result);
  				}
  			});
  		};
  		var initialRequest = gapi.client.drive.comments.list({
  	  		  'fileId' : fileId,
  	          'pageSize': 100,
  	          'fields': "nextPageToken, comments(id,content,htmlContent,resolved)"
  	        });
  		getPageOfComments(initialRequest, []);
	}
	function loadAllComments(href, data){
		console.log(data);
		if (data && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
              var file = data[i];
              var hrefMessage = href+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+file.htmlContent;
              appendPre(hrefMessage);
            }
          } else {
            appendPre('No files found.');
          }
	}
	function sleep(milliseconds) {
		  var start = new Date().getTime();
		  for (var i = 0; i < 1e7; i++) {
		    if ((new Date().getTime() - start) > milliseconds){
		      break;
		    }
		  }
		}
    </script>

    <script async defer src="https://apis.google.com/js/api.js"
      onload="this.onload=function(){};handleClientLoad()"
      onreadystatechange="if (this.readyState === 'complete') this.onload()">
    </script>
  </body>
</html>