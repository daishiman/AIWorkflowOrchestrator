# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 3                                  |
| 機能名   | store-lifecycle-integration-design |
| タスクID | TASK-10A-E-C                       |
| 作成日   | 2026-03-06                         |

## 目的

Phase 1（要件定義）と Phase 2（設計）の妥当性を多角的に検証し、P31 対策・TASK-10A-F 境界・状態遷移の完全性を確認する。

## 実行タスク

- 要件と設計の整合性を検証する
- P31 対策の十分性を検証する
- TASK-10A-F 境界の明確性を検証する
- 状態遷移の完全性を検証する
- PASS/MINOR/MAJOR 判定を下す

## 参照資料

| 参照資料       | パス                                                                                        | 使用目的                        |
| -------------- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 成果物 | `phase-1-requirements.md`                                                                   | 要件の正本                      |
| Phase 2 成果物 | `phase-2-design.md`                                                                         | 設計の正本                      |
| 状態管理仕様   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | selector/action 分離と P31 対策 |
| Skill API      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | store action の戻り値契約       |
| 実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | React + store の責務分離        |
| エラー仕様     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | UI 表示に渡すエラー分類         |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 状態遷移回帰を防ぐ品質ゲート    |

## 実行手順

### Step 1: 要件-設計トレーサビリティ検証

Phase 1 の各要件が Phase 2 の設計に反映されているか確認する。

| 要件  | Phase 1 定義                           | Phase 2 設計対応                            | 判定 |
| ----- | -------------------------------------- | ------------------------------------------- | ---- |
| FR-1  | Import ライフサイクル状態管理（5状態） | Step 2 で importSkill フロー内で全状態使用  | OK   |
| FR-2  | Selector 算出責務（3カテゴリ）         | Step 1 で 7 セレクタ定義（うち 1 新規）     | OK   |
| FR-3  | Action 責務分離（4アクション）         | Step 2 で 4 アクションの内部フロー定義      | OK   |
| FR-4  | Import 成功後の一覧即時再計算          | Step 2.1 の SUCCESS フローで単一 set() 実現 | OK   |
| FR-5  | Import 失敗時のエラー保持              | Step 2.1 の FAILURE フローで定義            | OK   |
| NFR-1 | P31 無限ループ回避                     | Step 5 で推奨/禁止パターンを明示            | OK   |
| NFR-2 | 連打防止                               | Step 2.1 の PRE-CONDITION で定義            | OK   |
| NFR-3 | Idempotency Guard                      | Step 3.3 で専用フローを定義                 | OK   |
| NFR-4 | 再レンダー最適化                       | Step 1.2 で useMemo 方針決定                | OK   |

### Step 2: P31 対策検証チェックリスト

| #   | 検証項目                                                               | 結果 |
| --- | ---------------------------------------------------------------------- | ---- |
| 1   | 全セレクタが個別 Hook（`useXxx`）として定義されているか                | OK   |
| 2   | 合成 Hook（`useSkillStore()` 等）が設計に含まれていないか              | OK   |
| 3   | アクション参照が Zustand 安定参照を前提としているか                    | OK   |
| 4   | `useEffect` 依存配列に合成 Hook の戻り値が含まれていないか             | OK   |
| 5   | インラインオブジェクト生成セレクタが禁止パターンに明示されているか     | OK   |
| 6   | 命名規約（`use{State}{Domain}` / `use{Verb}{Domain}`）に準拠しているか | OK   |
| 7   | 派生セレクタの再計算戦略（useMemo）が定義されているか                  | OK   |

**P31 対策判定**: arch-state-management.md の個別セレクタパターンと整合。既存の命名規約（ドメインサフィックス必須ルール）にも準拠。

### Step 3: TASK-10A-F 境界検証

| #   | 検証項目                                                       | 結果 |
| --- | -------------------------------------------------------------- | ---- |
| 1   | Import 操作が create/analyze 状態フィールドを変更しないこと    | OK   |
| 2   | Create/Analyze 操作が import 状態フィールドを変更しないこと    | OK   |
| 3   | `skillError` の共有方針（後勝ち）が明文化されているか          | OK   |
| 4   | 一覧再計算の交差点（import 後 vs create 後）が定義されているか | OK   |
| 5   | 責務グループの分類表が作成されているか                         | OK   |

**境界判定**: Import/Create/Analyze の 3 グループが明確に分離されている。`skillError` の共有は許容範囲内。将来的な分離方針も言及されている。

### Step 4: 状態遷移完全性検証

| #   | 遷移パス                           | 定義状況               | 結果 |
| --- | ---------------------------------- | ---------------------- | ---- |
| 1   | IDLE -> IMPORTING（正常 import）   | Step 3.1               | OK   |
| 2   | IMPORTING -> SUCCESS               | Step 3.1               | OK   |
| 3   | IMPORTING -> ERROR                 | Step 3.1               | OK   |
| 4   | ERROR -> IDLE（clearSkillError）   | Step 3.1               | OK   |
| 5   | IDLE -> IDLE（idempotency guard）  | Step 3.3               | OK   |
| 6   | IMPORTING -> IMPORTING（連打防止） | Step 2.1 PRE-CONDITION | OK   |

**状態遷移判定**: 全遷移パスが定義されている。不到達状態なし。

### Step 5: 既存実装との互換性検証

| #   | 検証項目                                                | 結果                                         |
| --- | ------------------------------------------------------- | -------------------------------------------- |
| 1   | 既存の agentSlice 状態フィールドとの名前衝突がないか    | OK                                           |
| 2   | 既存の個別セレクタ（store/index.ts）との重複がないか    | OK（新規は useFilteredAvailableSkills のみ） |
| 3   | 既存の importSkill アクションのフローと矛盾しないか     | OK（既存実装を正本として設計）               |
| 4   | removeSkill アクションが既存の removeSkill と整合するか | OK                                           |

### Step 6: エラーハンドリング検証

| #   | 検証項目                                                  | 結果 |
| --- | --------------------------------------------------------- | ---- |
| 1   | エラー分類が error-handling.md のカテゴリ体系と整合するか | OK   |
| 2   | エラー保持と表示の責務分離が定義されているか              | OK   |
| 3   | エラークリアのタイミングと方法が定義されているか          | OK   |

### Step 7: レビュー指摘事項

#### MINOR 指摘

| #   | 指摘内容                                                                                                  | 対応方針                                   |
| --- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| M1  | `useFilteredAvailableSkills` を「コンポーネント内 useMemo」とした場合、store テストでカバーされないリスク | コンポーネントテストで担保。Phase 4 で明示 |
| M2  | `skillError` 共有の後勝ち方式は、同時発生時にエラーが上書きされるリスクがある                             | 現時点では許容。将来分離は未タスク化候補   |

#### MAJOR 指摘

なし。

## 統合テスト連携

Phase 4（テスト作成）で以下のレビュー結果を反映する:

- M1: `useFilteredAvailableSkills` のコンポーネントテストを Phase 4 で設計する
- 全トレーサビリティ項目（FR-1 ~ FR-5, NFR-1 ~ NFR-4）に対応するテストケースを設計する

## 多角的チェック観点

| 観点             | 確認内容                                          | 結果 |
| ---------------- | ------------------------------------------------- | ---- |
| 要件-設計整合性  | Phase 1 の全要件が Phase 2 で設計されているか     | OK   |
| P31 対策十分性   | arch-state-management.md の全条件を満たしているか | OK   |
| 境界明確性       | TASK-10A-F との責務境界に曖昧な点がないか         | OK   |
| 状態遷移完全性   | 全遷移パスが定義され、不到達状態がないか          | OK   |
| 既存互換性       | 既存の agentSlice と矛盾しないか                  | OK   |
| エラー設計整合性 | error-handling.md のカテゴリ体系と整合するか      | OK   |

## PASS/MINOR/MAJOR 判定基準

| 判定              | 条件                                       |
| ----------------- | ------------------------------------------ |
| PASS              | 全検証項目 OK、指摘なし                    |
| MINOR             | 機能に影響しない改善指摘あり（後続対応可） |
| MAJOR（要件問題） | 要件定義に不備があり Phase 1 へ差戻し      |
| MAJOR（設計問題） | 設計に重大な欠陥があり Phase 2 へ差戻し    |

## レビュー判定

**判定: MINOR**

MINOR 指摘 2 件（M1, M2）は機能に影響しない。M1 は Phase 4 のテスト設計で対応する。M2 は将来的な分離の検討を未タスク候補として記録する。Phase 4 へ進行可能。

## 成果物

| 成果物       | パス                       | 説明           |
| ------------ | -------------------------- | -------------- |
| 設計レビュー | `phase-3-design-review.md` | 本ドキュメント |

## 完了条件

- [x] 要件-設計トレーサビリティが全項目 OK で検証されている
- [x] P31 対策が 7 項目のチェックリストで検証されている
- [x] TASK-10A-F 境界が 5 項目で検証されている
- [x] 状態遷移の完全性が 6 パスで検証されている
- [x] 既存実装との互換性が 4 項目で検証されている
- [x] エラーハンドリングが 3 項目で検証されている
- [x] PASS/MINOR/MAJOR 判定が下されている（MINOR: M1, M2）
- [x] MINOR 指摘の対応方針が記載されている

## 次の Phase

Phase 4: テスト作成 (`phase-4-test-creation.md`)
