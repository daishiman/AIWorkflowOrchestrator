# Task Specification Creator パターン集（インデックス）

> 読み込み条件:
> 失敗原因を切り分けたい時、または同種 task の再利用手順を短時間で見つけたい時。
> 各ファイルは 499 行以内。必要なファイルのみ読む（Progressive Disclosure）。

---

## クイックナビ

| family | 使う場面 | ファイル |
| --- | --- | --- |
| workflow generation | phase 設計、SubAgent lane、artifact registry 設計 | [patterns-workflow-generation.md](patterns-workflow-generation.md) |
| validation and audit | line budget、mirror parity、root drift、scoped audit | [patterns-validation-and-audit.md](patterns-validation-and-audit.md) |
| Phase 12 sync | implementation guide、spec sync、未タスク化、planned wording guard | [patterns-phase12-sync.md](patterns-phase12-sync.md) |
| 成功パターン (前半) | 仕様書修正・Phase 12確認証跡・テスト件数ドリフト | [patterns-success-implementation.md](patterns-success-implementation.md) |
| 成功パターン (後半) | Phase 12チェック・Zustand/DI・サービス設計 | [patterns-success-implementation-part2.md](patterns-success-implementation-part2.md) |
| ガイドライン | フェーズ進め方・Phase境界遷移・失敗回避 | [patterns-guidelines.md](patterns-guidelines.md) |
| 単体テスト / E2E | テスト設計・Playwright・型定義統合 | [patterns-testing.md](patterns-testing.md) |
| テスト + 実装 | E2Eテスト設計・型定義移行・外部API正規化 | [patterns-testing-and-implementation.md](patterns-testing-and-implementation.md) |
| CI/DevOps + 検索UI | GitHub Actions並列化・DevOps仕様書・検索置換UI | [patterns-agent-and-devops.md](patterns-agent-and-devops.md) |
| UI / IPC / モジュール | Main→Renderer IPC・検索置換UI・型定義統合 | [patterns-ui-ipc-modules.md](patterns-ui-ipc-modules.md) |
| UI / 型 / 認証 | 外部APIデータ正規化・プロバイダー別フォールバック | [patterns-ui-type-auth.md](patterns-ui-type-auth.md) |
| Phase 12 最適化 | 検証スクリプト・Vitest非watch・mirror sync | [patterns-phase12-optimization.md](patterns-phase12-optimization.md) |
| 成功 Phase 12 | Phase 12成功例・ドキュメント完了パターン | [patterns-success-phase12.md](patterns-success-phase12.md) |
| 並列 IPC | 並列エージェント実行・IPC型不整合解決 | [patterns-parallel-ipc.md](patterns-parallel-ipc.md) |
| トラブルシューティング | 認証UIバグ・React Portal・Supabase・Phase 12漏れ | [patterns-troubleshooting.md](patterns-troubleshooting.md) |
| 失敗回避 / 教訓 | Markdown誤検出・テスト環境・worktree問題 | [patterns-lessons-and-pitfalls.md](patterns-lessons-and-pitfalls.md) |

---

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
| Zustand Store で無限ループ発生 | [patterns-success-implementation-part2.md](patterns-success-implementation-part2.md) | useRef ガードパターン |
| DI サービス追加でテスト大量修正 | [patterns-success-implementation-part2.md](patterns-success-implementation-part2.md) | オプショナル引数 + beforeEach リセット |
| IPC 型不整合でランタイムエラー | [patterns-parallel-ipc.md](patterns-parallel-ipc.md) | 呼び出し元が多い側を変更しない鉄則 |
| 認証 UI バグ（Portal z-index 等） | [patterns-troubleshooting.md](patterns-troubleshooting.md) | React Portal z-index / Supabase 対策 |
| Phase 12 ドキュメント更新漏れ | [patterns-phase12-optimization.md](patterns-phase12-optimization.md) | 四点同期 + mirror sync |
| E2E テストがフレーキー | [patterns-testing-and-implementation.md](patterns-testing-and-implementation.md) | 3層安定性対策 |
| CI テスト時間が長い | [patterns-agent-and-devops.md](patterns-agent-and-devops.md) | シャード増加 + maxForks 最適化 |

---

## 運用メモ

- family file を増やす時は `SKILL.md` から直リンクを張る。
- archive や detail file を追加したら parent guide から 1 hop で到達できるようにする。
- 大きな失敗パターンは Phase 12 の `skill-feedback-report.md` と `lessons-learned.md` にも反映する。
- 各子ファイルは 499 行以内を厳守。499 行超過時は `-part2.md` を作成する。

---

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-04-07 | patterns.md を 100 行インデックスに縮小。全コンテンツを child files に移行完了 |
| 2026-03-16 | 同一 wave インデックス同期パターン・mirror sync 遅延パターン追加 |
| 2026-03-12 | family index へ再編し、大規模 pattern 本文を workflow / validation / Phase 12 の 3 系統に分離 |
