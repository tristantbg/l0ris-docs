!function($){$.fn.editor=function(){return this.each(function(){if($(this).data("editor"))return $(this);var t=$(this),e=t.parent().find(".field-buttons");t.autosize(),e.find(".btn").on("click.editorButton",function(e){function n(t){var e=t.value.substr(0,t.selectionStart).split("\n").length,n=t.value.substr(0,t.selectionStart).split("\n");n.splice(-1,1);var i=n.join("\n").length;n.length>0&&i++,t.focus(),t.setSelectionRange(i,i)}function i(e){var n=e.value.substr(0,e.selectionStart).split("\n").length,i=e.value.substr(0,e.selectionStart).split("\n");i.splice(-1,1);var a=i.join("\n").length;i.length>0&&a++,e.focus(),e.setSelectionRange(a,l),s=t[0].selectionStart,l=t[0].selectionEnd}t.focus();var a=$(this);if(a.data("action"))app.modal.open(a.data("action"),function(){$(".modal .slidedown.active").on("click",function(){$(this).toggleClass("open").closest(".page").children(".subpages").slideToggle(250,function(){var t=$(".modal-content");console.log(t.center(48))})}),$(".modal .link.smalllink").on("click",function(){t=$("#"+$(".modal form").data("textarea")),link=$(this).data("link"),name=$(this).siblings(".name").html();var e=t.getSelection();e.length>0&&(name=e),t.insertAtCursor("(link: "+link+" text: "+name+")"),t.trigger("autosize.resize"),app.modal.close()})});else{var r=t.getSelection(),s=t[0].selectionStart,l=t[0].selectionEnd,o=a.data("tpl"),c=a.data("text"),u=a.hasClass("list")||a.hasClass("header"),d=a.hasClass("list");if(u){var h=t[0];n(h)}if(d&&r.indexOf("\n")>=0){i(h);for(var f=t.getSelection().split("\n"),g=0;g<f.length;g++)f[g]=o+f[g];f=f.join("\n");var p=t[0].value.slice(0,s),v=t[0].value.slice(l);t[0].value=p+f+v}else{r.length>0&&(c=r);var b=o.replace("{text}",c);t.insertAtCursor(b)}t.trigger("autosize.resize")}return!1}),e.find("[data-editor-shortcut]").each(function(e,n){var i=$(this).data("editor-shortcut"),a=function(t){return $(n).trigger("click"),!1};t.bind("keydown",i,a),i.match(/meta\+/)&&t.bind("keydown",i.replace("meta+","ctrl+"),a)});var n=new Array,i=new Array;e.find(".kirbytags .kirbytag").each(function(){n.push($(this).find(".kirbytag-name").text()),kirbyTagAttributes=new Array,$(this).find(".attributes .attribute").each(function(){kirbyTagAttributes.push($(this).text())}),i.push(kirbyTagAttributes)}),t.textcomplete([{id:"kirbytags",match:/\((\w*)$/,search:function(t,e){e($.map(n,function(e){return 0===e.indexOf(t)?e:null}))},index:1,replace:function(t){return["("+t+": ",")"]}}]).on({"textComplete:select":function(t,e,a){for(var r=0;r<n.length;r++)n[r]==e&&console.log(i[r])}}),t.data("editor",!0)})}}(jQuery);