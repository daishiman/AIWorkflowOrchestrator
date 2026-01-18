# 修正設計書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| 作成日     | 2026-01-17             |
| Phase      | 2                      |
| ステータス | 完了                   |
| 作成者     | Claude Code (自動生成) |

---

## 修正方針

**方針**: preload側をオブジェクト形式に変更し、handler側の期待形式に合わせる

**理由**:

1. handler側は既に正しい形式（オブジェクト形式）で実装されている
2. preload側の修正のみで対応可能（影響範囲が限定的）
3. 他のIPCハンドラーとの一貫性を保てる

---

## 修正内容詳細

### 修正1: import メソッド

**ファイル**: `apps/desktop/src/renderer/preload/index.ts`

**修正箇所**: Line 58-66

**Before**:

```typescript
import: async (skillIds: string[]) => {
  if (hasElectronAPI(window)) {
    return window.electronAPI.invoke<OperationResult<void>>(
      "skill:import",
      skillIds,  // ← 配列を直接渡している
    );
  }
  return { success: true };
},
```

**After**:

```typescript
import: async (skillIds: string[]) => {
  if (hasElectronAPI(window)) {
    return window.electronAPI.invoke<OperationResult<void>>(
      "skill:import",
      { skillIds },  // ← オブジェクト形式に変更
    );
  }
  return { success: true };
},
```

---

### 修正2: remove メソッド

**ファイル**: `apps/desktop/src/renderer/preload/index.ts`

**修正箇所**: Line 68-75

**Before**:

```typescript
remove: async (skillId: string) => {
  if (hasElectronAPI(window)) {
    return window.electronAPI.invoke<OperationResult<void>>(
      "skill:remove",
      skillId,  // ← 文字列を直接渡している
    );
  }
  return { success: true };
},
```

**After**:

```typescript
remove: async (skillId: string) => {
  if (hasElectronAPI(window)) {
    return window.electronAPI.invoke<OperationResult<void>>(
      "skill:remove",
      { skillId },  // ← オブジェクト形式に変更
    );
  }
  return { success: true };
},
```

---

### 修正3: getDetail メソッド

**ファイル**: `apps/desktop/src/renderer/preload/index.ts`

**修正箇所**: Line 77-86

**Before**:

```typescript
getDetail: async (skillId: string) => {
  if (hasElectronAPI(window)) {
    return window.electronAPI.invoke<OperationResult<Skill>>(
      "skill:get-detail",
      skillId,  // ← 文字列を直接渡している
    );
  }
  return { success: false, error: "Skill not found" };
},
```

**After**:

```typescript
getDetail: async (skillId: string) => {
  if (hasElectronAPI(window)) {
    return window.electronAPI.invoke<OperationResult<Skill>>(
      "skill:get-detail",
      { skillId },  // ← オブジェクト形式に変更
    );
  }
  return { success: false, error: "Skill not found" };
},
```

---

## 型定義の整合性

### SkillAPI インターフェース

**変更不要**: メソッドシグネチャ（引数・戻り値の型）は変更なし

```typescript
export interface SkillAPI {
  import: (skillIds: string[]) => Promise<OperationResult<void>>;
  remove: (skillId: string) => Promise<OperationResult<void>>;
  getDetail: (skillId: string) => Promise<OperationResult<Skill>>;
  // ...
}
```

外部から見た API の形式は変わらない。内部実装（IPC呼び出し）のみ変更。

---

## 後方互換性評価

| 評価項目                      | 影響 | 説明                                |
| ----------------------------- | ---- | ----------------------------------- |
| SkillAPI インターフェース     | なし | 変更なし                            |
| 呼び出し元コード              | なし | skillAPI.import([...]) の形式は不変 |
| handler側（skillHandlers.ts） | なし | 変更不要                            |
| 他のIPCハンドラー             | なし | 独立している                        |

**結論**: 後方互換性への影響なし

---

## 修正サマリー

| ファイル                                     | 修正行  | 修正内容                    |
| -------------------------------------------- | ------- | --------------------------- |
| `apps/desktop/src/renderer/preload/index.ts` | Line 61 | `skillIds` → `{ skillIds }` |
| `apps/desktop/src/renderer/preload/index.ts` | Line 71 | `skillId` → `{ skillId }`   |
| `apps/desktop/src/renderer/preload/index.ts` | Line 81 | `skillId` → `{ skillId }`   |

**総修正ファイル数**: 1
**総修正箇所数**: 3
