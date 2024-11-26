package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/words")
public class WordController {
	
	@GetMapping
	public String words() {
		return "words";
	}
	
	@GetMapping("/new-word")
	public String newWords() {
		return "new-word";
	}

}
