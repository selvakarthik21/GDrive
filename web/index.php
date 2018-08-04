<!doctype html>
<html>
<head>
<title>Gmail API demo</title>
<meta charset="UTF-8">

<link rel="stylesheet" href="css/bootstrap.min.css">
<link rel="stylesheet" href="css/bootstrap-theme.min.css">
<link rel="stylesheet" href="css/jquery.dataTables.min.css">

<style>
iframe {
	width: 100%;
	border: 0;
	min-height: 80%;
	height: 600px;
	display: flex;
}
table.sortable{
	margin-top: 20px;
}
</style>
</head>
<body>
	<div class="container">
		<h1>GDrive List Action Items</h1>

		<a href="#compose-modal" data-toggle="modal" id="compose-button"
			class="btn btn-primary pull-right hidden">Compose</a>

		<button id="authorize_button" class="btn btn-primary hidden">Authorize</button>
		<button id="signout_button" class="btn btn-primary hidden">Sign Out</button>

		<table class="table table-striped table-inbox hidden dataTable">
			<thead>
				<tr>
					<th style="width: 10%;">Document</th>
					<th style="width: 10%;">Created At</th>
					<th style="width: 60%">Action Item Message</th>
					<th style="width: 20%"></th>
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

	<script src="js/jquery-2.2.4.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script src="js/jquery.dataTables.min.js"></script>
	<script src="js/options.js"></script>
	<script async defer src="https://apis.google.com/js/api.js"
		onload="this.onload=function(){};handleClientLoad()"
		onreadystatechange="if (this.readyState === 'complete') this.onload()">
	</script>
</body>
</html>