if (!window.SA)
{
    SA = {};
}

SA.utils = new function(window, document, $)
{
    var self = this;

    self.storageEnabled = window.localStorage ? true : false;
    self.isMobile = (/android|iphone|ipod|ipad|webos|blackberry/i).test(navigator.userAgent);

    self.store = function(name)
    {
        if (self.storageEnabled)
        {
            if (name !== null)
            {
                var value = null;

                if (arguments.length > 1)
                {
                    value = arguments[1];
                    if (value === null)
                    {
                        localStorage.removeItem(name);
                    }
                    else
                    {
                        localStorage.setItem(name, JSON.stringify(value));
                    }
                }
                else
                {
                    value = localStorage.getItem(name);
                    if (value !== null)
                    {
                        return JSON.parse(value);
                    }
                }
            }
        }

        return null;
    };

    self.qs = function(obj)
    {
        if (obj)
        {
            var parts = [];
            for (var item in obj)
            {
                parts.push(encodeURIComponent(item) + '=' + encodeURIComponent(obj[item]));
            }

            return parts.join('&');
        }

        var o = {};
        var q = window.location.search;

        if (q)
        {
            var i2;
            q = q.substr(1).split('&');
            for (var i = 0; i < q.length; i++)
            {
                i2 = q[i].indexOf('=');
                if (i2 == -1)
                {
                    o[q[i]] = '';
                }
                else
                {
                    o[decodeURIComponent(q[i].substr(0, i2))] = decodeURIComponent(q[i].substr(i2 + 1));
                }
            }
        }

        return o;
    };

    window.rf = function(height)
    {
        $('td.postbody iframe').css('height', Math.min(height, 800));
    };
}(window, document, jQuery);