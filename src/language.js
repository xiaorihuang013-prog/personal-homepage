let language='zh';try{language=localStorage.getItem('8suns-language')||'zh';}catch{}
export const isEnglish=()=>language==='en';
export const t=(zh,en)=>isEnglish()?en:zh;
export function toggleLanguage(){language=isEnglish()?'zh':'en';try{localStorage.setItem('8suns-language',language);}catch{}window.dispatchEvent(new Event('languagechange'));}
export function onLanguage(callback){window.addEventListener('languagechange',callback);callback();}
