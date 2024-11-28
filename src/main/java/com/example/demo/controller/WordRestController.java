package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Word;
import com.example.demo.service.WordService;

@RestController
@RequestMapping("/api/words")
public class WordRestController {

	private final WordService wordService;

	public WordRestController(WordService wordService) {
		this.wordService = wordService;
	}

	@GetMapping
	public List<Word> getAllWords() {
		return wordService.getAllWords();
	}

	@GetMapping("/{id}")
	public ResponseEntity<Word> getWordById(@PathVariable Long id) {
		Word word = wordService.getWordById(id);
		if (word == null) {
			return ResponseEntity.notFound().build(); // IDが見つからない場合404を返す
		}
		return ResponseEntity.ok(word); // 正常時は200とデータを返す
	}

	@PostMapping
	public ResponseEntity<Map<String, String>> addWord(@RequestBody Word newWord) {
		Map<String, String> errors = new HashMap<>();

		if (newWord.getWord() == null || newWord.getWord().trim().isEmpty()) {
			errors.put("word", "単語を入力してください");
		}
		if (newWord.getMeaning() == null || newWord.getMeaning().trim().isEmpty()) {
			errors.put("meaning", "意味を入力してください");
		}

		if (!errors.isEmpty()) {
			return ResponseEntity.badRequest().body(errors);
		}

		wordService.saveWord(newWord);
		return ResponseEntity.ok(null); // 成功時のレスポンスは null または空レスポンス
	}

	@PutMapping("/{id}")
	public ResponseEntity<Map<String, String>> updateWord(
			@PathVariable Long id,
			@RequestBody Word updatedWord) {
		Map<String, String> errors = new HashMap<>();

		// バリデーションチェック
		if (updatedWord.getWord() == null || updatedWord.getWord().trim().isEmpty()) {
			errors.put("word", "単語を入力してください");
		}
		if (updatedWord.getMeaning() == null || updatedWord.getMeaning().trim().isEmpty()) {
			errors.put("meaning", "意味を入力してください");
		}

		if (!errors.isEmpty()) {
			return ResponseEntity.badRequest().body(errors);
		}

		Word result = wordService.updateWord(id, updatedWord);
		if (result == null) {
			errors.put("id", "指定されたIDの単語が見つかりません");
			return ResponseEntity.badRequest().body(errors);
		}

		return ResponseEntity.ok(null); // 成功時のレスポンスは null または空レスポンス
	}

	@PutMapping("/{id}/marked")
	public Word updateMarked(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
		return wordService.updateMarked(id, body.get("isMarked"));
	}

	@PutMapping("/{id}/learned")
	public Word updateLearned(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
		return wordService.updateLearned(id, body.get("isLearned"));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteWord(@PathVariable Long id) {
		boolean isDeleted = wordService.deleteWord(id);
		if (!isDeleted) {
			return ResponseEntity.notFound().build(); // IDが見つからない場合404を返す
		}
		return ResponseEntity.noContent().build(); // 成功時は204を返す
	}
}
