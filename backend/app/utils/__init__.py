from app.utils.audio_processor import load_audio_from_bytes, create_audio_chunks
from app.utils.forensics import extract_all_acoustic_features
from app.utils.classifier import analyze_full_audio, score_audio_chunk
from app.utils.voiceprint import extract_voiceprint_embedding, compare_voiceprints
from app.utils.watermark import embed_acoustic_watermark, extract_acoustic_watermark
from app.utils.codec_simulator import (
    simulate_g711_mu_law,
    simulate_wideband_voip,
    simulate_lossy_cell,
    run_codec_benchmark
)
from app.utils.adversarial import (
    apply_noise_perturbation,
    apply_tempo_perturbation,
    adaptive_spectral_denoise,
    run_adversarial_stress_test
)

__all__ = [
    "load_audio_from_bytes",
    "create_audio_chunks",
    "extract_all_acoustic_features",
    "analyze_full_audio",
    "score_audio_chunk",
    "extract_voiceprint_embedding",
    "compare_voiceprints",
    "embed_acoustic_watermark",
    "extract_acoustic_watermark",
    "simulate_g711_mu_law",
    "simulate_wideband_voip",
    "simulate_lossy_cell",
    "run_codec_benchmark",
    "apply_noise_perturbation",
    "apply_tempo_perturbation",
    "adaptive_spectral_denoise",
    "run_adversarial_stress_test"
]
