<?php
	snippet('header');
?>

<div class="content">
		
	<div class="results">

		<?php if($results->count() > 0): ?>

		<ul>
		  <?php foreach($results as $result): ?>
		  <li>
		    <a href="<?php echo $result->url() ?>">
		      <strong><?= $result->title()->html() ?></strong>
		      <br><?= $result->text()->excerpt(200) ?>
		      <strong>(Voir plus…)</strong>
		    </a>
		  </li>
		  <?php endforeach ?>
		</ul>

		<?php else: ?>
		<div class="no-results">No results for <strong><?= $query ?></strong></div>
		<?php endif ?>

	</div>

</div>
<div style="clear:both"></div>

<?php snippet('footer') ?>