# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 6                         |
| Phase名    | テスト拡充                |
| 前提Phase  | Phase 5（実装）           |
| 後続Phase  | Phase 7（カバレッジ確認） |
| ステータス | 未実施                    |
| 作成日     | 2026-01-23                |
| 機能名     | system-prompt-llm-api     |

---

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

## 背景

Phase 4で作成したテストは基本的なケースのみ。以下を追加:

- 各プロバイダー（OpenAI/Anthropic/Google/xAI）のテスト
- エラーケースの網羅
- 境界値テスト
- 統合テストの拡充

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: プロバイダー別テストの追加

**目的**: 4つのプロバイダーすべてでテストを作成する

**実行手順**:

1. OpenAIプロバイダーのテスト追加
2. Anthropicプロバイダーのテスト追加
3. Googleプロバイダーのテスト追加
4. xAIプロバイダーのテスト追加

**テストケース例**:

```typescript
describe.each([
  { provider: "openai", model: "gpt-4o" },
  { provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
  { provider: "google", model: "gemini-1.5-pro" },
  { provider: "xai", model: "grok-2" },
] as const)("$provider プロバイダー", ({ provider, model }) => {
  it("システムプロンプト付きでAPIを呼び出す", async () => {
    // テスト実装
  });

  it("システムプロンプトなしでAPIを呼び出す", async () => {
    // テスト実装
  });
});
```

**期待される成果物**:

- 各プロバイダーのテストケース

---

### タスク2: エラーケーステストの追加

**目的**: エラーハンドリングの網羅性を確保する

**実行手順**:

1. APIキー未設定エラーテスト
2. APIキー無効エラーテスト
3. ネットワークエラーテスト
4. レート制限エラーテスト
5. タイムアウトエラーテスト

**テストケース例**:

```typescript
describe("エラーハンドリング", () => {
  it("APIキー未設定でAPI_KEY_MISSINGエラーをスローする", async () => {
    await expect(
      callLLM(messages, { provider: "openai", apiKey: "" }),
    ).rejects.toThrow("API key is required");
  });

  it("APIキー無効でAPI_KEY_INVALIDエラーをスローする", async () => {
    vi.mocked(generateText).mockRejectedValue(new Error("Invalid API key"));
    await expect(
      callLLM(messages, { provider: "openai", apiKey: "invalid" }),
    ).rejects.toThrow("Invalid API key");
  });

  it("ネットワークエラー時に適切なエラーを返す", async () => {
    vi.mocked(generateText).mockRejectedValue(new Error("Network error"));
    await expect(
      callLLM(messages, { provider: "openai", apiKey: "valid" }),
    ).rejects.toThrow("Network error");
  });

  it("レート制限エラー時にリトライ情報を含むエラーを返す", async () => {
    const rateLimitError = new Error("Rate limit exceeded");
    vi.mocked(generateText).mockRejectedValue(rateLimitError);
    await expect(
      callLLM(messages, { provider: "openai", apiKey: "valid" }),
    ).rejects.toThrow("Rate limit exceeded");
  });
});
```

**期待される成果物**:

- エラーケーステスト

---

### タスク3: 境界値テストの追加

**目的**: エッジケースでの動作を検証する

**実行手順**:

1. 空文字列メッセージのテスト
2. 最大長メッセージのテスト
3. 特殊文字を含むメッセージのテスト
4. マルチバイト文字のテスト

**テストケース例**:

```typescript
describe("境界値テスト", () => {
  describe("buildMessages", () => {
    it("空のユーザーメッセージを受け付ける", () => {
      const result = buildMessages("");
      expect(result).toEqual([{ role: "user", content: "" }]);
    });

    it("特殊文字を含むシステムプロンプトを正しく処理する", () => {
      const result = buildMessages(
        "Hello",
        '日本語<script>alert("XSS")</script>',
      );
      expect(result[0].content).toBe('日本語<script>alert("XSS")</script>');
    });

    it("改行を含むシステムプロンプトを正しく処理する", () => {
      const result = buildMessages("Hello", "Line1\nLine2\nLine3");
      expect(result[0].content).toBe("Line1\nLine2\nLine3");
    });
  });
});
```

**期待される成果物**:

- 境界値テスト

---

### タスク4: 統合テストの拡充

**目的**: aiHandlers経由の統合テストを追加する

**実行手順**:

1. 正常系フローテストの追加
2. エラーフローテストの追加
3. 会話IDの継続テスト

**期待される成果物**:

- 統合テストの拡充

---

## カバレッジ目標

### ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

---

## 参照資料

### Phase成果物

| 資料名       | パス                                    | 内容          |
| ------------ | --------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4成果物 |
| 実装コード   | `apps/desktop/src/main/services/`       | Phase 5成果物 |

---

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                                  | 目標 |
| ------------------ | ----------------------------------------- | ---- |
| API接続テスト      | 4プロバイダー全てへの疎通確認             | 100% |
| データフローテスト | Renderer→Main→LLM API→Main→Rendererの往復 | 100% |
| エラーハンドリング | 全エラーコードの網羅                      | 80%+ |
| 状態同期テスト     | 会話ID継続、複数メッセージ                | 100% |

---

## 成果物

| 成果物             | パス                                  | 説明               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md` | 統合テスト実行結果 |
| テストファイル     | `apps/desktop/src/main/**/*.test.ts`  | 追加テストコード   |

---

## 完了条件

- [ ] プロバイダー別テストが追加されている
- [ ] エラーケーステストが追加されている
- [ ] 境界値テストが追加されている
- [ ] 統合テストが拡充されている
- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

Phase 7: テストカバレッジ確認

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-llm-api/phase-7-coverage-check.md`
