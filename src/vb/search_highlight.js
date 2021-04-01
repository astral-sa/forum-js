
var SearchHighlight = {
	colors: ['ff0', 'f0f', '0ff', 'f99', '9f9', 'd0f'],
	words: [],
	wordColors: [],

	parsePage: function() {
		this.findWords();
		this.parseTDs();
	},

	getColor: function(index) {
		return this.colors[index % this.colors.length];
	},

	findWords: function() {
		if(!document.location.search.indexOf('highlight=')) return false;
		try {
			var qs = document.location.search.match(/highlight=[\w(:?+,)]+/)[0].split('=')[1];
			this.words = qs.indexOf('+') ? qs.split(',') : new Array(qs);
		}
		catch(e) {
			return false;
		}
	},

	parseTDs: function() {
		if(!this.words.length) return true;
		var tds = $('td.postbody');
		for(var i = 0; i < tds.length; i++) {
			var html = tds[i].innerHTML;
			for(var j = 0; j < this.words.length; j++) {
				var word = this.words[j].replace('+', ' ').toLowerCase();
				html = this.highlight(html, word, this.getColor(j));
			}
			tds[i].innerHTML = html;
		}
	},

	highlight: function(text, word, color) {
		var pos = 0;
		var buf = '';
		while(text.length > 0) {
			var lctext = text.toLowerCase();
			pos = lctext.indexOf(word, pos + 1);
			if(pos < 0) return buf + text;

			try {
				if(text.lastIndexOf('>', pos) < text.lastIndexOf('<', pos)) throw '';
				if(text.lastIndexOf('/script>', pos) < text.lastIndexOf('<script', pos)) throw '';
			}
			catch(e) {
				continue;
			}

			buf += text.substring(0, pos) + '<b style="background:#' + color + '">' + text.substr(pos, word.length) + '</b>';
			text = text.substr(pos + word.length);
		}

		return buf;
	}
};

$(window).on('load', function() {
	SearchHighlight.parsePage();
});
