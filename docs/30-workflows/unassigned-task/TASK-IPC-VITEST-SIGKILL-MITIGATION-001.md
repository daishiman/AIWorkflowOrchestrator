# TASK-IPC-VITEST-SIGKILL-MITIGATION-001: Vitest 24ファイル一括実行の SIGKILL 恒久対応

## メタ情報

```yaml
issue_number: 2346
```

## メタ情報

| 項目     | 値                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------ |
| タスクID | TASK-IPC-VITEST-SIGKILL-MITIGATION-001                                                                 |
| 検出元   | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 Phase 11 手動テスト・Phase 12（2026-04-20）                     |
| 優先度   | LOW                                                                                                    |
| 影響     | IPC handler テスト全件を一括実行すると SIGKILL で強制終了し、CI でのテスト実行安定性が損なわれるリスク |
| 検出日   | 2026-04-20                                                                                             |

## 概要

TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 の実装中、24 ファイルの IPC handler スナップショットテストを一括実行すると
`SIGKILL`（強制終了）が発生した。現在は `VITEST_MAX_FORKS=1 VITEST_FILE_PARALLELISM=false` の環境変数設定と
Wave 分割実行で回避しているが、これは暫定対策である。根本的な環境最適化を後続課題として記録する。

## 背景

Electron main プロセス向けのテストでは以下の制約がある:

1. **esbuild バイナリ競合**: 複数 Vitest worker フォークが同時に esbuild バイナリを要求するとリソース競合が発生する
2. **worktree 環境の特殊性**: git worktree 直後は esbuild の host/binary version drift が発生しやすい
3. **macOS のメモリプレッシャー**: 大規模テストスイートでフォーク数が増えると OS レベルで SIGKILL が発行される

現在の回避策:

- `VITEST_MAX_FORKS=1 VITEST_FILE_PARALLELISM=false` 設定
- テストを Wave に分割して逐次実行

これらは機能するが、開発体験（DX）の観点では最適ではない。

## 推定作業内容

- [ ] SIGKILL 発生の根本原因を特定する（esbuild バイナリ競合 vs. macOS メモリプレッシャー vs. Vitest 設定問題）
- [ ] `vitest.config.ts` に IPC handler テスト専用の設定プロファイルを追加する（`pool: "forks"`, `poolOptions.forks.singleFork` 等）
- [ ] worktree 環境向けのセットアップスクリプトに `pnpm install` の必須化を明記する（esbuild drift 対策）
- [ ] CI パイプラインでの IPC handler テスト実行環境を最適化する（runner スペック確認）
- [ ] 24ファイル以上のテストを安定実行できることを検証し、Wave 分割の必要性を再評価する
- [ ] 最適な `maxForks` / `minForks` 値を実測で決定する

## 完了条件

- [ ] IPC handler テスト 24 ファイル以上が環境変数追加なしで安定実行できる（または許容可能な設定が確定する）
- [ ] `vitest.config.ts` に恒久的な設定が反映されている
- [ ] CI での SIGKILL 発生がゼロになる
- [ ] 実行時間が Wave 分割実行と比較して同等以下に収まる

## 苦戦箇所（TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 より）

### SIGKILL の原因特定の困難さ

- **困難だった理由**: SIGKILL はプロセスにシグナルを送信する前に強制終了するため、スタックトレースが残らない。esbuild バイナリ競合・macOS メモリプレッシャー・Vitest 設定問題のどれが真因かを切り分けるには複数回の再現実験が必要
- **採った解決策**: 最も安全な設定（`VITEST_MAX_FORKS=1`）から始めて段階的に並列数を増やすアプローチで暫定安定化した。根本原因の特定は後続に委譲
- **将来への知見**: Electron main プロセステストでは、デフォルトの Vitest 並列設定が危険なケースがある。プロジェクト規模が大きくなる前に `vitest.config.ts` の `pool` / `poolOptions` を明示的に設定し、CI と local での差異を最小化すること

### worktree 環境での esbuild バイナリ drift

- **困難だった理由**: git worktree は `node_modules` をメイン worktree と共有するが、esbuild はホスト OS アーキテクチャ向けのバイナリを `.pnpm` キャッシュから解決する。worktree 作成直後にバイナリが不整合になり、Vitest 起動前に停止する
- **採った解決策**: worktree 作成後の `pnpm install` を必須化（task-specification-creator SKILL.md の Phase 4 前提チェックに記録済み）
- **将来への知見**: CI と local の esbuild バイナリパスが一致するよう、worktree 環境向けのセットアップスクリプトを整備すること

## 関連

- 親タスク: TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
- 関連タスク: TASK-IPC-SNAPSHOT-WAVE3-001（Wave3 実施前に本タスクの解決が望ましい）
- 関連ファイル:
  - `apps/desktop/vitest.config.ts`
  - `apps/desktop/src/main/ipc/__tests__/`
  - `.github/workflows/` （CI パイプライン設定）
