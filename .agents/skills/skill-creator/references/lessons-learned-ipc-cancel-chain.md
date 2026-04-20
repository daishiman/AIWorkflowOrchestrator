---
title: IPCキャンセルチェーン実装の教訓
category: lessons-learned
tags: [ipc, cancel, hook, skill-creator, verify-existing]
---

# IPCキャンセルチェーン実装の教訓

TASK-SW-CANCEL-004 (p04-seq-CANCEL-004) の実装から得られた知見。

## 1. verify_existingモードでの依存関係確認

既存実装を前提としたスキル設計（`implementation_mode: verify_existing`）では、
Phase 1で以下を確認してから仕様書を構成する:

- IPC 4層（shared channels / preload API / main handler / renderer hook）の実装状況
- 各層の接続（型定義・チャネル名・引数）
- テストカバレッジの現状

これを怠ると「未実装前提」の旧テンプレートが活性化し、false workが発生する。

### 確認コマンド例

```bash
# IPC チャネル定義の確認
grep -r "SKILL_CREATOR_CANCEL\|cancelGeneration" packages/shared/src/

# preload API の確認
grep -r "cancelGeneration" apps/desktop/src/preload/

# main handler の確認
grep -r "cancelGeneration\|skill-creator:cancel" apps/desktop/src/main/

# renderer hook の確認
grep -r "cancelGeneration\|useCancel" apps/desktop/src/renderer/
```

## 2. IPC failure swallow パターン（renderer hook）

キャンセル系IPCのrenderer hook実装では、IPC失敗をswallowし
ローカル状態（cancelled stage）を優先する設計が望ましい:

```typescript
const handleCancel = async () => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStreamingStage('cancelled');
  try {
    await window.skillCreatorAPI?.cancelGeneration?.();
  } catch {
    // IPC failure: ローカルabortが優先 → エラーを伝播しない
  }
};
```

**理由**: キャンセル操作はユーザー意図であり、IPCの成否に関係なくUI状態はcancelledを維持すべき。

### 適用判断基準

| 操作種別 | IPC失敗時の振る舞い | 理由 |
|---|---|---|
| キャンセル系 | swallow → ローカル状態優先 | ユーザー意図（中止）はIPC成否に依存しない |
| 取得系 | propagate → エラー表示 | データ取得失敗はユーザーへの通知が必要 |
| 送信系 | propagate → retry or 通知 | 送信失敗は明示的な再試行/通知が必要 |

## 3. optional chain 2段チェーン（preload API安全設計）

`window.skillCreatorAPI?.cancelGeneration?.()` の2段チェーンは:

- **1段目** (`window.skillCreatorAPI?`): preload APIオブジェクト自体の欠損ガード
- **2段目** (`cancelGeneration?.()`): 個別メソッドの欠損ガード（API version不一致）

これにより preload実装漏れや API version mismatchがあってもrendererがクラッシュしない。

### テストでの検証

テストでこの挙動を観測しておくことで設計意図が保存される（Phase 6 targeted test）:

```typescript
it('preload API欠損時もクラッシュしない', async () => {
  // window.skillCreatorAPI を undefined にして呼び出す
  (window as any).skillCreatorAPI = undefined;
  // クラッシュせずに完了することを確認
  await expect(handleCancel()).resolves.toBeUndefined();
});

it('cancelGenerationメソッド欠損時もクラッシュしない', async () => {
  // cancelGeneration メソッドのみ欠損
  (window as any).skillCreatorAPI = {};
  await expect(handleCancel()).resolves.toBeUndefined();
});
```

## 関連リソース

- **IPC統合パターン全般**: [integration-patterns-ipc.md](integration-patterns-ipc.md)
- **verify_existingモードの依存解決**: [agents/resolve-skill-dependencies.md](../agents/resolve-skill-dependencies.md)
- **パターン集**: [patterns.md](patterns.md)
