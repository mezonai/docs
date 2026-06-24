/**
 * Injects a small synchronous <head> script that picks the documentation
 * language before the page paints (so there is no flash / locale jump).
 *
 * Resolution order:
 *   1. `?lan=<code>` query param (transient: stored then stripped from the URL)
 *   2. An explicit locale already present in the URL path (/docs/<code>/...)
 *   3. The value remembered in localStorage
 *   4. The browser language (navigator.language)
 *   5. The default locale (English) when nothing else matches
 *
 * Adding a language only requires extending `locales` (passed from the config),
 * no change is needed here.
 */
module.exports = function localeStoragePlugin(_context, options) {
  const {
    locales = ["en"],
    defaultLocale = "en",
    baseUrl = "/",
    storageKey = "mezon_docs_lan",
  } = options || {};

  const base = baseUrl.replace(/\/$/, "") || "";

  const script = `(function(){try{
var BASE=${JSON.stringify(base)},DEF=${JSON.stringify(
    defaultLocale,
  )},LOCS=${JSON.stringify(locales)},KEY=${JSON.stringify(storageKey)};
var path=window.location.pathname;
if(BASE&&path.lastIndexOf(BASE,0)!==0)return;
var rest=path.slice(BASE.length);
var current=DEF;
for(var i=0;i<LOCS.length;i++){var l=LOCS[i];if(l===DEF)continue;var p="/"+l;if(rest===p||rest.lastIndexOf(p+"/",0)===0){current=l;break;}}
function get(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
function set(v){try{localStorage.setItem(KEY,v);}catch(e){}}
var search=window.location.search;
var m=search.match(/[?&]lan=([a-zA-Z-]+)/);
var qLoc=null;if(m){var c=m[1].toLowerCase().split("-")[0];if(LOCS.indexOf(c)!==-1)qLoc=c;}
var desired;
if(qLoc){desired=qLoc;set(desired);}
else if(current!==DEF){set(current);return;}
else{var st=get();if(st&&LOCS.indexOf(st)!==-1){desired=st;}else{var lang=((navigator.language||navigator.userLanguage||"")+"").toLowerCase().split("-")[0];desired=(LOCS.indexOf(lang)!==-1)?lang:DEF;set(desired);}}
var clean=search.replace(/([?&])lan=[^&]*/,function(_m,a){return a==="?"?"?":"";});
if(clean==="?")clean="";
var contentRest=rest;
if(current!==DEF){contentRest=rest.slice(("/"+current).length)||"";}
var desiredPath=(desired===DEF)?(BASE+contentRest):(BASE+"/"+desired+contentRest);
if(desiredPath!==path){window.location.replace(desiredPath+clean+window.location.hash);}
else if(clean!==search){try{window.history.replaceState(null,"",desiredPath+clean+window.location.hash);}catch(e){}}
}catch(e){}})();`;

  return {
    name: "mezon-locale-storage",
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: "script",
            innerHTML: script,
          },
        ],
      };
    },
  };
};
