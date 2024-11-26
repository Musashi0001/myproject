async function submitForm() {
	const word = document.getElementById('word').value;

	// 入力チェック: エラーメッセージを収集
	let errors = [];

	// 単語フィールドの必須チェック
	if (!word.trim()) {
		errors.push('単語を入力してください。');
	}

	// 意味フィールドの必須チェック
	const meaningGroups = document.querySelectorAll('.meaning-group');
	const meanings = Array.from(meaningGroups).map((group, index) => {
		const partOfSpeech = group.querySelector('.part-of-speech').value;
		const meaning = group.querySelector('.meaning').value;

		// 意味が未入力の場合、エラーを追加
		if (!meaning.trim()) {
			errors.push(`意味フィールド（${index + 1}番目）が未入力です。`);
		}

		// 品詞が未選択の場合、意味だけを返す
		return partOfSpeech ? `(${partOfSpeech})${meaning}` : meaning;
	}).join(', ');

	// エラーがある場合、すべてを表示して登録処理を中断
	if (errors.length > 0) {
		alert(`以下のエラーを修正してください:\n\n${errors.join('\n')}`);
		return;
	}

	// 例文やメモは任意項目なのでチェック不要
	const formData = {
		word: word,
		meaning: meanings,
		exampleSentence: document.getElementById('exampleSentence').value,
		memo: document.getElementById('memo').value,
	};

	try {
		// APIリクエスト送信
		const response = await fetch('/api/words', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});

		if (response.ok) {
			alert('登録が成功しました！');
			window.location.href = '/words';
		} else {
			const errors = await response.json();
			let errorMessage = '登録に失敗しました:\n';
			for (const [field, message] of Object.entries(errors)) {
				errorMessage += `${field}: ${message}\n`;
			}
			alert(errorMessage);
		}
	} catch (error) {
		console.error('エラー:', error);
		alert('エラーが発生しました。');
	}
}

// 意味を追加する関数
function addMeaning() {
	const container = document.getElementById('meanings-container');
	const newMeaningGroup = document.createElement('div');
	newMeaningGroup.classList.add('meaning-group');
	newMeaningGroup.innerHTML = `
		<div>
			<label>品詞</label>
			<select name="partOfSpeech" class="part-of-speech">
				<option value="" selected></option>
				<option value="名詞">名詞</option>
				<option value="動詞">動詞</option>
				<option value="形容詞">形容詞</option>
				<option value="副詞">副詞</option>
				<option value="前置詞">前置詞</option>
				<option value="接続詞">接続詞</option>
				<option value="感動詞">感動詞</option>
				<option value="代名詞">代名詞</option>
				<option value="冠詞">冠詞</option>
				<option value="数詞">数詞</option>
			</select>
		</div>
		<div style="flex-grow: 1;">
			<label for="meaning">意味<span class="required">*</span></label>
			<input type="text" name="meaning" class="meaning" required>
		</div>
		<div class="button-group">
			<button type="button" class="remove-meaning-btn" onclick="removeMeaning(this)">削除</button>
			<button type="button" class="add-meaning-btn" onclick="addMeaning()">＋ 意味を追加</button>
		</div>
	`;
	container.appendChild(newMeaningGroup);

	// 最初の項目の削除ボタンを非表示
	const groups = container.querySelectorAll('.meaning-group');
	if (groups.length === 1) {
		groups[0].querySelector('.remove-meaning-btn').style.display = 'none';
	} else {
		groups[0].querySelector('.remove-meaning-btn').style.display = 'inline-block';
	}
}

// 意味を削除する関数
function removeMeaning(button) {
	const container = document.getElementById('meanings-container');
	if (container.childElementCount > 1) {
		button.parentElement.parentElement.remove(); // ボタンの親要素を削除
	} else {
		alert('意味のフィールドは少なくとも1つ必要です。');
	}

	// 残った最初の項目の削除ボタンを非表示
	const groups = container.querySelectorAll('.meaning-group');
	if (groups.length === 1) {
		groups[0].querySelector('.remove-meaning-btn').style.display = 'none';
	} else {
		groups[0].querySelector('.remove-meaning-btn').style.display = 'inline-block';
	}
}
