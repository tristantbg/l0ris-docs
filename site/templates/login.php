<?php snippet('header') ?>

<div class="content">
		<?php if($error): ?>
		<div class="alert">Identifiants incorrects</div>
		<br>
		<?php endif ?>

		<form method="post">
		  <div>
		    <label for="username">Username</label>
		    <br><input type="text" id="username" name="username">
		  </div>
		  <div>
		    <label for="password">Password</label>
		    <br><input type="password" id="password" name="password">
		  </div>
		  <div>
		    <br><input type="submit" name="login" value="Login">
		  </div>
		</form>
</div>

<?php snippet('footer') ?>