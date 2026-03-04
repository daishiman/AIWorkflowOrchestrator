# Phase 12 実装ガイド

## Part 1: 中学生向け（なぜ必要で、何をしたか）

### なぜ必要か

同じスキルをもう一度「追加」したとき、システムが毎回裏側へ問い合わせると、無駄な処理が増えてログも増えます。  
これは、図書館で「もう借りている本」を毎回カウンターで新規手続きしようとするのと同じです。

### 何をしたか

- すでに追加済みなら「成功だけ返して終わる」ようにしました。
- 追加中に同じボタンを連打しても、同じ処理を何回も走らせないようにしました。
- 画面でも「追加中」「追加済み」を分かりやすく表示し、状態が崩れないことを確認しました。

## Part 2: 技術者向け（契約・実装・検証）

### 変更ファイル

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts`

### 主要インターフェース/型

```ts
type ImportSkill = (skillName: string) => Promise<void>;

interface ImportedSkill {
  name: string;
  path: string;
  importedAt: string | Date;
}
```

### APIシグネチャと使用例

```ts
// Preload API
window.electronAPI.skill.import(skillName: string): Promise<ImportedSkill>;

// Store action
importSkill(skillName: string): Promise<void>;
```

```ts
// Hook内の利用
if (addingSkills.has(skillName)) return;
if (importedSkillNames.includes(skillName)) {
  await importSkill(skillName);
  return;
}
```

### 実装ポイント

1. Main IPC (`skill:import`)

- 成功判定を `errors.length === 0` 基準に統一。
- `importedCount=0`（既存追加済み）でも `ImportedSkill` を返す。

2. Store (`agentSlice.importSkill`)

- 既存インポート済みなら IPC 呼び出し前に早期終了。
- 早期終了時も `availableSkillsMetadata` の同期を行う。

3. UI Hook (`useSkillCenter.handleAddSkill`)

- `addingSkills.has(skillName)` で追加中の再実行を抑止。
- 既存インポート済みの場合は成功アニメーションを開始せず状態同期のみ実施。

### エラーハンドリング/エッジケース

- `skillName` が空文字・空白のみ: `VALIDATION_ERROR`
- 既存追加済みで再実行: エラーにせず成功扱い（冪等）
- 追加中の同一スキル再操作: 無視（重複実行防止）

### 設定値/定数

| 項目                                | 値       | 用途                          |
| ----------------------------------- | -------- | ----------------------------- |
| AddButton成功アニメーション解除待ち | `1500ms` | `addingSkills` 解除タイミング |
| Importモック遅延（Phase 11撮影）    | `900ms`  | `processing` 状態の視覚検証   |

### テスト・検証結果

- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts` -> 70 PASS
- `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` -> 59 PASS
- `pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts` -> 13 PASS
- 合計: 3 files / 142 tests PASS
