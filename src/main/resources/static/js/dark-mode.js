//ダークモード切り替え
const toggleButton = document.createElement('button');
toggleButton.textContent = '🌙';
toggleButton.style.fontSize = '18px';
toggleButton.style.backgroundColor = '#ffffff';
toggleButton.style.position = 'fixed';
toggleButton.style.top = '20px';
toggleButton.style.right = '20px';
toggleButton.style.padding = '10px 20px';
toggleButton.style.borderRadius = '4px';
toggleButton.style.border = 'none';
toggleButton.style.cursor = 'pointer';
toggleButton.title = 'ダークモードに切り替え';

document.body.appendChild(toggleButton);

toggleButton.addEventListener('click', () => {
	document.body.classList.toggle('dark-mode');
	const isDarkMode = document.body.classList.contains('dark-mode');
	toggleButton.textContent = isDarkMode ? '☀️' : '🌙';
	toggleButton.title = isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え';
	toggleButton.style.backgroundColor = isDarkMode ? '#1e1e1e' : '#ffffff'; // 背景色切り替え
	localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

// ページ読み込み時にテーマを復元
window.addEventListener('DOMContentLoaded', () => {
	const savedTheme = localStorage.getItem('theme');
	if (savedTheme === 'dark') {
		document.body.classList.add('dark-mode');
		toggleButton.textContent = '☀️';
		toggleButton.title = 'ライトモードに切り替え';
		toggleButton.style.backgroundColor = '#1e1e1e';
	}
});