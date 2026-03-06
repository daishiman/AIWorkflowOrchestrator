# aiworkflow-requirements 抽出監査

## 対象

- ワークフロー: `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/`
- 監査日: 2026-03-06
- 監査担当:
  - SubAgent-A: UI/UX 正本抽出監査
  - SubAgent-B: アーキテクチャ / 状態管理抽出監査
  - SubAgent-C: テスト / a11y 抽出監査
  - SubAgent-D: Phase 12 正本同期対象監査

## 結論

PASS。今回の Global Navigation 基盤仕様書作成に必要な `aiworkflow-requirements` の情報は、実装観点・検証観点・Phase 12 同期観点まで含めて抽出済み。特に不足しやすかった `ui-ux-portal-patterns.md`、`architecture-overview.md`、`directory-structure.md` の扱いを補強した。

## 必須抽出マトリクス

| カテゴリ           | 正本仕様                     | 抽出結果 | 主な反映先                                   |
| ------------------ | ---------------------------- | -------- | -------------------------------------------- |
| ナビ導線           | `ui-ux-navigation.md`        | 抽出済み | Phase 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13 |
| UI責務分離         | `ui-ux-components.md`        | 抽出済み | Phase 2, 5, 8, 11, 12, 13                    |
| デザインシステム   | `ui-ux-design-system.md`     | 抽出済み | Phase 1, 2, 3, 5, 9, 10, 11, 12, 13          |
| UI原則             | `ui-ux-design-principles.md` | 抽出済み | Phase 1, 2, 3, 9, 10, 11                     |
| Portal / Overlay   | `ui-ux-portal-patterns.md`   | 抽出済み | Phase 2, 4, 6, 8, 9, 10, 11                  |
| 状態管理           | `arch-state-management.md`   | 抽出済み | Phase 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12     |
| アーキテクチャ概要 | `architecture-overview.md`   | 抽出済み | Phase 2, 3, 5, 8, 9, 10, 12                  |
| 実装パターン       | `architecture-patterns.md`   | 抽出済み | Phase 1, 2, 3, 5, 8                          |
| ディレクトリ構成   | `directory-structure.md`     | 抽出済み | Phase 1, 2, 5, 12                            |
| エラーハンドリング | `error-handling.md`          | 抽出済み | Phase 1, 2, 4, 5, 8, 10                      |
| 品質 / TDD         | `quality-requirements.md`    | 抽出済み | Phase 1, 4, 6, 7, 9, 10, 11, 13              |
| a11y 試験          | `testing-accessibility.md`   | 抽出済み | Phase 3, 4, 5, 6, 7, 9, 10, 11               |
| Phase 12 正本同期  | `task-workflow.md`           | 抽出済み | Phase 12, 13                                 |
| 教訓同期           | `lessons-learned.md`         | 抽出済み | Phase 12, 13                                 |

## 修正した抽出漏れ

| 論点                    | 修正前                                                 | 修正後                                   |
| ----------------------- | ------------------------------------------------------ | ---------------------------------------- |
| More メニューの仕様根拠 | `ui-ux-portal-patterns.md` が未抽出                    | 設計、テスト、QA、手動検証へ反映         |
| Renderer 全体接続       | `architecture-overview.md` の反映密度が不足            | Phase 2 / 3 / 5 / 8 / 9 / 10 / 12 に反映 |
| 配置規約                | `directory-structure.md` の扱いが薄い                  | Phase 1 / 2 / 5 / 12 に反映              |
| Phase 12 正本同期       | `task-workflow.md` / `lessons-learned.md` の粒度が不足 | Task 12-2 と成果物説明へ反映             |

## 今回は対象外とした仕様

| カテゴリ                | 判定           | 理由                                                                    |
| ----------------------- | -------------- | ----------------------------------------------------------------------- |
| `api-*`                 | 対象外         | 新規 API / IPC 契約変更の仕様書作成が主眼ではない                       |
| `database-*`            | 対象外         | DB スキーマ変更や永続化仕様変更を扱わない                               |
| `security-*` の詳細更新 | 条件付き対象外 | Electron セキュリティの新規契約変更ではなく、Renderer UI 基盤仕様が主題 |

## 抽出の妥当性判断

| 観点             | 判定 | 理由                                                                     |
| ---------------- | ---- | ------------------------------------------------------------------------ |
| 水平思考         | PASS | UI、状態、テスト、文書同期の横断観点を拾っている                         |
| 逆説思考         | PASS | 「今回不要な仕様」を明示して過剰参照を避けた                             |
| システム思考     | PASS | Global Navigation を全画面導線の基盤として扱い、後続タスク依存を反映した |
| 垂直思考         | PASS | Phase ごとに必要な仕様だけへ落とし込んだ                                 |
| 類推思考         | PASS | More メニューを portal / overlay 問題として扱い、関連仕様を追加抽出した  |
| if 思考          | PASS | フィーチャーフラグ OFF / ON / 削除後の 3 状態に必要な仕様参照を確認した  |
| 素人思考         | PASS | Phase 11 / 12 で人が迷う論点を仕様書へ先回りして明記した                 |
| トレードオン思考 | PASS | 参照量を増やしすぎず、必要な仕様だけを追加した                           |
| プラスサム思考   | PASS | template 準拠と aiworkflow 抽出を同時に満たす構成へ寄せた                |

## 補足

- 今回は `aiworkflow-requirements` の正本更新自体は実施していない。Phase 12 で「更新要否を判定する仕様」が揃っていることを監査対象とした。
- 仕様書作成タスクとして必要な情報抽出は完了しているため、次に実装へ進む場合も追加の正本探索コストは小さい。
