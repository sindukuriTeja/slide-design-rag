"""FastAPI backend for Slide Design RAG system with auto-presentation generation."""
import os
import json
import subprocess
import uuid
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pinecone import Pinecone
from groq import Groq

from embeddings import simple_embed

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "slide-design-rag")
DIMENSION = 1024

pc = None
index = None
groq_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pc, index, groq_client
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(INDEX_NAME)
    groq_client = Groq(api_key=GROQ_API_KEY)
    print("Connected to Pinecone and Groq.")
    yield


app = FastAPI(title="Slide Design RAG", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5
    filter_brand: str | None = None
    filter_task: str | None = None


class QueryResponse(BaseModel):
    answer: str
    sources: list[dict]
    query: str


@app.post("/api/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    query_embedding = simple_embed(request.query, DIMENSION)

    filter_dict = {}
    if request.filter_brand:
        filter_dict["brand_name"] = request.filter_brand
    if request.filter_task:
        filter_dict["task_type"] = request.filter_task

    search_params = {
        "vector": query_embedding,
        "top_k": request.top_k,
        "include_metadata": True,
    }
    if filter_dict:
        search_params["filter"] = filter_dict

    results = index.query(**search_params)

    sources = []
    context_parts = []
    for match in results.matches:
        meta = match.metadata
        sources.append({
            "id": match.id,
            "score": round(match.score, 4),
            "task_type": meta.get("task_type", ""),
            "slide_id": meta.get("slide_id", ""),
            "brand_name": meta.get("brand_name", ""),
            "text_preview": meta.get("text", "")[:500],
        })
        context_parts.append(meta.get("text", ""))

    context = "\n\n---\n\n".join(context_parts)

    system_prompt = """You are a slide design expert assistant. You help users understand slide design principles,
brand guidelines, layout patterns, and critique slide quality based on a dataset of synthetic slide designs.

Use the retrieved context below to answer the user's question. Be specific, reference brand names,
color palettes, layout patterns, and scores when relevant. If the context doesn't contain enough
information, say so honestly.

Retrieved Context:
"""

    try:
        chat_response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt + context},
                {"role": "user", "content": request.query},
            ],
            temperature=0.3,
            max_tokens=1500,
        )
        answer = chat_response.choices[0].message.content
    except Exception as e:
        answer = f"Error generating response: {str(e)}"

    return QueryResponse(answer=answer, sources=sources, query=request.query)


@app.get("/api/health")
async def health():
    try:
        stats = index.describe_index_stats()
        return {
            "status": "healthy",
            "pinecone_vectors": stats.total_vector_count,
            "index_name": INDEX_NAME,
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@app.get("/api/brands")
async def list_brands():
    return {
        "brands": [
            "Nova Fintech", "Bloom Garden", "Apex Consulting", "PulseWave Audio",
            "Orbit Logistics", "ClearPath Health", "Zinc Studios", "Velvet Brew",
        ]
    }


@app.get("/api/task-types")
async def list_task_types():
    return {
        "task_types": [
            "text_to_slide",
            "layout_generation",
            "slide_critique",
            "brand_conditioned_generation",
            "deck_continuation",
            "preference_pairs",
        ]
    }


class GenerateRequest(BaseModel):
    topic: str
    brand: str | None = None
    num_slides: int = 8
    style: str | None = None


class GenerateResponse(BaseModel):
    filename: str
    download_url: str
    slides: list[dict]


OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

GENERATOR_SCRIPT = os.path.join(os.path.dirname(__file__), "..", "generate_pptx.js")


@app.post("/api/generate-presentation", response_model=GenerateResponse)
async def generate_presentation(request: GenerateRequest):
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    query_text = f"brand design guidelines for {request.brand or 'modern tech'} presentation about {request.topic}"
    query_embedding = simple_embed(query_text, DIMENSION)

    filter_dict = {}
    if request.brand:
        filter_dict["brand_name"] = request.brand

    search_params = {
        "vector": query_embedding,
        "top_k": 10,
        "include_metadata": True,
    }
    if filter_dict:
        search_params["filter"] = filter_dict

    results = index.query(**search_params)

    context_parts = []
    for match in results.matches:
        meta = match.metadata
        context_parts.append(meta.get("text", ""))

    rag_context = "\n\n---\n\n".join(context_parts)

    system_prompt = f"""You are a presentation design expert. Using the brand and design knowledge below, generate a JSON array of slides for a presentation.

Topic: {request.topic}
Number of slides: {request.num_slides}
Brand: {request.brand or "modern tech (dark theme)"}
Style: {request.style or "professional dark with accent colors"}

Use the RAG context to inform brand colors, typography choices, tone, and layout patterns.

RAG Context:
{rag_context}

Output ONLY valid JSON (no markdown fences) in this exact format:
[
  {{
    "slide_type": "cover|content|stats|list|comparison|closing",
    "headline": "Slide headline text",
    "subheadline": "Optional subtitle or empty string",
    "bullets": ["point 1", "point 2"],
    "stats": [{{"value": "99%", "label": "Label"}}],
    "notes": "Speaker notes"
  }}
]

Rules:
- First slide must be type "cover"
- Last slide must be type "closing"
- Use varied slide types for visual interest
- Headlines should be concise and impactful
- Stats slides should have 2-4 statistics
- List slides should have 3-5 bullets
- Match the brand tone from the context"""

    try:
        chat_response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate a {request.num_slides}-slide presentation about: {request.topic}"},
            ],
            temperature=0.4,
            max_tokens=4000,
        )
        raw_content = chat_response.choices[0].message.content.strip()
        if raw_content.startswith("```"):
            raw_content = raw_content.split("\n", 1)[1]
            if raw_content.endswith("```"):
                raw_content = raw_content[:-3]
        slides = json.loads(raw_content)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"LLM returned invalid JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating slide content: {str(e)}")

    brand_colors = None
    if request.brand:
        for match in results.matches:
            text = match.metadata.get("text", "")
            if "Palette:" in text:
                palette_line = [l for l in text.split("\n") if l.startswith("Palette:")]
                if palette_line:
                    colors = palette_line[0].replace("Palette:", "").strip().split(", ")
                    brand_colors = [c.replace("#", "") for c in colors if c.startswith("#")]
                    break

    pptx_input = {
        "topic": request.topic,
        "brand": request.brand,
        "slides": slides,
        "colors": brand_colors,
        "style": request.style,
    }

    file_id = str(uuid.uuid4())[:8]
    safe_topic = "".join(c if c.isalnum() or c in " _-" else "" for c in request.topic)[:40].strip().replace(" ", "_")
    filename = f"{safe_topic}_{file_id}.pptx"
    output_path = os.path.join(OUTPUT_DIR, filename)

    input_json_path = os.path.join(OUTPUT_DIR, f"{file_id}_input.json")
    with open(input_json_path, "w") as f:
        json.dump(pptx_input, f)

    try:
        result = subprocess.run(
            ["node", GENERATOR_SCRIPT, input_json_path, output_path],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"PPTX generation failed: {result.stderr}")
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="PPTX generation timed out")
    finally:
        if os.path.exists(input_json_path):
            os.remove(input_json_path)

    return GenerateResponse(
        filename=filename,
        download_url=f"/api/download/{filename}",
        slides=slides,
    )


@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", filename=filename)


FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
