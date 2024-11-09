<!DOCTYPE html> <html lang="en">
<head>
	<?php $page_title = "awasome website 01"; /*$page_icon = "";*/ include __DIR__."/app_config.php"; include HEAD; ?>
</head>
<body>
<?php include NAVBAR; ?>

<div class="foooter"><img src="https://media1.tenor.com/m/EYUlar2QIe4AAAAd/plink.gif"></div>

<style>
/* Selects all elemetns with the class "foooter" */
.foooter {
	bottom: 0;
	width: 100%;
	height: 50px;

	/* Makes it follow the view while scrolling */
	position: fixed; 

	/* Display on top of everything (unless you have something with a higher z-index) */
	z-index: 999;
}
/* Selects all img elements that are a child of a 'footer' */
.foooter img  {
	width: 100%;
	height: 100%;
}




/* 
You should take the current spin animation out of the 'div' selector as that will make it apply to 
all divs, including this one which you probably don't want. 
Then with this you can add the  class="spin"  attribute to anything you want to spin 
*/
.spin * {
	animation: spin 950000ms linear infinite; }
	@keyframes spin { to { transform:rotate(-360deg); }
}

/* Alternite animaton using alternate to go back and forth >:3 */
.rock * {
	animation: rock 2000ms ease-in-out infinite alternate;
}
@keyframes rock { 
	from {transform: rotate(-40deg);} 
	to { transform:rotate(40deg); }
}
</style>




	<!-- <div id="heartcontainer"> -->

	<div id="page-list">

	</div>

</body>
</html>