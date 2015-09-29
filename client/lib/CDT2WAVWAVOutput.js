CDT2WAVWAVOutput = class CDT2WAVWAVOutput extends CDT2WAVBaseOutput {

    constructor(freq) {
        super(freq);
        this.init();
    }

    /**
     * Prepare for output
     */
    init() {

        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        var channels = 1;
        // Create an empty two-second stereo buffer at the
        // sample rate of the AudioContext
        var frameCount = this.frequency * 60 * 30;
        this.myArrayBuffer = this.audioCtx.createBuffer(2, frameCount, this.frequency);


    }

    initBuf() {
        this.bufPos = 0;
        this.buf = this.myArrayBuffer.getChannelData(0);
    }

    playWav() {
        console.log(this.myArrayBuffer);
        var source = this.audioCtx.createBufferSource();  // set the buffer in the AudioBufferSourceNode
        source.buffer = this.myArrayBuffer;  // connect the AudioBufferSourceNode to the
        // destination so we can hear the sound
        source.connect(this.audioCtx.destination);  // start the source playing
        source.start();
    }

    /**
     * Generate WAV data for "numsamples" samples.
     * @param numsamples
     */
    write(numsamples) {

        // Write samples at current amplitude
        //let sample = (this.isLowAmp() ? this.LOAMP : this.HIAMP);
        this.outputBytes(-this.amp, numsamples);
    }
}
