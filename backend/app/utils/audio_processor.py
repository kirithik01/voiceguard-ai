import io
import os
import tempfile
import numpy as np
import soundfile as sf
import librosa
from app.config import settings

def load_audio_from_bytes(file_bytes: bytes, original_filename: str = "audio.wav", target_sr: int = settings.SAMPLE_RATE) -> tuple[np.ndarray, int, float]:
    """
    Decodes audio bytes into a normalized mono float32 numpy array at target_sr.
    Returns (audio_data, sample_rate, duration_seconds).
    """
    # Determine extension
    ext = os.path.splitext(original_filename)[1].lower()
    if not ext:
        ext = ".wav"
        
    audio_data = None
    sr = target_sr

    # Attempt direct in-memory load with soundfile first (very fast for wav/flac/ogg)
    try:
        buf = io.BytesIO(file_bytes)
        data, file_sr = sf.read(buf, dtype="float32")
        if data.ndim > 1:
            data = np.mean(data, axis=1)  # Convert to mono
        if file_sr != target_sr:
            data = librosa.resample(data, orig_sr=file_sr, target_sr=target_sr)
        audio_data = data
        sr = target_sr
    except Exception:
        # Fallback to temp file using librosa (supports mp3, m4a, ogg, webm, etc.)
        temp_file = None
        try:
            temp_file = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
            temp_file.write(file_bytes)
            temp_file.flush()
            temp_file.close()

            data, _ = librosa.load(temp_file.name, sr=target_sr, mono=True)
            audio_data = data.astype(np.float32)
            sr = target_sr
        finally:
            if temp_file and os.path.exists(temp_file.name):
                try:
                    os.unlink(temp_file.name)
                except OSError:
                    pass

    if audio_data is None or len(audio_data) == 0:
        raise ValueError("Could not decode audio data from input file")

    # Normalize audio amplitude
    max_amp = np.max(np.abs(audio_data))
    if max_amp > 1e-5:
        audio_data = audio_data / max_amp * 0.95

    duration_sec = float(len(audio_data) / sr)
    return audio_data, sr, duration_sec

def create_audio_chunks(
    audio_data: np.ndarray,
    sr: int = settings.SAMPLE_RATE,
    chunk_duration_sec: float = settings.CHUNK_DURATION_SEC,
    stride_sec: float = settings.CHUNK_STRIDE_SEC
) -> list[dict]:
    """
    Splits audio array into sliding temporal window slices.
    Returns list of dicts with:
    {
        'chunk_index': int,
        'start_sec': float,
        'end_sec': float,
        'data': np.ndarray
    }
    """
    total_len = len(audio_data)
    chunk_samples = int(chunk_duration_sec * sr)
    stride_samples = int(stride_sec * sr)

    # If audio is shorter than or equal to one chunk, return single chunk
    if total_len <= chunk_samples:
        return [{
            "chunk_index": 0,
            "start_sec": 0.0,
            "end_sec": round(float(total_len / sr), 2),
            "data": audio_data
        }]

    chunks = []
    chunk_idx = 0
    start = 0

    while start < total_len:
        end = min(start + chunk_samples, total_len)
        chunk_slice = audio_data[start:end]

        # If remaining slice is too short (less than 0.5s) and we already have chunks, break
        if len(chunk_slice) < int(0.5 * sr) and len(chunks) > 0:
            break

        chunks.append({
            "chunk_index": chunk_idx,
            "start_sec": round(float(start / sr), 2),
            "end_sec": round(float(end / sr), 2),
            "data": chunk_slice
        })

        chunk_idx += 1
        start += stride_samples

        if end == total_len:
            break

    return chunks
