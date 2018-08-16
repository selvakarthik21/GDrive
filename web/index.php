<!doctype html>
<html>
<head>
<title>Action Items Manager</title>
<meta charset="UTF-8">

<link rel="stylesheet" href="css/material.min.css">
<link rel="stylesheet" href="css/icon.css">
<link rel="stylesheet" href="css/jquery.dataTables.min.css">
<link rel="stylesheet" href="css/dataTables.material.min.css">

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
    width: 150px;
    height: 56px;
    background-repeat: no-repeat;
    background-size: auto 100%;
}
.no-footer{
	margin-top: 17px;
} 
.container{
	margin-top: 10px;
}

</style>
</head>
<body class="mdl-demo mdl-color--grey-100 mdl-color-text--grey-700 mdl-base">
	<div class="mdl-layout__container has-scrolling-header">
		<div
			class="mdl-layout mdl-js-layout mdl-layout--fixed-header has-tabs is-upgraded"
			data-upgraded=",MaterialLayout">
			<header
				class="mdl-layout__header mdl-layout__header--scroll mdl-color--primary">

				<div class="mdl-layout--large-screen-only mdl-layout__header-row">
					<div class="logo"></div> <h3>Action Items Manager</h3>
				</div>


			</header>
			<main class="mdl-layout__content">

			<button id="authorize_button" class="btn btn-primary hidden"
				style="margin-top: 50px;">Authorize</button>

			<table class="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp table-inbox hidden dataTable">
				<thead>
					<tr>
						<th style="width: 0%;"></th>
						<th style="width: 10%;">Name</th>
						<th style="width: 12%;">Created On</th>
						<th style="width: 53%">Action Item</th>
						<th style="width: 25%; padding-right: 0px;"></th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
			<div class="overlay">
				<div id="loading-img"></div>
			</div>
			</main>
		</div>
	</div>
	<div class="modal fade" id="reply-modal" tabindex="-1" role="dialog" style="display:none;">
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
	<script src="js/jquery.dataTables.min.js"></script>
	<script src="js/dataTables.rowReorder.min.js"></script>
	<script src="js/material.min.js"></script>
	<script src="js/dataTables.material.min.js"></script>
	<script src="js/options.js"></script>
	
	<script async defer src="https://apis.google.com/js/api.js"
		onload="this.onload=function(){};handleClientLoad()"
		onreadystatechange="if (this.readyState === 'complete') this.onload()">
	</script>
</body>
</html>