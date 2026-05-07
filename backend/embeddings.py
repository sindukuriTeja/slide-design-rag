"""Lightweight text embedding using character n-gram hashing.
Produces semantically meaningful vectors by hashing overlapping character n-grams,
so texts sharing similar words/phrases will have similar vectors."""
import hashlib
import math


def simple_embed(text: str, dim: int = 1024) -> list[float]:
    """Generate an embedding using character n-gram hashing (random indexing approach).
    Texts with overlapping n-grams will have high cosine similarity."""
    text = text.lower().strip()
    vector = [0.0] * dim

    for n in (3, 4, 5, 6):
        for i in range(len(text) - n + 1):
            ngram = text[i:i+n]
            h = int(hashlib.md5(ngram.encode()).hexdigest(), 16)
            idx = h % dim
            sign = 1.0 if (h // dim) % 2 == 0 else -1.0
            vector[idx] += sign

    words = text.split()
    for word in words:
        h = int(hashlib.md5(word.encode()).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if (h // dim) % 2 == 0 else -1.0
        vector[idx] += sign * 3.0

    for bigram_i in range(len(words) - 1):
        bigram = f"{words[bigram_i]} {words[bigram_i+1]}"
        h = int(hashlib.md5(bigram.encode()).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if (h // dim) % 2 == 0 else -1.0
        vector[idx] += sign * 2.0

    norm = math.sqrt(sum(v * v for v in vector))
    if norm > 0:
        vector = [v / norm for v in vector]
    return vector


def embed_texts(texts: list[str], dim: int = 1024) -> list[list[float]]:
    """Embed multiple texts."""
    return [simple_embed(t, dim) for t in texts]
