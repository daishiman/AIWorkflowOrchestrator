# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 12                      |
| Phase名    | ドキュメント更新        |
| 前提Phase  | Phase 11（手動テスト）  |
| 後続Phase  | Phase 13（PR作成）      |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | api-keys-ui-improvement |

---

## 目的

実装内容をドキュメント化し、変更履歴と未タスク検出結果を記録する。

## 背景

UI変更は画面仕様に影響するため、実装ガイドと変更履歴の更新が必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: 実装内容を2パート構成で整理する

**実行手順**:

1. Part 1（概念的説明）: 連携サービスとAPIキー表示の統一目的を記述
2. Part 2（技術的詳細）: ApiKeysSectionの変更点とスタイル適用箇所を記述
3. `outputs/phase-12/implementation-guide.md` に保存

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: ドキュメント変更履歴作成

**目的**: 更新したファイル一覧を記録する

**実行手順**:

1. Phase 12で作成・更新したファイルを列挙
2. `outputs/phase-12/document-changelog.md` を作成

**期待される成果物**:

- `outputs/phase-12/document-changelog.md`

---

### タスク3: 未タスク検出レポート作成

**目的**: 未解決タスクの有無を記録する

**実行手順**:

1. Phase 11の発見課題とテスト結果を確認
2. 未タスクがない場合でも「検出タスクなし」を明記
3. `outputs/phase-12/unassigned-task-report.md` を作成

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

### タスク4: システム仕様更新判断

**目的**: aiworkflow-requirements更新が必要かを判断し記録する

**実行手順**:

1. `spec-update-workflow.md` の判断基準を確認
2. 仕様変更の有無を判定
3. 判定結果を `outputs/phase-12/spec-update-decision.md` に記録
4. 仕様更新が必要な場合は該当仕様を更新

**期待される成果物**:

- `outputs/phase-12/spec-update-decision.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料          | パス                                                                       | 内容                              |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------- |
| APIキー設定UI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`         | APIキー設定と連携済み表示のUI仕様 |
| セキュリティ原則  | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | APIキーの取り扱いと表示制約       |
| APIエンドポイント | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`       | APIキー取得/登録/削除のAPI仕様    |

**仕様更新ガイド**

| 参照資料     | パス                                                                           | 内容                       |
| ------------ | ------------------------------------------------------------------------------ | -------------------------- |
| 更新判断基準 | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | システム仕様更新判断フロー |

**前Phase成果物**

| 参照資料       | パス                                     | 内容       |
| -------------- | ---------------------------------------- | ---------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | テスト結果 |
| 発見課題       | `outputs/phase-11/discovered-issues.md`  | 課題一覧   |

---

**依存Phase成果物**

| 参照資料                 | パス                                        | 内容         |
| ------------------------ | ------------------------------------------- | ------------ |
| Phase 2 設計             | `outputs/phase-2/design-document.md`        | 設計書       |
| Phase 5 実装             | `outputs/phase-5/implementation-summary.md` | 実装サマリー |
| Phase 6 テスト拡充       | `outputs/phase-6/test-expansion-result.md`  | 拡充結果     |
| Phase 7 カバレッジ確認   | `outputs/phase-7/gate-result.md`            | ゲート結果   |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-log.md`        | 変更記録     |
| Phase 9 品質保証         | `outputs/phase-9/quality-summary.md`        | 品質まとめ   |
| Phase 10 最終レビュー    | `outputs/phase-10/final-review-result.md`   | レビュー判定 |

## 成果物

| 成果物               | パス                                         | 内容           |
| -------------------- | -------------------------------------------- | -------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`   | 実装の解説     |
| ドキュメント変更履歴 | `outputs/phase-12/document-changelog.md`     | 更新一覧       |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-report.md` | 未タスク一覧   |
| 仕様更新判断         | `outputs/phase-12/spec-update-decision.md`   | 更新要否の記録 |

---

## 完了条件

- [ ] 実装ガイドが作成されている
- [ ] ドキュメント変更履歴が作成されている
- [ ] 未タスクレポートが作成されている
- [ ] 仕様更新判断が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 12
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

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

- **前提**: Phase 11（手動テスト）の完了
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/api-keys-ui-improvement/phase-13-pr-creation.md`
