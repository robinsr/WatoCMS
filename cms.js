/*  CMS for blog site
    by: Ryan Robinson
    email: ryan.b.robinson@gmail.com
    location: seattle
    license: none (but would love to know its getting used)
*/


// Article Editor functions:


var article = [];
function initarticle(){
    console.log('init running!')
    loadFileList();
    loadCssList();
    register();
    loadcontrols();
}
function register(){
        // register all the events when the DOM changes. not sure if this is the best method...
    registerPop();
    registerDrag();
    registerClone();
    registerChangeTitle();
    registerURL();
}
function loadFileList(){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "/filelist", true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function(){
         if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200)){
            var list = JSON.parse(xmlhttp.responseText);
            var target = document.getElementById("filelist");
            target.innerHTML = "";
            for (i=0;i<list.length;i++){
                var tr = document.createElement("tr");
                var td1 = document.createElement("td");
                var td2 = document.createElement("td");
                var ahref = document.createElement("a");
                var del = document.createElement("button");
                del.setAttribute("type", "button");
                del.setAttribute("class","deletearticle");
                var deltext = document.createTextNode("Delete");
                del.appendChild(deltext);
                ahref.setAttribute("href","javascript:void(0)");
                ahref.setAttribute("class", "fileitem");
                var text = document.createTextNode(list[i]);
                ahref.appendChild(text);
                td1.appendChild(ahref);
                td2.appendChild(del);
                tr.appendChild(td1);
                tr.appendChild(td2);
                target.appendChild(tr);
                }
        }
        else if ((xmlhttp.readyState == 4) && (xmlhttp.status != 200))
        {
            console.log("Error in Connection");
        }
        registerFileDelete();
        registerGetFile();
    }
}
    // GIVE ME A CALLBACK, IM ASYNCRONOUS!!!!
function getCssList(cb){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "/csslist", true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function(){
        if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200)){
            var list = JSON.parse(xmlhttp.responseText);
            cb(list);
        }
        else if ((xmlhttp.readyState == 4) && (xmlhttp.status != 200)){
            console.log("Error in Connection. Did not get CSS list");
        }
    }  
}
function loadCssList(){
    getCssList(function(list){
    var target = document.getElementById("csslist");
    target.innerHTML = "";
    for (i=0;i<list.length;i++){
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
                
        var inp = document.createElement("input");
        inp.setAttribute("type","checkbox");
        inp.setAttribute("class", "csscheckbox");
                
        var p = document.createElement("span");
        var text = document.createTextNode(list[i]);
        p.appendChild(text);
                
        var lab = document.createElement("label");
        lab.appendChild(inp);
        lab.appendChild(p);
                
                
        var del = document.createElement("button");
        del.setAttribute("type", "button");
        del.setAttribute("class","deletecss");
        var deltext = document.createTextNode("Delete");
        del.appendChild(deltext);
                
                
        td1.appendChild(lab);
        td2.appendChild(del);
        tr.appendChild(td1);
        tr.appendChild(td2);
        target.appendChild(tr);

        registerCssDelete();
    }
    });
}
function registerGetFile(){
        // finds the list of documents that can be edited, triggers getFile 
    var filelist = document.getElementsByClassName('fileitem');
    for (var i=0;i<filelist.length;i++){
        var me = filelist[i]
		me.onclick = function(me){
                // dont want to lose your current work!
            var fetchdoc = "./jsondocs/"+me.target.text;
            if (article.loaded == true){
                if (confirm('loading a new file will clear your current work. Did you save?')){
                    getFile(fetchdoc);
                }
            }else{
                getFile(fetchdoc);
            }
        }
    }
    console.log('there are '+filelist.length+' files');
}
function getFile(doc){
        // fetches the json doc with ajax call, loads the page with textarea elements.

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", doc, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function(){
        if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200)){
            var article = JSON.parse(xmlhttp.responseText);
                // clear the article area
            var target = document.getElementById("articledraft");
            target.innerHTML = "";
      
                // load the title
            var titletarget = document.getElementById("titlefield");
            titletarget.value = article.title;
            titletarget.disabled = true;
                        
                // load the url
            var urltarget = document.getElementById("urlfield");
            urltarget.value = article.url;                        
                        
                // load each content section
                //console.log(article.content.length);
            for (i=0;i<article.content.length;i++){
                var e = article.content[i].type;
                var f = article.content[i].text;
                createP(e,f);
                //console.log(e+" "+f);
            }
                        
                // display latest save date
            var d = new Date(article.savedate);
            d.toString();
            var datetext = document.createTextNode("last saved: "+d);
            var savetarget = document.getElementById('savedate');
            savetarget.innerHTML = "";
            savetarget.appendChild(datetext);
                        
            article.loaded = true;
            register();
        }else{
        }
	}
}

function registerChangeTitle(){
        // finds the title input and registers click event. changing the title and saving will create a new json doc
    var titletarget = document.getElementById("titlefield");
    titletarget.parentNode.onclick = function(){
        if (article.loaded == true){
            if (confirm('changing the title creates a new article. Proceed?')){
                titletarget.disabled = false;
            }else{
                return;
            }
        }
    }
}
function registerURL(){
    var field = document.getElementById('titlefield');
    field.onblur = function(){
        var title = field.value;
        title = title.replace(/\s/g, '').toLowerCase();
        title += ".json"
        var target = document.getElementById('urlfield');
        target.value = title;
    }
}
function loadcontrols(){
        // finds the inputs for creating paragrpghs, headings, etc and registers their click events
	var inputs=document.getElementsByClassName("newitem");
	for (var i=0;i<inputs.length;i++){
		var me = inputs[i]
		me.onclick = function(me){
			forName = me.target.getAttribute('for');
				createP(forName);
                register();

		};
	}
}
function createP(e,f){
        // creates a new text section, either paragraph, heading, or preformatted, and 
        // creates some controls on the section.
        // ends by calling the register function
    
		//create new div to hold new item
	var target = document.getElementById("articledraft");
	newdiv = document.createElement("div");
	newdiv.className = "itemholder";
	newdiv.setAttribute('draggable', 'true');

		//create a space for drag and dropping later on
	dropdiv = document.createElement("div");
	spaccer = document.createTextNode("drop-here");
	dropdiv.appendChild(spaccer)
	dropdiv.className = "dropspace";
	dropdiv.setAttribute('ondragover', 'return false')
	dropdiv.setAttribute('ondrop', 'dropevent(event)')

		//append the new divs
	target.appendChild(newdiv);


		//change the target to the new div to put the new text area and such
	target = document.getElementsByClassName("itemholder");
	target = target[target.length-1]

		//create the new text area
	txtar=document.createElement("TEXTAREA");
    if(f){
        txtar.value = f;
    }
	txtar.className = "item inline";
	txtar.itemtype = e;
    txtar.setAttribute("cols", "80");
    txtar.setAttribute("rows", "5");

		//create a break
	var br=document.createElement("br");
	
		//create a label, either p, code, or h2
	var para=document.createElement("p");
	para.className = "inline";
	var node=document.createTextNode(e);
	para.appendChild(node);

		//create the button to delete the item
	var del = document.createElement("button");
	var delt=document.createTextNode("Pop");
	del.className = "pop";
	del.appendChild(delt);
	
		//create the button to clone item
	var cln = document.createElement("button");
	var clnt = document.createTextNode("Clone");
	cln.className = "clone"
	cln.appendChild(clnt)

		//append it all to the new target
	target.appendChild(para);
	target.appendChild(txtar);
	target.appendChild(del);
	target.appendChild(cln);
	target.appendChild(br);
	target.appendChild(dropdiv);
};

function registerPop(){
        // finds all the 'pop' buttons and registers their click events
	var pops = document.getElementsByClassName("pop");
	for (i=0;i<pops.length;i++){
		var me = pops[i];
		me.onclick = function(me){
			oldchild = me.target.parentNode;
			olddropspace = oldchild.nextSibling;
			document.getElementById("articledraft").removeChild(oldchild);
		}
	}
}
var dragobject = [];  //  WTF is this?
var dragtext = [];
function registerDrag(){
        // finds all the input sections and prepares to transfer the value in the text area when the element is dragged
	var drags = document.getElementsByClassName("itemholder")
	for (i=0;i<drags.length;i++){
		var me = drags[i];
		me.ondragstart = function(me){
			dragobject = me.target;
			dragtext = me.target.getElementsByTagName("TEXTAREA")[0].value;
            console.log(dragobject);
		}	
	}
}
function dropevent(event){
        // when the dragged element is dropped, thie function clones the element, pops it, and loads the clone. 
    if (event.target.parentNode == dragobject){
		return;
	} else {
        console.log(dragobject);
		var newobject = dragobject.cloneNode(true);
			newobject.getElementsByTagName("TEXTAREA")[0].value = dragtext;
				olddropspace = dragobject.nextSibling;
				document.getElementById("articledraft").removeChild(dragobject);
		event.target.parentNode.parentNode.insertBefore(newobject, event.target.parentNode.nextSibling);
			//must re-register event handlers!
		register();
	}
}
function registerClone(){
        // finds all the 'clone' buttons and registers their click events. Clones the element when clicked, inserts the 
        // new node after the original node, re-registers events. 
	var clones = document.getElementsByClassName("clone");
		for (i=0;i<clones.length;i++){
			me = clones[i];
			me.onclick = function(me){
			clonevalue = me.target.parentNode.getElementsByTagName("textarea")[0].value;
			var newNode = me.target.parentNode.cloneNode(true);
			newNode.getElementsByTagName("TEXTAREA")[0].value = clonevalue;
			me.target.parentNode.parentNode.insertBefore(newNode, event.target.parentNode.nextSibling);
			register();
			}
		}
}
function registerFileDelete(){
    var inputs = document.getElementsByClassName("deletearticle");
    for (i=0;i<inputs.length;i++){
        var me = inputs[i];
        me.onclick = function(me){
            var filename = me.target.parentNode.previousSibling.getElementsByTagName("a")[0].text;
            var type = "file";
            deletefile(filename,type);
        }
    }
}
function registerCssDelete(){
    var inputs = document.getElementsByClassName("deletecss");
    for (i=0;i<inputs.length;i++){
        var me = inputs[i];
        me.onclick = function(me){
            var filename = me.target.parentNode.previousSibling.getElementsByTagName("label")[0].innerText;
            var type = "css";
            deletefile(filename,type);
        }
    }
}
function deletefile(m,t){
    if (confirm("Delete "+m+"?")){
        var xmlhttp = new XMLHttpRequest();
        var json = {"file": m,"type":t};
        var jsonstring = JSON.stringify(json);
        xmlhttp.open("POST", "/deletefile", true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(jsonstring);
        xmlhttp.onreadystatechange = function(){
            if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200)){
               if (confirm(xmlhttp.responseText)){
               loadFileList();
               loadCssList();                   
               }
            } else {
            }
        }
    }
}
	//preview button
function preview(){
	
	var article = gather();
	var target = document.getElementById("preview");
	target.innerHTML = "";
	for (i=0;i<article.length;i++){
		//var ordern = document.createElement('p');
		//var order = document.createTextNode("order: "+e[i].order);
		//ordern.appendChild(order)
		//target.appendChild(ordern);

		pview=document.createElement(article[i].type);
		var para =document.createTextNode(article[i].text)
		pview.appendChild(para)
		//pview.innerHTML(article[i].text);
		

		target.appendChild(pview);

	}
}
function gathertext(){
	var d = [];
		//finds all the input for the new article and prepares the content section of the json doc for sending to the server
	var items = document.getElementsByClassName("item");
		for (i=0;i<items.length;i++){
			d.push({text: items[i].value, type: items[i].previousSibling.innerHTML, order: i });
		}
	return d;
}
function gathercss(){
    var d = [];
    var css = document.getElementsByClassName('csscheckbox');
    for (i=0;i<css.length;i++){
        if (css[i].checked) {
            var filename = css[i].nextSibling.innerHTML;
            d.push({file:filename})
        } else {
        }
    }
    console.log(d);
    return d;
    
}
function save(){
        // calls the gather() function, fully assembles the json doc by calling merge(), opens an ajax call, sends json to the server, 
        // displays success or fail
	var d = new Date();
	var article = {
        url: document.getElementById("urlfield").value,
		title: document.getElementById("titlefield").value,
		savedate: d.getTime(),
        content: gathertext(),
        css: gathercss()
	}
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/savedata", true);
	var newarticle = JSON.stringify(article);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.send(newarticle);

	console.log('sent ajax call');
    
    xmlhttp.onreadystatechange = function() {        
        if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200)){
            alert(xmlhttp.responseText);
            return;
        }
        else if ((xmlhttp.readyState == 4) && (xmlhttp.status != 200))
        {
            console.log("Error in Connection");
        }
    }
}

// common to all pages functions
function hide(){
    var body = document.getElementsByTagName("body")[0];
    if (body.className.match(/(?:^|\s)hide(?!\S)/)){
        body.className = body.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
    } else {
        body.className = 'hide';
    }
}

//CSS Editor Functions


var initcss = function(){
    getCssList(function(list){
        var target = document.getElementById("csslist");
        target.innerHTML = "";
        for (i=0;i<list.length;i++){
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
                
        var a = document.createElement("a");
        a.setAttribute("href", "javascript:void(0)");
        a.setAttribute("class","cssitem");
        var text = document.createTextNode(list[i]);
        a.appendChild(text);
                
        var del = document.createElement("button");
        del.setAttribute("type", "button");
        del.setAttribute("class","deletecss");
        var deltext = document.createTextNode("Delete");
        del.appendChild(deltext);
                
                
        td1.appendChild(a);
        td2.appendChild(del);
        tr.appendChild(td1);
        tr.appendChild(td2);
        target.appendChild(tr);

        registerCssItem();
        }
    });
}
function registerCssItem(){
    var items = document.getElementsByClassName("cssitem");
    for(i=0;i<items.length;i++){
        var me = items[i];
        me.onclick = function(me){
            var filename = me.target.text;
            loadCssForEdit(filename);
        }
    }
}
/*function loadCssForEdit(fn){
    console.log('starting loadCssForEdit');
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/loadcssfile", true);
    var m = JSON.stringify(fn);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(m);
    xmlhttp.onreadystatechange = function(){
        if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200)){
            var target = document.getElementById('editspace');
            var data = JSON.parse(xmlhttp.responseText);
            target.value = data.css;
        }else if ((xmlhttp.readyState == 4) && (xmlhttp.status != 200)){
            alert('Error getting that CSS file');
        }
    }
}*/
function loadCssForEdit(fn){
    var filename = "./resources/CSS/"+fn;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filename, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function(){
        if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200)){
            var target = document.getElementById('editspace');
            target.value =xmlhttp.responseText;
        }else{
        }
    }
}


































