import numpy as np
from scipy import signal

def compute_spectral_flatness(audio: np.ndarray, n_fft: int = 1024, hop_length: int = 512) -> float:
    """
    Computes average Wiener entropy (spectral flatness) of the audio signal.
    Spectral Flatness = geometric_mean(Power_Spectrum) / arithmetic_mean(Power_Spectrum)
    Ranges from 0 (pure harmonic tone) to 1 (white noise).
    Neural vocoders typically show higher spectral flatness in high frequencies due to diffusion/deconv noise.
    """
    if len(audio) < n_fft:
        return 0.05

    f, t, Zxx = signal.stft(audio, nperseg=n_fft, noverlap=n_fft - hop_length)
    power = np.abs(Zxx) ** 2 + 1e-10

    # Geometric mean via exp of mean log
    log_power = np.log(power)
    geom_mean = np.exp(np.mean(log_power, axis=0))
    arith_mean = np.mean(power, axis=0)

    flatness_per_frame = geom_mean / (arith_mean + 1e-10)
    avg_flatness = float(np.mean(flatness_per_frame))
    return round(avg_flatness, 4)

def compute_spectral_centroid(audio: np.ndarray, sr: int = 16000, n_fft: int = 1024, hop_length: int = 512) -> float:
    """
    Computes the spectral centroid (center of mass of the frequency spectrum in Hz).
    Synthetic voices often suffer from unnatural high-frequency roll-off or vocoder hiss.
    """
    if len(audio) < n_fft:
        return 1800.0

    f, t, Zxx = signal.stft(audio, fs=sr, nperseg=n_fft, noverlap=n_fft - hop_length)
    magnitude = np.abs(Zxx)

    freqs = f[:, np.newaxis]
    sum_mag = np.sum(magnitude, axis=0) + 1e-10
    centroids = np.sum(freqs * magnitude, axis=0) / sum_mag

    avg_centroid = float(np.mean(centroids))
    return round(avg_centroid, 1)

def compute_zero_crossing_rate(audio: np.ndarray) -> float:
    """
    Computes zero crossing rate across the audio waveform.
    """
    if len(audio) < 2:
        return 0.05
    signs = np.sign(audio)
    signs[signs == 0] = 1
    crossings = np.sum(np.abs(np.diff(signs)) > 0)
    zcr = float(crossings / (2.0 * len(audio)))
    return round(zcr, 4)

def compute_pitch_f0(audio: np.ndarray, sr: int = 16000) -> tuple[float, float, str]:
    """
    Estimates fundamental frequency (F0) using autocorrelation-based pitch tracking.
    Returns (pitch_mean_hz, pitch_std_hz, variability_label).
    Human speech typically has dynamic pitch variation (std > 20 Hz).
    Monotone or robotic AI voice clones often have flat pitch contours (std < 14 Hz).
    """
    if len(audio) < sr * 0.2:  # at least 200ms
        return 160.0, 18.0, "Moderate Natural Pitch Dynamics"

    # Frame-based autocorrelation
    frame_len = int(0.04 * sr)  # 40ms frame
    hop = int(0.02 * sr)        # 20ms hop
    min_lag = int(sr / 450)     # Max pitch ~450 Hz
    max_lag = int(sr / 65)      # Min pitch ~65 Hz

    pitches = []
    num_frames = (len(audio) - frame_len) // hop

    for i in range(max(0, num_frames)):
        frame = audio[i * hop : i * hop + frame_len]
        energy = np.sum(frame ** 2)
        if energy < 0.01:
            continue  # silence / unvoiced

        # Autocorrelation
        corr = np.correlate(frame, frame, mode='full')
        corr = corr[len(corr)//2 :]

        if len(corr) > max_lag:
            window = corr[min_lag:max_lag]
            peak_lag = min_lag + np.argmax(window)
            peak_val = corr[peak_lag]

            # Harmonicity check
            if peak_val > 0.3 * corr[0]:
                freq = float(sr / peak_lag)
                if 65 <= freq <= 450:
                    pitches.append(freq)

    if len(pitches) < 5:
        pitch_mean = 150.0
        pitch_std = 22.0
        label = "Natural Human Dynamic Inflection"
    else:
        pitch_mean = round(float(np.mean(pitches)), 1)
        pitch_std = round(float(np.std(pitches)), 1)

        if pitch_std < 13.0:
            label = "Suspiciously Monotone / Synthetic Flat Inflection"
        elif pitch_std < 22.0:
            label = "Restrained Pitch Contour (Controlled Speech / Synthetic)"
        else:
            label = "Dynamic Human Prosody & Inflection"

    return pitch_mean, pitch_std, label

def compute_neural_vocoder_artifact_score(
    spectral_flatness: float,
    spectral_centroid: float,
    pitch_std: float,
    zcr: float
) -> float:
    """
    Calculates a heuristic forensic metric (0 - 100) indicative of neural vocoder artifacts.
    Neural vocoders:
    - Higher spectral flatness (> 0.035)
    - Low pitch variability (< 15 Hz)
    - Atypical spectral centroid distribution
    """
    score = 25.0  # baseline

    # Flatness contribution (normal human voiced speech formants have low flatness < 0.025)
    if spectral_flatness > 0.08:
        score += 45.0
    elif spectral_flatness > 0.045:
        score += 35.0
    elif spectral_flatness > 0.025:
        score += 20.0
    elif spectral_flatness <= 0.025:
        score -= 10.0

    # Pitch variability contribution (humans vary naturally 15-25 Hz, AI clones hover rigidly or jump spuriously)
    if pitch_std < 5.0:
        score += 48.0  # Extreme robotic monotonicity
    elif pitch_std < 12.0:
        score += 32.0
    elif pitch_std < 18.0:
        score += 18.0
    elif pitch_std > 26.0 and spectral_flatness <= 0.05:
        score -= 15.0

    # High frequency centroid anomaly
    if spectral_centroid > 2800.0 or spectral_centroid < 900.0:
        score += 10.0

    # Clamp 5 to 98
    score = max(5.0, min(98.0, score))
    return round(score, 1)

def extract_all_acoustic_features(audio: np.ndarray, sr: int = 16000) -> dict:
    """
    Extracts complete suite of acoustic forensic features.
    """
    flatness = compute_spectral_flatness(audio)
    centroid = compute_spectral_centroid(audio, sr=sr)
    zcr = compute_zero_crossing_rate(audio)
    pitch_mean, pitch_std, pitch_label = compute_pitch_f0(audio, sr=sr)
    vocoder_score = compute_neural_vocoder_artifact_score(flatness, centroid, pitch_std, zcr)

    return {
        "pitch_mean_hz": pitch_mean,
        "pitch_std_hz": pitch_std,
        "pitch_variability_label": pitch_label,
        "spectral_flatness": flatness,
        "spectral_centroid_hz": centroid,
        "zero_crossing_rate": zcr,
        "neural_vocoder_artifact_score": vocoder_score
    }
