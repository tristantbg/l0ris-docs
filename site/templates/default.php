<?php snippet('header') ?>

<div class="content">
		<?php snippet('breadcrumb') ?>
		<?= $page->text()->kt() ?>

		<?php $subpages = $page->children()->visible() ?>
		<?php if($subpages->count() > 0): ?>
		<ul id="subpages">
		  <li style="margin-bottom: 1em;"><strong>Sous-catégories</strong></li>
		  <?php foreach($subpages as $p): ?>
		  <li class="depth-<?php echo $p->depth() ?>">
		    <a<?php e($p->isActive(), ' class="active"') ?> href="<?php echo $p->url() ?>"><?php echo $p->title()->html() ?></a>
		    <?php if($p->hasChildren()): ?>
		    <?php snippet('treemenu', array('subpages' => $p->children())) ?>
		    <?php endif ?>
		  </li>
		  <?php endforeach ?>
		</ul>
		<?php endif ?>
</div>

<?php snippet('footer') ?>