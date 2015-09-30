CDT2WAVBaseOutput = class CDT2WAVBaseOutput {


    constructor(freq = 44100.0) {
        //this.LOAMP    = 0x26;      		// Low Level Amplitude  (-3 dB) // 38 - moze byc 0
        //this.HIAMP    = 0xDA;      		// High Level Amplitude (-3 dB) // 218 - moze byc 255
        this.LOAMP    = 0;      		// Low Level Amplitude  (-3 dB) // 38 - moze byc 0
        this.HIAMP    = 255;      		// High Level Amplitude (-3 dB) // 218 - moze byc 255
        this.NOAMP = 128;


        //
        // INSTANCE VARIABLES
        //


        this.z80_freq = 3500000.0; // Z80 frequency in Hz
        this.buf = null;			// output buffer
        this.bufPos = 0;
        this.cycle     = 0.0;		// Z80 cycles per wave sample
        this.amp = this.LOAMP;			// current amplitude

        this.frequency = freq; // wave data frequency
        if (freq == 44100)
            this.z80_freq = 3400000;
        else if (freq == 22050)
            this.z80_freq = 3394400;
        else if(freq == 11025)
            this.z80_freq = 3364400;

        this.cycle = this.frequency / this.z80_freq;


    }

    /**
     * Dereference any allocated resources. Do not call this object again
     * after calling dispose().
     */
    dispose() {
        this.buf = null;
    }

    /**
     * Get the sample frequency to use when generating output
     *
     * @return frequency in Hz
     */
    getFrequency() {
        return this.frequency;
    }

    /**
     * Set the current position in the output buffer.
     *
     * @return buffer position
     */
    outputSeek(pos) {
        this.bufPos = pos;
    }

    /**
     * Return the current position in the output buffer.
     * This is valid even if the output manager is in "test" mode.
     *
     * @return buffer position
     */
    outputTell() {
        return this.bufPos;
    }

    /**
     * Write a byte to the output buffer
     *
     * @param b - the byte to write
     */
    outputByte(b) {
        if (this.buf != null) {
            this.buf[this.bufPos] = (b / 255) * 1.0;
        }
        this.bufPos++;
    }

    /**
     * Write bytes to the output buffer
     *
     * @param b - the byte to write
     * @param count - number of times to write the byte
     */
    outputBytes(b, count) {
        if (this.buf != null) {
            p = this.bufPos;
            for (let i = 0; i < count; i++) {
                this.buf[p++] = parseFloat(b / 255);
            }
        }
        this.bufPos += count;
    }

    /**
     * Reset the output buffer. If the supplied buffer is null, the
     * output manager will operate in test mode.
     *
     * @param buf - output buffer
     */
    setOutputBuffer(buf) {
        this.buf = buf;
        this.bufPos = 0;
    }
    /**
     * Convert a sampling value in Z80 T-States to number of samples for wave output
     *
     * @param tstates - number of Z80 T-States
     * @return Number of wave samples at current frequency
     */
    samples(tstates) {
        return Math.floor((0.5 + (this.cycle * tstates)));
    }

    /**
     * Sets the sign of the wave
     *
     * @param high - true to set the wave to high amplitude
     */
    setAmp(high) {
        this.amp = (high ? this.HIAMP : this.LOAMP);
    }

    /**
     * Sets the sign of the wave to LO
     */
    setAmpLow() {
        this.amp = this.LOAMP;
    }

    setAmpNo()
    {
        this.amp = this.NOAMP;
    }


    /**
     * Toggles the sign of the wave
     * TODO: WHOLE CONCEPT TO BE RECODED IN ToggleSgn();
     */
    toggleAmp() {
        if (this.isLowAmp()) {
            this.amp = this.HIAMP;
        } else {
            this.amp = this.LOAMP;
        }
    }

    /**
     * Is the wave sign currently low amplitude?
     *
     * @return boolean - true iff the wave sign currently low amplitude
     */
    isLowAmp() {
        return (this.amp == this.LOAMP);
    }

    isNoAmp()
    {
        return this.amp == this.NOAMP;
    }

    /**
     * Generate wave data for "len" samples.
     *
     * @param numsamples
     */
    play(numsamples) {
        this.write(numsamples);
    }

    /**
     * Waits for a number of milliseconds
     *
     * @param ms - number of milliseconds
     */
    pause(ms) {
        let p;
        //if (curr!=(numblocks-1))
        //{
        p = Math.floor((( ms) * this.frequency)/1000.0);
        this.play(p);
        //}
    }

    stop() {

    }

};