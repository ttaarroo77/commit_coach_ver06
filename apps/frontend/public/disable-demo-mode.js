// Demo Mode Disabler
document.cookie = "demo_mode=false; path=/; expires=" + new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
console.log("🛠 デモモードを無効化しました");
alert("デモモードが無効になりました。ページをリロードしてください。");
