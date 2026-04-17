# Phase 2: 設計

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 対象機能   | TASK-SW-CANCEL-002          |
| 前提Phase  | Phase 1: 要件定義           |
| 次Phase    | Phase 3: 設計レビューゲート |
| ステータス | 未実施                      |
| 作成日     | 2026-04-16                  |

## 目的

`cancelGeneration` メソッドの Preload 追加の詳細設計を行う。
`SkillCreatorAPI` インターフェースへの追加、実装の記述方法、
`ALLOWED_INVOKE_CHANNELS` への追加の3点を設計する。

## 実行タスク

### Task 1: SkillCreatorAPI インターフェース変更設計

**変更対象**: `apps/desktop/src/preload/skill-creator-api.ts`（`SkillCreatorAPI` インターフェース、行 69-391 付近）

**追加内容**:

```typescript
// SkillCreatorAPI インターフェースへの追加
cancelGeneration: () => Promise<IpcResult<void>>;
```

既存メソッド群のアルファベット順または論理的順序（生成関連メソッドの末尾）に合わせて配置する。

### Task 2: cancelGeneration 実装設計

**追加内容**（インターフェース実装部）:

```typescript
cancelGeneration: (): Promise<IpcResult<void>> =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL),
```

既存メソッド実装のパターンに合わせ、`safeInvoke` を使用する。
`IPC_CHANNELS.SKILL_CREATOR_CANCEL` は TASK-SW-CANCEL-001 で定義済み。

### Task 3: ALLOWED_INVOKE_CHANNELS 追加設計

**変更対象**: `apps/desktop/src/preload/channels.ts`

**追加内容**:

```typescript
// ALLOWED_INVOKE_CHANNELS 配列への追加
IPC_CHANNELS.SKILL_CREATOR_CANCEL,
```

`safeInvoke` は呼び出し時に `ALLOWED_INVOKE_CHANNELS` に含まれるチャンネルのみ許可するため、
この追加が欠けると実行時にセキュリティエラーが発生する。

### Task 4: 型の自動伝播確認設計

`apps/desktop/src/preload/types.ts:1865` に
`skillCreatorAPI: import("./skill-creator-api").SkillCreatorAPI;` が定義されているため、
`SkillCreatorAPI` インターフェースへの追加だけで `window.skillCreatorAPI.cancelGeneration` の
型が自動伝播する。
`types.ts` の変更は不要。

### Task 5: concern 数と設計書分割基準確認

- concern 数: 2（インターフェース + 実装追加、チャンネル追加）
- 変更ファイルが2ファイルだが、単一の機能追加（cancelGeneration の Preload 追加）として
  concern は1と見なし、単一 `phase-2-design.md` に記述する

### Task 6: IPC 4層整合性チェック

| 層              | 変更内容                                                         | 状態                  |
| --------------- | ---------------------------------------------------------------- | --------------------- |
| Renderer        | `window.skillCreatorAPI.cancelGeneration()` 呼び出し             | 型自動伝播で対応      |
| Preload         | `cancelGeneration` メソッド追加 + `ALLOWED_INVOKE_CHANNELS` 追加 | 本タスクで対応        |
| Main（IPC）     | `SKILL_CREATOR_CANCEL` チャンネルハンドラー                      | CANCEL-001 で対応済み |
| Main（Service） | キャンセル処理ロジック                                           | CANCEL-001 で対応済み |

4層全ての変更が揃うことで End-to-End のキャンセル呼び出しが完成する。

## 参照資料

- `outputs/phase-1/TASK-SW-CANCEL-002-requirements.md` — 受入条件（AC-1〜AC-5）
- `apps/desktop/src/preload/skill-creator-api.ts` — 実装対象
- `apps/desktop/src/preload/channels.ts` — チャンネル追加対象

## 統合テスト連携

- `SkillCreatorAPI` インターフェースの変更は `window.skillCreatorAPI` に自動伝播するため
  型整合性が確保される
- TASK-SW-CANCEL-001 の `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が利用可能であることを前提とする

## 成果物

| 成果物                       | パス                                           |
| ---------------------------- | ---------------------------------------------- |
| TASK-SW-CANCEL-002-design.md | `outputs/phase-2/TASK-SW-CANCEL-002-design.md` |

## 完了条件

- [ ] インターフェース追加の設計（`cancelGeneration: () => Promise<IpcResult<void>>`）が明記されている
- [ ] 実装の設計（`safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)`）が明記されている
- [ ] `ALLOWED_INVOKE_CHANNELS` 追加の設計が明記されている
- [ ] 型の自動伝播（`types.ts` 変更不要）が確認されている
- [ ] IPC 4層整合性チェックが完了している

## タスク100%実行確認【必須】

- [ ] Task 1（SkillCreatorAPI インターフェース変更設計）を100%実行した
- [ ] Task 2（cancelGeneration 実装設計）を100%実行した
- [ ] Task 3（ALLOWED_INVOKE_CHANNELS 追加設計）を100%実行した
- [ ] Task 4（型の自動伝播確認設計）を100%実行した
- [ ] Task 5（concern 数と設計書分割基準確認）を100%実行した
- [ ] Task 6（IPC 4層整合性チェック）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-002-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
