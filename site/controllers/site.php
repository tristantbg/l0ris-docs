<?php

return function($site, $pages, $page) {

  // don't show the login screen to already logged in users
  if(!$site->user()) go('/login');

};