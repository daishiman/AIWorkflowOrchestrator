# electron-build-infra-fix - タスク実行仕様書

## ユーザーからの元の指示

```
GitHub Issue #1786: [TASK-ELECTRON-BUILD-FIX] Electron ビルドインフラ修正:
shared/preload モジュール解決 + better-sqlite3 ABI 不整合
```

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-ELECTRON-BUILD-FIX                         |
| タスク名   | electron-build-infra-fix                        |
| 分類       | バグ修正                                        |
| 作成日     | 2026-03-31                                      |
| 現在状態   | specification_created                           |
| 対象       | `apps/desktop`, `packages/shared`, root scripts |
| スコープ外 | commit、push、PR作成                            |

## 目的

Electron 開発起動を塞いでいる 2 つの根本原因を修正するための、実行可能で保守しやすい Phase 1-13 workflow を定義する。`task-specification-creator` の必須構造と `aiworkflow-requirements` の参照原則に従い、重複と定義ドリフトを避ける。

## 真の論点

1. `packages/shared` の配布形態が preload の CJS 実行条件と整合していない。
2. `better-sqlite3` のネイティブビルドが Electron ABI と整合していない。
3. 上記修正を実施する workflow 自体が、共通定義と Phase 固有責務を分離した形で記述されている必要がある。

## スコープ

### In Scope

- `packages/shared` の ESM/CJS 両立方針整理
- preload 側の shared 解決経路の修正
- `better-sqlite3` の Electron ABI 再ビルド導線の整備
- ビルド検証、品質検証、手動起動確認、関連ドキュメント更新

### Out of Scope

- Electron 自体のバージョン変更
- `better-sqlite3` の機能追加
- renderer 機能追加
- commit、push、PR作成の実行

## 受け入れ基準

| AC   | 条件                                                           | 主検証                                                           |
| ---- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| AC-1 | `packages/shared` が ESM/CJS の両形式を出力する                | `pnpm --filter @repo/shared build`                               |
| AC-2 | shared の公開面に CJS 解決経路がある                           | `packages/shared/package.json` の exports 確認                   |
| AC-3 | preload bundle に `@repo/shared` への外部 `require` が残らない | preload build 出力確認                                           |
| AC-4 | shared 側のビルド検証テストが全件 PASS                         | vitest                                                           |
| AC-5 | `better-sqlite3` が Electron ABI でロード成功する              | `ELECTRON_RUN_AS_NODE=1 electron -e "require('better-sqlite3')"` |
| AC-6 | desktop 側のビルド検証テストが全件 PASS                        | vitest                                                           |
| AC-7 | `pnpm --filter @repo/desktop dev` が起動開始点まで進む         | 手動確認                                                         |
| AC-8 | `pnpm lint` が通る                                             | lint                                                             |
| AC-9 | `pnpm typecheck` が通る                                        | typecheck                                                        |

## 変更対象インベントリ

| 区分             | パス                                                   | 役割                    |
| ---------------- | ------------------------------------------------------ | ----------------------- |
| shared build     | `packages/shared/tsup.config.ts`                       | dual output 設定        |
| shared publish   | `packages/shared/package.json`                         | exports / main 整合     |
| desktop build    | `apps/desktop/electron.vite.config.ts`                 | preload bundle 経路整理 |
| desktop deps     | `apps/desktop/package.json`                            | rebuild command と依存  |
| root bootstrap   | `package.json`                                         | postinstall 導線の整理  |
| native bootstrap | `scripts/setup-native-modules.sh`                      | ABI 検査と再ビルド      |
| packaged rebuild | `apps/desktop/scripts/rebuild-native-for-electron.mjs` | afterPack 再ビルド      |
| builder hook     | `apps/desktop/electron-builder.yml`                    | afterPack 登録          |

## 参照資料

| 資料                   | パス                                                                           | 用途                         |
| ---------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| workflow 実行原則      | `.claude/skills/task-specification-creator/references/execute-workflow.md`     | Phase 1-13 の標準運用        |
| Phase 構造             | `.claude/skills/task-specification-creator/references/phase-templates.md`      | 必須セクション確認           |
| リソースマップ         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               | 仕様探索起点                 |
| Electron サービス設計  | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`  | desktop 側設計の文脈         |
| セキュリティと preload | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | preload 境界の前提           |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | lint、typecheck、test の扱い |
| 既存教訓               | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | related build / ABI lessons  |

## 30思考法の適用ポリシー

本 workflow の設計レビューと最終レビューでは、次の 30 思考法を観点として使う。

- 論理分析系: 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考
- 構造分解系: 要素分解、MECE、2軸思考、プロセス思考
- メタ・抽象系: メタ思考、抽象化思考、ダブル・ループ思考
- 発想・拡張系: ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考
- システム系: システム思考、因果関係分析、因果ループ
- 戦略・価値系: トレードオン思考、プラスサム思考、価値提案思考、戦略的思考
- 問題解決系: why思考、改善思考、仮説思考、論点思考、KJ法

## SubAgent 編成

| Agent   | 役割                  | 進め方                          |
| ------- | --------------------- | ------------------------------- |
| Agent-A | shared / preload 整合 | Phase 1-10 で問題Aを主担当      |
| Agent-B | native module / ABI   | Phase 1-10 で問題Bを主担当      |
| Agent-D | 統合監査              | 4条件、依存、差し戻し判定を担当 |

並列原則:

1. 問題A と問題B は独立な分析・実装・検証を並列で進める。
2. Phase 3、10、12 は Agent-D が統合判定する。
3. 既存実装や既存仕様の破棄が必要な場合は、根拠を明示してから実施する。

## Phase 一覧

| Phase | 名称             | 役割                                                |
| ----- | ---------------- | --------------------------------------------------- |
| 1     | 要件定義         | 受け入れ基準、境界、対象ファイルを確定              |
| 2     | 設計             | shared / preload / ABI 修正方針を設計               |
| 3     | 設計レビュー     | 30思考法と4条件で設計妥当性を判定                   |
| 4     | テスト作成       | RED 条件を定義し再現テストを固定                    |
| 5     | 実装             | 変更ファイル一覧に沿って修正                        |
| 6     | テスト拡充       | 回帰防止と異常系を追加                              |
| 7     | カバレッジ確認   | concern と dependency edge を確認                   |
| 8     | リファクタリング | 重複と読みづらさを削減                              |
| 9     | 品質保証         | lint / typecheck / build 系 gate を通す             |
| 10    | 最終レビュー     | AC と差し戻し条件を最終判定                         |
| 11    | 手動テスト       | 実機起動と主要観察点を確認                          |
| 12    | ドキュメント更新 | implementation guide、spec sync、未タスク、feedback |
| 13    | PR準備           | blocked 状態の確認のみ。実行はしない                |

Phase 仕様書リンク:

- [phase-1-requirements.md](phase-1-requirements.md)
- [phase-2-design.md](phase-2-design.md)
- [phase-3-design-review.md](phase-3-design-review.md)
- [phase-4-test-creation.md](phase-4-test-creation.md)
- [phase-5-implementation.md](phase-5-implementation.md)
- [phase-6-test-expansion.md](phase-6-test-expansion.md)
- [phase-7-coverage-check.md](phase-7-coverage-check.md)
- [phase-8-refactoring.md](phase-8-refactoring.md)
- [phase-9-quality-assurance.md](phase-9-quality-assurance.md)
- [phase-10-final-review.md](phase-10-final-review.md)
- [phase-11-manual-test.md](phase-11-manual-test.md)
- [phase-12-documentation.md](phase-12-documentation.md)
- [phase-13-pr-creation.md](phase-13-pr-creation.md)

## 4条件の評価基準

| 条件         | 本 workflow での判定方法                                 |
| ------------ | -------------------------------------------------------- |
| 矛盾なし     | AC、戻り先、Phase 依存の定義源が一貫している             |
| 漏れなし     | 2 つの問題軸と必須 close-out が全 Phase に接続されている |
| 整合性あり   | 用語、ファイルパス、成果物名、status が統一されている    |
| 依存関係整合 | `artifacts.json` と Phase 前提が一致している             |

## 成果物

| 成果物          | パス                                                                | 説明                |
| --------------- | ------------------------------------------------------------------- | ------------------- |
| workflow index  | `docs/30-workflows/electron-build-infra-fix/index.md`               | 共通定義の正本      |
| phase docs      | `docs/30-workflows/electron-build-infra-fix/phase-*.md`             | Phase 実行仕様      |
| workflow status | `docs/30-workflows/electron-build-infra-fix/artifacts.json`         | 依存と進捗          |
| mirror copy     | `docs/30-workflows/electron-build-infra-fix/outputs/artifacts.json` | validator parity 用 |

## 完了条件

- [ ] `task-specification-creator` の必須構造を満たしている
- [ ] `aiworkflow-requirements` の参照原則に反していない
- [ ] AC、依存、戻り先の定義源が一元化されている
- [ ] Phase 12/13 の境界が commit / PR 禁止条件と整合している
- [ ] validator と reviewer の観点で重大な矛盾がない
