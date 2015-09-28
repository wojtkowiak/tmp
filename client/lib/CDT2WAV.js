CDT2WAV = class CDT2WAV {

    constructor(input, freq = 44100, useamp = false)
    {
        this.debug = false;
        this.loop_start = 0;
        this.loop_count = 0;
        this.call_pos = 0;
        this.call_num = 0;
        this.call_cur = 0;
        this.noamp = useamp;
        this.inpbuf = new Int8Array(input);
        this.frequency = freq;

        this.blockstarts = null;
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
