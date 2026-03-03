# UT-UI-05A-SPEC-CONSISTENCY-001: useFileTree契約整合 - タスク指示書

## メタ情報

```yaml
issue_number: 946
```

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | UT-UI-05A-SPEC-CONSISTENCY-001                         |
| タスク名     | Phase 2/5 useFileTree 仕様統一                         |
| 分類         | 改善                                                   |
| 対象機能     | SkillEditorView useFileTree                            |
| 優先度       | 中                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 完了（2026-03-03 / UT-UI-05A-GETFILETREE-001内で収束） |
| 発見元       | Phase 12 再監査                                        |
| 発見日       | 2026-03-02                                             |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 2 設計書と Phase 5 実装で `useFileTree` の入力・出力契約に表現揺れがある。

### 1.2 問題点・課題

`filePaths` ベース記述と `getFileTree` ベース記述が混在し、実装判断が揺れる。

### 1.3 放置した場合の影響

後続実装時に誤ったAPI契約を参照し、再びドリフトが発生する。

## 2. 何を達成するか（What）

### 2.1 目的

`useFileTree` のIFを単一記述に統一し、仕様書間の表現ドリフトを解消する。

### 2.2 最終ゴール

Phase 2/5/12 と system specs が同一契約を参照している。

### 2.3 スコープ

#### 含むもの

`phase-2-design.md`、`phase-5-implementation.md`、`ui-ux-feature-components.md` の文言統一。

#### 含まないもの

新機能追加やUI挙動変更。

### 2.4 成果物

- 契約統一後の仕様差分
- 更新履歴追記

## 3. どのように実行するか（How）

### 3.1 前提条件

最新の `useFileTree.ts` を読み、実装契約を確定済みであること。

### 3.2 依存タスク

`UT-UI-05A-GETFILETREE-001` と並行可能。

### 3.3 必要な知識

React hooks、TypeScript型定義、Phaseドキュメント更新規約。

### 3.4 推奨アプローチ

実装コードを正本にして文書側を寄せる（コード優先同期）。

## 4. 実行手順

### Phase構成

契約確定 → 文書更新 → 検証。

### Phase 1: 契約確定

#### 目的

現実装の IF を正式契約として固定する。

#### 手順

1. `useFileTree.ts` の公開戻り値を確認する。
2. 不要な旧語彙（`filePaths`）を抽出する。
3. 正式語彙（`fileTree`, `selectFile`, `refreshTree`）へ置換方針を決める。

#### 成果物

契約一覧メモ。

#### 完了条件

統一対象の語彙が定義済み。

### Phase 2: 文書同期

#### 目的

関連仕様書を一括更新する。

#### 手順

1. ワークフロー文書の契約記述を更新する。
2. system spec (`ui-ux-feature-components.md`) を更新する。
3. 変更履歴へ反映する。

#### 成果物

文書差分。

#### 完了条件

`rg -n "filePaths"` で対象文書に旧語彙が残らない。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `useFileTree` 契約が1種類に統一される

### 品質要件

- [ ] 仕様書間で同一用語を使用する

### ドキュメント要件

- [ ] 変更履歴に統一理由を記録する

## 6. 検証方法

### テストケース

- 仕様書横断 grep で旧語彙残存チェック
- `verify-all-specs` 実行

### 検証手順

1. `rg -n "filePaths|getFileTree" docs/30-workflows/skill-editor-view`
2. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-editor-view`

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                       |
| ------------------ | ------ | -------- | -------------------------- |
| 旧語彙の見落とし   | 中     | 中       | grep検証を完了条件に固定   |
| 実装と文書の再乖離 | 中     | 低       | Phase 12で差分監査を必須化 |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-editor-view/phase-2-design.md`
- `docs/30-workflows/skill-editor-view/phase-5-implementation.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

### 参考資料

- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 2/5 で useFileTree の契約表現が揺れている。
```

### 補足事項

本タスクは文書整合に限定し、機能追加は行わない。
