(function () {
	$(document).ready(function () {
		var $header = $('<div id="calcentral-custom-header">');
		var $logo = $('<div id="calcentral-custom-header-logo"/>');
		var $links = $('<ul/>');
		var $dashboard = $('<li><a href="https://calcentral-dev.berkeley.edu/secure/dashboard">My Dashboard</a></li>').appendTo($links);
		var $campus = $('<li><a href="https://calcentral-dev.berkeley.edu/secure/campus">My Campus</a></li>').appendTo($links);
		$logo.appendTo($header);
		$links.appendTo($header);
		$('#header-inner').before($header);
	});
})();
