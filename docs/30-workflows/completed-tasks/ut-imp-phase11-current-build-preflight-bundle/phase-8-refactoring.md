# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 |
| Phase      | 8                                                 |
| Phase名    | リファクタリング                                  |
| カテゴリ   | 改善                                              |
| 優先度     | 中                                                |
| ステータス | completed                                         |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7       |
| 後続Phase  | Phase 9                                           |

## 目的

preflight bundle と capture script の責務境界を保ちながら、重複処理、guidance 文面、helper 呼び出しを整理し、長期保守しやすい構造へ整える。

## 実行タスク

- タスク1: 重複ロジックを抽出する
- タスク2: failure message と metadata 形式をそろえる
- タスク3: helper 境界を最小構成に整理する

### タスク1: 重複ロジック抽出

**目的**: capture script と preflight script の重複判定を減らす

**対象例**:

| 対象               | 方針                                             |
| ------------------ | ------------------------------------------------ |
| baseUrl probe      | shared preflight core 側を一次判定にする         |
| localhost fallback | `phase11-static-server.mjs` の helper を共有する |
| report write       | preflight 側で JSON write を完結させる           |
| readiness 分岐     | capture script から shared core へ吸い上げる     |

### タスク2: failure message と metadata 形式の統一

**目的**: Phase 11 と Phase 12 で同じ wording を使える状態を作る

**統一対象**:

| 項目      | 方針                                                  |
| --------- | ----------------------------------------------------- |
| bucket 名 | native、build、harness、baseUrl に固定する            |
| guidance  | 1 bucket につき 1 つ以上の次アクションを入れる        |
| metadata  | summary、checks、guidance、timestamp を固定キーにする |

### タスク3: helper 境界の整理

**目的**: Phase 12 で説明しやすい構造にする

**整理方針**:

| 領域                  | 方針                                       |
| --------------------- | ------------------------------------------ |
| shared preflight core | 判定と report 生成を担当する               |
| CLI wrapper           | argv、stdout、exit code 変換のみを担当する |
| capture script        | screenshot capture のみを担当する          |
| static server helper  | localhost fallback のみを担当する          |

## 参照資料

| 参照資料               | パス                        | 説明                      |
| ---------------------- | --------------------------- | ------------------------- |
| Phase 1 要件定義       | `phase-1-requirements.md`   | bucket と scope           |
| Phase 2 設計           | `phase-2-design.md`         | contract と helper 境界   |
| Phase 5 実装           | `phase-5-implementation.md` | 実装対象                  |
| Phase 6 テスト拡充     | `phase-6-test-expansion.md` | guidance と metadata 検証 |
| Phase 7 カバレッジ確認 | `phase-7-coverage-check.md` | command と coverage 結果  |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                        | 内容                                  |
| ------------ | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | helper の責務分離                     |
| 教訓集       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | build 先行と bucket 分離              |
| エラー処理   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | guidance / bucket / report key の統一 |
| 品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | refactor 後の検証継続条件             |

## 実行手順

### ステップ1: 重複を shared core へ集約する

baseUrl probe、localhost fallback の orchestration、report write の責務を shared core へ寄せる。

### ステップ2: wrapper と helper を薄くする

CLI wrapper は入出力変換だけ、static server helper は primitive のみへ整理する。

### ステップ3: capture script を本来責務へ戻す

screenshot scenario 実行と metadata 書き込みだけが残る構造へ整える。

## 統合テスト連携

- Phase 8 で helper 境界を整理した後、Phase 9 で failure message と metadata の一貫性を再確認する。
- refactoring で capture script の責務が広がっていないかを Phase 10 で再レビューする。
- Phase 11 の manual test は refactoring 後の command と metadata 形式を前提にする。

## 多角的チェック観点

| 観点               | この Phase での確認内容                                                           | 主要仕様                                  |
| ------------------ | --------------------------------------------------------------------------------- | ----------------------------------------- |
| アーキテクチャ     | shared core、CLI wrapper、static helper、capture の責務が最小化されているかを見る | `architecture-implementation-patterns.md` |
| エラーハンドリング | guidance / bucket 名 / report key が 1 箇所で管理されるかを見る                   | `error-handling.md`                       |
| 品質               | refactor 後も test contract と command flow が壊れていないかを見る                | `quality-requirements.md`                 |

## 成果物

| 成果物               | パス                                 | 内容                   |
| -------------------- | ------------------------------------ | ---------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 抽出対象と維持した境界 |

## 完了条件

- [ ] baseUrl probe と localhost fallback の境界が整理されている
- [ ] readiness orchestration の重複が shared core へ集約されている
- [ ] metadata の固定キーが定義されている
- [ ] failure message の bucket 名が統一されている
- [ ] capture script の責務が screenshot に限定されている
- [ ] Phase 9 が参照できる refactoring log が作られている

## 次Phase

Phase 9: 品質保証へ進む。
