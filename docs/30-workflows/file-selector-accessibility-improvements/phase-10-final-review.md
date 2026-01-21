# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 10                                       |
| Phase名    | 最終レビューゲート                       |
| 前提Phase  | Phase 9                                  |
| 後続Phase  | Phase 11                                 |
| ステータス | 未実施                                   |
| 作成日     | 2026-01-18                               |
| 機能名     | file-selector-accessibility-improvements |

---

## 目的

要件と成果物が揃っていることを確認し、最終レビューの判定を行う。

## 背景

品質保証の結果が揃ったため、最終的なレビューゲートを通過する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク0: T-10-1 最終レビュー

**目的**: 要件と成果物の整合性を最終確認する。

**実行手順**:

1. Phase 1 の受け入れ基準と Phase 5 の実装内容を照合する。
2. Phase 9 の品質報告を確認し、重大な未解決事項がないか確認する。
3. 最終レビュー報告と判定を記録する。

**期待される成果物**:

- outputs/phase-10/final-review-report.md
- outputs/phase-10/final-review-checklist.md

---

## 参照資料

依存Phase成果物:

| 参照資料             | パス                                    | 内容           |
| -------------------- | --------------------------------------- | -------------- |
| 受け入れ基準         | outputs/phase-1/acceptance-criteria.md  | Phase 1 の基準 |
| アクセシビリティ設計 | outputs/phase-2/accessibility-design.md | Phase 2 の設計 |
| a11y 変更サマリー    | outputs/phase-5/a11y-change-summary.md  | Phase 5 の実装 |
| 品質報告             | outputs/phase-9/quality-report.md       | Phase 9 の結果 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                       | 内容                 |
| ------------------------ | -------------------------------------------------------------------------- | -------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | UI 仕様              |
| UI/UXコンポーネント      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`    | アクセシビリティ要件 |

---

## 成果物

| 成果物                     | パス                                       | 内容           |
| -------------------------- | ------------------------------------------ | -------------- |
| 最終レビュー報告           | outputs/phase-10/final-review-report.md    | 判定と指摘事項 |
| 最終レビューチェックリスト | outputs/phase-10/final-review-checklist.md | 確認項目       |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テスト結果が最終レビュー報告に記載されていることを確認する

---

## 完了条件

- [ ] 最終レビュー報告が作成されている
- [ ] 判定が記録されている
- [ ] 受け入れ基準との差分が整理されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 10
```

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11 へ進む

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
## Phase 10 実行記録

### 実行タスク

- T-10-1 最終レビュー: {result}

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

`phase-11-manual-test.md`
