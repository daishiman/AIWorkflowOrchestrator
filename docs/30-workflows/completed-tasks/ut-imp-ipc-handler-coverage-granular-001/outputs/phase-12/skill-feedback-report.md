# スキルフィードバックレポート

## メタ情報

| 項目     | 値                                       |
| -------- | ---------------------------------------- |
| タスクID | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 |
| Phase    | 12                                       |
| 作成日   | 2026-02-28                               |

## ワークフロー改善点

1. **Phase 7判定ルールのハンドラ単位拡張**: ファイル全体カバレッジだけでは大規模ファイルの修正対象部分の品質が把握できなかった。ハンドラ単位カバレッジの導入により、修正した部分に対する精密な品質判定が可能になった。

2. **vitest.config.ts の include パターン拡張**: `scripts/` ディレクトリ配下のテストファイルが検出されない問題があった。`include` 配列に `"scripts/**/*.test.{ts,tsx}"` を追加する必要があった。テスト対象を `src/` 以外に拡張する場合の手順をテンプレートに追記すべき。

3. **ESM モジュールモッキングの制約**: `vi.spyOn()` がESM内部関数呼び出しをインターセプトできない問題。DI方式（オプショナルパラメータ）で解決。この知見は他のスクリプトテストにも適用可能。

## 技術的教訓

1. **Istanbul形式の理解**: Vitest v8プロバイダはIstanbul形式（statementMap/s/branchMap/b/fnMap/f）で出力する。raw v8形式（functions[].ranges[]）ではない。

2. **ts-morph AST解析**: CallExpression からの引数抽出パターンが確立できた。PropertyAccessExpression → IPC_CHANNELS.XXX の解析手法。

3. **P41の影響範囲**: validateIpcSender のインラインarrow function が Function Coverage を大幅に低下させる。注記による周知が有効。

## スキル改善提案

1. **task-specification-creator**: Phase 7テンプレートに「ハンドラ単位カバレッジ」セクションを追加済み。IPCハンドラファイルの品質検証時に自動適用されるよう、Phase 7仕様書テンプレートの条件分岐を追加すべき。

2. **aiworkflow-requirements**: `quality-requirements.md` にハンドラ単位カバレッジ判定ルールを追記済み。今後は他のIPCハンドラファイル（authHandlers.ts等）にも同じ手法を適用可能。

## 新規Pitfall候補

現時点で `.claude/rules/06-known-pitfalls.md` への追加候補はなし。P41（v8インライン関数カウント）は既に登録済み。vitest.config.ts の include パターン問題は、本タスク固有の課題であり汎用的なPitfallとしての登録は不要と判断。
