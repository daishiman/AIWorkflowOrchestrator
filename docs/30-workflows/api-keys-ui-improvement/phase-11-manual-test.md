# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 11                             |
| Phase名    | 手動テスト検証                 |
| 前提Phase  | Phase 10（最終レビューゲート） |
| 後続Phase  | Phase 12（ドキュメント更新）   |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | api-keys-ui-improvement        |

---

## 目的

実機でAPIキー設定の表示と操作を確認し、視覚フォーマットの統一が達成されていることを検証する。

## 背景

UI変更は画面上の見え方に影響するため、手動での最終確認が必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: UI表示確認

**目的**: 登録済み表示の見た目を確認する

**実行手順**:

1. 設定画面を開く
2. APIキー登録済みの状態を表示
3. 緑の枠線とチェック付き「登録済み」バッジを確認
4. 連携サービス表示と同じフォーマットであることを確認

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

### タスク2: 操作確認

**目的**: 編集/削除の操作が維持されていることを確認する

**実行手順**:

1. 登録済みカードの「編集」ボタンをクリック
2. 編集モーダルが開くことを確認
3. 「削除」ボタンをクリックし確認ダイアログが表示されることを確認
4. 結果を記録

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

### タスク3: 未登録状態の確認

**目的**: 未登録状態で登録済みスタイルが表示されないことを確認する

**実行手順**:

1. APIキー未登録の状態を表示
2. 緑の枠線と登録済みバッジが表示されないことを確認
3. 結果を記録

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

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

| 参照資料         | パス                                      | 内容         |
| ---------------- | ----------------------------------------- | ------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | レビュー判定 |

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

## 成果物

| 成果物         | パス                                     | 内容         |
| -------------- | ---------------------------------------- | ------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 実機確認結果 |
| 発見課題       | `outputs/phase-11/discovered-issues.md`  | 問題点記録   |

---

## 統合テスト連携（Phase 1〜11は必須）

- 手動テスト結果を統合テスト観点の補足情報として記録
- 設定画面の表示差分を統合テスト結果に反映

---

## 完了条件

- [ ] 手動テスト結果が記録されている
- [ ] 発見課題が整理されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 11
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

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

- **前提**: Phase 10（最終レビューゲート）の完了
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/api-keys-ui-improvement/phase-12-documentation.md`
