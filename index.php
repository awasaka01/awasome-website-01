<!DOCTYPE html> <html lang="en">
<head>
	
	<?php $page_title = "awasome website 01"; /*$page_icon = "";*/ include __DIR__."/app_config.php"; include HEAD; ?>
</head>
<body>
<script>
	document.body.style.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;</script>

	<div class="title-bar"><div>
		<p><?=$page_title?></p>
		<div class="title-bar-button" id="onekobutton"></div>
		<div class="title-bar-button" id="heartbutton"></div>
		<a href="/" class="title-bar-button" id="homebutton"></a>

	</div></div>



	<div id="heartcontainer">

	</div>
	<div id="page-list"></div>

</body>
</html>