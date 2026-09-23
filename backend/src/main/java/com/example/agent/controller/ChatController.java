package com.example.agent.controller;

import com.example.agent.service.ElectronicsDiagnosticAgent;
import com.example.agent.service.KnowledgeIngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ElectronicsDiagnosticAgent agent;
    private final KnowledgeIngestionService ingestionService;

    public ChatController(ElectronicsDiagnosticAgent agent, KnowledgeIngestionService ingestionService) {
        this.agent = agent;
        this.ingestionService = ingestionService;
    }

    public record ChatRequest(String sessionId, String message, String imageData, String imageName) {}
    public record ChatResponse(String sessionId, String reply) {}
    public record IngestRequest(String title, String content) {}

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String session = (request.sessionId() == null || request.sessionId().isBlank())
                ? UUID.randomUUID().toString()
                : request.sessionId();

        StringBuilder promptBuilder = new StringBuilder();
        if (request.imageData() != null && !request.imageData().isBlank()) {
            promptBuilder.append("[IMAGE ATTACHMENT: ").append(request.imageName() != null ? request.imageName() : "component_photo.jpg").append("]\n");
            promptBuilder.append("User uploaded an image of a defective electronic component for analysis.\n");
        }
        
        promptBuilder.append(request.message() != null ? request.message() : "Diagnose the attached component.");

        String answer = agent.chat(session, promptBuilder.toString());
        return ResponseEntity.ok(new ChatResponse(session, answer));
    }

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, String>> ingest(@RequestBody IngestRequest request) {
        if (request.content() == null || request.content().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Content cannot be empty"));
        }
        String title = (request.title() == null || request.title().isBlank()) ? "Component Datasheet" : request.title();
        ingestionService.ingestText(title, request.content());
        return ResponseEntity.ok(Map.of("message", "Datasheet successfully ingested into ChromaDB!"));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "MechFixAI Diagnostics Engine"));
    }
}
