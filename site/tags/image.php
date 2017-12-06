<?php

kirbytext::$tags['image'] = array(
  'attr' => array(
    'width',
    'height',
    'alt',
    'text',
    'title',
    'class',
    'imgclass',
    'linkclass',
    'caption',
    'link',
    'target',
    'popup',
    'rel'
  ),
  'html' => function($tag) {

    $url     = $tag->attr('image');
    $alt     = $tag->attr('alt');
    $title   = $tag->attr('title');
    $link    = $tag->attr('link');
    $caption = $tag->attr('caption');
    $file    = $tag->file($url);

    // use the file url if available and otherwise the given url
    $url = $file ? $file->url() : url($url);

    // alt is just an alternative for text
    if($text = $tag->attr('text')) $alt = $text;

    // try to get the title from the image object and use it as alt text
    if($file) {

      if(empty($alt) and $file->alt() != '') {
        $alt = $file->alt();
      }

      if(empty($title) and $file->title() != '') {
        $title = $file->title();
      }

    }

    // at least some accessibility for the image
    if(empty($alt)) $alt = $tag->page()->title()->html().' — © '.$tag->page()->date("Y").', '.site()->title()->html();

    // link builder
    $_link = function($image) use($tag, $url, $link, $file) {

      if(empty($link)) return $image;

      // build the href for the link
      if($link == 'self') {
        $href = $url;
      } else if($file and $link == $file->filename()) {
        $href = $file->url();
      } else if($tag->file($link)) {
        $href = $tag->file($link)->url();
      } else {
        $href = $link;
      }

      return html::a(url($href), $image, array(
        'rel'    => $tag->attr('rel'),
        'class'  => $tag->attr('linkclass'),
        'title'  => $tag->attr('title'),
        'target' => $tag->target()
      ));

    };
    

    // image builder
    $_image = function($class) use($tag, $url, $alt, $title, $file) {
    	$srcset = '';
		for ($i = 600; $i <= 1800; $i += 300) {
			$srcset .= $file->width($i)->url() . ' ' . $i . 'w,';
		}
      return html::img($url, array(
      	'src' => $file->width(1000)->url(),
        'width'  => '100%',
        'height' => 'auto',
        'class'  => 'lazyimg lazyload',
        'srcset' => 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
        'data-src' => $file->width(1000)->url(),
        'data-srcset' => $srcset,
        'data-sizes'  => 'auto',
        'data-optimumx'  => '1.3',
        'title'  => $title,
        'alt'    => $alt
      ));
    };

      $class = trim($tag->attr('class') . ' ' . $tag->attr('imgclass'));
      return $_link($_image($class)).'<noscript><img src="'.$file->width(1000)->url().'" alt="'.$alt.'" width="100%" height="auto" /></noscript>';

  }
);
