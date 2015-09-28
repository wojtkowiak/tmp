package cdt2wav;

import java.io.PrintStream;

// Referenced classes of package cdt2wav:
//            CDT2WAVWAVOutput, CDT2WAVBaseOutput, Util

public class CDT2WAV
{

    public CDT2WAV(byte input[], int freq, boolean useamp)
    {
        noamp = false;
        debug = false;
        frequency = 44100;
        loop_start = 0;
        loop_count = 0;
        call_pos = 0;
        call_num = 0;
        call_cur = 0;
        noamp = useamp;
        inpbuf = input;
        frequency = freq;
    }

    public void dispose()
    {
        inpbuf = null;
        blockStart = null;
        if(output != null)
            output.dispose();
        output = null;
    }

    private void analyseID10()
    {
        pause = get2(inpbuf, data);
        datalen = get2(inpbuf, data + 2);
        data += 4;
        if(inpbuf[data] == 0)
            pilot = 8064;
        else
            pilot = 3220;
        sb_pilot = output.samples(2168);
        sb_sync1 = output.samples(667);
        sb_sync2 = output.samples(735);
        sb_bit0 = output.samples(885);
        sb_bit1 = output.samples(1710);
        lastbyte = 8;
    }

    private void analyseID11()
    {
        sb_pilot = output.samples(get2(inpbuf, data + 0));
        sb_sync1 = output.samples(get2(inpbuf, data + 2));
        sb_sync2 = output.samples(get2(inpbuf, data + 4));
        sb_bit0 = output.samples(get2(inpbuf, data + 6));
        sb_bit1 = output.samples(get2(inpbuf, data + 8));
        pilot = get2(inpbuf, data + 10);
        lastbyte = inpbuf[data + 12];
        pause = get2(inpbuf, data + 13);
        datalen = get3(inpbuf, data + 15);
        data += 18;
        if(debug)
            System.out.println((new StringBuilder()).append("Pilot is: ").append(pilot).append(" pause is: ").append(pause).append(" Length is: ").append(datalen).toString());
    }

    private void analyseID12()
    {
        sb_pilot = output.samples(get2(inpbuf, data + 0));
        for(pilot = get2(inpbuf, data + 2); pilot > 0; pilot--)
        {
            output.play(sb_pilot);
            output.toggleAmp();
        }

    }

    private void analyseID13()
    {
        pilot = inpbuf[data + 0];
        for(data++; pilot > 0; data += 2)
        {
            sb_pulse = output.samples(get2(inpbuf, data + 0));
            output.play(sb_pulse);
            output.toggleAmp();
            pilot--;
        }

    }

    private void analyseID14()
    {
        sb_pilot = pilot = sb_sync1 = sb_sync2 = 0;
        sb_bit0 = output.samples(get2(inpbuf, data + 0));
        sb_bit1 = output.samples(get2(inpbuf, data + 2));
        lastbyte = inpbuf[data + 4];
        pause = get2(inpbuf, data + 5);
        datalen = get3(inpbuf, data + 7);
        data += 10;
    }

    private void analyseID15()
    {
        sb_pulse = output.samples(get2(inpbuf, data + 0));
        if(sb_pulse == 0)
            sb_pulse = 1;
        pause = get2(inpbuf, data + 2);
        lastbyte = inpbuf[data + 4];
        datalen = get3(inpbuf, data + 5);
        data = data + 8;
        for(datapos = 0; datalen > 0; datapos++)
        {
            if(datalen != 1)
                bitcount = 8;
            else
                bitcount = lastbyte;
            databyte = inpbuf[data + datapos];
            for(; bitcount > 0; bitcount--)
            {
                output.setAmp((databyte & 0x80) != 0);
                output.play(sb_pulse);
                databyte <<= 1;
            }

            datalen--;
        }

        output.toggleAmp();
        if(pause != 0)
            output.pause(pause);
    }

    private void analyseID20()
    {
        pause = get2(inpbuf, data + 0);
        if(noamp)
            output.setAmpNo();
        else
            output.setAmpLow();
        if(debug)
            System.out.println((new StringBuilder()).append("Pause is ").append(pause).toString());
        if(pause != 0)
        {
            output.pause(pause);
        } else
        {
            output.pause(5000);
            System.out.println("Pause is added: 5 secs");
        }
        output.setAmpLow();
    }

    private void analyseID21()
    {
    }

    private void analyseID22()
    {
    }

    private void analyseID23()
    {
        jump = (short)(inpbuf[data + 0] + inpbuf[data + 1] * 256);
        currentBlock += jump;
        currentBlock--;
    }

    private void analyseID24()
    {
        loop_start = currentBlock;
        loop_count = get2(inpbuf, data + 0);
    }

    private void analyseID25()
    {
        loop_count--;
        if(loop_count > 0)
            currentBlock = loop_start;
    }

    private void analyseID26()
    {
        call_pos = currentBlock;
        call_num = get2(inpbuf, data + 0);
        call_cur = 0;
        jump = (short)(inpbuf[data + 2] + inpbuf[data + 3] * 256);
        currentBlock += jump;
        currentBlock--;
    }

    private void analyseID27()
    {
        call_cur++;
        if(call_cur == call_num)
        {
            currentBlock = call_pos;
        } else
        {
            currentBlock = call_pos;
            data = blockStart[currentBlock] + 1;
            jump = (short)(inpbuf[data + call_cur * 2 + 2] + inpbuf[data + call_cur * 2 + 3] * 256);
            currentBlock += jump;
            currentBlock--;
        }
    }

    private void analyseID2A()
    {
        output.pause(5000);
        output.setAmpLow();
    }

    private void analyseID33()
    {
    }

    private static int get2(byte data[], int pos)
    {
        return data[pos] & 0xff | data[pos + 1] << 8 & 0xff00;
    }

    private static int get3(byte data[], int pos)
    {
        return data[pos] & 0xff | data[pos + 1] << 8 & 0xff00 | data[pos + 2] << 16 & 0xff0000;
    }

    private static int get4(byte data[], int pos)
    {
        return data[pos] & 0xff | data[pos + 1] << 8 & 0xff00 | data[pos + 2] << 16 & 0xff0000 | data[pos + 3] << 24 & 0xff000000;
    }

    private int countBlocks(int blockstarts[])
    {
        int pos = 10;
        int numblocks;
        for(numblocks = 0; pos < inpbuf.length; numblocks++)
        {
            if(blockstarts != null)
                blockstarts[numblocks] = pos;
            pos++;
            switch(inpbuf[pos - 1])
            {
            case 16: // '\020'
                pos += get2(inpbuf, pos + 2) + 4;
                break;

            case 17: // '\021'
                pos += get3(inpbuf, pos + 15) + 18;
                break;

            case 18: // '\022'
                pos += 4;
                break;

            case 19: // '\023'
                pos += inpbuf[pos + 0] * 2 + 1;
                break;

            case 20: // '\024'
                pos += get3(inpbuf, pos + 7) + 10;
                break;

            case 21: // '\025'
                pos += get3(inpbuf, pos + 5) + 8;
                break;

            case 22: // '\026'
                pos += get4(inpbuf, pos + 0) + 4;
                break;

            case 23: // '\027'
                pos += get4(inpbuf, pos + 0) + 4;
                break;

            case 32: // ' '
                pos += 2;
                break;

            case 33: // '!'
                pos += inpbuf[pos + 0] + 1;
                break;

            case 35: // '#'
                pos += 2;
                break;

            case 36: // '$'
                pos += 2;
                break;

            case 38: // '&'
                pos += get2(inpbuf, pos + 0) * 2 + 2;
                break;

            case 40: // '('
                pos += get2(inpbuf, pos + 0) + 2;
                break;

            case 42: // '*'
                pos += 4;
                break;

            case 48: // '0'
                pos += inpbuf[pos + 0] + 1;
                break;

            case 49: // '1'
                pos += inpbuf[pos + 1] + 2;
                break;

            case 50: // '2'
                pos += get2(inpbuf, pos + 0) + 2;
                break;

            case 51: // '3'
                pos += inpbuf[pos + 0] * 3 + 1;
                break;

            case 52: // '4'
                pos += 8;
                break;

            case 53: // '5'
                pos += get4(inpbuf, pos + 16) + 20;
                break;

            case 64: // '@'
                pos += get3(inpbuf, pos + 1) + 4;
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
                return -1;

            case 34: // '"'
            case 37: // '%'
            case 39: // '\''
                break;
            }
        }

        return numblocks;
    }

    private void convertPass(CDT2WAVBaseOutput output)
    {
        currentBlock = 0;
        singlepulse = 0;
        if(output == null)
            debug = false;
        for(; currentBlock < numBlocks; currentBlock++)
        {
            id = inpbuf[blockStart[currentBlock]];
            blocks[currentBlock] = output.outputTell();
            ids[currentBlock] = getID(id);
            if(debug)
                System.out.println((new StringBuilder()).append("Block: ").append(getBlock(currentBlock)).append(" - ID: ").append(getID(currentBlock)).toString());
            if(debug)
                System.out.println((new StringBuilder()).append("ID is ").append(Util.hex(id)).toString());
            data = blockStart[currentBlock] + 1;
            switch(id)
            {
            case 16: // '\020'
                analyseID10();
                break;

            case 17: // '\021'
                analyseID11();
                break;

            case 18: // '\022'
                analyseID12();
                break;

            case 19: // '\023'
                analyseID13();
                break;

            case 20: // '\024'
                analyseID14();
                break;

            case 21: // '\025'
                analyseID15();
                break;

            case 32: // ' '
                analyseID20();
                break;

            case 33: // '!'
                analyseID21();
                break;

            case 34: // '"'
                analyseID22();
                break;

            case 35: // '#'
                analyseID23();
                break;

            case 36: // '$'
                analyseID24();
                break;

            case 37: // '%'
                analyseID25();
                break;

            case 38: // '&'
                analyseID26();
                break;

            case 39: // '\''
                analyseID27();
                break;

            case 42: // '*'
                analyseID2A();
                break;

            case 51: // '3'
                analyseID33();
                break;

            case 22: // '\026'
            case 23: // '\027'
            case 24: // '\030'
            case 25: // '\031'
            case 26: // '\032'
            case 27: // '\033'
            case 28: // '\034'
            case 29: // '\035'
            case 30: // '\036'
            case 31: // '\037'
            case 40: // '('
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
                System.out.println("ERR_TZX_UNSUPPORTED");
                break;

            case 48: // '0'
            case 49: // '1'
            case 50: // '2'
            case 52: // '4'
            case 53: // '5'
            case 64: // '@'
            case 90: // 'Z'
                break;
            }
            if(id != 16 && id != 17 && id != 20)
                continue;
            for(; pilot > 0; pilot--)
            {
                output.play(sb_pilot);
                output.toggleAmp();
            }

            if(sb_sync1 > 0)
            {
                output.play(sb_sync1);
                output.toggleAmp();
            }
            if(sb_sync2 > 0)
            {
                output.play(sb_sync2);
                output.toggleAmp();
            }
            for(datapos = 0; datalen > 0; datapos++)
            {
                if(datalen != 1)
                    bitcount = 8;
                else
                    bitcount = lastbyte;
                databyte = inpbuf[data + datapos];
                for(; bitcount > 0; bitcount--)
                {
                    if((databyte & 0x80) != 0)
                        sb_bit = sb_bit1;
                    else
                        sb_bit = sb_bit0;
                    output.play(sb_bit);
                    output.toggleAmp();
                    if(singlepulse == 0)
                    {
                        output.play(sb_bit);
                        output.toggleAmp();
                    }
                    databyte <<= 1;
                }

                datalen--;
            }

            singlepulse = 0;
            if(pause <= 0)
                continue;
            output.pause(1);
            if(noamp)
                output.setAmpNo();
            else
                output.setAmpLow();
            if(pause > 1)
                output.pause(pause - 1);
        }

        output.pause(5000);
        if(debug)
            System.out.println("End of tape... 5 seconds pause added");
        output.stop();
        if(debug)
            System.out.println(" OK");
    }

    public byte[] convert()
    {
        if(inpbuf == null || inpbuf.length < 10)
        {
            System.out.println("ERR_ILLEGAL_ARGUMENT");
            return null;
        }
        for(int i = 0; i < ZXTAPE_HEADER.length; i++)
            if(inpbuf[i] != ZXTAPE_HEADER[i])
            {
                System.out.println("ERR_NOT_TZX");
                return null;
            }

        int cdt_major = inpbuf[8];
        if(cdt_major == 0)
        {
            System.out.println("ERR_TZX_UNSUPPORTED");
            return null;
        }
        currentBlock = 0;
        numBlocks = countBlocks(null);
        if(numBlocks < 0)
        {
            System.out.println("ERR_TZX_UNSUPPORTED");
            return null;
        }
        blockStart = new int[numBlocks];
        ids = new String[numBlocks + 1];
        blocks = new int[numBlocks + 1];
        countBlocks(blockStart);
        output = new CDT2WAVWAVOutput(frequency);
        debug = false;
        convertPass(output);
        int dataLength = output.outputTell();
        byte data[] = null;
        if(dataLength > 0)
        {
            data = new byte[dataLength];
            output.setOutputBuffer(data);
            convertPass(output);
        }
        return data;
    }

    public int getBlock(int id)
    {
        if(blocks != null)
            return blocks[id];
        else
            return 0;
    }

    public String getID(int id)
    {
        String ret = null;
        switch(id)
        {
        case 16: // '\020'
            ret = "Turbo data II";
            break;

        case 17: // '\021'
            ret = "Turbo data";
            break;

        case 18: // '\022'
            ret = "Pure tone";
            break;

        case 19: // '\023'
            ret = "Sequence of pulses";
            break;

        case 20: // '\024'
            ret = "Pure Data";
            break;

        case 21: // '\025'
            ret = "Direct recording";
            break;

        case 32: // ' '
            ret = "Pause";
            break;

        case 33: // '!'
            ret = "Group Start";
            break;

        case 34: // '"'
            ret = "Group End";
            break;

        case 35: // '#'
            ret = "Jump relative";
            break;

        case 36: // '$'
            ret = "Loop Start";
            break;

        case 37: // '%'
            ret = "Loop End";
            break;

        case 38: // '&'
            ret = "Call Sequence";
            break;

        case 39: // '\''
            ret = "Return from Sequence";
            break;

        case 42: // '*'
            ret = "Stop tape";
            break;

        case 51: // '3'
            ret = "Hardware Info";
            break;

        case 22: // '\026'
        case 23: // '\027'
        case 24: // '\030'
        case 25: // '\031'
        case 26: // '\032'
        case 27: // '\033'
        case 28: // '\034'
        case 29: // '\035'
        case 30: // '\036'
        case 31: // '\037'
        case 40: // '('
        case 41: // ')'
        case 43: // '+'
        case 44: // ','
        case 45: // '-'
        case 46: // '.'
        case 47: // '/'
        case 48: // '0'
        case 49: // '1'
        case 50: // '2'
        default:
            ret = "Unknown block";
            break;
        }
        return ret;
    }

    private static byte ZXTAPE_HEADER[] = {
        90, 88, 84, 97, 112, 101, 33
    };
    protected boolean noamp;
    protected boolean debug;
    private byte inpbuf[];
    private int frequency;
    private CDT2WAVBaseOutput output;
    private int currentBlock;
    private int numBlocks;
    private int blockStart[];
    public String ids[];
    public int blocks[];
    private int id;
    private int data;
    private int datalen;
    private int datapos;
    private int bitcount;
    private int sb_bit;
    private byte databyte;
    private int pilot;
    private int sb_pilot;
    private int sb_sync1;
    private int sb_sync2;
    private int sb_bit0;
    private int sb_bit1;
    private int sb_pulse;
    private int lastbyte;
    private int pause;
    private int singlepulse;
    private short jump;
    private int loop_start;
    private int loop_count;
    private int call_pos;
    private int call_num;
    private int call_cur;

}
