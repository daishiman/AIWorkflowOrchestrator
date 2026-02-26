# Phase 6: テスト拡充

## メタ情報

| 項目               | 内容                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                      |
| Phase              | 6 / 13                                                                          |
| Phase名称          | テスト拡充                                                                      |
| 機能名             | skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御）    |
| 作成日             | 2026-02-26                                                                      |
| GitHub Issue       | #910                                                                            |
| 前提Phase          | Phase 5（実装: TDD Green 完了）                                                 |
| 目的               | Phase 5 の実装に対してテストを拡充し、要件網羅率を高める                        |
| 成果物ディレクトリ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-6/` |

## 目的

Phase 5 で実装した検証経路統一ルール・warning 運用ルール・Phase 12 テンプレート統合に対して、要件網羅率を分析し、回帰テスト・エッジケーステストを追加してカバレッジ基準を満たす。本タスクは運用改善タスクであるため、カバレッジは「要件網羅率」として測定する。

## 実行タスク

- **Task 6-1**: 要件網羅率分析 -- テストケースの要件カバレッジ測定
- **Task 6-2**: 回帰テスト追加 -- 既存検証フローへの影響がないことの確認テスト
- **Task 6-3**: エッジケーステスト追加 -- 異常系・境界値のテスト拡充
- **Task 6-4**: 統合テスト追加 -- 複数スキルに対する一括検証テスト
- **Task 6-5**: カバレッジレポートの文書化

## 参照資料

| 参照資料             | パス                                                                                                           | 内容                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 4 テスト仕様書 | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-4/test-specification.md`           | テスト設計方針                 |
| Phase 4 テストケース | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-4/test-cases.md`                   | テストケース一覧               |
| Phase 5 実装サマリー | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/implementation-summary.md`       | 実装変更一覧                   |
| Phase 5 コマンド参照 | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/validation-command-reference.md` | 検証コマンドリファレンス       |
| Phase 1 要件定義書   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-1-requirements.md`                         | FR/NFR/AC 一覧                 |
| quick_validate.js    | `.claude/skills/skill-creator/scripts/quick_validate.js`                                                       | テスト対象スクリプト           |
| テストコード         | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`                                        | Phase 4 で作成したテスト       |
| テストフィクスチャ   | `.claude/skills/skill-creator/scripts/__tests__/fixtures/`                                                     | Phase 4 で作成したフィクスチャ |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                                                             | カバレッジ基準                 |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                         | 過去の苦戦箇所と対策           |

## 実行手順

### Task 6-1: 要件網羅率分析

1. Phase 1 の全要件（FR-001〜FR-007, NFR-001〜NFR-005, AC-001〜AC-006）を列挙し、各要件に対応するテストケースの有無を確認する:

   | 要件ID  | 要件概要                                  | Phase 4 テストケース | Phase 6 追加テスト | カバー状況   |
   | ------- | ----------------------------------------- | -------------------- | ------------------ | ------------ |
   | FR-001  | `quick_validate.js` を正規経路に指定      | TS-001               |                    | 確認して記載 |
   | FR-002  | `.py` を fallback 限定                    | TS-002               |                    | 確認して記載 |
   | FR-003  | Step 1-G を正規経路に統一                 | TS-003               |                    | 確認して記載 |
   | FR-004  | `phase-11-12-guide.md` を正規経路に統一   | TS-004               |                    | 確認して記載 |
   | FR-005  | Warning 3段階分類ルール定義               | TS-005               |                    | 確認して記載 |
   | FR-006  | 判定基準の明文化                          | TS-006               |                    | 確認して記載 |
   | FR-007  | 参照リンク Warning の許容条件定義         | TS-007               |                    | 確認して記載 |
   | NFR-001 | 再現性（同一入力 → 同一結果）             | TS-008               |                    | 確認して記載 |
   | NFR-002 | 可読性（severity 識別）                   | TS-009               |                    | 確認して記載 |
   | NFR-003 | 保守性（1ファイル完結）                   |                      |                    | 確認して記載 |
   | NFR-004 | 実行速度（30秒以内）                      | TS-010               |                    | 確認して記載 |
   | NFR-005 | 後方互換（Error 判定不変）                | TS-011               |                    | 確認して記載 |
   | AC-001  | spec-update-workflow.md に `.py` 参照 0件 | TS-AC-001            |                    | 確認して記載 |
   | AC-002  | phase-11-12-guide.md に `.py` 参照 0件    | TS-AC-002            |                    | 確認して記載 |
   | AC-003  | Warning 3段階分類ルール文書化             | TS-AC-003            |                    | 確認して記載 |
   | AC-004  | 3スキルで Error 0件                       | TS-AC-004            |                    | 確認して記載 |
   | AC-005  | 参照リンク Warning 許容条件明記           | TS-AC-005            |                    | 確認して記載 |
   | AC-006  | `.js` と `.py` の Error 判定一致          | TS-AC-006            |                    | 確認して記載 |

2. カバレッジが不足している要件を特定し、追加テストケースを設計する

### Task 6-2: 回帰テスト追加

1. 既存スキルに対する `quick_validate.js` 実行による回帰テストを実施する:

   | テストID  | テスト名                            | 実行内容                                                           | 期待結果                          |
   | --------- | ----------------------------------- | ------------------------------------------------------------------ | --------------------------------- |
   | TC-RT-001 | skill-creator 回帰検証              | `node quick_validate.js .claude/skills/skill-creator`              | Phase 5 前と同じ結果（Error 0件） |
   | TC-RT-002 | task-specification-creator 回帰検証 | `node quick_validate.js .claude/skills/task-specification-creator` | Phase 5 前と同じ結果（Error 0件） |
   | TC-RT-003 | aiworkflow-requirements 回帰検証    | `node quick_validate.js .claude/skills/aiworkflow-requirements`    | Phase 5 前と同じ結果（Error 0件） |
   | TC-RT-004 | 既存検証フロー互換確認              | `verify-unassigned-links`, `audit-unassigned-tasks` の動作確認     | 既存フローが正常動作する          |

2. 回帰テストの結果を `outputs/phase-6/regression-test-result.md` に記録する

### Task 6-3: エッジケーステスト追加

1. 以下のエッジケースに対するテストを追加する:

   | テストID  | テスト名                     | 入力条件                           | 期待結果                            |
   | --------- | ---------------------------- | ---------------------------------- | ----------------------------------- |
   | TC-EC-001 | スキルディレクトリ不在       | 存在しないディレクトリパスを指定   | エラーメッセージ出力                |
   | TC-EC-002 | SKILL.md が空ファイル        | 0バイトの SKILL.md                 | Error（frontmatter なし）           |
   | TC-EC-003 | references/ ディレクトリ不在 | references/ が存在しないスキル     | パス（references チェックスキップ） |
   | TC-EC-004 | 複数スキルの連続検証         | 3スキルを順次実行                  | 各スキルが独立して検証される        |
   | TC-EC-005 | パスに日本語を含むスキル     | 日本語を含むディレクトリパス       | 正常に検証される                    |
   | TC-EC-006 | シンボリックリンクのスキル   | シンボリックリンク経由のスキルパス | 正常に検証される                    |

2. Warning 分類のエッジケースを追加する:

   | テストID  | テスト名                | 入力条件                                     | 期待結果                    |
   | --------- | ----------------------- | -------------------------------------------- | --------------------------- |
   | TC-EC-007 | Warning 0件スキル       | 全検証項目をパスする `valid-skill/`          | Warning 0件、Error 0件      |
   | TC-EC-008 | Warning 大量発生スキル  | references/ に50ファイル以上（未リンク多数） | 出力が破綻しない、Error 0件 |
   | TC-EC-009 | Error と Warning の混在 | Error 1件 + Warning 5件の組合せ              | Error が先に表示される      |

### Task 6-4: 統合テスト追加

1. 検証コマンド統一の統合テストを追加する:

   | テストID  | テスト名                        | 実行内容                                                                 | 期待結果                             |
   | --------- | ------------------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
   | TC-IT-001 | Phase 12 テンプレートコマンド列 | Phase 12 テンプレートに記載された検証コマンドをそのまま実行              | 全コマンドが正常終了する             |
   | TC-IT-002 | 仕様書整合性確認                | `spec-update-workflow.md` と `phase-11-12-guide.md` のコマンド参照が一致 | 両仕様書で同一コマンドを参照している |
   | TC-IT-003 | Warning 分類ルール適用確認      | 実際のスキルに対して Warning 分類を適用                                  | 分類結果が判定フローと一致する       |

### Task 6-5: カバレッジレポートの文書化

1. `outputs/phase-6/coverage-report.md` を作成する -- 以下を記載:
   - 要件網羅率の分析結果（Task 6-1 の結果テーブル）
   - Phase 6 テスト追加後の要件網羅率
   - カバレッジ基準との比較

2. `outputs/phase-6/regression-test-result.md` を作成する -- 以下を記載:
   - 回帰テストの実行結果（Task 6-2 の結果）
   - エッジケーステストの実行結果（Task 6-3 の結果）
   - 統合テストの実行結果（Task 6-4 の結果）

## カバレッジ基準（運用改善タスク適応版）

本タスクは運用改善タスクであるため、コードカバレッジ（Line/Branch/Function）ではなく要件網羅率を基準とする:

| 指標                     | 最低基準         | 推奨基準 |
| ------------------------ | ---------------- | -------- |
| 要件カバレッジ           | 100%（全FR/NFR） | --       |
| 受入基準カバレッジ       | 100%（全AC）     | --       |
| テストシナリオカバレッジ | 80%              | 90%      |
| 境界値テストカバレッジ   | 60%              | 80%      |

## 統合テスト連携【必須】

- Phase 6 のテストは Phase 4 のテストと同じ文書体系に統合する
- テストケースは `outputs/phase-4/test-cases.md` に追記する形式、または `outputs/phase-6/` に追加テストケースとして分離する
- 全テスト（Phase 4 + Phase 6）を実行し、全件 PASS を確認する
- カバレッジ基準（要件カバレッジ 100%）を満たすことを確認する

## 多角的チェック観点（AIが判断）

| 観点                  | 適用 | 確認内容                                                        |
| --------------------- | ---- | --------------------------------------------------------------- |
| テスト独立性          | ○    | 各テストが独立して実行可能（P9 対策: テスト間で状態共有しない） |
| 要件トレーサビリティ  | ○    | 全 FR/NFR/AC に対してテストケースが存在することを確認           |
| 回帰テスト            | ○    | 既存スキルに対する検証結果が Phase 5 前と変わらないことを確認   |
| エッジケース          | ○    | 不在ディレクトリ、空ファイル、大量 Warning のケースをテスト     |
| 統合テスト            | ○    | 仕様書間の整合性と Phase 12 テンプレートの動作を確認            |
| コード品質            | ○    | テストコードが Lint・Prettier に準拠                            |
| UI/UX                 | --   | 本Phase はテスト拡充のため UI/UX は対象外                       |
| Electron セキュリティ | --   | 本タスクは Electron IPC を含まない                              |

## 成果物

| 成果物             | パス                                                                                                     | 説明                               |
| ------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| カバレッジレポート | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-6/coverage-report.md`        | 要件網羅率分析結果・基準比較       |
| 回帰テスト結果     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-6/regression-test-result.md` | 回帰・エッジケース・統合テスト結果 |

## 完了条件

- [ ] 要件網羅率分析が完了し、全 FR/NFR に対するテストケースが存在する（要件カバレッジ 100%）
- [ ] 全 AC に対するテストケースが存在する（受入基準カバレッジ 100%）
- [ ] 回帰テストが4パターン以上実施されている（Task 6-2）
- [ ] エッジケーステストが9パターン以上追加されている（Task 6-3）
- [ ] 統合テストが3パターン以上追加されている（Task 6-4）
- [ ] 回帰テストで既存フローへの影響がないことを確認済み
- [ ] 全テスト（Phase 4 + Phase 6）が PASS している
- [ ] `outputs/phase-6/coverage-report.md` が作成されている
- [ ] `outputs/phase-6/regression-test-result.md` が作成されている
- [ ] カバレッジ基準（要件カバレッジ 100%）を満たしている、または Phase 7 で再確認の旨を記載している
- [ ] `artifacts.json` の Phase 6 ステータスが `completed` に更新されている

## サブタスク管理

| サブタスク | 内容                   | 状態   | 成果物                    |
| ---------- | ---------------------- | ------ | ------------------------- |
| Task 6-1   | 要件網羅率分析         | 未着手 | 要件カバレッジテーブル    |
| Task 6-2   | 回帰テスト追加         | 未着手 | regression-test-result.md |
| Task 6-3   | エッジケーステスト追加 | 未着手 | エッジケーステスト結果    |
| Task 6-4   | 統合テスト追加         | 未着手 | 統合テスト結果            |
| Task 6-5   | カバレッジレポート作成 | 未着手 | coverage-report.md        |

## タスク100%実行確認【必須】

- [ ] 全タスク（6-1, 6-2, 6-3, 6-4, 6-5）が100%実行完了
- [ ] 各成果物が生成されている
- [ ] `artifacts.json` が更新されている

## 次のPhase

Phase 7: カバレッジ確認 -- Phase 6 の結果を検証し、カバレッジ基準未達の場合は Phase 6 に戻る。
