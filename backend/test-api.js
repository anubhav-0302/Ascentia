import apiClient from "./lib/apiClient.js";

async function testAPIs() {
  console.log("Testing new API endpoints...");
  
  try {
    const loginResponse = await apiClient.post("/auth/login", {
      email: "admin@ascentia.com",
      password: "admin123"
    });
    
    if (loginResponse.success) {
      console.log(" Login successful");
      const token = loginResponse.data.token;
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      const workflowsResponse = await apiClient.get("/workflows");
      console.log(" Workflows API:", workflowsResponse.success ? "Working" : "Failed");
      
      const positionsResponse = await apiClient.get("/recruiting/positions");
      console.log(" Positions API:", positionsResponse.success ? "Working" : "Failed");
      
      const candidatesResponse = await apiClient.get("/recruiting/candidates");
      console.log(" Candidates API:", candidatesResponse.success ? "Working" : "Failed");
      
      const metricsResponse = await apiClient.get("/command-center/metrics");
      console.log(" Metrics API:", metricsResponse.success ? "Working" : "Failed");
      
      const activitiesResponse = await apiClient.get("/command-center/activities");
      console.log(" Activities API:", activitiesResponse.success ? "Working" : "Failed");
      
      const integrationsResponse = await apiClient.get("/command-center/integrations");
      console.log(" Integrations API:", integrationsResponse.success ? "Working" : "Failed");
    }
  } catch (error) {
    console.error(" Error:", error.message);
  }
}

testAPIs();
