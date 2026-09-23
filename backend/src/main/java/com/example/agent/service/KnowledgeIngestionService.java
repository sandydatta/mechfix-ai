package com.example.agent.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
public class KnowledgeIngestionService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeIngestionService.class);

    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;

    public KnowledgeIngestionService(EmbeddingStore<TextSegment> embeddingStore, EmbeddingModel embeddingModel) {
        this.embeddingStore = embeddingStore;
        this.embeddingModel = embeddingModel;
    }

    public void ingestText(String textTitle, String content) {
        Document document = Document.from(content);

        DocumentSplitter splitter = DocumentSplitters.recursive(300, 30);
        
        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                .documentSplitter(splitter)
                .embeddingModel(embeddingModel)
                .embeddingStore(embeddingStore)
                .build();

        ingestor.ingest(document);
        log.info("Successfully ingested text document '{}' into ChromaDB", textTitle);
    }

    public int ingestPdfStream(String pdfTitle, InputStream pdfInputStream) throws Exception {
        try (PDDocument pdDocument = Loader.loadPDF(pdfInputStream.readAllBytes())) {
            int pageCount = pdDocument.getNumberOfPages();
            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(pdDocument);

            if (extractedText == null || extractedText.isBlank()) {
                throw new IllegalArgumentException("Extracted PDF text is empty or unreadable.");
            }

            Document document = Document.from(extractedText);
            DocumentSplitter splitter = DocumentSplitters.recursive(300, 30);

            EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                    .documentSplitter(splitter)
                    .embeddingModel(embeddingModel)
                    .embeddingStore(embeddingStore)
                    .build();

            ingestor.ingest(document);
            log.info("Successfully ingested PDF '{}' ({} pages, {} chars) into ChromaDB", pdfTitle, pageCount, extractedText.length());
            return pageCount;
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedDefaultKnowledgeBase() {
        try {
            log.info("Seeding electronics component failure modes into ChromaDB...");
            
            ingestText("Electrolytic Capacitor Defect Guide", """
                Electrolytic Capacitor Failure Modes & Diagnosis:
                1. Swollen / Bulging Top: Indicates internal gas buildup caused by overvoltage, reverse polarity, or high Equivalent Series Resistance (ESR) ripple heating.
                2. Crusty Residue / Electrolyte Leakage: Corrodes surrounding copper traces. Clean with Isopropyl Alcohol (IPA 99%) and inspect trace continuity.
                3. Shorted Capacitor: Causes power supply rail to collapse (0V or triggering overcurrent protection). Measure resistance across terminals with multimeter in diode mode.
                """);

            ingestText("Power MOSFET & Transistor Failure Guide", """
                Power MOSFET & BJT Failure Analysis:
                1. Shorted Drain-to-Source (D-S): Most common failure mode under overcurrent or voltage spikes above Vds max. Multimeter reads 0 ohms between Drain and Source.
                2. Gate Oxide Punch-Through: Caused by Electrostatic Discharge (ESD) or unclamp inductive kickback. Gate to Source reads shorted (< 50 ohms).
                3. Burning / Package Cracking: Severe thermal runaway. Always replace gate driver IC (e.g. TC4420) alongside blown MOSFET.
                """);

            ingestText("Linear Regulator & IC Thermal Runaway", """
                Voltage Regulator & IC Troubleshooting:
                1. Hot to Touch / Thermal Shutdown: Measure input voltage vs output voltage. Excessive VIn - Vout differential causes power dissipation P = (Vin - Vout) * Iout.
                2. Oscillating Output: Missing or high-ESR decoupling ceramic capacitors near IC input/output pins. Add 100nF ceramic capacitor close to IC pins.
                """);

            log.info("ChromaDB electronics knowledge base successfully seeded!");
        } catch (Exception e) {
            log.warn("Could not seed ChromaDB on startup (ChromaDB might be offline or starting up): {}", e.getMessage());
        }
    }
}
