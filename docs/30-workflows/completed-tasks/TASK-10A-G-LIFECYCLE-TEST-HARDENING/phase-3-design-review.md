# Phase 3: 設計レビュー - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                  |
| --------- | --------------------- |
| タスクID  | TASK-10A-G            |
| Phase     | 3                     |
| 名称      | 設計レビューゲート    |
| 依存Phase | Phase 2（設計）       |
| 次Phase   | Phase 4（テスト作成） |

---

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物に対して、テスト設計の妥当性、モック整合性、既存テストとの共存、品質ゲートの実現可能性を検証する。

## 実行タスク

- Task 1: Phase 1 要件と Phase 2 設計のトレーサビリティを監査する
- Task 2: モック構造と実コード契約の整合をレビューする
- Task 3: 既存テストとの重複・回帰リスクを評価する
- Task 4: Gate判定と戻り先条件を確定する

---

## レビュー対象成果物

| 成果物             | パス                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| Phase 1 要件定義書 | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-1-requirements.md` |
| Phase 2 設計書     | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md`       |

---

## レビューチェックリスト

### R1: 要件の完全性

| ID    | チェック項目                                                       | 判定 |
| ----- | ------------------------------------------------------------------ | ---- |
| R1-01 | FR-G01（Main IPC）の全項目がテストケースにマッピングされている     | -    |
| R1-02 | FR-G02（Renderer統合）の全項目がテストケースにマッピングされている | -    |
| R1-03 | FR-G03（品質ゲート）の全項目がテストケースにマッピングされている   | -    |
| R1-04 | NFR全項目に検証可能な定量基準が設定されている                      | -    |
| R1-05 | スコープIN/OUTの境界が曖昧でない                                   | -    |

### R2: テスト設計の妥当性

| ID    | チェック項目                                                                 | 判定 |
| ----- | ---------------------------------------------------------------------------- | ---- |
| R2-01 | 3層テスト構成（Layer 1/2/3）の責務分離が明確                                 | -    |
| R2-02 | 各テストケースのID（TC-Gxx-nnn）がFR要件にトレース可能                       | -    |
| R2-03 | テストケース数が受け入れ基準（14+10+4=28件）を満たす                         | -    |
| R2-04 | バリデーションテストがP42準拠の3段階を網羅している                           | -    |
| R2-05 | Sender検証テストが正常系と異常系の両方を含む                                 | -    |
| R2-06 | エラーサニタイズテストがファイルパス・トークン・スタックトレースを検証する   | -    |
| R2-07 | Renderer統合テストが create -> list -> analyze -> improve の全遷移を検証する | -    |

### R3: モック整合性

| ID    | チェック項目                                                                          | 判定 |
| ----- | ------------------------------------------------------------------------------------- | ---- |
| R3-01 | Layer 1 のモック構成が実際の `skillHandlers.ts` のインポート構造と一致する            | -    |
| R3-02 | Layer 2 の `electronAPI` 応答モックが実際の store action 下位依存の形状と一致する     | -    |
| R3-03 | Layer 2 が `testing-component-patterns.md` の real composition ハーネス方針に準拠する | -    |
| R3-04 | Layer 2 で Renderer から direct `window.electronAPI.skill.*` を期待値にしていない     | -    |
| R3-05 | Layer 3 の既存モック構成を変更していない                                              | -    |
| R3-06 | `beforeEach` / `afterEach` でハーネスと DOM が再初期化される設計（P9準拠）            | -    |

### R4: 既存テストとの共存

| ID    | チェック項目                                                              | 判定 |
| ----- | ------------------------------------------------------------------------- | ---- |
| R4-01 | 新規テストファイルが既存テストの実行に影響しない                          | -    |
| R4-02 | `ChatPanel.skill-management.test.tsx` への追加が既存テストを破壊しない    | -    |
| R4-03 | 既存の `skillCreatorHandlers.validation.test.ts` とスコープが重複しない   | -    |
| R4-04 | 既存の `skillCreatorHandlers.security.test.ts` とスコープが重複しない     | -    |
| R4-05 | `agentSlice.skill-lifecycle.test.ts`（Store単体）とテスト観点が重複しない | -    |

### R5: 品質ゲートの実現可能性

| ID    | チェック項目                                                                   | 判定 |
| ----- | ------------------------------------------------------------------------------ | ---- |
| R5-01 | 品質ゲートの5ステップ実行手順が再現可能                                        | -    |
| R5-02 | テスト実行が `apps/desktop/` ディレクトリからの実行を前提としている（P40準拠） | -    |
| R5-03 | happy-dom環境で `fireEvent` を使用し `userEvent` を使用していない（P39準拠）   | -    |
| R5-04 | 全テスト実行時間が30秒以内に収まる見込みがある                                 | -    |
| R5-05 | カバレッジ基準（Line 80%+, Branch 60%+）が達成可能                             | -    |

### R6: 教訓（Pitfall）の反映

| ID    | チェック項目                                                | 判定 |
| ----- | ----------------------------------------------------------- | ---- |
| R6-01 | P9（テスト間リーク）: `beforeEach` リセットが設計に含まれる | -    |
| R6-02 | P31（無限ループ）: 個別セレクタ使用が設計に含まれる         | -    |
| R6-03 | P39（happy-dom非互換）: `fireEvent` 使用が明記されている    | -    |
| R6-04 | P40（ディレクトリ依存）: 実行ディレクトリが明記されている   | -    |
| R6-05 | P42（trim漏れ）: 3段バリデーションテストが含まれている      | -    |
| R6-06 | P48（useShallow）: 派生セレクタの注意点が反映されている     | -    |

---

## レビュー観点

### 観点1: テスト網羅性

- `skill:create` ハンドラーの全分岐パス（正常系2 + バリデーション6 + エラー系4 + sender2 = 14パス）がテストケースでカバーされているか
- Renderer側の主要遷移（create -> list -> analyze -> improve）が store action / state transition として全て検証されているか
- エラーケースがMain IPC層とRenderer層の両方でテストされているか

### 観点2: モック整合性

- モックの返却値の型が実際のIPC契約と一致しているか
- `skill:create` の引数形式（`description: unknown, options: unknown` の2引数パターン）がモックに正しく反映されているか
- `sanitizeErrorMessage` の正規表現パターンがテストで検証されているか
- Layer 2 が TASK-10A-F の RT-01〜RT-07 を落とさずに引き継いでいるか

### 観点3: 既存テストとの共存

- 新規テスト追加により既存テストの実行時間が大幅に増加しないか
- `vi.mock` のスコープが他テストファイルに波及しないか
- モジュールスコープ変数の命名が既存テストと衝突しないか

---

## ゲート判定基準

| 判定              | 条件                                                     | 対応                  |
| ----------------- | -------------------------------------------------------- | --------------------- |
| PASS              | R1-R6 の全チェック項目がOK                               | Phase 4 へ進む        |
| MINOR             | R6（教訓反映）に1-2件の軽微な不足がある                  | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | R1（要件完全性）にFR/NFRの欠落がある                     | Phase 1 へ戻る        |
| MAJOR（設計問題） | R2-R5 に構造的な問題がある（モック不整合、テスト重複等） | Phase 2 へ戻る        |

---

## レビュー実施手順

### Step 1: 要件トレーサビリティ検証

1. Phase 1 の FR-G01/G02/G03 の全項目を列挙する
2. Phase 2 のテストケース一覧（TC-G01/G02/G03）との対応を確認する
3. 未カバーの要件項目がないことを検証する

### Step 2: モック構造の実コード突合

1. `apps/desktop/src/main/ipc/skillHandlers.ts` の `skill:create` ハンドラーのimport一覧を確認する
2. Phase 2 のモック定義が全importをカバーしていることを検証する
3. ハンドラーの引数形式（2引数: `description`, `options`）がモックに反映されていることを確認する

### Step 3: 既存テストとの重複チェック

1. `grep -rn "skill:create\|SKILL_CREATE" apps/desktop/src/**/__tests__/` で既存テストを検索する
2. 新規テストのスコープと既存テストのスコープを比較する
3. 重複するテスト観点がないことを確認する

### Step 4: Pitfall反映チェック

1. P9, P31, P39, P40, P42, P48 の対策が設計に含まれていることを1つずつ確認する
2. 不足があれば MINOR 指摘として記録する

---

## 参照資料

| 参照資料                | パス                                                                                                                    | 使用目的                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義書      | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-1-requirements.md`                         | FR/NFRの完全性確認         |
| Phase 2 設計書          | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md`                               | モック/テスト設計確認      |
| IPC API仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                    | `skill:create` 契約確認    |
| テストパターン          | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                       | Renderer/Store モック基準  |
| 状態管理仕様            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                            | Store action 境界確認      |
| 実装パターン            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                             | ChatPanel/selector設計基準 |
| IPCセキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                            | sender/P42確認             |
| TASK-10A-F 引き渡し設計 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`                                         | RT-01〜RT-07 突合          |
| TASK-10A-E 引き渡し条件 | `docs/30-workflows/completed-tasks/task-043a-ipc-contract-and-security-alignment/outputs/phase-10/handover-criteria.md` | sender/P42/エラー基準確認  |

---

## 成果物

| 成果物           | パス                                      | 説明                            |
| ---------------- | ----------------------------------------- | ------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | PASS/MINOR/MAJOR 判定と指摘一覧 |

---

## 統合テスト連携

| 連携対象 | 本Phaseで確定する内容                   | 次Phaseへの影響            |
| -------- | --------------------------------------- | -------------------------- |
| Layer 1  | sender/validation/error test の抜け漏れ | Phase 4 の TC-G01 作成範囲 |
| Layer 2  | ChatPanel 起点遷移と Store モック契約   | Phase 4 の TC-G02 作成範囲 |
| Layer 3  | 既存テスト追記の禁止境界                | Phase 4/5 の回帰防止条件   |

---

## レビュー結果テンプレート

```markdown
### レビュー結果

| 項目           | 内容             |
| -------------- | ---------------- |
| レビュー実施日 | YYYY-MM-DD       |
| レビュー担当   | SubAgent G3      |
| 判定           | PASS/MINOR/MAJOR |

#### チェックリスト結果サマリ

| カテゴリ | OK  | NG  | 備考 |
| -------- | --- | --- | ---- |
| R1       |     |     |      |
| R2       |     |     |      |
| R3       |     |     |      |
| R4       |     |     |      |
| R5       |     |     |      |
| R6       |     |     |      |

#### 指摘事項（該当する場合）

| #   | 重大度 | チェックID | 指摘内容 | 対応方針 |
| --- | ------ | ---------- | -------- | -------- |
| 1   |        |            |          |          |
```

---

## 完了条件

- [ ] R1-R6 の全チェック項目に対して判定（OK/NG）が記入されている
- [ ] ゲート判定（PASS/MINOR/MAJOR）が明示されている
- [ ] MINOR指摘がある場合、全指摘に対応方針が記載されている
- [ ] MAJOR指摘がある場合、戻り先Phase（Phase 1 or Phase 2）が明示されている
- [ ] レビュー結果がテンプレートに従って記録されている

---

## 次Phase

- **PASS判定時**: Phase 4（テスト作成）へ進む
- **MINOR判定時**: 指摘対応後 Phase 4 へ進む
- **MAJOR判定時**: Phase 1 または Phase 2 へ戻る
