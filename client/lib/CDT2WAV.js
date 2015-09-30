CDT2WAV = class CDT2WAV {

    constructor(input, freq = 44100, useamp = false) {
        this.debug = false;

        this.noamp = useamp;
        this.inpbuf = new Int8Array(input);
        this.frequency = freq;


        this.output = null;
        this.currentBlock = null; // Current block that is playing
        this.numBlocks = null; // Total Num. of blocks
        this.ids = null; // Array for all IDs
        this.blocks = null; // Array for all IDs

        this.id = null; // Current Block ID
        this.data = null; // Data to be played
        this.datalen = null; // Len of ^^^
        this.datapos = null; // Position in ^^^
        this.bitcount = null; // How many bits to play in current byte ?
        this.sb_bit = null; // should we play bit 0 or 1 ?
        this.databyte = null; // Current Byte to be replayed of the data
        this.pilot = null; // Len of Pilot signal (in hp's)
        this.sb_pilot = null; // Pilot pulse
        this.sb_sync1 = null; // Sync first half-period (hp)
        this.sb_sync2 = null; // Sync second
        this.sb_bit0 = null; // Bit-0
        this.sb_bit1 = null; // Bit-1
        this.sb_pulse = null; // Pulse in Sequence of pulses and direct recording block
        this.lastbyte = null; // How many bits are in last byte of data ?
        this.pause = null; // Pause after current block (in milliseconds)
        this.singlepulse = null; // Flag to activate single pulse waves
        this.jump = null; // Relative Jump

        this.loop_start = null; // Position of the last Loop Start block
        this.loop_count = null; // Counter of the Loop
        this.call_pos = null; // Position of the last Call Sequence block
        this.call_num = null; // Number of Calls in the last Call Sequence block
        this.call_cur = null; // Current Call to be made


        this.blockstarts = null; // Array of block start positions

        this.ZXTAPE_HEADER = [90, 88, 84, 97, 112, 101, 33];
    }


    convert() {

        if (this.inpbuf == null || this.inpbuf.length < 10) {
            throw "ERR_ILLEGAL_ARGUMENT";
        }

        for (let i = 0; i < this.ZXTAPE_HEADER.length; i++) {
            if (this.inpbuf[i] != this.ZXTAPE_HEADER[i]) {
                throw "ERR_NOT_TZX";
            }
        }

        let cdt_major = this.inpbuf[8];

        if (cdt_major == 0) {
            throw "ERR_TZX_UNSUPPORTED";
        }

        this.currentBlock = 0;
        this.numBlocks = this.countBlocks(null);
        if (this.numBlocks < 0) {
            throw "ERR_TZX_UNSUPPORTED";
        }

        this.blockstarts = {};

        this.ids = {};
        this.blocks = {};

        this.countBlocks();
        this.output = new CDT2WAVWAVOutput(this.frequency);

        this.debug = true;

        this.convertPass();

        let dataLength = this.output.outputTell();

        console.log('dataLength = ' + dataLength);
        if (dataLength > 0) {

            this.output.initBuf();
            this.convertPass();
        }
        //return data;
    }

    play() {
        this.output.playWav();
    }

    spectrum(canvas) {
        this.output.spectrum(canvas);
    }

    getID(id) {
        let ret = null;

        switch (id) {
            case 0x10:
                ret = "Standard Data block";
                break;
            case 0x11:
                ret = "Data block";
                break;
            case 0x12:
                ret = "Pure tone";
                break;
            case 0x13:
                ret = "Pulse sequence";
                break;
            case 0x14:
                ret = "Pure Data";
                break;
            case 0x15:
                ret = "Direct recording";
                break;
            case 0x20:
                ret = "Pause";
                break;
            case 0x21:
                ret = "Group Start";
                break;
            case 0x22:
                ret = "Group End";
                break;
            case 0x23:
                ret = "Jump relative";
                break;
            case 0x24:
                ret = "Loop Start";
                break;
            case 0x25:
                ret = "Loop End";
                break;
            case 0x26:
                ret = "Call Sequence";
                break;
            case 0x27:
                ret = "Return from Sequence";
                break;
            case 0x2A:
                ret = "Stop tape";
                break;
            case 0x33:
                ret = "Hardware Info";
                break;
            case 0x30:
                ret = "Description";
                break;
            case 0x31:
                ret = "Message";
                break;
            case 0x32:
                ret = "Archive Info";
                break;
            case 0x34:
                ret = "Emulation info";
                break;
            case 0x35:
                ret = "Custom info";
                break;
            case 0x40:
                ret = "Snapshot";
                break;
            case 0x5A:
                ret = "ZXTape!";
                break;
            default:
                ret = "Unknown block";
        }

        return ret;
    }

    getBlock(id) {
        if (this.blocks != null)
            return this.blocks[id];

        return 0;
    }

    //
    // TZX Blocks Parsing routines
    //

    // ...Standard Loading Data block
    analyseID10() {
        this.pause = this.get2(this.data);
        this.datalen = this.get2(this.data+2);
        this.data += 4;
        if (this.inpbuf[this.data] == 0)
            this.pilot = 8064;
        else
            this.pilot = 3220;
        this.sb_pilot = this.output.samples(2168);
        this.sb_sync1 = this.output.samples(667);
        this.sb_sync2 = this.output.samples(735);
        this.sb_bit0 = this.output.samples(885);
        this.sb_bit1 = this.output.samples(1710);
        this.lastbyte = 8;
    }

    // ...Custom Loading Data block
    analyseID11() {
        this.sb_pilot = this.output.samples(this.get2(this.data+0));
        this.sb_sync1 = this.output.samples(this.get2(this.data+2));
        this.sb_sync2 = this.output.samples(this.get2(this.data+4));
        this.sb_bit0 = this.output.samples(this.get2(this.data+6));
        this.sb_bit1 = this.output.samples(this.get2(this.data+8));
        this.pilot = this.get2(this.data+10);
        this.lastbyte = this.inpbuf[this.data+12];
        this.pause = this.get2(this.data+13);
        this.datalen = this.get3(this.data+15);
        this.data+=18;
        if (this.debug)
            console.log("Pilot is: " +this.pilot + " pause is: " + this.pause + " Length is: " + this.datalen);
    }

    // ...Pure Tone
    analyseID12() {
        this.sb_pilot = this.output.samples(this.get2(this.data+0));
        this.pilot = this.get2(this.data+2);
        while (this.pilot > 0) {
            this.output.play(this.sb_pilot);
            this.output.toggleAmp();
            this.pilot--;
        }
    }

    // ...Sequence of Pulses
    analyseID13() {
        this.pilot= this.inpbuf[this.data+0];
        this.data++;
        while (this.pilot > 0) {
            this.sb_pulse = this.output.samples(this.get2(this.data+0));
            this.output.play(this.sb_pulse);
            this.output.toggleAmp();
            this.pilot--;
            this.data+=2;
        }
    }

    // ...Pure Data
    analyseID14() {
        this.sb_pilot = 0;
        this.pilot = 0;
        this.sb_sync1 = 0;
        this.sb_sync2 = 0;
        this.sb_bit0 = this.output.samples(this.get2(this.data+0));
        this.sb_bit1 = this.output.samples(this.get2(this.data+2));
        this.lastbyte = this.inpbuf[this.data+4];
        this.pause = this.get2(this.data+5);
        this.datalen = this.get3(this.data+7);
        this.data += 10;
    }

    // ...Direct Recording
    analyseID15() {
        // For now the BEST way is to use the sample frequency for replay that is
        // exactly the SAME as the Original Freq. used when sampling this block !
        // i.e. NO downsampling is handled YET ... use TAPER when you need it ! ;-)

        this.sb_pulse = this.output.samples(this.get2(this.data+0));
        if (this.sb_pulse == 0) this.sb_pulse=1;       	// In case sample frequency > 44100
        this.pause = this.get2(this.data+2);            	// (Should work for frequencies up to 48000)
        this.lastbyte = this.inpbuf[this.data+4];
        this.datalen = this.get3(this.data+5);

        this.data = this.data+8;
        this.datapos=0;
        // Replay Direct Recording block ...
        while (this.datalen > 0) {
            if (this.datalen != 1) this.bitcount=8;
            else this.bitcount = this.lastbyte;
            this.databyte = this.inpbuf[this.data+this.datapos];
            while (this.bitcount > 0) {
                this.output.setAmp((this.databyte & 0x80) != 0);
                this.output.play(this.sb_pulse);
                this.databyte<<=1;
                this.bitcount--;
            }
            this.datalen--;
            this.datapos++;
        }
        this.output.toggleAmp(); // Changed on 26-01-2005
        if (this.pause != 0) this.output.pause(this.pause);
    }

    // ...Pause or Stop the Tape
    analyseID20() {
        this.pause = this.get2(this.data+0);
        this.output.setAmpLow();
        if (this.debug)
            console.log("Pause is " + this.pause);
        if (this.pause != 0) {
            this.output.pause(this.pause);
        } else {
            this.output.pause(5000); // 5 seconds of pause in "Stop Tape" wave output
            console.log("Pause is added: 5 secs");
        }
        this.output.setAmpLow();
    }

    // ...Group Start
    analyseID21() {
        // do nothing
    }

    // ...Group End
    analyseID22() {
        // do nothing
    }

    // ...Jump To Relative
    analyseID23() {
        this.jump = this.inpbuf[this.data+0] + this.inpbuf[this.data+1]*256;
        this.currentBlock += this.jump;
        this.currentBlock--;
    }

    // ...Loop Start
    analyseID24() {
        this.loop_start=this.currentBlock;
        this.loop_count=this.get2(this.data+0);
    }

    // ...Loop End
    analyseID25() {
        this.loop_count--;
        if (this.loop_count>0) {
            this.currentBlock = this.loop_start;
        }
    }

    // ...Call Sequence
    analyseID26() {
        this.call_pos = this.currentBlock;
        this.call_num = this.get2(this.data+0);
        this.call_cur=0;
        this.jump = this.inpbuf[this.data+2] + this.inpbuf[this.data+3]*256;
        this.currentBlock += this.jump;
        this.currentBlock--;
    }

    // ...Return from Sequence
    analyseID27() {
        this.call_cur++;
        if (this.call_cur==this.call_num) {
            this.currentBlock=this.call_pos;
        } else {
            this.currentBlock = this.call_pos;
            this.data = this.blockstarts[this.currentBlock]+1;
            this.jump = this.inpbuf[this.data+this.call_cur*2+2] + this.inpbuf[this.data+this.call_cur*2+3]*256;
            this.currentBlock+=this.jump;
            this.currentBlock--;
        }
    }

    // ...Stop the tape if in 48k mode
    analyseID2A() {
        this.output.pause(5000);
        this.output.setAmpLow();
    }

    // ...Hardware Info
    analyseID33() {
    }

    convertPass() {

        this.currentBlock = 0;
        this.singlepulse = 0;
        //debug = true;

        // disable debug mode if this is a test run
        if (this.output == null) {
            //debug = false;
        }

        // Start replay of blocks (Main loop of the program)
        while (this.currentBlock < this.numBlocks) {

            // Get ID of next block and start position in input byte array
            this.id = this.inpbuf[this.blockstarts[this.currentBlock]];
            this.blocks[this.currentBlock] = this.output.outputTell();

            this.ids[this.currentBlock] = this.getID(this.id);
            if (this.debug) {
                console.log("Block: " + this.getBlock(this.currentBlock) + " - ID: " + this.getID(this.id) + " (" + this.id + "}");
                //console.log("ID is " + Util.hex(id));
            }

            this.data = this.blockstarts[this.currentBlock] + 1;

            switch (this.id) {

                case 0x10:
                    this.analyseID10(); // Standard Loading Data block
                    break;
                case 0x11:
                    this.analyseID11(); // Custom Loading Data block
                    break;
                case 0x12:
                    this.analyseID12(); // Pure Tone
                    break;
                case 0x13:
                    this.analyseID13(); // Sequence of Pulses
                    break;
                case 0x14:
                    this.analyseID14(); // Pure Data
                    break;
                case 0x15:
                    this.analyseID15(); // Direct Recording
                    break;
                case 0x20:
                    this.analyseID20(); // Pause or Stop the Tape command
                    break;
                case 0x21:
                    this.analyseID21(); // Group Start
                    break;
                case 0x22:
                    this.analyseID22(); // Group End
                    break;
                case 0x23:
                    this.analyseID23(); // Jump To Relative
                    break;
                case 0x24:
                    this.analyseID24(); // Loop Start
                    break;
                case 0x25:
                    this.analyseID25(); // Loop End
                    break;
                case 0x26:
                    this.analyseID26(); // Call Sequence
                    break;
                case 0x27:
                    this.analyseID27(); // Return from Sequence
                    break;
                case 0x2A:
                    this.analyseID2A(); // Stop the tape if in 48k mode
                    break;
                case 0x33:
                    this.analyseID33(); // Hardware Info
                    break;

                // Ignored
                case 0x30: // Description
                case 0x31: // Message
                case 0x32: // Archive Info
                case 0x34: // Emulation info
                case 0x35: // Custom Info
                case 0x40: // Snapshot
                case 0x5A: // ZXTape!
                    break;

                // Unknown/Unsupported blocks
                case 0x16: // C64 ROM Type Data Block
                case 0x17: // C64 Turbo Tape Data Block
                case 0x28: // Select Block
                default:
                    throw("ERR_TZX_UNSUPPORTED");
            }

            // TZX file blocks analysis finished
            // Now we start generating the sound waves

            if (this.id == 0x10 || this.id == 0x11 || this.id == 0x14) {
                // One of the data blocks ...

                // Play PILOT TONE
                while (this.pilot > 0) {
                    this.output.play(this.sb_pilot);
                    this.output.toggleAmp();
                    this.pilot--;
                }

                // Play first SYNC pulse
                if (this.sb_sync1 > 0) {
                    this.output.play(this.sb_sync1);
                    this.output.toggleAmp();
                }

                // Play second SYNC pulse
                if (this.sb_sync2 > 0) {
                    this.output.play(this.sb_sync2);
                    this.output.toggleAmp();
                }

                // Play actual DATA

                this.datapos = 0;
                while (this.datalen > 0) {
                    if (this.datalen != 1)
                        this.bitcount = 8;
                    else
                        this.bitcount = this.lastbyte;

                    this.databyte = this.inpbuf[this.data + this.datapos];

                    while (this.bitcount > 0) {
                        if ((this.databyte & 0x80) != 0)
                            this.sb_bit = this.sb_bit1;
                        else
                            this.sb_bit = this.sb_bit0;

                        this.output.play(this.sb_bit); // Play first pulse of the bit
                        this.output.toggleAmp();

                        if (this.singlepulse == 0) {
                            this.output.play(this.sb_bit); // Play second pulse of the bit
                            this.output.toggleAmp();
                        }
                        this.databyte <<= 1;
                        this.bitcount--;
                    }
                    this.datalen--;
                    this.datapos++;
                }
                this.singlepulse = 0;   // Reset flag for next TZX blocks

                // If there is pause after block present then make first millisecond the oposite
                // pulse of last pulse played and the rest in LOAMP ... otherwise don't do ANY pause
                if (this.pause > 0) {
                    this.output.pause(1);
                    if (this.noamp)
                        this.output.setAmpNo();
                    else
                        this.output.setAmpLow();
                    if (this.pause > 1) this.output.pause(this.pause - 1);
                }
            }

            // We continue to replay the next TZX block
            this.currentBlock++;
        }

        // 5 seconds of pause in "Stop Tape" wave output
        this.output.pause(5000);
        if (this.debug)
            console.log("End of tape... 5 seconds pause added");

        this.output.stop();

        if (this.debug)
            console.log(" OK");
    }



    get2(pos)
    {
        return this.inpbuf[pos] & 0xff | this.inpbuf[pos + 1] << 8 & 0xff00;
    }


    get3(pos)
    {
        return this.inpbuf[pos] & 0xff | this.inpbuf[pos + 1] << 8 & 0xff00 | this.inpbuf[pos + 2] << 16 & 0xff0000;
    }

    get4(pos)
    {
        return this.inpbuf[pos] & 0xff | this.inpbuf[pos + 1] << 8 & 0xff00 | this.inpbuf[pos + 2] << 16 & 0xff0000 | this.inpbuf[pos + 3] << 24 & 0xff000000;
    }

    countBlocks() {
        let pos = 10;
        let numblocks;
        for(numblocks = 0; pos < this.inpbuf.length; numblocks++)
        {
            if(this.blockstarts != null)
                this.blockstarts[numblocks] = pos;

            pos++;
            switch(this.inpbuf[pos - 1])
            {
                case 16: // '\020'
                    pos += this.get2(pos + 2) + 4;
                    break;

                case 17: // '\021'
                    pos += this.get3(pos + 15) + 18;
                    break;

                case 18: // '\022'
                    pos += 4;
                    break;

                case 19: // '\023'
                    pos += this.inpbuf[pos] * 2 + 1;
                    break;

                case 20: // '\024'
                    pos += this.get3(pos + 7) + 10;
                    break;

                case 21: // '\025'
                    pos += this.get3(pos + 5) + 8;
                    break;

                case 22: // '\026'
                    pos += this.get4(pos) + 4;
                    break;

                case 23: // '\027'
                    pos += this.get4(pos) + 4;
                    break;

                case 32: // ' '
                    pos += 2;
                    break;

                case 33: // '!'
                    pos += this.inpbuf[pos] + 1;
                    break;

                case 35: // '#'
                    pos += 2;
                    break;

                case 36: // '$'
                    pos += 2;
                    break;

                case 38: // '&'
                    pos += this.get2(pos) * 2 + 2;
                    break;

                case 40: // '('
                    pos += this.get2(pos) + 2;
                    break;

                case 42: // '*'
                    pos += 4;
                    break;

                case 48: // '0'
                    pos += this.inpbuf[pos] + 1;
                    break;

                case 49: // '1'
                    pos += this.inpbuf[pos + 1] + 2;
                    break;

                case 50: // '2'
                    pos += this.get2(pos) + 2;
                    break;

                case 51: // '3'
                    pos += this.inpbuf[pos] * 3 + 1;
                    break;

                case 52: // '4'
                    pos += 8;
                    break;

                case 53: // '5'
                    pos += this.get4(pos + 16) + 20;
                    break;

                case 64: // '@'
                    pos += this.get3(pos + 1) + 4;
                    break;

                case 90: // 'Z'
                    pos += 9;
                    break;

                case 24: // '\030'
                case 25: // '\031'
                case 26: // '\032'
                case 27: // '\033'
                case 28: // '\034'
                case 29: // '\035'
                case 30: // '\036'
                case 31: // '\037'
                case 41: // ')'
                case 43: // '+'
                case 44: // ','
                case 45: // '-'
                case 46: // '.'
                case 47: // '/'
                case 54: // '6'
                case 55: // '7'
                case 56: // '8'
                case 57: // '9'
                case 58: // ':'
                case 59: // ';'
                case 60: // '<'
                case 61: // '='
                case 62: // '>'
                case 63: // '?'
                case 65: // 'A'
                case 66: // 'B'
                case 67: // 'C'
                case 68: // 'D'
                case 69: // 'E'
                case 70: // 'F'
                case 71: // 'G'
                case 72: // 'H'
                case 73: // 'I'
                case 74: // 'J'
                case 75: // 'K'
                case 76: // 'L'
                case 77: // 'M'
                case 78: // 'N'
                case 79: // 'O'
                case 80: // 'P'
                case 81: // 'Q'
                case 82: // 'R'
                case 83: // 'S'
                case 84: // 'T'
                case 85: // 'U'
                case 86: // 'V'
                case 87: // 'W'
                case 88: // 'X'
                case 89: // 'Y'
                default:
                    console.log(this.inpbuf[pos - 1]);
                    return -1;

                case 34: // '"'
                case 37: // '%'
                case 39: // '\''
                    break;
            }
        }

        return numblocks;
    }


};
