new function(window, document, $)
{
    var setup_thread_ratings = function()
    {
        var div = $('div.threadrate');
        var vote_messages = [
            'THANK GOD YOU VOTED!',
            'Just the vote we were looking for.',
            'You\'re a real gem.',
            'Thanks toots.',
            '*beep boop* vote accepted *bzzt*',
            'We threw your vote into the pile.',
            'Thank you, citizen!',
            'That was the best vote I have ever seen.',
            'That was a really good vote.',
            'Vote accepted!  Thanks a lot!',
            'Vot acepteed^ thinks aot',
            'Thanks champ!'
        ];

        if (!div.length)
        {
            return;
        }

        var thread = parseInt($('body').attr('data-thread'), 10);
        if (thread <= 0 || isNaN(thread))
        {
            return;
        }

        div.delegate('ul.rating_buttons li', 'click', function()
        {
            var vote = $(this).index() + 1;
            var data = {
                'threadid': thread,
                'vote': vote
            };

            console.log(data);

            $.post('/threadrate.php', data, function()
            {
                div.html(vote_messages[Math.floor(Math.random() * vote_messages.length)]);
            });
        });
    };

    $(document).ready(setup_thread_ratings);
}(window, document, jQuery);