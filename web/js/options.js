//Client ID and API key from the Developer Console
var CLIENT_ID = '453486582246-qr4dr1lbclp9149pead96tbtetuvcduj.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBPUJKB5QecgWwtdU4CmX9SrDnXpf0V3w8';
var daysDiff = 90*24*60*60*1000;
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var loggedInUser;
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive profile email';
var messagesList = [];
var authorizeButton = document.getElementById('authorize_button');
var  signoutButton= document.getElementById('signout_button');
var signoutButtonHtml = '<button id="signout_button" class="btn btn-sm btn-danger" style="margin-left:10px;">Sign Out</button>';
var firstTimeLoad = true;
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
		//signoutButton.onclick = handleSignoutClick;
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
		//$(signoutButton).removeClass('hidden');
		$('.table-inbox').removeClass("hidden");
		makeTableSortable();
		setTimeout(function(){
			listFiles();
		}, 1000);
	} else {
		//$(signoutButton).addClass('hidden');
		$(authorizeButton).removeClass('hidden');
		$('.table-inbox').addClass("hidden");
		$('.dataTables_filter').remove();
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
	var mimeType = file.mimeType;
	var url = "";
	if(mimeType.indexOf('application/vnd.google-apps')>-1){
		mimeType = mimeType.replace('application/vnd.google-apps.','')
		url = 'https://docs.google.com/'+mimeType+'/d/'+file.id +'/edit';
	} else {
		url = 'https://drive.google.com/file/d/'+file.id +'/edit';
	}
	var index = getMessageIndex(comment.id);
	var newRow = '<tr>\
			<td>'+index+'</td>\
			<td><a target="_blank" href="'+url+'">'+file.name + '</a></td>\
			<td>'+formatDate(comment.createdTime)+'</td>\
			<td>\
			' + comment.content +
			'</td>\
			<td>\
			<i class="pull-left fa fa-reply" data-dismiss="modal" data-toggle="modal" data-target="#reply-modal" \
					id="'+comment.id+'" onclick="fillInReply(\''+file.name+'\',\''+ escape(comment.content) +'\',this.id,\''+file.id+'\')">\
			</i>\
			<i id="resolve-'+comment.id+'" class="pull-left fa fa-trash" aria-hidden="true"></i>\
			<i id="resolve-'+comment.id+'"  class="pull-left fa fa-check" onclick="markAsResolved(\''+comment.id+'\',\''+file.id+'\')" tooltip="Mark As Resolved"></i>\
			</td>\
			</tr>';
	var table = $('.table-inbox').DataTable();
	var isValidComment = true;
	try{
		isValidComment = new Date(comment.createdTime) >= new Date($('#date').val());
	}catch(e){
		console.log(e)
	}
	if($('#'+comment.id).length == 0 && isValidComment){
		table.row.add($(newRow )).draw();
	}
	
}
function markAsResolved(commentId, fileId){
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
			$('#resolve-'+commentId+',#'+commentId).attr('disabled','disabled');	
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
	$('#reply-subject').val(unescape(subject));
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
	var date = $('#date').val();
	if(new Date(date) == 'Invalid Date'){
		$('#date').css({'borderColor':'red'});
		return;
	}
	try{
		$('.table-inbox').DataTable().clear().draw();
	}catch(e){
		console.log(e);
	}
	//$('.table-inbox tbody').empty();
	var callback = loadAllFiles;
	$('#date').css({'borderColor':''});
	var modifiedAfter = (new Date(date)).toISOString().split(".")[0];
	var getPageOfFiles = function(request, result) {
		request.execute(function(resp) {
			//result = resp.messages;
			resp.files = resp.files || [];
			result = result.concat(resp.files);
			var nextPageToken = resp.nextPageToken;
			if (nextPageToken) {
				request = gapi.client.drive.files.list({
					'q' : 'modifiedTime > \''+modifiedAfter+'\'',
					'pageSize': 1000,
					'pageToken': nextPageToken,
					'userIp' : 'ActionItemsManager',
					'fields': "nextPageToken, files(id, name, mimeType)"
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
		'userIp' : 'ActionItemsManager',
		'fields': "nextPageToken, files(id, name, mimeType)"
	});
	getPageOfFiles(initialRequest, []);
}
function loadAllFiles(files){
	if (files && files.length > 0) {
		$('.overlay').show();
		for (var i = 0; i < files.length; i++) {
			(function(index) {
				setTimeout(function() { 
					var file = files[index]; 
					//console.log(index,file);
					listAllComments(file);
					//console.log(index, files.length)
					if(index+1 == files.length){
						//console.log('Last Item loaded');
						$('.overlay').hide();
					}
				}, i * 200);
			})(i);
		}
	} else {
		//appendPre('No files found.');
	}
}
function listAllComments(file){
	var fileId = file.id;
	var callback = loadAllComments;
	var date = $('#date').val();
	var modifiedAfter = (new Date(date)).toISOString();
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
					'startModifiedTime' : modifiedAfter,
					'pageToken': nextPageToken,
					'userIp' : 'ActionItemsManager',
					'fields': "nextPageToken, comments(id,content,htmlContent,resolved,createdTime)"
				});
				getPageOfFiles(request, result);
			} else {
				callback(file, result);				
			}
		});
	};
	var initialRequest = gapi.client.drive.comments.list({
		'fileId' : fileId,
		//'startModifiedTime' : modifiedAfter,
		'pageSize': 100,
		'userIp' : 'ActionItemsManager',
		'fields': "nextPageToken, comments(id,content,htmlContent,resolved,createdTime)"
	});
	getPageOfComments(initialRequest, []);
}
function makeTableSortable(){
	try{
		$('.table-inbox').DataTable().clear().draw();
		$('.table-inbox').DataTable().destroy();
	}catch(e){
		console.log(e);
	}
	var table = $('.table-inbox').DataTable({
		paging: false,
		rowReorder: true,
		"iDisplayLength": "All",
		"order": [[ 0, "asc" ]],
		"bInfo" : false,
        "columnDefs": [
            { targets: 0, visible: false },
            { orderable: true, className: 'reorder', targets: 1 },
            { orderable: true, className: 'reorder', targets: 2 },
            { orderable: false, targets: '_all' }
        ],
        "fnInitComplete": function( settings ) {
        	var currentDate = new Date();
        	currentDate = formateDateToHTML5Date(currentDate);
        	var d = new Date();
        	d = new Date( d- daysDiff );
        	var formattedDate = formateDateToHTML5Date(d);
        	var label = '<label style="width: 250px;">\
        		Search from : \
				<input type="date" placeholder="mm/dd/yyyy" id="date" max="'+currentDate+'" onkeydown="return false;" value="'+formattedDate+'">\
			</label>';
        	if($('#date').length == 0){
        		$('.dataTables_filter').append('<button id="refreshItem" onclick="listFiles();" class="btn btn-primary btn-sm" style="margin-left: 10px;">Refresh</button>');
        		$('.dataTable thead tr th:last').append(label);
        		$(signoutButtonHtml).appendTo($('.dataTables_filter'));
        		setTimeout(function(){
        			signoutButton = document.getElementById('signout_button');
            		signoutButton.onclick = handleSignoutClick;
        		}, 1000)
        		$('#date').change(listFiles);
        	}
        	if(firstTimeLoad){
        		firstTimeLoad = false;
        		$('#date').val(formattedDate);
        	}
        	
        }
	});
	table.on( 'row-reorder', function ( e, diff, edit ) {
		var messageOrder = [];
		$('.table-inbox tbody tr').each(function(){
			var replyBtnId = $(this).find('button[data-target="#reply-modal"]').attr('id');
			messageOrder.push(replyBtnId);
		});
		updateMessageOrder(messageOrder);
    } );
	$(".table-inbox thead tr").off('click', 'th');
	$(".table-inbox thead tr").on('click', 'th', function(){
	    var col_idx =  table.column(this).index();
	    if(col_idx == 1 || col_idx == 2){
	    	var messageOrder = [];
			$('.table-inbox tbody tr').each(function(){
				var replyBtnId = $(this).find('button[data-target="#reply-modal"]').attr('id');
				messageOrder.push(replyBtnId);
			});
			updateMessageOrder(messageOrder);
	    }
	});
}
function updateMessageOrder(messageOrder){
	messagesList = messageOrder;
}
function getMessageIndex(messageId){
	var idx = (messagesList.indexOf(messageId) > -1)  ? messagesList.indexOf(messageId) : 999999999999;	
	return idx;
}
function formateDateToHTML5Date(d){
	var year = d.getFullYear();
	var month = d.getMonth() +1;
	if(month < 10){
		month = "0"+month;
	}
	var date = d.getDate();
	if(date < 10){
		date = "0"+date;
	}
	var formattedDate = year+"-"+month+"-"+date;
	return formattedDate;
}
function formatDate(date){
	var text = '';
	try{
		text = date.replace("T",' ').split(".")[0]
	} catch(e){
		text = '';
	}
	return text;
}
function loadAllComments(file, comments){		
	if (comments && comments.length > 0) {
		console.log(comments);
		for (var i = 0; i < comments.length; i++) {
			var comment = comments[i];
			var content = comment.content;              
			if(!comment.resolved && content.indexOf(loggedInUser) > -1){
				//content = content.replace(loggedInUser,'+karthik21');
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
