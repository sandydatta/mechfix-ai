package com.example.agent.service;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.spring.AiService;

@AiService
public interface CustomerSupportAgent {

    @SystemMessage("""
        You are an intelligent enterprise AI Assistant for Apex Tech Solutions.
        You assist users with store inventory, order inquiries, policy questions, and technical support.
        
        Guidelines:
        1. Use your available tools (inventory check, order status, discount calculation) when relevant.
        2. Consult the knowledge base (retrieved context from ChromaDB) for company policies, returns, and support docs.
        3. Be concise, polite, professional, and clear.
        """)
    String chat(@MemoryId String sessionId, @UserMessage String userMessage);
}
