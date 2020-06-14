(function(window, document, $)
{
    var busy = false;
    var quoteQueue = [];
    var quoteCache = {};
    var messageBox = null;
    var clipboardCatcher = null;
    var undo = [];
    var undoIndex = 0;
    var keyInterval = 250;
    var scheduledSnapshot = 0;
    var threadId = 0;
    var forumId = 0;
    var originalPost = '';
    var maxPostLength = 50000;
    var visibilityThreshold = 30000;
    var postWrapper = null;
    var quickPreviewWrapper = null;
    //var quickPreviewInput = null;
    var shortcutsEnabled = false;
    var storageEnabled = window.localStorage ? true : false;
    var quickQuoteEnabled = window.JSON && JSON.stringify && JSON.parse;
    var newThread = false;
    var newReply = false;
    var editPost = false;
    var inFYAD = false;
    var lastMessageLength = 0;

    var store = function(name)
    {
        if (storageEnabled)
        {
            if (name !== null)
            {
                var value = null;
                name = 'postreply_' + name;

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

    var appendQuote = function(quote)
    {
        var newline = '\n';
        if (messageBox[0].value.substr(messageBox[0].value.length - 1) != '\n')
        {
            newline += '\n';
        }
        insertText(newline + quote, null, false);
    };

    /**
     * Runs the queue for fetching posts.
     */
    var runQuoteQueue = function()
    {
        if (!busy && quoteQueue.length)
        {
            busy = true;
            var anchor = $(quoteQueue.shift());
            if (quoteCache[anchor.attr('href')])
            {
                appendQuote(quoteCache[anchor.attr('href')]);
                runQuoteQueue();
            }
            else
            {
                $.get(anchor.attr('href') + '&json=1', {}, function(post)
                {

                    quoteCache[anchor.attr('href')] = post.body;
                    appendQuote(post.body);
                    anchor.children('img').attr('src', 'https://fi.somethingawful.com/images/sa-quote-added.gif');
                    runQuoteQueue();
                }, 'json');
            }
        }
        else
        {
            busy = false;
            console.log('Quote queue finished.');
        }
    };

    var fetchPreview = function(message)
    {
        // quickPreviewInput.prop('disabled', true);
        var data = {
            'action': $('input[name="action"]').val(),
            'threadid': $('input[name="threadid"]').val(),
            'formkey': $('input[name="formkey"]').val(),
            'form_cookie': $('input[name="form_cookie"]').val(),
            'preview': 'Preview Reply',
            'message': message
        };

        $('form[action="newreply.php"] input[type="checkbox"]:checked').each(function(i, e)
        {
            e = $(e);
            data[e.attr('name')] = 'yes';
        });

        $.post('newreply.php?json=1', data, function(post)
        {
            var body = quickPreviewWrapper.find('div.postbody');
            body.empty();
            body.html(post.preview);
            quickPreviewWrapper.show();
            SA.timg.scan(body);

            clipboardCatcher.css({
                'top': messageBox.offset().top
            });

            var sel = 'body,html';
            var offset = quickPreviewWrapper.offset();
            if (offset.top < $(sel).scrollTop())
            {
                $(sel).animate({'scrollTop': offset.top}, 150);
            }

            // quickPreviewInput.prop('disabled', false);
        });
    };

    /**
     * Queues a post to be added to the reply as a quote.  One quote at a time!
     */
    var updateReply = function()
    {
        $(this).css('opacity', 0.6);
        quoteQueue.push(this);
        runQuoteQueue();
        return false;
    };

    /**
     * Saves the post as a draft.
     */
    var saveDraft = function()
    {
        if (storageEnabled && (undo === null || undo.length > 1))
        {
            var now = new Date();
            var key = null;
            if (newThread)
            {
                key = 'forum-' + forumId;
            }
            else if (newReply)
            {
                key = 'reply-' + threadId;
            }
            else
            {
                console.warn('No idea what kind of snapshot this should be!!');
                return;
            }

            postWrapper.find('div.save-state').text('Saved: ' + now.toLocaleDateString() + ' ' + now.toLocaleTimeString());
            store(key, {
                'time': now.getTime(),
                'message': $.trim(messageBox[0].value)
            });
        }
    };

    /**
     * Takes a snapshot of the reply text.  This should be revised to only take
     * snapshots of changes to the text rather than the entire text field.
     */
    var performSnapshot = function()
    {
        console.log('Taking snapshot...');
        clearInterval(scheduledSnapshot);

        if (undo !== null)
        {
            if (undoIndex != undo.length - 1)
            {
                console.log('Pruning undo...', undo.length, undoIndex, undo.length - undoIndex - 1);
                undo.splice(undoIndex + 1, undo.length - undoIndex - 1);
            }

            var selection = getSelection();
            undo.push({
                'selection': selection,
                'scroll': messageBox[0].scrollTop,
                'text': messageBox[0].value
            });
            undoIndex = undo.length - 1;
        }

        saveDraft();
    };

    /**
     * Restores a state of the textarea.
     */
    var restoreSnapshot = function()
    {
        if (undo.length && undoIndex >= 0 && undoIndex < undo.length)
        {
            var selection = undo[undoIndex].selection;
            messageBox[0].value = undo[undoIndex].text;
            setSelection(selection.start, selection.end);
            messageBox[0].scrollTop = undo[undoIndex].scroll;
            updateCharacterCount();
            saveDraft();
        }
    };

    /**
     * Performs an undo by moving the undo cursor back.
     */
    var performUndo = function()
    {
        undoIndex = Math.max(0, undoIndex - 1);
        restoreSnapshot();
    };

    /**
     * Performs a redo by moving the undo cursor forward.
     */
    var performRedo = function()
    {
        undoIndex = Math.min(undo.length - 1, undoIndex + 1);
        restoreSnapshot();
    };

    /**
     * Schedules a snapshot, typically while typing.
     */
    var scheduleSnapshot = function()
    {
        clearInterval(scheduledSnapshot);
        scheduledSnapshot = setTimeout(performSnapshot, keyInterval);
    };

    /**
     * Gets the current selection of the reply text.  I *was* going to support
     * IE versions less than 9, but IE is stupid.
     */
    var getSelection = function()
    {
        var selection = null;
        if (shortcutsEnabled == 'new')
        {
            selection = {
                'start': messageBox[0].selectionStart,
                'end': messageBox[0].selectionEnd
            };
        }
        // else if (shortcutsEnabled == 'ie legacy')
        // {
        //     // I GIVE UP ON YOU IE
        //     // If you know how to rewrite this horseshit so IE8 can be supported
        //     // email me at choochacacko@somethingawful.com.  Don't forget about
        //     // the parts below to position the caret after wrapping a selection.
        //     // That was a bitch too.
        //     var bookmark = document.selection.createRange().getBookmark();
        //     var sel = messageBox[0].createTextRange();
        //     sel.moveToBookmark(bookmark);
        //     var prefix = messageBox[0].createTextRange();
        //     prefix.collapse(true);
        //     prefix.setEndPoint('EndToStart', sel);

        //     selection = {
        //         'start': prefix.text.length,
        //         'end': prefix.text.length + sel.text.length
        //     };
        // }

        return selection;
    };

    /**
     * Sets the current selection in the reply text.
     */
    var setSelection = function(start)
    {
        var end = arguments.length == 2 ? arguments[1] : start;
        messageBox[0].setSelectionRange(start, end);
    };

    /**
     * Determines whether or not a character code is a stop character.  This is
     * pretty much non-visible characters, punctuation, and symbols.
     *
     * @param       ord     Character code.
     */
    var isStopCharacter = function(ord)
    {
        // Stop at punctuation and symbols. Not using ASCII alphabet
        // so that crazy foreigners and their languages aren't excluded.
        var stopRanges = [[0, 47], [58, 64], [91, 96], [123, 126]];
        var i = 0;
        var l = stopRanges.length;
        var yup = false;

        for (; i < l; i++)
        {
            if (ord >= stopRanges[i][0] && ord <= stopRanges[i][1])
            {
                yup = true;
                break;
            }
        }

        return yup;
    };

    /**
     * Find a word to select from the index.  This will stop at apostrophes too,
     * since it's not all that smart.  This isn't a word processor, okay professor?
     */
    var wordBoundariesFrom = function(index, text)
    {
        var i = index - 1;
        var l = text.length;
        var selection = {
            'start': index,
            'end': index
        };

        while (i >= 0)
        {
            if (isStopCharacter(text.charCodeAt(i)))
            {
                i++;
                break;
            }
            i--;
        }

        selection.start = (i >= 0) ? i : 0;

        while (i < l)
        {
            if (isStopCharacter(text.charCodeAt(i)))
            {
                break;
            }
            i++;
        }

        selection.end = i;
        return selection;
    };

    /**
     * Special case for lists.
     */
    var wrapList = function()
    {
        var selection = getSelection();
        var text = messageBox[0].value;
        var prefix = text.substring(0, selection.start);
        var selectedText = text.substring(selection.start, selection.end);
        var wrapped = '[list]\n[*]' + selectedText + '\n[/list]';
        var suffix = text.substr(selection.end);
        messageBox[0].value = prefix + wrapped + suffix;
        setSelection(selection.start + selectedText.length + 10);
        performSnapshot();
        updateCharacterCount();
    };

    /**
     * Checks to see if the cursor is within a tag.
     */
    var insideTag = function(tag)
    {
        var selection = getSelection();
        var text = messageBox[0].value;
        var i = text.lastIndexOf('[' + tag, selection.start);
        if (i != -1)
        {
            i = text.indexOf('[/' + tag + ']', i);
            if (i == -1)
            {
                // No closing tag, assume everything after the start tag is a list.
                return false;
            }

            // +3 to make sure we're talking about the end of the tag.
            return i + 3 > selection.end;
        }

        return false;
    };

    var unwrapTag = function(tag)
    {
        var selection = getSelection();
        var text = messageBox[0].value;
        var start = '[' + tag + ']';
        var end = '[/' + tag + ']';

        var tagStart = text.lastIndexOf(start, selection.start);

        if (tagStart != -1)
        {
            var tagStart2 = tagStart + start.length;
            var tagEnd = text.indexOf(end, tagStart2);
            if (tagEnd != -1)
            {
                var tagEnd2 = tagEnd + end.length;
                var prefix = text.substring(0, tagStart);
                var suffix = text.substr(tagEnd2);
                var unwrapped = text.substring(tagStart2, tagEnd);
                messageBox[0].value = prefix + unwrapped + suffix;
                setSelection(prefix.length + unwrapped.length);
            }
        }
    };

    /**
     * Insert text into the reply.  This will replace the selection if
     * start != end.
     *
     * @param   selection   An object with selection information.  Supply this
     *                      value to override the selection.
     * @param   wrapped     If wrap is true, the text is meant to surround the
     *                      selection.
     */
    var insertText = function(text, selection, wrap)
    {
        if (selection === null)
        {
            selection = getSelection();
        }

        var oldScrollTop = messageBox[0].scrollTop;
        var reply = messageBox[0].value;
        var prefix = reply.substring(0, selection.start);
        var selectedText = reply.substring(selection.start, selection.end);
        var suffix = reply.substr(selection.end);
        var start = selection.start;

        if (wrap)
        {
            var wrapped = '[' + text + ']' + selectedText + '[/' + text + ']';
            messageBox[0].value = prefix + wrapped;
            if (selection.start == selection.end)
            {
                // If there's no selection, place the cursor between the tag.
                start = selection.start + text.length + 2;
            }
            else
            {
                start = selection.start + wrapped.length;
            }
        }
        else
        {
            messageBox[0].value = prefix + text;
            start = selection.start + text.length;
        }

        selection.end = start;
        messageBox[0].scrollTop = messageBox[0].scrollHeight;
        messageBox[0].value += suffix;
        if (messageBox[0].scrollTop < oldScrollTop)
        {
            messageBox[0].scrollTop = oldScrollTop;
        }
        setSelection(start);

        performSnapshot();
        updateCharacterCount();
        return selection;
    };

    /**
     * Turns an object into a query string.
     */
    var queryString = function(obj)
    {
        var params = [];
        for (var item in obj)
        {
            if (obj[item] === true)
            {
                params.push(item);
            }
            else
            {
                params.push(item + '=' + obj[item]);
            }
        }

        if (params.length)
        {
            return '?' + params.join('&');
        }

        return '';
    };

    /**
     * Parses a query string into an object.
     */
    var parseQueryString = function(str)
    {
        var query = str.split('&');
        var o = {};
        var i;
        var item;
        for (item in query)
        {
            i = query[item].indexOf('=');
            if (i != -1)
            {
                o[query[item].substr(0, i)] = query[item].substr(i + 1);
            }
            else
            {
                o[query[item]] = true;
            }
        }

        return o;
    };

    /**
     * Parses a URL into manageable pieces.
     */
    var parseURL = function(url)
    {
        var m = (/([^:]+):\/\/([^\/]+)(\/.*)?/).exec(decodeURI(url));
        if (m)
        {
            var tmp;
            var item;
            var i;
            var o = {
                'scheme': m[1],
                'domain': m[2],
                'path': m[3] || '',
                'filename': '',
                'query': {},
                'fragment': ''
            };

            i = o.path.lastIndexOf('#');
            if (i != -1)
            {
                o.fragment = o.path.substr(i + 1);
                o.path = o.path.substr(0, i);
            }

            i = o.path.lastIndexOf('?');
            if (i != -1)
            {
                o.query = parseQueryString(o.path.substr(i + 1));
                o.path = o.path.substr(0, i);
            }

            i = o.path.lastIndexOf('/');
            if (i != -1)
            {
                o.filename = o.path.substr(i + 1);
            }

            return o;
        }

        return null;
    };

    /**
     * Captures pasted text through trickery.
     *
     * An off-screen textarea is focused when ctrl/cmd+V is pressed in the reply
     * box. The contents of off-screen textarea is considered the clipboard data,
     * which isn't perfect, so don't expect it to be!  Sorry!
     *
     * @param       selection       The old selection.  This is mostly for IE9
     *                              since re-focusing the textarea doesn't
     *                              restore the old selection.
     */
    var captureClipboard = function(selection)
    {
        var pasteData = clipboardCatcher[0].value;
        var m;
        if ((/^https?:\/\//).test(pasteData) && pasteData.indexOf('\n') == -1 && pasteData.indexOf('\r') == -1)
        {
            // So far a URL.
            var urlinfo = parseURL(pasteData);
            var extension = '';
            var filename = '';
            var handled = false;
            var i = urlinfo.filename.lastIndexOf('.');
            if (i != -1)
            {
                extension = urlinfo.filename.substr(i + 1);
                filename = urlinfo.filename.substr(0, i);
                console.log('!!!', filename);
            }

            var getVideoStart = function(timeStr) {
                var timeSearch = timeStr.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/);
                return ((timeSearch[1] ? timeSearch[1] + 'h' : '') + 
                    (timeSearch[2] ? timeSearch[2] + 'm' : '') + 
                    (timeSearch[3] ? timeSearch[3] + 's' : ''));
                /* BBCode parser bug was fixed; previous code left for posterity:
                // return time in seconds to work around BBCode parser bug with time conversion
                return ((timeSearch[1] ? parseInt(timeSearch[1],10) * 3600 : 0) +
                    (timeSearch[2] ? parseInt(timeSearch[2],10) * 60 : 0) +
                    (timeSearch[3] ? parseInt(timeSearch[3],10) : 0));
                    */
            };

            // Detect youtube here!!
            // http://www.youtube.com/watch?v=rK1XnD9f8Bc&feature=g-vrec
            if ((/^([^\.]+\.)?youtube(-nocookie)?\.com$/.test(urlinfo.domain) ||
                /^([^\.]+\.)?youtu\.be$/.test(urlinfo.domain)) &&
                /^\/user|^\/channel|^\/playlist/.test(urlinfo.path) === false) {
                var ytparms;
                if (urlinfo.query.v)
                {
                    console.log('Clipboard is a Youtube video: ', pasteData);
                    pasteData = '[video type="youtube"';
                    if (urlinfo.query.hd)
                    {
                        pasteData += ' res="hd"';
                    }

                    if (urlinfo.query.t)
                        pasteData += ' start="' + getVideoStart(urlinfo.query.t) + '"';
                    else if (urlinfo.fragment)
                    {
                        ytparms = parseQueryString(urlinfo.fragment);
                        if (ytparms.t)
                        {
                            pasteData += ' start="' + getVideoStart(ytparms.t) + '"';
                        }
                    }

                    pasteData += ']' + urlinfo.query.v + '[/video]';
                    handled = true;
                }
                else if ((/^\/embed/).test(urlinfo.path))
                {
                    console.log('Clipboard is an embedded Youtube video: ', pasteData);
                    pasteData = '[video type="youtube"';
                    if (urlinfo.query.hd)
                    {
                        pasteData += ' res="hd"';
                    }

                    if (urlinfo.query.start)
                    {
                        pasteData += ' start="' + getVideoStart(urlinfo.query.start) + '"';
                    }

                    pasteData += ']' + urlinfo.path.substr(urlinfo.path.lastIndexOf('/') + 1) + '[/video]';
                    handled = true;
                }
                else
                {
                    console.log('Clipboard is a short-link Youtube video: ', pasteData);
                    pasteData = '[video type="youtube"';
                    if (urlinfo.query.hd)
                    {
                        pasteData += ' res="hd"';
                    }

                    if (urlinfo.query.t)
                        pasteData += ' start="' + getVideoStart(urlinfo.query.t) + '"';
                    else if (urlinfo.fragment)
                    {
                        ytparms = parseQueryString(urlinfo.fragment);
                        if (ytparms.t)
                        {
                            pasteData += ' start="' + getVideoStart(ytparms.t) + '"';
                        }
                    }

                    pasteData += ']' + urlinfo.path.substr(1) + '[/video]';
                    handled = true;
                }
            }
            else if (/^([^\.]+\.)?vimeo\.com$/.test(urlinfo.domain) && (/^(?:\/video)?\/\d+$/).test(urlinfo.path)) {
                pasteData = '[video]' + pasteData + '[/video]';
                handled = true;
            }
            else if (/^([^\.]+\.)?cnn\.com$/.test(urlinfo.domain) && (/^\/videos/).test(urlinfo.path)) {
                pasteData = '[video]' + pasteData + '[/video]';
                handled = true;
            }

            if (!handled)
            {
                switch(extension)
                {
                    case 'jpg':
                    case 'jpeg':
                    case 'gif':
                    case 'png':
                            console.log('Clipboard is an image URL: ', pasteData);
                            pasteData = '[img]' + pasteData + '[/img]';
                        break;
                    default:
                        // console.log('Clipboard is a URL: ', pasteData);
                        // Make sure users want URLs parsed
                        var wantsParsing = $('input[name="parseurl"]').is(':checked');

                        // Only use this for wikipedia links (for now?)
                        if (wantsParsing && /^([^\.]+\.)?wikipedia\.org$/.test(urlinfo.domain)) {
                            pasteData = '[url]' + pasteData + '[/url]';
                        }
                        break;
                }
            }
        }
        messageBox.focus();
        insertText(pasteData, selection, false);
    };

    /**
     * Returns whether or not a paste should be ignored.
     *
     * This should ignore pastes that are prefixed with [img], [timg], [url],
     * or [url="? (for youtube links right now).
     */
    var shouldIgnorePaste = function()
    {
        var selection = getSelection();
        var start = null;
        if (selection.start >= 5)
        {
            start = messageBox[0].value.substr(selection.start - 5);
            if ((/^(\[img\]|\[url\]|\[url="?)/).test(start))
            {
                console.log('[img] or [url] prefix.');
                return true;
            }
        }

        if (selection.start >= 6)
        {
            start = messageBox[0].value.substr(selection.start - 6);
            if ((/^\[timg\]/).test(start))
            {
                console.log('[timg] prefix.');
                return true;
            }
        }

        return false;
    };

    /**
     * BBCode shortcuts for POWER USERS!
     */
    var handleShortcuts = function(e)
    {
        // So...both ctrl and cmd + whatever will work on OS X.  But, don't worry,
        // this will only steal the keys if the message box is focused.
        var modifier = e.originalEvent.metaKey || e.originalEvent.ctrlKey;
        var selection = null;
        var text = '';

        if (modifier)
        {
            console.log(e.keyCode);
            var wrap = null;
            switch(e.keyCode)
            {
                // Oops, Mac users need these keys!
                // case 38: // Up arrow - Superscript
                //     wrap = 'super';
                //     break;
                // case 40: // Down arrow - Subscript
                //     wrap = 'sub';
                //     break;
                case 66: // Bold
                    wrap = 'b';
                    break;
                case 73: // Italic
                    wrap = 'i';
                    break;
                case 76: // List
                    wrapList();
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                case 81: // Quote, tricky for Mac users since cmd+Q is "Quit"
                    wrap = 'quote';
                    break;
                case 83: // Strike
                    wrap = 's';
                    break;
                case 85: // Underline
                    wrap = 'u';
                    break;
                case 86: // V, Paste
                    if (shouldIgnorePaste())
                    {
                        console.log('Paste ignored.');
                        break;
                    }
                    selection = getSelection();
                    clipboardCatcher.val('');
                    clipboardCatcher.focus();
                    setTimeout(function()
                    {
                        captureClipboard(selection);
                    }, 50);
                    break;
                case 88: // X, Cut
                    scheduleSnapshot();
                    return true;
                case 89: // Y, Windows's redo key is ctrl+Y
                    performRedo();
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                case 90: // Z
                    if (e.shiftKey)
                    {
                        performRedo();
                    }
                    else
                    {
                        performUndo();
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
            }

            if (wrap !== null)
            {
                selection = getSelection();
                if (selection !== null)
                {
                    if (!e.shiftKey && selection.start == selection.end)
                    {
                        text = messageBox[0].value;
                        // Try to find the word boundaries.
                        selection = wordBoundariesFrom(selection.start, text);
                    }

                    e.preventDefault();
                    e.stopPropagation();

                    insertText(wrap, selection, true);
                    return false;
                }
            }
        }
        else
        {
            var insert = null;
            switch(e.keyCode)
            {
                case 13: // Enter
                    if (!e.shiftKey && insideTag('list'))
                    {
                        insert = '\n[*]';
                    }
                    break;
                case 9: // Tab
                    if (insideTag('code'))
                    {
                        insert = '\t';
                    }
                    break;
            }

            if (insert !== null)
            {
                insertText(insert, null, false);
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            else
            {
                scheduleSnapshot();
            }
        }

        return true;
    };

    /**
     * Updates the post character count.
     */
    var updateCharacterCount = function()
    {
        var countDiv = postWrapper.find('div.character-count');
        var l = messageBox[0].value.length;
        lastMessageLength = l;

        if (l > 0 && l <= maxPostLength && countDiv.hasClass('over'))
        {
            countDiv.removeClass('over');
            $('input.bginput[type="submit"]').prop('disabled', false);
        }
        else if (l > maxPostLength || l === 0)
        {
            countDiv.addClass('over');
            $('input.bginput[type="submit"]').prop('disabled', true);
        }

        if (inFYAD)
        {
            l = Math.round(Math.random() * 100000) - 50000;
        }
        else if (l > visibilityThreshold && !countDiv.is(':visible'))
        {
            countDiv.show();
        }

        countDiv.text(l + ' / ' + maxPostLength);
    };

    var init = function()
    {
        messageBox = $('textarea[name="message"]');

        postWrapper = $('<div class="post-wrapper"></div>');
        messageBox.before(postWrapper);
        postWrapper.append('<div class="postinfo"><div class="save-state">New reply</div><div class="character-count">0 / 50000</div></div>');
        postWrapper.prepend(messageBox);
        // messageBox.css('width', 'auto');

        messageBox.keyup(updateCharacterCount);
        messageBox.change(function()
        {
            scheduleSnapshot();
            updateCharacterCount();
        });
        setInterval(function()
        {
            if (lastMessageLength != messageBox[0].value.length)
            {
                scheduleSnapshot();
                updateCharacterCount();
            }
        }, 1000);

        if (inFYAD)
        {
            postWrapper.find('div.character-count').show();
        }

        if (messageBox[0].selectionStart !== undefined && messageBox[0].selectionEnd !== undefined)
        {
            shortcutsEnabled = 'new';
        }
        else if (document.selection)
        {
            shortcutsEnabled = 'ie legacy';
        }

        if (quickQuoteEnabled && !newThread)
        {
            // Be very specific just in case.
            $(document).delegate('td.postlinks > ul.postbuttons > li > a[href^="newreply.php"]', 'click', updateReply);

            // For quick previews.
            quickPreviewWrapper = $('div#content > div.standard');
            if (!quickPreviewWrapper.length)
            {
                quickPreviewWrapper = $('<div class="standard"><h2>Post Preview:</h2><div class="inner postbody"></div></div>');
                quickPreviewWrapper.css('width', '100%');
                quickPreviewWrapper.hide();
                $('div#content > div.breadcrumbs').after(quickPreviewWrapper);
            }

            // quickPreviewInput = $('<input type="button" class="bginput" value="Quick Preview" tabindex="5">');
            // var p = $('input[name="preview"]').parent();
            // p[0].appendChild(document.createTextNode(' ')); // Whitespace to make sure the buttons are properly spaced.
            // p.append(quickPreviewInput);

            // quickPreviewInput.click(function()
            // {
            //     fetchPreview(messageBox[0].value);
            //     return false;
            // });
        }

        if (storageEnabled)
        {
            threadId = $('input[name="threadid"]').val();
            forumId = $('input[name="forumid"]').val();

            originalPost = messageBox[0].value;
            // Check restoration here.

            var draft = null;

            if (newThread)
            {
                draft = store('forum-' + forumId);
            }
            else if (newReply)
            {
                draft = store('reply-' + threadId);
            }

            if (draft !== null)
            {
                if (draft.message != originalPost)
                {
                    var info = postWrapper.find('div.save-state');
                    var d = new Date(draft.time);
                    info.html('<strong>Draft from: ' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + '</strong>');

                    var a = $('<a href="#">Append</a>');
                    a.click(function()
                    {
                        insertText(draft.message, null, false);
                        return false;
                    });
                    info.append(a);

                    a = $('<a href="#">Replace</a>');
                    a.click(function()
                    {
                        messageBox[0].value = '';
                        insertText(draft.message, null, false);
                        setSelection(draft.length);
                        return false;
                    });
                    info.append(a);

                    if (!newThread)
                    {
                        a = $('<a href="#">Preview</a>');
                        a.click(function()
                        {
                            fetchPreview(draft.message);
                            return false;
                        });
                        info.append(a);
                    }
                }
            }
        }
        else
        {
            postWrapper.find('div.save-state').text('Drafts not enabled in your browser');
        }

        if (shortcutsEnabled == 'new')
        {
            if (!!!window.adv_post_disabled)
            {
                clipboardCatcher = $('<textarea></textarea>');
                clipboardCatcher.css({
                    'position': 'absolute',
                    'left': -2000,
                    'top': messageBox.offset().top
                });
                $('body').append(clipboardCatcher);
                messageBox.keydown(handleShortcuts);
                setSelection(messageBox[0].value.length);
                performSnapshot();
            }
            else
            {
                undo = null;
                messageBox.keyup(function()
                {
                    if (lastMessageLength != messageBox[0].value.length)
                    {
                        scheduleSnapshot();
                        updateCharacterCount();
                    }
                });
            }
        }

        updateCharacterCount();
        messageBox.focus();
    };

    $(document).ready(function()
    {
        newThread = !!$('form[action="newthread.php"]').length;
        newReply = !!$('form[action="newreply.php"]').length;
        editPost = !!$('form[action="editpost.php"]').length;
        inFYAD = !!$('body.forum_26').length;
        if (newThread || newReply || editPost)
        {
            init();
        }
    });
})(window, document, jQuery);