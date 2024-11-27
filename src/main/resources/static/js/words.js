// 初期設定
window.onload = () => {
	fetchWords();
	setupSortAndFilterEvents();
	setupSearch();
};

// ソート・フィルタ状態を保持するオブジェクト
let sortState = {
	word: 'default', // 'asc' | 'default'
	mark: 'default', // 'marked' | 'unmarked' | 'default'
	learned: 'default', // 'checked' | 'unchecked' | 'default'
};

// 初期データを保持
let allWords = [];

// fetchWords: データを取得し、ソート・フィルタ適用
async function fetchWords() {
	try {
		const response = await fetch('http://localhost:8080/api/words');
		if (!response.ok) throw new Error('データの取得に失敗しました');

		allWords = await response.json(); // データを保持
		applySortAndFilter(); // 初期表示
	} catch (error) {
		console.error('エラー:', error);
	}
}

// ソート・フィルタを適用
function applySortAndFilter() {
	let filteredWords = [...allWords];

	// マークによるフィルタリング
	if (sortState.mark === 'marked') {
		filteredWords = filteredWords.filter(word => word.isMarked);
	} else if (sortState.mark === 'unmarked') {
		filteredWords = filteredWords.filter(word => !word.isMarked);
	}

	// チェックによるフィルタリング
	if (sortState.learned === 'checked') {
		filteredWords = filteredWords.filter(word => word.isLearned);
	} else if (sortState.learned === 'unchecked') {
		filteredWords = filteredWords.filter(word => !word.isLearned);
	}

	// 単語のソート
	if (sortState.word === 'asc') {
		filteredWords.sort((a, b) => a.word.localeCompare(b.word));
	}

	// 検索結果と連携
	applySearch(filteredWords);

	// ツールチップとインジケーターを更新
	updateTooltips();
	updateSortIndicators();
}

// 検索適用
function applySearch(words = allWords) {
	const query = document.getElementById('search').value.toLowerCase();
	const filter = document.getElementById('search-filter').value;

	// フィルタ条件に基づく検索
	const filteredWords = words.filter(word => {
		if (filter === 'word') {
			return word.word.toLowerCase().includes(query);
		} else if (filter === 'meaning') {
			return word.meaning.toLowerCase().includes(query);
		} else if (filter === 'example') {
			return word.exampleSentence?.toLowerCase().includes(query);
		} else {
			// すべてを対象
			return (
				word.word.toLowerCase().includes(query) ||
				word.meaning.toLowerCase().includes(query) ||
				word.exampleSentence?.toLowerCase().includes(query)
			);
		}
	});

	// 結果がない場合のUI
	if (filteredWords.length === 0) {
		const tbody = document.querySelector('table tbody');
		tbody.innerHTML = '<tr><td colspan="4">結果が見つかりません</td></tr>';
		return;
	}

	// レンダリング
	renderWords(filteredWords);
}

// ソート・フィルターボタンにイベントリスナーを追加
function setupSortAndFilterEvents() {
	// "単語"列: アルファベット昇順とデフォルト順
	document.querySelector('th:nth-child(1)').addEventListener('click', () => {
		sortState.word = sortState.word === 'asc' ? 'default' : 'asc';
		applySortAndFilter();
	});

	// "マーク"列: マーク済み、未マーク、デフォルト順
	document.querySelector('th:nth-child(3)').addEventListener('click', () => {
		sortState.mark = sortState.mark === 'default' ? 'marked' :
			sortState.mark === 'marked' ? 'unmarked' : 'default';
		applySortAndFilter();
	});

	// "覚えた！"列: チェック済み、未チェック、デフォルト順
	document.querySelector('th:nth-child(4)').addEventListener('click', () => {
		sortState.learned = sortState.learned === 'default' ? 'checked' :
			sortState.learned === 'checked' ? 'unchecked' : 'default';
		applySortAndFilter();
	});
}

// 検索対象オプション
function setupSearch() {
	const searchInput = document.getElementById('search');
	const searchFilter = document.getElementById('search-filter');

	searchInput.addEventListener('input', () => applySortAndFilter());
	searchFilter.addEventListener('change', () => applySortAndFilter());
}

// ツールチップの更新
function updateTooltips() {
	const tooltips = {
		word: document.querySelector('th:nth-child(1)'),
		mark: document.querySelector('th:nth-child(3)'),
		learned: document.querySelector('th:nth-child(4)'),
	};

	if (sortState.word === 'default') tooltips.word.title = 'クリックでアルファベット昇順に並び替え';
	else tooltips.word.title = 'クリックでデフォルト順に戻す';

	if (sortState.mark === 'default') tooltips.mark.title = 'クリックでマーク済みを表示';
	else if (sortState.mark === 'marked') tooltips.mark.title = 'クリックで未マークを表示';
	else tooltips.mark.title = 'クリックでデフォルト順に戻す';

	if (sortState.learned === 'default') tooltips.learned.title = 'クリックでチェック済みを表示';
	else if (sortState.learned === 'checked') tooltips.learned.title = 'クリックで未チェックを表示';
	else tooltips.learned.title = 'クリックでデフォルト順に戻す';
}

// ソートインジケーターの更新
function updateSortIndicators() {
	const indicators = {
		word: document.getElementById('word-indicator'),
		mark: document.getElementById('mark-indicator'),
		learned: document.getElementById('learned-indicator'),
	};

	indicators.word.textContent = sortState.word === 'asc' ? '▲' : '';
	indicators.mark.textContent = sortState.mark === 'marked' ? '★' : sortState.mark === 'unmarked' ? '☆' : '';
	indicators.learned.textContent = sortState.learned === 'checked' ? '✔' : sortState.learned === 'unchecked' ? '×' : '';
}

function formatDate(dateStr) {
	const date = new Date(dateStr);
	return date.toLocaleString('ja-JP', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function renderWords(words) {
	const tbody = document.querySelector('table tbody');
	tbody.innerHTML = '';

	words.forEach(word => {
		// メイン行を作成
		const row = createMainRow(word);
		const detailRow = createDetailRow(word);

		// メイン行クリック時に詳細行をトグル
		row.addEventListener('click', (event) => {
			// 詳細行のトグルを制御する。星やチェックマーク関連の要素は無視
			if (event.target.closest('.toggle-mark') || event.target.closest('.toggle-learned')) {
				return;
			}
			if (detailRow.style.display === 'none' || !detailRow.style.display) {
				detailRow.style.display = 'table-row'; // 詳細行を表示
			} else {
				detailRow.style.display = 'none'; // 詳細行を非表示
			}
		});

		// テーブルに行を追加
		tbody.appendChild(row);
		tbody.appendChild(detailRow);
	});
}

// メイン行を作成
function createMainRow(word) {
	const row = document.createElement('tr');
	row.innerHTML = `
        <td>${word.word}</td>
        <td>${word.meaning}</td>
		<td class="toggle-mark" data-id="${word.id}" data-checked="${word.isMarked}">
			<span class="custom-star">${word.isMarked ? '★' : '☆'}</span>
		</td>
		<td class="toggle-learned" data-id="${word.id}" data-checked="${word.isLearned}">
			<span class="custom-checkmark">${word.isLearned ? '✔' : ''}</span>
		</td>
    `;

	// 星クリックイベント
	row.querySelector('.toggle-mark').addEventListener('click', async (event) => {
		const cell = event.currentTarget;
		const isChecked = cell.dataset.checked === 'true'; // 現在の状態を取得
		const newChecked = !isChecked;

		// UIを切り替え
		const starElement = cell.querySelector('.custom-star');
		starElement.textContent = newChecked ? '★' : '☆';
		starElement.style.color = newChecked ? '#f0c419' : '#ccc'; // 黄色か灰色に変更
		cell.dataset.checked = newChecked.toString();

		// API呼び出し
		await toggleMarked(cell.dataset.id, newChecked);
	});

	// チェックマーククリックイベント
	row.querySelector('.toggle-learned').addEventListener('click', async (event) => {
		const cell = event.currentTarget;
		const isChecked = cell.dataset.checked === 'true'; // 現在の状態を取得
		const newChecked = !isChecked;

		// UIを切り替え
		const checkmarkElement = cell.querySelector('.custom-checkmark');
		checkmarkElement.textContent = newChecked ? '✔' : '';
		cell.dataset.checked = newChecked.toString();

		// API呼び出し
		await toggleLearned(cell.dataset.id, newChecked);
	});

	return row;
}

// 詳細行を作成
function createDetailRow(word) {
	const detailRow = document.createElement('tr');
	detailRow.classList.add('details');
	detailRow.style.display = 'none'; // 初期状態で非表示
	detailRow.innerHTML = `
        <td colspan="4">
           <span class="heading">例文:</span> ${word.exampleSentence || 'なし'}<br>
           <span class="heading">メモ:</span> ${word.memo || 'なし'}<br>
           <span class="heading">最終更新日:</span> ${word.updatedAt ? formatDate(word.updatedAt) : formatDate(word.createdAt)}
        </td>
    `;
	return detailRow;
}

// API呼び出し処理
async function toggleMarked(id, isChecked) {
	try {
		await fetch(`http://localhost:8080/api/words/${id}/marked`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isMarked: isChecked }),
		});

		// ローカルデータを更新
		const word = allWords.find(word => word.id === parseInt(id, 10));
		if (word) word.isMarked = isChecked;

		// ソート・フィルタを適用して再描画
		applySortAndFilter();
	} catch (error) {
		console.error('更新エラー:', error);
	}
}

async function toggleLearned(id, isChecked) {
	try {
		await fetch(`http://localhost:8080/api/words/${id}/learned`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isLearned: isChecked }),
		});

		// ローカルデータを更新
		const word = allWords.find(word => word.id === parseInt(id, 10));
		if (word) word.isLearned = isChecked;

		// ソート・フィルタを適用して再描画
		applySortAndFilter();
	} catch (error) {
		console.error('更新エラー:', error);
	}
}
