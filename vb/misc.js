// misc old crap

function newposts(threadid) {
	window.location.href = '/showthread.php?goto=newpost&threadid=' + threadid;
}

function validate_pm(theform, pmmaxchars) {
	if (theform.message.value=="" || theform.touser.value=="") {
		alert("Please complete the recipient and message fields.");
		return false; }
	if (pmmaxchars != 0) {
		if (theform.message.value.length > (pmmaxchars/2)) {
			alert("Your message is too long.\n\nReduce your message to "+(pmmaxchars/2)+" characters.\nIt is currently "+theform.message.value.length+" characters long.");
			return false; }
		else { return true; }
	} else { return true; }
}

function confirm_newpm() {
	input_box=confirm("You have a new private message. Click OK to view it, or cancel to hide this prompt.");
	if (input_box==true) { // Output when OK is clicked
		second_box=confirm("Open in new window?\n\n(Press cancel to open in the current window.)");
		if (second_box==true) {
			window.open('private.php', 'pmnew');
		} else {
			window.location="private.php";
		}
	} else {
	// Output when Cancel is clicked
	// ^^ wtf is this gayness
	}
}

// select posticon on post screens
function posticon_sel(id) {
	document.vbform.iconid.item(id).checked = true;
}

// used on post form
function validate(form, maxchars) {
	var subject = form.elements.namedItem('subject');
	if(subject && form.subject.value == '') {
		alert("Please complete the subject field, shithead.");
		return false;
	}

	var message = form.elements.namedItem('message');
	if(message && form.message.value == '') {
		alert("Please complete the message field, shithead.");
		return false;
	}

	if(maxchars != 0 && message.length > maxchars) {
		alert("Your message is too long.\n\nReduce your message to " + maxchars + " characters.\nIt is currently "+form.message.value.length+" characters long.\n  Are you trying to spam?\n  If so, then STOP!");
		return false;
	}
	return true;
}

// used on post form
function checklength(theform, postmaxchars) {
	if(!postmaxchars) postmaxchars = 0;
	if (postmaxchars != 0) { message = "\nThe maximum permitted length is " + postmaxchars + " characters."; }
	else { message = ""; }
	alert("Your message is "+theform.message.value.length+" characters long."+message);
}

function rate_thread(goldenmanbabies) {
	document.rateform.vote.value = goldenmanbabies;
	document.rateform.submit();
}

function reloadCaptcha() { document.images['captcha'].src = 'captcha.php?'+Math.random(); }

// if(typeof dojo != 'undefined') {
// 	dojo.require("dojo.lang.declare");

// 	dojo.declare('flag_rotator', null, {
// 		initialized: false,
// 		node: null,
// 		timer: null,
// 		ticktime: 60,
// 		forumid: 0,

// 		initializer: function(forumid, placeholder_node) {
// 			this.node = dojo.byId(placeholder_node);
// 			this.forumid = forumid;
// 			if(!this.node || this.forumid < 1) return;

// 			/* if the user has a cookie named 'flag_timer', assume the value is number of tick seconds for the flag rotation */
// 			var cookietime;
// 			if((cookietime = dojo.io.cookie.get('flag_timer')) > 0) this.ticktime = cookietime;
// 			if(this.ticktime < 1) return;
// 			if(this.ticktime < 15) this.ticktime = 15;

// 			dojo.require("dojo.lang.timing.Timer");
// 			this.timer = new dojo.lang.timing.Timer( this.ticktime * 1000 );
// 			dojo.event.connect(this.timer, 'onTick', dojo.lang.hitch(this, 'rotate'));

// 			this.img = document.createElement('img');
// 			this.img.style.display = 'none';
// 			this.img.className = 'flag';
// 			this.node.appendChild(this.img);

// 			this.initialized = true;
// 		},

// 		go: function() {
// 			if(!this.initialized) return;
// 			this.timer.start();
// 			this.rotate();
// 		},

// 		rotate: function() {
// 			dojo.io.bind({
// 				url: '/flag.php?forumid=' + this.forumid,
// 				mimetype: 'text/javascript',
// 				load: dojo.lang.hitch(this, function(type, data) {
// 					var obj = data['flags'][0];
// 					var url = 'http://fi.somethingawful.com/flags' + obj.path + '?by=' + encodeURIComponent(obj.owner);
// 					var title = "This flag proudly brought to you by '" + obj.owner + "' on " + obj.created;
// 					this.show_image(url, title);
// 				}),
// 				error: function(t, d) {}
// 			});
// 		},

// 		show_image: function(url, title) {
// 			this.img.src = url;
// 			this.img.title = title;
// 			this.img.style.display = 'block';
// 		}
// 	});

// 	dojo.addOnLoad(function() {
// 		var fpdiv = dojo.byId('flag_container');
// 		if(!fpdiv) {
// 			fpdiv = document.createElement('div');
// 			fpdiv.id = 'flag_container';

// 			var bdivs = dojo.html.getElementsByClassName('breadcrumbs');
// 			if(bdivs.length < 1) return;
// 			dojo.dom.insertBefore(fpdiv, bdivs[0]);
// 		}

// 		if(typeof rotate_forumid == 'undefined' || !rotate_forumid) return;
// 		flagro = new flag_rotator( rotate_forumid, fpdiv );
// 		flagro.go();
// 	});
// }

// var posticon_clickmaster = {
// 	forumid: null,

// 	setforumid: function(forumid) {
// 		this.forumid = forumid;
// 	},

// 	make_clicky: function(container) {
// 		var threads = dojo.byId(container);
// 		var icons = dojo.html.getElementsByClassName('icon', threads, 'td');
// 		for(i = 0; i < icons.length; i++) {
// 			var picon = dojo.dom.getFirstChildElement(icons[i], 'img');
// 			picon.style.cursor = 'pointer';
// 			picon.title = 'click to filter threads by this icon';
// 			dojo.event.connect(picon, 'onclick', this, 'handle_click');
// 		}
// 	},

// 	handle_click: function(e) {
// 		var iconid = e.currentTarget.src.split(/#/)[1];
// 		window.location = '/forumdisplay.php?forumid=' + this.forumid + '&posticon=' + iconid;
// 	}
// };

// var bookmark_button = {
// 	img: null,
// 	bottomlink: null,
// 	threadid: 0,
// 	img_bookmarked: 'http://fi.somethingawful.com/images/buttons/button-bookmark.gif',
// 	img_notbookmarked: 'http://fi.somethingawful.com/images/buttons/button-unbookmark.gif',

// 	init: function(img, threadid) {
// 		this.img = img;
// 		this.bottomlink = dojo.byId('bookmark_link');
// 		this.threadid = threadid;
// 		this.img.onclick = dojo.lang.hitch(this, this.handle_click);
// 		this.bottomlink.firstChild.onclick = dojo.lang.hitch(this, this.handle_click);
// 		this.bottomlink.firstChild.style.cursor = this.img.style.cursor = 'pointer';
// 		this.bottomlink.firstChild.style.borderBottom = '1px #666 solid';
// 		this.bottomlink.firstChild.innerHTML = (dojo.html.hasClass(this.img, 'unbookmark') ? 'Unb' : 'B') + 'ookmark this thread';
// 		this.opaque();
// 		this.show();
// 	},

// 	show: function () { this.bottomlink.style.display = 'block'; this.img.style.display = 'inline'; },
// 	hide: function () { this.bottomlink.style.display = this.img.style.display = 'none'; },
// 	fade: function () { this.bottomlink.style.opacity = this.img.style.opacity = '0.4' },
// 	opaque: function () { this.bottomlink.style.opacity = this.img.style.opacity = '1.0' },

// 	handle_click: function() {
// 		this.img.onclick = function() {};
// 		this.bottomlink.firstChild.onclick = function() {};
// 		this.fade();

// 		var body = new Object();
// 		body.threadid = this.threadid;
// 		body.action = dojo.html.hasClass(this.img, 'unbookmark') ? 'remove' : 'add';
// 		this.bottomlink.firstChild.innerHTML = (dojo.html.hasClass(this.img, 'unbookmark') ?  'Unb' : 'B') + 'ookmark this thread';
// 		body.json = 1;

// 		dojo.io.bind({
// 			method: 'POST',
// 			content: body,
// 			url: '/bookmarkthreads.php',
// 			load: dojo.lang.hitch(this, function(type, res) {
// 				this.img.onclick = dojo.lang.hitch(this, this.handle_click);
// 				this.bottomlink.firstChild.onclick = dojo.lang.hitch(this, this.handle_click);
// 				this.bottomlink.firstChild.innerHTML = (res.bookmarked ?  'Unb' : 'B') + 'ookmark this thread';
// 				this.img.src = this['img_' + (res.bookmarked ? 'not' : '') + 'bookmarked'];
// 				this.img.className = res.bookmarked ? 'unbookmark' : 'bookmark';
// 				this.opaque();
// 			}),
// 			error: dojo.lang.hitch(this, function(type, res) {
// 				alert("Failed to alter bookmark");
// 				this.opaque();
// 			}),
// 			mimetype: 'text/javascript'
// 		});
// 	}
// };

/* 7/22/10: this adds 'Rap Sheet' link below posts and makes "(USER WAS BANNED...)" text clickable */
$(document).ready(function() {
	var posts = $("#thread table.post");
	$(posts).each(function(i, el) {
		try {
			var td_u = $(el).find("td.userinfo").get(0);
			var uid = td_u.className.match(/\buserid\-(\d+)\b/)[1];
			$(td_u).data('userid', uid);

			var postid = el.id.match(/\bpost(\d+)\b/)[1];
			$(el).data({ 'userid':uid, 'postid':postid });

			var ul = $(el).find("tr td.postlinks ul.profilelinks");
			var pos = (ul.find("li").length >= 3) ? 2 : 1;
			$(ul).find("li:eq("+pos+")", ul).after("\n" + '<li><a href="/banlist.php?userid=' + uid + '">Rap Sheet</a></li>');
		} catch(e){};
	});

	var rx_b = new RegExp(/^\(USER WAS (?:BANNED|PUT ON PROBATION) FOR THIS POST\)$/);
	$(posts).each(function(i, el) {
		try { $(el).find("td.postbody > b:last").filter(function(i, el) {
			return !!$(el).text().match(rx_b)
		}).wrapInner('<a href="/banlist.php?userid=' + $(el).data('userid') + '" />') } catch(e) {};
	});

	// make cancerous posts show normally on mouseover
	$("td.postbody .cancerous").closest("td").hover(
		function(e) { $(".cancerous", this).addClass('hover') },
		function(e) { $(".cancerous", this).removeClass('hover') }
	);
});

function add_whoposted_links() {
	$('#forum.threadlist tr.thread').each(function(i,el) {
		try {
			var threadid = el.id.match(/^thread(\d+)$/)[1];
			$('td.replies', el).wrapInner('<a href="/misc.php?action=whoposted&amp;threadid=' + threadid + '" target="_blank" title="List users that posted in this thread" />');
		} catch(e) {};
	});
}

