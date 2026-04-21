import { describe, it, expect } from "vitest";
import { MockTokenEmbeddingClient } from "../mock-token-embedding-provider";

// TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 テストID: TP-MOCK-01
describe("MockTokenEmbeddingClient", () => {
  describe("TP-MOCK-01: getTokenEmbeddings が正しい形式を返す", () => {
    it("tokens と embeddings の長さが一致する", async () => {
      const client = new MockTokenEmbeddingClient();
      const text = "hello world foo";

      const result = await client.getTokenEmbeddings(text);

      expect(result.tokens).toHaveLength(3);
      expect(result.embeddings).toHaveLength(3);
      expect(result.tokens.length).toBe(result.embeddings.length);
      const dim = result.embeddings[0].length;
      result.embeddings.forEach((vec) => {
        expect(vec).toHaveLength(dim);
      });
    });
  });
});
