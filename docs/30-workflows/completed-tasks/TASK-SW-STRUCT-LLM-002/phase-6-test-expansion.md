# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 6                                     |
| タスクID   | TASK-SW-STRUCT-LLM-002                |
| 機能名     | skill-creator-features-llm-generation |
| 前提Phase  | Phase 5                               |
| 後続Phase  | Phase 7                               |
| 作成日     | 2026-04-18                            |
| ステータス | not_started                           |

## 目的

Phase 4 で作成した基本テストに加え、プロンプト品質・境界値・バリデーション・タイムアウト処理の
追加テストを実装し、テストカバレッジ 80% 以上を達成する。

## 実行タスク

- features 生成のプロンプト品質テストの追加（TC-08〜TC-09）
- 境界値テストの追加（TC-10〜TC-11）
- 生成された features のバリデーションテストの追加（TC-12〜TC-13）
- タイムアウト処理のテストの追加（TC-14）
- 拡充後のテスト全件実行確認
- カバレッジ計測・80% 以上であることの確認

## 参照資料

| 資料名                 | パス                                                                                  | 用途     |
| ---------------------- | ------------------------------------------------------------------------------------- | -------- |
| Phase 4 テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.features.test.ts` | 拡充対象 |
| Phase 5 実装ファイル   | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                         | 実装確認 |
| Phase 2 設計書         | `outputs/phase-2/design.md`                                                           | 設計参照 |

## 追加テストケース一覧

### プロンプト品質テスト

| TC ID | テスト名                                                     | 検証内容                                                                       |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| TC-08 | buildFeaturesPrompt がスキルの説明を含むプロンプトを生成する | プロンプト文字列に `options.description` の内容が含まれていること              |
| TC-09 | buildFeaturesPrompt が JSON 配列形式の出力指示を含むこと     | プロンプトに `["feature-1", ...]` 形式の出力フォーマット指示が含まれていること |

### 境界値テスト

| TC ID | テスト名                                                         | 検証内容                                                                              |
| ----- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| TC-10 | 空のスキル名・説明でもフォールバックして処理が継続すること       | `description: ""` の場合に LLM 呼び出しは行われるが失敗時は `features: []` になること |
| TC-11 | 非常に長い説明文（1000文字超）でも正常に features を生成すること | 長大な description でもプロンプト生成・LLM 呼び出しがエラーなく完了すること           |

### バリデーションテスト

| TC ID | テスト名                                                               | 検証内容                                                                                      |
| ----- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| TC-12 | parseFeaturesResponse が JSON 配列以外のレスポンスでエラーをスローする | LLM が JSON 配列でないテキストを返した場合に `parseFeaturesResponse` がエラーをスローすること |
| TC-13 | parseFeaturesResponse が空配列レスポンスでエラーをスローする           | LLM が `[]`（空配列）を返した場合に `parseFeaturesResponse` がエラーをスローすること          |

### タイムアウト処理テスト

| TC ID | テスト名                                                               | 検証内容                                                                                   |
| ----- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| TC-14 | LLM 呼び出しがタイムアウトした場合に features: [] でフォールバックする | `llmService.generate` がタイムアウトエラーをスローした場合に `features: []` で継続すること |

## 実行手順

### 1. テストファイルへの追加

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.features.test.ts` に以下を追加:

```typescript
describe("TC-08: buildFeaturesPrompt がスキルの説明を含むプロンプトを生成する", () => {
  it("プロンプト文字列に description の内容が含まれていること", async () => {
    const description = "ユニークなスキルの説明テキスト";
    // buildFeaturesPrompt を呼び出し、プロンプトに description が含まれることを検証
    // expect(prompt).toContain(description);
  });
});

describe("TC-09: buildFeaturesPrompt が JSON 配列形式の出力指示を含むこと", () => {
  it("プロンプトに JSON 配列フォーマット指示が含まれていること", async () => {
    // expect(prompt).toMatch(/\["feature-\d+".*\]/);
  });
});

describe("TC-10: 空のスキル名・説明でも処理が継続すること", () => {
  it("description が空文字列でも features: [] でフォールバックされること", async () => {
    // description: "" で runCreateWorkflow を呼び出し
    // features が [] であることを検証
  });
});

describe("TC-11: 非常に長い説明文でも正常に features を生成すること", () => {
  it("1000文字超の description でもエラーなく完了すること", async () => {
    const longDescription = "あ".repeat(1200);
    // features が配列として返ってくることを検証
  });
});

describe("TC-12: parseFeaturesResponse が JSON 配列以外のレスポンスでエラーをスローする", () => {
  it("JSON でないテキストに対してエラーをスローすること", async () => {
    // mockLlmService.generate.mockResolvedValue("これは配列ではありません");
    // features: [] でフォールバックされることを検証（try-catch によって）
  });
});

describe("TC-13: parseFeaturesResponse が空配列レスポンスでエラーをスローする", () => {
  it("空配列 [] に対してエラーをスローすること", async () => {
    // mockLlmService.generate.mockResolvedValue("[]");
    // features: [] でフォールバックされることを検証（try-catch によって）
  });
});

describe("TC-14: LLM 呼び出しがタイムアウトした場合に features: [] でフォールバックする", () => {
  it("タイムアウトエラー時に features: [] で処理が継続されること", async () => {
    const timeoutError = new Error("Request timeout");
    timeoutError.name = "TimeoutError";
    mockLlmService.generate.mockRejectedValue(timeoutError);
    // features が [] になること、エラーがスローされないことを検証
  });
});
```

### 2. カバレッジ計測

```bash
# カバレッジ付きでテスト実行
pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/skill/__tests__/SkillCreatorService.features.test.ts
# 期待: カバレッジ 80% 以上

# 拡充後のテスト全件実行
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.features.test.ts
# 期待: 全 PASS（TC-01〜TC-14）

# 既存テストの回帰確認
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
# 期待: PASS（回帰なし）
```

## 統合テスト連携【必須】

追加テストの統合検証（全カテゴリのカバレッジ向上）。

| 判定項目                | 基準                | 結果    |
| ----------------------- | ------------------- | ------- |
| TC-08〜TC-14 の追加完了 | 全TC追加済み        | pending |
| 全件テスト PASS         | TC-01〜TC-14 全PASS | pending |
| 既存テスト回帰なし      | 回帰なし            | pending |
| カバレッジ              | 80% 以上            | pending |

## 多角的チェック観点（AIが判断）

| 観点                 | チェック内容                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------- |
| プロンプト品質       | `buildFeaturesPrompt` の出力が実際に有用な features を生成できる内容か検証しているか        |
| 境界値網羅           | 空文字列・超長文字列など入力の極端なケースをカバーしているか                                |
| バリデーション堅牢性 | `parseFeaturesResponse` が不正な LLM 出力を安全に処理してフォールバックするか確認しているか |
| タイムアウト処理     | タイムアウトが try-catch で正しく捕捉されフォールバックされることを確認しているか           |
| カバレッジ目標       | 80% 以上のカバレッジが実際に達成されているか計測しているか                                  |

## サブタスク管理

1. TC-08〜TC-09（プロンプト品質）追加
2. TC-10〜TC-11（境界値）追加
3. TC-12〜TC-13（バリデーション）追加
4. TC-14（タイムアウト処理）追加
5. 拡充後の全件実行確認（TC-01〜TC-14）
6. カバレッジ計測・80% 以上の確認
7. 既存テスト回帰確認

## 成果物

| 成果物             | パス                                                                                  | 説明                          |
| ------------------ | ------------------------------------------------------------------------------------- | ----------------------------- |
| 拡充テストスイート | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.features.test.ts` | TC-08〜TC-14 追加後の全テスト |

## 完了条件

- [ ] TC-08〜TC-09 のプロンプト品質テストが追加済み
- [ ] TC-10〜TC-11 の境界値テストが追加済み
- [ ] TC-12〜TC-13 のバリデーションテストが追加済み
- [ ] TC-14 のタイムアウト処理テストが追加済み
- [ ] TC-01〜TC-14 全件が PASS している
- [ ] テストカバレッジが 80% 以上である
- [ ] 既存テストが回帰なしで PASS している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SW-STRUCT-LLM-002
```

## 次Phase

Phase 7: カバレッジ確認
