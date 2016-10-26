function supportsTransitions() {
	return getSupportedTransition() != '';
}

function getSupportedTransition() {
	var b = document.body || document.documentElement,
        s = b.style,
        p = 'transition';

    if (typeof s[p] == 'string') { return p; }

    // Tests for vendor specific prop
    var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
    p = p.charAt(0).toUpperCase() + p.substr(1);

    for (var i=0; i<v.length; i++) {
        if (typeof s[v[i] + p] == 'string') { return true; }
    }

    return '';
}
window.supportedTransition = getSupportedTransition();
window.supportsTransitions = supportsTransitions();

function supportsAnimations() {
	return getSupportedAnimation() != '';
}

function getSupportedAnimation() {
	var t,
		el = document.createElement("fakeelement");

	var animations = {
		"animation"      : "animationend",
		"OAnimation"     : "oAnimationEnd",
		"MozAnimation"   : "animationend",
		"WebkitAnimation": "webkitAnimationEnd",
		'msAnimation' : 'MSAnimationEnd'
	};

	for (t in animations){
		if (el.style[t] !== undefined) {
			return t;
		}
	}
	return '';
}
window.supportedAnimation = getSupportedAnimation();
window.supportsAnimations = supportsAnimations();


(function() {
	var logoFixTimeout = false;

	function getElementPosition(elem) {
		var w = elem.offsetWidth,
			h = elem.offsetHeight,
			l = 0,
			t = 0;

		while (elem) {
			l += elem.offsetLeft;
			t += elem.offsetTop;
			elem = elem.offsetParent;
		}
		return {"left":l, "top":t, "width": w, "height":h};
	}

	function fixMenuLogoPosition() {
		if (logoFixTimeout) {
			clearTimeout(logoFixTimeout);
		}

		logoFixTimeout = setTimeout(function() {
			var page = document.getElementById('page'),
				primaryMenu = document.getElementById('primary-menu'),
				primaryNavigation = document.getElementById('primary-navigation'),
				headerMain = document.querySelector('#site-header .header-main'),
				windowWidth = page.offsetWidth;

			if (headerMain == null || headerMain.className.indexOf('logo-position-menu_center') == -1 || headerMain.className.indexOf('header-layout-fullwidth_hamburger') != -1 || headerMain.className.indexOf('header-layout-vertical') != -1) {
				return false;
			}
			if (windowWidth < 1212) {
				primaryNavigation.style.textAlign = '';
				primaryMenu.style.position = '';
				primaryMenu.style.left = '';
				return;
			}

			primaryNavigation.style.textAlign = 'left';
			primaryMenu.style.left = 0 + 'px';

			var pageCenter = windowWidth / 2,
				logoOffset = getElementPosition(document.querySelector('#site-header .header-main #primary-navigation .menu-item-logo')),
				pageOffset = getElementPosition(page),
				offset = pageCenter - (logoOffset.left - pageOffset.left) - document.querySelector('#site-header .header-main #primary-navigation .menu-item-logo').offsetWidth / 2;

			primaryMenu.style.position = 'relative';
			primaryMenu.style.left = offset + 'px';
		}, 100);
	}

	window.fixMenuLogoPosition = fixMenuLogoPosition;

	//window.addEventListener("resize", fixMenuLogoPosition, true);
	//fixMenuLogoPosition();
})();


(function($) {
    /* PRIMARY MENU */

	var isVerticalMenu = $('.header-main').hasClass('header-layout-vertical'),
		isHamburgerMenu = $('.header-main').hasClass('header-layout-fullwidth_hamburger');

	$(window).resize(function() {
	    window.updateGemClientSize(false);
		window.updateGemInnerSize();
	});

	window.menuResizeTimeoutHandler = false;

    var megaMenuSettings = {};

    function getOffset(elem) {
		if (elem.getBoundingClientRect && window.gemBrowser.platform.name != 'ios'){
			var bound = elem.getBoundingClientRect(),
				html = elem.ownerDocument.documentElement,
				htmlScroll = getScroll(html),
				elemScrolls = getScrolls(elem),
				isFixed = (styleString(elem, 'position') == 'fixed');
			return {
				x: parseInt(bound.left) + elemScrolls.x + ((isFixed) ? 0 : htmlScroll.x) - html.clientLeft,
				y: parseInt(bound.top)  + elemScrolls.y + ((isFixed) ? 0 : htmlScroll.y) - html.clientTop
			};
		}

		var element = elem, position = {x: 0, y: 0};
		if (isBody(elem)) return position;

		while (element && !isBody(element)){
			position.x += element.offsetLeft;
			position.y += element.offsetTop;

			if (window.gemBrowser.name == 'firefox'){
				if (!borderBox(element)){
					position.x += leftBorder(element);
					position.y += topBorder(element);
				}
				var parent = element.parentNode;
				if (parent && styleString(parent, 'overflow') != 'visible'){
					position.x += leftBorder(parent);
					position.y += topBorder(parent);
				}
			} else if (element != elem && window.gemBrowser.name == 'safari'){
				position.x += leftBorder(element);
				position.y += topBorder(element);
			}

			element = element.offsetParent;
		}
		if (window.gemBrowser.name == 'firefox' && !borderBox(elem)){
			position.x -= leftBorder(elem);
			position.y -= topBorder(elem);
		}
		return position;
	};

	function getScroll(elem){
		return {x: window.pageXOffset || document.documentElement.scrollLeft, y: window.pageYOffset || document.documentElement.scrollTop};
	};

	function getScrolls(elem){
		var element = elem.parentNode, position = {x: 0, y: 0};
		while (element && !isBody(element)){
			position.x += element.scrollLeft;
			position.y += element.scrollTop;
			element = element.parentNode;
		}
		return position;
	};

	function styleString(element, style) {
		return $(element).css(style);
	};

	function styleNumber(element, style){
		return parseInt(styleString(element, style)) || 0;
	};

	function borderBox(element){
		return styleString(element, '-moz-box-sizing') == 'border-box';
	};

	function topBorder(element){
		return styleNumber(element, 'border-top-width');
	};

	function leftBorder(element){
		return styleNumber(element, 'border-left-width');
	};

	function isBody(element){
		return (/^(?:body|html)$/i).test(element.tagName);
	};


    function checkMegaMenuSettings() {
		if (window.customMegaMenuSettings == undefined || window.customMegaMenuSettings == null) {
			return false;
		}

		var uri = window.location.pathname;

		window.customMegaMenuSettings.forEach(function(item) {
			for (var i = 0; i < item.urls.length; i++) {
				if (uri.match(item.urls[i])) {
					megaMenuSettings[item.menuItem] = item.data;
				}
			}
		});
	}

	function fixMegaMenuWithSettings() {
		checkMegaMenuSettings();

		$('#primary-menu > li.megamenu-enable').each(function() {
			var m = this.className.match(/(menu-item-(\d+))/);
			if (!m) {
				return;
			}

			var itemId = parseInt(m[2]);
			if (megaMenuSettings[itemId] == undefined || megaMenuSettings[itemId] == null) {
				return;
			}

			var $item = $('> ul', this);

			if (megaMenuSettings[itemId].masonry != undefined) {
				if (megaMenuSettings[itemId].masonry) {
					$item.addClass('megamenu-masonry');
				} else {
					$item.removeClass('megamenu-masonry');
				}
			}

			if (megaMenuSettings[itemId].style != undefined) {
				$(this).removeClass('megamenu-style-default megamenu-style-grid').addClass('megamenu-style-' + megaMenuSettings[itemId].style);
			}

			var css = {};

			if (megaMenuSettings[itemId].backgroundImage != undefined) {
				css.backgroundImage = megaMenuSettings[itemId].backgroundImage;
			}

			if (megaMenuSettings[itemId].backgroundPosition != undefined) {
				css.backgroundPosition = megaMenuSettings[itemId].backgroundPosition;
			}

			if (megaMenuSettings[itemId].padding != undefined) {
				css.padding = megaMenuSettings[itemId].padding;
			}

			if (megaMenuSettings[itemId].borderRight != undefined) {
				css.borderRight = megaMenuSettings[itemId].borderRight;
			}

			$item.css(css);
		});
	}

	function isResponsiveMenuVisible() {
		if (window.gemSettings.tabletLandscape) {
			return window.gemOptions.clientWidth < 1213;
		}
		if (window.gemSettings.tabletPortrait) {
			return window.gemOptions.clientWidth < 980;
		}
		return window.gemOptions.clientWidth < 768;
	}
	window.isResponsiveMenuVisible = isResponsiveMenuVisible;

	function isTopAreaVisible() {
		return window.gemSettings.topAreaMobileDisable ? window.gemOptions.clientWidth >= 768 : true;
	}
	window.isTopAreaVisible = isTopAreaVisible;

	function isVerticalToggleVisible() {
		return window.gemOptions.clientWidth > 1600;
	}

	$('#primary-menu > li.megamenu-enable').hover(
		function() {
			fix_megamenu_position(this);
		},
		function() {}
	);

	function fix_megamenu_position(elem) {
		if (!$('.megamenu-inited', elem).length && isResponsiveMenuVisible()) {
			return false;
		}

			var $item = $('> ul', elem);
			if($item.length == 0) return;
			var self = $item.get(0);
			//$item.addClass('without-transition');

			var default_item_css = {
				width: 'auto',
				height: 'auto'
			};

			if (!isVerticalMenu && !isHamburgerMenu) {
				default_item_css.left = 0;
			}

			$item
				.removeClass('megamenu-masonry-inited megamenu-fullwidth')
				.css(default_item_css);

			$(' > li', $item).css({
				left: 0,
				top: 0
			}).each(function() {
				var old_width = $(this).data('old-width') || -1;
				if (old_width != -1) {
					$(this).width(old_width).data('old-width', -1);
				}
			});

			if (isResponsiveMenuVisible()) {
				return;
			}

			if (isVerticalMenu) {
				var container_width = window.gemOptions.clientWidth - $('#site-header-wrapper').outerWidth();
			} else if (isHamburgerMenu) {
				var container_width = window.gemOptions.clientWidth - $('#primary-menu').outerWidth();
			} else {
				var $container = $item.closest('.header-main'),
					container_width = $container.width(),
					container_padding_left = parseInt($container.css('padding-left')),
					container_padding_right = parseInt($container.css('padding-right')),
					parent_width = $item.parent().outerWidth();
			}

			var megamenu_width = $item.outerWidth();

			if (megamenu_width > container_width) {
				megamenu_width = container_width;
				var new_megamenu_width = container_width - parseInt($item.css('padding-left')) - parseInt($item.css('padding-right'));
				var columns = $item.data('megamenu-columns') || 4;
				var column_width = parseFloat(new_megamenu_width - columns * parseInt($(' > li:first', $item).css('margin-left'))) / columns;
				var column_width_int = parseInt(column_width);
				$(' > li', $item).each(function() {
					$(this).data('old-width', $(this).width()).css('width', column_width_int);
				});
				$item.addClass('megamenu-fullwidth').width(new_megamenu_width - (column_width - column_width_int) * columns);
			}

			if (!isVerticalMenu && !isHamburgerMenu) {
				if (megamenu_width > parent_width) {
					var left = -(megamenu_width - parent_width) / 2;
				} else {
					var left = 0;
				}

				var container_offset = getOffset($container[0]);
				var megamenu_offset = getOffset(self);

				if ((megamenu_offset.x - container_offset.x - container_padding_left + left) < 0) {
					left = -(megamenu_offset.x - container_offset.x - container_padding_left);
				}

				if ((megamenu_offset.x + megamenu_width + left) > (container_offset.x + $container.outerWidth() - container_padding_right)) {
					left -= (megamenu_offset.x + megamenu_width + left) - (container_offset.x + $container.outerWidth() - container_padding_right);
				}

				$item.css('left', left).css('left');
			}

			if ($item.hasClass('megamenu-masonry')) {
				var positions = {},
					max_bottom = 0;

				$item.width($item.width() - 1);
				var new_row_height = $('.megamenu-new-row', $item).outerHeight() + parseInt($('.megamenu-new-row', $item).css('margin-bottom'));

				$('> li.menu-item', $item).each(function() {
					var pos = $(this).position();
					if (positions[pos.left] != null && positions[pos.left] != undefined) {
						var top_position = positions[pos.left];
					} else {
						var top_position = pos.top;
					}
					positions[pos.left] = top_position + $(this).outerHeight() + new_row_height + parseInt($(this).css('margin-bottom'));
					if (positions[pos.left] > max_bottom)
						max_bottom = positions[pos.left];
					$(this).css({
						left: pos.left,
						top: top_position
					})
				});

				$item.height(max_bottom - new_row_height - parseInt($item.css('padding-top')) - 1);
				$item.addClass('megamenu-masonry-inited');
			}

			if ($item.hasClass('megamenu-empty-right')) {
				var mega_width = $item.width();
				var max_rights = {
					columns: [],
					position: -1
				};

				$('> li.menu-item', $item).removeClass('megamenu-no-right-border').each(function() {
					var pos = $(this).position();
					var column_right_position = pos.left + $(this).width();

					if (column_right_position > max_rights.position) {
						max_rights.position = column_right_position;
						max_rights.columns = [];
					}

					if (column_right_position == max_rights.position) {
						max_rights.columns.push($(this));
					}
				});

				if (max_rights.columns.length && max_rights.position >= (mega_width - 7)) {
					max_rights.columns.forEach(function($li) {
						$li.addClass('megamenu-no-right-border');
					});
				}
			}

			if (isVerticalMenu || isHamburgerMenu) {
				var clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
					itemOffset = $item.offset(),
					itemHeight = $item.outerHeight(),
					scrollTop = $(window).scrollTop();

				if (itemOffset.top - scrollTop + itemHeight > clientHeight) {
					$item.css({
						top: clientHeight - itemOffset.top + scrollTop - itemHeight - 20
					});
				}
			}

			$item.addClass('megamenu-inited');
	}

	function primary_menu_reinit() {
		if(isResponsiveMenuVisible()) {
			var $submenuDisabled = $('#primary-navigation .dl-submenu-disabled');
			if ($submenuDisabled.length) {
				$submenuDisabled.addClass('dl-submenu').removeClass('dl-submenu-disabled');
			}
			if ($('#primary-menu').hasClass('no-responsive')) {
			$('#primary-menu').removeClass('no-responsive');
			}
			if (!$('#primary-navigation').hasClass('responsive')) {
			$('#primary-navigation').addClass('responsive');
			}
		} else {
			$('#primary-navigation').addClass('without-transition');

			$('#primary-navigation .dl-submenu').addClass('dl-submenu-disabled').removeClass('dl-submenu');
			$('#primary-menu').addClass('no-responsive');
			$('#primary-navigation').removeClass('responsive');

			$('#primary-menu ul:not(.minicart ul), #primary-menu .minicart, #primary-menu .minisearch').each(function() {
				var $item = $(this);
				var self = this;
				$item.removeClass('invert');
				$item.removeClass('vertical-invert');
				$item.css({top: ''});
				if ($item.closest('.megamenu-enable').size() == 0) {
					if($item.offset().left - $('#page').offset().left + $item.outerWidth() > $('#page').width()) {
						$item.addClass('invert');
					}
					if($('.header-main').first().hasClass('header-style-vertical')) {
						if($item.offset().top - $('#site-header-wrapper').offset().top + $item.outerHeight() > $(window).height()) {
							$item.addClass('vertical-invert');
							$item.css({ top: -($item.offset().top - $('#site-header-wrapper').offset().top + $item.outerHeight() - $(window).height()) + 'px' });
						}
					} else if($item, $item.parents('#primary-menu ul').length) {
						if($item.offset().top - $('#site-header-wrapper').offset().top + $item.outerHeight() > $(window).height()) {
							$item.addClass('vertical-invert');
							$item.css({ top: -($item.offset().top - $('#site-header-wrapper').offset().top + $item.outerHeight() - $(window).height()) + 'px' });
						}
					}
				}
			});

			$('#primary-navigation').removeClass('without-transition');
		}
		window.fixMenuLogoPosition();
	}

	$('#primary-navigation .submenu-languages').addClass('dl-submenu');
	$('#primary-navigation > ul> li.menu-item-language').addClass('menu-item-parent');

	fixMegaMenuWithSettings();

	$('#primary-navigation').dlmenu({
		animationClasses: {
			classin : 'dl-animate-in',
			classout : 'dl-animate-out'
		},
		onLevelClick: function (el, name) {
			$('html, body').animate({ scrollTop : 0 });
		}
	});
	primary_menu_reinit();

	$('.hamburger-toggle').click(function(e) {
		e.preventDefault();
		$(this).closest('#primary-navigation').toggleClass('hamburger-active');
		$('.hamburger-overlay').toggleClass('active');
	});

	$('.vertical-toggle').click(function(e) {
		e.preventDefault();
		$(this).closest('#site-header-wrapper').toggleClass('vertical-active');
	});

	$(function() {
		$(window).resize(function() {
			if (window.menuResizeTimeoutHandler) {
				clearTimeout(window.menuResizeTimeoutHandler);
			}
			window.menuResizeTimeoutHandler = setTimeout(primary_menu_reinit, 50);
		});
	});

	$('#primary-navigation a').click(function(e) {
		var $item = $(this);
		if($('#primary-menu').hasClass('no-responsive') && window.gemSettings.isTouch && $item.next('ul').length) {
			e.preventDefault();
		}
	});
})(jQuery);
