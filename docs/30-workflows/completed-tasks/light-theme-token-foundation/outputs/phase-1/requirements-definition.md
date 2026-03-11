# Phase 1 成果物: requirements-definition

## メタ情報

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| タスクID | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| 作成日   | 2026-03-11                                |
| 判定     | 完了                                      |
| モード   | 実装タスク（spec_created ではない）       |

## 1. 要件サマリー

ライトテーマ全体で発生している「白が強すぎる」「補助テキストが沈む」「未定義トークン参照で見た目が不安定」の原因層を、`tokens.css` の semantic token 契約に限定して是正する。

## 2. 現状調査結果

### 2.1 主要問題（本タスク対象）

| ID  | 観測                                                               | 原因                     | 影響                     |
| --- | ------------------------------------------------------------------ | ------------------------ | ------------------------ |
| R-1 | light theme の neutral surface / text が画面ごとに不統一           | light 基準の共通定義不足 | 可読性低下・見た目の分断 |
| R-2 | `--text-secondary` / `--text-muted` が低コントラスト               | 補助テキスト濃度不足     | 可読性低下               |
| R-3 | `--text-tertiary` / `--border-primary` / `--accent-primary` 未定義 | fallback 依存            | 画面ごとに見え方が崩れる |

### 2.2 追加監査で判明した未定義トークン

`var(--token)` 参照監査で、以下の未定義候補も検出した。

| token                                                                          | 参照数 | 方針                      |
| ------------------------------------------------------------------------------ | ------ | ------------------------- |
| `--bg-hover`                                                                   | 2      | token 基盤で定義（alias） |
| `--border-color`                                                               | 4      | token 基盤で定義（alias） |
| `--status-success-subtle` / `--status-info-subtle` / `--status-warning-subtle` | 7      | token 基盤で定義          |
| `--syntax-operator` / `--syntax-punctuation`                                   | 2      | token 基盤で定義          |

## 3. FR / NFR

### 3.1 機能要件（FR）

| ID   | 要件                                                                            |
| ---- | ------------------------------------------------------------------------------- |
| FR-1 | light theme の `surface` / `text` を white background / black text 基準へ揃える |
| FR-2 | `text` 階層（primary/secondary/muted/tertiary）を明確化する                     |
| FR-3 | `border` と `accent` の未定義参照を解消する                                     |
| FR-4 | 追加監査で検出した未定義 token を基盤で解決する                                 |

### 3.2 非機能要件（NFR）

| ID    | 要件                                               |
| ----- | -------------------------------------------------- |
| NFR-1 | semantic token の責務を component 実装へ漏らさない |
| NFR-2 | light/dark/kanagawa の3テーマで token 契約を保つ   |
| NFR-3 | 自動テストで token 契約逸脱を検知できる            |

## 4. 後続タスクとの境界

| 区分               | 内容                                                             |
| ------------------ | ---------------------------------------------------------------- |
| 本タスク           | token 契約の再設計・実装・契約テスト                             |
| 別タスク（依存先） | `light-theme-shared-color-migration`: component 側色直書き移行   |
| 別タスク（依存先） | `light-theme-contrast-regression-guard`: screenshot/監査運用固定 |

## 5. 実行判定

- [x] 要件定義を完了
- [x] 本タスクの責務境界を固定
- [x] Phase 2 設計へ進行可能
