package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entity.Word;
import com.example.demo.repository.WordRepository;

@Service
public class WordService {
	private final WordRepository wordRepository;

	public WordService(WordRepository wordRepository) {
		this.wordRepository = wordRepository;
	}

	public List<Word> getAllWords() {
		return wordRepository.findAll();
	}

	public Word getWordById(Long id) {
		return wordRepository.findById(id).orElse(null);
	}

	public Word saveWord(Word word) {
		return wordRepository.save(word);
	}

	public Word updateWord(Long id, Word updatedWord) {
		Word existingWord = wordRepository.findById(id).orElse(null);
		if (existingWord == null) {
			return null; // 更新対象が見つからない場合
		}

		// フィールドを更新
		existingWord.setWord(updatedWord.getWord());
		existingWord.setMeaning(updatedWord.getMeaning());
		existingWord.setExampleSentence(updatedWord.getExampleSentence());
		existingWord.setMemo(updatedWord.getMemo());

		return wordRepository.save(existingWord); // 更新したデータを保存
	}

	public Word updateMarked(Long id, Boolean isMarked) {
		Word word = wordRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Word not found: " + id));
		word.setIsMarked(isMarked);
		return wordRepository.save(word);
	}

	public Word updateLearned(Long id, Boolean isLearned) {
		Word word = wordRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Word not found: " + id));
		word.setIsLearned(isLearned);
		return wordRepository.save(word);
	}

	public boolean deleteWord(Long id) {
		if (wordRepository.existsById(id)) {
			wordRepository.deleteById(id);
			return true;
		}
		return false;
	}

}
