import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Set ffmpeg path
if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
} else {
    console.warn("ffmpeg-static not found, compression may fail.");
}

export async function compressVideo(file: File): Promise<Buffer> {
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input-${Date.now()}-${file.name}`);
    const outputPath = path.join(tempDir, `output-${Date.now()}-${file.name}.mp4`);

    try {
        // 1. Write File to Temp Disk
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.promises.writeFile(inputPath, buffer);

        // 2. Compress
        // Target: < 4.5MB
        // We'll target ~3.5MB to be safe.
        // If file is 100MB, simplified logic:
        // We can't easily calculate exact bitrate without duration first, 
        // but we can try a preset/CRF approach or just strict limits.

        // Let's get metadata first
        const metadata: any = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) reject(err);
                else resolve(metadata);
            });
        });

        const duration = metadata.format.duration || 60; // default 60s if unknown

        // Target size in bits: 3.5MB * 8 * 1024 * 1024 = ~29,360,000 bits
        // Bitrate = Target / Duration
        const targetSizeBits = 3.5 * 8 * 1024 * 1024;
        const targetBitrate = Math.floor(targetSizeBits / duration);

        // Cap bitrate at something reasonable (e.g., 500k minimum, 2000k max)
        // If 100MB file is 10 seconds long... 3.5MB is impossible without destroying it?
        // 3.5MB for 10s = 2.8 Mbps. That's fine.
        // 3.5MB for 60s = ~460 Kbps. That's low quality but needed.

        console.log(`[Video Compression] Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to target ~4MB. Duration: ${duration}s. Target Bitrate: ${Math.floor(targetBitrate / 1000)}k`);

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions([
                    `-b:v ${targetBitrate}`,  // Video bitrate
                    `-maxrate ${targetBitrate * 1.2}`,
                    `-bufsize ${targetBitrate * 2}`,
                    '-vf scale=\'min(720,iw):-2\'', // Downscale to 720p width if larger, keep aspect ratio
                    '-c:v libx264',
                    '-preset fast', // 'veryfast' or 'fast' for speed
                    '-crf 28', // Fallback/Constraint quality factor (23-28 is decent-low)
                    '-ac 1', // Mono audio
                    '-b:a 64k' // 64k audio bitrate
                ])
                .output(outputPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        // 3. Read compressed file
        const compressedBuffer = await fs.promises.readFile(outputPath);

        // Cleanup
        await fs.promises.unlink(inputPath);
        await fs.promises.unlink(outputPath);

        return compressedBuffer;

    } catch (e) {
        // Cleanup on error
        if (fs.existsSync(inputPath)) await fs.promises.unlink(inputPath).catch(() => { });
        if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath).catch(() => { });
        throw e;
    }
}
