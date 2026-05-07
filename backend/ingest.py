"""Ingest slide design dataset into Pinecone vector database."""
import json
import os
import sys
import time

from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec

from embeddings import simple_embed

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "slide-design-rag")
DIMENSION = 1024
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def create_index(pc: Pinecone):
    existing = [idx.name for idx in pc.list_indexes()]
    if INDEX_NAME not in existing:
        print(f"Creating index '{INDEX_NAME}'...")
        pc.create_index(
            name=INDEX_NAME,
            dimension=DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        time.sleep(10)
    else:
        print(f"Index '{INDEX_NAME}' already exists.")
    return pc.Index(INDEX_NAME)


def build_document_text(record: dict) -> str:
    """Convert a JSONL record into searchable text."""
    parts = []
    task = record.get("task", "")
    parts.append(f"Task: {task}")

    slide_id = record.get("slide_id", "")
    if slide_id:
        parts.append(f"Slide: {slide_id}")

    inp = record.get("input", {})
    if isinstance(inp, dict):
        if "brief" in inp:
            parts.append(f"Brief: {inp['brief']}")
        if "brand_kit" in inp:
            bk = inp["brand_kit"]
            parts.append(f"Brand: {bk.get('brand_name', '')}")
            if "palette" in bk:
                parts.append(f"Palette: {', '.join(bk['palette'])}")
            if "tone" in bk:
                parts.append(f"Tone: {', '.join(bk['tone'])}")
            if "constraints" in bk:
                parts.append(f"Constraints: {'; '.join(bk['constraints'])}")
        if "brand_kit_full" in inp:
            bk = inp["brand_kit_full"]
            parts.append(f"Brand: {bk.get('brand_name', '')}")
            parts.append(f"Category: {bk.get('category', '')}")
            parts.append(f"Industry: {bk.get('industry', '')}")
            if "palette" in bk:
                parts.append(f"Palette: {', '.join(bk['palette'])}")
            if "layout_rules" in bk:
                parts.append(f"Layout rules: {'; '.join(bk['layout_rules'])}")
            if "do" in bk:
                parts.append(f"Do: {'; '.join(bk['do'])}")
            if "dont" in bk:
                parts.append(f"Don't: {'; '.join(bk['dont'])}")
        if "generic_message" in inp:
            parts.append(f"Message: {inp['generic_message']}")
        if "slide_role" in inp:
            parts.append(f"Role: {inp['slide_role']}")
        if "headline" in inp:
            parts.append(f"Headline: {inp['headline']}")
        if "rendered_image" in inp:
            parts.append(f"Image: {inp['rendered_image']}")

    out = record.get("output", {})
    if isinstance(out, dict):
        if "headline" in out:
            parts.append(f"Output headline: {out['headline']}")
        if "visual_prompt" in out:
            parts.append(f"Visual prompt: {out['visual_prompt']}")
        if "layout_pattern" in out:
            parts.append(f"Layout: {out['layout_pattern']}")
        if "critique" in out:
            parts.append(f"Critique: {out['critique']}")
        if "scores" in out:
            scores = out["scores"]
            score_str = ", ".join(f"{k}: {v}" for k, v in scores.items())
            parts.append(f"Scores: {score_str}")

    quality = record.get("quality", {})
    if isinstance(quality, dict):
        if "critique" in quality:
            parts.append(f"Quality critique: {quality['critique']}")
        if "positive_labels" in quality:
            parts.append(f"Positive: {', '.join(quality['positive_labels'])}")
        if "flaw_labels" in quality and quality["flaw_labels"]:
            parts.append(f"Flaws: {', '.join(quality['flaw_labels'])}")

    return "\n".join(parts)


def ingest():
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = create_index(pc)

    jsonl_files = [f for f in os.listdir(DATA_DIR) if f.endswith(".jsonl")]
    print(f"Found {len(jsonl_files)} JSONL files to ingest.")

    total = 0
    batch_size = 50
    vectors_batch = []

    for filename in sorted(jsonl_files):
        filepath = os.path.join(DATA_DIR, filename)
        task_type = filename.replace(".jsonl", "")
        print(f"Processing {filename}...")

        with open(filepath, "r") as f:
            for line_num, line in enumerate(f):
                line = line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                except json.JSONDecodeError:
                    continue

                doc_text = build_document_text(record)
                doc_id = f"{task_type}_{record.get('slide_id', f'line_{line_num}')}"

                embedding = simple_embed(doc_text, DIMENSION)

                metadata = {
                    "task_type": task_type,
                    "slide_id": record.get("slide_id", ""),
                    "text": doc_text[:3000],
                }

                inp = record.get("input", {})
                if isinstance(inp, dict):
                    brand_kit = inp.get("brand_kit", inp.get("brand_kit_full", {}))
                    if brand_kit:
                        metadata["brand_name"] = brand_kit.get("brand_name", "")
                        metadata["brand_id"] = brand_kit.get("brand_id", "")

                vectors_batch.append({
                    "id": doc_id,
                    "values": embedding,
                    "metadata": metadata,
                })

                if len(vectors_batch) >= batch_size:
                    index.upsert(vectors=vectors_batch)
                    total += len(vectors_batch)
                    vectors_batch = []
                    sys.stdout.write(f"\r  Upserted {total} vectors...")
                    sys.stdout.flush()

    if vectors_batch:
        index.upsert(vectors=vectors_batch)
        total += len(vectors_batch)

    print(f"\nDone! Total vectors upserted: {total}")
    time.sleep(3)
    stats = index.describe_index_stats()
    print(f"Index stats: {stats}")


if __name__ == "__main__":
    ingest()
