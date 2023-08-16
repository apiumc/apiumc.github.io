UMC.Src = '/UMC.UI/';
UMC.SPA = '/';
UMC(function ($) {

	var style = document.createElement("style");
	style.type = "text/css";
	style.textContent = '.umc-project-head.adver .umc-project-upgrade,.umc-project-head.editer .umc-project-upgrade {display: none;}';
	document.getElementsByTagName("HEAD").item(0).appendChild(style);


	var site = $('.header-sub-nav .menu-site');
	requestAnimationFrame(function () {
		$(window).on("page", function () {
			var path = location.pathname;
			site.find('li').cls('is-active', 0).find('a').each(function () {
				var m = $(this);
				var s = m.attr('ui-spa');

				var k = s ? ($.SPA + s) : m.attr('href');
				if (k == path) {
					m.parent().cls('is-active', 1);
					return false;
				}
			});
			var m = $('.box-card-user.dashboard');
			m.cls('is-active', m.attr('href') == path);
		}).on('popstate');
	});
	UMC.UI.Off('Login').On('Login', function () {
		location.reload(true);
	})

});