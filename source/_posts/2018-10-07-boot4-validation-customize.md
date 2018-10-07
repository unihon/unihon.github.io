---
layout: post
title: 结合ajax修改bootstrap4的表单验证
date: 2018-10-07 16:28:27
updated: 2018-10-07 16:28:27
categories:
- web
tags:
- bootstrap
- ajax
---

bootstrap4表单验证的触发事件是表单的`submit`事件，如果用的ajax方式上传表单，显然是触发不了boot4的表单验证。因此对boot4的原码做些修改，使其验证支持`ajax`上传方式。

[bootstrap4官网表单验证版块](https://getbootstrap.com/docs/4.0/components/forms/#validation)

![](/2018-10/boot4-validation-customize/201810071.png)
▲ 提交之前 

![](/2018-10/boot4-validation-customize/201810072.png)
▲ 提交验证 

下面是官网的表单的触发代码：

```javascript
<script>
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();
</script>

```

分析，将关键的拿出来，下面是修改后：

```javascript
<script>
var valiRes = ""; 

//$(.ifForm)是要验证的目标表单
Array.prototype.filter.call($('.ifForm'), function (target) {
	valiRes = target.checkValidity();
	$('.ifForm').addClass('was-validated');
}); 

//valiRes就是表单验证的结果，返回一个bool值
if(!valiRes)
	return;//表单验证未通过

//other...
</script>

```

核心代码就这些，可以加到`ajax`提交按钮的函数前面，判断是否要执行后续代码。

![](/2018-10/boot4-validation-customize/201810073.gif)
▲ 效果（请忽略UI） 

这段代码应该也适用于boot v4.1.x，之前看了下，两者变化不大。
