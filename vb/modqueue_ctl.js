
if(typeof $SA == 'undefined') $SA = {};

$SA.modQueueRequestUI = {
	$thread: {},
	$posts: {},
	$dialog: {},
	post_buttons: {},

	threadid: null,

	init: function() {
		var self = this;
		var menu = this.PostMenu;

		menu.init();
		menu.add_header('Mod Actions', 'mod_actions');
		menu.add_item('Probation', 'request_probation', 'request_probation');
		menu.add_item('Ban', 'request_ban', 'request_ban');
		menu.add_item('Title Change', 'request_title', 'request_title');

		$(menu).bind('item_selected', function(e, param) { self._handle_postmenu_selection(e, param) });

		this._prep_thread();
		this._prep_dialog();
		this._prep_buttons();

		this.set_buttons_busy(false);
	},

	dialog: function(p) {
		if(arguments.length == 1) this.$dialog.dialog(p);
		return this.$dialog;
	},

	get_button: function(postid) {
		if(arguments.length < 1) return;
		return this.post_buttons[postid];
	},

	set_buttons_busy: function(bool) {
		$.each(this.post_buttons, function(i, button) { button.set_busy(!!bool) });
	},

	_handle_postmenu_selection: function(e, param) {
		this.PostMenu.hide();
		this.set_buttons_busy(false);
	},

	// customize menu to match options for target post
	_menu_for_post: function($post, data) {
		var menu = this.PostMenu;
		menu.set_target($post);

		return menu;
	},

	_prep_thread: function() {
		this.$thread = $("#thread");
		this.$posts = $("#thread table.post");

		var threadid = this.threadid = this.$thread.get(0).className.match(/thread:(\d+)/)[1];
		this.$thread.data('threadid', this.threadid);

		this.$posts.each(function(i, e) {
			var postid = e.id.match(/(\d+)$/)[1];

			var $userinfo = $(e).find("td.userinfo, td.postbody > .userinfo");
			var userid = $userinfo.get(0).className.match(/userid-(\d+)/)[1];

			var m, role = 'user';
			if(m = $userinfo.find(".author").get(0).className.match(/role-([a-z]+)/i))
				role = m[1];

			$(e).data({ threadid: threadid, postid: postid, userid: userid, user_role: role });
		});
	},

	_prep_buttons: function() {
		var self = this;
		var menu = self.PostMenu;

		$('body').click(function() {
			if(menu.showing) {
				menu.hide();
				self.set_buttons_busy(false);
			}
		});

		this.$posts.each(function(i, e) {
			var data = $(e).data();

			if(data.user_role == 'deleted') return;

			var $con = $(".modqueue_ctl", e);
			$con.attr('title', 'Moderator options');

			var button = new $SA.modQueueRequestUI.PostMenuButton($con);
			$(button).click(function() {
				if(menu.showing) {
					menu.hide();
					self.set_buttons_busy(false);
					return false;
				}

				self._menu_for_post(e, data);

				if(!button.is_busy()) {
					self.set_buttons_busy(false);
					button.set_busy(true);
					button.set_active(true);

					var offset = $con.offset();
					var top = offset.top + $con.outerHeight();

					if (top + menu.$container.outerHeight() > $(document).height())
					{
						top = offset.top - menu.$container.outerHeight();
					}

					menu.move(top, offset.left + $con.outerWidth() + 0);
					menu.show();
				}
			});
			self.post_buttons[data.postid] = button;

			$con.show();
		});
	},

	_prep_dialog: function() {
		var self = this;
		this.$dialog = $('<div id="_modqueue_ctl_dialog"/>')
			.attr('title', 'ModQueue Request')
			.appendTo('body')
			.html('<b>Hello</b>')
			.dialog({
				autoOpen: false,
				modal: false,
				hidden: true,
				open: function() {
					self.set_buttons_busy(true);
				},
				close: function() {
					self.set_buttons_busy(false);
				},
				buttons: {
					'Submit': function() {
						self.dialog('close');
					},
					'Cancel': function() {
						self.dialog('close');
					}
				}
			})
		;
	}
};

$SA.modQueueRequestUI.PostMenuButton = function(ele) { this.init(ele) };
$SA.modQueueRequestUI.PostMenuButton.prototype = {
	$container: null,
	busy: false,
	active: false,

	init: function(ele) {
		this.bind_element(ele);
		this.set_busy(true);
	},

	bind_element: function(ele) {
		var self = this;
		self.$container = $(ele);
		self.$container.click(function(e) {
			e.stopPropagation();
			$(self).triggerHandler('click');
		});
	},

	set_active: function(bool) {
		this.active = !!bool;
		this.$container.toggleClass('active', this.active);
	},

	set_busy: function(bool) {
		this.busy = !!bool;
		this.$container.toggleClass('busy', this.busy);
	},

	is_busy: function() {
		return this.busy;
	}
};

$SA.modQueueRequestUI.PostMenu = {
	$container: null,
	$target_post: null,
	$menu_ul: null,

	showing: false,

	init: function() {
		this.$menu_ul = $("<ul/>");
		this.$container = $("<div/>").addClass("modqueue_ctl_postmenu").append(this.$menu_ul).appendTo("body").hide();

		this.$container.click(function(e) {
			if(e.target.tagName != 'A') e.stopPropagation();
		});
	},

	clear: function() {
		this.$menu_ul.empty()
	},

	add_header: function(label, css_class) {
		var self = this;
		var $li = $('<li class="header"/>').addClass(css_class).html(label);
		this.$menu_ul.append($li);
	},

	add_item: function(label, css_class, value) {
		var self = this;

		var $li = $('<li class="item"/>').addClass(css_class);
		var $a = $('<a/>').appendTo($li).html(label);
		$a.attr('target', '_top');
		$a.data('action', value);
		$a.click(function(e) {
			$(self).trigger('item_selected', {});
		});

		this.$menu_ul.append($li);
	},

	set_target: function($post) {
		this.$target_post = $post;
		this.update_items();
	},

	update_items: function() {
		var self = this;
		var $items = self.$menu_ul.find('.item a');

		var data = $(self.$target_post).data();
		var url = '/modqueue.php?action=';
		var p = '&userid=' + data.userid + '&tpostid=' + data.postid + '&threadid=' + data.threadid;

		$items.each(function(i) {
			var action = $(this).data('action');
			$(this).attr('href', url + action + p);
		});

	},

	move: function(top, left) {
		var w = this.$container.outerWidth();
		this.$container.css({ top: top, left: left - w});
	},

	show: function() { this.$container.show(); this.showing = true; },
	hide: function() { this.$container.hide(); this.showing = false; }
};

$(document).ready(function() {
	$SA.modQueueRequestUI.init();
});

