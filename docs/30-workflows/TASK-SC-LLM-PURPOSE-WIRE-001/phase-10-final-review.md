# Phase 10: 最終レビュー -- extract-purpose LLM 実結果差し替え

## メタ情報

| 項目       | 値                           |
| ---------- | ---------------------------- |
| Phase番号  | 10                           |
| 機能名     | llm-purpose-wire             |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 作成日     | 2026-04-16                   |
| 依存 Phase | Phase 9（品質保証）          |

## 目的

Phase 1 から 9 の成果物を多角的に検証し、Phase 11（手動テスト）への進行可否を PASS / MINOR / MAJOR / CRITICAL で判定する。

## 受け入れ基準（AC-1〜AC-6）一覧

| AC ID | 受け入れ基準                                                                                  |
| ----- | --------------------------------------------------------------------------------------------- |
| AC-1  | `extract-purpose` エージェント定義を LLM に渡し、purpose 文字列を取得する処理が実装されている |
| AC-2  | `StructurePlanJson.purpose` に LLM の推論結果が格納されている（raw 文字列ではない）           |
| AC-3  | LLM 呼び出し方式（直接呼び出し vs エージェント経由）が設計ドキュメントに明記されている        |
| AC-4  | purpose 生成に失敗した場合のエラーハンドリングが実装されている                                |
| AC-5  | 既存テストが全て PASS する                                                                    |
| AC-6  | 新規ユニットテストで purpose フィールドが LLM 結果になっていることが検証されている            |

## 実行タスク

### Task 10-1: 受け入れ基準の最終確認

| AC ID | 検証方法                                                                                        | 結果      |
| ----- | ----------------------------------------------------------------------------------------------- | --------- |
| AC-1  | `SkillCreatorService.ts` を Read し、`loadAgent("extract-purpose")` + LLM 呼び出しを確認        | PASS/FAIL |
| AC-2  | `SkillCreatorService.ts` を Read し、`purpose` への代入がエージェント定義文字列でないことを確認 | PASS/FAIL |
| AC-3  | Phase 2 設計書を Read し、LLM 呼び出し方式の記載を確認                                          | PASS/FAIL |
| AC-4  | `SkillCreatorService.ts` を Read し、purpose 失敗時の try/catch またはエラー処理を確認          | PASS/FAIL |
| AC-5  | Phase 9 の品質保証結果（全テスト PASS）を参照                                                   | PASS/FAIL |
| AC-6  | `SkillCreatorService.test.ts` を Read し、purpose が LLM 結果であることを検証するテストを確認   | PASS/FAIL |

### Task 10-2: 実装内容の多角的検証

#### 2-A: コードの正確性検証

`apps/desktop/src/main/services/skill/SkillCreatorService.ts` を Read し、以下を確認する:

1. `loadAgent("extract-purpose")` が呼び出されてエージェント定義が取得されている
2. 取得したエージェント定義が LLM へのプロンプトとして渡されている
3. LLM から返却された推論結果が `purpose` フィールドに代入されている
4. `StructurePlanJson.purpose` に代入されている値がエージェント定義の raw 文字列ではない
5. purpose 取得失敗時に適切なエラーハンドリング（ログ出力・例外スロー等）が実装されている

#### 2-B: テストの正確性検証

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` を Read し、以下を確認する:

1. LLM をモックし、purpose 文字列を返すテストが存在する
2. `StructurePlanJson.purpose` にモックの LLM 結果が格納されていることをアサートするテストが存在する
3. purpose 取得失敗時のエラーハンドリングを検証するテストが存在する
4. エージェント定義文字列がそのまま `purpose` に入らないことを確認するテストが存在する

#### 2-C: 設計ドキュメントの確認

Phase 2 設計書（`outputs/phase-2/design.md`）を Read し、以下を確認する:

1. LLM 呼び出し方式（直接呼び出し vs エージェント経由）の選択理由が記載されている
2. purpose 抽出のフロー図またはシーケンスが記載されている

#### 2-D: スコープ外ファイルの変更なし確認

以下のファイルが意図しない変更を受けていないことを確認する:

```bash
git diff -- packages/shared/src/types/
git diff -- apps/desktop/src/main/services/skill/
```

#### 2-E: セキュリティ確認

- LLM 呼び出し時に API キーがログ出力に含まれないことを確認
- エージェント定義がサニタイズされずにログ出力される場合の情報漏洩リスクを確認

### Task 10-3: Phase 9 品質保証結果の確認

Phase 9 の品質チェック結果から以下を確認する:

- ESLint: PASS
- TypeScript 型チェック: PASS
- SkillCreatorService テスト全実行: PASS
- 関連テスト全体への影響確認: PASS
- shared パッケージビルド: PASS

### Task 10-4: レビュー判定

**判定基準**:

| 判定     | 条件                                                                      |
| -------- | ------------------------------------------------------------------------- |
| PASS     | AC-1 から AC-6 が全て PASS、Phase 9 が全て PASS                           |
| MINOR    | 機能に影響しない軽微な問題（コメント不足、命名の改善余地等）              |
| MAJOR    | いずれかの AC が FAIL、または purpose が依然 raw 文字列になっているケース |
| CRITICAL | 既存テストの破壊、または `StructurePlanJson` 型定義の意図しない変更       |

**想定される MINOR 指摘**:

- なし。`timeout` は LLM アダプターの既定設定で扱われ、purpose の正規化と空文字フォールバックは実装済み。

MINOR 指摘が発生した場合のみ未タスク仕様書に変換し、Phase 11 前に記録する。

## 参照資料

| 資料名               | パス                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| Phase 1 要件定義     | `outputs/phase-1/requirements-definition.md`                                  |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                                      |
| Phase 2 設計書       | `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/outputs/phase-2/design.md`    |
| Phase 9 品質保証     | `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-9-quality-assurance.md` |
| SkillCreatorService  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                 |
| タスク実行ルール     | `.claude/rules/05-task-execution.md`（Phase 10 ゲート判定）                   |

## 成果物

| 成果物                       | パス                               | 形式     |
| ---------------------------- | ---------------------------------- | -------- |
| 最終レビュー書（本ファイル） | `outputs/phase-10/final-review.md` | Markdown |

## 完了条件

- [ ] AC-1 から AC-6 の全受け入れ基準を検証し、判定を記録した
- [ ] `SkillCreatorService.ts` を Read し、LLM 呼び出しと purpose 代入の正確性を確認した
- [ ] `SkillCreatorService.test.ts` を Read し、テストの網羅性を確認した
- [ ] Phase 2 設計書を Read し、LLM 呼び出し方式の記載を確認した
- [ ] スコープ外ファイルが意図しない変更を受けていないことを確認した
- [ ] セキュリティ確認（API キー非露出）を完了した
- [ ] Phase 9 の全品質チェックが PASS していることを確認した
- [ ] レビュー判定（PASS / MINOR / MAJOR / CRITICAL）を明記した
- [ ] MINOR 指摘がある場合は未タスク仕様書を作成した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次の Phase

PASS / MINOR: Phase 11（`phase-11-manual-test.md`）
MAJOR: 影響範囲に応じて Phase 1 から 5 に戻る
CRITICAL: Phase 1 に戻り要件再確認
