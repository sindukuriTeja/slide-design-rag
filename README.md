# Slide Design RAG System

Real-time Retrieval-Augmented Generation system for slide design knowledge with **auto-presentation generation**, powered by Pinecone vector database, Groq LLM, and pptxgenjs.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend  │────▶│  FastAPI     │────▶│   Pinecone   │
│ (Chat + Gen)│◀────│  Backend     │◀────│  Vector DB   │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────┴───────┐
                    │   Groq LLM   │
                    │ (Llama 3.3)  │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  pptxgenjs   │
                    │ (PPTX Gen)   │
                    └──────────────┘
```

## Features

- **Auto-Generate Presentations**: Enter a topic → RAG retrieves brand knowledge → LLM plans slides → PPTX auto-generated
- **Brand-Conditioned Generation**: Select a brand and the presentation automatically inherits its palette, tone, and design patterns
- **Real-time RAG Chat**: Query slide design knowledge with vector similarity search
- **2,120 vectors** from synthetic slide design datasets (80 brands, 400 decks, 4000 slides)
- **Groq-powered answers**: Uses Llama 3.3 70B for intelligent, contextual responses
- **Filter by brand**: Nova Fintech, Bloom Garden, Apex Consulting, PulseWave Audio, etc.
- **Filter by task**: text_to_slide, layout_generation, slide_critique, brand_conditioned_generation, deck_continuation, preference_pairs
- **Source citations**: See which documents were used to generate answers
- **Download .pptx**: Generated presentations are downloadable directly from the UI

## Quick Start

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies (for PPTX generation)
npm install

# Ingest data (first time only)
cd backend && python3 ingest.py

# Start server
./start.sh
```

Open http://localhost:8000 in your browser.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/query` | POST | Query the RAG system |
| `/api/generate-presentation` | POST | Auto-generate a branded PPTX |
| `/api/download/{filename}` | GET | Download a generated PPTX |
| `/api/health` | GET | Check system health |
| `/api/brands` | GET | List available brands |
| `/api/task-types` | GET | List task types |

### Query Example

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What palette does Nova Fintech use?", "top_k": 5}'
```

### Generate Presentation Example

```bash
curl -X POST http://localhost:8000/api/generate-presentation \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Digital Transformation in Healthcare",
    "brand": "ClearPath Health",
    "num_slides": 8,
    "style": "data-driven, professional"
  }'
```

## Project Structure

```
rag-system/
├── backend/
│   ├── main.py          # FastAPI app with RAG + generation endpoints
│   ├── embeddings.py    # Text embedding using n-gram hashing
│   ├── ingest.py        # Data ingestion into Pinecone
│   └── .env             # API keys
├── frontend/
│   └── dist/
│       ├── index.html   # Chat + presentation generator UI
│       └── assets/
│           ├── style.css
│           └── app.js
├── data/                # JSONL dataset files
├── output/              # Generated PPTX files
├── generate_pptx.js     # Dynamic PPTX generator (pptxgenjs)
├── create_pptx.js       # Static demo PPTX script
├── package.json         # Node.js dependencies
├── requirements.txt     # Python dependencies
├── start.sh
└── README.md
```

## Dataset

The system indexes slide design data including:
- Brand kits (palettes, typography, tone, constraints)
- Slide critiques with quality scores
- Layout pattern recommendations
- Text-to-slide generation examples
- Brand-conditioned generation guidelines
- Deck continuation patterns
