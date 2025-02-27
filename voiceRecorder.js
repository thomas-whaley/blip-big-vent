function cloneInstance(obj) {
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}

class VoiceRecorder {
  constructor(callback) {
    this.mic = new p5.AudioIn();
    this.mic.start(() => this.micStartedCallback());
    this.recorder = new p5.SoundRecorder();
    this.recorder.setInput(this.mic);
    this.currentSoundFile = new p5.SoundFile();
    this.callback = callback;
  }
  
  micStartedCallback() {
    this.recorder.record(this.currentSoundFile, undefined, () => this.recordedSoundCallback());
  }
  
  recordedSoundCallback() {
    let clonedSoundFile = cloneInstance(this.currentSoundFile);
    this.callback(clonedSoundFile);
    this.recorder.record(this.currentSoundFile, undefined, () => this.recordedSoundCallback());
  }
  
  stop() {
    this.recorder.stop();
  }
}