class SpeechDetection {
  constructor(language, onWordHeard) {
    // this.voiceRecorder = new VoiceRecorder((soundFile) => this.readyForBubbleCreation(soundFile));
    this.language = language;
    this.currentLanguage = 0;
    this.onWordHeard = onWordHeard;
    this.wordMap = {};
    
    this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    this.SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
    
    this.recognition = this.createRecognition();
  }
  
  reset() {
    this.recognition.stop();
    
    this.wordMap = {};
    this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    this.SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
    
    this.recognition = this.createRecognition();
  }
  
  playSound(soundFile) {
    
  }
  
  handleResult(self, event) {
    let last_results = event.results[event.results.length - 1];
    for (let i = 0; i < last_results.length; i ++) {
      let words = last_results[i].transcript.split(" ");
      for (let j = 0; j < words.length; j ++) {
        let word = words[j];
        if (!word) continue;

        if (!(word in self.wordMap)) {
          self.wordMap[word] = 120;
          self.onWordHeard(word);
        }
      }
    }
  }
  
  filterWordsMap() {
    let wordsToDelete = [];
    for (const word in this.wordMap) {
      this.wordMap[word] --;
      if (this.wordMap[word] < 0) {
        wordsToDelete.push(word);
      }
    }
    wordsToDelete.forEach(word => {
      delete this.wordMap[word];
    });
  }
  
  createRecognition() {
    let recognition = new this.SpeechRecognition();
    let speechRecognitionList = new this.SpeechGrammarList();
    speechRecognitionList.addFromString("", 1);

    recognition.grammars = speechRecognitionList;
    recognition.continuous = true;
    recognition.lang = this.language;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;

    recognition.onresult = event => this.handleResult(this, event);

    recognition.start();

    return recognition;
  }
}
