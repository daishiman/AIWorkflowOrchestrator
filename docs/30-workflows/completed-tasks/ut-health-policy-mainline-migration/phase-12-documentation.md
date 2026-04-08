# Phase 12: ドキュメント更新

## タスク情報

- **タスクID**: UT-HEALTH-POLICY-MAINLINE-MIGRATION-001
- **タスク名**: useMainlineExecutionAccess の healthPolicy 移行
- **フェーズ**: Phase 12 - ドキュメント更新
- **前提フェーズ**: Phase 11（手動テスト）完了

---

## 成果物一覧

| ファイル                                        | 説明                                    |
| ----------------------------------------------- | --------------------------------------- |
| `outputs/phase-12/implementation-guide.md`      | 実装ガイド（概念説明 + 技術的詳細）     |
| `outputs/phase-12/system-spec-update.md`        | システム仕様書更新記録                  |
| `outputs/phase-12/doc-update-history.md`        | ドキュメント更新履歴                    |
| `outputs/phase-12/untasked-detection-report.md` | 未タスク検出レポート（0件でも出力必須） |
| `outputs/phase-12/skill-feedback-report.md`     | スキルフィードバックレポート            |

---

## Task 1: 実装ガイド作成

**出力先**: `outputs/phase-12/implementation-guide.md`

### Part 1: 中学生レベル概念説明

以下の内容を中学生でも理解できる言葉で説明すること。

- **healthPolicy とは何か**
  - 「AIへの接続状態と APIキーの状態から、今どんな問題があるか判断するルール集」のようなものであることを説明する
  - 比喩・例え話を使って説明する

- **リファクタリングとは何か**
  - コードの「動き」を変えずに「書き方」をきれいにする作業であることを説明する

- **なぜ独自ロジックをなくすのか**
  - 「同じことを2か所に書くと、どちらかを直し忘れてバグが起きる」という問題を防ぐためであることを説明する

- **resolveHealthPolicy() の役割**
  - 接続状態・APIキー有効性などの情報を受け取り、統一されたポリシーオブジェクトを返す関数であることを説明する

### Part 2: 技術的詳細

以下の技術的内容を詳細に記述すること。

- **変更の概要**
  - 変更前後のコード比較
  - 削除した独自ロジック（`apiKeyDegraded` 算出コード）の説明

- **resolveHealthPolicy() の入出力仕様**
  - 引数の型と各パラメータの意味
  - 戻り値の型（`HealthPolicy`）の説明

- **buildMainlineExecutionAccessState() との連携**
  - `healthPolicy` パラメータを追加した理由
  - 追加前後の関数シグネチャの変化

- **インポートパス**
  - `@repo/shared/types` からのインポート方法

---

## Task 2: システム仕様書更新

**出力先**: `outputs/phase-12/system-spec-update.md`

### Step 1-A: タスク完了記録

以下の情報を記録すること。

```markdown
## タスク完了記録

- タスクID: UT-HEALTH-POLICY-MAINLINE-MIGRATION-001
- タスク名: useMainlineExecutionAccess の healthPolicy 移行
- 完了日時: （記入する）
- 担当: （記入する）
- 変更ファイル: apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts
```

### Step 1-B: 実装状況テーブル更新

`docs/` 配下の関連仕様書に存在する実装状況テーブルがある場合、以下の項目を更新すること。

| 列名       | 更新内容                              |
| ---------- | ------------------------------------- |
| ステータス | `pending` → `completed`               |
| 完了日     | 実際の完了日を記入                    |
| 備考       | `resolveHealthPolicy 統合完了` を記入 |

対象仕様書が存在しない場合は「対象なし」と記録すること。

### Step 1-C: 関連タスクテーブル更新

本タスクと関連するタスク（例: `buildMainlineExecutionAccessState` の型定義変更タスク）が存在する場合、そのテーブルを更新すること。

関連タスクが存在しない場合は「関連タスクなし」と記録すること。

### Step 2: 条件付き更新

以下の条件に該当する場合のみ更新を行うこと。

- **条件**: `resolveHealthPolicy()` または `HealthPolicy` の型定義が `packages/shared/src/` 配下のドキュメントに記載されている場合
- **更新内容**: 利用箇所として `useMainlineExecutionAccess.ts` を追記する

---

## Task 3: ドキュメント更新履歴作成

**出力先**: `outputs/phase-12/doc-update-history.md`

以下のフォーマットで作成すること。

```markdown
# ドキュメント更新履歴

## UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

| 更新日時     | 更新ファイル                             | 更新内容 | 担当         |
| ------------ | ---------------------------------------- | -------- | ------------ |
| （記入する） | phase-5-implementation.md                | 新規作成 | （記入する） |
| （記入する） | phase-11-manual-test.md                  | 新規作成 | （記入する） |
| （記入する） | phase-12-documentation.md                | 新規作成 | （記入する） |
| （記入する） | phase-13-pr-creation.md                  | 新規作成 | （記入する） |
| （記入する） | outputs/phase-11/manual-test-result.md   | 新規作成 | （記入する） |
| （記入する） | outputs/phase-12/implementation-guide.md | 新規作成 | （記入する） |
| （記入する） | outputs/phase-12/system-spec-update.md   | 新規作成 | （記入する） |
```

---

## Task 4: 未タスク検出レポート作成

**出力先**: `outputs/phase-12/untasked-detection-report.md`

> **重要**: 未タスクが 0 件であっても必ず出力すること。

以下の観点で未タスクを検出すること。

1. `resolveHealthPolicy()` を使うべき他のフックが存在するか
2. `apiKeyDegraded` の独自算出ロジックが他のファイルにも残っていないか
3. `buildMainlineExecutionAccessState()` の型定義が `healthPolicy` に対応しているか（未対応なら型定義更新タスクが必要）
4. テストカバレッジに不足がないか

**フォーマット**:

```markdown
# 未タスク検出レポート

## サマリー

- 検出日時: （記入する）
- 検出件数: （記入する）

## 検出一覧

<!-- 未タスクが存在する場合 -->

| No. | 内容     | 優先度   | 推奨アクション |
| --- | -------- | -------- | -------------- |
| 1   | （内容） | 高/中/低 | （アクション） |

<!-- 未タスクが 0 件の場合 -->

検出なし

## 調査範囲

- （調査したファイル・ディレクトリを列挙する）
```

---

## Task 5: スキルフィードバックレポート作成

**出力先**: `outputs/phase-12/skill-feedback-report.md`

本タスクの実施を通じて得られた知見・改善点を記録すること。

**フォーマット**:

```markdown
# スキルフィードバックレポート

## タスクID: UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## 良かった点

- （記入する）

## 改善点・気づき

- （記入する）

## 今後のタスクへの推奨事項

- （記入する）

## task-specification-creator スキルへのフィードバック

- （記入する）
```
