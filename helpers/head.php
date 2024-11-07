<?php
if (empty($page_title)) { $page_title = 'default title haha'; }
if (empty($page_icon)) { $page_icon = '/media/images/icon.ico'; }
?>

<!-- Meta -->
<meta charset="UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="author" content="awa"/>


<!-- Display -->
<title><?=$page_title?></title>
<link rel="icon" href=<?=$page_icon?> type="image/gif"/>


<!-- Helpers + External Modules -->
<script type="importmap">{"imports":{
	"awa": "/helpers/helpers.js",
	"chroma-js": "https://unpkg.com/chroma-js@3.0.0/index.js"
}}</script>


<!-- Local CSS and JS -->
<link rel="stylesheet" href="main.css"/>
<script src="main.js" type="module"></script>