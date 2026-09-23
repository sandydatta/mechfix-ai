import http from 'http';

const PORT = 8080;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let body = [];
  req.on('data', chunk => body.push(chunk));
  req.on('end', () => {
    const rawBuffer = Buffer.concat(body);
    const bodyString = rawBuffer.toString('utf-8');

    if (req.url === '/api/chat' && req.method === 'POST') {
      try {
        const { sessionId, message, imageData, imageName } = JSON.parse(bodyString || '{}');
        const lower = (message || '').toLowerCase();
        let reply = '';

        const hasImage = Boolean(imageData);

        if (hasImage) {
          reply = `📷 **[MechFixAI Visual Multimodal Diagnosis: ${imageName || 'component.jpg'}]**\n\n` +
                  `### 1. 🔍 Visual Defect Analysis:\n` +
                  `- **Identified Component:** Aluminum Electrolytic Capacitor / Power Switching Transistor on 12V Rail.\n` +
                  `- **Visual Symptoms:** Thermal discoloration, venting bulge on rubber seal, surface scorch marks.\n` +
                  `- **Failure Classification:** Thermal Overstress & High ESR Breakdown.\n\n` +
                  `### 2. 🗄️ ChromaDB Vector Search (Pinouts & Failure Modes):\n` +
                  `> *Retrieved Context:* "Swollen capacitor top indicates gas buildup caused by overvoltage or high ESR ripple heating. Clean PCB traces with 99% IPA."\n\n` +
                  `### 3. 🌐 Live Web Search (Replacements & Distributors):\n` +
                  `- **Direct Replacement:** Nichicon UPW1E102MHD (1000uF 25V, 105°C, Low ESR).\n` +
                  `- **Cross-Reference:** Panasonic EEU-FC1E102S or Rubycon 25ZLJ1000M.\n` +
                  `- **Availability:** In Stock at DigiKey ($0.85/unit) & Mouser ($0.88/unit).\n\n` +
                  `### 🛠️ Recommended Action:\n` +
                  `1. Desolder defective component using hot air station (350°C) or soldering iron.\n` +
                  `2. Test adjacent flyback diode & MOSFET for short-circuits using multimeter continuity mode.\n` +
                  `3. Solder low-ESR replacement with correct polarity matching PCB silkscreen stripe.`;
        } else if (lower.includes('brochure') || lower.includes('pdf') || lower.includes('company') || lower.includes('catalog')) {
          reply = `📄 **[ChromaDB Vector Retrieval: PDF Company Brochure]**\n\n` +
                  `### Extracted Context from Ingested PDF Brochure:\n` +
                  `- **Company / Product:** MechFix Solutions Hardware Line\n` +
                  `- **Featured Equipment:** Industrial Power Controllers, Low-ESR Filter Modules & Smart Sensor Arrays\n` +
                  `- **Warranty & Service:** 2-Year Full Hardware Warranty with 24/7 Diagnostics Support\n\n` +
                  `> *Agent Capability:* I can query all extracted sections, parts tables, and troubleshooting procedures from your uploaded PDF brochures.`;
        } else if (lower.includes('capacitor') || lower.includes('1000uf') || lower.includes('swollen')) {
          reply = `🔍 **[ChromaDB Vector Retrieval: Capacitor Failure Analysis]**\n\n` +
                  `### Defect Summary:\n` +
                  `- **Failure Mode:** Swollen / Bulging Vent due to electrolyte degradation & ESR heating.\n` +
                  `- **ChromaDB Specs:** Standard filter cap 1000uF 25V.\n\n` +
                  `🌐 **[Web Search Cross-References]**:\n` +
                  `- **Best Low-ESR Replacements:** Nichicon UPW1E102MHD, Panasonic FC Series.\n` +
                  `- **Price & Stock:** Available at Mouser / DigiKey ($0.82 USD).`;
        } else if (lower.includes('mosfet') || lower.includes('irf3205') || lower.includes('transistor')) {
          reply = `🛠️ **[Tool Call: searchComponentSpecs("IRF3205")]**\n\n` +
                  `- **Specs:** N-Channel Power MOSFET, Vds=55V, Rds(on)=8mΩ, Id=110A, TO-220AB package.\n` +
                  `- **Failure Symptom:** D-S Short Circuit under overcurrent spikes.\n\n` +
                  `🌐 **[Tool Call: webSearchTroubleshooting("IRF3205 substitute")]**\n` +
                  `- **Direct Equivalents:** STP75NF75, HY1908, FQP30N06L.\n` +
                  `- **Repair Tip:** Always replace gate resistor (10Ω) and driver IC when replacing a blown MOSFET.`;
        } else {
          reply = `⚡ **MechFixAI Diagnostic Engine**\n\n` +
                  `Received query: "${message}"\n\n` +
                  `I can query **Chroma DB** for text & PDF brochure contents, search the **Web** for replacements, or analyze an uploaded image of a defective part.`;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sessionId: sessionId || 'diag-demo', reply }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    } else if (req.url === '/api/ingest' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "Datasheet & schematics successfully embedded into ChromaDB!" }));
    } else if (req.url === '/api/ingest-pdf' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: "PDF Company Brochure successfully parsed & embedded into ChromaDB!",
        filename: "Company_Brochure.pdf",
        pages: 8,
        status: "SUCCESS"
      }));
    } else if (req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: "UP", service: "MechFixAI Diagnostics Engine (Dev Server)" }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
});

server.listen(PORT, () => {
  console.log(`MechFixAI Backend Server running on http://localhost:${PORT}`);
});
