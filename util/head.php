<?php
if (empty($page_title)) { $page_title = 'default title haha'; }
if (empty($page_icon)) { $page_icon = './images/icon.ico'; }
?>

<!-- Meta -->
<meta charset="UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="author" content="awa" />

<!-- Display -->
<title><?=$page_title?></title>
<link rel="icon" href=<?=$page_icon?> type="image/gif" />

<!-- Util -->
<link rel="stylesheet" href="/util/util.css"/>
<script src="/util/util.js" type="module"></script>

<!-- Local CSS and JS -->
<link rel="stylesheet" href="index.css" />
<script src="index.js" type="module"></script>

<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />