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



    }

    initBuf() {


        var frameCount = this.frequency * (this.calculateBufLength(this.bufPos) / 1000.0);
        this.myArrayBuffer = this.audioCtx.createBuffer(2, frameCount, this.frequency);

        this.bufPos = 0;
        this.buf = this.myArrayBuffer.getChannelData(0);
    }

    spectrum(canvas) {

        var self = this;
        var bufferLength = this.analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);

        var canvasCtx = canvas.getContext("2d");
        var WIDTH = canvas.width;
        var HEIGHT = canvas.height;

        // draw an oscilloscope of the current audio source
        function draw() {

            drawVisual = requestAnimationFrame(draw);

            self.analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            canvasCtx.beginPath();

            var sliceWidth = WIDTH * 1.0 / bufferLength;
            var x = 0;

            for(var i = 0; i < bufferLength; i++) {

                var v = dataArray[i] / 128.0;
                var y = v * HEIGHT/2;

                if(i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height/2);
            canvasCtx.stroke();
        }

        draw();
    }

    playWav() {
        console.log(this.myArrayBuffer);
        var source = this.audioCtx.createBufferSource();  // set the buffer in the AudioBufferSourceNode

        source.buffer = this.myArrayBuffer;  // connect the AudioBufferSourceNode to the
        // destination so we can hear the sound
        //source.connect(this.audioCtx.destination);  // start the source playing

        var gainNode = this.audioCtx.createGain();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        this.analyser.smoothingTimeConstant = 0.85;

        source.connect(this.analyser);
        this.analyser.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        gainNode.gain.value = 0.01;
        source.start(this.audioCtx.currentTime);
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
