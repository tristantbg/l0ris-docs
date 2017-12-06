<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1.0">

	<title><?= $site->title()->html() ?> | <?= $page->title()->html() ?></title>
	<meta name="description" content="<?= $site->description()->html() ?>">
	<?= css('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700') ?>
	<?= css('assets/css/style.css') ?>
	<?= css('assets/css/prism.css') ?>
	<?= css('assets/plugins/embed/css/embed.css') ?>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/lazysizes/4.0.1/lazysizes.min.js" integrity="sha256-mP1tN6TUnhZRrt9JhXuwIfbGEFjCYqoB7SRE0/gcXzk=" crossorigin="anonymous"></script>
	<link rel="icon" href="<?php echo url('assets/images/favicon.png?v=3') ?>" />
</head>
<body>
	<div class="wrap">
		<nav class="menu">
			<?php if ($site->user()): ?>
			<form action="<?= url() ?>/search"><input type="search" class="search" name="q" placeholder="Search..."/></form>
			<?php snippet('treemenu') ?>
			<?php else: ?>
			<h2>Espace privé</h2>		
			<?php endif ?>
		</nav>
