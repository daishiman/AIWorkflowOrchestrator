# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 3                                        |
| Phase名    | 設計レビューゲート                       |
| 前提Phase  | Phase 2                                  |
| 後続Phase  | Phase 4                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-01-18                               |
| 機能名     | file-selector-accessibility-improvements |

---

## 目的

設計内容が要件とシステム仕様に整合していることをレビューし、次Phaseへ進む可否を判定する。

## 背景

フォーカス管理と ARIA 属性の設計が確定したため、要件との整合性とテスト計画の妥当性を確認する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク0: T-03-1 レビュー準備

**目的**: レビュー観点とチェックリストを整備する。

**実行手順**:

1. Phase 1 と Phase 2 の成果物を集約し、レビュー観点を整理する。
2. WCAG 2.1 AA の該当基準と設計内容の対応表を作成する。
3. レビューで確認する項目をチェックリスト化する。

**期待される成果物**:

- outputs/phase-3/review-checklist.md

---

### タスク1: T-03-2 レビュー実施

**目的**: 設計の妥当性をレビューし、判定を記録する。

**実行手順**:

1. アクセシビリティ設計とフォーカス管理設計をレビューする。
2. テスト設計が要件と一致しているか確認する。
3. 問題点を分類し、PASS/MINOR/MAJOR/CRITICAL を判定する。

**期待される成果物**:

- outputs/phase-3/design-review-report.md
- outputs/phase-3/decision-log.md

---

## 参照資料

依存Phase成果物:

| 参照資料             | パス                                       | 内容               |
| -------------------- | ------------------------------------------ | ------------------ |
| 要件定義書           | outputs/phase-1/requirements-definition.md | Phase 1 の要件定義 |
| 受け入れ基準         | outputs/phase-1/acceptance-criteria.md     | 受け入れ基準       |
| アクセシビリティ設計 | outputs/phase-2/accessibility-design.md    | ARIA 属性設計      |
| フォーカス管理設計   | outputs/phase-2/focus-management-design.md | フォーカス設計     |
| テスト設計           | outputs/phase-2/test-design.md             | テスト計画         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                        | 内容                                                    |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md`  | FileSelector 構成、キーボード操作、アクセシビリティ要件 |
| UI/UXコンポーネント      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | WCAG 2.1 AA 対応方針とフォーカス管理                    |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略と jest-axe 指針                              |

---

## 成果物

| 成果物                 | パス                                    | 内容           |
| ---------------------- | --------------------------------------- | -------------- |
| レビューチェックリスト | outputs/phase-3/review-checklist.md     | レビュー観点   |
| 設計レビュー報告書     | outputs/phase-3/design-review-report.md | 判定結果と指摘 |
| 決定ログ               | outputs/phase-3/decision-log.md         | 判定と対応方針 |

---

## 統合テスト連携（Phase 1〜11は必須）

- Phase 2 で定義した統合テスト観点がレビューに含まれていることを確認する

---

## 完了条件

- [ ] レビュー観点が整理されている
- [ ] レビュー報告書に判定が記載されている
- [ ] 指摘と対応方針が決定ログに記載されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 3
```

---

## 依存関係

- **前提**: Phase 2 が完了していること
- **後続**: Phase 4 へ進む

---

## レビューゲート（Phase 3, 10 の場合）

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 3 実行記録

### 実行タスク

- T-03-1 レビュー準備: {result}
- T-03-2 レビュー実施: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-4-test-creation.md`
