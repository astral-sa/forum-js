if (!window.SA)
{
    SA = {};
}

SA.timg = new function(window, document, $)
{
    var self = this;
    var maxWidth = 170;
    var maxHeight = 200;

    /**
     * Scales down a timg.
     *
     * Adjusts scale based on width. If the height remains larger than
     * `maxHeight` scale down the image based on the height.
     *
     * @argument    img     The image element, pre-wrapped with jQuery.
     */
    var shrink = function(img)
    {
        var scale = 1;
        var w = img[0].naturalWidth || img.width();
        var h = img[0].naturalHeight || img.height();

        if (w > maxWidth)
        {
            scale = maxWidth / w;
        }

        if (h * scale > maxHeight)
        {
            scale = maxHeight / h;
        }

        w *= scale;
        h *= scale;

        img.attr({
            'width': w,
            'height': h
        });
    };

    /**
     * Toggles the size of the image.
     *
     * @param   constrain   Whether or not to constrain the image size to the
     *                      parent's width.
     */
    var timgClick = function(event, constrain)
    {
        var e = $(this).siblings('img');
        var t, b, st;

        if (!e.attr('t_width'))
        {
            $(this).addClass('expanded');
            e.attr({
                't_width': e.attr('width'),
                't_height': e.attr('height')
            });

            var p = e.parents('blockquote');
            if (!p.length)
            {
                p = e.parents('.postbody');
            }

            var w = parseInt(e.attr('o_width'), 10);
            var h = parseInt(e.attr('o_height'), 10);
            var constraint = Math.min(900, p.width());

            if (constrain && w > constraint)
            {
                // Keep the image constrained to the width of the parent.
                var pos = e.position();
                var scale = (constraint - (pos.left * 3)) / w;
                e.attr('width', w * scale);
                e.attr('height', h * scale);
            }
            else
            {
                e.removeAttr('width');
                e.removeAttr('height');
            }

            var sel = 'body,html';
            st = $(sel).scrollTop();
            t = e.offset().top;
            b = t + e.height();

            if (b - st > $(window).height())
            {
                st = b - $(window).height();
            }

            if (t < st)
            {
                st = t;
            }

            if (st != $(sel).scrollTop())
            {
                $(sel).animate({'scrollTop': st}, 150);
            }
        }
        else
        {
            $(this).removeClass('expanded');
            e.attr({
                'width': e.attr('t_width'),
                'height': e.attr('t_height')
            });
            e.removeAttr('t_width');
            e.removeAttr('t_height');
        }

        return false;
    };

    /**
     * Load event for timg elements.
     */
    var timgLoaded = function()
    {
        var e = $(this);
        if (e.hasClass('loading')) // I guess IE8 reuses img elements.
        {
            e.removeClass('loading');

            // This should resolve the issue of dimensions showing up as 0x0
            // on Google Chrome.
            var w = e[0].naturalWidth || e.width();
            var h = e[0].naturalHeight || e.height();

            if ((h < maxHeight && w <= 500) || (w < maxWidth))
            {
                e.removeClass('timg');
                e.trigger('timg.loaded');
                return;
            }

            e.addClass('complete');
            e.attr({
                'o_width': w,
                'o_height': h
            });

            var caption = w + 'x' + h;

            shrink(e);

            var span = $('<span class="timg_container"></span>');
            var note = $('<div class="note"></div>');
            note.text(caption);
            note.attr('title', 'Click to toggle');
            span.append(note);
            e.before(span);
            span.prepend(e);

            note.click(timgClick);

            // Clicking on the image will toggle the constrained size.
            // If the image is wrapped with a link, you will need to right
            // click on it and select the menu item that follows the link in
            // your browser.
            // If you hate this, you should be able to cancel out the event
            // with a userscript.
            span.click(function(event)
            {
                if (event.which === 1)
                {
                    timgClick.call(note, event, true);
                    return false;
                }
            });

            e.trigger('timg.loaded');
        }
    };

    self.scan = function(selector)
    {
        $(selector).find('img.timg').each(function(i, e)
        {
            e = $(e);
            if (!e.hasClass('complete'))
            {
                e.addClass('loading');
                if (e[0].complete || (e[0].naturalWidth !== null && e[0].naturalWidth > 0))
                {
                    timgLoaded.call(e);
                }
                else
                {
                    e.on('load', timgLoaded);
                }
            }
        });
    };

    /**
     * Find timg elements, and begin this ugly process.
     */
    var init = function()
    {
        self.scan('body');
    };

    $(document).ready(init);

    $(window).on('load', function()
    {
        var unhandled = $('img.timg.loading');
        if (unhandled.length)
        {
            console.log(unhandled.length + ' timg were unhandled');
            unhandled.each(function(i, e)
            {
                timgLoaded.call(e);
            });
        }
        else
        {
            console.log('Looks like all timg\'s were handled.');
        }
    });
}(window, document, jQuery);
