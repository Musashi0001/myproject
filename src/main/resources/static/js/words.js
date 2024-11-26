window.onload = fetchWords;

async function fetchWords() {
	try {
		const response = await fetch('http://localhost:8080/api/words');
		if (!response.ok) throw new Error('データの取得に失敗しました');

		const words = await response.json();
		renderWords(words);
	} catch (error) {
		console.error('エラー:', error);
	}
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
		console.log(`Word ${id} marked: ${isChecked}`);
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
		console.log(`Word ${id} learned: ${isChecked}`);
	} catch (error) {
		console.error('更新エラー:', error);
	}
}