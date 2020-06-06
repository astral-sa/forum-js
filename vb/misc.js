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

/*
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
*/

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
	var message;
	if (!postmaxchars)
		postmaxchars = 0;
	if (postmaxchars != 0) {
		message = "\nThe maximum permitted length is " + postmaxchars + " characters.";
	}
	else {
		message = "";
	}
	alert("Your message is "+theform.message.value.length+" characters long."+message);
}

function rate_thread(goldenmanbabies) {
	document.rateform.vote.value = goldenmanbabies;
	document.rateform.submit();
}

function reloadCaptcha() { document.images['captcha'].src = 'captcha.php?'+Math.random(); }


/* 7/22/10: this makes "(USER WAS BANNED...)" text clickable */
$(document).ready(function() {
    var posts = $("#thread table.post");
    var rx_b = new RegExp(/^\(USER WAS (?:BANNED|PUT ON PROBATION) FOR THIS POST\)$/);
    $(posts).each(function(i, el) {
        try {
            var td_u = $(el).find("td.userinfo").get(0);
            var uid = td_u.className.match(/\buserid\-(\d+)\b/)[1];
            $(td_u).data('userid', uid);

            var postid = el.id.match(/\bpost(\d+)\b/)[1];
            $(el).data({ 'userid':uid, 'postid':postid });
            $(el).find("td.postbody > b:last").filter(function(i, el) {
                return !!$(el).text().match(rx_b);
            }).wrapInner('<a href="/banlist.php?userid=' + $(el).data('userid') + '" />');
        } catch(e) {
            /* do nothing */
        }
    });

	// make cancerous posts show normally on mouseover
	$("td.postbody .cancerous").closest("td").hover(
		function(e) { $(".cancerous", this).addClass('hover'); },
		function(e) { $(".cancerous", this).removeClass('hover'); }
	);

    /* 2016 - video & twitter embedding */
    // Small function that tests whether a browser supports WebM embeds
    var canEmbedWebM = function() {
        return (!!document.createElement('video').canPlayType && (document.createElement('video').canPlayType('video/webm; codecs="vp8, vorbis"') === 'probably'));
    };
    // Small function to add sources
    var addVideoSources = function(href, ext){
        return '<source src="' + href.replace(ext,'.mp4')+'" type="video/mp4">' +
                   '<source src="' + href.replace(ext,'.webm')+'" type="video/webm">';
    };
    // Enforce controls for mobile clients
    var vidControls = window.SA.utils.isMobile ? 'controls ' : '';

    // Link processing for gifv/webm/mp4/twitter/etc
    var postLinks = $('td.postbody a');
    // Ignore things we shouldn't convert
    postLinks = postLinks.not("td.postbody:has(img[title=':nws:']) a").not(".postbody:has(img[title=':nms:']) a");
    postLinks = postLinks.not('td.bbc-spoiler a');
    postLinks.each(function() {
        // Don't auto-embed if there's non-link inner text
        if (!/^http/.test($(this).text()))
            return; 
        // Check for possible gif-likes
        var vidExtMatch = this.pathname.match(/(\.gifv|\.webm|\.mp4)$/i);
        if (vidExtMatch) {
            if (/(www\.|i\.)imgur.com$/i.test(this.hostname)) {
                // Direct link to an imgur gif-like video
                $(this).replaceWith('<div class="gifv_video"><video autoplay ' + vidControls + 'loop muted="true" poster="' + $(this).attr('href').replace(vidExtMatch[1],'h.jpg') + '">' +
                    addVideoSources($(this).attr('href'), vidExtMatch[1]) +
                    '</video></div>');
            }
            else if (/gfycat.com$/i.test(this.hostname)) {
                var gfyMatch = this.pathname.match(/([A-Za-z]+)(?:\/*)?/i);
                if (!gfyMatch)
                    return;
                var gfyLink = this;
                $.ajax({url:"https://api.gfycat.com/v1/gfycats/" + gfyMatch[1],
                        dataType: 'json',
                        success: function(data) {
                            if (data.gfyItem)
                                $(gfyLink).replaceWith('<div class="gfy_video"><video autoplay ' + vidControls + 'loop muted="true" poster="https://thumbs.gfycat.com/' + gfyMatch[1] + '-poster.jpg">' +
                                    '<source src="' + data.gfyItem.mp4Url +'" type="video/mp4">' +
                                    '<source src="' + data.gfyItem.webmUrl +'" type="video/webm">' +
                                    '</video></div>');
                        }
                });
            }
            else {
                // Not a gif-like - treat any of these as a regular video
                if ((/\.gifv$/i).test(this.pathname)) {
                    return;
                }
                else if ((/\.webm$/i).test(this.pathname)) {
                    // Don't try to embed if the browser doesn't support webms
                    if (canEmbedWebM()) {
                        // Slip in an .mp4 source along with it anyway
                        $(this).replaceWith('<div class="sa_video"><video preload="metadata" controls>' +
                            addVideoSources($(this).attr('href'), vidExtMatch[1]) +
                            '</video></div>');
                    }
                }
                else {
                    $(this).replaceWith('<div class="sa_video"><video preload="metadata" controls>' +
                        addVideoSources($(this).attr('href'), vidExtMatch[1]) +
                        '</video></div>');
                }
            }
        }
        else {
            // Check for Twitter
            var twMatch = $(this).attr('href').match(/^(?:https|http):\/\/(?:mobile\.)?twitter.com\/[0-9a-zA-Z_]+\/(?:status|statuses)\/([0-9]+)/);
            if (twMatch == null)
                return;
            var tweetId = twMatch[1];
            var link = this;
            $.ajax({url:"https://api.twitter.com/1/statuses/oembed.json?id="+tweetId,
                    dataType: 'jsonp',
                    success: function(data) {
                        link = $(link).wrap("<div class='tweet'>").parent();
                        $(link).html(data.html);
                    }
            });
        }
    });

});

function add_whoposted_links() {
	$('#forum.threadlist tr.thread').each(function(i,el) {
		try {
			var threadid = el.id.match(/^thread(\d+)$/)[1];
			$('td.replies', el).wrapInner('<a href="/misc.php?action=whoposted&amp;threadid=' + threadid + '" target="_blank" title="List users that posted in this thread" />');
		} catch(e) {}
	});
}

