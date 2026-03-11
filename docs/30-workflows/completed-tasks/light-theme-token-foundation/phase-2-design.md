# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| Phase      | 2                                         |
| Phase名    | 設計                                      |
| ステータス | completed                                 |
| 前提Phase  | Phase 1                                   |
| 後続Phase  | Phase 3                                   |

## 目的

ライトテーマ token の再設計案、missing token の扱い、後続タスクが参照する契約表を設計する。

## 実行タスク

- タスク1: light surface / text / border / accent の token 設計
- タスク2: missing token の解決方式決定
- タスク3: SubAgent 実行順序と並列化ルール策定

### タスク1: token 設計

| 領域    | 設計項目                                                                    | 方針                                |
| ------- | --------------------------------------------------------------------------- | ----------------------------------- |
| surface | `--bg-primary` `--bg-secondary` `--bg-tertiary` `--bg-elevated`             | 純白直打ちを避け、段差を明確化      |
| text    | `--text-primary` `--text-secondary` `--text-muted` `--text-tertiary`        | 用途別コントラストを分離            |
| border  | `--border-default` `--border-emphasis` `--border-subtle` `--border-primary` | 境界線の視認性を light 向けに再定義 |
| accent  | `--status-primary` と `--accent-primary` の関係                             | エイリアス化または統一廃止を設計    |

### タスク2: missing token 解決方式

1. 正式定義する token と既存 token へ寄せる token を決める
2. fallback 依存を排除する
3. 文書に「正式 token 一覧」を作る

### タスク3: Atent Team 実行設計

| Lane | 内容                            | 開始条件      |
| ---- | ------------------------------- | ------------- |
| A    | system spec から token 契約抽出 | 即時          |
| B    | token 値と役割表設計            | Lane A 完了後 |
| C    | contrast 検証観点設計           | Lane B 完了後 |

## 参照資料

| 参照資料        | パス                                                                              | 説明                 |
| --------------- | --------------------------------------------------------------------------------- | -------------------- |
| Phase 1 成果物  | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-1/` | 要件と境界           |
| 既存 token 実装 | `apps/desktop/src/renderer/styles/tokens.css`                                     | 現行 source of truth |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | 内容                             |
| ------------------ | ------------------------------------------------------------------------------- | -------------------------------- |
| UI design system   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      | semantic token の期待責務        |
| UI components      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | token 波及先把握                 |
| feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | light contrast 関連 backlog 把握 |

## 並列化ポリシー

- Phase 2 では Lane B/C を部分並列可とする
- ただし `正式 token 一覧` が固まるまで Phase 3 のレビュー資料は確定しない

## 統合テスト連携

| 観点                     | 連携内容                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| Token contract to test   | Phase 4 で比較する token-role matrix と期待値の元データを定義する                             |
| Shared migration bridge  | Phase 2 の contract を shared color migration の入力仕様として固定する                        |
| Visual regression bridge | regression guard task が representative screen の期待色を設計できるよう token role を明示する |

## 成果物

| 成果物            | パス                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| token-contract    | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-2/token-contract.md`    |
| token-role-matrix | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-2/token-role-matrix.md` |
| subagent-plan     | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-2/subagent-plan.md`     |

## 完了条件

- [x] light theme token 設計表が作成されている
- [x] missing token の解決方式が決まっている
- [x] 後続タスクが参照する token 契約表がある
- [x] SubAgent の直列/並列ルールが明記されている

## 次Phase

Phase 3: 設計レビュー
