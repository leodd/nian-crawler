# nian-crawler
A web crawler for api.nian.so

# 使用方法：
  
注意：推荐使用edge（虽然都是微软的浏览器，但不是ie）浏览器，其他浏览器下载图片时可能不会打包下载，请注意。
  
第一步：打开浏览器，并在地址栏输入api.nian.so，进入念的api网页。
  
第二步：打开浏览器的控制台（F12一般为控制台快捷键），并选择console标签。
  
第三步：复制nian-crawler.js中的所有代码，并粘贴在控制台中，回车。
  
第四步：当界面出现时，输入你的念账号和密码，登录。
  
第五步：你可以点击你的记本下载，或输入记本id下载。
  
第六步：第五步下载的只有进展的文字部分，你可以选择是否添加评论和图片。
  
第七步：当你确认要将内容下载到你的电脑时，请点击打包下载。点击后稍等一会，将会提示下载zip文件。
  
第八步：你可以退回记本列表，重复上述的操作。


# 如何浏览下载的数据

注意：推荐使用edge，也可以使用Firefox，ie和chrome有可能无法获取本地数据，chrome可以通过cmd解禁对本地文件的限制。

第一步：从该repository下载index.html和dist文件夹。

第二步：把之前下载的记本数据解压至和index.html同一文件夹下。（举个例子：dist和index.html在C:\Users\Heping\Desktop\nian-viewer\中，那么你的记本数据就应解压至nian-viewer下。images文件夹和content.json文件应在C:\Users\Heping\Desktop\nian-viewer\你的记本文件夹\ 中）

第三步：用浏览器打开index.html，输入记本文件夹的名字后回车，数据将会加载出来。如要切换记本，在左下角的输入框中输入记本名称并回车。（你可以更改记本文件夹的名称以便输入）
