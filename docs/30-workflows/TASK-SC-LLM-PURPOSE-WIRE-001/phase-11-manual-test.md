# Phase 11: 手動テスト -- extract-purpose LLM 実結果差し替え

## メタ情報

| 項目       | 値                           |
| ---------- | ---------------------------- |
| Phase番号  | 11                           |
| 機能名     | llm-purpose-wire             |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 作成日     | 2026-04-16                   |
| 依存 Phase | Phase 10（最終レビュー）     |

## 目的

NON_VISUAL タスクのため、Electron アプリの UI 操作より Semantic テストを中心に、`runCreateWorkflow` 実行後の `StructurePlanJson.purpose` フィールドに LLM 推論結果が格納されていることを確認する。

## タスク種別: NON_VISUAL

本タスクはバックエンドサービス実装のため、UI スクリーンショット確認は対象外。Semantic テスト（ログ確認・API レスポンス確認・テスト結果確認）を中心に実施する。

## 実行タスク

### Task 11-1: Semantic テスト（CLI 環境）

#### シナリオ ST-01: purpose フィールドが LLM 結果であることの確認

```bash
# SkillCreatorService テストを verbose モードで実行し、purpose 検証テストが PASS することを確認
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts --reporter=verbose 2>&1 | grep -E "(PASS|FAIL|purpose|extract-purpose|LLM)"
```

期待する結果: purpose フィールドが LLM 結果であることを検証するテストが PASS

#### シナリオ ST-02: エージェント定義 raw 文字列が purpose に入らないことの確認

```bash
# purpose にエージェント定義文字列が残っていないことを grep で確認
grep -n "loadAgent\|purpose\s*=" apps/desktop/src/main/services/skill/SkillCreatorService.ts | head -20
```

期待する結果:

- `loadAgent("extract-purpose")` の戻り値が直接 `purpose` に代入されていないこと
- LLM 呼び出しを経由した結果が `purpose` に代入されていること

#### シナリオ ST-03: エラーハンドリングの確認

```bash
# エラーハンドリング実装の確認
grep -n -A3 "catch\|error\|Error" apps/desktop/src/main/services/skill/SkillCreatorService.ts | grep -A3 -i "purpose" | head -30
```

期待する結果: purpose 取得失敗時のエラーハンドリングが実装されていること

#### シナリオ ST-04: LLM 呼び出し設計ドキュメントの確認

`outputs/phase-2/design.md` を Read し、以下を確認する:

- LLM 呼び出し方式（直接呼び出し vs エージェント経由）の選択が明記されている
- purpose 抽出フローの記載がある

### Task 11-2: Electron アプリ起動時の確認（任意）

Electron アプリを起動できる環境がある場合、以下のシナリオを実施する:

#### シナリオ MT-01: スキル作成フローの実行

1. アプリを起動する
2. スキル作成フローを開始する
3. フロー完了後、生成された `structurePlan` のログまたはデバッグ出力を確認する
4. `purpose` フィールドがエージェント定義の raw 文字列ではなく、一文程度の自然言語説明になっていることを確認する

**確認ポイント（purpose フィールドの期待値例）**:

- NG 例（エージェント定義 raw 文字列）: `"You are an AI agent that extracts the purpose from skill definitions. Given a skill definition, you should..."`
- OK 例（LLM 推論結果）: `"スキルの目的を一文で要約する"` / `"Extracts the purpose of a skill from its definition"`

### Task 11-3: 手動テスト結果の記録

| シナリオ | 実施方法            | 結果           | 備考 |
| -------- | ------------------- | -------------- | ---- |
| ST-01    | CLI Semantic テスト | PASS/FAIL      |      |
| ST-02    | CLI grep 確認       | PASS/FAIL      |      |
| ST-03    | CLI grep 確認       | PASS/FAIL      |      |
| ST-04    | Read 確認           | PASS/FAIL      |      |
| MT-01    | 実機（任意）        | PASS/FAIL/SKIP |      |

## 参照資料

| 資料名                | パス                                                                           |
| --------------------- | ------------------------------------------------------------------------------ |
| Phase 10 最終レビュー | `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-10-final-review.md`      |
| SkillCreatorService   | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                  |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`（CLI 環境でのスクリーンショット取得制約） |

## 成果物

| 成果物             | パス                                     | 形式     |
| ------------------ | ---------------------------------------- | -------- |
| 手動テスト結果記録 | `outputs/phase-11/manual-test-result.md` | Markdown |

## 完了条件

- [ ] ST-01 で purpose 検証テストが PASS することを確認した
- [ ] ST-02 でエージェント定義 raw 文字列が purpose に直接代入されていないことを確認した
- [ ] ST-03 で purpose 取得失敗時のエラーハンドリングが実装されていることを確認した
- [ ] ST-04 で LLM 呼び出し方式が設計ドキュメントに明記されていることを確認した
- [ ] 手動テスト結果を `outputs/phase-11/manual-test-result.md` に記録した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次の Phase

Phase 12: ドキュメント更新（`phase-12-documentation.md`）
