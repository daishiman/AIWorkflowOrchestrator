# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 |
| Phase      | 6                                                 |
| Phase名    | テスト拡充                                        |
| カテゴリ   | 改善                                              |
| 優先度     | 中                                                |
| ステータス | completed                                         |
| 前提Phase  | Phase 5                                           |
| 後続Phase  | Phase 7                                           |

## 目的

Phase 5 の実装を failure bucket、CLI オプション、metadata 出力、shared core と wrapper の責務境界の観点で拡張検証し、回帰を拾うテスト密度を高める。

## 実行タスク

- タスク1: CLI オプション系テストを追加する
- タスク2: metadata と guidance の検証を追加する
- タスク3: command matrix を更新する

### タスク1: CLI オプション系テスト

**目的**: script の起動条件を固定する

**追加対象**:

| ケース              | 期待結果                                              |
| ------------------- | ----------------------------------------------------- |
| `--json`            | JSON 形式で出力される                                 |
| `--write`           | 指定先へ report が書かれる                            |
| `--no-auto-serve`   | localhost fallback を使わず fail する                 |
| custom `--base-url` | URL が結果へ反映される                                |
| wrapper consistency | shared core の report がそのまま CLI 出力へ反映される |

### タスク2: metadata と guidance 検証

**目的**: capture 側が利用するデータを固定する

**追加対象**:

| 項目             | 期待結果                                               |
| ---------------- | ------------------------------------------------------ |
| metadata file    | preflight summary と guidance が含まれる               |
| guidance text    | bucket ごとに次アクションが 1 つ以上入る               |
| blocked bucket   | 上流 bucket fail 時に `blocked` 表現を返す             |
| capture consumer | capture script 側に probe / start の重複分岐を持たない |

### タスク3: command matrix 更新

**目的**: Phase 7 の実行コマンドを固定する

**更新対象**:

| 文書                                       | 更新内容                       |
| ------------------------------------------ | ------------------------------ |
| `outputs/phase-6/command-matrix.md`        | Phase 7 で回すコマンド一覧     |
| `outputs/phase-6/test-expansion-report.md` | 追加した test と coverage 目的 |

## 参照資料

| 参照資料              | パス                                                                         | 説明                         |
| --------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| Phase 5 実装          | `phase-5-implementation.md`                                                  | 実装対象の一覧               |
| preflight core test   | `../../../apps/desktop/scripts/phase11-current-build-preflight-core.test.ts` | shared core 側 test の追加先 |
| preflight test        | `../../../apps/desktop/scripts/phase11-current-build-preflight.test.ts`      | 既存 test の追加先           |
| preflight core script | `../../../apps/desktop/scripts/phase11-current-build-preflight-core.mjs`     | 判定ロジックの正本           |
| preflight script      | `../../../apps/desktop/scripts/phase11-current-build-preflight.mjs`          | CLI と出力構造               |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                        | 内容                              |
| ------------ | ------------------------------------------------------------------------------------------- | --------------------------------- |
| 品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | test coverage の確認              |
| 教訓集       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | bucket 分離の再発防止             |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | shared core と wrapper の責務境界 |
| エラー処理   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | blocked と guidance の表現統一    |

## 実行手順

### ステップ1: wrapper 固有の入出力を検証する

`--json`、`--write`、`--no-auto-serve`、custom `--base-url` が shared core の contract を崩していないかを見る。

### ステップ2: metadata と guidance の内容を深掘りする

capture 側が利用する summary、guidance、blocked 表現が欠けていないかを確認する。

### ステップ3: 重複排除を確認する

capture consumer に preflight orchestration の重複が戻っていないかを追加観点に含める。

## 統合テスト連携

- Phase 6 で追加した CLI と metadata 検証は Phase 7 の command log と対応づける。
- blocked bucket と localhost fallback の確認結果は Phase 9 品質保証で再利用する。
- Phase 11 の representative failure case はこの Phase の command matrix を参照して実施する。

## 多角的チェック観点

| 観点               | この Phase での確認内容                                                  | 主要仕様                                  |
| ------------------ | ------------------------------------------------------------------------ | ----------------------------------------- |
| アーキテクチャ     | shared core と wrapper の境界が test で保護されているかを見る            | `architecture-implementation-patterns.md` |
| エラーハンドリング | blocked と guidance の表現が report / metadata で揃っているかを見る      | `error-handling.md`                       |
| 品質               | CLI オプション、metadata、consumer 側重複排除を test coverage へ追加する | `quality-requirements.md`                 |

## 成果物

| 成果物             | パス                                       | 内容                     |
| ------------------ | ------------------------------------------ | ------------------------ |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` | 追加 test の整理         |
| command 行列       | `outputs/phase-6/command-matrix.md`        | Phase 7 実行コマンド一覧 |

## 完了条件

- [ ] CLI オプションの test case が定義されている
- [ ] metadata と guidance の検証項目が定義されている
- [ ] blocked bucket の期待値が定義されている
- [ ] shared core -> wrapper -> capture metadata の連鎖が検証対象に入っている
- [ ] command matrix が更新されている
- [ ] Phase 7 が実行順を迷わず進められる

## 次Phase

Phase 7: カバレッジ確認へ進む。
