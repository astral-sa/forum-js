var SearchHighlight = {
	/** Maximum number of highlight color classes to use. */
	classColors: 6,
	/** Array to hold terms to be highlighted */
	terms: [],

	parsePage: function() {
		this.findTerms();
		if (!this.terms.length) return true;
		var tds = $('td.postbody');
		for (var j = 0; j < this.terms.length; j++) {
			tds.mark(this.terms[j], {className: 'highlight'+ (j % this.classColors + 1)});
		}
	},

	findTerms: function() {
		if(!document.location.search.indexOf('highlight=')) return false;
		try {
			var qs = document.location.search.match(/highlight=[\w(:?+,)]+/)[0].split('=')[1].replace('+', ' ');
			this.terms = qs.indexOf(',') ? qs.split(',') : new Array(qs);
		}
		catch(e) {
			return false;
		}
	}
};

$(window).on('load', function() {
	SearchHighlight.parsePage();
});
