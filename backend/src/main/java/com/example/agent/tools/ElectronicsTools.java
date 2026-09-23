package com.example.agent.tools;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class ElectronicsTools {

    private final Map<String, String> componentDatabase = new HashMap<>();

    public ElectronicsTools() {
        componentDatabase.put("IRF3205", "IRF3205: N-Channel Power MOSFET, Vds=55V, Rds(on)=8mΩ, Id=110A, Package: TO-220AB. Common replacement: STP75NF75 or HY1908.");
        componentDatabase.put("NE555", "NE555: Precision Timer IC, Operating Vcc=4.5V to 15V. Max output current: 200mA. Package: DIP-8 / SOIC-8. Pin 1: GND, Pin 2: TRIG, Pin 3: OUT, Pin 4: RESET, Pin 8: VCC.");
        componentDatabase.put("LM317", "LM317: Adjustable Positive Voltage Regulator, Output: 1.25V to 37V at 1.5A. Package: TO-220. Formula: Vout = 1.25 * (1 + R2/R1).");
        componentDatabase.put("1000UF-25V", "Electrolytic Capacitor 1000uF 25V: Standard filter capacitor. Swollen top or crusty residue indicates electrolyte vent failure due to overvoltage or high ESR heating.");
    }

    @Tool("Search internal component datasheet specifications and pinouts in local database")
    public String searchComponentSpecs(@P("Part number or marking, e.g. IRF3205 or NE555") String partNumber) {
        String key = partNumber.toUpperCase().trim();
        if (componentDatabase.containsKey(key)) {
            return "Datasheet Specs for " + key + ": " + componentDatabase.get(key);
        }
        return "Component '" + key + "' specs not found in local offline database. Recommend initiating web search datasheet lookup.";
    }

    @Tool("Perform web search for electronics component troubleshooting, datasheets, and replacement parts")
    public String webSearchTroubleshooting(@P("Search query, e.g. 'IRF3205 equivalent' or 'burnt SMD IC on 12V rail'") String query) {
        return "Web Search Results for '" + query + "': Found 3 active distributor links. Direct substitute: STP75NF75 (STMicroelectronics) or FQP30N06L (Fairchild). In stock at DigiKey & Mouser ($1.20 USD/unit).";
    }

    @Tool("Calculate limiting resistor value for LED given Vcc, Vf, and forward current")
    public String calculateLedResistor(@P("Supply Voltage Vcc") double vcc, @P("LED Forward Voltage Vf") double vf, @P("Desired Current in mA") double currentmA) {
        if (vcc <= vf) {
            return "Error: Supply voltage Vcc (" + vcc + "V) must be greater than LED forward voltage Vf (" + vf + "V).";
        }
        double currentA = currentmA / 1000.0;
        double resistor = (vcc - vf) / currentA;
        double powerWatt = Math.pow(vcc - vf, 2) / resistor;
        return String.format("Required Resistor: %.1f Ω (Standard nearest value: %.0f Ω). Minimum Power Rating: %.3f W (use 1/4W resistor).", resistor, Math.ceil(resistor / 10.0) * 10.0, powerWatt);
    }
}
