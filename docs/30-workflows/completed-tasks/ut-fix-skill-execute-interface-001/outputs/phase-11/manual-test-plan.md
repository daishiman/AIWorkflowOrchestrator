# Phase 11 手動テスト計画

## 目的

実装コードと仕様書の整合性を人手で点検し、実装着手リスクを下げる。
Main/Preload/Shared の確認順序を固定し、IPC契約ドリフト（P44/P45）の再発を防止する。

## 点検対象ファイル（確認順序固定）

### Layer 1: Shared（型定義）

| ファイル                                      | 確認内容                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| `packages/shared/src/types/skill.ts` L306-315 | `SkillExecutionRequest` の型定義（skillName, prompt, workingDirectory?） |
| `packages/shared/index.ts` L26                | `SkillExecutionRequest` のexport                                         |

### Layer 2: Main（IPCハンドラ）

| ファイル                                              | 確認内容                                                              |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` L216-284 | skill:execute ハンドラのユニオン型引数と型ガード `isSkillNameRequest` |
| 同上 L240-248                                         | skillName パスの P42準拠 3段バリデーション（typeof → empty → trim）   |
| 同上 L249-253                                         | skillId パスの P42準拠 3段バリデーション                              |
| 同上 L257-268                                         | skillName → scanAvailableSkills() → skill.id 解決 → executeSkill 委譲 |
| 同上 L271-274                                         | skillId 直接パス → executeSkill(skillId, params)                      |

### Layer 3: Preload（API公開）

| ファイル                                | 確認内容                                                                                |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` | `safeInvoke(IPC_CHANNELS.SKILL_EXECUTE, ...)` の引数がSkillExecutionRequestと一致するか |
| `apps/desktop/src/preload/channels.ts`  | `SKILL_EXECUTE` チャネル定数の定義確認                                                  |

## 点検シナリオ（Task 11-1）

### シナリオ1: IPC契約整合

- [ ] Shared `SkillExecutionRequest.skillName` と Main ハンドラの `isSkillNameRequest` 型ガードが一致
- [ ] Preload の `safeInvoke` 呼び出し引数が `SkillExecutionRequest` 形式と一致
- [ ] ハンドラのユニオン型 `SkillExecutionRequest | { skillId: string; params?: Record<string, unknown> }` が設計通り
- [ ] 引数名のセマンティクス: skillName は名前、skillId はID（P45準拠）

### シナリオ2: バリデーション網羅（P42準拠）

- [ ] skillName パス: `typeof !== "string"` チェック
- [ ] skillName パス: `.trim() === ""` チェック（空白のみ文字列を拒否）
- [ ] skillId パス: `typeof !== "string"` チェック
- [ ] skillId パス: `.trim() === ""` チェック
- [ ] prompt バリデーション: 未実装の場合はスコープ確認（仕様書の指摘事項として記録）

### シナリオ3: エラーハンドリング

- [ ] バリデーション失敗時: `{ code: "VALIDATION_ERROR", message: "..." }` を throw
- [ ] スキル不存在時: `{ success: false, error: "スキルが見つかりません" }` を返却
- [ ] サービス例外時: `{ success: false, error: error.message }` でラップ
- [ ] validateIpcSender 失敗時: `toIPCValidationError` で例外送出

### シナリオ4: テスト網羅

- [ ] `skillHandlers.execute.test.ts`: 23テスト（skillNameパス/skillIdパスの正常系/異常系）
- [ ] `skillHandlers.validation.test.ts`: 55テスト（3段バリデーション、型不正、空白文字列）
- [ ] `skillHandlers.delegate.test.ts`: 12テスト（サービス委譲、エラー伝播）
- [ ] 合計90テスト全PASS

## 成否判定

- 全チェック項目が合格: Phase 12 へ引き継ぎ可
- 1件以上の不合格: 該当 Phase（Phase 2 設計 or Phase 5 実装）へ差し戻し

## 完了記録

- [x] Task 11-1 完了（手動点検シナリオ定義）
- [x] Main/Preload/Shared 確認順序を固定
- [x] 4シナリオ・18チェック項目を定義
- [x] Phase 11タスク実行率: 100%
