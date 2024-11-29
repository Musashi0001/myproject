window.onload = () => {
	const params = new URLSearchParams(window.location.search);
	const wordId = params.get('id'); // URLの?id=123 を取得

	if (wordId) {
		// 編集モードの場合
		loadWordData(wordId); // データを取得してフォームに表示
		document.querySelector('h1').textContent = '単語を編集する';
		document.querySelector('.btn-primary').textContent = '更新';
	} else {
		// 登録モードの場合
		document.querySelector('h1').textContent = '単語を登録する';
		document.querySelector('.btn-primary').textContent = '登録';
	}
};

// データをロードしてフォームにセット
async function loadWordData(wordId) {
	try {
		const response = await fetch(`/api/words/${wordId}`);
		if (!response.ok) throw new Error('データの取得に失敗しました');

		const wordData = await response.json();

		// フォームのフィールドに値を設定
		document.getElementById('word').value = wordData.word;
		document.getElementById('exampleSentence').value = wordData.exampleSentence || '';
		document.getElementById('memo').value = wordData.memo || '';

		// 意味のデータをセット
		const meaningsContainer = document.getElementById('meanings-container');
		meaningsContainer.innerHTML = ''; // 初期化

		// 意味を分割し、それぞれ品詞と意味に分けて処理
		wordData.meaning.split(', ').forEach((meaning, index) => {
			const partOfSpeechMatch = meaning.match(/^\((.*?)\)/); // "(品詞)"の部分を抽出
			const partOfSpeech = partOfSpeechMatch ? partOfSpeechMatch[1] : ''; // 品詞を取得
			const meaningText = meaning.replace(/^\(.*?\)/, '').trim(); // "(品詞)"を削除して意味を取得

			const newMeaningGroup = document.createElement('div');
			newMeaningGroup.classList.add('meaning-group');
			newMeaningGroup.innerHTML = `
				<div>
					<label for="partOfSpeech-${index}">品詞</label>
					<select id="partOfSpeech-${index}" name="partOfSpeech" class="part-of-speech">
						<option value="" ${!partOfSpeech ? 'selected' : ''}></option>
						<option value="名詞" ${partOfSpeech === '名詞' ? 'selected' : ''}>名詞</option>
						<option value="動詞" ${partOfSpeech === '動詞' ? 'selected' : ''}>動詞</option>
						<option value="形容詞" ${partOfSpeech === '形容詞' ? 'selected' : ''}>形容詞</option>
						<option value="副詞" ${partOfSpeech === '副詞' ? 'selected' : ''}>副詞</option>
						<option value="前置詞" ${partOfSpeech === '前置詞' ? 'selected' : ''}>前置詞</option>
						<option value="接続詞" ${partOfSpeech === '接続詞' ? 'selected' : ''}>接続詞</option>
						<option value="感動詞" ${partOfSpeech === '感動詞' ? 'selected' : ''}>感動詞</option>
						<option value="代名詞" ${partOfSpeech === '代名詞' ? 'selected' : ''}>代名詞</option>
						<option value="冠詞" ${partOfSpeech === '冠詞' ? 'selected' : ''}>冠詞</option>
						<option value="数詞" ${partOfSpeech === '数詞' ? 'selected' : ''}>数詞</option>
					</select>
				</div>
				<div style="flex-grow: 1;">
					<label for="meaning-${index}">意味<span class="required">*</span></label>
					<input type="text" id="meaning-${index}" name="meaning" class="meaning" value="${meaningText}" required>
				</div>
				<div class="button-group">
					<button type="button" class="remove-meaning-btn" onclick="removeMeaning(this)">削除</button>
					<button type="button" class="add-meaning-btn" onclick="addMeaning()">＋ 意味を追加</button>
				</div>
			`;
			meaningsContainer.appendChild(newMeaningGroup);
		});
	} catch (error) {
		console.error('エラー:', error);
		alert('データの読み込みに失敗しました');
	}
}

// 登録または更新を送信
async function submitForm() {
	const params = new URLSearchParams(window.location.search);
	const wordId = params.get('id'); // URLの?id=123 を取得

	const word = document.getElementById('word').value.trim(); // 空白をトリム
	const meanings = Array.from(document.querySelectorAll('.meaning-group')).map((group, index) => {
		const partOfSpeech = group.querySelector('.part-of-speech').value;
		const meaning = group.querySelector('.meaning').value.trim(); // 空白をトリム
		return {
			index: index + 1, // 意味のインデックスを取得（1始まり）
			partOfSpeech: partOfSpeech,
			meaning: meaning,
			fullText: partOfSpeech ? `(${partOfSpeech})${meaning}` : meaning, // 品詞付きのテキスト
		};
	});

	// **エラーチェック**
	let errorMessages = [];
	if (!word) {
		errorMessages.push('単語フィールドを入力してください。');
	}

	// 空白の意味を検出してエラーメッセージに追加
	meanings.forEach(meaningObj => {
		if (!meaningObj.meaning) {
			errorMessages.push(`意味フィールドの ${meaningObj.index} 番目が空白です。`);
		}
	});

	// エラーがあればアラートを表示して処理を中断
	if (errorMessages.length > 0) {
		alert(errorMessages.join('\n')); // 複数のエラーメッセージを改行で連結
		return;
	}

	// 意味をカンマ区切りで結合
	const meaningText = meanings.map(meaningObj => meaningObj.fullText).join(', ');

	const formData = {
		word: word,
		meaning: meaningText,
		exampleSentence: document.getElementById('exampleSentence').value.trim(),
		memo: document.getElementById('memo').value.trim(),
	};

	try {
		let response;
		if (wordId) {
			// 編集リクエスト
			response = await fetch(`/api/words/${wordId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});
		} else {
			// 登録リクエスト
			response = await fetch('/api/words', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});
		}

		if (response.ok) {
			alert(wordId ? '更新が成功しました！' : '登録が成功しました！');
			window.location.href = '/words';
		} else {
			const errors = await response.json();
			let errorMessage = wordId ? '更新に失敗しました:\n' : '登録に失敗しました:\n';
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

// 意味を追加・削除する関数
let meaningCounter = 1;

function addMeaning() {
	const container = document.getElementById('meanings-container');
	const newMeaningGroup = document.createElement('div');
	newMeaningGroup.classList.add('meaning-group');

	// ユニークID生成
	const uniqueId = meaningCounter++;
	newMeaningGroup.innerHTML = `
		<div>
			<label for="partOfSpeech-${uniqueId}">品詞</label>
			<select id="partOfSpeech-${uniqueId}" name="partOfSpeech" class="part-of-speech">
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
			<label for="meaning-${uniqueId}">意味<span class="required">*</span></label>
			<input type="text" id="meaning-${uniqueId}" name="meaning" class="meaning" required>
		</div>
		<div class="button-group">
			<button type="button" class="remove-meaning-btn" onclick="removeMeaning(this)">削除</button>
			<button type="button" class="add-meaning-btn" onclick="addMeaning()">＋ 意味を追加</button>
		</div>
	`;

	container.appendChild(newMeaningGroup);
}

function removeMeaning(button) {
	const container = document.getElementById('meanings-container');
	if (container.childElementCount > 1) {
		button.parentElement.parentElement.remove();
	} else {
		alert('意味のフィールドは少なくとも1つ必要です。');
	}
}