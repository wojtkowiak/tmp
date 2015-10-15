package cdt2wav;


public abstract class CDT2WAVBaseOutput
{

    public CDT2WAVBaseOutput(int freq)
    {
        z80_freq = 3500000D;
        buf = null;
        bufPos = 0;
        frequency = 44100D;
        cycle = 0.0D;
        amp = 0;
        buf = null;
        bufPos = 0;
        frequency = freq;
        if(freq == 44100)
            z80_freq = 3400000D;
        else
        if(freq == 22050)
            z80_freq = 3394400D;
        else
        if(freq == 11025)
            z80_freq = 3364400D;
        cycle = frequency / z80_freq;
        init();
    }

    public void dispose()
    {
        buf = null;
    }

    protected abstract void init();

    protected abstract void write(int i);

    protected abstract void stop();

    protected double getFrequency()
    {
        return frequency;
    }

    protected void outputSeek(int pos)
    {
        bufPos = pos;
    }

    protected int outputTell()
    {
        return bufPos;
    }

    protected final void outputByte(byte b)
    {
        if(buf != null)
            buf[bufPos] = b;
        bufPos++;
    }

    protected final void outputByte(byte b, int count)
    {
        if(buf != null)
        {
            int p = bufPos;
            for(int i = 0; i < count; i++)
                buf[p++] = b;

        }
        bufPos += count;
    }

    public void setOutputBuffer(byte buf[])
    {
        this.buf = buf;
        bufPos = 0;
    }

    public int samples(int tstates)
    {
        return (int)(0.5D + cycle * (double)tstates);
    }

    public void setAmp(boolean high)
    {
        amp = high ? 255 : 0;
    }

    public void setAmpLow()
    {
        amp = 0;
    }

    public void setAmpNo()
    {
        amp = 128;
    }

    public void toggleAmp()
    {
        if(isLowAmp())
            amp = 255;
        else
            amp = 0;
    }

    protected boolean isLowAmp()
    {
        return amp == 0;
    }

    protected boolean isNoAmp()
    {
        return amp == 128;
    }

    public void play(int numsamples)
    {
        write(numsamples);
    }

    public void pause(int ms)
    {
        int p = (int)(((double)ms * frequency) / 1000D);
        play(p);
    }

    private static final int LOAMP = 0;
    private static final int HIAMP = 255;
    private static final int NOAMP = 128;
    private double z80_freq;
    private byte buf[];
    private int bufPos;
    private double frequency;
    private double cycle;
    private int amp;
}
