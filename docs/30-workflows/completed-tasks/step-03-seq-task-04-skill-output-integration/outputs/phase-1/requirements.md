# Phase 1 成果物: 要件定義 — TASK-SDK-SC-04

## 調査完了: SDK セッション出力フロー

| 観点           | 内容                                                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 出力タイミング | SDK セッションが正常終了（`session-complete`）した時点                                                                                                   |
| 出力形式       | `<!-- SKILL_START: {skillName} -->` / `<!-- SKILL_END: {skillName} -->` マーカー囲み（戦略A）、またはアシスタントメッセージ全体（戦略B・フォールバック） |
| 保存先         | `.claude/skills/{skill-name}/SKILL.md`                                                                                                                   |
| 登録先         | `SkillRegistry`（Electron Main プロセス）                                                                                                                |
| UI 通知        | IPC `skill-creator:output-ready` イベント                                                                                                                |

## 機能要件

| ID       | 内容                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| FR-001   | SDK セッション出力からマーカーベースでスキル内容を抽出                        |
| FR-001-B | マーカー不在時: アシスタントメッセージ全体を利用し name: フィールドで名前取得 |
| FR-002   | `.claude/skills/{name}/SKILL.md` への自動保存（ディレクトリ自動作成）         |
| FR-003   | `SkillRegistry.registerFromPath()` による自動登録（重複時は上書き）           |
| FR-004   | `skill-creator:output-ready` IPC 通知（`SkillOutputReadyPayload` ペイロード） |
| FR-005   | `SkillCreatorResultPanel` でスキル名・プレビュー表示                          |
| FR-006   | 同名スキル存在時に `requiresOverwriteConfirm: true` を設定                    |

## 受入基準

| ID     | 基準                                                                     |
| ------ | ------------------------------------------------------------------------ |
| AC-01  | マーカーベースでスキル内容を正しく抽出できる                             |
| AC-01B | マーカー不在時はフォールバック戦略Bが適用される                          |
| AC-02  | 抽出したスキルが正しいパスに保存される                                   |
| AC-03  | 保存後に `SkillRegistry` にスキルが登録される                            |
| AC-04  | 保存・登録完了後に `skill-creator:output-ready` IPC が発行される         |
| AC-05  | `SkillCreatorResultPanel` がスキル名とプレビューを表示する               |
| AC-06  | 同名スキルが存在する場合に `requiresOverwriteConfirm: true` が設定される |
