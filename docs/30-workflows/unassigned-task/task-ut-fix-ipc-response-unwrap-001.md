# UT-FIX-IPC-RESPONSE-UNWRAP-001: IPC レスポンスラッパー未展開修正

## メタ情報

```yaml
issue_number: 819
```

## メタ情報

| 項目         | 値                                                                      |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001                                          |
| GitHub Issue | #813                                                                    |
| 種別         | バグ修正 (fix)                                                          |
| 優先度       | 高                                                                      |
| 見積もり     | Phase 1-13 完全実行                                                     |
| 前提タスク   | なし                                                                    |
| 検出元       | ランタイムエラー調査（2026-02-13）                                      |
| 関連Pitfall  | P19（型キャスト）, P23（API二重定義の型管理）, P24（Store型定義不統一） |

---

## 1. なぜこのタスクが必要か（Why）

AgentView コンポーネントで `importedSkills.forEach is not a function` ランタイムエラーが発生している。

**根本原因**: Main Process の IPC ハンドラ（`skillHandlers.ts`）が `{ success: true, data: skills }` 形式でレスポンスを返すが、Preload 層の `safeInvoke<T>()` がこのラッパーオブジェクトをそのまま通過させる。型注釈は `Promise<ImportedSkill[]>` と宣言しているが、実行時の値は `{ success: boolean, data: ImportedSkill[] }` である。結果、`agentSlice.ts` の `fetchSkills()` が非配列オブジェクトを `importedSkills` に格納し、`.forEach()` 呼び出しが失敗する。

**影響範囲**:

- `skill.getImported()` → `importedSkills` が配列でない → AgentView クラッシュ
- `skill.list()` → `availableSkillsMetadata` も同様の問題の可能性
- `skill.import()`, `skill.rescan()` も同じパターン

---

## 2. 何を達成するか（What）

### 受入基準

1. `window.electronAPI.skill.getImported()` が `ImportedSkill[]` を直接返す（ラッパーなし）
2. `window.electronAPI.skill.list()` が `SkillMetadata[]` を直接返す
3. `window.electronAPI.skill.import()` が `ImportedSkill` を直接返す
4. `window.electronAPI.skill.rescan()` が `SkillMetadata[]` を直接返す
5. AgentView で `importedSkills.forEach` が正常動作する
6. 型注釈と実行時の値が一致する
7. 既存テストが全て PASS する

### スコープ外

- `skill.execute()` や Permission API のレスポンス形式変更
- `agentSlice.ts` の `as unknown as Skill[]` 型キャスト除去（別タスク UT-FIX-5-1-001 スコープ）

---

## 3. どう実現するか（How）

### 方針: Preload 層でレスポンスを展開する

IPC ハンドラの `{ success, data }` ラッパーは他のハンドラとの一貫性のため維持し、Preload 層の `skill-api.ts` でラッパーを展開して `data` フィールドを返す。

### 修正対象ファイル

| ファイル                                | 修正内容                                                               |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` | `safeInvoke` の戻り値からラッパーを展開する                            |
| `apps/desktop/src/preload/skill-api.ts` | `list`, `getImported`, `import`, `rescan` の各メソッドでレスポンス展開 |

### 実装アプローチ

#### A案: 個別メソッドで展開（推奨）

```typescript
// skill-api.ts
getImported: async (): Promise<ImportedSkill[]> => {
  const result = await safeInvoke<{ success: boolean; data: ImportedSkill[] }>(
    IPC_CHANNELS.SKILL_GET_IMPORTED
  );
  if (!result.success) {
    throw new Error(result.error ?? "Failed to get imported skills");
  }
  return result.data;
},
```

#### B案: 汎用ラッパー展開関数

```typescript
async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const result = await safeInvoke<{
    success: boolean;
    data: T;
    error?: string;
  }>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error ?? `IPC call failed: ${channel}`);
  }
  return result.data;
}
```

### 設計判断のポイント

- A案は各メソッドの型が明示的で可読性が高い
- B案はDRYだが、全てのハンドラが同じレスポンス形式であることを前提とする
- エラーレスポンス（`{ success: false, error: "..." }`）のハンドリングも必要

---

## 4. 実行手順

### Phase 4: テスト作成

- `skill-api.ts` のレスポンス展開ロジックのユニットテスト
- `agentSlice.ts` の `fetchSkills()` が配列を受け取ることを検証するテスト
- エラーレスポンス時の例外スローテスト

### Phase 5: 実装

1. `skill-api.ts` の `list`, `getImported`, `import`, `rescan` メソッドを修正
2. レスポンスラッパー展開ロジックを追加
3. エラーレスポンス時に例外をスローする

### Phase 6-9: テスト拡充・品質検証

- 既存 AgentView テストの動作確認
- `pnpm typecheck && pnpm lint && pnpm test` 全パス

---

## 5. 完了条件

- [ ] `skill-api.ts` の4メソッドがレスポンスラッパーを展開する
- [ ] 型注釈と実行時の値が一致する
- [ ] エラーレスポンス時に適切な例外がスローされる
- [ ] AgentView で `importedSkills.forEach` が正常動作する
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS
- [ ] `pnpm test` PASS（関連テスト全パス）

---

## 6. 検証方法

### 自動テスト

```bash
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.test.ts
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.test.ts
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/__tests__/
```

### 手動テスト

1. アプリ起動後、Agent ビューを開く
2. スキル一覧が正常に表示される
3. DevTools コンソールに `forEach is not a function` エラーが出ない
4. スキルのインポート・削除が正常動作する

---

## 7. リスク・注意事項

- **P19パターン**: 型アサーションで隠れていた型不一致が顕在化する可能性
- **P23パターン**: `skill-api.ts` と `SkillAPI` インターフェースの型整合性を維持する必要がある
- **他ハンドラへの影響**: `skill.execute()` 等の他メソッドも同じ問題を持つ可能性がある（スコープ外だが調査推奨）

---

## 8. 参照情報

| 種別           | パス                                                           |
| -------------- | -------------------------------------------------------------- |
| クラッシュ箇所 | `apps/desktop/src/renderer/views/AgentView/index.tsx:151`      |
| Preload API    | `apps/desktop/src/preload/skill-api.ts:192-200`                |
| IPC ハンドラ   | `apps/desktop/src/main/ipc/skillHandlers.ts:94-115`            |
| Store Slice    | `apps/desktop/src/renderer/store/slices/agentSlice.ts:556-577` |
| 関連Pitfall    | `.claude/rules/06-known-pitfalls.md` P19, P23, P24             |
| 関連タスク     | TASK-FIX-5-1-SKILL-API-UNIFICATION, UT-FIX-5-1-001             |

---

## 9. 備考

- このバグは P19（型キャストによる実行時検証バイパス）の典型例
- `safeInvoke<T>()` のジェネリック型パラメータ `T` が IPC ハンドラの実際のレスポンス形式と一致しないことが根本原因
- 修正後は `as unknown as Skill[]` の型キャストも不要になる可能性がある（別タスクで対応）
