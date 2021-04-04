
var SearchHighlight = {
	colors: ['ff0', 'f0f', '0ff', 'f99', '9f9', 'd0f'],
	words: [],
	wordRegex: [],

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
			var qs = document.location.search.match(/highlight=[\w(:?+,)]+/)[0].split('=')[1].replace('+', ' ');
			this.words = qs.indexOf(',') ? qs.split(',') : new Array(qs);
			this.wordRegex = this.words.map(function(someWord) {
				return new RegExp(someWord, "gi");
			});
		}
		catch(e) {
			return false;
		}
	},

	parseTDs: function() {
		if (!this.words.length) return true;
		var tds = $('td.postbody');
		for (var i = 0; i < tds.length; i++) {
			this.highlightNode(tds[i]);
		}
	},
	highlightNode: function(node) {
		var that = this;
		$(node).contents().filter(function() {
			if (this.nodeType === 1 && this.childNodes && this.nodeName.toLowerCase() !== 'script' && this.nodeName.toLowerCase() !== 'style') {
				that.highlightNode(this);
				return false;
			}
			return this.nodeType === 3 && $.trim(this.nodeValue).length;
		}).replaceWith(function() {
			var working = this.nodeValue || "";
			for (var j = 0; j < that.words.length; j++) {
				working = working.replace(that.wordRegex[j], function(match) {
					return '<b style="background:#' + that.getColor(j) + '">' + match + '</b>';
				});
			}
			return working;
		});
	}
};

$(window).on('load', function() {
	SearchHighlight.parsePage();
});
