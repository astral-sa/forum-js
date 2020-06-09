new function(window, document, $)
{
    var rotateID = 0;
    var rotateInterval = 60; // In seconds
    var flagImg = null;


    var rotateFYADFlag = function()
    {
        clearInterval(rotateID);

        $.get('/flag.php?forumid=26', function(data)
        {
            flagImg.attr('title', 'This flag proudly brought to you by "' + data.username + '" on ' + data.created);
            flagImg.attr('src', 'https://fi.somethingawful.com/flags' + data.path + '?by=' + encodeURIComponent(data.username));
            rotateID = setTimeout(rotateFYADFlag, rotateInterval * 1000);
        });
    };

    $(document).ready(function()
    {
        $(document).delegate('div.toggle_tags', 'click', function()
        {
            $(this).parents('div#filter').eq(0).toggleClass('open');
        });

        $('div.pages select').change(function()
        {
            var url = $(this).attr('data-url');
            window.location.href = url + '&pagenumber=' + $(this).val();
        });

        if ($('body.forumdisplay, body.showthread').length)
        {
            var bc = $('div.breadcrumbs > span:first-child');
            bc.each(function(i, e)
            {
                e = $(e);
                var a = [];

                // This is done because IE 10 destroys the anchor elements
                // as soon as we rewrite the container's HTML.
                e.find('a').each(function(i, e)
                {
                    a.push($(e).clone());
                });

                e.html(' &rsaquo; ');
                e.append(a.pop());
                var container = $(a.pop());
                e.prepend(container);

                if (a.length)
                {
                    var s = $('<span></span>');
                    s.append(a);
                    s.append(container.clone());
                    container.prepend(s);
                }

                container.addClass('up');
            });

            bc.prepend('<a class="index" href="/" title="Forums index">&laquo;</a>&nbsp;');
        }

        $(document).delegate('div.thread_tags a.if', 'click', function(e)
        {
            if (e.shiftKey)
            {
                var m = (/posticon=(\d+)/).exec($(this).attr('href'));
                if (!m)
                {
                    console.log('[posticon] No posticon id found!');
                    return false;
                }

                var iconid = m[1];
                var query = SA.utils.qs();
                var icons = null;
                if (query.posticon)
                {
                    if ((',' + query.posticon).indexOf(',' + iconid) == -1)
                    {
                        icons = query.posticon.split(',');
                        icons.push(iconid);
                        while (icons.length > 10)
                        {
                            icons.shift();
                        }
                        query.posticon = icons.join(',');
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    query.posticon = iconid;
                }

                window.location.href = '/forumdisplay.php?' + SA.utils.qs(query).replace(/%2c/ig, ',');
                return false;
            }
        });

        if ($('body.forum_26, body.forum_154, body.forum_666').length)
        {
            flagImg = $(new Image());
            $('div#flag_container').append(flagImg);
            rotateFYADFlag();
        }
        // Add "Septic Tank" overlay (but not for IE or Opera)
        else if (!/(MSIE|Trident|Opera)/.test(navigator.userAgent) && !SA.utils.isMobile && $('body.forum_25').length)
        {
            var d = $('<div id="gc_overlay"></div>');
            $('body').append(d);
        }
        else if ($('body.loginform').length)
        {
            var secure_login = $('input.secure_login');
            var toggleSecure = function()
            {
                var form = $('form.login_form');
                var url = 'https://forums.somethingawful.com/account.php';
                if (!secure_login.is(':checked'))
                {
                    url = '/account.php';
                    $.cookie('secure_login', 'no');
                }
                else
                {
                    $.cookie('secure_login', null);
                }
                form.attr('action', url);
            };

            secure_login.click(toggleSecure);

            if ($.cookie('secure_login') == 'no')
            {
                secure_login.prop('checked', false);
                toggleSecure();
            }
        }

        // Show a different color quote block if the user has been quoted
        var regex = new RegExp('^' + $('#loggedinusername').text().replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1") + "\\s+posted:$");
        $('.bbc-block h4').filter(function(){ return regex.test($(this).text()) }).map(function(){ return $(this).closest('.bbc-block')[0]; }).addClass("userquoted")
    });
}(window, document, jQuery);