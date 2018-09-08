//Client ID and API key from the Developer Console
var CLIENT_ID = '453486582246-qr4dr1lbclp9149pead96tbtetuvcduj.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBPUJKB5QecgWwtdU4CmX9SrDnXpf0V3w8';
var daysDiff = 90*24*60*60*1000;
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
	"https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest",
	"https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var loggedInUser;
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks';
var messagesList = [];
var authorizeButton = document.getElementById('authorize_button');
var  signoutButton= document.getElementById('signout_button');
var signoutButtonHtml = '<button id="signout_button" class="btn btn-sm btn-danger" style="margin-left:10px;">Sign Out</button>';
var firstTimeLoad = true;
var tzoffset = (new Date()).getTimezoneOffset() * 60000;

$(document).on('click', '.googleIcons', function(){
	var isActive = $(this).hasClass('active');
	var iconType = $(this).attr('data-icon');
	if ("Notes" == iconType){
		return;
	}
	var title = $(this).attr('title');
	$('#icon-active-modal .modal-title').text(title);
	var prefixText = $(this).attr('data-icon');
	var commentId = $(this).closest('tr').attr('id');
	commentId = commentId.replace('row-','');
	var commentContent = $('#row-'+commentId).find('.commentText').text();
	$('.commentContent').html(prefixText +" : " + commentContent);
	var fileName = $('#row-'+commentId).find('td:first a').text();
	$('#datetimepicker input, #taskDate input').css({'borderColor':'none'});
	var selectedDate = $(this).attr('data-'+iconType+'-date') || "";
	$("#datePickerSelectionDiv").show();
	if('Task' == iconType){
		selectedDate = new Date(selectedDate);
		selectedDate = formateDateToHTML5Date(selectedDate);
		$('#datetimepicker').hide();		
		$('#taskDate').show()
		$('#taskDate input').val(selectedDate);
	} else {
		$('#datetimepicker input').val(selectedDate);
		$('#datetimepicker').show();
		$('#taskDate').hide();
	}
	if(isActive){
		var id = $(this).attr('data-id');
		$('#icon-active-modal-submit-btn').hide();
	} else {
		$('#icon-active-modal-submit-btn').show();
		$('#icon-active-modal-submit-btn').attr('data-icon', iconType);
		$('#icon-active-modal-submit-btn').attr('data-text', commentContent);
		$('#icon-active-modal-submit-btn').attr('data-fileName', fileName);
		$('#icon-active-modal-submit-btn').attr('data-commentId', commentId);
		$('#datetimepicker > span').click();
		setTimeout(function(){
			$('#datetimepicker > span').click();
		},1);
		if('Task' == iconType || 'Event' == iconType || 'Reminder' == iconType){
			$('#icon-active-modal-submit-btn').text("Create "+iconType);	
		}
		if(0 == messagesList.length){
			var messageOrder = [];
			$('.table-inbox tbody tr').each(function(){
				var replyBtnId = $(this).attr('id');
				replyBtnId = replyBtnId.replace(/row-/gi,'');
				var obj = {
						id : replyBtnId
				}
				if(0 < messagesList.length){
					var filteredObj = $.grep(messagesList, function(element, index){
						return element.id == replyBtnId;
					});
					if(filteredObj[0]){ 
						obj = filteredObj[0];				
					}
				}
				messageOrder.push(obj);
			});
			updateMessageOrder(messageOrder);
		}
		
	}
	$('#icon-active-modal').modal('show');
})
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
function createTaskOrEvent(){
	var iconType = $('#icon-active-modal-submit-btn').attr('data-icon');
	var content  = $('#icon-active-modal-submit-btn').attr('data-text');
	var fileName = $('#icon-active-modal-submit-btn').attr('data-fileName');
	if('Task' == iconType || 'Event' == iconType || 'Reminder' == iconType){
		var selectedDate = $('#datetimepicker input').val();
		var taskDate = $('#taskDate input').val();
		if('Task' == iconType){
			if(new Date(taskDate) == 'Invalid Date'){
				$('#taskDate input').css({'borderColor':'red'});
				return false;
			}
		} else if(new Date(selectedDate) == 'Invalid Date'){
			$('#datetimepicker input').css({'borderColor':'red'});
			return false;
		}
		$('#datetimepicker input').css({'borderColor':'none'});
		var sendRequest;
		if('Task' == iconType){
			sendRequest = gapi.client.tasks.tasks.insert({
				'tasklist' : '@default',
				'title': fileName,
				'notes': content,
				'due' : (new Date( (new Date(taskDate)).getTime()+tzoffset)).toISOString() 
			});
		} else if('Reminder' == iconType || 'Event' == iconType){
			var event = {
					'summary': fileName,
					'description': content,
					'start': {
						'dateTime': (new Date(selectedDate)).toISOString() 
					},
					'end': {
						'dateTime': (new Date(selectedDate)).toISOString() 
					}
			}
			if('Reminder' == iconType){
				event['reminders'] = {
						'useDefault': false,
						'overrides': [
							{'method': 'email', 'minutes': 0},
							{'method': 'popup', 'minutes': 0},
							{'method': 'sms', 'minutes': 0}
						]
				}
			}
			sendRequest = gapi.client.calendar.events.insert({
				'calendarId': 'primary',
				'resource': event
			});
		}
		sendRequest.execute(function(response){
			if(response.id){
				var commentId = $('#icon-active-modal-submit-btn').attr('data-commentId');
				var index = getMessageIndex(commentId);
				var messageRelatedActionDetails = messagesList[index];
				if('Task' == iconType){
					var date = new Date(response.due);
					date = formateDateToMMDDYYYY(date, false);
					messageRelatedActionDetails.taskId = response.id;
					messageRelatedActionDetails.taskText = '<span style="color: #337ab7;width: 25% !important; display: inline-block;"><b> Task : </b>'+(date)+'</span>';
					messageRelatedActionDetails.taskDate = date;
				}else if('Reminder' == iconType){
					messageRelatedActionDetails.reminderId = response.id;
					var date = new Date(response.start.dateTime);
					messageRelatedActionDetails.reminderText = '<span style="color: #337ab7;width: 40% !important; display: inline-block;"><b> Reminder : </b>'+(date.toLocaleString())+'</span>';
					messageRelatedActionDetails.reminderDate = (date.toLocaleString());
				}else if('Event' == iconType){
					var date = new Date(response.start.dateTime);
					messageRelatedActionDetails.eventId = response.id;
					messageRelatedActionDetails.eventText = '<span style="color: #337ab7;width: 35% !important; display: inline-block;"><b> Event : </b>'+(date.toLocaleString())+'</span>';
					messageRelatedActionDetails.eventDate = (date.toLocaleString());
				}
				messagesList[index] = messageRelatedActionDetails;
				
				updateMessageOrder(messagesList);                
				var $tdComment = $("#row-" + commentId).find(".commentText").parent();
				$tdComment.find("span:not(.commentText)").remove();
				
				var eventText = messageRelatedActionDetails.eventText || "";
				var reminderText = messageRelatedActionDetails.reminderText || "";
				var keepText = messageRelatedActionDetails.keepText || "";
				var taskText = messageRelatedActionDetails.taskText || "";
								
				var contentSuffixText = eventText+reminderText+keepText+taskText;
				
				$tdComment.append(contentSuffixText);
				
				var eventId = messageRelatedActionDetails.eventId || "";
				var reminderId = messageRelatedActionDetails.reminderId || "";
				var keepId = messageRelatedActionDetails.keepId || "";
				var taskId = messageRelatedActionDetails.taskId || "";
				
				var eventActive = ($.trim(eventId) == "") ? "" : " active ", 
				reminderActive =  ($.trim(reminderId) == "") ? "" : " active ", 
				keepActive =  ($.trim(keepId) == "") ? "" : " active ", 
				taskActive =  ($.trim(taskId) == "") ? "" : " active ";
				
				var taskDate = messageRelatedActionDetails.taskDate || "";
				var keepDate = messageRelatedActionDetails.keepDate || ""
				var reminderDate = messageRelatedActionDetails.reminderDate || "";
				var eventDate = messageRelatedActionDetails.eventDate || "";
				
				$("#row-" + commentId + " .taskIcon").addClass(taskActive).attr("data-task-date", taskDate), 
				$("#row-" + commentId + " .keepIcon").addClass(keepActive).attr("data-keep-date", keepDate), 
				$("#row-" + commentId + " .reminderIcon").addClass(reminderActive).attr("data-reminder-date", reminderDate), 
				$("#row-" + commentId + " .calendarIcon").addClass(eventActive).attr("data-event-date", eventDate);
			}
			setTimeout(function(){
				$("#icon-active-modal").modal('hide');
			}, 1000);
		});
	} else {
		$("#icon-active-modal").modal('hide');
	}
	return false;
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
	var messageRelatedActionDetails = messagesList[index] || {};
	var eventText = messageRelatedActionDetails.eventText || "";
	var reminderText = messageRelatedActionDetails.reminderText || "";
	var keepText = messageRelatedActionDetails.keepText || "";
	var taskText = messageRelatedActionDetails.taskText || "";
	
	var contentSuffixText = eventText+reminderText+keepText+taskText;
	
	var eventId = messageRelatedActionDetails.eventId || "";
	var reminderId = messageRelatedActionDetails.reminderId || "";
	var keepId = messageRelatedActionDetails.keepId || "";
	var taskId = messageRelatedActionDetails.taskId || "";
	
	var eventActive = ($.trim(eventId) == "") ? "" : " active ", 
	reminderActive =  ($.trim(reminderId) == "") ? "" : " active ", 
	keepActive =  ($.trim(keepId) == "") ? "" : " active ", 
	taskActive =  ($.trim(taskId) == "") ? "" : " active ";
	var taskDate = messageRelatedActionDetails.taskDate || ""
	var reminderDate = messageRelatedActionDetails.reminderDate || "";
	var eventDate = messageRelatedActionDetails.eventDate || "";
	var newRow = '<tr id="row-'+comment.id+'">\
			<td>'+index+'</td>\
			<td><a target="_blank" href="'+url+'">'+file.name + '</a></td>\
			<td>'+new Date(comment.createdTime).toLocaleString()+'</td>\
			<td>\
			<span class="commentText" >' + comment.content +'</span><br/>'+contentSuffixText+'\
			</td>\
			<td>\
			<div class="icons taskIcon googleIcons '+taskActive+'" title="Google Task" data-icon="Task" data-id="'+taskId+'" data-task-date="'+taskDate+'"></div>\
			<div class="icons keepIcon googleIcons '+keepActive+'" title="Google Keep" data-icon="Notes" data-id="'+keepId+'" style="display:none;"></div>\
			<div class="icons reminderIcon googleIcons '+reminderActive+'" title="Google Reminder" data-icon="Reminder" data-id="'+reminderId+'" data-reminder-date="'+reminderDate+'"></div>\
			<div class="icons calendarIcon googleIcons '+eventActive+'" title="Google Calendar" data-icon="Event" data-id="'+eventId+'" data-event-date="'+eventDate+'"></div>\
			<div class="icons replyIcon" data-dismiss="modal" data-toggle="modal" data-target="#reply-modal" \
					id="'+comment.id+'" onclick="fillInReply(\''+file.name+'\',\''+ escape(comment.content) +'\',this.id,\''+file.id+'\')">\
			</div>\
			<div id="delete-'+comment.id+'"  class="icons deleteIcon" onclick="showDeleteOrMarkAsResolvePopup(\''+comment.id+'\',\''+file.id+'\',\'delete\')" tooltip="Delete Comment"></div>\
			<div id="resolve-'+comment.id+'" class="icons resolvedIcon" onclick="showDeleteOrMarkAsResolvePopup(\''+comment.id+'\',\''+file.id+'\',\'markAsResolved\')" tooltip="Mark As Resolved"></div>\
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

function showDeleteOrMarkAsResolvePopup(commentId, fileId, actionType){
	if('delete' == actionType){
		$('.deleteComment').removeClass('hidden');
		$('.markAsResolved').addClass('hidden');
	} else if('markAsResolved' == actionType){
		$('.deleteComment').addClass('hidden');
		$('.markAsResolved').removeClass('hidden');
	}
	if('delete' == actionType || 'markAsResolved' == actionType){
		var commentContent = $('#row-'+commentId).find('.commentText').text();
		$('.commentContent').html(commentContent);
		var $btn = $('#deleteOrMarkAsResolved-button');
		$btn.attr('actionType', actionType);
		$btn.attr('commentId', commentId);
		$btn.attr('fileId', fileId);
		$('#delete-modal').modal('show');
	}
}

function deleteOrMarkAsResolved(){
	var $btn = $('#deleteOrMarkAsResolved-button');
	var actionType = $btn.attr('actionType');
	var commentId = $btn.attr('commentId');
	var fileId = $btn.attr('fileId');
	switch (actionType) {
	case 'delete':
		deleteComment(commentId, fileId);
		$('#delete-modal').modal('hide');
		break;
	case 'markAsResolved':
		markAsResolved(commentId, fileId);
		$('#delete-modal').modal('hide');
		break;	
	default:
		$('#delete-modal').modal('hide');
	break;
	}
	return false;
}
function deleteComment(commentId, fileId){
	var sendRequest = gapi.client.drive.comments.delete({
		'fileId' : fileId,
		'commentId': commentId
	});
	sendRequest.execute(function(response){
		console.log(response);
		if(response.result){
			$('#delete-modal').modal('hide');
			listFiles();		
		}		
	});
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
	try{
		$('#datetimepicker').datetimepicker();
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
        		$('.dataTables_filter').append('<button id="refreshItem" onclick="listFiles();" class="btn btn-primary btn-sm" style="margin-left: 7px;">Refresh</button>');
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
			var replyBtnId = $(this).attr('id');
			replyBtnId = replyBtnId.replace(/row-/gi,'');
			var obj = {
					id : replyBtnId
			}
			if(0 < messagesList.length){
				var filteredObj = $.grep(messagesList, function(element, index){
					return element.id == replyBtnId;
				});
				if(filteredObj[0]){ 
					obj = filteredObj[0];				
				}
			}
			messageOrder.push(obj);
		});
		updateMessageOrder(messageOrder);
    } );
	$(".table-inbox thead tr").off('click', 'th');
	$(".table-inbox thead tr").on('click', 'th', function(){
	    var col_idx =  table.column(this).index();
	    if(col_idx == 1 || col_idx == 2){
	    	var messageOrder = [];
			$('.table-inbox tbody tr').each(function(){
				var replyBtnId = $(this).attr('id');
				replyBtnId = replyBtnId.replace(/row-/gi,'');
				var obj = {
						id : replyBtnId
				}
				if(0 < messagesList.length){
					var filteredObj = $.grep(messagesList, function(element, index){
						return element.id == replyBtnId;
					});
					if(filteredObj[0]){ 
						obj = filteredObj[0];				
					}
				}
				messageOrder.push(obj);
			});
			updateMessageOrder(messageOrder);
	    }
	});
}
function updateMessageOrder(messageOrder){
	messagesList = messageOrder;
}
function getMessageIndex(messageId){
	var index = -1;
	for(var i = 0; i < messagesList.length; i++){
		if(messageId == messagesList[i].id){
			index = i; 
			break;
		}
	}
	var idx = (index > -1)  ? index : 999999999999;	
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

function formateDateToMMDDYYYY(d, isPrefixNeeded){
	var year = d.getFullYear();
	var month = d.getMonth() +1;
	if(month < 10 && isPrefixNeeded){
		month = "0"+month;
	}
	var date = d.getDate();
	if(date < 10 && isPrefixNeeded){
		date = "0"+date;
	}
	var formattedDate = month+"/"+date+"/"+year;
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
				content = content.replace(loggedInUser,'');
				comment.content = content;
				appendPre(file, comment);
			}             
		}
		if(0 == messagesList.length){
			setTimeout(function() {		
				$(".table-inbox thead tr th:eq(1)")["click"]()		
			}, 2000);
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
