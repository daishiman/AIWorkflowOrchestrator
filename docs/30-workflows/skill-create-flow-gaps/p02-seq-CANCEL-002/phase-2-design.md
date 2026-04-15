# Phase 2: 設計

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| タスクID   | TASK-SW-CANCEL-002               |
| 機能名     | skill-creator-cancel-preload-api |
| 前提Phase  | Phase 1                          |
| 後続Phase  | Phase 3                          |
| 作成日     | 2026-04-15                       |
| ステータス | pending                          |

## 目的

`cancelGeneration` メソッドのインターフェース・実装・ホワイトリスト登録の設計を確定する。

## 設計内容

### 1. インターフェース設計

`apps/desktop/src/preload/skill-creator-api.ts` の `SkillCreatorAPI` インターフェースに追加:

```typescript
cancelGeneration: () => Promise<IpcResult<void>>;
```

追加位置: 既存の `createSkill` メソッド定義の近くに配置する。

### 2. 実装設計

インターフェース直下の実装オブジェクトに追加:

```typescript
cancelGeneration: (): Promise<IpcResult<void>> =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL),
```

- `safeInvoke` は既存の `invokeWithTimeout` ベースの安全呼び出しラッパー
- 引数なし（チャンネル名のみ）
- 戻り値は `Promise<IpcResult<void>>`（Main 側の処理結果）

### 3. ホワイトリスト設計

`apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に追加:

```typescript
IPC_CHANNELS.SKILL_CREATOR_CANCEL,
```

追加位置: `SKILL_CREATOR_CREATE` 等の近くに配置する。

### 4. 型定義の自動伝播

`types.ts:1865` に `skillCreatorAPI: import("./skill-creator-api").SkillCreatorAPI;` が定義されているため、`SkillCreatorAPI` インターフェースへの追加は `window.skillCreatorAPI.cancelGeneration` の型として自動で伝播する。追加設定は不要（phase-3-review.md 3.4節で確認済み）。

## 設計図

```
apps/desktop/src/preload/skill-creator-api.ts

interface SkillCreatorAPI {
  createSkill: ...
+ cancelGeneration: () => Promise<IpcResult<void>>;  // 追加
  ...
}

const skillCreatorAPI = {
  createSkill: ...
+ cancelGeneration: (): Promise<IpcResult<void>> =>
+   safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL),  // 追加
  ...
}

---

apps/desktop/src/preload/channels.ts

ALLOWED_INVOKE_CHANNELS = [
  IPC_CHANNELS.SKILL_CREATOR_CREATE,
+ IPC_CHANNELS.SKILL_CREATOR_CANCEL,  // 追加
  ...
]
```

## 統合テスト連携【必須】

| 判定項目                                     | 基準 | 結果    |
| -------------------------------------------- | ---- | ------- |
| インターフェース・実装・ホワイトリストが確定 | 確定 | pending |
| 型伝播の追加設定不要が確認済み               | 確認 | pending |

## 多角的チェック観点（AIが判断）

- [ ] `safeInvoke` の引数型と `IPC_CHANNELS.SKILL_CREATOR_CANCEL` の型が一致するか
- [ ] `IpcResult<void>` が `void` で正しいか（返却値が不要なため）

## サブタスク管理

1. インターフェース設計の確定
2. 実装設計の確定
3. ホワイトリスト設計の確定
4. 設計書の成果物作成

## 成果物

| 成果物 | パス                        | 説明         |
| ------ | --------------------------- | ------------ |
| 設計書 | `outputs/phase-2/design.md` | 設計内容一式 |

## 完了条件

- [ ] インターフェース・実装・ホワイトリスト設計が確定している
- [ ] 型伝播の確認が完了している
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビューゲート
