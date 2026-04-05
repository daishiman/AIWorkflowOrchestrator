# Phase 1: 要件定義 -- 完了チェックリスト

## タスクID: TASK-SDK-SC-04

## 実行日: 2026-04-05

## 現状調査結果

### 既存ファイル確認

| ファイル                                                                         | 存在 | 状態                                                                                            |
| -------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`            | あり | 公開メソッド 6 件（extract/save/register/notify/handleSessionComplete/handleOverwriteApproved） |
| `apps/desktop/src/main/services/runtime/SkillRegistry.ts`                        | あり | `registerFromPath()` 実装済み                                                                   |
| `packages/shared/src/ipc/channels.ts`                                            | あり | `SKILL_CREATOR_OUTPUT_READY` 定数追記済み                                                       |
| `packages/shared/src/types/skillCreator.ts`                                      | あり | `ParsedSkillOutput` / `SkillOutputReadyPayload` 型追加済み                                      |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx` | あり | コンポーネント実装済み                                                                          |

### PC-001 確認: skill-creator SKILL.md マーカー

- `<!-- SKILL_START: {skillName} -->` / `<!-- SKILL_END: {skillName} -->` マーカー: **未追記**
- 現在の実装は属性付きマーカー（`<!-- SKILL_START: ... -->`）を正常系として扱いつつ、フォールバック戦略 B（アシスタント出力全体 + `name:` 抽出）でも動作する

## 完了条件チェック

- [x] PC-001（skill-creator SKILL.md へのマーカー追加）を前提条件として定義した
- [x] SDK セッション出力フローを調査し、スキル出力タイミング・形式を特定した
- [x] FR-001（SDK 出力からスキル抽出）を定義した
- [x] FR-001-B（マーカー不在時のフォールバック戦略）を定義した
- [x] FR-002（`.claude/skills/{dirName}/SKILL.md` への自動保存）を定義した
- [x] FR-003（`SkillRegistry` への自動登録）を定義した
- [x] FR-004（`skill-creator:output-ready` IPC 通知）を定義した
- [x] FR-005（スキルプレビュー表示）を定義した
- [x] FR-006（既存スキル上書き確認ダイアログ）を定義した
- [x] 受入基準 AC-01、AC-01B から AC-06 を定義した
- [x] スコープ外事項を明記した
