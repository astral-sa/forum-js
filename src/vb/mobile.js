$(function () {
    // Testing sync
    // Load mobile style sheet
    $('head').append("<link rel=\"stylesheet\" type=\"text/css\" href=\"./css/mobile.css\">");
    // $('head').append("<link rel=\"stylesheet\" href=\"https://s3.amazonaws.com/icomoon.io/46988/UntitledProject1/style.css?uyhev2\">");
    $('head').append("<link rel=\"stylesheet\" href=\"https://s3.amazonaws.com/icomoon.io/46988/What/style.css?qk5wo6\">");

    $('head').append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">");
    $('head').append("<script type=\"text/javascript\" src=\"https://forums.somethingawful.com/js/vb/spn.js\"></script>");
    // $('head').append("<link rel=\"stylesheet\" type=\"text/css\" href=\"https://drive.google.com/open?id=0B72oTkmUPNFrcHI1b3g1X1haNjQ\">");

    // Add top title bar by replacing stuff in globalmenu
    $('#container').before('<div class="toptitle"></div>');
    $('.toptitle').append("<a href='index.php' class='toplinkboner'><img id='title_image' src='http://i.somethingawful.com/images/mobile-grenade-31x45.png' alt='Something Awful Forums'><div class='toptitletext'>Something Awful</div></a><div class='toptitlerightbuttons'><a href='#' class='toptitlepurchase purchase-popout'></a><a href='#' class='toptitleoptions navigation-popout'></a></div>");

    // Mobile toggle
    // Let user change to desktop mode
    $('.toptitlerightbuttons').before("<div class='desktopmodecontainer'><a href='#' class='desktopmode'></a></div>");
    $('a.desktopmode').click(function(event) {
      $.get("https://forums.somethingawful.com/member.php?action=editoptions",
    	function(data) {
    		$form = $(data).find("#content").find("form");
    		$form.find('input[name="mobilelayout"]')[0].checked = false;
    		$.post('member.php', $form.serialize(),
    		function(returnedData) {
    			location.reload();
    			});
    		}
       );
    });

    // Replace the already used top class in pages with something else
    $('div.pages.top').switchClass('top', 'topbigbutts');

    // Remove announcements tbody
    if ($('.announcement').length > 0) {

    	$('#thread tr[valign]').each(function () {
    		$(this).wrapAll('<table class="post"><tbody>');
    	});

    	// $('#thread table:eq(0)').contents().unwrap();
    	// HOLY SHIT WHY DOES COMMENTING THIS OUT CAUSE THE DATE TO DISAPPEAR????
    	$('#thread tbody:eq(0)').contents().unwrap();
    }


    // Remove bottom navigation
    $('ul.navigation:eq(1)').remove();

    // Forum home page
    $('#info').remove();
    $('.forumhome .icon').remove();
    $('.moderators').remove();

    // Clean up nested formatting in top line

    // Change text for logout
    // $('.mainbodytextsmall a').siblings().remove();
    $('.mainbodytextsmall').contents().filter(function () {
        return this.nodeType === 3;
    }).remove();
    $('.mainbodytextsmall b a').after('&nbsp;&nbsp;-&nbsp;&nbsp;');
    $('.mainbodytextsmall a b').html('Log out');

    // $('.mainbodytextsmall a b').append("<span aria-hidden='true' data-icon='&#xe600;' class='icon-home'></span>");

    // Remove extra text in PM box
    $('#pm td a').siblings().remove();
    $('#pm td').contents().filter(function () {
        return this.nodeType === 3;
    }).remove();

    $('#index .mainbodytextsmall').appendTo('#pm td');

    // Put a copy of the forumbar above the forums
    $('.forumbar').clone().insertBefore('table#forum');

    // Give classes to forumdisplay forumbars
    $('.forumbar').eq(0).addClass('topforumbar');
    $('.forumbar').eq(1).addClass('bottomforumbar');

    // Change first purchase selection
    // $("ul#nav_purchase").prepend('<li><a>Purchase Something!</a></li>');

    // Change purchase section to dropdowns
    // selectifyList($('ul#nav_purchase')).addClass("dropdown_purchase");

    // Change first navigation selection
    $('ul#navigation').prepend('<li><a href="/bookmarkthreads.php">Forum Bookmarks</a></li>');
    // $('ul#navigation').prepend('<li><a>Forum Navigation</a></li>');

    // Change navigation section to dropdowns
    // selectifyList($('ul.navigation')).addClass("dropdown_navigation");

    // Wrap div around nav dropdowns
    // $("select.dropdown_purchase:eq(0)" ).wrapAll("<div class='top_dropdown_purchase_group' />");
    $("select.dropdown_navigation:eq(0)" ).wrapAll("<div class='top_dropdown_navigation_group' />");
    // Put containers around them
    $("[class^=top_dropdown]").wrapAll("<div class='top_dropdown_menu' />");

    // Remove Subforums text
    $('.subforums b').remove();
    $('.subforums:contains(" (None)")').each(function () {
        $(this).html($(this).html().split(" (None)").join(""));
    });

    // Remove link to archives until I get it working
    $('form#ac_timemachine').remove();

    // Give special class to bottom dropdown_navigation
    $('#container select.dropdown_navigation:eq(1)').addClass('bottom_navigation');

    // Add bottom_forms class to bottom forms which inexplicably don't have it on the PM dir, because radium sucks
    $('.privfolder form.forum_jump').wrapAll("<div class='bottom_forms'></div>");
    $('#container select.bottom_navigation').appendTo('div.bottom_forms');

    // Forum view
    // Remove thread views
    $('.views').remove();

    // Move thread replies
    $('th.replies').remove();
    $('td.replies').remove();

    // If there are not multiple pages in a thread, add a class to threadbar_top to make the margin smaller
    $('div.breadcrumbs').each(function () {
    	if ($('div.pages.topbigbutts select').length > 0) {
    		$('div.threadbar.top').addClass('has_pages');
    	}
    });

    // Rename Film Dump star column
    $('.forum_133 td.rating').wrapInner('<div></div>');
    $('.forum_133 td.rating').attr('class', 'rating_star');
    $('.forum_133 td.votes').remove();

    // Strip average review score from movie review forum, output as text
    $('.rating_star div img').each(function(idx, elem) {
      elem = $(elem);
      var title = elem.attr('title');
      if (!title) return;

      var rating = title.split(' - ')[1];
      var avgrating = rating.split(' average')[0];
      var threedigitscore = avgrating.substring(0,3);
      elem.replaceWith(threedigitscore);
    });

    // Color score rating background
    $('td.rating_star div').each(function () {
    var rating = $(this);
    var target = $(this).text();
    var rating_onedigit = target.charAt(0);
    	if (rating_onedigit === '0') {
    		$(this).css('visibility', 'hidden');
    	}
    	else if (rating_onedigit === '1') {
    		$(this).addClass("rated1");
    		$(this).wrapInner("<div class='rating_background' />");
    	}
    	else if (rating_onedigit === '2') {
    		$(this).addClass("rated2");
    		$(this).wrapInner("<div class='rating_background' />");
    	}
    	else if (rating_onedigit === '3') {
    		$(this).addClass("rated3");
    		$(this).wrapInner("<div class='rating_background' />");
    	}
    	else if (rating_onedigit === '4') {
    		$(this).addClass("rated4");
    		$(this).wrapInner("<div class='rating_background' />");
    	}
    	else if (rating_onedigit === '5') {
    		$(this).addClass("rated5");
    		$(this).wrapInner("<div class='rating_background' />");
    	}
    	else {
    		$(this).css('visibility', 'hidden');
    	}
    });

    // Turn thread star images into text
    $("td.rating img[src *= 'stars.gif']").replaceWith(function () {
        return $(this).attr('src').match(/(\d)stars\.gif/)[1];
    });

    // Change background color of PM box if user has a new message
    $('.forumhome a[title="Click Here to Open Your Private Messages "] b').addClass('pmarea');
    $('.forumhome a[title="Click Here to Open Your Private Messages "]').addClass('pmareamain');

    // Change background color of PM row if message is new
    if($('.forumhome').length > 0) {
    	var messagetotal = $('.forumhome a.pmareamain b')[0].nextSibling.nodeValue;
    	var messagecheck = messagetotal.charAt(2);
    	console.log(messagetotal);
    	console.log(messagecheck);
    	if (messagecheck !== '0') {
    		$('body.forumhome #pm td').addClass('newpmcolor');
    	}
    }

    /*
    $('.privfolder td.title').each(function () {
    var looking = $(this);
    	if (looking.find('.privatemessage_new').length) {
    	$(this).addClass('newMessageRow');
    	}
    });
    */

    // Change background color of PM row if message is new
    $('.privatemessage_new').each(function () {
    	$(this).closest('td').find('.title').addClass('newMessageRow');
    });

    // Change background color dependent on rating
    $('td.rating').each(function () {
    var rating = $(this);
    var target = $(this).text();
    	if (target === '1') {
    		$(this).addClass("rated1");
    		$(this).wrapInner("<div class='rating_background' />");
    	}
    	else if (target === '2') {
    		$(this).addClass("rated2");
    		$(this).wrapInner("<div class='rating_background' />");
    	}
    	else if (target === '3') {
    		$(this).addClass("rated3");
    		$(this).wrapInner("<div class='rating_background' />");
    	}
    	else if (target === '4') {
    		$(this).addClass("rated4");
    		$(this).wrapInner("<div class='rating_background' />");
    	}
    	else if (target === '5') {
    		$(this).addClass("rated5");
    		$(this).wrapInner("<div class='rating_background' />");
    	}
    });


    // If not using thread tags, get rid of the thread tag filter
    $('div#filter').remove();

    // Label the bottom breadcrumbs
    // ------------------------------------------------------------------------------------------------------------------------ //
    $('#content').find('.breadcrumbs:eq(1)').addClass("bottom_breadcrumbs");
    // Get rid of GO button
    $('form.forum_jump').find('input:last').remove();


    // Change pages into dropdown
    // $('div.title_pages').append('<a>Pages</a>');
    selectifyList($('div.title_pages')).addClass("dropdown_pages");

    // Remove link to last page, since it's hardly used
    /*
    $('#container div.pages.topbigbutts a[title="First page"]').remove();
    $('#container div.pages.bottom a[title="First page"]').remove();
    $('#container div.pages.topbigbutts span.disabled').remove();
    $('#container div.pages.bottom span.disabled').remove();
    */
    $('.pages a[title="First page"]').remove();

    // Remove Subforum columns
    $('td.topics').remove();
    $('td.posts').remove();

    // Remove Subforum Descriptions
    $('tr.subforum dd').remove();

    // Move Author and Killed By
    $('table.threadlist th.author').remove();
    $('table.threadlist th.lastpost').remove();
    $('table.threadlist div.date').remove();

    // If thread is read, post who killed it.  If not, post the author
    $('tr.thread').each(function () {
        var thread = $(this);

    	// Container to hold authorname and killed name
        var authors = $('<div class="authors">');

        if (thread.find('.lastseen').length > 0) {
          // Thread's been read before. Just show last poster.
          var authorkilled = $('<div class="author_killed">');
          authorkilled.html("Killed by " + thread.find('td.lastpost').html());
          authors.append(authorkilled);

        } else {
          // Thread's unread. Show who posted it.
          var authorname = $('<div class="authornameunread">');
          authorname.html("Posted by " + thread.find('td.author').html());
          authors.prepend(authorname);
    	  // $('div.info').removeClass('shortenlastseen');
        }

    thread.find('td.author').remove();
    thread.find('td.lastpost').remove();

    var pagelist = thread.find('select.dropdown_pages');
    pagelist.append(pagelist.children('option').get().reverse());

    var aftertitle = thread.find('div.info');
    aftertitle.append(authors);
 });

     $('tr.thread div.title_inner').each(function () {
    		var threadgroup = $(this);

    		if (threadgroup.find('.lastseen').length) {
    			threadgroup.find('div.info').addClass('shortenlastseen');
    		}
    		else if (!threadgroup.find('.lastseen').length){
    			threadgroup.find('div.info').removeClass('shortenlastseen');
    		}

    	});

 	// User Control Panel PM Home - Move author's name and date to below the thread title
    $('.private_messages tr').each(function () {
        var thread = $(this);

    	// Container to hold authorname and date
        var authorname = $('<div class="authorname">');
        authorname.html(thread.find('td.sender').html());

    	var datesent = $('<div class="privmsgdate">');
    	datesent.html(thread.find('td.date').html());

    	thread.find('td.sender').remove();
    	thread.find('td.date').remove();

    	var aftertitle = thread.find('td.title');
    	aftertitle.append(authorname);
    	aftertitle.append(datesent);
     });

  	// User Control Panel PM - Move author's name and date to below the thread title
    $('.privfolder tr').each(function () {
        var thread = $(this);

    	// Container to hold authorname and date
    	var authorname = $('<div class="authorname">');
    	authorname.html(thread.find('td.sender').html());

    	var datesent = $('<div class="privmsgdate">');
    	datesent.html(thread.find('td.date').html());

    	thread.find('td.sender').remove();
    	thread.find('td.date').remove();

    	var aftertitle = thread.find('td.title');
    	aftertitle.append(authorname);
    	aftertitle.append(datesent);
     });

    // Fix separation between time and date for Private Messages
    $('.privmsgdate').each(function(){
      var text = $(this).text();
      var i = text.search(/\d{1,2}:/);
      $(this).text(text.substr(0, i));
      $('<div class="time">').text(text.substr(i)).appendTo($(this));
    });

    // Remove sender column
    $('#something_awful .private_messages th.sender').remove();

    // Remove titlebar
    $('body.forumdisplay .threadlist thead').remove();

    // Thread View

    // Remove disabled pagenav icons
    $('span.disabled').remove();

    // Remove extra images
    $("#thread .title div").contents().unwrap();
    $("#thread .title").contents(':not(img.img)').remove();
    $("#thread .title img").nextAll().remove();
    // $('.title div > img:gt(0)').remove();

    $('#thread .title div').removeClass('bbc-center');

    // Move userinfo to top
    $('table.post').each(function() {

          var post = $(this);
          var userinfo = $('<td>');

          // pluck out the info we care about
          // just the avatar image
          var avatar = $('<div class="avatar">');
          var image = post.find('dd.title img').first();
          if (image.length > 0) {
              avatar.append(image);
          } else {
              avatar.prepend('<img class="blankavatar" src="http://i.somethingawful.com/images/150-blank.png" />');
          }
          userinfo.append(avatar);

          var username = $('<dl class="userinfo">');
          username.append(post.find('dl.userinfo dt'));
          userinfo.append(username);

    	 // Special title
    	var speciality = $("<div class='userspecialtitle'>");
    	speciality.append(post.find('.special_title'));
    	userinfo.append(speciality);

    	if($('.announcement').length > 0) {
    		var postdate = post.find('.postdate').text();
    	} else {
          var postdate = post.find('.postdate').contents().filter(function () {
              return this.nodeType === 3;
          }).map(function () {
              return this.data;
          }).get().join("").trim();
    	}

    		var postdateDiv = $('<div class="userpostdate">');
    		postdateDiv.text(postdate);

    		var userregdate = $('<div class="userregdate">');
    		userregdate.text(post.find('dd.registered').text());

    		postdateDiv.add(userregdate).wrapAll('<div class="dates">').parent().appendTo(userinfo);

          var oldinfo = post.find('td.userinfo');
          userinfo.attr('class', oldinfo.attr('class'));
    	  userinfo.attr('id', oldinfo.attr('id'));
          oldinfo.remove();
          userinfo.wrap("<thead><tr>").closest('thead').prependTo(post);

    });

    // Give a class to tables
    $('td.graphbar').closest('table.standard').addClass('polltable');

    // Move user's rapsheet history to profile
    $('body.privmsg ul.postbuttons a img').remove();
    $('body.privmsg ul.postbuttons a').text('Users History');
    $('ul.profilelinks').append($('body.privmsg ul.postbuttons li'));

    // Move "Show all posts by user" to profile
    $('.user_jump').each(function() {
    	  var user_jump = $(this);
    	  var post = user_jump.closest('table.post');
    	  user_jump.text("This User's Posts");
    	  var li = user_jump.wrap('<li class="allpostsbyuser">').parent();
    	  post.find('ul.profilelinks').append(li);
    });

    // Add worthless default text for profile links
    $('ul.profilelinks').prepend('<li><a>Poster Options</a></li>');

    // Add link to this post to profilelinks
    $('a[title="Link to this post"]').each(function() {
    	  var user_link = $(this);
    	  var post = user_link.closest('table.post');
    	  user_link.text("Link to This");
    	  var li = user_link.wrap('<li class="linktothis">').parent();
    	  post.find('ul.profilelinks').append(li);
    });

    // Add mark all replies as read to profilelinks
    $('.lastseen_icon').each(function() {
    	  var user_lastseen = $(this);
    	  var post = user_lastseen.closest('table.post');
    	  user_lastseen.text("Mark Replies Read");
    	  var li = user_lastseen.wrap('<li class="markrepliesread">').parent();
    	  post.find('ul.profilelinks').append(li);
    });

    // Change profilelinks section to dropdowns
    selectifyList($('ul.profilelinks')).addClass("dropdown_profilelinks");

    // Reply
    $('body.newreply table#main_full tbody tr').find('td:first').remove();
    $('body.newreply div.save-state').remove();

    // Change voting section to dropdowns
    /*
    var rater = $('<select class="dropdown_voting">');
    rater.append('<option>Rate This Thread!');
    var oldbuttons = $('.rating_buttons');
    oldbuttons.find('li').each(function() {
      var i = $(this).text();
      $('<option>').val(i).text(i).appendTo(rater);
    });
    rater.change(function() {
      var selected = rater.find('option:selected');
      var i = selected.val();
      if (!i) return;
      i = parseInt(i, 10);
      oldbuttons.find('li').eq(i).click();
    });
    rater.insertBefore(oldbuttons.hide());
    */

    // User Control Panel
    $("ul#usercpnav").prepend('<li><a>Control Panel Options</a></li>');
    // Change voting section to dropdowns
    selectifyList($('ul#usercpnav')).addClass("dropdown_usercpnav");

    // Change the PM options from images to text
    $('div.buttons a:nth-child(1) img').remove();
    $('div.buttons a:nth-child(1)').text('Reply');
    $("div.buttons a:nth-child(1)").show();

    $('div.buttons a:nth-child(2) img').remove();
    $('div.buttons a:nth-child(2)').text('Forward');
    $("div.buttons a:nth-child(2)").show();

    $('div.buttons a:nth-child(3) img').remove();
    $('div.buttons a:nth-child(3)').text('Forward to Buddies');
    $("div.buttons a:nth-child(3)").show()

    $('div.buttons a:nth-child(4) img').remove();
    $('div.buttons a:nth-child(4)').text('Create a New PM');
    $("div.buttons a:nth-child(4)").show()


    $("div.buttons").prepend('<li><a>PM Options</a></li>');
    // Change PM options section to dropdowns
    var actions = selectifyList($('div.buttons')).addClass("dropdown_pmoptions");

        // "Delete" action is special; it needs to submit a form.
        var form = $('input[value="dodelete"]').closest('form');
        var url = form.attr('action');

        // Populate the form data from all <input> tags that have a name and a value.
        // (This conveniently works as if our checkbox as ticked.)
        var data = {};
        form.find('input[name][value]').each(function() {
          data[$(this).attr('name')] = $(this).attr('value');
        });

        $('<option>').appendTo(actions).text("Delete").data('delete-action', true);
        actions.change(function() {
          if (actions.find('option:selected').data('delete-action')) {
            var submission = $.post(url, data);
            submission.done(function() {

              // TODO do something more useful here, like a redirect or something.
              alert("Deleted!");
            });
          }
        });

    $('body.privmsg form').remove();

    // Delete Jump to Folder
    $('body.privmsg div#content form:eq(1)').remove();

    // Delete last / next message
    $('body.privmsg div.messages_nextprev').remove();

    // Remove postbuttons
    $('body.privmsg ul.postbuttons').remove();

    // Move PM Options to same div as profilelinks
    $('select.dropdown_pmoptions').insertAfter('select.dropdown_profilelinks');

    // Remove bottom dropdown navigation menu for PMs, since it's not needed
    $('.privmsg select.dropdown_navigation:eq(1)').remove();

    // Remove td from Leper's Colony (just an image)
    $('.banlist #main_full table tr td:eq(0)').remove();

    // Remove sorting ability because who cares
    $('.banlist #main_full .smalltext form').remove();

    // Remove stupid hardcoded float:left that Radium put in because he's a shithead
    $('.banlist #main_full .mqnav div:eq(0)').remove();
    $('.banlist #main_full .inner b:eq(0)').remove();
    $('.banlist #main_full hr').remove();

    // Remove unnecessary columns
    $('.banlist #main_full table.full tbody th:eq(1)').remove();
    $('.banlist #main_full table.full tbody th:eq(3)').remove();
    $('.banlist #main_full table.full tbody th:eq(3)').remove();
    $('.banlist #main_full table.full tbody tr').find('td:eq(1)').remove();
    $('.banlist #main_full table.full tbody tr').find('td:eq(3)').remove();
    $('.banlist #main_full table.full tbody tr').find('td:eq(3)').remove();

    // Combine banlist type with name
    if ($('body').hasClass('banlist')) {
      var rows = $('table.standard tr');

      // first row is header
      rows.first().remove();

      rows.slice(1).each(function() {
    	var newColumn = $('<td>');
    	var columns = $(this).find('td');
    	var type = columns.first().find('a, b').last();
    	switch (type.text()) {
    	  case 'PROBATION': type.text('(P)'); break;
    	  case 'BAN': type.text('(B)'); break;
    	  case 'PERMABAN': type.text('(PB)'); break;
    	}
    	columns.each(function() {
    	  newColumn.append($(this).contents());
    	  newColumn.append(' ');
    	});
    	columns.remove();
    	$(this).append(newColumn);
      });
    }

    // Remove images inside leper's colony
    $('.banlist table.standard img').remove();

    $('.banlist tbody tr td div').removeAttr("style");

    $('.banlist #main_full div.inner br').remove();

    // Remove skip to last page in mqnav since it's not needed
    $('.banlist .mqnav .pages a:eq(1)').remove();

    // Remove displaying X jerks
    $('.banlist .mqnav:eq(1) div:eq(0)').remove();

    // Rename th.rate
    $('.bookmark_threads th.rate').text('RT');

    // Remove authornames from bookmarked threads
    $('.bookmark_threads div.authors').remove();

    // Remove floating date column from user cp
    $('.usercp table.standard th.date').remove();

    // Remove floating columns from privfolder
    $('.privfolder table.standard th.sender').remove();

    // Fix shit in user profile
    $('body.getinfo table.standard').removeAttr('style');

    // Fix stupid class in Leper's Colony
    $('.banlist table.standard').removeAttr('style');

    // Remove PM warning text
    $('.privfolder div.pmwarn').remove();

    // Remove Jump to Folder text
    $('.privfolder form b').remove();

    // Remove GO Buttons
    $('.privfolder form input').remove();

    // Clean up Main Control Panel - PM Options
    $('.usercp th.title:eq(0)').html($('.usercp .private_messages h2'));

    // Remove initial breadcrumb from PM
    $('.privmsg .mainbodytextlarge b a:eq(0)').remove();

    // Remove text for column in user main CP
    $('#something_awful table.threadlist th.rate').text("");

    // Move td element
    // $('.usercp tbody td:eq(0) #buddylist').prepend($('.usercp #cpmain .private_messages'));

    $('.usercp .private_messages tr').each(function () {
        var privfolder = $(this);

        var privmsgicon = $('<div class="privmsgicon">');
        privmsgicon.html(privfolder.find('td.status').html());
    	privfolder.find('td.title').prepend(privmsgicon);

    	var privmsgdate = $('<div class="privmsgdate">');
    	privmsgdate.html(privfolder.find('td.date').html());
    	privfolder.find('td.sender').append(privmsgdate);
    });

    // Remove colspan="3" because radium is a butthole who hardcodes css into html
    $('.usercp th.title').removeAttr("colspan");

    $('.usercp td.status').remove();
    $('.usercp td.date').remove();
    $('.usercp td.check').remove();

    $('.usercp th.title:eq(1)').html($('.usercp .bookmarked_threads h2'));
    // $('.usercp .bookmarked_threads th.rate').remove();

    $('.privfolder table.full tbody').addClass('private_messages_page');

    // Clean up PM folder display
    $('.privfolder .private_messages_page tr').each(function () {
        var privfolder = $(this);

        var privmsgicon = $('<div class="privmsgicon">');
        privmsgicon.html(privfolder.find('td.status').html());
    	privfolder.find('td.title').prepend(privmsgicon);

    	var privmsgdate = $('<div class="privmsgdate">');
    	privmsgdate.html(privfolder.find('td.date').html());
    	privfolder.find('td.sender').append(privmsgdate);
    });

    $('.privfolder td.status').remove();
    $('.privfolder td.date').remove();
    $('.privfolder td.check').remove();
    $('.privfolder th.check').remove();
    // Remove colspan="3" because radium is a butthole who hardcodes css into html
    $('.privfolder th.title').removeAttr("colspan");

    // Remove second table, which is just a description of what the icons are
    $('.privfolder table:eq(1)').remove();

    $('.privfolder th.title').html($('.privfolder form.folder'));
    $('.privfolder th.date').remove();
    $('select[name="daysprune"]').appendTo($('select[name="folderid"]').parent());


    // User profile / getinfo
    $('.getinfo td.info h3:eq(0)').prepend($('.getinfo dd.title img'));
    $('.getinfo td#thread').remove();

    // $('.getinfo td#thread').remove();

    // Move Online users to above PMs and Bookmarked threads
    var buddy = $('#buddylist');
    var buddytable = $('<table>');
    buddytable.insertBefore(buddy.closest('table'));
    buddytable.append(buddy.closest('td'));

    // Give containing table a class
    $('.usercp #content table:eq(0)').addClass('cp_buddy_list');

    // Align thread title and pagenav on same row
    // $("#content div:lt(2)").wrapAll("<div class='titlepagescontainer'></div>");

    // Change base breadcrumb link to go up a level
    /*
    $('.mainbodytextlarge a.index').attr('href',$('.mainbodytextlarge a.up').attr('href'));

    // Clean up forum breadcrumbs
    $('.mainbodytextlarge a.up').remove();
    */

    // Remove count of online users
    $('.forumdisplay span.online_users').remove();

    // Set placeholder attributes on new PM forms
    $('input[name="touser"]').attr('placeholder', "Recipient");
    $('input[name="title"]').attr('placeholder', "Message title");
    $('textarea[name="message"]').attr('placeholder', "Punch some letter keys and make your wonderful new text appear!");
    $('input[name="subject"]').attr('placeholder', "Type in the title of your exciting new thread!");


    // Get rid of first td
    $('.priv_sendprivmsg table#main_full tr').find('td:first').remove();
    $('.newthread table#main_full tr').find('td:first').remove();


    // Fix new PM link
    $(".usercp .private_messages th.title h2 a:eq(0)").attr("href", "/private.php?action=newmessage");

    // Search results
    $('.searchresults #main_full tr').find('td:eq(0)').remove();
    $('.searchresults #main_full tr').find('td:eq(1)').remove();
    $('.searchresults #main_full tr').find('td:eq(1)').remove();
    $('.searchresults #main_full tr').find('td:eq(1)').remove();
    $('.searchresults #main_full tr').find('td:eq(1)').remove();
    $('.searchresults #main_full tr').find('td:eq(1)').remove();

    $('.searchresults #main_full tr').find('th:eq(1)').remove();
    $('.searchresults #main_full tr').find('th:eq(1)').remove();
    $('.searchresults #main_full tr').find('th:eq(1)').remove();
    $('.searchresults #main_full tr').find('th:eq(1)').remove();
    $('.searchresults #main_full tr').find('th:eq(1)').remove();

    // Edit post remove first column
    $('.editpost #main_full tr').find('td:first').remove();

    // Replace gifs with pngs
    replaceGIFsWithPNGs($('div.posticon img'));

    // Move icons on forumdisplay
    $('.forumdisplay tr.thread').each(function () {
        var threadiconfind = $(this);

    	if(!$(this).hasClass("seen")) {

    	var threadicon = $('<div class="threadiconclass">');
    	threadicon.html(threadiconfind.find('td.icon a').html());
    	replaceGIFsWithPNGs(threadicon.find('img'));
    	threadiconfind.find('.title_inner').prepend(threadicon);
    	}
    });
    $('.forumdisplay td.icon').remove();

    // Move icons on bookmarked threads
    $('.bookmark_threads tr.thread').each(function () {
        var threadiconfind = $(this);

    	if(!$(this).hasClass("seen")) {

    	var threadicon = $('<div class="threadiconclass">');
    	threadicon.html(threadiconfind.find('td.icon a').html());
    	replaceGIFsWithPNGs(threadicon.find('img'));
    	threadiconfind.find('.title_inner').prepend(threadicon);
    	}
    });
    $('.bookmark_threads td.icon').remove();
    $('.bookmark_threads th.icon').remove();

 	// Give newthread and newreply bclast class for their title
    $('.newthread div.breadcrumbs span.mainbodytextlarge b a:last-child').addClass('bclast');
    $('.newreply div.breadcrumbs span.mainbodytextlarge b a:last-child').addClass('bclast');

    // Fix breadcrumbs in CP
    $('.privfolder div.breadcrumbs a').addClass('up');
    $('.privfolder div.breadcrumbs a:last-child').removeClass('up');

    // Grab last item, which is not a link, and turn it into bclast
    if ($('.privfolder, .usercp, .member_account_features, .bookmark_threads, .modifyprofile, .modifyoptions, .modifypassword, .listedit, .privmsg, .announcement').length > 0) {
    	// Delete the > chars
    	var div = $('.breadcrumbs');
    	div.html(div.html().replace(/&gt;/g, ''));
    	div.html(div.html().replace(/(\S+)\s*$/, '<a href="#" class="bclast">$1</a>'));

    	$(this).find('div.breadcrumbs a:last-child').addClass('bclast');
    }

    // $('.usercp div.breadcrumbs a:last-child').addClass('bclast');

    // BREADCRUMBS POPUP BOX ---------------------------------------------------------
    // Get breadcrumb sets.
    var breadcrumbs = $('div.breadcrumbs span.mainbodytextlarge');

    if ($('.showthread, .forumdisplay').length > 0) {
    	// Breadcrumbs are for either showthread or forumdisplay
    	// Loop through each set.
    	breadcrumbs.each(function(bIndex, bElement) {
    		var breadcrumb = $(bElement);

    		  // This will be true if the breadcrumb is at the bottom.
    		  var bottom = breadcrumb.parent().hasClass('bottom_breadcrumbs');

    		  // Get the links for this breadcrumb set.
    		  var numberoflinks = breadcrumb.find('a').length;
    		  if (numberoflinks < 4) {
    			  // One forum away from main forum index
    			  breadcrumb.find('a.up').removeClass('up');
    			  var links = breadcrumb.find('a:not(.index, .bclast)');
    		  }
    		  else {
    			  var links = breadcrumb.find('a:not(.index, .up, .bclast)');
    		  }

    		  // Create an unordered list container for the new links.
    		  var list = $('<ul class="breadcrumb-list hide"></ul>');

    		  // Loop through the links and create listitems containing the links.
    		  links.each(function(lIndex, lElement) {
    		  var link = $(lElement);

    		  // Wrap the link in a listitem.
    		  var item = link.wrap('<li></li>').parent();

    		  // Add listitem to the list.
    		  list.append(item);
    	});

  // Remove the .index and .up links.
  breadcrumb.find('a.up, a.index, b').remove();

  // Create new nav links and add lists to DOM.
  if (bottom) {
      // Make new index link.
      breadcrumb.prepend('<a href="#" class="index icon-menu2 bc-popout bc-popout-bottom"></a>');

      // Add the list after the breadcrumb if on the bottom.
      breadcrumb.after(list.addClass('bc-popout-bottom'));
      } else {
      // Make new index link.
      breadcrumb.prepend('<a href="#" class="index icon-menu2 bc-popout bc-popout-top"></a>');

      // Add the list after the breadcrumb if on the top.
      breadcrumb.after(list.addClass('bc-popout-top'));
  }
});
    } else if ($('.newthread, .newreply').length > 0) {

    // Breadcrumbs for replies and new threads -----------------------------------------------------------
    // Loop through each set.
    breadcrumbs.each(function(bIndex, bElement) {
      var breadcrumb = $(bElement);

      // This will be true if the breadcrumb is at the bottom.
      var bottom = breadcrumb.parent().hasClass('bottom_breadcrumbs');

      // Get the links for this breadcrumb set.
      var links = breadcrumb.find('a:not(:last-child)');

      // Create an unordered list container for the new links.
      var list = $('<ul class="breadcrumb-list hide"></ul>');

      // Loop through the links and create listitems containing the links.
      links.each(function(lIndex, lElement) {
      var link = $(lElement);

      // Wrap the link in a listitem.
      var item = link.wrap('<li></li>').parent();

      // Add listitem to the list.
      list.append(item);
      });

      // Remove the .index and .up links.
      breadcrumb.find('a:not(:last-child)').remove();

      // Create new nav links and add lists to DOM.
      if (bottom) {
    	  // Make new index link.
    	  breadcrumb.prepend('<a href="#" class="index icon-menu2 bc-popout bc-popout-bottom"></a>');

    	  // Add the list after the breadcrumb if on the bottom.
    	  breadcrumb.after(list.addClass('bc-popout-bottom'));
      } else {
    	  // Make new index link.
    	  breadcrumb.prepend('<a href="#" class="index icon-menu2 bc-popout bc-popout-top"></a>');

    	  // Add the list after the breadcrumb if on the top.
    	  breadcrumb.after(list.addClass('bc-popout-top'));
      }
    });
    } else if ($('.privfolder, .usercp, .member_account_features, .bookmark_threads, .modifyprofile, .modifyoptions, .modifypassword, .listedit, .privmsg, .announcement').length > 0) {

    // Breadcrumbs for CP
    	breadcrumbs = $('.breadcrumbs');

    	// Remove <b>
    	// breadcrumbs.find('b').remove();

    	// Loop through each set.
    	breadcrumbs.each(function(bIndex, bElement) {
      var breadcrumb = $(bElement);

      // This will be true if the breadcrumb is at the bottom.
      var bottom = breadcrumb.parent().hasClass('bottom_breadcrumbs');

      // Get the links for this breadcrumb set.
      var links = breadcrumb.find('a:not(:last-child)');

      // Create an unordered list container for the new links.
      var list = $('<ul class="breadcrumb-list hide"></ul>');

      // Loop through the links and create listitems containing the links.
      links.each(function(lIndex, lElement) {
      var link = $(lElement);

      // Wrap the link in a listitem.
      var item = link.wrap('<li></li>').parent();

      // Add listitem to the list.
      list.append(item);
      });

      // Remove the .index and .up links.
      breadcrumb.find('a:not(:last-child)').remove();

      // Create new nav links and add lists to DOM.
      if (bottom) {
      // Make new index link.
      breadcrumb.prepend('<a href="#" class="index icon-menu2 bc-popout bc-popout-bottom"></a>');

      // Add the list after the breadcrumb if on the bottom.
      breadcrumb.after(list.addClass('bc-popout-bottom'));
      } else {
      // Make new index link.
      breadcrumb.prepend('<a href="#" class="index icon-menu2 bc-popout bc-popout-top"></a>');

      // Add the list after the breadcrumb if on the top.
      breadcrumb.after(list.addClass('bc-popout-top'));
      }
    });
}

    // Popout button click binds.
    $('a.bc-popout').click(function(event) {
      var link = $(this);
      var list = false;

      // Stop link from being a link.  Add an .index selector for button
      // elements if you want to use button elements instead and then
      // remove this line.
      event.preventDefault();

      // Grab list element based on if it's a top or bottom breadcrumb.
      if (link.hasClass('bc-popout-top')) {
    	list = $('ul.breadcrumb-list.bc-popout-top');
      } else if (link.hasClass('bc-popout-bottom')) {
    	list = $('ul.breadcrumb-list.bc-popout-bottom');
      }

      // If the list was found toggle its slide animation.
      if (list) {
    	list.slideToggle('fast');

    	 if ($(list).is(':visible')) {
    		$(list).css('display','inline-block');
    	 }

    	$('a.bc-popout').toggleClass('rotatedown');
    	$('ul.navigation-list').css("display", "none");
    	$('ul#nav_purchase').css("display", "none");
      }
    });




    // PURCHASE DROPDOWN BOX
    $('a.toptitlepurchase').after($('ul#nav_purchase'));
    $('ul#nav_purchase').addClass('purchase-list hide purchase-popout');

    $('ul#nav_purchase li').contents().filter(function(){
    	return this.nodeType == 3
    }).remove();

    // Get purchase items
    var purchaseitems = $('ul#nav_purchase li');

    // Loop through each set.
    purchaseitems.each(function(cIndex, cElement) {
      var purchaseitem = $(cElement);

      // Get the links for this purchase set.
      var purchaselinks = purchaseitem.find('li');

      // Create an unordered list container for the new links.
      var purchaselist = $('<ul class="purchase-list hide"></ul>');

      // Loop through the links and create listitems containing the links.
      purchaselinks.each(function(pIndex, pElement) {
    	var purchaselink = $(pElement);

    	// Wrap the link in a listitem.
    	// var purchaseitem = purchaselink.wrap('<li></li>').parent();
    	var purchaseitem = purchaselink.parent();

    	// Add listitem to the list.
    	purchaselist.append(item);
      });

      // Remove the b text.
      purchaseitem.find('b').remove();

    });

    // Popout button click binds.
    $('a.purchase-popout').click(function(event) {
      var purchaselink = $(this);
      var purchaselist = false;

      // Stop link from being a link.  Add an .index selector for button
      // elements if you want to use button elements instead and then
      // remove this line.
      event.preventDefault();

      // Grab list element based on if it's a top or bottom breadcrumb.
      purchaselist = $('ul.purchase-list.purchase-popout');

      // If the list was found toggle its slide animation.
      if (purchaselist) {
    	purchaselist.slideToggle('fast');

    	if ($(purchaselist).is(':visible')) {
    		$(purchaselist).css('display','inline-block');
    	 }

    	$('ul.bc-popout-top').css("display", "none");
    	$('ul.navigation-list').css("display", "none");
    	$('a.bc-popout').removeClass('rotatedown');
      }
    });



    // NAVIGATION DROPDOWN BOX
    $('a.toptitleoptions').after($('ul#navigation'));
    $('ul#navigation').addClass('navigation-list hide navigation-popout');

    $('ul#navigation li').contents().filter(function(){
    return this.nodeType == 3
    }).remove();

    // Get purchase items
    var navigationitems = $('ul#navigation li');

    // Loop through each set.
    navigationitems.each(function(dIndex, dElement) {
      var navigationitem = $(dElement);

      // Get the links for this purchase set.
      var navigationlinks = navigationitem.find('li');

      // Create an unordered list container for the new links.
      var navigationlist = $('<ul class="navigation-list hide"></ul>');

      // Loop through the links and create listitems containing the links.
      navigationlinks.each(function(nIndex, nElement) {
    	var navigationlink = $(nElement);

    	// Wrap the link in a listitem.
    	// var purchaseitem = purchaselink.wrap('<li></li>').parent();
    	var navigationitem = navigationlink.parent();

    	// Add listitem to the list.
    	navigationlist.append(item);
      });
    });

    // Popout button click binds.
    $('a.navigation-popout').click(function(event) {
      var navigationlink = $(this);
      var navigationlist = false;

      // Stop link from being a link.  Add an .index selector for button
      // elements if you want to use button elements instead and then
      // remove this line.
      event.preventDefault();

      // Grab list element based on if it's a top or bottom breadcrumb.
      navigationlist = $('ul.navigation-list.navigation-popout');

      // If the list was found toggle its slide animation.
      if (navigationlist) {
    	navigationlist.slideToggle('fast');

    	if ($(navigationlist).is(':visible')) {
    		$(navigationlist).css('display','inline-block');
    	 }

    	$('ul#nav_purchase').css("display", "none");
    	$('ul.bc-popout-top').css("display", "none");
    	$('a.bc-popout').removeClass('rotatedown');
      }
    });


    // Combine purchase A and UL for dropdown menus
    $("a.toptitlepurchase, ul#nav_purchase").wrapAll('<div class="purchase_joined"></div>');
    $("a.toptitleoptions, ul#navigation").wrapAll('<div class="purchase_joined"></div>');

    // Remove searchboxes
    $('div#searchboxes').remove();

    // Remove mod list bar
    $('div#mp_bar').remove();


    // TO DO: Move thread title to new line if there's not enough room


    // SA Mart images to text
    textifySecondaryIcon("icon-37-selling.gif", "<div class='sellingclass'>Selling:</div>");
    textifySecondaryIcon("icon-38-buying.gif", "<div class='buyingclass'>Buying:</div>");
    textifySecondaryIcon("icon-46-trading.gif", "<div class='tradingclass'>Trading:</div>");

    // Ask / Tell images to text
    textifySecondaryIcon("ama.gif", "<div class='askingclass'>ASK:</div>");
    textifySecondaryIcon("tma.gif", "<div class='tellingclass'>TELL:</div>");

    // Remove blank td from announcements
    $('.forum_158 td.icon2').remove();
    $('.forum_61 td.icon2').remove();

    // Remove thread icon columns that mysteriously reappeared
    $('.privfolder td.icon').remove();
    $('.usercp td.icon').remove();
    $('.usercp th.icon').remove();

    // Remove top fucked up breadcrumbs for user CP

    // Remove link to user's violation history
    $('td.postlinks ul.postbuttons li a img[src="http://fi.somethingawful.com/images/buttons/sa-hist.gif"]').remove();

    // Replace mod tools with smaller icons
    // Delete
    $('.threadbar.top ul.postbuttons li a img[alt="Delete"]').attr("src", "http://i.somethingawful.com/images/sa-delete-small.png");
    // Close
    $('.threadbar.top ul.postbuttons li input[alt="Close thread"]').attr("src", "http://i.somethingawful.com/images/sa-close-small.png");
    // Edit
    $('.threadbar.top ul.postbuttons li a img[alt="Edit"]').attr("src", "http://i.somethingawful.com/images/sa-edit-small.png");
    // Gas
    $('.threadbar.top ul.postbuttons li a img[alt="Gas"]').attr("src", "http://i.somethingawful.com/images/sa-gas-small.png");
    // Move
    $('.threadbar.top ul.postbuttons li a img[alt="Move"]').attr("src", "http://i.somethingawful.com/images/sa-move-small.png");
    // Stick
    $('.threadbar.top ul.postbuttons li a img[alt="Stick thread"]').attr("src", "http://i.somethingawful.com/images/sa-stick-small.png");
    // Unstick
    $('.threadbar.top ul.postbuttons li a img[alt="Unstick thread"]').attr("src", "http://i.somethingawful.com/images/sa-stick-small.png");

    // Put more whitespace between post and reply buttons
    $('ul.postbuttons li a img[alt="Post"]').addClass("userpostbutton");

    // Adjust alignment of inside quote button
    $('td.postlinks ul.postbuttons li:last-child').addClass("userquotebuttoninside");

    // Same with edit button
    $('td.postlinks ul.postbuttons a img[alt="Edit"]').addClass("usereditbuttoninside");


    // FYAD
    // Replace FYAD beecock button with smaller one
    $('.forum_26 td.postlinks ul.postbuttons').each(function () {
        var threadlocation = $(this);
    	threadlocation.find('li:eq(1) a:eq(1) img').attr("src", "http://i.somethingawful.com/images/sa-beecock-small.png");
    });
    $('.forum_26 .threadbar.top ul.postbuttons').each(function () {
        var threadlocation = $(this);
    	threadlocation.find('li:eq(2) a img').attr("src", "http://i.somethingawful.com/images/sa-beecock-small.png");
    });

    // Replace FYAD trolling and bowling images - Top
    $('.forum_26 .threadbar.top ul.postbuttons').each(function () {
        var threadlocation = $(this);
    	threadlocation.find('li:eq(8) a img').attr("src", "http://i.somethingawful.com/images/trollin.png");
    	threadlocation.find('li:eq(9) a img').attr("src", "http://i.somethingawful.com/images/bowlin.png");
    });

    // Replace FYAD trolling and bowling images - Bottom
    $('.forum_26 .threadbar.bottom ul.postbuttons').each(function () {
        var threadlocation = $(this);
    	threadlocation.find('li:eq(0) a img').attr("src", "http://i.somethingawful.com/images/trollin.png");
    	threadlocation.find('li:eq(1) a img').attr("src", "http://i.somethingawful.com/images/bowlin.png");
    });

    // Fix poll results page
    $('form[action="poll.php"] table.standard').addClass('pollresults');
    $('.pollresults tbody tr td').removeAttr('width');
    $('.pollresults tbody tr td').addClass('pollbutton');

    // In user CP, move CP options into dropdown menu row
    $('select.dropdown_usercpnav').appendTo('.breadcrumbs');

    // In user CP, move New PM and Folders icons to top
    $('.msgbuttons').appendTo('th.title');

    // Put page nav into breadcrumbs

    $('#content div.pages.bottom').prependTo('#content .bottom_breadcrumbs');


    // $('.forum_26 .threadbar.bottom ul.postbuttons').each(function () {
    	if($('.threadbar.top').length) {
    		$('#content div.pages.topbigbuttsbigbutts').appendTo('.threadbar.top');
    	}
    	else if($('.threadbar.bottom').length) {
    		$('#content div.pages.bottom').prependTo('.threadbar.bottom');
    	}

    // Remove floating text from breadcrumbs
    $('span.mainbodytextlarge').contents().filter(function(){
    	return this.nodeType == 3
    }).remove();

    // Put commas in unread posts
    $('.lastseen a.count b').text(function(i,v){
    	var val=parseFloat(v).toFixed(0);
    	if(val.length>3){
    		var p=val.split('.');
    		var a=p[0].length % 3;
    		var n=p[0].slice(a).match(/.{1,3}/g);
    		return (a===0?'':p[0].slice(0,a)+',')+n.join(',');
    	}
    	return val;
    });

    // Remove extra right border if count is 0
    $('.lastseen a.x').not(':has(~ a.count)').css('border-right', '0');

    $('.lastseen').each(function () {
    	if($(this).find('a.count').length) {
    		$(this).removeClass('repliedMessageRow');
    	}
    	else {
    		$(this).addClass('repliedMessageRow');
    	}
    });


    // Show a different color quote block if the user has been quoted
    var regex = new RegExp($('#loggedinusername').text().replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1") + "\\s+posted:");
    $('.bbc-block h4').filter(function(){ return regex.test($(this).text()) }).map(function(){ return $(this).closest('.bbc-block')[0]; }).addClass("userquoted")

    // Remove postdate
    $('td.postdate').remove();

    // Change posting buttons with text-based icons
    /*
    $('img.userpostbutton').replaceWith('<div class="image_button" title="Post a new thread"><div class="button_icon_post icon-file2"></div><div class="image_button_text">POST</div></div>');
    $('img[alt="Post New Thread"]').replaceWith('<div class="image_button" title="Post a new thread"><div class="button_icon_post icon-file2"></div><div class="image_button_text">POST</div></div>');
    */
    $('img.userpostbutton').replaceWith('<div class="image_button" title="Post a new thread"><div class="button_icon_post icon-file2"></div></div>');

    $('.forumdisplay img[alt="Post New Thread"]').parent('a').addClass('forumdisplay_post');

    $('img[alt="Post New Thread"]').replaceWith('<div class="image_button" title="Post a new thread"><div class="button_icon_post icon-file2"></div></div>');

    $('img[src="http://fi.somethingawful.com/images/forum-reply.gif"]').replaceWith('<div class="image_button" title="Reply to this thread"><div class="button_icon_reply icon-reply"></div><div class="image_button_text">REPLY</div></div>');

    $('img[src="http://fi.somethingawful.com/images/forum-closed.gif"]').replaceWith('<div class="image_button" title="This thread is closed."><div class="button_icon_closed icon-eye-blocked"></div><div class="image_button_text">CLOSED</div></div>');

    $('#thread td.postlinks ul.postbuttons img.usereditbuttoninside').replaceWith('<div class="image_button" title="Edit this thread"><div class="button_icon_edit icon-pencil"></div><div class="image_button_text">EDIT</div></div>');

    $('#thread td.postlinks ul.postbuttons img[alt="Quote"]').replaceWith('<div class="image_button" title="Quote this post"><div class="button_icon_quote icon-bubbles2"></div><div class="image_button_text">QUOTE</div></div>');

    $('ul.postbuttons img[alt="Delete"]').replaceWith('<div class="image_button image_button_small" title="Delete this thread"><div class="button_icon_delete icon-remove"></div></div>');

    // Fix close thread submit
    $('.closed_thread input[alt="Close thread"]').replaceWith('<button type="submit" class="image_button image_button_small"><div class="image_openthreaduserbutton icon-lock" title="Open this thread"></div></button>');
    $('input[alt="Close thread"]').replaceWith('<button type="submit" class="image_button image_button_small"><div class="image_openthreaduserbutton icon-unlocked" title="Close this thread"></div></button>');

    $('ul.postbuttons img[alt="Edit"]').replaceWith('<div class="image_button image_button_small" title="Edit this thread"><div class="button_icon_modedit icon-pencil"></div></div>');
    $('ul.postbuttons img[alt="Gas"]').replaceWith('<div class="image_button image_button_small" title="Gas this thread"><div class="button_icon_gas icon-fire"></div></div>');
    $('ul.postbuttons img[alt="Move"]').replaceWith('<div class="image_button image_button_small" title="Move this thread"><div class="button_icon_move icon-location"></div></div>');
    $('ul.postbuttons img[alt="Unstick thread"]').replaceWith('<div class="image_button image_button_small" title="Unstick this thread"><div class="button_icon_unstick icon-pushpin"></div></div>');
    $('ul.postbuttons img[alt="Stick thread"]').replaceWith('<div class="image_button image_button_small" title="Stick this thread"><div class="button_icon_stick icon-pushpin"></div></div>');

    $('.privmsgicon img[src="http://fi.somethingawful.com/images/pmreplied.gif"]').replaceWith('<div class="privatemessage privatemessage_replied" title="Replied to PM"><span class="privatemessageoverlay"></span></div>');
    $('.privmsgicon img[src="http://fi.somethingawful.com/images/pm.gif"]').replaceWith('<div class="privatemessage privatemessage_read" title="Read PM"></div>');
    $('.privmsgicon img[src="http://fi.somethingawful.com/images/newpm.gif"]').replaceWith('<div class="privatemessage privatemessage_new" title="New PM"></div>');

    $('img[src="http://fi.somethingawful.com/images/pm/newmessage.gif"]').replaceWith('<div class="image_button" title="Compose a new PM"><div class="button_icon_newpm icon-file2"></div><div class="image_button_text">NEW PM</div></div>');


    $('.privfolder img[alt="Send a private message to members of your buddy list"]').remove();
    $('img[src="http://fi.somethingawful.com/images/pm/folders.gif"]').replaceWith('<div class="image_button" title="Manage your folders"><div class="button_icon_folders icon-folder-open"></div><div class="image_button_text">FOLDER</div></div>');

    $('a[title="Previous page"]').addClass('previous_page_button');
    $('a[title="Next page"]').addClass('next_page_button');
    $('a[title="Previous page"]').empty();
    $('a[title="Next page"]').empty();
    $('a[title="Last page"]').remove();

    // Remove << from button to go up a forum
    $(".mainbodytextlarge a.index").contents().filter(function(){
    	return (this.nodeType == 3);
    }).remove();

    // Change background color of PM row if message is new
    $('.privatemessage_new').each(function () {
    $(this).closest('td').addClass('newMessageRow');
    });

    // Change background color of PM row if message is a reply
    $('.privatemessage_replied').each(function () {
    	$(this).closest('td').addClass('repliedMessageRow');
    });

    // Move top pages so they don't mess up the forum title display
    // Move top page nav below title
    $('div.pages.topbigbuttsbigbutts').insertAfter('ul.bc-popout-top');
    // $('div.pages.topbigbuttsbigbutts').insertAfter('.breadcrumbs');

    // Remove empty mainbodytextlarge
    // $('.titlepagescontainer a.bc-popout').unwrap();
    $('.titlepagescontainer a.bc-popout').unwrap();
    $('.bottom_breadcrumbs a.bc-popout').unwrap();

    // Remove top navigation links
    // $('.titlepagescontainer div.pages.topbigbutts').remove();

    // Move last seen thread box to after the info box
    $('td .lastseen').each(function () {
    	$(this).insertAfter($(this).parent().find('.info'));
    });

    // Remove bottom UL navigation
    // $('ul.navigation').remove();

    // Put pagenav in forumbar
    if($('.forumbar.topforumbar').length) {
    	$('div.pages:eq(0)').insertBefore('.forumbar.topforumbar ul.postbuttons');
    }
    if($('.forumbar.bottomforumbar').length) {
    	$('div.pages.bottom').insertBefore('.forumbar.bottomforumbar ul.postbuttons');
    }
    if($('.threadbar.top').length) {
    	$('div.pages:eq(0)').insertBefore('.threadbar.top ul.postbuttons');
    	$('div.pages:eq(0), .threadbar.top ul.postbuttons').wrapAll('<div class="threadbargroupwrap">');
    }
    if($('.threadbar.bottom').length) {
    	$('div.pages.bottom').insertBefore('.threadbar.bottom ul.postbuttons');
    	$('div.pages.bottom, .threadbar.bottom ul.postbuttons').wrapAll('<div class="threadbargroupwrap_bottom">');
    }

    $('.forumdisplay .pages')

    // Get rid of old pagenavs
    $('.breadcrumbs div.pages').remove();
    // $('div.pages.bottom').remove();

    // Remove floating words from reply and quote buttons
    $('div.image_button_text').remove();

    // Get rid of the profile links ul
    $('ul.profilelinks').remove();

    // Get rid of bottom navigation
    // $('.showthread ul.navigation').remove();

    // Figure out if there are next and previous pages, for swiping
    if($('a.previous_page_button').length) {
    	var prevlink = $('a.previous_page_button').attr('href');
    	var newprevlink = (prevlink).split("pagenumber=").pop();
    	var titlepart = "Page ";
    	var newprevlinktitle = titlepart.concat(newprevlink);
    	var totallink = '<link rel=\"prev\" title=\"Page ' + newprevlink + '\" href=\"' + prevlink + '\">';
    	$('head').append(totallink);
    }

    if($('a.next_page_button').length) {
    	var nextlink = $('a.next_page_button').attr('href');
    	var newnextlink = (nextlink).split("pagenumber=").pop();
    	var nexttitlepart = "Page ";
    	var newnextlinktitle = nexttitlepart.concat(newnextlink);
    	var nexttotallink = '<link rel=\"next\" title=\"Page ' + newnextlink + '\" href=\"' + nextlink + '\">';
    	$('head').append(nexttotallink);
    }


    // Remove threadsearch form since it apparently never worked
    $('form.threadsearch').remove();

    // Pull bookmark thread icon out of list
    var $optionspos = $('.threadbar.top ul.postbuttons > li > img.thread_bookmark');
    $optionspos.prependTo('.threadbar.top');

    var $optionspos1 = $('.threadbar.bottom ul.postbuttons > li > img.thread_bookmark');
    $optionspos1.prependTo('.threadbar.bottom');

    // Temp fix for not being able to submit the User CP Form in the user options
    $('.modifyoptions .titlepagescontainer div:eq(1)').addClass('submitoptions');
    $('.modifyoptions div.submitoptions').prependTo('table.vbfake');

    // Announcements screen

    // Remove top bar
    $('.announcement div.threadbar.top').remove();

    // Add breadcrumbs class for CP shit
    // $('.privfolder .titlepagescontainer').addClass('breadcrumbs');
    $('.titlepagescontainer').addClass('breadcrumbs');

    // Get rid of blank table in user cp
    $('.usercp div.forumbar').remove();
    $('.bookmark_threads div.forumbar').remove();
    $('.modifyoptions table.vbfake tr:eq(0)').remove();

    // Delete the > chars when posting / replying
    if ($('.newreply, .newthread').length > 0) {
    	var badchars = $('.breadcrumbs b');
    	badchars.html(badchars.html().replace(/&gt;/g, ''));

    	// Move username to top with Post New Thread
    	// Remove logout button
    	$('.newthread td.user_loggedin a').remove();
    	// $('.newthread td.user_loggedin').prependTo($('#main_full th'));
    	$('#main_full th').prepend($('.newthread td.user_loggedin'));
    	$('.newthread td.user_loggedin').contents().unwrap();
    	// Remove now vacant tr
    	$('#main_full tbody tr:eq(0)').remove();
    }

    // Remove all the fucking line breaks from the announcements
    $('.announcement #content br:eq(0)').remove();
    $('.announcement #content br:eq(1)').remove();
    $('.announcement #content br:eq(2)').remove();

    $('.announcement #content b:eq(0)').remove();

    $('.announcement #content #thread td.postlinks').closest('tr').remove();

    // Get rid of blank li in postbuttons
    if($('.threadbar.top').length > 0) {

    	$('.threadbar.top ul.postbuttons').find('li').each(function() {
    	if($(this).is(':empty')) {
    		$(this).remove();
    		}
    	});
    }

    // GODDAMMIT I CANT FIGURE OUT HOW TO RELIABLY RETURN THE WIDTH OF THE FUCKING SHIT IN THE NAVBAR AAAAHHH
    // var buttonswidth = $('div.threadbar.top ul.postbuttons')[0].getBoundingClientRect();
    // var buttonswidth = $('div.threadbar.top ul.postbuttons')[0].getBoundingClientRect();
    // var buttonswidth = $(document.('div.threadbar.top ul.postbuttons').outerWidth(true));
    // var buttonswidth = document.getElementsByClassName('div.threadbar.top ul.postbuttons')[0];
    // console.log(buttonswidth.getBoundingClientRect(true));



    // ------------------------------------------------------------- REMOVE ADS -----------------------------------------------------------------------
    $('.oma_pal').remove();
    $('#ad_banner_user').remove();

    // Separate subforums with commas
    rebuildSubforumList();

    $("body").removeClass("hide");
});

    // Check screen width, and change some values so shit works on 480 and less devices
    $(document).ready(function() {

    	if (screen.width<480) {
    		$('.showthread div.pages.topbigbutts').addClass('smallscreen');

    		// Check to see if pagenav fits in the postbar
    		var mobilewidth = $(screen.width);

    		/*
    		var buttonswidth = 0;
    		$('.threadbar.top ul').find('li').each(function() {
    			buttonswidth += $(this).outerWidth(true);

    			console.log(buttonswidth);
    		});
    		*/

    		// var buttonswidth = $('div.threadbar ul.postbuttons li').outerWidth(true);

    		// var buttonswidth = ("div.threadbar ul.postbuttons li").getBoundingClientRect();
    		// var buttonswidth = $('div.threadbar ul.postbuttons li').outerWidth(true);


    	}
    });

function replaceGIFsWithPNGs(imgs) {
  $(imgs).filter('[src]').each(function() {
    var regex = /\.gif(#.*)?$/i;
    var src = $(this).attr('src');
    if (regex.test(src)) {
      $(this).attr('src', src.replace(regex, ".png$1"));
  }
  });
}

function textifySecondaryIcon(filename, replacement) {
    $('.icon2 img[src*="' + filename + '"]').each(function() {
    	$(this).closest('tr').find('.info a.thread_title').prepend(replacement);
  });
}

function isMobile() {
    var touch = 'ontouchstart' in window;
    return touch?true:false;
}

function selectifyList(lists) {
  return $(lists).map(function() {
    var select = $('<select>').insertBefore($(this).hide());
    $('a', this).each(function () {
      $('<option>').appendTo(select).val(this.href).html($(this).html());
    });
    select.change(function() {
      var selected = select.find('option:selected');
      var url = selected.val();
      if (!url) return;
      if (selected.attr('target') === '_blank') {
          window.open(url);
      } else {
          window.location.href = url;
      }
    });
    return select.get(0);
  });
}

function rebuildSubforumList() {
  // Get array of subforum links.
  var links = $("table#subforums").find("a");

  // Create comma-separated list of links.
  links.filter(":not(:last)").append(", ");

  // Replace existing subforum table with one we create here.
  var subforumTable = $("table#subforums").replaceWith('<table id="subforums" summary="Subforums"><tbody><tr class="subforum"><td class="title"></td></tr></tbody></table>');

  // Append the links to the newly recreated table.
  $("table#subforums td.title").append(links);
}

/* ------------------------------------------------------------------- */
