import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";

// Simple AI chat responses for agriculture queries
const agricultureResponses: Record<string, string> = {
  "pesticide": "For pest control, we recommend Bayer Confidor for sucking pests and UPL Luster for fungal diseases. Always follow dosage instructions and wear protective gear.",
  "fertilizer": "Our top fertilizers include Coromandel Gromor (NPK 17-17-17) for balanced nutrition and IFFCO Nano Urea for nitrogen supplementation. Choose based on your soil test results.",
  "seed": "We offer premium seeds including Mahyco BT Cotton Seeds with bollworm resistance. Select varieties suited to your region and season.",
  "organic": "For organic farming, try our Biostadt Bio-Fertilizer and Premium Organic Compost. These improve soil health naturally without chemical residues.",
  "delivery": "We offer free delivery on orders above Rs. 999. Standard delivery takes 3-5 business days. Express delivery available in select areas.",
  "payment": "We accept Cash on Delivery (COD), UPI, Razorpay, Credit/Debit cards, and Net Banking. All payments are secure and encrypted.",
  "return": "We offer easy 7-day returns on unopened products. Contact our support team to initiate a return. Refunds processed within 5-7 business days.",
  "default": "Thank you for your interest in KisanStore! We offer a wide range of agriculture products including pesticides, fertilizers, seeds, and farming tools. How can I assist you today?",
};

function getResponse(message: string): string {
  const lowerMsg = message.toLowerCase();
  for (const [key, response] of Object.entries(agricultureResponses)) {
    if (lowerMsg.includes(key)) return response;
  }
  return agricultureResponses.default;
}

export const chatRouter = createRouter({
  send: publicQuery
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const response = getResponse(input.message);
      return { response };
    }),
});
