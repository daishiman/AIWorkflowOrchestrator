# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 3                                    |
| Phase名    | 設計レビュー                         |
| 機能名     | refs-500line-split-maintenance       |
| 前提Phase  | Phase 2                              |
| 次Phase    | Phase 4: テスト作成（PASS/MINOR 時） |
| ステータス | pending                              |
| 作成日     | 2026-04-07                           |

## 目的

Phase 2 で設計した分離計画を、設計原則・命名規則・副作用の観点からレビューし、Phase 4 への進行可否を判定する。

## ゲート判定基準

| 評価     | 条件                                             | 次アクション   |
| -------- | ------------------------------------------------ | -------------- |
| PASS     | CRITICAL/MAJOR なし、MINOR は記録してから進む    | Phase 4 へ進む |
| MINOR    | 軽微な問題のみ（命名の一貫性など）。修正後に進む | 修正後 Phase 4 |
| MAJOR    | 分離設計の論理的矛盾や大規模な見落とし           | Phase 2 へ戻る |
| CRITICAL | 設計方針の根本的な問題                           | Phase 2 へ戻る |

## レビューチェックリスト

### 1. サイズ基準の確認

- [ ] 全ての分離後ファイルが 499 行以内に収まるか設計されているか
- [ ] 親ファイルが目次・概要レベルに縮小されているか

### 2. 命名規則の確認

- [ ] 既存のファイル命名パターン（`*-core.md` / `*-reference.md` 等）と整合しているか
- [ ] 新規ファイル名が既存ファイルと重複しないか
- [ ] ケバブケースで命名されているか

### 3. 参照整合性の確認

- [ ] SKILL.md の更新設計が全ての新規ファイルをカバーしているか
- [ ] `aiworkflow-requirements/indexes/topic-map.md` の再生成が計画に含まれているか
- [ ] `aiworkflow-requirements/indexes/keywords.json` の再生成が計画に含まれているか
- [ ] `task-specification-creator/indexes/topic-map.md` の再生成が計画に含まれているか
- [ ] `task-specification-creator/indexes/keywords.json` の再生成が計画に含まれているか
- [ ] 既存の内部リンク（`[...](references/xxx.md)` 形式）の更新が計画されているか

### 4. 副作用の確認

- [ ] コードファイルへの影響がゼロであることが確認されているか
- [ ] `.agents/skills/` mirror の同期計画が含まれているか
- [ ] LOGS.md 更新が計画されているか

### 5. 優先順位の確認

- [ ] 最高優先ファイル（2,000 行超）が最初に処理されるか
- [ ] 並列実行グループが適切に設計されているか

## 参照資料

| 資料名     | パス                                    | 説明         |
| ---------- | --------------------------------------- | ------------ |
| 分離計画書 | `outputs/phase-2/split-plan.md`         | レビュー対象 |
| 命名規則書 | `outputs/phase-2/naming-conventions.md` | レビュー対象 |

## 成果物

| 成果物             | パス                                    | 説明                 |
| ------------------ | --------------------------------------- | -------------------- |
| 設計レビューゲート | `outputs/phase-3/design-review-gate.md` | PASS/FAIL 判定と根拠 |

## 完了条件

- [ ] 全チェックリスト項目を評価した
- [ ] PASS/MINOR/MAJOR/CRITICAL の判定が記録されている
- [ ] MINOR 指摘事項があれば未タスク候補として記録されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 設計レビューゲートが作成されている

## 次Phase

PASS/MINOR → [Phase 4: テスト作成](./phase-4-test-creation.md)

MAJOR/CRITICAL → [Phase 2: 設計](./phase-2-design.md)（再設計）
