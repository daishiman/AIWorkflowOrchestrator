# Phase 2 成果物: IPC統合戦略書

## 方針Bの根拠

TASK-UI-02 では Session IPC の廃止（全メソッド no-op 化）と
`validateSender` の均一化が完了した。残件として renderer 2コンポーネントが
旧経路 `window.electronAPI.skillCreator` を直接参照していた。

### 方針Aとの比較（alias全撤去 vs renderer移行）

| 方針                    | 内容                              | コスト                        | リスク                         |
| ----------------------- | --------------------------------- | ----------------------------- | ------------------------------ |
| A: alias全撤去          | `electronAPI.skillCreator` を削除 | 高（repo-wide影響調査が必要） | 見落としで実行時エラーの可能性 |
| **B: renderer移行のみ** | renderer の2参照のみ変更          | **低（2ファイル変更）**       | **最小（テスト更新のみ）**     |

→ **方針Bを採用**: 最小コストで受入条件を満たす。

---

## 新機能開発者向けガイドライン

### renderer での IPC 呼び出し規則

```typescript
// ✅ 正しい: window.skillCreatorAPI を使用
await window.skillCreatorAPI.applyRuntimeImprovement(skillName, suggestions);
const state = await window.skillCreatorAPI.getGovernanceState();

// ❌ 禁止: window.electronAPI.skillCreator は新規 renderer から使用しない
await window.electronAPI.skillCreator.applyRuntimeImprovement(...); // 禁止
```

### preload での互換シム維持

```typescript
// preload/index.ts - 互換シムとして残存（renderer からの direct ref 禁止）
electronAPI = {
  skillCreator: skillCreatorAPI,  // ← 互換シム（削除は将来 follow-up task）
  ...
};

// canonical 公開（renderer はこちらを使用）
contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI);
```

### 削除手順（将来 follow-up task 向け）

1. `grep -rn "window.electronAPI.skillCreator" apps/desktop/src/renderer` が 0件であることを確認
2. `preload/index.ts` から `skillCreator: skillCreatorAPI` を削除
3. 型定義から `electronAPI.skillCreator` を除去

---

## 完了確認

- [x] 方針Bの根拠が明文化されている
- [x] 新機能開発者向けガイドラインが記載されている
- [x] 互換シム削除の条件・手順が明記されている
