# Phase 11: DevTools確認結果

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001       |
| 実行日   | 2026-02-22                                |
| 検証方式 | コードフロー追跡 + テスト結果ベースの検証 |

## 検証方式

Electronアプリ起動環境がないため、DevToolsの直接確認の代わりにコードフロー全体を追跡し、IPCチャンネルに渡される値を静的に検証した。

---

## 1. IPC引数のデータフロー追跡

### 修正前（バグ状態）

```
SkillImportDialog handleImport:
  selectedIds を直接 onImport に渡す
  -> selectedIds = Set<skill.id>  (例: "a1b2c3d4e5f6g7h8")
  -> onImport([...selectedIds]) で skill.id がそのまま渡される
  -> skill:import(skill.id) = "a1b2c3d4e5f6g7h8"
  -> skillService.importSkills(["a1b2c3d4e5f6g7h8"])
  -> VALIDATION_ERROR または IMPORT_ERROR（ハッシュ値はスキル名として無効）
```

### 修正後（現在のコード）

```
SkillImportDialog handleImport (index.tsx 96-102行目):
  const selectedNames = availableSkills
    .filter((skill) => selectedIds.has(skill.id))
    .map((skill) => skill.name);           // <-- id -> name 変換
  onImport(selectedNames);

  -> selectedIds = Set<skill.id>  (例: "skill-1")
  -> availableSkills.filter で該当スキルを取得
  -> .map((skill) => skill.name) で name を抽出 (例: "tdd-principles")
  -> onImport(["tdd-principles"])

AgentView handleImport (index.tsx 219-240行目):
  async (skillNames: string[]) => {
    for (const skillName of skillNames) {
      await importSkillAction(skillName);  // "tdd-principles"
    }
  }

agentSlice importSkill (agentSlice.ts 600-622行目):
  -> window.electronAPI.skill.import(skillName)  // "tdd-principles"

preload/skill-api.ts import (261-262行目):
  -> safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)  // "tdd-principles"

skillHandlers.ts skill:import handler (120-158行目):
  -> skillName: string = "tdd-principles"
  -> P42準拠3段バリデーション: typeof === "string" && .trim() !== ""  -> PASS
  -> skillService.importSkills(["tdd-principles"])  -> 正常実行
```

## 2. IPC引数の値検証

### Console出力で期待される値

| チャンネル   | 引数名    | 期待値（修正後）   | 旧値（バグ時）                         |
| ------------ | --------- | ------------------ | -------------------------------------- |
| skill:import | skillName | `"tdd-principles"` | `"a1b2c3d4e5f6g7h8"` (SHA-256ハッシュ) |
| skill:import | skillName | `"code-review"`    | `"b2c3d4e5f6g7h8i9"` (SHA-256ハッシュ) |

### テストによる値検証

```
# SkillImportDialog.test.tsx "onImportに渡される値にskill.idが含まれない"
expect(passedValues).not.toContain("skill-1");    // PASS: skill.id が含まれない
expect(passedValues).toContain("tdd-principles");  // PASS: skill.name が含まれる

# AgentView.test.tsx "should call importSkill and closeImportDialog on successful import"
expect(mockImportSkill).toHaveBeenCalledWith("ImportableSkill");  // PASS: skill.name で呼ばれる
```

## 3. バリデーション通過確認

IPCハンドラ（skillHandlers.ts 131行目）のP42準拠3段バリデーション:

```typescript
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

| 入力値               | typeof   | trim() === "" | バリデーション結果                                  |
| -------------------- | -------- | ------------- | --------------------------------------------------- |
| `"tdd-principles"`   | "string" | false         | PASS（通過）                                        |
| `"code-review"`      | "string" | false         | PASS（通過）                                        |
| `"a1b2c3d4e5f6g7h8"` | "string" | false         | PASS（通過するがスキル名として無効 = 旧バグの症状） |

修正後は人間可読なスキル名が渡されるため、バリデーション通過後にskillServiceでも正常に処理される。

## 4. エラーログの非発生確認

修正後のコードフローでは以下のエラーが発生しないことを確認:

- `VALIDATION_ERROR: skillName must be a non-empty string` -- 発生しない（有効なスキル名が渡される）
- `IMPORT_ERROR: Failed to import skill: xxx` -- 発生しない（有効なスキル名でインポートが成功する）
- `VALIDATION_ERROR: skillIds must be an array` -- 発生しない（旧インターフェースは既に修正済み: UT-FIX-SKILL-IMPORT-INTERFACE-001）

## 5. Network/IPC通信の確認

Preload層の `skill-api.ts` 261行目:

```typescript
import: (skillName: string): Promise<ImportedSkill> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName),
```

- `IPC_CHANNELS.SKILL_IMPORT` = `"skill:import"` （channels.ts 175行目）
- `safeInvoke` 経由で `ipcRenderer.invoke("skill:import", "tdd-principles")` が実行される
- ハードコード文字列ではなく `IPC_CHANNELS` 定数を使用（P27対策済み）

## 結論

コードフロー追跡とテスト結果により、以下を確認:

1. IPCに渡される値は人間可読なスキル名（`skill.name`）であり、SHA-256ハッシュ（`skill.id`）ではない
2. 全レイヤーで `skillName` パラメータ名が一貫して使用されている（P45対策済み）
3. P42準拠の3段バリデーションを通過する有効な値が渡される
4. Console/Networkに `VALIDATION_ERROR` や `IMPORT_ERROR` が表示されるパスは存在しない
