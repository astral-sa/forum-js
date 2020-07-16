/**
 * @file Adds smilie search and copy-to-clipboard functionality to the smilies list.
 */

var emoteArray = [];

function buildEmoteArray() {
	var container = document.getElementById("emote_search_container");
	container.addEventListener("input", searchEvent);
	var elementArray = document.getElementsByClassName("smilie");

	for (var i = 0; i < elementArray.length; i++) {
	var item = elementArray.item(i);
	var emoteObject = {
		name: item.innerText,
		meta: item.querySelector("img").title,
		element: item,
		compare: function(searchTerm) {
			// Check that each word is present in the code/description
			var searchTermWords = searchTerm.split(' ');
			for (var i = 0; i < searchTermWords.length; i++) {
				if (!this.name.toLowerCase().includes(searchTermWords[i].toLowerCase()) && !this.meta.toLowerCase().includes(searchTermWords[i].toLowerCase())) {
					return false;
				}
			}
			return true;
		},
		setVisible: function(isVisible) {
			var item = this.element;
			isVisible ? item.style.display = "block" : item.style.display = "none";
		}
	};
	emoteArray.push(emoteObject);
	}
}

/*
	RUNTIME FUNCTIONS
*/

//the function to trigger the search when the listener event happens
function searchEvent(event) {
	searchEmotes(event.target.value);
}

//cycles through the index of emotes and triggers evaluation of each one
function searchEmotes(searchTerm) {
	for (var i = 0; i < emoteArray.length; i++) {
		emoteArray[i].setVisible(emoteArray[i].compare(searchTerm));
	}
}

/*
	CODE TO RUN TO ACTUALLY INITIALIZE ALL THIS
*/
$(document).ready(function() {
	buildEmoteArray();

	// Hook up clipboard events
	$('.smilie').on('click', function(e) {
		get_text(e.currentTarget);
		return true;
	});
});

/**
 * Copies text to the clipboard.
 * @param {string} txt The text to copy.
 */
function cb(txt) {
	var $tempNode = $("<input>");
	$("body").append($tempNode);
	$tempNode.val(txt);
	$tempNode.select();
	document.execCommand("copy");
	$tempNode.remove();
}

/**
 * Gets the text from a smilie LI.
 * @param {HTMLElement} el The element to get text from.
 */
function get_text(el) {
	if(el.tagName != 'LI')
		return;
	var smtext = el.getElementsByClassName('text')[0].innerText;
	cb(smtext);
}
