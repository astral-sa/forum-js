new function(window, document, $)
{
    var cookieName = '_sessl';
    cookieName += '';

    var pInt = function(s)
    {
        var n = parseInt(s, 10) + 0;
        return n;
    };

    var parseQuery = function(qs)
    {
        qs = qs.substr(1).split('&');

        var i = 0;
        var i2;
        var obj = {};
        var l = qs.length;
        var param, value;

        for (; i < l; i++)
        {
            i2 = qs[i].indexOf('=');
            if (i2 == -1)
            {
                continue;
            }

            param = qs[i].substr(0, i2);
            value = qs[i].substr(i2 + 1);

            obj[param] = value;
        }

        return obj;
    };

    var init = function()
    {
        if (!$('div#notregistered').length)
        {
            return;
        }

        $('table#forum th a').each(function(i, e)
        {
            $(e).replaceWith(e.childNodes);
        });

        $('ul.postbuttons img#button_bookmark').parent().remove();

        var query = window.location.search;
        if (!query)
        {
            return;
        }

        var obj = parseQuery(query);
        var forum = 0;
        var thread = 0;
        var post = 0;

        if (obj.hasOwnProperty('forumid'))
        {
            forum = pInt(obj.forumid);
        }
        else
        {
            var a = $('div.breadcrumbs a[href^="forumdisplay.php"]').last();
            if (a.length)
            {
                a = a.attr('href');
                a = parseQuery(a.substr(a.indexOf('?')));

                if (a.hasOwnProperty('forumid'))
                {
                    forum = pInt(a.forumid);
                }
            }
        }

        if (obj.hasOwnProperty('threadid'))
        {
            thread = pInt(obj.threadid);
        }

        if (obj.hasOwnProperty('postid'))
        {
            post = pInt(obj.postid);
        }

        var setNewCookie = true;
        var now = pInt((new Date()).getTime() / 1000);
        var lastCookie = $.cookie(cookieName);

        if (lastCookie)
        {
            var value = lastCookie.split('.');
            if (value.length == 4)
            {
                var f = pInt(value[0]);
                var t = pInt(value[1]);
                var p = pInt(value[2]);
                var n = pInt(value[3]);

                if (now - n < 180)
                {
                    setNewCookie = false;
                    console.log('[session] Session is not old enough to update.');

                    if (f == forum && t == thread && p == post)
                    {
                        console.log('[session] No change in session data.');
                    }
                    else
                    {
                        console.log('[session] Session data differs from cookie.');
                        // Negate the time based check.
                        setNewCookie = true;
                    }
                }
                else
                {
                    console.log('[session] Session cookie is old.  Time to refresh it.');
                }
            }
        }

        if (setNewCookie)
        {
            var img = [forum, thread, post, now].join('.');
            $.cookie(cookieName, img, {'expires': 10, 'domain': 'forums.somethingawful.com'});
            console.log('[session] Logging session, forum:', forum, ', thread:', thread, ', post:', post);
            $('body').append('<img src="/s/' + img + '" alt="">');
        }
        else
        {
            console.log('[session] No change in session');
        }
    };

    $(document).ready(init);
}(window, document, jQuery);