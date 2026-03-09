# Phase 10: 最終レビューゲート - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                   |
| --------- | ---------------------- |
| タスクID  | TASK-10A-G             |
| Phase     | 10                     |
| 名称      | 最終レビューゲート     |
| 依存Phase | Phase 9（品質保証）    |
| 次Phase   | Phase 11（手動テスト） |

---

## 目的

Phase 1-9の全成果物に対して多角的品質・整合性検証を実施し、PASS/MINOR/MAJOR/CRITICAL判定を行う。テストコードが要件を正しく保護しており、既存テストとの整合性が保たれていることを最終確認する。

## 実行タスク

- Task 1: 要件トレーサビリティとテスト品質を横断監査する
- Task 2: 既存テスト整合・カバレッジ・教訓反映をレビューする
- Task 3: Gate判定と未タスク化要否を確定する

---

## レビュー対象成果物

| 成果物                   | パス                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義書       | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-1-requirements.md`                         |
| Phase 2 設計書           | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md`                               |
| TASK-10A-F 引き渡し設計  | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`                                         |
| TASK-10A-E 引き渡し条件  | `docs/30-workflows/completed-tasks/task-043a-ipc-contract-and-security-alignment/outputs/phase-10/handover-criteria.md` |
| Layer 1 テストコード     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                                                      |
| Layer 2 テストコード     | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`                              |
| Layer 3 テスト追加分     | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`                               |
| Phase 5 実装書           | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-5-implementation.md`                       |
| リファクタリングレポート | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-8/refactoring-report.md`           |
| 品質レポート             | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-9/quality-report.md`               |

---

## レビュー観点

### RV1: 要件トレーサビリティ

FR-G01/G02/G03の全項目がテストケースでカバーされていることを検証する。

| ID     | チェック項目                                                                 | 判定 |
| ------ | ---------------------------------------------------------------------------- | ---- |
| RV1-01 | FR-G01-1（Sender検証）がTC-G01-001, TC-G01-002でカバーされている             | -    |
| RV1-02 | FR-G01-2（description P42バリデーション）がTC-G01-003〜006でカバーされている | -    |
| RV1-03 | FR-G01-3（options バリデーション）がTC-G01-007, TC-G01-008でカバーされている | -    |
| RV1-04 | FR-G01-4（正常系委譲）がTC-G01-009, TC-G01-010でカバーされている             | -    |
| RV1-05 | FR-G01-5（エラーラップ）がTC-G01-011でカバーされている                       | -    |
| RV1-06 | FR-G01-6（エラーサニタイズ）がTC-G01-012〜014でカバーされている              | -    |
| RV1-07 | FR-G02-1〜6 と TASK-10A-F RT-01〜RT-07 がTC-G02-001〜010でカバーされている   | -    |
| RV1-08 | FR-G03-1〜4がTC-G03-001〜004でカバーされている                               | -    |
| RV1-09 | NFR-G01（実行時間）がPhase 9品質レポートで検証されている                     | -    |
| RV1-10 | NFR-G02（保守性）がPhase 8リファクタリングで対応されている                   | -    |

### RV2: テスト品質

テストが実装の契約を正しく保護しているかを検証する。

| ID     | チェック項目                                                                                 | 判定 |
| ------ | -------------------------------------------------------------------------------------------- | ---- |
| RV2-01 | Layer 1テストが `skillHandlers.ts` の実際のハンドラー引数形式と整合している                  | -    |
| RV2-02 | Layer 1テストのモックが実際のimport構造（SkillService, validateIpcSender等）と一致           | -    |
| RV2-03 | Layer 2テストの統合ハーネスが `testing-component-patterns.md` の real composition 方針に準拠 | -    |
| RV2-04 | Layer 2テストが component direct `window.electronAPI.skill.*` を期待値にしていない           | -    |
| RV2-05 | エラーサニタイズテストがUNIX/Windowsパスとトークンパターンを検証している                     | -    |
| RV2-06 | テストケースの `it` ブロック名がテスト内容を一意に特定できる                                 | -    |
| RV2-07 | テストデータファクトリが適切な粒度で抽出されている（過剰抽象化なし）                         | -    |

### RV3: 既存テスト整合

既存テストに回帰がないことを検証する。

| ID     | チェック項目                                                               | 判定 |
| ------ | -------------------------------------------------------------------------- | ---- |
| RV3-01 | `ChatPanel.skill-management.test.tsx` の既存テスト全件がPASSしている       | -    |
| RV3-02 | `skillCreatorHandlers.validation.test.ts` とテストスコープが重複していない | -    |
| RV3-03 | `skillCreatorHandlers.security.test.ts` とテストスコープが重複していない   | -    |
| RV3-04 | `agentSlice.skill-lifecycle.test.ts` とテスト観点が重複していない          | -    |
| RV3-05 | 新規テストファイルの `vi.mock` スコープが他ファイルに波及していない        | -    |
| RV3-06 | テスト実行順序を変えても全テストがPASSする                                 | -    |

### RV4: カバレッジ基準

Phase 1で定義したカバレッジ基準を達成していることを検証する。

| ID     | チェック項目                                        | 基準値  | 判定 |
| ------ | --------------------------------------------------- | ------- | ---- |
| RV4-01 | Line Coverage が基準値を達成している                | 80%以上 | -    |
| RV4-02 | Branch Coverage が基準値を達成している              | 60%以上 | -    |
| RV4-03 | Function Coverage が基準値を達成している            | 80%以上 | -    |
| RV4-04 | Phase 9品質レポートにカバレッジ数値が記録されている | -       | -    |

### RV5: 教訓反映

P9/P31/P39/P40/P42/P48が正しく反映されていることを検証する。

| ID     | チェック項目                                                                     | 判定 |
| ------ | -------------------------------------------------------------------------------- | ---- |
| RV5-01 | P9（テスト間リーク）: `beforeEach` で `vi.clearAllMocks()` が実行されている      | -    |
| RV5-02 | P9（テスト間リーク）: Store状態が `beforeEach` でリセットされている              | -    |
| RV5-03 | P31（無限ループ）: 合成Store Hook を使用していない                               | -    |
| RV5-04 | P39（happy-dom非互換）: `userEvent` を使用していない（`fireEvent` のみ使用）     | -    |
| RV5-05 | P40（ディレクトリ依存）: テスト実行が `apps/desktop/` からの実行を前提としている | -    |
| RV5-06 | P42（trim漏れ）: スペースのみ入力のバリデーションテストが含まれている            | -    |
| RV5-07 | P48（useShallow）: 派生セレクタテストで `useShallow` 適用が確認されている        | -    |

### RV6: セキュリティ

sender検証とエラーサニタイズが正しくテストされていることを検証する。

| ID     | チェック項目                                                                           | 判定 |
| ------ | -------------------------------------------------------------------------------------- | ---- |
| RV6-01 | Sender検証テストが正当なsenderと不正なsenderの両方を検証している                       | -    |
| RV6-02 | エラーサニタイズテストがファイルパス（UNIX形式 `/home/user/...`）の除去を検証している  | -    |
| RV6-03 | エラーサニタイズテストがファイルパス（Windows形式 `C:\Users\...`）の除去を検証している | -    |
| RV6-04 | エラーサニタイズテストがトークン情報（`token=xxx`パターン）の除去を検証している        | -    |
| RV6-05 | バリデーションエラーが内部実装詳細を含まないことが検証されている                       | -    |

---

## レビュー実施手順

### Step 1: 要件トレーサビリティ検証

1. Phase 1の FR-G01/G02/G03 の全項目を列挙する
2. テストコードの `it` ブロックからテストケースID（TC-Gxx-nnn）を抽出する
3. FR項目とテストケースIDの対応表を作成する
4. 未カバーのFR項目がないことを確認する

### Step 2: テストコードの実コード突合

1. `skillHandlers.ts` の `skill:create` ハンドラーのソースコードを読む
2. テストコードのモック設定が実際のimport/引数形式と一致していることを確認する
3. エラーハンドリングのパスが全てテストでカバーされていることを確認する

### Step 3: 既存テスト回帰検証

1. 以下のコマンドで既存スキル関連テストを全件実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
   cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/
   cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/
   ```
2. 全件PASSであることを確認する
3. テスト実行時間がベースラインから30%以上増加していないことを確認する

### Step 4: 教訓（Pitfall）反映の検証

1. 各テストファイルのソースコードを読み、P9/P31/P39/P40/P42/P48の対策コードが含まれていることを確認する
2. 具体的な検索コマンド:

   ```bash
   # P9: beforeEachリセット確認
   grep -n "clearAllMocks\|resetAllMocks" apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts

   # P39: userEvent未使用確認
   grep -n "userEvent" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx

   # P42: trim()バリデーション確認
   grep -n "trim\|WHITESPACE\|スペースのみ" apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts
   ```

### Step 5: セキュリティテスト検証

1. Sender検証テストの正常系・異常系を確認する
2. エラーサニタイズテストのパターン（UNIX/Windows/トークン）を確認する
3. バリデーションエラーレスポンスに内部情報が含まれていないことを確認する

### Step 6: カバレッジ数値検証

1. Phase 9品質レポートからカバレッジ数値を読み取る
2. 基準値（Line 80%+, Branch 60%+, Function 80%+）と比較する
3. 未達の場合はMINOR/MAJORとして記録する

---

## ゲート判定基準

| 判定     | 条件                                                               | 対応                                         |
| -------- | ------------------------------------------------------------------ | -------------------------------------------- |
| PASS     | RV1-RV6の全チェック項目がOK                                        | Phase 11（手動テスト）へ進む                 |
| MINOR    | 軽微な改善点あり（命名不統一、ドキュメント不足等）                 | 未タスク仕様書に変換後Phase 11へ（省略不可） |
| MAJOR    | 重大な問題あり（要件未カバー、モック不整合、回帰発生等）           | 影響範囲に応じてPhase 1-5へ戻る              |
| CRITICAL | 要件自体に根本的な問題がある（セキュリティ欠陥、設計の前提崩壊等） | Phase 1へ戻り要件再確認                      |

### MINOR判定時の対応

- 指摘事項を全て未タスク仕様書（`tasks/unassigned-task/`）に変換する
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
- 関連仕様書に参照リンクを追加する
- 上記3ステップ完了後にPhase 11へ進む

### MAJOR判定時の戻り先判定基準

| 問題種別                       | 戻り先  |
| ------------------------------ | ------- |
| FR要件の欠落・誤り             | Phase 1 |
| テストアーキテクチャの構造問題 | Phase 2 |
| テスト実装の不備               | Phase 5 |
| カバレッジ未達                 | Phase 6 |

---

## レビュー結果テンプレート

```markdown
### レビュー結果

| 項目           | 内容                          |
| -------------- | ----------------------------- |
| レビュー実施日 | YYYY-MM-DD                    |
| レビュー担当   | Phase 10 レビューエージェント |
| 判定           | PASS/MINOR/MAJOR/CRITICAL     |

#### チェックリスト結果サマリ

| カテゴリ | 項目数 | OK  | NG  | 備考 |
| -------- | ------ | --- | --- | ---- |
| RV1      | 10     |     |     |      |
| RV2      | 7      |     |     |      |
| RV3      | 6      |     |     |      |
| RV4      | 4      |     |     |      |
| RV5      | 7      |     |     |      |
| RV6      | 5      |     |     |      |
| 合計     | 39     |     |     |      |

#### 指摘事項（該当する場合）

| #   | 重大度 | チェックID | 指摘内容 | 対応方針 |
| --- | ------ | ---------- | -------- | -------- |
| 1   |        |            |          |          |

#### MINOR指摘の未タスク変換（該当する場合）

| #   | 指摘内容 | 未タスク仕様書パス | task-workflow.md 残課題登録 | 関連仕様書リンク |
| --- | -------- | ------------------ | --------------------------- | ---------------- |
| 1   |          |                    |                             |                  |
```

---

## 参照資料

| 参照資料                | パス                                                                                                                    | 使用セクション               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義書      | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-1-requirements.md`                         | FR/NFR確認                   |
| Phase 2 設計書          | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md`                               | モック/TC設計確認            |
| Phase 5 実装書          | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-5-implementation.md`                       | Green調整結果確認            |
| TASK-10A-F 引き渡し設計 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`                                         | RT-01〜RT-07 突合            |
| TASK-10A-E 引き渡し条件 | `docs/30-workflows/completed-tasks/task-043a-ipc-contract-and-security-alignment/outputs/phase-10/handover-criteria.md` | sender/P42/エラー基準        |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                             | カバレッジ基準判定           |
| テストパターン          | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                       | モック整合性検証             |
| 状態管理仕様            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                            | store action / selector 確認 |
| エラー仕様              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                   | エラーコード検証             |
| タスク運用ルール        | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                                              | ゲート判定・未タスク変換     |
| IPCセキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                            | セキュリティテスト検証       |

---

## 成果物

| 成果物               | パス                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| 最終レビューレポート | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-10/final-review-report.md` |

---

## 統合テスト連携

| 連携対象      | レビュー観点                  | 判定への影響          |
| ------------- | ----------------------------- | --------------------- |
| Phase 5/9     | Green後実体と品質ゲートの一致 | RV2/RV3               |
| Phase 7       | カバレッジ達成値の維持        | RV4                   |
| Phase 11 予定 | 手動検証へ渡す確認ポイント    | PASS/MINOR の切り分け |

### 最終レビューレポート記載内容

| セクション         | 記載内容                                         |
| ------------------ | ------------------------------------------------ |
| レビュー結果       | 判定（PASS/MINOR/MAJOR/CRITICAL）と理由          |
| チェックリスト結果 | RV1-RV6の全項目のOK/NG判定                       |
| 指摘事項           | 各指摘の重大度、チェックID、内容、対応方針       |
| 未タスク変換記録   | MINOR指摘の未タスク仕様書パスと3ステップ完了状況 |
| テスト実行結果     | 全テストのPASS/FAIL件数と実行時間                |
| カバレッジ数値     | Line/Branch/Function の各値と基準値との比較      |

---

## 完了条件

- [ ] RV1-RV6の全チェック項目（39項目）に対して判定（OK/NG）が記入されている
- [ ] ゲート判定（PASS/MINOR/MAJOR/CRITICAL）が明示されている
- [ ] MINOR指摘がある場合、全指摘が未タスク仕様書に変換されている（3ステップ完了）
- [ ] MAJOR指摘がある場合、戻り先Phase（Phase 1/2/5/6）が明示されている
- [ ] 既存テストスイート全体の回帰確認が実施されている
- [ ] カバレッジ数値が基準値と比較され、結果が記録されている
- [ ] 最終レビューレポートがテンプレートに従って作成されている

---

## 次Phase

- **PASS判定時**: Phase 11（手動テスト）へ進む
- **MINOR判定時**: 未タスク仕様書変換完了後Phase 11へ進む（省略不可）
- **MAJOR判定時**: 影響範囲に応じてPhase 1/2/5/6へ戻る
- **CRITICAL判定時**: Phase 1へ戻り要件再確認
