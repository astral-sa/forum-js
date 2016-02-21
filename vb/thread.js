if (!window.SA)
{
    SA = {};
}

/**
 * This is pretty much just a stub for now for future enhancements.
 */
SA.thread = new function(window, document, $)
{
    var postJumpRE = /\?postid=(\d+)/;
    var postJumpHashRE = /#post(\d+)/;
    var sel = ($.browser.webkit || $.browser.safari) ? 'body' : 'html';

    var jumpTo = function(id)
    {
        var element = $('#' + id);
        if (element.length || id == 'top')
        {
            if ($.browser.msie && parseInt($.browser.version, 10) < 9)
            {
                window.location.href = '#' + id;
            }
            else
            {
                var st = element.length ? element.offset().top : 0;
                // Temporarily remove the id to keep the page from jumping before scroll.
                element.attr('id', '');
                window.location.href = '#' + id;
                element.attr('id', id);
                $(sel).animate({'scrollTop': st}, 150);
                console.log('animated', sel, element, st);
            }

            return false;
        }

        return true;
    };

    /**
     * Intercepts a link click.  If it points to a forums post, check to see
     * if the post is on the current page.  If it is, just scroll to the post
     * instead of sending a new page request.
     */
    var handleThreadLinks = function()
    {
        var e = $(this);
        var href = e.attr('href');
        var re = null;

        // Make sure the link points to the forums before testing for a post jump.
        if ((/^https?:\/\//).test(href))
        {
            if (!(/^https?:\/\/(.*\.)?forums\.somethingawful\./).test(href))
            {
                return true;
            }
        }

        if ((/^\/?attachment\.php/).test(href))
        {
            return true;
        }

        // I know this can be written with a ternary operation, but I prefer readability.
        // I also like spaces instead of tabs, and I put braces on new lines.
        if (postJumpRE.test(href))
        {
            re = postJumpRE;
        }
        else if (postJumpHashRE.test(href))
        {
            re = postJumpHashRE;
        }

        if (re !== null)
        {
            var m = re.exec(href);
            var id = 'post' + m[1];
            return jumpTo(id);
        }

        return true;
    };

    var init = function()
    {
        var jumpElementLeft = $('<div class="jump_top left">UP</div>');
        var jumpElementRight = $('<div class="jump_top right">UP</div>');

        $(document).delegate('td.postbody a', 'click', handleThreadLinks);

        if (SA.utils.isMobile)
        {
            $('.bbc-spoiler').bind('touchmove', function(e)
            {
                e.stopPropagation();
                e.preventDefault();
            });

            $('.bbc-spoiler').bind('touchstart', function(e)
            {
                if (e.target != this)
                {
                    return;
                }

                $(this).toggleClass('stay');
                e.stopPropagation();
                e.preventDefault();
            });
        }
        else
        {
            $('.bbc-spoiler').click(function(e)
            {
                if (e.target != this)
                {
                    return;
                }
                $(this).toggleClass('stay');
            });

            $('.bbc-spoiler').hover(function()
            {
                $(this).addClass('reveal');
            },
            function()
            {
                $(this).removeClass('reveal');
            });
        }

        if (!$('body.showpost').length)
        {
            if ($.browser.msie && parseInt($.browser.version, 10) < 7)
            {
                jumpElementRight.show();
                $('body').append(jumpElementRight);
            }
            else
            {
                $('body').append(jumpElementLeft);
                $('body').append(jumpElementRight);

                $(document).mousemove(function(e)
                {
                    var leftVisible = jumpElementLeft.is(':visible');
                    var rightVisible = jumpElementRight.is(':visible');
                    var inY = e.pageY > (($(sel).scrollTop() + $(window).height()) - 100);

                    if (inY && e.pageX < 100)
                    {
                        if (rightVisible)
                        {
                            jumpElementRight.hide();
                        }
                        if (!leftVisible)
                        {
                            jumpElementLeft.show();
                        }
                    }
                    else if (inY && e.pageX > $(window).width() - 100)
                    {
                        if (!rightVisible)
                        {
                            jumpElementRight.show();
                        }
                        if (leftVisible)
                        {
                            jumpElementLeft.hide();
                        }
                    }
                    else
                    {
                        if (rightVisible)
                        {
                            jumpElementRight.hide();
                        }
                        if (leftVisible)
                        {
                            jumpElementLeft.hide();
                        }
                    }
                });
            }
        }

        $('div.jump_top').click(function()
        {
            return jumpTo('top');
        });

        // Actually validate the forum jump menu before making a new request.
        $('form.forum_jump select[name="forumid"]').change(function()
        {
            var e = $(this);
            var val = e.val();
            var prune = e.siblings('input[name="daysprune"]').val();
            if (val == -1)
            {
                console.log('Forum selection is not good!');
                return false;
            }
            window.location.href = '/forumdisplay.php?daysprune=' + prune + '&forumid=' + val;
        });
    };

    $(document).ready(init);

    $(window).load(function()
    {
        if ($('body.showthread').length && window.adjust_page_position && window.location.hash)
        {
            var e = $(window.location.hash);
            if (e.length)
            {
                var o = e.offset();
                console.log('[adjust] scroll position:', o);
                window.scrollTo(o.left, o.top);
            }
        }
    });
}(window, document, jQuery);