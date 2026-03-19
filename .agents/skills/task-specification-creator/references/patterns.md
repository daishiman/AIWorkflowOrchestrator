# Task Specification Creator パターン集

> 読み込み条件:
> 失敗原因を切り分けたい時、または同種 task の再利用手順を短時間で見つけたい時。

## クイックナビ

| family | 使う場面 | ファイル |
| --- | --- | --- |
| workflow generation | phase 設計、SubAgent lane、artifact registry 設計 | [patterns-workflow-generation.md](patterns-workflow-generation.md) |
| validation and audit | line budget、mirror parity、root drift、scoped audit | [patterns-validation-and-audit.md](patterns-validation-and-audit.md) |
| Phase 12 sync | implementation guide、spec sync、未タスク化、planned wording guard | [patterns-phase12-sync.md](patterns-phase12-sync.md) |
| troubleshooting | スクリプトエラー、Phase 12 更新漏れ、並列エージェント障害 | [patterns-troubleshooting.md](patterns-troubleshooting.md) |
| success: Phase 12 / DI / audit | Phase 12 完了同期、監査手法、DI パターン、Zustand 無限ループ | [patterns-success-phase12.md](patterns-success-phase12.md) |
| success: implementation | IPC統合、OAuth、UIコンポーネント、テスト実行の実装パターン | [patterns-success-implementation.md](patterns-success-implementation.md) |
| guidelines | コーディングガイドライン、Phase 境界遷移、失敗回避 | [patterns-guidelines.md](patterns-guidelines.md) |
| testing / service / CI | 単体テスト設計、E2Eテスト、サービス設計、CI最適化 | [patterns-testing.md](patterns-testing.md) |
| UI / type / auth | 検索UI、外部API正規化、型定義統合、認証UI、Phase 12 完全性 | [patterns-ui-type-auth.md](patterns-ui-type-auth.md) |
| parallel / IPC | 並列エージェント運用、IPC不整合修正、Phase 実行最適化 | [patterns-parallel-ipc.md](patterns-parallel-ipc.md) |

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
| Phase 12 更新漏れ・配置漏れ | [patterns-troubleshooting.md](patterns-troubleshooting.md) | Step 1-A〜1-D の個別確認 |
| 並列エージェント rate limit | [patterns-parallel-ipc.md](patterns-parallel-ipc.md) | 2-3並列、3ファイル以下/エージェント |
| IPC インターフェース不整合 | [patterns-parallel-ipc.md](patterns-parallel-ipc.md) | 「呼び出し元が多い側を変更しない」鉄則 |
| Zustand 無限ループ | [patterns-success-phase12.md](patterns-success-phase12.md) | 個別セレクタ or useRef ガード |
| テスト設計・カバレッジ | [patterns-testing.md](patterns-testing.md) | ギャップ分析 TDD、カバレッジ免除判定 |
| 型定義統合・移行 | [patterns-ui-type-auth.md](patterns-ui-type-auth.md) | 3点セット更新チェック |

## 運用メモ

- family file を増やす時は `SKILL.md` から直リンクを張る。
- archive や detail file を追加したら parent guide から 1 hop で到達できるようにする。
- 大きな失敗パターンは Phase 12 の `skill-feedback-report.md` と `lessons-learned.md` にも反映する。

## 関連リソース

- [phase-templates.md](phase-templates.md)
- [spec-update-workflow.md](spec-update-workflow.md)
- [phase-11-12-guide.md](phase-11-12-guide.md)
- [logs-archive-index.md](logs-archive-index.md)

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-03-18 | 500行制限超過のため10ファイルに分割。本ファイルをインデックスに再編 |
| 2026-03-16 | 同一 wave インデックス同期パターン・mirror sync 遅延パターンを追加（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 教訓） |
| 2026-03-16 | Phase 4-5 統合実行推奨パターンを追加（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 教訓） |
| 2026-03-12 | family index へ再編し、大規模 pattern 本文を workflow / validation / Phase 12 の 3 系統に分離 |
