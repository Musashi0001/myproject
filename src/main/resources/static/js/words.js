window.onload = fetchWords;

async function fetchWords() {
	try {
		//リクエスト
		const response = await fetch('http://localhost:8080/api/words');
		if (!response.ok) {
			throw new Error('データの取得に失敗しました');
		}

		const words = await response.json();

		//HTMLに反映
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
	//テーブル要素取得
	const tbody = document.querySelector('table tbody');

	// tbodyの内容をリセット
	tbody.innerHTML = '';

	// データをループして<tr>を追加
	words.forEach(word => {
		const row = document.createElement('tr');

		// 各<td>を作成してデータを埋め込む
		row.innerHTML = `
	                <td>${word.word}</td>
	                <td>${word.meaning}</td>
	                <td>${word.exampleSentence || ''}</td>
					<td>
						<input type="checkbox" ${word.isMarked ? 'checked' : ''} onchange="toggleMarked(${word.id}, this.checked)">
					</td>
					<td>
						<input type="checkbox" ${word.isLearned ? 'checked' : ''} onchange="toggleLearned(${word.id}, this.checked)">
					</td>
	                <td>${formatDate(word.updatedAt)}</td>
	                <td>${word.memo || ''}</td>
	            `;

		// テーブルに行を追加
		tbody.appendChild(row);
	});
}

// チェックボックスの変更をAPIに送信
async function toggleMarked(id, isChecked) {
	try {
		await fetch(`http://localhost:8080/api/words/${id}/marked`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
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
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ isLearned: isChecked }),
		});
		console.log(`Word ${id} learned: ${isChecked}`);
	} catch (error) {
		console.error('更新エラー:', error);
	}
}