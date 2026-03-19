# Task Specification Creator パターン集

> 読み込み条件:
> 失敗原因を切り分けたい時、または同種 task の再利用手順を短時間で見つけたい時。

## クイックナビ

| family | 使う場面 | ファイル |
| --- | --- | --- |
| workflow generation | phase 設計、SubAgent lane、artifact registry 設計 | [patterns-workflow-generation.md](patterns-workflow-generation.md) |
| validation and audit | line budget、mirror parity、root drift、scoped audit | [patterns-validation-and-audit.md](patterns-validation-and-audit.md) |
| Phase 12 sync | implementation guide、spec sync、未タスク化、planned wording guard | [patterns-phase12-sync.md](patterns-phase12-sync.md) |
| lessons and pitfalls | スクリプト失敗、Phase 12漏れ、エージェント実行失敗の教訓 | [patterns-lessons-and-pitfalls.md](patterns-lessons-and-pitfalls.md) |
| Phase 12 success | 監査・準拠確認・未タスク管理の成功パターン | [patterns-success-phase12.md](patterns-success-phase12.md) |
| testing and implementation | 単体テスト・E2E・React/Zustand・サービス設計 | [patterns-testing-and-implementation.md](patterns-testing-and-implementation.md) |
| UI / IPC / modules | UI設計・IPC・Electron実装・パッケージ管理 | [patterns-ui-ipc-modules.md](patterns-ui-ipc-modules.md) |
| agent and devops | 並列エージェント実行・CI/CD最適化・Phase実行戦略 | [patterns-agent-and-devops.md](patterns-agent-and-devops.md) |

## 即時参照

### まず確認する 5 項目

1. 問題は workflow 設計か、validation か、Phase 12 同期かを切り分ける。
2. `.claude` 正本と `.agents` mirror のどちらで観測された問題かを切り分ける。
3. `current` と `baseline` を分けて報告する。
4. `outputs/` の実体、`artifacts.json`、phase 本文が同時に更新されているか確認する。
5. Phase 10 / 12 の指摘が未タスク化されるべきかを確認する。

### 高頻度パターン

| 問題 | 先に読むもの | 期待する出口 |
| --- | --- | --- |
| `SKILL.md` が肥大化した | [patterns-workflow-generation.md](patterns-workflow-generation.md) | entrypoint と detail の責務分離 |
| validator が PASS しない | [patterns-validation-and-audit.md](patterns-validation-and-audit.md) | command ごとの fail 原因特定 |
| Phase 12 で成果物はあるのに gate が通らない | [patterns-phase12-sync.md](patterns-phase12-sync.md) | output / ledger / wording の再同期 |
| Phase 12 で漏れ・ミスが発生した | [patterns-lessons-and-pitfalls.md](patterns-lessons-and-pitfalls.md) | 失敗パターンと再発防止策 |
| Phase 12 の完了品質を高めたい | [patterns-success-phase12.md](patterns-success-phase12.md) | 監査・準拠確認の実証済み手法 |
| テスト / サービス設計のパターンを探したい | [patterns-testing-and-implementation.md](patterns-testing-and-implementation.md) | テスト・サービス設計の実証済みパターン |
| UI設計 / IPC / パッケージ管理パターンを探したい | [patterns-ui-ipc-modules.md](patterns-ui-ipc-modules.md) | UI・IPC・モジュール管理パターン |
| 並列エージェント実行・CI最適化を知りたい | [patterns-agent-and-devops.md](patterns-agent-and-devops.md) | 並列実行戦略・rate limit対策 |

## 運用メモ

- family file を増やす時は `SKILL.md` から直リンクを張る。
- archive や detail file を追加したら parent guide から 1 hop で到達できるようにする。
- 大きな失敗パターンは Phase 12 の `skill-feedback-report.md` と `lessons-learned.md` にも反映する。

## ファイルマップ

| ファイル | 内容 | 行数目安 |
| --- | --- | --- |
| [patterns-workflow-generation.md](patterns-workflow-generation.md) | phase設計・SubAgent・artifact registry | ~66行 |
| [patterns-validation-and-audit.md](patterns-validation-and-audit.md) | validator・mirror parity・scoped audit | ~72行 |
| [patterns-phase12-sync.md](patterns-phase12-sync.md) | Phase 12 sync・planned wording guard | ~80行 |
| [patterns-lessons-and-pitfalls.md](patterns-lessons-and-pitfalls.md) | 失敗事例・スクリプト誤り・エージェント制約 | ~243行 |
| [patterns-success-phase12.md](patterns-success-phase12.md) | Phase 12監査・準拠確認・未タスク管理の成功パターン | ~266行 |
| [patterns-testing-and-implementation.md](patterns-testing-and-implementation.md) | 単体テスト・E2E・React/Zustand・サービス設計 | ~400行 |
| [patterns-ui-ipc-modules.md](patterns-ui-ipc-modules.md) | UI設計・IPC・Electron実装・パッケージ管理 | ~168行 |
| [patterns-agent-and-devops.md](patterns-agent-and-devops.md) | 並列エージェント実行・CI/CD最適化・Phase実行戦略 | ~305行 |

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-03-18 | patterns.md をインデックスファイルに変換。全コンテンツを 7 つの family ファイルに分割済み |
| 2026-03-16 | 同一 wave インデックス同期パターン・mirror sync 遅延パターンを追加（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 教訓） |
| 2026-03-16 | Phase 4-5 統合実行推奨パターンを追加（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 教訓） |
| 2026-03-12 | family index へ再編し、大規模 pattern 本文を workflow / validation / Phase 12 の 3 系統に分離 |
