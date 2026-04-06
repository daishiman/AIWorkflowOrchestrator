# TASK-SDK-SC-04: Skill Output Integration — 実装ガイド

## 概要

SDK セッション完了時に skill-creator が生成したスキル出力を捕捉し、
`.claude/skills/{skill-name}/SKILL.md` に保存、`SkillRegistry` に登録、
UI でスキル生成完了を通知・プレビュー表示するパイプラインを実装した。

本タスクは TASK-SDK-SC-01/02/03 の最終統合タスクであり、SDK インタラクティブスキルクリエイター機能を完成させる。

---

## 変更ファイル一覧

| ファイル                                                                         | 変更種別 | 変更内容                                                             |
| -------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `packages/shared/src/ipc/channels.ts`                                            | 更新     | `SKILL_CREATOR_OUTPUT_READY` 定数追加・`IPC_CHANNELS` スプレッド追加 |
| `packages/shared/src/types/skillCreator.ts`                                      | 更新     | `ParsedSkillOutput` / `SkillOutputReadyPayload` 型追加               |
| `apps/desktop/src/main/services/runtime/SkillRegistry.ts`                        | 新規作成 | インメモリスキルレジストリ（`registerFromPath()` 含む）              |
| `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`            | 新規作成 | スキル出力捕捉・保存・登録・通知ハンドラー                           |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx` | 新規作成 | スキル生成完了通知・プレビュー表示コンポーネント                     |

## 追加テストファイル

| ファイル                                                                                        | 備考                       |
| ----------------------------------------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorOutputHandler.test.ts`            | OutputHandler の仕様テスト |
| `apps/desktop/src/main/services/runtime/__tests__/SkillRegistry.test.ts`                        | Registry の登録テスト      |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorResultPanel.test.tsx` | ResultPanel の UI テスト   |

---

## アーキテクチャ概要

```
SDK セッション出力 (string)
  ↓
SkillCreatorOutputHandler.handleSessionComplete()
  ↓
extractSkillFromOutput()  ← <!-- SKILL_START/END --> マーカー検出（無い場合は出力全体でフォールバック）
  ↓
fs.access() による既存ファイル確認
  ├─ 存在する → notifyOutputReady({ requiresOverwriteConfirm: true })
  │              ↑ UI が確認ダイアログ表示 → handleOverwriteApproved()
  └─ 存在しない
       ↓
     saveSkill()  ← .claude/skills/{name}/SKILL.md に保存
       ↓
     registerToRegistry()  ← SkillRegistry.registerFromPath()
       ↓
     notifyOutputReady()  ← IPC: skill-creator:output-ready
       ↓
SkillCreatorResultPanel (Renderer)
  ├─ スキル名見出し
  ├─ 保存先パス
  ├─ SKILL.md プレビュー（コードブロック）
  └─ 「スキルを開く」ボタン
```

---

## 統合方法（TASK-SDK-SC-01 との接続）

`SkillCreatorIpcBridge` の `onComplete` コールバックで `handleSessionComplete` を呼び出す:

```typescript
// SkillCreatorIpcBridge.ts（SC-01）の onComplete に追加
const outputHandler = new SkillCreatorOutputHandler(
  projectRoot,
  skillRegistry,
  window.webContents,
);
// SDK セッション完了時
onComplete: async (sessionOutput: string) => {
  await outputHandler.handleSessionComplete(sessionOutput);
};
```

Renderer 側は Preload の `skillCreatorAPI.onOutputReady()` 経由でペイロードを受け取り、
`SkillCreatorResultPanel` に渡す（`SkillCreatorConversationPanel` 内に組み込み）:

```typescript
// Renderer でのリスナー例
const outputApi = window.skillCreatorAPI ?? window.electronAPI?.skillCreator;
const cleanup = outputApi?.onOutputReady((payload) => {
  setResultPayload(payload);
});
```

---

## スキル出力マーカー仕様

skill-creator が生成するスキル出力には以下のマーカーが必要:

```
<!-- SKILL_START: {skillName} -->
name: {skillName}
description: ...
(SKILL.md 全内容)
<!-- SKILL_END: {skillName} -->
```

マーカーが存在しない場合はフォールバックとして出力全体を SKILL.md とみなし、
`name:` が見つからない場合のみサイレントに処理をスキップする。

---

## テスト品質

| ファイル                       | Lines  | Branch | Funcs |
| ------------------------------ | ------ | ------ | ----- |
| `SkillCreatorOutputHandler.ts` | 96.46% | 90%    | 100%  |
| `SkillRegistry.ts`             | 100%   | 100%   | 100%  |
| `SkillCreatorResultPanel.tsx`  | 100%   | 100%   | 100%  |

TypeScript エラー: 0件 / ESLint エラー: 0件

---

## スクリーンショット参照

Phase 11 ハーネスで取得した結果表示のスクリーンショットを参照できる。

- `outputs/phase-11/task-sdk-sc-02/screenshots/TC-11-09-complete-state.png`
- `outputs/phase-11/task-sdk-sc-02/screenshots/TC-11-11-result-panel-ready.png`
- `outputs/phase-11/task-sdk-sc-02/screenshots/TC-11-12-result-panel-overwrite.png`

---

## 完了条件チェック

- [x] `SkillCreatorOutputHandler` クラスが実装済み
- [x] `SkillCreatorResultPanel` コンポーネントが実装済み
- [x] `SkillRegistry.registerFromPath()` が追加済み
- [x] `channels.ts` に `SKILL_CREATOR_OUTPUT_READY` が追加済み
- [x] TypeScript コンパイルエラー 0件
- [x] 全テスト PASS（26件）
