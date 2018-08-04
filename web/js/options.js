//Client ID and API key from the Developer Console
var CLIENT_ID = '453486582246-qr4dr1lbclp9149pead96tbtetuvcduj.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBPUJKB5QecgWwtdU4CmX9SrDnXpf0V3w8';
var daysDiff = 7*24*60*60*1000;
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var loggedInUser;
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive profile email';

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
		loggedInUser = "+"+gapi.auth2.getAuthInstance().currentUser.Ab.w3.U3 ;
		$(authorizeButton).addClass('hidden');
		$(signoutButton).removeClass('hidden');
		$('.table-inbox').removeClass("hidden");
		listFiles();
	} else {
		$(signoutButton).addClass('hidden');
		$(authorizeButton).removeClass('hidden');
		$('.table-inbox').addClass("hidden");
	}
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn({
		scope: 'profile email'
	}).then(function(response){
		try{
			loggedInUser = "+"+response.w3.U3 ;
		} catch(e){
			console.log('error', e );
		}

	});
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
function appendPre(file, comment) {
	$('.table-inbox tbody').append(
			'<tr>\
			<td><a target="_blank" href="https://drive.google.com/file/d/'+file.id +'/view">'+file.name + '</a></td>\
			<td>\
			' + comment.content +
			'</td>\
			<td>\
				<button data-dismiss="modal" data-toggle="modal" data-target="#reply-modal" \
					id="'+comment.id+'" class="btn btn-primary" onclick="fillInReply(\''+file.name+'\',\''+ comment.content +'\',this.id,\''+file.id+'\')">\
				Reply</button>\
			<button id="'+comment.id+'"  class="btn btn-primary" onclick="markAsResolved(this.id,\''+file.id+'\',\''+ comment.content +'\')"> Mark As Resolved</button>\
			</td>\
			</tr>'
	);
}
function markAsResolved(commentId, fileId, content){
	var sendRequest = gapi.client.drive.replies.create({
		'fileId' : fileId,
		'commentId': commentId,
		'fields': 'content',
		'action' : 'resolve',
		'content': 'resolved'
	});
	sendRequest.execute(function(response){
		console.log(response);
		if(response.content === 'resolved'){
			$('#'+commentId).addClass('disabled');	
		}		
	});
}
function sendReply()
{
	$('#reply-button').addClass('disabled');

	sendMessage(
			$('#reply-message-id').attr('fileId'),
			$('#reply-message-id').val(),
			$('#reply-message').val(),
			replyTidy
	);

	return false;
}

function replyTidy(response)
{
	console.log('reply response ' + response);
	$('#reply-modal').modal('hide');

	$('#reply-message').val('');

	$('#reply-button').removeClass('disabled');
}

function fillInReply(to, subject, message_id, fileId)
{
	$('#reply-to').val(to);
	$('#reply-subject').val(subject);
	$('#reply-message-id').val(message_id);
	$('#reply-message-id').attr('fileId', fileId);
}

function sendMessage(fileId, messageId, message, callback)
{

	var sendRequest = gapi.client.drive.replies.create({
		'fileId' : fileId,
		'commentId': messageId,
		'fields': 'content',
		'content': message
	});

	return sendRequest.execute(callback);
}
/**
 * Print files.
 */
function listFiles() {
	$('.table-inbox tbody').empty();
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
		'q' : 'modifiedTime > \''+modifiedAfter+'\'',
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
			//appendPre(href);
			listAllComments(file);
		}
	} else {
		appendPre('No files found.');
	}

}
function listAllComments(file){
	var fileId = file.id;
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
				callback(file, result);
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
function loadAllComments(file, comments){		
	if (comments && comments.length > 0) {
		console.log(comments);
		for (var i = 0; i < comments.length; i++) {
			var comment = comments[i];
			var content = comment.content;              
			if(!comment.resolved && content.indexOf(loggedInUser) > -1){
				content = content.replace(loggedInUser,'+karthik21');
				comment.content = content;
				appendPre(file, comment);
			}             
		}
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