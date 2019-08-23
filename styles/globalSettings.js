/*Hello,this is the world of piggy. The settings keeps the world work correctly.*/
function emptyPage() {		
    console.clear();		
    document.write("");		
    if (location.pathname == "/") {		
      window.location.replace("https://files.ypig.tk/homepage");
      return;
    }
    window.location.replace(window.location.href.replace("https://ypig.tk/","https://files.ypig.tk/"));		
 }		

 
  function ck() {		
   console.profile();		
   console.profileEnd();		
   if (console.clear) {		
     console.clear();		
   };		
   if (typeof console.profiles == "object") {		
     return console.profiles.length > 0;		
   }		
 }		

 
  function checkWindow() {	
   try {		
     document.getElementById("__vconsole").innerHTML = "";		
   } catch (e) {};		
   if ((window.console && (console.firebug || console.table && /firebug/i.test(console.table()))) || (typeof opera == 'object' && typeof opera.postError == 'function' && console.profile.length > 0)) {		
      emptyPage();		
   }		
   if (typeof console.profiles == "object" && console.profiles.length > 0) {		
     emptyPage();		
   }		
 }		

  /*function randomUrl() {
      var url = window.location.href;
      var newFile = (Math.random() + 1).toString(36).substr(2, 4);
      var split = url.split("/");
      if (window.location.pathname.slice(-1) === "/") {
        split[split.length - 2] = "" + newFile;
      } else {
        index = split[split.length - 1];
        indexPrefix = index.substr(0, index.indexOf('.')); 
        indexSuffix = index.substr(index.indexOf('.')); 
        split[split.length - 1] = newFile + indexSuffix; 
      }
      var newUrl = split.join("/");
      if (typeof window.history.replaceState === 'function') {
          history.replaceState({}, '', newUrl);
      }
  }*/

  function randomUrl() {
      if (typeof window.history.replaceState === 'function' && location.pathname != "/functions/musicdown"  && location.pathname != "/functions/icon" && location.pathname != "/functions/mindmap" && location.pathname != "/functions/drums/index" && location.pathname != "/functions/white_noise") {
          history.replaceState({}, '', "https://ypig.tk/" + location.search);
      }
  }
  randomUrl();


 
  $("document").ready(function() {		
   setInterval(function() {		
      if (/Mobi/.test(navigator.userAgent) != true) {		
       if ((window.outerHeight - window.innerHeight) > 200) {		
         emptyPage();		
       }		
     }		
   }, 1000);		

    var copyrightInfo = "马雨晨(19770214)伪造官方应用，私自建立未经官方许可群聊，已严重侵犯我司版权，故禁止访问!正版黄猪官网https://ypig.tk/"		

      if ( /Ypiginc/.test(navigator.userAgent) !=true && location.pathname !="/api/sendFeedBack" && location.pathname !="/functions/white_noise") {		
       if (document.getElementsByClassName("mdl-layout__header").length != 1 || document.getElementsByClassName("mdl-layout--fixed-header").length != 1) {		
         //alert(copyrightInfo);		
         //emptyPage();		
       }		
       if (document.getElementsByClassName("mdl-layout__header")[0].style.display == "none" || document.getElementsByClassName("mdl-layout--fixed-header")[0].style.display == "none") {		
         //alert(copyrightInfo);		
         //emptyPage();		
       }		
     }		

    setInterval(function(){		
     if ( /Ypiginc/.test(navigator.userAgent) !=true && location.pathname !="/api/sendFeedBack" && location.pathname !="/functions/white_noise") {		
       if (document.getElementsByClassName("mdl-layout__header").length != 1 || document.getElementsByClassName("mdl-layout--fixed-header").length != 1) {		
         //alert(copyrightInfo);		
         //emptyPage();		
       }		
       if (document.getElementsByClassName("mdl-layout__header")[0].style.display == "none" || document.getElementsByClassName("mdl-layout--fixed-header")[0].style.display == "none") {		
         //alert(copyrightInfo);		
         //emptyPage();		
       }		
     }		
   },1000);		

    var x = document.createElement('div');		
   Object.defineProperty(x, 'id', {		
       get:function(){		
           emptyPage();		
       }		
   });		
   console.log(x);		

    if(document.location.protocol!="https:"){		
     document.location=document.URL.replace(/^http:/i,"https:");		
   }
 });		
 window.onresize = function() {		
   if (/Mobi/.test(navigator.userAgent != true)) {		
     if ((window.outerHeight - window.innerHeight) > 200) {		
       emptyPage();		
     }		
   }		
 }		
 checkWindow();
