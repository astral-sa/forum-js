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

/**
 * Fancy new PM popup
 */
function confirm_newpm() {
	var pmDialog = $('<div id="pm-confirm" title="VERY IMPORTANT FORUMS ANNOUNCEMENT!"><span class="ui-icon ui-icon-alert" style="float:left; margin:15px 12px 15px 0;"></span><p style="outline:none;" tabindex=-1 autofocus>You have received a new private message!</p></div>');
	pmDialog.appendTo('body');
	$("#pm-confirm").dialog({
		create: function(event) {
			$(event.target).parent().css('position', 'fixed');
		},
		dialogClass: 'sa-dialog',
		resizable: false,
		height: "auto",
		width: "auto",
		modal: false,
		position: { my: "center", at: "center", of: window },
		buttons: {
			"Open in new tab": function() {
				window.open("/private.php", "_blank");
				$(this).dialog("close");
			},
			"Open in this tab": function() {
				window.location.href = "/private.php";
				$(this).dialog("close");
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	});
	$(window).resize(function() {
		if ($('#pm-confirm').dialog('isOpen'))
			$("#pm-confirm").dialog({position: { my: "center", at: "center", of: window }});
	});
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
    var rx_b = new RegExp(/^\(USER WAS (?:BANNED|AUTOBANNED|PERMABANNED|PUT ON PROBATION) FOR THIS POST\)$/);
    $(posts).each(function(i, el) {
        try {
            var punishmentSelector = "td.postbody > b:last";
            var td_u = $(el).find("td.userinfo").get(0);
            if (!td_u) {
                // Try FYAD template
                td_u = $(el).find("div.userinfo").get(0);
                punishmentSelector = "div.funbox > b:last";
            }
            var uid = td_u.className.match(/\buserid\-(\d+)\b/)[1];
            $(td_u).data('userid', uid);

            var postid = el.id.match(/\bpost(\d+)\b/)[1];
            $(el).data({ 'userid':uid, 'postid':postid });
            $(el).find(punishmentSelector).filter(function(i, el) {
                return !!$(el).text().match(rx_b);
            }).wrapInner('<a href="/banlist.php?userid=' + $(el).data('userid') + '#frompost' + $(el).data('postid') + '" />');
        } catch(e) {
            /* do nothing */
        }
    });

    /* 2016 - video & twitter embedding */
    // Small function that tests whether a browser supports WebM embeds
    var canEmbedWebM = function() {
        return (!!document.createElement('video').canPlayType && (document.createElement('video').canPlayType('video/webm; codecs="vp8, vorbis"') === 'probably'));
    };
    // Small function to add sources
    var addVideoSources = function(href, ext){
        var vidExtRegex = new RegExp('\\' + ext + '$');
        return '<source src="' + href.replace(vidExtRegex,'.mp4')+'" type="video/mp4">' +
                   '<source src="' + href.replace(vidExtRegex,'.webm')+'" type="video/webm">';
    };
    // Enforce controls for mobile clients
    var vidControls = window.SA.utils.isMobile ? 'controls ' : '';

    // Link processing for gifv/webm/mp4/twitter/etc
    var postLinks = $('td.postbody a');
    if (/^\/?(?:newreply|editpost|newthread)\.php/i.test(window.location.pathname)) {
        // Hook up quote/edit/post previews.
        postLinks = postLinks.add('div.inner.postbody a');
    }
    // Ignore things we shouldn't convert
    postLinks = postLinks.not(".postbody:has(img[title=':nws:']) a").not(".postbody:has(img[title=':nms:']) a");
    postLinks = postLinks.not('.bbc-spoiler a');

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

    /**
     * Leper's Colony punishment highlighting
     */
    if (/^\/?banlist\.php/i.test(window.location.pathname)) {
        // Are we looking for punishments from a specific post?
        var fromPost = window.location.hash.match(/^#frompost(\d+)/i);
        if (fromPost) {
            var scrolledYet = false;
            var banTableRows = $('table.standard.full tr[data-postid]');
            banTableRows.each(function() {
                var banRow = $(this);
                if (banRow.data('postid').toString() === fromPost[1]) {
                    $(this).addClass('highlighted-punishment');
                    if (!scrolledYet) {
                        scrolledYet = true;
                        var sel = 'body,html';
                        $(sel).animate({'scrollTop': banRow.offset().top}, 150);
                    }
                }
            });
            // add #frompost + postid to nav links in case the punishment line is on another page
            var banListNavLinks = $('div.mqnav a');
            banListNavLinks.each(function() {
                if ($(this).prop('hash') === '')
                    $(this).prop('hash', '#frompost' + fromPost[1]);
            });
            var banListSelect = $('div.pages select');
            banListSelect.each(function() {
                $(this).attr('data-addhash', '#frompost' + fromPost[1]);
            });
        }
    }

    try {
        twemoji.parse(document.body, {
            callback: function(icon, options, variant) {
                switch (icon) {
                    case 'a9': // Â© copyright
                    case 'ae': // Â® registered trademark
                    case '2122': // â„¢ trademark
                        return false;
                }
                return ''.concat(options.base, options.size, '/', icon, options.ext);
            }
        });
    } catch (e) {
        console.log("Twemoji wasn't defined! It's probably blocked by your browser.");
    }
});

function add_whoposted_links() {
    $('#forum.threadlist tr.thread').each(function(i,el) {
        try {
            var threadid = el.id.match(/^thread(\d+)$/)[1];
            $('td.replies', el).wrapInner('<a href="/misc.php?action=whoposted&amp;threadid=' + threadid + '" target="_blank" title="List users that posted in this thread" />');
        } catch(e) {}
    });
}

