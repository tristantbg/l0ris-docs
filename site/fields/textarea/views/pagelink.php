<div class="modal-content pagelink modal-content-large">
  
  <form class="form" data-textarea="form-field-<?= $fieldname ?>" data-autosubmit="false" data-kirbytext="true">

    <div class="pages">
      <div class="rootpages">
        <?php 
        $subpages = site()->children();
        if (!function_exists("listpages")) {
          function listpages($subpages) {
            foreach ($subpages as $subpage) {
              echo('<div class="page"><div class="pagename">');
              echo('<span class="name">' . $subpage->title() . '</span>');
              if ($subpage->num() != "") $number = $subpage->num();
              else $number = "–";
              echo('<span class="number smallbox">' . $number . '</span>');
              echo('<span class="link smallbox active smalllink" data-link="' . $subpage->uri() . '"><i class="icon fa fa-link"></i></span>');
              if($subpage->children()->count() > 0) echo('<span class="slidedown active smallbox smalllink"><i class="icon fa fa-angle-down"></i></span>');
              else echo('<span class="slidedown smallbox smalllink">–</span>');
              echo('</div><div class="subpages d' . $subpage->depth() . '" style="background-color: rgba(0,0,0,' . $subpage->depth()/25 . ')">');
              if($subpage->children()->count() > 0)listpages($subpages = $subpage->children());
              echo('</div></div>');
            }
          }
        }
        listpages($subpages = site()->children());
        ?>
      </div>
    </div>
  
  </form>
  
</div> 