
var imgpath = "http://fi.somethingawful.com/modqueue/";

var img_mqok = new Image();
var img_mqno = new Image();
var img_mqok_checked = new Image();
var img_mqno_checked = new Image();

img_mqok.src = imgpath + 'mq_ok.gif';
img_mqno.src = imgpath + 'mq_no.gif';
img_mqok_checked.src = imgpath + 'mq_ok_checked.gif';
img_mqno_checked.src = imgpath + 'mq_no_checked.gif';

var count_ok = 0;
var count_no = 0;
var count_total = 0;

function getform() {
	return document.getElementById("mq");
}

function toggle_state(id, state) {
	var fe_state = getform().elements['state['+id+']'];
	set_state(id, ( state == fe_state.value ? 0 : state ));
	update_status();
}

function set_state(id, state) {
	var fe_state = getform().elements['state['+id+']'];
	clear_state(id);
	//if((state == 1 && bool) || (state == 2 && !bool)) return;
	//fe_state.value = ( bool ? 1 : 2 );
	fe_state.value = ( state );
}

function clear_state(id) {
	getform().elements['state['+id+']'].value = 0;
}

function update_status() {
	var mqform = getform();
	if(!mqform) return;
	count_ok = count_no = count_total = 0;
	for(i = 0; i < mqform.elements.length; i++) {
		//if(mqform.elements[i].getAttribute('type') != 'hidden') continue;
		if(mqform.elements[i].name.substring(0,6) != 'state[') continue;
		var id = mqform.elements[i].name.substring(6);
		id = id.substring(0, id.length - 1);
		var state = mqform.elements[i].value;
		count_total++;
		if(state == 1) count_ok++;
		if(state == 2) count_no++;
		set_img(id, state);
	}
	make_status( get_counts() );
}

function get_counts() {
	return new Array(count_ok, count_no, count_total);
}

function set_img(id, state) {
	get_img(id,1).src = ( state == 1 ? img_mqok_checked.src : img_mqok.src );
	get_img(id,0).src = ( state == 2 ? img_mqno_checked.src : img_mqno.src );
}

function get_img(id, state) {
	return document.getElementById('mq' + (state?'ok':'no') + id);
}

function preview(usertitle) {
	var features, w = 300, h = 300;
	var top = (screen.height - h)/2, left = (screen.width - w)/2;
	if(top < 0) top = 0;
	if(left < 0) left = 0;
	features = 'top=' + top + ',left=' +left;
	features += ',height=' + h + ',width=' + w + ',resizable=yes';

	var preview = window.open('/modqueue.php?action=previewtitle&usertitle=' + escape(usertitle), 'preview', features);

	/*
	var preview = window.open('', 'preview', features);
	with(preview.document) {
		open("text/html", "replace");
		write("<html><head><title>Title Preview</title></head><body builder>");
		write("<font face='Verdana,Arial' size='-1'>");
		write("<b>User Title Preview:</b>");
		write ("<hr>");
		write(usertitle);
		write("<hr>");
		write("<div align='right'><a href='javascript:window.close();'>Close Window</a></div>");
		write("</body></html>");
		close();
	}
	*/
}

function mass_change(state, change_declines) {
	var mqform = getform();
	for(i = 0; i < mqform.elements.length; i++) {
		if(mqform.elements[i].name.substring(0,6) != 'state[') continue;
		var curstate = mqform.elements[i].value;
		if(curstate == 2 && !change_declines) continue;
		var id;
		id = mqform.elements[i].name.substring(6);
		id = id.substring(0, id.length - 1);
		state ? set_state(id, state) : clear_state(id);
	}
	update_status();
}

function make_status(stats) {
	if(!(div = dojo.byId('status_div'))) {
		var div = document.createElement('div');
		div.id = "status_div";
		//div.innerText = '';
		dojo.dom.prependChild(div, dojo.byId('mq'));

		var status = document.createElement('div');
		status.id = "status_text";
		div.appendChild(status);

		var approveAll = document.createElement('div');
		approveAll.className = 'queue_cmd';
		approveAll.innerHTML =
			'<div class="process_button"><input type="submit" value="Process Queue &gt;&gt;"></div>' +
			'<a href="javascript:mass_change(1, true);">Approve All</a> | ' +
			'<a href="javascript:mass_change(1, false);">Approve Remaining</a> | ' +
			'<a href="javascript:mass_change(0, true);">Reset All</a>';
		div.appendChild(approveAll);
	}
	var status = dojo.byId('status_text');
	txt = document.createTextNode('Showing ' + stats[2] + ' total pending (' + stats[0] + ' set to approve, ' + stats[1] + ' set to decline)');
	dojo.dom.replaceChildren(status, txt);
}

function mq_adjust_datesel() {
	$('select.datechooser').attr('disabled', ($('#filt_status_0').attr('checked')));
}

$(document).ready(function() {
	var $dialog_confirm = $('<div id="retract_confirm" />');
	$dialog_confirm.appendTo('body');
	var $dialog_confirm_msg = $('<div class="retract-message"/>').appendTo($dialog_confirm);
	var $retract_pb = $('<div class="ui-pb" />').appendTo($dialog_confirm).progressbar({ value: 100 });

	$dialog_confirm.dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		title: "Retraction Request",
		dialogClass: 'retract-confirm'
	});

	$('td.retractable').each(function() {
		var $tr_request = $(this).parent('tr.request');
		var requestid = $tr_request.get(0).className.match(/\brequest-(\d+)/)[1];
		$(this).append('<div class="retract-ctl">retract</div>').click(function() {
			$dialog_confirm.dialog('option', 'buttons', {
				'Retract': function() {
					$retract_pb.show();
					$dialog_confirm_msg.html('Please wait while your request is processed...');
					$dialog_confirm.dialog('option', { buttons: {} });
					setTimeout(function() {
						$.ajax({
							cache: false,
							dataType: 'json',
							timeout: 10000,
							type: 'GET',
							url: '/modqueue.php',
							data: { action: 'retract', requestid: requestid },
							success: function(data) {
								var msg = '';
								if(data.error) msg = '<b>Error!</b><br>';
								msg = msg + data.message;
								$dialog_confirm_msg.html(msg);

								$tr_request.removeClass('queued').addClass('retracted');
								$tr_request.find('td.status h3').text('retracted');
								$tr_request.find('td.status .retract-ctl').remove();
							},
							error: function(xhr, msg) {
								$dialog_confirm_msg.html('<b>Error!</b><br>Your request could not be completed');
							},
							complete: function() {
								$retract_pb.hide();
								$dialog_confirm.dialog('option', { buttons: { 'Close': function() { $(this).dialog('close') } } });
							}
						});
					}, 1000);
				},
				'Cancel': function() {
					$(this).dialog('close');
				}
			});

			$retract_pb.hide();
			$dialog_confirm_msg.html('Are you sure you want to retract this request?');
			$dialog_confirm.dialog('open');
		});
	});

});

