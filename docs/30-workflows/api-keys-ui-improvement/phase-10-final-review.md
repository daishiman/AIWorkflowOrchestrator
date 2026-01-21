# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 10                      |
| Phase名    | 最終レビューゲート      |
| 前提Phase  | Phase 9（品質保証）     |
| 後続Phase  | Phase 11（手動テスト）  |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | api-keys-ui-improvement |

---

## 目的

要件・設計・品質の観点で最終確認を実施し、手動テストへ進む判断を行う。

## 背景

UI変更の完了後に、成果物が要求仕様と一致していることを最終的に確認する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件充足レビュー

**目的**: 要件と受け入れ基準を満たしていることを確認する

**実行手順**:

1. `outputs/phase-1/acceptance-criteria.md` を確認
2. 実装サマリーと照合
3. 判定結果を `outputs/phase-10/requirements-check.md` に記録

**期待される成果物**:

- `outputs/phase-10/requirements-check.md`

---

### タスク2: 設計準拠レビュー

**目的**: 設計書と実装の差分を確認する

**実行手順**:

1. `outputs/phase-2/design-document.md` を確認
2. ApiKeysSectionの実装と照合
3. 差分がある場合は記録
4. 結果を `outputs/phase-10/design-compliance.md` に記録

**期待される成果物**:

- `outputs/phase-10/design-compliance.md`

---

### タスク3: 最終レビュー判定

**目的**: 最終レビュー結果を判定する

**実行手順**:

1. 要件・設計・品質の結果を統合
2. 判定結果を `outputs/phase-10/final-review-result.md` に記録

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料          | パス                                                                       | 内容                              |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------- |
| APIキー設定UI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`         | APIキー設定と連携済み表示のUI仕様 |
| セキュリティ原則  | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | APIキーの取り扱いと表示制約       |
| APIエンドポイント | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`       | APIキー取得/登録/削除のAPI仕様    |

**前Phase成果物**

| 参照資料     | パス                                 | 内容     |
| ------------ | ------------------------------------ | -------- |
| 品質サマリー | `outputs/phase-9/quality-summary.md` | 品質結果 |

---

**依存Phase成果物**

| 参照資料         | パス                                         | 内容         |
| ---------------- | -------------------------------------------- | ------------ |
| Phase 1 要件定義 | `outputs/phase-1/requirements-definition.md` | 要件整理     |
| Phase 2 設計     | `outputs/phase-2/design-document.md`         | 設計書       |
| Phase 5 実装     | `outputs/phase-5/implementation-summary.md`  | 実装サマリー |

## 成果物

| 成果物           | パス                                      | 内容     |
| ---------------- | ----------------------------------------- | -------- |
| 要件充足確認     | `outputs/phase-10/requirements-check.md`  | 充足判定 |
| 設計準拠確認     | `outputs/phase-10/design-compliance.md`   | 準拠判定 |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テスト結果が品質サマリーに含まれていることを確認
- 設定画面の表示が実機で確認できる状態であることを確認

---

## 完了条件

- [ ] 要件充足レビューが完了している
- [ ] 設計準拠レビューが完了している
- [ ] 最終レビュー結果が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 10
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### 実行タスク

- タスク1:
- タスク2:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 9（品質保証）の完了
- **後続**: Phase 11（手動テスト）へ進む

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
| テスト設計の問題 | Phase 4（テスト作成） |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/api-keys-ui-improvement/phase-11-manual-test.md`
