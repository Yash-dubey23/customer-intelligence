package com.ci.config;

import com.ci.model.Customer;
import com.ci.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CustomerService customerService;

    @Override
    public void run(String... args) throws Exception {
        if (customerService.count() > 0) {
            System.out.println("Database already seeded with customers.");
            return;
        }

        File csvFile = new File("../ml/data/Telco-Customer-Churn.csv");
        if (!csvFile.exists()) {
            csvFile = new File("data/Telco-Customer-Churn.csv");
        }
        if (!csvFile.exists()) {
            csvFile = new File("ml/data/Telco-Customer-Churn.csv");
        }
        if (!csvFile.exists()) {
            csvFile = new File("../../ml/data/Telco-Customer-Churn.csv");
        }
        
        if (!csvFile.exists()) {
            System.out.println("Telco CSV not found at expected paths. Skipping seeding.");
            return;
        }

        System.out.println("Seeding customers from CSV: " + csvFile.getAbsolutePath());
        
        List<Customer> batch = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(csvFile))) {
            String line;
            boolean isFirst = true;
            int counter = 1;
            
            while ((line = br.readLine()) != null) {
                if (isFirst) {
                    isFirst = false;
                    continue; // Skip header
                }
                
                String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
                if (values.length >= 21) {
                    try {
                        String totalStr = values[19].trim().replace("\"", "");
                        Double totalCharges = totalStr.isEmpty() ? 0.0 : Double.parseDouble(totalStr);
                        
                        Customer c = Customer.builder()
                                .customerCode("CUST-" + String.format("%04d", counter++))
                                .gender(values[1].replace("\"", ""))
                                .seniorCitizen(Integer.parseInt(values[2]))
                                .partner(values[3].replace("\"", ""))
                                .dependents(values[4].replace("\"", ""))
                                .tenure(Integer.parseInt(values[5]))
                                .phoneService(values[6].replace("\"", ""))
                                .multipleLines(values[7].replace("\"", ""))
                                .internetService(values[8].replace("\"", ""))
                                .onlineSecurity(values[9].replace("\"", ""))
                                .onlineBackup(values[10].replace("\"", ""))
                                .deviceProtection(values[11].replace("\"", ""))
                                .techSupport(values[12].replace("\"", ""))
                                .streamingTv(values[13].replace("\"", ""))
                                .streamingMovies(values[14].replace("\"", ""))
                                .contract(values[15].replace("\"", ""))
                                .paperlessBilling(values[16].replace("\"", ""))
                                .paymentMethod(values[17].replace("\"", ""))
                                .monthlyCharges(Double.parseDouble(values[18].replace("\"", "")))
                                .totalCharges(totalCharges)
                                .actualChurn(values[20].replace("\"", ""))
                                .build();
                                
                        batch.add(c);
                        
                        if (batch.size() >= 1000) {
                            customerService.importFromCsv(batch);
                            batch.clear();
                        }
                    } catch (Exception e) {
                        System.err.println("Error parsing row: " + line + " - " + e.getMessage());
                    }
                }
            }
            
            if (!batch.isEmpty()) {
                customerService.importFromCsv(batch);
            }
            System.out.println("Finished seeding " + (counter - 1) + " customers.");
        } catch (Exception e) {
            System.err.println("Failed to seed data: " + e.getMessage());
        }
    }
}
