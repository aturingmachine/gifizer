# Gifizer

Convert Videos to GIFs, APNGs, and WEBPs via ffmpeg.

```
npm i -g gifizer
```

> TODO this section needs to be more friendly to read

## Usage:

```
--------------------------------------------------------------------
gifizer <infile> (outfile) (...options)

If no outfile is provided the outfile will be 'infile_out.gif'
```

## Examples:

```
--------------------------------------------------------------------
Use all defaults:
  gifizer /path/to/video.mp4 /path/to/output.gif
Use "fast" preset:
  gifizer /path/to/video.mp4 /path/to/output.gif --preset=fast
Use config from cli:
  gifizer /path/to/video.mp4 /path/to/output.gif \
  --framerate=24 \
  --scale=320:-1 \
  --max_colors=none \
  --select=medium \
  --dither.type=bayer \
  --dither.new=true \
  --dither.bayer_scale=1
  --overwrite
```

## Options:

```
--help              Display this message
  -h

--overwrite         Overwrite the outfile if the path already exists
  --force
  -o
  -f

--no-overwrite      Don't explode if the outfile already exists.
  -n                Overrides the --overwrite flag.

--debug             Output more information during the run.
  -d

--verbose           Output debug information and pipe the output of
  -v                ffmpeg to your stdio.

--format            Set the output format. If one is not set we will
                    try to infer the output type based on the extension
                    of the outfile. If a format is provided the extension
                    of the outfile will be overridden.
                    'apng' | 'gif' | 'webp'
```

## Conversion Options:

```
--------------------------------------------------------------------
The following are options that will be passed to the underlying call
to ffmpeg. All Conversion options are optional. Sensible defaults will 
be applied if an option is not set explicitally or by a preset.

--framerate         The framerate of the output GIF.
                    number | 'variable'

--scale             The scale of the output GIF. Takes a tuple of 
                    numbers. Use -1 to maintain scale. i.e. 320:-1
                    number:number

--max_colors        The maximum number of colors to use for pallettegen.
                    Lower numbers produce smaller outputs of a lower quality.
                    number | 'variable'

--select            Changes how frames are skipped to produce the output gif.
                    'hard' | 'medium' | 'small'
                
--dither            Configure the dithering used when generating the GIF.
                    DitherType | DitherConfig
                    See 'Dither' below.
```

## Dither:

```
--------------------------------------------------------------------
Dithering is the application of "noise" to the output gif to smooth
the visual effects of compression.
Tweaking these options can produce much larger and higher quality
outputs - or much lower quality outputs and file sizes.

Dithering Types:
'bayer' | 'heckbert' | 'floyd_steinberg' | 'sierra2' | 'sierra2_4a'

Supplying just a dithering type will use the ffmpeg defaults for
the requested algorithm.

Further Options:
--dither

  .type             See Dithering Types

  .new              Set to force palleteuse to produce a new color 
                    pallete for every frame of the input.
                    Boolean

  .bayer_scale      Only applied to the 'bayer' dithering type.
                    Integer [0,5]. Lower = more visible pattern
                    Higher = more visible banding.
                    Default = 2.
  
  .alpha_threshold  Sets the alpha threshold for transparency.
                    Values above the threshold are opaque and values 
                    below this threshold are considered transparent.
                    Integer [0,255]. Default is 128.

  .use_alpha        Take alpha values into account when applying
                    the palette. For use on sources with many colors
                    and alpha components.
                    Disables 'alpha_threshold'.
                    Boolean.
```

## Presets:

```
--------------------------------------------------------------------
Gifizer has support for presets. There are 4 built in presets with
support for reading custom presets from config files.

Built-in Presets:
  fast              Focuses on finishing processing as fast as
                    possible while maintaining some semblance of quality.

  high-quality      Produces a very high quality GIF of the original
                    source with no regard for processing time or
                    final file size.

  balanced          Sensible comprimise between quality, speed, and 
                    final file size.

  low               Attempts to produce the smallest file size possible
                    sacrificing quality in the process.

Custom Presets:
Custom presets are read from the following locations:
  - ~/.gifizer.yaml
  - ~/.gifizer.yml
  - ./.gifizer.yaml
  - ./.gifizer.yml
  - ~/.gifizer.json
  - ./.gifizer.json

Your Presets should follow the shape:
{
  presets: {
    'preset-name': {
      <conversion options>
      dither: <dither options>
    }
  }
}
```
