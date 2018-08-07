<!doctype html>
<html>
<head>
<title>Action Items Manager</title>
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
td.reorder{
	text-align: left !important;
}
#loading-img {
    background: url(img/Velocity.gif) center center no-repeat;
    height: 100%;
    z-index: 20;
}

.overlay {
    background: white;
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0.5;
}
.title{
	text-transform: uppercase;
	font-size: 24px;
	width: 350px;
    float: left;
    padding-top: 10px;
    position: absolute;
}
.logo{
	background: url(img/logo.png) no-repeat;
    width: 100%;
    height: 60px;
    background-repeat: no-repeat;
    background-size: auto 100%;
}
</style>
</head>
<body>
	<div class="container">
		<div class="logo"></div>		
		<div class="title">Action Items Manager</div>

		<a href="#compose-modal" data-toggle="modal" id="compose-button"
			class="btn btn-primary pull-right hidden">Compose</a>

		<button id="authorize_button" class="btn btn-primary hidden" style="margin-top: 50px;">Authorize</button>
		

		<table class="table table-striped table-inbox hidden dataTable">
			<thead>
				<tr>
					<th style="width: 0%;"></th>
					<th style="width: 10%;">Document</th>
					<th style="width: 10%;">Created At</th>
					<th style="width: 57%">Action Item Message</th>
					<th style="width: 23%"></th>
				</tr>
			</thead>
			<tbody></tbody>
		</table>
		<div class="overlay">
		    <div id="loading-img"></div>
		</div>
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
	<script src="js/dataTables.rowReorder.min.js"></script>
	<script src="js/options.js"></script>
	
	<script async defer src="https://apis.google.com/js/api.js"
		onload="this.onload=function(){};handleClientLoad()"
		onreadystatechange="if (this.readyState === 'complete') this.onload()">
	</script>
</body>
</html>