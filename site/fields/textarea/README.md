# Kirby Enhanced Textarea v1.7.1 <a href="https://www.paypal.me/medienbaecker"><img width="125" src="https://cloud.githubusercontent.com/assets/7975568/26115669/fb7041b0-3a60-11e7-8480-d1d5c303717c.png" alt="Buy me a beer"></a>

This textarea extends the built-in textarea without reinventing the wheel. Handy and customizable headline functions, intelligent list buttons and a custom page selector make editing textareas a breeze.

![Preview](https://cloud.githubusercontent.com/assets/7975568/26114866/b3d1ee64-3a5e-11e7-8da6-0154f5e3399f.gif)

## New Feature in 1.6: :confetti_ball: Autocomplete for Kirbytags :confetti_ball:

This field now automatically includes all the built-in and custom Kirbytags for its autocomplete function:

![Autocomplete](https://user-images.githubusercontent.com/7975568/29191428-f6e952fc-7e1d-11e7-8606-d8b9ee9f4ffe.gif)

If you want to use this feature you need to enable it in your `site/config.php` like this:

```
c::set('textarea.autocomplete', true);
```

## Installation

Download or clone this repository, put the folder into your `site/fields` folder and rename it to `textarea`. Alternatively you can also use the [Kirby CLI](https://github.com/getkirby/cli).

## Configuration

### Exclude from autocomplete

If you want to exclude some of the Kirbytags you can do that in the `site/config.phpg`:

```
c::set('textarea.excludedKirbyTags', array("gist", "vimeo", "youtube", "twitter"));
```

You can also include only some of your Kirbytags and exclude all the others like this:

```
c::set('textarea.includedKirbyTags', array("image", "link"));
```

### Buttons

You can globally define default buttons for any textarea on your site by setting the `textarea.buttons` variable in your `config.php`. By default the buttons `h2` (headline 2), `h3` (headline 3), `bold`, `italic`, `ulist` (unordered list), `olist` (ordered list), `link`, `page` and `email` are displayed. There are also buttons for `strikethrough`, `blockquote`, `h1`, `h4`, `h5` and `h6` you can use.

```
c::set('textarea.buttons', array(
  "h1",
  "strikethrough",
  "blockquote",
  "link",
  "page"
));
```


If you want to override this for a single field just use `buttons:` as you would with the built-in textarea:

```
test:
  type: textarea
  buttons:
    - h1
    - h2
    - bold
    - olist
    - link
```
