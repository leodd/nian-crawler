function addScript(url) {
	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	document.head.appendChild(script);
}

addScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js');
addScript('https://fastcdn.org/FileSaver.js/1.1.20151003/FileSaver.min.js');
addScript('https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.10.0/js/md5.min.js');
addScript('https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js');

nc_anchor = document.createElement('div');
nc_anchor.id = 'anchor';
nc_anchor.innerHTML = '加载UI中'
document.body.appendChild(nc_anchor);

let vm;

setTimeout(() => {
	vm = new Vue({
		el: '#anchor',

		template: `
		<div>
	    <div v-show='showLogin'>
				<input type="text" placeholder="用户账号(邮箱)" v-model="username"><br />
		    <input type="password" placeholder="密码" v-model="password"><br />
		    <button @click="login">登录</button>
	    </div>

	    <div v-show='showDreamList'>
				<div>
					点击下边的梦想进行下载
					<div v-for='dream in dreamList' :key='dream.id'>
						<button @click='loadDream(dream.id)'>{{dream.title}}</button><br />
					</div>
				</div>
				<br />
				<div>
					你也可以通过梦想id指定任何你想下载的梦想
					<input type="text" placeholder="梦想id" v-model="dreamid">
					<button @click='loadDream(dreamid)'>下载</button>
				</div>
	    </div>

	    <div v-show='showTool'>
	    	<button @click='showTool = false; showDreamList = true;'>返回梦想列表</button><br /><br /><br />
				<button @click='loadComments'>加装该梦想的评论</button><br />
				<button @click='loadImages'>加装该梦想的图片</button><br />
				<button @click='download'>打包下载</button>
	    </div>

	    <div>{{ log }}</div>
	  </div>
		`,

		data: {
			username: '',
			password: '',
			dreamid: '',
			showLogin: true,
			showDreamList: false,
			showTool: false,
			dreamList: [],
			log: ''
		},

		methods: {
			login: function () {
				nc_login(this.username, this.password);
			},

			loadDream: function (id) {
				this.showDreamList = false;
				nc_dream(id);
			},

			loadComments: function () {
				this.showTool = false;
				nc_comments_entry(0);
			},

			loadImages: function () {
				this.showTool = false;
				nc_images_entry(0);
			},

			download: function () {
				nc_download();
			}
		}
	})
}, 1000);



let nc_uid;
let nc_shell;

let nc_dream_object;
let nc_images_set;




function nc_login(username, password) {
	let formdata = new FormData();

  formdata.append('email', username);
  formdata.append('password', md5('n*A' + password));

  let xhr = new XMLHttpRequest();
  xhr.onload = () => {
    nc_uid = xhr.response.data.uid;
    nc_shell = xhr.response.data.shell;
    vm.log = 'logged in';
		vm.showDreamList = true;
    vm.showLogin = false;
    nc_dream_list();
  };

  xhr.responseType = 'json';
  xhr.open('POST', 'http://api.nian.so/user/login', true);
  xhr.send(formdata);
};




function nc_dream_list() {
	let xhr = new XMLHttpRequest();
  xhr.onload = () => {
    xhr.response.data.dreams.forEach(dream => {
    	vm.dreamList.push(dream);
    });
  };

  xhr.responseType = 'json';
  xhr.open('GET', 'http://api.nian.so/user/' + nc_uid + '/dreams?uid=' + nc_uid + '&shell=' + nc_shell, true);
  xhr.send();
}




function nc_images_page(stepnum, num) {
	let xhr = new XMLHttpRequest();
  xhr.onload = () => {
  	vm.log = 'image ' + num + ' of step ' + stepnum + ' downloaded';
  	nc_images_set[nc_dream_object.steps[stepnum].images[num].path] = xhr.response;
  	if(num + 1 < nc_dream_object.steps[stepnum].images.length) {
  		nc_images_page(stepnum, num + 1);
  	}
  	else {
  		nc_images_entry(stepnum + 1);
  	}
  };
  xhr.onerror = () => {
  	nc_cors_image('http://img.nian.so/step/' + nc_dream_object.steps[stepnum].images[num].path);
  	if(nc_dream_object.steps[stepnum].images.length > 1) {
  		nc_images_page(stepnum, 1);
  	}
  	else {
  		nc_images_entry(stepnum + 1);
  	}
  }

  xhr.responseType = 'blob';
  xhr.open('GET', 'http://img.nian.so/step/' + nc_dream_object.steps[stepnum].images[num].path + '!step');
  xhr.send();
};

function nc_images_entry(stepnum) {
	while (stepnum < nc_dream_object.steps.length && nc_dream_object.steps[stepnum].image === '') {
		stepnum ++;
	}

	if (stepnum >= nc_dream_object.steps.length) {
		vm.log = 'images downloaded';
		vm.showTool = true;
		return;
	}

	let xhr = new XMLHttpRequest();
  xhr.onload = () => {
  	vm.log = 'image 0 of step ' + stepnum + ' downloaded';
  	nc_images_set[nc_dream_object.steps[stepnum].image] = xhr.response;
  	if(nc_dream_object.steps[stepnum].images.length > 1) {
  		nc_images_page(stepnum, 1);
  	}
  	else {
  		nc_images_entry(stepnum + 1);
  	}
  };
  xhr.onerror = () => {
  	nc_cors_image('http://img.nian.so/step/' + nc_dream_object.steps[stepnum].image);
  	if(nc_dream_object.steps[stepnum].images.length > 1) {
  		nc_images_page(stepnum, 1);
  	}
  	else {
  		nc_images_entry(stepnum + 1);
  	}
  }

  xhr.responseType = 'blob';
  xhr.open('GET', 'http://img.nian.so/step/' + nc_dream_object.steps[stepnum].image + '!step');
  xhr.send();
};




function nc_comments_page(stepnum, page, totalNum) {
	if (totalNum <= nc_dream_object.steps[stepnum].comments.length) {
		vm.log = 'downloaded: comments of step ' + stepnum;
		nc_comments_entry(stepnum + 1);
		return;
	}

	let xhr = new XMLHttpRequest();
  xhr.onload = () => {
  	nc_dream_object.steps[stepnum].comments = nc_dream_object.steps[stepnum].comments.concat(xhr.response.data.comments);

  	nc_comments_page(stepnum, page + 1, totalNum);
  };

  xhr.responseType = 'json';
  xhr.open('GET', 'http://api.nian.so/step/' + nc_dream_object.steps[stepnum].sid + '/comments?page=' + page + '&uid=' + nc_uid + '&shell=' + nc_shell, true);
  xhr.send();
};

function nc_comments_entry(stepnum) {
	while (stepnum < nc_dream_object.steps.length && nc_dream_object.steps[stepnum].comments === '0') {
		stepnum ++;
	}

	if (stepnum >= nc_dream_object.steps.length) {
		vm.log = 'comments downloaded';
		vm.showTool = true;
		return;
	}

	let xhr = new XMLHttpRequest();
  xhr.onload = () => {
  	let totalNum = parseInt(nc_dream_object.steps[stepnum].comments);

  	nc_dream_object.steps[stepnum].comments = xhr.response.data.comments;

		nc_comments_page(stepnum, 2, totalNum);
  };

  xhr.responseType = 'json';
  xhr.open('GET', 'http://api.nian.so/step/' + nc_dream_object.steps[stepnum].sid + '/comments?page=' + 1 + '&uid=' + nc_uid + '&shell=' + nc_shell, true);
  xhr.send();
};




function nc_steps(dreamid, page) {
	let xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.response.data.steps.length > 0) {
    	nc_dream_object.steps = nc_dream_object.steps.concat(xhr.response.data.steps);
    	vm.log = 'downloaded page ' + page;

    	nc_steps(dreamid, page + 1);
    }
    else {
    	vm.log = 'steps downloaded';
    	vm.showTool = true;
    }
  };

  xhr.responseType = 'json';
  xhr.open('GET', 'http://api.nian.so/v2/multidream/' + dreamid + '?uid=' + nc_uid + '&sort=desc&page=' + page + '&shell=' + nc_shell, true);
  xhr.send();
};

function nc_dream(dreamid) {
	nc_dream_object = {};
	nc_images_set = {};

	let xhr = new XMLHttpRequest();
  xhr.onload = () => {
    nc_dream_object.dream = xhr.response.data.dream;
    nc_dream_object.steps = xhr.response.data.steps;
    vm.log = 'downloaded page 1';

    nc_steps(dreamid, 2);
  };

  xhr.responseType = 'json';
  xhr.open('GET', 'http://api.nian.so/v2/multidream/' + dreamid + '?uid=' + nc_uid + '&sort=desc&page=' + 1 + '&shell=' + nc_shell, true);
  xhr.send();
};




function nc_cors_image(url) {
  let link = document.createElement("a");
  link.href = url;
  link.download = true;
  link.style.display = "none";
  let evt = new MouseEvent("click", {
      "view": window,
      "bubbles": true,
      "cancelable": true
  });

  document.body.appendChild(link);
  link.dispatchEvent(evt);
  document.body.removeChild(link);
  vm.log = 'external download';
}




function nc_download() {
	let zip = new JSZip();

	zip.file('content.json', JSON.stringify(nc_dream_object));

	let img = zip.folder("images");

	for(let k in nc_images_set) {
		img.file(k, nc_images_set[k]);
	}

	zip.generateAsync({type:"blob"})
	.then(function(content) {
  	saveAs(content, nc_dream_object.dream.title + '.zip');
	});
};