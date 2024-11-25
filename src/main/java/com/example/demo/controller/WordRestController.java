package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

	@PutMapping("/{id}/marked")
	public Word updateMarked(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
		return wordService.updateMarked(id, body.get("isMarked"));
	}

	@PutMapping("/{id}/learned")
	public Word updateLearned(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
		return wordService.updateLearned(id, body.get("isLearned"));
	}

}
