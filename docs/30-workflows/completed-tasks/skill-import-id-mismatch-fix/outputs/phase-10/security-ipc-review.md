# Phase 10 タスク5: セキュリティ・IPC 契約レビュー

## タスクID: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## 実行日: 2026-02-22

## 結果: セキュリティ・IPC 契約 PASS

## データフロー全体確認

```
SkillImportDialog (index.tsx:96-101)
  └─ selectedIds.has(skill.id) で選択済み判定（内部状態はID）
  └─ availableSkills.filter(s => selectedIds.has(s.id)).map(s => s.name) で name に変換
  └─ onImport(selectedNames: string[])  ← skill.name の配列
      │
      ▼
AgentView.handleImport(skillNames: string[]) (index.tsx:220)
  └─ for (const skillName of skillNames) (index.tsx:222)
      └─ importSkillAction(skillName) (index.tsx:223)
          │
          ▼
agentSlice.importSkill(skillName: string) (agentSlice.ts:600)
  └─ window.electronAPI.skill.import(skillName)
      │
      ▼
Preload API: skill-api.ts (line 261-262)
  └─ import: (skillName: string) => safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)
      │
      ▼
Main Process: skillHandlers.ts (line 121-157)
  └─ ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, (event, skillName: string))
  └─ P42準拠3段バリデーション: typeof skillName !== "string" || skillName.trim() === ""
  └─ skillService.importSkills([skillName])
  └─ skillService.getSkillByName(skillName)  ← skill.name と比較して一致
```

## セキュリティチェックリスト

| チェック項目       | 確認内容                                                                                                | 結果 | 根拠                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------- |
| P44 再発確認       | skill:import ハンドラーの引数形式と Preload 呼び出しが一致しているか                                    | PASS | ハンドラー: `(event, skillName: string)` / Preload: `safeInvoke(SKILL_IMPORT, skillName)` → 両方 `string` |
| P45 再発確認       | 全レイヤーの引数名が `skillName`（スキル名）を示すセマンティクスか                                      | PASS | 全6レイヤーで `skillName` / `skillNames` / `selectedNames` が使用されている。全てスキル名を示す           |
| P42 バリデーション | Main Process で `typeof skillName !== "string" \|\| skillName.trim() === ""` チェックが実装されているか | PASS | `skillHandlers.ts:131` で3段バリデーション実装済み                                                        |
| チャンネル定数     | `IPC_CHANNELS.SKILL_IMPORT` 定数が使用されていること（ハードコード文字列でないこと）                    | PASS | `skillHandlers.ts:122` と `skill-api.ts:262` の両方で `IPC_CHANNELS.SKILL_IMPORT` を使用                  |
| 送信元検証         | `validateIpcSender` が呼び出されていること                                                              | PASS | `skillHandlers.ts:124-128` で `validateIpcSender(event, IPC_CHANNELS.SKILL_IMPORT, ...)` を確認           |

## P44 パターン（IPC インターフェース不整合）の詳細検証

### ハンドラー側（skillHandlers.ts:121-123）

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event: IpcMainInvokeEvent, skillName: string) => {
```

### Preload側（skill-api.ts:261-262）

```typescript
import: (skillName: string): Promise<ImportedSkill> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName),
```

**判定**: ハンドラーは `string` 型の第2引数を受け取り、Preload は `string` を渡す。インターフェースが完全に一致。P44パターンの再発なし。

## P45 パターン（引数命名ドリフト）の詳細検証

| レイヤー          | 変数名/引数名   | セマンティクス | 一致 |
| ----------------- | --------------- | -------------- | ---- |
| SkillImportDialog | `selectedNames` | スキル名の配列 | PASS |
| AgentView         | `skillNames`    | スキル名の配列 | PASS |
| AgentView ループ  | `skillName`     | 単一スキル名   | PASS |
| agentSlice        | `skillName`     | 単一スキル名   | PASS |
| Preload API       | `skillName`     | 単一スキル名   | PASS |
| Main Process      | `skillName`     | 単一スキル名   | PASS |
| SkillService      | `skillName`     | 単一スキル名   | PASS |

**判定**: 全レイヤーで引数名と値のセマンティクスが一致。P45パターンの再発なし。

## P42 パターン（.trim() バリデーション）の検証

```typescript
// skillHandlers.ts:131
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

**判定**: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）が実装済み。P42パターン準拠。

## 結論

IPC 契約は全レイヤーで整合している。P44（インターフェース不整合）・P45（引数命名ドリフト）・P42（.trim()バリデーション漏れ）のいずれのパターンも再発していない。送信元検証（validateIpcSender）とチャンネル定数（IPC_CHANNELS）の使用も確認済み。
