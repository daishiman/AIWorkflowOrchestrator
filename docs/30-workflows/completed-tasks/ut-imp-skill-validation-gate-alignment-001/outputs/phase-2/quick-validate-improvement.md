# quick_validate.js 改善案設計

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| タスクID | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001    |
| Phase    | 2                                             |
| 作成日   | 2026-02-26                                    |
| 目的     | 大規模 reference スキル向けの改善案を設計する |

## 1. 現状の課題

### 1.1 課題の概要

`aiworkflow-requirements` は `references/` 配下に 150 ファイル以上を持つ大規模仕様スキルである。`quick_validate.js` を実行すると、SKILL.md からリンクされていない reference ファイルごとに1件の Warning が出力され、合計 149件の Warning が発生する。

### 1.2 問題の影響

| 影響             | 詳細                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| Error の埋没     | 149件の Warning 出力の中に Error が混在した場合、目視での識別が困難になる |
| 判断コストの増大 | Phase 12 実行者が Warning を1件ずつ確認して分類する作業コストが高い       |
| 実行ログの肥大化 | `--verbose` 出力が非常に長くなり、ターミナルのスクロール量が増大する      |
| 前回比の算出困難 | 大量の Warning から前回との件数差分を手動で算出する作業は非実用的         |

### 1.3 根本原因

`quick_validate.js` は全 reference ファイルに対して均等に SKILL.md リンクチェックを行う設計である。Progressive Disclosure パターン（インデックス経由の参照）を前提とした大規模スキルに対するチェック緩和の仕組みがない。

## 2. 改善案の比較

| 改善案               | 内容                                                                                                              | メリット                                                         | デメリット                                                                              | 実装コスト |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| A: 要約表示          | Warning を種別ごとにグループ化し、サマリ行（例: 「参照リンク警告: 149件」）で出力する                             | 出力の可読性が大幅に向上する。Error の埋没を防止できる           | 個別の Warning を特定するには `--verbose` の追加操作が必要になる                        | 低         |
| B: `--strict` モード | デフォルトで Warning を抑制し、`--strict` オプション指定時のみ全 Warning を表示する                               | 通常実行時の出力ノイズがゼロになる                               | `--strict` なしでは Warning が全く見えなくなるため、新規 Warning の見落としリスクがある | 中         |
| C: 除外設定ファイル  | `.skillvalidaterc` 等の設定ファイルで許容 Warning パターン（正規表現）を指定し、マッチする Warning を非表示にする | スキルごとのカスタマイズが可能。許容パターンを明示的に管理できる | 設定ファイルの管理コストが発生する。全スキルに設定ファイルの配置が必要                  | 高         |

## 3. 推奨案の決定

### 推奨: 案 A（要約表示）

### 3.1 選定根拠

| 評価軸            | 案 A（要約表示）                         | 案 B（--strict）                            | 案 C（除外設定）                                  |
| ----------------- | ---------------------------------------- | ------------------------------------------- | ------------------------------------------------- |
| 実装コスト        | 低（出力フォーマットの変更のみ）         | 中（CLI オプション追加 + 条件分岐）         | 高（設定ファイル解析 + 正規表現マッチ）           |
| 適用範囲          | 全スキルに統一適用可能                   | 全スキルに統一適用可能                      | スキルごとに設定が必要                            |
| 既存互換          | Warning の内容は保持（表示形式のみ変更） | デフォルト動作が変わる（Warning 非表示に）  | 既存互換を維持                                    |
| 新規 Warning 検出 | サマリの件数増加で検出可能               | `--strict` 実行を忘れると見落としリスクあり | 設定に含まれない Warning は表示されるため検出可能 |
| 保守性            | `quick_validate.js` 1ファイルで完結      | `quick_validate.js` 1ファイルで完結         | 設定ファイル + `quick_validate.js` の2箇所        |

### 3.2 案 A の出力イメージ

**現状（149件の Warning が1件ずつ出力）:**

```
⚠ Reference file not linked in SKILL.md: references/api-chat-history.md
⚠ Reference file not linked in SKILL.md: references/api-endpoints.md
⚠ Reference file not linked in SKILL.md: references/api-ipc-agent.md
... (146件省略)
⚠ Description does not contain 'Anchors' section
⚠ Description does not contain 'Trigger' section

Summary: 10 passed, 0 errors, 151 warnings
```

**改善後（要約表示）:**

```
⚠ Reference files not linked in SKILL.md: 149 files
  (run with --verbose to see individual files)
⚠ Description does not contain 'Anchors' section
⚠ Description does not contain 'Trigger' section

Summary: 10 passed, 0 errors, 151 warnings (149 ref-link, 2 description)
```

### 3.3 実装方針

- `quick_validate.js` 内の Warning 出力処理で、同一種別の Warning が 5件以上連続する場合にグループ化する
- `--verbose` オプション指定時は従来どおり全件を個別表示する
- サマリ行に Warning の種別別内訳を追加する（例: `151 warnings (149 ref-link, 2 description)`）

## 4. スコープ判定

| 判定                 | 理由                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| 本タスクのスコープ外 | `quick_validate.js` のコード変更は本タスク（仕様書更新タスク）のスコープ外である |

Phase 5（実装）では仕様書の Markdown 更新のみを行い、`quick_validate.js` のコード変更は行わない。案 A の実装が必要と判断された場合は、未タスク指示書を作成して後続タスクとして管理する。

## 5. 未タスク化の方針

案 A の実装を未タスクとする場合の指示書テンプレート:

| 項目       | 内容                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-QUICK-VALIDATE-SUMMARY-OUTPUT-001（仮）                                    |
| タスク名   | quick_validate.js Warning 要約表示の実装                                          |
| スコープ   | `quick_validate.js` の Warning 出力を種別ごとにグループ化し、サマリ表示を実装する |
| 優先度     | 中                                                                                |
| 前提タスク | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001（本タスク）の完了                      |

## 6. FR/NFR 対応

| 要件    | 本設計での対応                                                         |
| ------- | ---------------------------------------------------------------------- |
| FR-007  | 改善案を通じて、大規模 reference スキルの Warning ノイズ制御方針を定義 |
| NFR-002 | 案 A の要約表示により、Error/Warning の識別性を向上させる設計          |
| NFR-003 | 案 A は `quick_validate.js` 1ファイルの変更で完結する設計              |
| NFR-004 | 出力フォーマットの変更のみであり、実行速度への影響なし                 |
