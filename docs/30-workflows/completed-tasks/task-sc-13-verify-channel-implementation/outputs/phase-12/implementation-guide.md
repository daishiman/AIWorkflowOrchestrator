# Phase 12 実装ガイド

## メタ情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| タスクID | TASK-SC-13                         |
| 作成日   | 2026-04-08                         |
| 対象     | `skill-creator:verify` IPC surface |

## Part 1: 中学生向け説明

### これは何か

`skill-creator:verify` は、作ったスキルがちゃんと必要なファイルや説明を持っているかを調べる受付です。

図書館でたとえると、利用者は受付で「この本、貸し出せる状態ですか」と聞きます。受付は裏側の担当者に確認を頼み、結果だけを分かりやすく返します。

- 受付: IPC チャネル `skill-creator:verify`
- 裏側の担当者: `RuntimeSkillCreatorFacade`
- 実際に点検する人: `SkillCreatorVerificationEngine`

### なぜ必要か

スキルは、名前だけ正しくても中身が足りないことがあります。

- `SKILL.md` がない
- `agents/` が空
- `Anchors` の書き方が崩れている

こういう見落としを、作ったあとでまとめて見つけるために verify が必要です。

### 何をしているか

1. 画面側が `verifySkill(skillName, authMode, apiKey)` を呼ぶ
2. Main 側で `skillName` から実際のスキルフォルダを探す
3. 検証エンジンがそのフォルダを点検する
4. 結果を「通過したか」「どこが問題か」の形で返す

## Part 2: 技術者向け説明

### 公開 API

```typescript
verifySkill(
  skillName: string,
  authMode?: AuthMode,
  apiKey?: string | null,
): Promise<IpcResult<VerifyResult>>
```

### 公開 DTO

```typescript
export type VerifyCheckResult = {
  checkId: string;
  label: string;
  passed: boolean;
  message?: string;
};

export type VerifyResult = {
  skillName: string;
  passed: boolean;
  checkResults: VerifyCheckResult[];
  summary: string;
};
```

### 内部フロー

1. `apps/desktop/src/preload/skill-creator-api.ts`
   `verifySkill()` が `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VERIFY, { ... })` を呼ぶ
2. `apps/desktop/src/preload/channels.ts`
   `IPC_CHANNELS` と `ALLOWED_INVOKE_CHANNELS` に verify を追加する
3. `apps/desktop/src/main/ipc/creatorHandlers.ts`
   `validateSender + isBlank + sanitizeErrorMessage` で verify handler を登録する
4. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
   `skillName` を `skillDir` に解決し、`verificationEngine.verify(skillDir)` を呼ぶ

### skillName -> skillDir 解決

- 公開 surface は `skillName` を受ける
- 検証エンジンは `skillDir` を要求する
- そのため Facade で `SkillLocator.resolveSkillDir(skillName, process.cwd())` を使う

この方針を取る理由:

- `SkillFileManager.findSkillDir()` は private
- `SkillLocator` は `SKILL.md` の `name:` を正本にして解決できる

### 変換ルール

- `RuntimeSkillCreatorVerifyCheck.id` -> `VerifyCheckResult.checkId`
- `RuntimeSkillCreatorVerifyCheck.summary` -> `VerifyCheckResult.label`
- `RuntimeSkillCreatorVerifyCheck.severity === "info"` -> `VerifyCheckResult.passed = true`
- `RuntimeSkillCreatorVerifyCheck.evidenceSummary` -> `VerifyCheckResult.message`

### エラーハンドリング

- 入力エラー: handler 側で `skillName が指定されていません`
- 実行時例外: `sanitizeErrorMessage(error, "verify の実行に失敗しました")`
- 返却契約: `error` は常に `string`

### 4層アーキテクチャ図

```text
shared channels.ts
  -> preload/channels.ts
  -> creatorHandlers.ts
  -> RuntimeSkillCreatorFacade.verify()
  -> SkillCreatorVerificationEngine.verify(skillDir)
```

### 参照

- `docs/30-workflows/task-sc-13-verify-channel-implementation/outputs/phase-2/type-interface-design.md`
- `docs/30-workflows/task-sc-13-verify-channel-implementation/outputs/phase-2/ipc-flow-diagram.md`
