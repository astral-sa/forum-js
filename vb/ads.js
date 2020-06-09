new function(window, document, $)
{
    var sel = 'body,html';
    var skyscraper;
    var skyscraperTop = 0;
    var skyscraperHeight = 0;

    var petImage = function(side)
    {
        var n = Math.floor(Math.random() * 160) + 1;
        return 'https://fi.somethingawful.com/sideimages/' + side + '88/' + n + '.jpg';
    };

    var setupPets = function()
    {
        var omapal = $('div.oma_pal');
        var img = $(new Image());
        img.attr({
            'width': 88,
            'height': 88,
            'class': 'omapalpet'
        });
        img.css('display', 'block');

        omapal.each(function(i, e)
        {
            e = $(e);
            var tmp = img.clone();
            tmp.addClass('left');
            tmp.attr('src', petImage('l'));
            e.prepend(tmp);

            tmp = img.clone();
            tmp.addClass('right');
            tmp.attr('src', petImage('r'));
            e.append(tmp);
        });
    };

    var makeFrame = function(zone, width, height)
    {
        document.write('<iframe frameborder="no" scrolling="no" width="' + width + '" height="' + height + '" class="adframe" data-zone="' + zone + '"></iframe>');
    };

    var loadAds = function()
    {
        $('iframe.adframe').each(function(i, e)
        {
            $(e).attr('src', '/adframe.php?z=' + $(e).attr('data-zone'));
        });
    };

    var adjustSkyscraper = function()
    {
        var o = skyscraper.offset();
        var st = $(sel).scrollTop();
        var top = skyscraperTop;
        var css = {
            'position': 'absolute',
            'top': skyscraperTop
        };
        var content = $('div#content');
        var ctop = content.offset().top;
        var cheight = content.height();
        var bottom = (ctop + cheight) - skyscraperHeight;

        if (st > bottom)
        {
            if (cheight > skyscraperHeight)
            {
                css.top = bottom;
            }
        }
        else if (st >= skyscraperTop)
        {
            css.position = 'fixed';
            css.top = 0;
        }

        skyscraper.css(css);
    };

    $(document).ready(function()
    {
        setupPets();
        skyscraper = $('div#unregskyscraper');
        if (skyscraper.length)
        {
            skyscraperTop = skyscraper.offset().top - 10;
            skyscraperHeight = skyscraper.height() + 10;
            $(window).scroll(adjustSkyscraper);
        }
        loadAds();
    });

    // var cornerCommercial = 'http://adexcite.com/ads/video/controller.php?eid=10952';
    // if (window.daa)
    // {
    //     $(window).on('load', function()
    //     {
    //         // Load corner commerical.
    //         var script = $(document.createElement('script'));
    //         script.attr({
    //             'type': 'text/javascript',
    //             'src': cornerCommercial
    //         });
    //         $('body').append(script);
    //     });
    // }

    // window.pal = {'make_frame': makeFrame};
}(window, document, jQuery);