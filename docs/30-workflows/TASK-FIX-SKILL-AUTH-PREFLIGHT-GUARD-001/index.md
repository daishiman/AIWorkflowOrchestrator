# TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 - タスク実行仕様書

## ユーザーからの元の指示

- task-specification-creator と aiworkflow-requirements の2スキル準拠を確認する。
- 本ブランチ差分への反映漏れを監査する。
- 並列実行可能な作業を分離し、SubAgent 単位で進める。
- 仕様書作成に集中し、コミット/PRは実施しない。

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001   |
| タスク名     | AUTHENTICATION_ERROR の事前検知と設定誘導 |
| 分類         | fix                                       |
| 対象機能     | 認証キー未設定時の事前ガードと設定誘導    |
| 優先度       | high                                      |
| 見積もり規模 | medium                                    |
| ステータス   | spec_created                              |
| 作成日       | 2026-03-03                                |

## タスク概要

### 目的

スキル定義に従った Phase 1〜13 の実行仕様を確定し、実装時の判断ブレをなくす。

### 背景

本件はハンドラ登録漏れと認証キー未設定時導線の不整合を再発防止する目的で、仕様書先行で修正計画を固定する。

### 最終ゴール

- task-specification-creator テンプレート準拠の仕様書を作成する。
- aiworkflow-requirements から必要仕様を抽出して参照へ反映する。
- 本ブランチ差分を仕様へトレース可能にする。

### 成果物一覧

| 種別 | 成果物                  | 配置先                                                                     |
| ---- | ----------------------- | -------------------------------------------------------------------------- |
| 仕様 | index.md + phase-1..13  | docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/                 |
| 検証 | verification-report.md  | docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/         |
| 監査 | branch-diff-coverage.md | docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/phase-1/ |

## 関心ごとの分離（SubAgent Team）

| SubAgent | 担当                     | 並列可否         |
| -------- | ------------------------ | ---------------- |
| A        | Main/IPC設計監査         | B と並列可       |
| B        | Preload/Renderer契約監査 | A と並列可       |
| C        | テスト/品質/仕様同期監査 | A/B 完了後に直列 |

## 本ブランチ差分反映監査

| 対象                     | 監査結果                                                                     |
| ------------------------ | ---------------------------------------------------------------------------- |
| 本ブランチ差分（コード） | 2026-03-03 時点で code diff は未着手（仕様書作成フェーズ）                   |
| 本ブランチ差分（仕様書） | `docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/` 全Phase作成済み |
| 反映漏れ                 | なし（本改訂でテンプレート必須章を追加）                                     |

## 参照ファイル（aiworkflow-requirements抽出結果）

| 資料名                        | パス                                                                                 | 抽出目的                            |
| ----------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------- |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | AUTHENTICATION_ERROR 条件抽出       |
| error-handling                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | エラー分類と表示方針抽出            |
| security-principles           | `.claude/skills/aiworkflow-requirements/references/security-principles.md`           | AuthKeyService セキュリティ要件抽出 |
| security-api-electron         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`         | Preload公開境界抽出                 |
| api-ipc-agent                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                 | IPC戻り値契約抽出                   |
| interfaces-auth               | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`               | 設定状態の型定義抽出                |
| api-ipc-system                | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                | auth-key IPC導線抽出                |
| environment-variables         | `.claude/skills/aiworkflow-requirements/references/environment-variables.md`         | ANTHROPIC_API_KEY 契約抽出          |
| task-workflow                 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | 認証導線の再発防止観点抽出          |

## タスク分解サマリー

| ID   | Phase | サブタスク     | 責務                   | 依存 |
| ---- | ----- | -------------- | ---------------------- | ---- |
| T-01 | 1     | 要件定義       | 判定条件定義           | -    |
| T-02 | 2     | 設計           | 層分離と契約固定       | T-01 |
| T-03 | 3     | 設計レビュー   | Gate判定               | T-02 |
| T-04 | 4     | テスト作成     | Redケース固定          | T-03 |
| T-05 | 5     | 実装           | Green化方針            | T-04 |
| T-06 | 6     | テスト拡張     | 回帰防止               | T-05 |
| T-07 | 7     | カバレッジ確認 | 測定と補完計画         | T-06 |
| T-08 | 8     | リファクタ     | 構造改善計画           | T-07 |
| T-09 | 9     | 品質保証       | 品質監査               | T-08 |
| T-10 | 10    | 最終レビュー   | 最終Gate判定           | T-09 |
| T-11 | 11    | 手動テスト     | 実機検証               | T-10 |
| T-12 | 12    | ドキュメント   | Part1/Part2 + 正本同期 | T-11 |
| T-13 | 13    | PR準備         | PR情報ドラフト         | T-12 |

## 実行フロー図

```
Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7
       -> Phase 8 -> Phase 9 -> Phase 10 -> Phase 11 -> Phase 12 -> Phase 13
```

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | pending    |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | pending    |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | pending    |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending    |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | pending    |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending    |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending    |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | pending    |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | pending    |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | pending    |

## テストカバレッジ目標

| 指標              | 目標     |
| ----------------- | -------- |
| Line Coverage     | 90% 以上 |
| Branch Coverage   | 80% 以上 |
| Function Coverage | 90% 以上 |

## 統合テスト連携（Phase 1〜11）

| Phase | 連携内容                 |
| ----- | ------------------------ |
| 1     | 接続要件を要件定義へ記録 |
| 2     | 契約を設計へ固定         |
| 3     | レビューで承認           |
| 4     | Red ケース定義           |
| 5     | Green化で接続確認        |
| 6     | 回帰防止ケース追加       |
| 7     | カバレッジ寄与評価       |
| 8     | リファクタ後再検証       |
| 9     | 品質監査へ取り込み       |
| 10    | 最終レビュー証跡化       |
| 11    | 実機導線確認             |

## Phase完了時の必須アクション

1. 本Phaseタスクを全件完了する。
2. 成果物を outputs/phase-N/ に記録する。
3. 検証コマンドを実行する。
4. 次Phaseへ引き継ぎ事項を記録する。

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001
```

## aiworkflow-requirements 抽出結果

詳細は outputs/phase-1/aiworkflow-requirements-extraction.md を参照する。
