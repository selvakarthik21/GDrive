<!doctype html>
<html>
<head>
<title>Action Items Manager</title>
<meta charset="UTF-8">

<link rel="stylesheet" href="css/bootstrap.min.css">
<link rel="stylesheet" href="css/bootstrap-theme.min.css">
<link rel="stylesheet" href="css/jquery.dataTables.min.css">
<link rel="stylesheet" href="//use.fontawesome.com/releases/v5.2.0/css/all.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous">
<link href="//cdn.rawgit.com/Eonasdan/bootstrap-datetimepicker/e8bddc60e73c1ec2475f827be36e1957af72e2ea/build/css/bootstrap-datetimepicker.css" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
</head>
<body>
	<div class="container">
		<div style="display: -webkit-box;">
			<div class="logo"></div>
			<div class="settings"><i class="fa fa-cog settingsIcon" onclick="javascript:$('#settings-modal').modal('show'); return false;"></i></div>		
		</div>	
		<!-- <div class="title">Action Items Manager</div> -->

		<button id="authorize_button" class="btn btn-primary hidden" style="margin-top: 50px;">Authorize</button>
		
		<table class="table table-inbox hidden dataTable">
			<thead>
				<tr>
					<th style="width: 0%;"></th>
					<th style="width: 10%;text-align: right;">Name</th>
					<th style="width: 12% !important;text-align: right;">Created On</th>
					<th style="width: 58%">Action Item</th>
					<th></th>
				</tr>
			</thead>
			<tbody class="shadow"></tbody>
		</table>
		<div class="overlay">
		    <div id="loading-img"></div>
		</div>
	</div>

	<div class="modal fade" id="delete-modal" tabindex="-1" role="dialog">
		<div class="modal-dialog modal-md">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal"
						aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
					<h4 class="modal-title deleteComment hidden">Are you sure want to Delete the Comment?</h4>
					<h4 class="modal-title markAsResolved hidden">Are you sure want to Mark the Comment as Resolved?</h4>
				</div>
				<form onsubmit="return deleteOrMarkAsResolved();">
					<div class="modal-body">
						<div class="form-group commentContent">
							
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						<button type="submit" id="deleteOrMarkAsResolved-button" class="btn btn-primary">Yes</button>
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
	
	<div class="modal fade" id="icon-active-modal" tabindex="-1" role="dialog">
		<div class="modal-dialog modal-md">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal"
						aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
					<h4 class="modal-title"></h4>
				</div>
					<div class="modal-body">
						<div class="form-group commentContent">
							
						</div>
						<div id="datePickerSelectionDiv" style="display: none;">
    						<h3 id="datePickerText">Due Date</h3>
    						<div class="form-group">
                                <div class='input-group date' id='datetimepicker'>
                                    <input type='text' class="form-control"  onkeydown="return false;" />
                                    <span class="input-group-addon">
                                        <span class="glyphicon glyphicon-calendar"></span>
                                    </span>
                                </div>
                                <div class='input-group date' id='taskDate' style="display: none;" onkeydown="return false;" >
                                    <input type='date' class="form-control" />
                                </div>
                            </div>
                        </div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						<button type="submit" id="icon-active-modal-submit-btn" class="btn btn-primary" onclick="createTaskOrEvent();">Ok</button>
					</div>
			</div>
		</div>
	</div>
	<div class="modal fade" id="settings-modal" tabindex="-1" role="dialog">
		<div class="modal-dialog modal-md">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal"
						aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
					<h4 class="modal-title">Settings</h4>
				</div>
				<form onsubmit="return saveSettings();">
					<div class="modal-body">
						<div class="form-group">
						Search for Action Items older than  : 
							<select id="timeInterval">
								<option value="90" selected="selected">3 Months</option>
								<option value="30">1 Month</option>
								<option value="7">1 Week</option>
								<option value="1">1 Day</option>
							</select>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						<button type="submit" class="btn btn-primary">Save</button>
					</div>
				</form>
			</div>
		</div>
	</div>
	<script src="js/jquery-2.2.4.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script src="js/jquery.dataTables.min.js"></script>
	<script src="js/dataTables.rowReorder.min.js"></script>
	<script src="js/dataTables.material.min.js"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment-with-locales.js"></script>
	<script src="//cdn.rawgit.com/Eonasdan/bootstrap-datetimepicker/e8bddc60e73c1ec2475f827be36e1957af72e2ea/src/js/bootstrap-datetimepicker.js"></script>
	 
	<script src="js/options.js"></script>
	
	<script async defer src="https://apis.google.com/js/api.js"
		onload="this.onload=function(){};handleClientLoad()"
		onreadystatechange="if (this.readyState === 'complete') this.onload()">
	</script>
</body>
</html>