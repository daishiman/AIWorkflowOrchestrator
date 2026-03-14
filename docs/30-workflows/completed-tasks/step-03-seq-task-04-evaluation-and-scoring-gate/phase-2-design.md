# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| Phase名    | 設計                    |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | completed               |
| 前提Phase  | Phase 1                 |
| 後続Phase  | Phase 3                 |

## 目的

評価スコアモデル、受け入れゲート、Task03/05 連携インターフェースを設計する。

## 実行タスク

- タスク1: 総合スコアとカテゴリスコアの算出モデルを設計する。
- タスク2: `改善へ戻す` `保存可` `利用可` `推奨` のゲート閾値を設計する。
- タスク3: Task03 への入力契約と Task05 への引き渡し契約を設計する。
- タスク4: スコア履歴の保持方針と表示方針を設計する。
- タスク5: 仕様抽出マップとの差分を検証し、参照漏れをゼロにする。

## 参照資料

| 参照資料        | パス                                                                                      | 目的                                            |
| --------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 評価型契約      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md` | `PromptEvaluation` 契約を確認                   |
| IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`            | sender検証と入力検証を確認                      |
| UI参照仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md` | `SkillAnalysisView` / `ScoreDisplay` 契約を確認 |
| 状態管理仕様    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`              | state ownership を確認                          |
| 全体構成仕様    | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`              | レイヤー責務を確認                              |
| 仕様抽出マップ  | `./aiworkflow-requirements-extraction.md`                                                 | 必須仕様セットを再確認                          |
| 依存Phase成果物 | phase-1-requirements.md（Phase 1）                                                        | Phase 1 の要件定義成果物を参照                  |

## 実行手順

1. Phase 1 の要件をスコアモデル設計表へ変換する。
2. 4段階ゲートの判定式と遷移条件を定義する。
3. Task03/05 の入出力契約を I/O テーブルで定義する。
4. スコア履歴保持と表示更新のタイミングを定義する。
5. aiworkflow 抽出マップと突合して参照漏れを検証する。

## 統合テスト連携

- Phase 4 のテスト設計で使う「入力値 / 期待ゲート / 次導線」マトリクスを設計成果物に含める。
- Phase 6 の境界テストで使う閾値ケース（59/60/79/80/100）を設計時点で固定する。

## 多角的チェック観点（AIが判断）

- スコア算出式がUI表示とIPCレスポンスで矛盾しないか。
- ゲート判定が導線分岐にそのまま適用できるか。
- 設計が Task03 と Task05 の双方で再利用できるか。

## サブタスク管理

| SubAgent   | 責務             | 実行方式 | 出力         |
| ---------- | ---------------- | -------- | ------------ |
| SubAgent-A | スコアモデル設計 | 並列     | スコア算出表 |
| SubAgent-B | ゲート遷移設計   | 並列     | ゲート遷移表 |
| SubAgent-C | 契約/仕様突合    | 並列     | 契約差分表   |

## 成果物

| 成果物         | パス                                     | 内容                           |
| -------------- | ---------------------------------------- | ------------------------------ |
| 設計仕様       | `./phase-2-design.md`                    | スコアモデル、ゲート、連携契約 |
| 連携マトリクス | `outputs/phase-2/scoring-gate-matrix.md` | 入力・判定・遷移対応           |

## 完了条件

- [x] スコア算出モデルが定義されている
- [x] 4段階ゲート判定が定義されている
- [x] Task03/05 連携契約が定義されている
- [x] aiworkflow 参照漏れがゼロである

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 次Phase

Phase 3（設計レビュー）で設計の妥当性と戻り先を確定する。
