var loggedInUser,CLIENT_ID="453486582246-qr4dr1lbclp9149pead96tbtetuvcduj.apps.googleusercontent.com",API_KEY="AIzaSyBPUJKB5QecgWwtdU4CmX9SrDnXpf0V3w8",daysDiff=7776e6,DISCOVERY_DOCS=["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],SCOPES="https://www.googleapis.com/auth/drive profile email",messagesList=[],authorizeButton=document.getElementById("authorize_button"),signoutButton=document.getElementById("signout_button"),signoutButtonHtml='<button id="signout_button" class="btn btn-sm btn-danger" style="margin-left:10px;">Sign Out</button>',firstTimeLoad=!0;function handleClientLoad(){gapi.load("client:auth2",initClient)}function initClient(){gapi.client.init({apiKey:API_KEY,clientId:CLIENT_ID,discoveryDocs:DISCOVERY_DOCS,scope:SCOPES}).then(function(){gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus),updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get()),authorizeButton.onclick=handleAuthClick})}function updateSigninStatus(e){e?(loggedInUser="+"+gapi.auth2.getAuthInstance().currentUser.Ab.w3.U3,$(authorizeButton).addClass("hidden"),$(".table-inbox").removeClass("hidden"),makeTableSortable(),setTimeout(function(){listFiles()},1e3)):($(authorizeButton).removeClass("hidden"),$(".table-inbox").addClass("hidden"),$(".dataTables_filter").remove())}function handleAuthClick(e){gapi.auth2.getAuthInstance().signIn({scope:"profile email"}).then(function(e){try{loggedInUser="+"+e.w3.U3}catch(e){console.log("error",e)}})}function handleSignoutClick(e){gapi.auth2.getAuthInstance().signOut()}function appendPre(e,t){var n=e.mimeType,a="";a=n.indexOf("application/vnd.google-apps")>-1?"https://docs.google.com/"+(n=n.replace("application/vnd.google-apps.",""))+"/d/"+e.id+"/edit":"https://drive.google.com/file/d/"+e.id+"/edit";var i="<tr>\t\t\t<td>"+getMessageIndex(t.id)+'</td>\t\t\t<td><a target="_blank" href="'+a+'">'+e.name+"</a></td>\t\t\t<td>"+formatDate(t.createdTime)+"</td>\t\t\t<td>\t\t\t"+t.content+'</td>\t\t\t<td>\t\t\t\t<button data-dismiss="modal" data-toggle="modal" data-target="#reply-modal" \t\t\t\t\tid="'+t.id+'" class="btn btn-primary btn-sm" onclick="fillInReply(\''+e.name+"','"+escape(t.content)+"',this.id,'"+e.id+'\')">\t\t\t\tReply</button>\t\t\t<button id="resolve-'+t.id+'"  class="btn btn-primary btn-sm" onclick="markAsResolved(\''+t.id+"','"+e.id+"')\"> Mark As Resolved</button>\t\t\t</td>\t\t\t</tr>",l=$(".table-inbox").DataTable(),o=!0;try{o=new Date(t.createdTime)>=new Date($("#date").val())}catch(e){console.log(e)}0==$("#"+t.id).length&&o&&l.row.add($(i)).draw()}function markAsResolved(e,t){gapi.client.drive.replies.create({fileId:t,commentId:e,fields:"content",action:"resolve",content:"resolved"}).execute(function(t){console.log(t),"resolved"===t.content&&$("#resolve-"+e+",#"+e).attr("disabled","disabled")})}function sendReply(){return $("#reply-button").addClass("disabled"),sendMessage($("#reply-message-id").attr("fileId"),$("#reply-message-id").val(),$("#reply-message").val(),replyTidy),!1}function replyTidy(e){console.log("reply response "+e),$("#reply-modal").modal("hide"),$("#reply-message").val(""),$("#reply-button").removeClass("disabled")}function fillInReply(e,t,n,a){$("#reply-to").val(e),$("#reply-subject").val(unescape(t)),$("#reply-message-id").val(n),$("#reply-message-id").attr("fileId",a)}function sendMessage(e,t,n,a){return gapi.client.drive.replies.create({fileId:e,commentId:t,fields:"content",content:n}).execute(a)}function listFiles(){var e=$("#date").val();if("Invalid Date"!=new Date(e)){try{$(".table-inbox").DataTable().clear()}catch(e){console.log(e)}$(".table-inbox tbody").empty();var t=loadAllFiles;$("#date").css({borderColor:""});var n=new Date(e).toISOString().split(".")[0],a=function(e,i){e.execute(function(l){l.files=l.files||[],i=i.concat(l.files);var o=l.nextPageToken;o?(e=gapi.client.drive.files.list({q:"modifiedTime > '"+n+"'",pageSize:1e3,pageToken:o,userIp:"ActionItemsManager",fields:"nextPageToken, files(id, name, mimeType)"}),a(e,i)):t(i)})},i=gapi.client.drive.files.list({q:"modifiedTime > '"+n+"'",pageSize:1e3,userIp:"ActionItemsManager",fields:"nextPageToken, files(id, name, mimeType)"});a(i,[])}else $("#date").css({borderColor:"red"})}function loadAllFiles(e){if(e&&e.length>0){$(".overlay").show();for(var t=0;t<e.length;t++)!function(n){setTimeout(function(){listAllComments(e[n]),n+1==e.length&&$(".overlay").hide()},200*t)}(t)}else appendPre("No files found.")}function listAllComments(e){var t,n,a=e.id,i=loadAllComments,l=$("#date").val(),o=new Date(l).toISOString(),s=gapi.client.drive.comments.list({fileId:a,pageSize:100,userIp:"ActionItemsManager",fields:"nextPageToken, comments(id,content,htmlContent,resolved,createdTime)"});n=[],(t=s).execute(function(l){l.comments=l.comments||[],n=n.concat(l.comments);var s=l.nextPageToken;s?(t=gapi.client.drive.comments.list({fileId:a,pageSize:100,startModifiedTime:o,pageToken:s,userIp:"ActionItemsManager",fields:"nextPageToken, comments(id,content,htmlContent,resolved,createdTime)"}),getPageOfFiles(t,n)):i(e,n)})}function makeTableSortable(){try{$(".table-inbox").DataTable().clear(),$(".table-inbox").DataTable().destroy()}catch(e){console.log(e)}var e=$(".table-inbox").DataTable({paging:!1,rowReorder:!0,iDisplayLength:"All",order:[[0,"asc"]],bInfo:!1,columnDefs:[{targets:0,visible:!1},{orderable:!0,className:"reorder",targets:1,className:"mdl-data-table__cell--non-numeric"},{orderable:!0,className:"reorder",targets:2,className:"mdl-data-table__cell--non-numeric"},{orderable:!1,targets:"_all",className:"mdl-data-table__cell--non-numeric"}],fnInitComplete:function(e){var t=new Date,n=(t=new Date(t-daysDiff)).getFullYear(),a=t.getMonth()+1;a<10&&(a="0"+a);var i=t.getDate();i<10&&(i="0"+i);var l=n+"-"+a+"-"+i,o='<label style="width: 250px;">        \t\tSearch from : \t\t\t\t<input type="date" placeholder="mm/dd/yyyy" id="date" value="'+l+'">\t\t\t</label>';0==$("#date").length&&($(".dataTables_filter").append('<button id="refreshItem" onclick="listFiles();" class="btn btn-primary btn-sm" style="margin-left: 10px;">Refresh</button>'),$(".dataTable thead tr th:last").append(o),$(signoutButtonHtml).appendTo($(".dataTables_filter")),setTimeout(function(){(signoutButton=document.getElementById("signout_button")).onclick=handleSignoutClick},1e3),$("#date").change(listFiles)),firstTimeLoad&&(firstTimeLoad=!1,$("#date").val(l))}});e.on("row-reorder",function(e,t,n){var a=[];$(".table-inbox tbody tr").each(function(){var e=$(this).find('button[data-target="#reply-modal"]').attr("id");a.push(e)}),updateMessageOrder(a)}),$(".table-inbox thead tr").off("click","th"),$(".table-inbox thead tr").on("click","th",function(){var t=e.column(this).index();if(1==t||2==t){var n=[];$(".table-inbox tbody tr").each(function(){var e=$(this).find('button[data-target="#reply-modal"]').attr("id");n.push(e)}),updateMessageOrder(n)}})}function updateMessageOrder(e){messagesList=e}function getMessageIndex(e){return messagesList.indexOf(e)>-1?messagesList.indexOf(e):999999999999}function formatDate(e){var t="";try{t=e.replace("T"," ").split(".")[0]}catch(e){t=""}return t}function loadAllComments(e,t){if(t&&t.length>0){console.log(t);for(var n=0;n<t.length;n++){var a=t[n],i=a.content;!a.resolved&&i.indexOf(loggedInUser)>-1&&(a.content=i,appendPre(e,a))}}}function sleep(e){for(var t=(new Date).getTime(),n=0;n<1e7&&!((new Date).getTime()-t>e);n++);}