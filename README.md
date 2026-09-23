# ⚡ MechFixAI - Electronics Diagnostics & Troubleshooting Agent

**MechFixAI** is a professional AI-powered electronics engineering, component defect analysis, and troubleshooting application. It combines **Java 17 / Spring Boot 3**, **LangChain4j**, **Chroma DB** (Vector Database), a multimodal **React (Vite)** interface, and **Web Search** tools.

---

## 🛠️ Key Features

- 📷 **Multimodal Defective Component Analysis**: Upload or drag-and-drop photos of burnt PCBs, swollen capacitors, shorted MOSFETs, or unknown ICs for visual defect classification.
- 🗄️ **Chroma DB Vector Schematics (RAG)**: Vector search across component datasheets, pinout guides, and failure mode documentation.
- 🌐 **Live Web Search & Cross-Referencing**: Automatically queries online electronics distributors (DigiKey, Mouser) for active pricing, component substitutes, and datasheets.
- ⚡ **Spring Agent Tools (`@Tool`)**: Executable Java methods for component spec lookups, web search troubleshooting, and LED/Ohm calculations.
- 🎨 **Industrial Electronics Console**: Responsive UI with dark slate glassmorphism styling, diagnostic prompt chips, and real-time document ingestion.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────────────┐
                                  │   MechFixAI Web UI (React/Vite)│
                                  │       http://localhost:3002    │
                                  └───────────────┬────────────────┘
                                                  │ REST API
                                                  ▼
                                  ┌────────────────────────────────┐
                                  │ Spring Boot / Node Dev Backend │
                                  │       http://localhost:8080    │
                                  └───────────────┬────────────────┘
                                                  │
                   ┌──────────────────────────────┼──────────────────────────────┐
                   │                              │                              │
                   ▼                              ▼                              ▼
        ┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
        │  Chroma DB RAG   │           │   Agent Tools    │           │  Web Search Tool │
        │   (Port 8000)    │           │ (@Tool Functions)│           │   (Live Web API) │
        └──────────────────┘           └──────────────────┘           └──────────────────┘
```

---

## 🚀 Step-by-Step Instructions to Run MechFixAI

### Method 1: Running with Docker Compose (Recommended)

This method runs Chroma DB, the Spring Boot Backend, and the React Frontend in isolated containers.

#### 1. Navigate to the project root directory
```bash
cd /config/.gemini/antigravity/scratch/langchain4j-spring-agent
```

#### 2. Set your OpenAI API Key (Optional)
```bash
export OPENAI_API_KEY="sk-your-openai-api-key-here"
```

#### 3. Build and launch all containers
```bash
docker compose up --build
```

#### 4. Open the Web Console
- 🎨 **MechFixAI Web UI**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **Spring Boot Backend**: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- 🗄️ **Chroma DB Vector Database**: [http://localhost:8000/api/v1/heartbeat](http://localhost:8000/api/v1/heartbeat)

---

### Method 2: Running Locally in Lightweight Dev Mode (Node + Vite)

If Docker is not running in your local environment, you can run the lightweight dev server setup instantly.

#### Step 1: Start the Backend Dev Server
```bash
cd /config/.gemini/antigravity/scratch/langchain4j-spring-agent/backend
node dev-server.js
```
*Output: `MechFixAI Backend Server running on http://localhost:8080`*

#### Step 2: Install Frontend Dependencies & Start React UI (In a new terminal window)
```bash
cd /config/.gemini/antigravity/scratch/langchain4j-spring-agent/frontend
npm install
npm run dev -- --port 3000 --host
```
*Output: `Local: http://localhost:3002/`*

#### Step 3: Open the Web UI
Open **[http://localhost:3002](http://localhost:3002)** in your browser.

---

## 🧪 Testing MechFixAI Capabilities

### 1. Uploading a Photo of a Defective Part
1. Open the UI at `http://localhost:3002`.
2. Click the **📷 Image Attachment Icon** next to the chat input field.
3. Select an image of a burnt PCB, swollen capacitor, or unknown IC.
4. Type a prompt like: *"Analyze this component and find a replacement"* and press **Send**.

### 2. Testing Component Troubleshooting Prompts
Try clicking the quick prompt chips in the UI:
- *"Troubleshoot swollen 1000uF 25V electrolytic capacitor on PSU board"*
- *"Identify replacement for burnt N-channel MOSFET IRF3205"*
- *"Check ChromaDB pinout & specs for NE555 timer IC"*
- *"Search web for LM317 adjustable regulator datasheet & substitutes"*

### 3. Ingesting Custom Datasheets into Chroma DB
1. On the right panel (**Schematics & Component RAG**), enter a document title (e.g., `IRF3205 Thermal Specs`).
2. Paste datasheet notes or repair steps in the text area.
3. Click **Ingest Component Specs**.
4. The text is vectorized and embedded into Chroma DB for instant retrieval!

---

## 📡 API Reference & cURL Examples

### 1. Send Chat & Image Diagnostic Request (`POST /api/chat`)
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "diag-101",
    "message": "Check stock & specs for IRF3205 MOSFET",
    "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "imageName": "burnt_mosfet.png"
  }'
```

### 2. Embed Datasheet into Chroma DB (`POST /api/ingest`)
```bash
curl -X POST http://localhost:3002/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "title": "NE555 Datasheet",
    "content": "NE555 Timer IC: Pin 1 GND, Pin 2 TRIG, Pin 3 OUT, Pin 4 RESET, Pin 8 VCC."
  }'
```

### 3. Service Health Check (`GET /api/health`)
```bash
curl -s http://localhost:8080/api/health
```

---

## 📁 Project Directory Layout

```
langchain4j-spring-agent/
├── README.md                            # Complete setup & user guide
├── docker-compose.yml                  # Docker Compose configuration
├── .env.example                         # Environment variables template
│
├── backend/                             # Java 17 + Spring Boot 3 Backend
│   ├── pom.xml                          # Maven dependencies (LangChain4j + Chroma)
│   ├── dev-server.js                    # Node.js dev server for lightweight testing
│   ├── Dockerfile                       # Multi-stage Maven container build
│   └── src/main/java/com/example/agent/
│       ├── AgentApplication.java        # Main Spring Boot entry point
│       ├── config/
│       │   ├── LangChainConfig.java     # ChromaDB, AllMiniLmL6V2 embeddings & RAG
│       │   └── WebConfig.java           # CORS configuration
│       ├── service/
│       │   ├── ElectronicsDiagnosticAgent.java # @AiService declarative agent
│       │   └── KnowledgeIngestionService.java  # Chroma DB document ingestion
│       ├── tools/
│       │   └── ElectronicsTools.java    # @Tool functions for specs, web search, Ohm's law
│       └── controller/
│           └── ChatController.java       # REST endpoints (/api/chat, /api/ingest)
│
└── frontend/                            # React + Vite Frontend
    ├── package.json                     # React, Lucide-React, ReactMarkdown dependencies
    ├── vite.config.js                   # Vite dev server & proxy settings
    ├── Dockerfile                       # Nginx container build
    └── src/
        ├── App.jsx                      # Main layout & navbar
        ├── index.css                    # Industrial dark theme design system
        └── components/
            ├── ChatWindow.jsx           # Multimodal chat & image attachment interface
            └── KnowledgePanel.jsx       # Active tools & Chroma DB ingestion panel
```
