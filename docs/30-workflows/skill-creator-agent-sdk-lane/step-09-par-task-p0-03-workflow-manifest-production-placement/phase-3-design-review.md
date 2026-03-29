# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 3                                      |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

Phase 1-2 の要件と設計が ManifestLoader の検証ルールを満たし、Phase 4 以降の実装に耐えるかを判定する。戻り条件を固定し、Phase 4 着手可否を決定する。

## 実行タスク

- ManifestLoader 検証整合レビュー: 設計した manifest 構造が loadManifest() の全検証項目を通過するか確認する
- resource path 実在性レビュー: resource descriptor の path が skill-creator ディレクトリ内の実ファイルを指すか確認する
- simpler alternative 評価: 代替設計案を比較する
- gate 判定: PASS / MINOR / MAJOR の判定と戻り先を決める

## 参照資料

| 資料名               | パス                                                       | 説明                    |
| -------------------- | ---------------------------------------------------------- | ----------------------- |
| phase-1 requirements | `phase-1-requirements.md`                                  | FR / NFR / 制約         |
| phase-2 design       | `phase-2-design.md`                                        | manifest 構造設計       |
| manifest 構造設計書  | `outputs/phase-2/manifest-structure-design.md`             | JSON 全体構造           |
| resource mapping 表  | `outputs/phase-2/resource-mapping.md`                      | ディレクトリ → resource |
| ManifestLoader       | `apps/desktop/src/main/services/runtime/ManifestLoader.ts` | 検証ルールの正本        |

## レビュー観点

### ManifestLoader 検証項目チェックリスト

| 検証項目                                | Phase 2 設計の対応状況 |
| --------------------------------------- | ---------------------- |
| schemaVersion === 1                     | 確認対象               |
| workflowId が string かつ非空           | 確認対象               |
| phases[] が非空 array                   | 確認対象               |
| phase.id が string かつ非空             | 確認対象               |
| phase.title が string かつ非空          | 確認対象               |
| phase.entryHookId が entry[] に存在     | 確認対象               |
| phase.exitHookId が exit[] に存在       | 確認対象               |
| phase.dependsOn が存在する phase を参照 | 確認対象               |
| resources[] が非空 array                | 確認対象               |
| resource.id が string かつ非空          | 確認対象               |
| resource.kind が string かつ非空        | 確認対象               |
| resource.path が string かつ非空        | 確認対象               |
| entry[] が非空 array                    | 確認対象               |
| exit[] が非空 array                     | 確認対象               |
| hook.id が string かつ非空              | 確認対象               |
| hook.command が string かつ非空         | 確認対象               |

### simpler alternative 評価

| 代替案                                        | 判定   | 理由                                            |
| --------------------------------------------- | ------ | ----------------------------------------------- |
| テストフィクスチャをそのまま本番にコピーする  | 不採用 | skill-creator の実ディレクトリ構造を反映しない  |
| resource descriptor を最小限（1つ）にする     | 不採用 | AC-3 の「実在ファイル参照」を満たせない         |
| 全ファイルを resource descriptor に列挙する   | 不採用 | NFR-02 の「変更時の更新箇所最小限」に反する     |
| 代表的ファイルを phase ごとに resource 化する | 採用   | ManifestLoader 検証を通過し、保守性も確保できる |

## 実行手順

### ステップ1: ManifestLoader 検証整合を確認する

Phase 2 設計の manifest 構造を、ManifestLoader の検証項目と 1:1 で照合する。

### ステップ2: resource path の実在性を確認する

設計した resource descriptor の path が skill-creator ディレクトリ内に実在するかを確認する。

### ステップ3: gate 判定を記録する

PASS なら Phase 4 へ進む。MAJOR なら戻り先 Phase を決める。

## 統合テスト連携

| 観点                    | 判定     |
| ----------------------- | -------- |
| ManifestLoader 検証整合 | 確認対象 |
| resource path 実在性    | 確認対象 |
| phase dependsOn 整合    | 確認対象 |
| hook id 参照整合        | 確認対象 |

## 多角的チェック観点

| 観点             | この Phase で確認する内容                                  |
| ---------------- | ---------------------------------------------------------- |
| クリティカル思考 | 設計が ManifestLoader の暗黙の制約を見落としていないか     |
| 反証思考         | manifest が valid に見えて実は検証を通らないケースがないか |
| 境界思考         | TASK-P0-04 で変更が必要な箇所を本タスクに混入していないか  |

## サブタスク管理

1. ManifestLoader 検証項目との照合
2. resource path 実在性確認
3. simpler alternative 比較
4. gate decision 記録
5. Phase 4 着手条件固定

## 成果物

| 成果物               | パス                                      | 説明               |
| -------------------- | ----------------------------------------- | ------------------ |
| design review result | `outputs/phase-3/design-review-result.md` | gate 判定結果      |
| review findings      | `outputs/phase-3/review-findings.md`      | 指摘一覧           |
| gate decision        | `outputs/phase-3/gate-decision.md`        | 戻り条件と着手条件 |

## 完了条件

- [ ] ManifestLoader 検証項目との照合が完了している
- [ ] resource path の実在性が確認されている
- [ ] PASS / MINOR / MAJOR の判定が記録されている
- [ ] simpler alternative の比較結果が記録されている
- [ ] Phase 4 着手条件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を確認した
- [ ] Phase 2 を確認した
- [ ] ManifestLoader 検証項目と照合した
- [ ] gate decision を決定した

## 次のPhase

Phase 4: テスト作成
