// Demo Mode Enabler
document.cookie = "demo_mode=true; path=/; expires=" + new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
console.log("🛠 デモモードを有効化しました");
alert("デモモードが有効になりました。ページをリロードしてください。");
