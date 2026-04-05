# Phase 3: 設計レビュー -- Skill Output Integration

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 3                        |
| 機能名     | skill-output-integration |
| タスクID   | TASK-SDK-SC-04           |
| 作成日     | 2026-04-02               |
| 依存 Phase | Phase 2（設計）          |

## 目的

Phase 2 の設計を 4 条件（矛盾なし / 漏れなし / 整合性あり / 依存関係整合）で検証し、実装フェーズへ進む準備が整っているかを確認する。既存スキル上書き時の整合性を特に重点的に確認する。

## 実行タスク

### Task 3-1: 矛盾なし — 既存スキル上書き時の整合性確認

| 確認項目                                                                                | 判定   | 根拠                                                                                                                                             |
| --------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `requiresOverwriteConfirm: true` の際にユーザーがキャンセルした場合の処理フローは明確か | OK     | `handleSessionComplete()` は確認待ち通知を送って return する。UI が `handleOverwriteApproved()` を呼ばなければ保存・登録・通知の続行は発生しない |
| `SkillRegistry.registerFromPath()` が重複登録時に上書きする設計は安全か                 | OK     | 上書き前に既存エントリを削除してから再登録するため、二重登録は発生しない                                                                         |
| `saveSkill()` でファイル上書き後に `SkillRegistry` 登録失敗した場合の整合性             | 要注意 | ファイルは保存済みだが Registry 未登録の状態になりうる。Phase 5 実装時にロールバック or 再試行ロジックを追加する                                 |
| `<!-- SKILL_START: {skillName} -->` マーカーが複数存在する場合の動作は定義されているか  | OK     | `match()` は最初に一致したマーカーを採用するため、最初のマーカーペアが採用される                                                                 |

**結論**: 上書き時のファイル保存成功・Registry 登録失敗パターンを Phase 5 実装時に明示的にハンドリングすること。

### Task 3-2: 漏れなし — FR-001 から FR-006 が全て設計に反映されているか

| 要件ID | 要件内容                                         | 設計への反映                                            | 判定 |
| ------ | ------------------------------------------------ | ------------------------------------------------------- | ---- |
| FR-001 | SDK 出力からスキル YAML / Markdown 抽出          | Phase 2 Task 2-2 でパース戦略・マーカー検出フローを定義 | OK   |
| FR-002 | `.claude/skills/{dirName}/SKILL.md` への自動保存 | Phase 2 Task 2-2 で `saveSkill()` メソッドを設計        | OK   |
| FR-003 | `SkillRegistry` への自動登録                     | Phase 2 Task 2-3 で `registerFromPath()` 追加を設計     | OK   |
| FR-004 | `skill-creator:output-ready` IPC 通知            | Phase 2 Task 2-5 で定数・Phase 2-2 で通知メソッドを設計 | OK   |
| FR-005 | スキルプレビュー表示                             | Phase 2 Task 2-4 で `SkillCreatorResultPanel` を設計    | OK   |
| FR-006 | 既存スキル上書き確認ダイアログ                   | Phase 2 Task 2-2 で上書き確認フローを設計               | OK   |

受入基準との対応確認:

| AC    | 受入基準                                               | 設計での対応                                                          | 判定 |
| ----- | ------------------------------------------------------ | --------------------------------------------------------------------- | ---- |
| AC-01 | マーカーを使ってスキル内容を正しく抽出できる           | `extractSkillFromOutput()` で SKILL_START/END マーカー検出            | OK   |
| AC-02 | スキルが正しいパスに保存される                         | `saveSkill()` で `{projectRoot}/.claude/skills/{dirName}/SKILL.md`    | OK   |
| AC-03 | 保存後に `SkillRegistry` に登録される                  | `registerToRegistry()` で `SkillRegistry.registerFromPath()` 呼び出し | OK   |
| AC-04 | `skill-creator:output-ready` IPC が発行される          | `notifyOutputReady()` で `SKILL_CREATOR_OUTPUT_READY` 送信            | OK   |
| AC-05 | `SkillCreatorResultPanel` がスキル名・プレビューを表示 | コンポーネント設計でスキル名見出し・コードブロックを定義              | OK   |
| AC-06 | 同名スキルが存在する場合に確認フラグが立つ             | 上書き確認フローで `requiresOverwriteConfirm: true` を設定            | OK   |

**結論**: 全要件・受入基準が設計に反映されている。

### Task 3-3: 整合性あり — IPC 命名規則・型定義との整合

| 確認項目                                                                             | 判定 | 根拠                                                             |
| ------------------------------------------------------------------------------------ | ---- | ---------------------------------------------------------------- |
| `skill-creator:output-ready` が既存の `skill-creator:*` 命名規則に準拠しているか     | OK   | 既存の `skill-creator:execute-plan` 等と同一プレフィックス       |
| `SKILL_CREATOR_OUTPUT_READY` 定数名が SCREAMING_SNAKE_CASE 規則に準拠しているか      | OK   | 既存の `SKILL_CREATOR_SUBMIT_CHOICE` 等と同一スタイル            |
| `ParsedSkillOutput` / `SkillOutputReadyPayload` が既存型定義ファイルに追加されるか   | OK   | `packages/shared/src/types/skillCreator.ts` への追加で整合       |
| `SkillCreatorResultPanel` のコンポーネント配置が既存ディレクトリ構造に準拠しているか | OK   | `apps/desktop/src/renderer/components/skill-creator/` 配下で整合 |

**結論**: IPC 命名規則・型定義・ディレクトリ構造との整合性に問題なし。

### Task 3-4: 依存関係整合 — TASK-SDK-SC-01/02/03 との統合確認

本タスク（TASK-SDK-SC-04）は step-03-seq であり、01/02/03 完了後に実行される。

| 依存タスク     | 提供する成果物                                      | 本タスクでの利用方法                             | 判定 |
| -------------- | --------------------------------------------------- | ------------------------------------------------ | ---- |
| TASK-SDK-SC-01 | SDK セッション実行基盤・`session-complete` イベント | `handleSessionComplete()` の呼び出しトリガー     | OK   |
| TASK-SDK-SC-02 | 質問エンジン（スキル生成 SDK セッション完了を担保） | 質問フロー完了後にセッション出力が生成される前提 | OK   |
| TASK-SDK-SC-03 | UI コンポーネント（`SkillLifecyclePanel` 等）       | `SkillCreatorResultPanel` を既存 UI に組み込む   | OK   |

**結論**: 依存タスク全ての成果物を適切に利用する設計になっている。

## 設計レビュー総合判定

| 条件         | 判定 | 備考                                                                         |
| ------------ | ---- | ---------------------------------------------------------------------------- |
| 矛盾なし     | OK   | ファイル保存成功・Registry 登録失敗パターンを Phase 5 でハンドリングすること |
| 漏れなし     | OK   | 全要件・受入基準が設計に反映されている                                       |
| 整合性あり   | OK   | IPC 命名規則・型定義・ディレクトリ構造との整合性に問題なし                   |
| 依存関係整合 | OK   | TASK-SDK-SC-01/02/03 の成果物を適切に利用する設計になっている                |

**総合判定: 実装フェーズへ進んでよい**

## 参照資料

| 資料名           | パス                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-1-requirements.md` |
| Phase 2 設計     | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-2-design.md`       |

## 成果物

| 成果物                       | パス                                                                                                                                                              | 形式     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 設計レビュー書（本ファイル） | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-3-design-review.md` | Markdown |

## 完了条件

- [ ] 矛盾なし条件（既存スキル上書き時の整合性）を確認した
- [ ] 漏れなし条件（FR-001 から FR-006 が設計に反映されている）を確認した
- [ ] 整合性あり条件（IPC 命名規則・型定義との整合）を確認した
- [ ] 依存関係整合条件（TASK-SDK-SC-01/02/03 との統合）を確認した
- [ ] 総合判定「実装フェーズへ進んでよい」を得た

## 次の Phase: Phase 4 (phase-4-test-creation.md)
