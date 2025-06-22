import { BedrockEmbeddings } from "@langchain/aws";
import { BEDROCK_REGION, BEDROCK_ACCESS_KEY, BEDROCK_SECRET_KEY } from "./config";

export const embeddings = new BedrockEmbeddings({
  region: BEDROCK_REGION,
  credentials: {
    accessKeyId: BEDROCK_ACCESS_KEY,
    secretAccessKey: BEDROCK_SECRET_KEY,
  },
  model: "amazon.titan-embed-text-v2:0",
});
