<?php

return function($site, $pages, $page) {
  
  if(!$site->user()) go('/login');
  
  $query   = get('q');
  $results = $site->index()->visible()->fuzzySearch($query, 'title|text');

  return array(
    'query'   => $query,
    'results' => $results,
  );

};