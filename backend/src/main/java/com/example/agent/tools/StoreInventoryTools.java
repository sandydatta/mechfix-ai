package com.example.agent.tools;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class StoreInventoryTools {

    private final Map<String, Integer> inventory = new HashMap<>();

    public StoreInventoryTools() {
        inventory.put("LAPTOP-PRO-15", 14);
        inventory.put("SMARTPHONE-X", 28);
        inventory.put("WIRELESS-HEADPHONES", 50);
        inventory.put("MECHANICAL-KEYBOARD", 5);
    }

    @Tool("Check stock level for a given product ID or SKU")
    public String checkStock(@P("Product SKU or ID, e.g. LAPTOP-PRO-15") String productId) {
        String key = productId.toUpperCase().trim();
        if (inventory.containsKey(key)) {
            return "Product '" + key + "' current inventory count: " + inventory.get(key) + " units.";
        }
        return "Product '" + key + "' is currently out of stock or not listed in inventory.";
    }

    @Tool("Look up customer order status by Order ID")
    public String getOrderStatus(@P("Order ID, e.g. ORD-1092") String orderId) {
        return "Order " + orderId + " Status: SHIPPED via Express Logistics. Estimated delivery: Tomorrow at 2:00 PM.";
    }

    @Tool("Calculate discount price given original price and percentage discount")
    public String calculateDiscount(@P("Original price in USD") double originalPrice, @P("Discount percentage, e.g. 15 for 15%") double discountPercent) {
        double saved = originalPrice * (discountPercent / 100.0);
        double finalPrice = originalPrice - saved;
        return String.format("Original: $%.2f | Discount: %.1f%% (-$%.2f) | Final Price: $%.2f", originalPrice, discountPercent, saved, finalPrice);
    }
}
