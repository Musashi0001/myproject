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

	public Word saveWord(Word word) {
		return wordRepository.save(word);
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
}
