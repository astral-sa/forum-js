new function(window, document, $)
{
    var id_regexp = /thread(\d+)/i;

    var init_thread_stars = function()
    {
        var threads = $('tr.thread td.star');
        if (!threads.length)
        {
            return;
        }

        threads.each(function(i, e)
        {
            e = $(e);
            var category = 0;
            var div = e.append('<div></div>');
            var p = e.parents('tr').eq(0);
            var tid = id_regexp.exec(p.attr('id'));

            if (tid)
            {
                tid = tid[1];
                div.click(function()
                {
                    var t = $(this);
                    if (p.hasClass('spin'))
                    {
                        console.warn('[bookmark] New bookmark state still loading.');
                        return false;
                    }

                    p.addClass('spin');

                    p.removeClass('category0 category1 category2 category3 category4 category5');
                    t.removeClass('bm0 bm1 bm2 bm3 bm4 bm5');

                    var data = {
                        'threadid': tid,
                        'action': 'cat_toggle',
                        'json': 1
                    };

                    $.post('/bookmarkthreads.php', data, function(data)
                    {
                        if (data.category_id >= 0 && !window.disable_thread_coloring)
                        {
                            p.addClass('category' + data.category_id);
                        }

                        p.removeClass('spin');
                        t.addClass('bm' + data.category_id);
                        console.log('[bookmark] New category for thread', data.threadid, ':', data.category_id);
                    });

                    return false;
                });

                // The "reset seen" buttons
                var d = p.find('div.lastseen');
                var a = d.find('a.x');
                a.click(function()
                {
                    if (a.data('busy'))
                    {
                        console.warn('[bookmark] Last seen reset is busy for thread:', tid);
                        return false;
                    }

                    a.data('busy', true);
                    a.html('<');

                    var data = {
                        'threadid': tid,
                        'action': 'resetseen',
                        'json': 1
                    };

                    $.post('/showthread.php', data, function(data)
                    {
                        if (data.threadid)
                        {
                            p.removeClass('seen');
                            d.remove();
                            console.log('[bookmark] Last seen has been reset for thread:', tid);
                        }
                    });

                    return false;
                });
            }
        });

        console.info('[bookmark] Individual thread bookmark links initilized.');
    };

    var init_thread_bookmark = function()
    {
        var pending = false;
        var unbookmark_url = 'https://fi.somethingawful.com/images/buttons/button-unbookmark.png';
        var bookmark_url = 'https://fi.somethingawful.com/images/buttons/button-bookmark.png';
        var bottom = $('div#bookmark_link a');
        var img = $('img.thread_bookmark');
        if (!bottom.length || !img.length)
        {
            return;
        }

        var thread = parseInt($('body').attr('data-thread'), 10);

        var update_bookmark_text = function()
        {
            if (img.hasClass('unbookmark'))
            {
                bottom.html('Unbookmark this thread');
            }
            else
            {
                bottom.html('Bookmark this thread');
            }
        };

        var update_image_attrs = function()
        {
            if (img.hasClass('bookmark'))
            {
                img.attr({
                    'src': bookmark_url,
                    'alt': 'Bookmark',
                    'title': 'Bookmark thread'
                });
            }
            else
            {
                img.attr({
                    'src': unbookmark_url,
                    'alt': 'Unbookmark',
                    'title': 'Unbookmark thread'
                });
            }
        };

        var toggle = function()
        {
            if (pending)
            {
                return false;
            }

            pending = true;

            var data = {
                'action': img.hasClass('unbookmark') ? 'remove' : 'add',
                'threadid': thread,
                'json': 1
            };

            $.post('/bookmarkthreads.php', data, function(data)
            {
                img.removeClass('bookmark unbookmark');
                if (data.bookmarked)
                {
                    img.addClass('unbookmark');
                    console.log('[bookmark] Following thread has been bookmarked:', thread);
                }
                else
                {
                    img.addClass('bookmark');
                    console.log('[bookmark] Following thread has been unbookmarked:', thread);
                }

                update_image_attrs();
                update_bookmark_text();
                pending = false;
            });
        };

        img.click(toggle);
        bottom.click(toggle);

        update_image_attrs();
        update_bookmark_text();
        console.info('[bookmark] Thread bookmark links initilized.');
    };

    var init_usercp_bookmarks = function()
    {
        if (!$('body').hasClass('usercp') && !$('body').hasClass('bookmark_threads'))
        {
            return;
        }

        var table = $('table#forum');
        if (!table.length)
        {
            return;
        }

        table.find('thead > tr').append('<th></th>');
        table.find('tbody > tr').append('<td class="button_remove"><div title="Remove bookmark"></div></td>');
        table.delegate('td.button_remove div', 'click', function()
        {
            var e = $(this);
            var p = e.parents('tr').eq(0);
            var tid = id_regexp.exec(p.attr('id'));

            if (tid)
            {
                tid = tid[1];

                if (e.data('pending'))
                {
                    console.warn('[bookmark] Remove thread is busy for thread:', tid);
                    return false;
                }

                e.data('pending', true);
                e.removeClass('warn');
                e.addClass('spin');

                var data = {
                    'threadid': tid,
                    'action': 'remove',
                    'json': 1
                };

                $.post('/bookmarkthreads.php', data, function(data)
                {
                    p.remove();
                    console.log('[bookmark] Bookmarked thread has been removed:', tid);
                });
            }

            return false;
        });

        console.info('[bookmark] UserCP bookmark management initialized.');
    };

    $(document).ready(function()
    {
        init_thread_stars();
        init_thread_bookmark();
        init_usercp_bookmarks();
    });
}(window, document, jQuery);
