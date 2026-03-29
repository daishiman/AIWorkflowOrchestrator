# Phase 1: 要件定義

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 1                             |
| 機能名 | llm-adapter-error-propagation |
| 作成日 | 2026-03-29                    |

## 目的

LLMAdapter 初期化エラーの伝播経路、ステータス管理の責務配置、エラーレスポンスの型・メッセージ要件を固定する。

## 実行タスク

- 現行コードのエラー握りつぶし箇所を特定し、影響範囲を確認する
- `LLMAdapterStatus` 型の要件を定義する
- `plan()` エラーレスポンスの要件を定義する
- IPC レスポンスへのステータス付与要件を定義する
- AC-1〜AC-6 への写像を確認する

## 参照資料

| 資料名            | パス                                                                  | 説明                         |
| ----------------- | --------------------------------------------------------------------- | ---------------------------- |
| 要件草案          | `../requirements-draft.md`                                            | skill-creator 全体の要件     |
| 親 workflow pack  | `../root-workflow-pack/index.md`                                      | lane 共通不変条件            |
| IPC 初期化        | `apps/desktop/src/main/ipc/index.ts` (934-946行)                      | fire-and-forget 初期化の現状 |
| Facade            | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | plan() の stub レスポンス    |
| LLMAdapterFactory | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`             | getAdapter() のエラー throw  |
| 型定義            | `packages/shared/src/types/skillCreator.ts`                           | 現行レスポンス型             |

### 現行コードアンカー

| ファイル                                                              | 観察点                                                                                       |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts` (934-946行)                      | `void (async () => { ... })()` で fire-and-forget。catch 内で `console.warn` のみ            |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `plan()` が `this.llmAdapter` 未設定時に空の stub データを返す。ユーザーにはエラーが見えない |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`             | `getAdapter("anthropic")` が API キー未設定時に throw する                                   |
| `packages/shared/src/types/skillCreator.ts`                           | `RuntimeSkillCreatorPlanResponse` にエラー状態を示すフィールドがない                         |

## 実行手順

### ステップ1: エラー握りつぶしの影響範囲を特定する

- `ipc/index.ts` 934-946行の `catch` ブロックで `console.warn` のみ実行されている
- エラー発生後、`runtimeSkillCreatorService.llmAdapter` は `undefined` のまま
- ユーザーが skill 作成を試みると `plan()` が呼ばれるが、llmAdapter が undefined なので stub データが返る
- ユーザーは「空の結果が返った」としか認識できず、原因が API キー未設定であることがわからない

### ステップ2: LLMAdapterStatus 型の要件を定義する

```typescript
type LLMAdapterStatus = "ready" | "initializing" | "failed";
```

- `"initializing"`: Facade 生成直後〜`setLLMAdapter()` 呼び出し前
- `"ready"`: `setLLMAdapter()` が正常完了した後
- `"failed"`: `LLMAdapterFactory.getAdapter()` が throw した後
- 初期値は `"initializing"`
- ステータス遷移: `initializing → ready` または `initializing → failed`
- `failed` から `ready` への復帰はリトライ実装時（スコープ外）

### ステップ3: plan() エラーレスポンスの要件を定義する

- llmAdapter 未設定時（`status === "initializing"` または `status === "failed"`）に呼ばれた場合:
  - 空 stub ではなく、明示的なエラーレスポンスを返す
  - `success: false` フィールドでエラーであることを示す
  - `error` フィールドに失敗理由を含む
  - `"failed"` の場合: 保持された失敗理由を含む（例: 「APIキーを設定してください」）
  - `"initializing"` の場合: 「LLMAdapter の初期化中です。しばらくお待ちください」
- 既存の正常レスポンス（`success: true`）と区別可能であること

### ステップ4: IPC レスポンスへのステータス付与要件を定義する

- `plan()` の IPC レスポンスに `adapterStatus: LLMAdapterStatus` を付与する
- UI 側が `adapterStatus` を参照してステータス表示を切り替え可能にする
- 既存の IPC チャネルを再利用し、新規チャネルは追加しない

### ステップ5: AC-1〜AC-6 への写像を確認する

| AC   | 対応する要件                                           |
| ---- | ------------------------------------------------------ |
| AC-1 | ステップ2: `llmAdapterStatus` プロパティの型定義       |
| AC-2 | ステップ2: `failed` 時の失敗理由保持                   |
| AC-3 | ステップ3: `plan()` エラーレスポンス                   |
| AC-4 | ステップ3: actionable メッセージの要件                 |
| AC-5 | ステップ4: IPC レスポンスの `adapterStatus` フィールド |
| AC-6 | 全ステップ: fire-and-forget パターン維持の制約         |

## 統合テスト連携

- Phase 4 でステータス遷移と plan() エラーレスポンスの test case を作成する
- Phase 7 で AC-1〜AC-6 の全項目の coverage を確認する
- Phase 9 で既存テストとの互換性を監査する

## 成果物

| 成果物              | パス                                     | 説明                                       |
| ------------------- | ---------------------------------------- | ------------------------------------------ |
| 要件定義書          | `phase-1-requirements.md`                | ステータス管理・エラーレスポンスの要件固定 |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | 現行コード → 要件 → AC の対応表            |

## 完了条件

- [ ] エラー握りつぶしの影響範囲が特定されている
- [ ] `LLMAdapterStatus` 型と遷移パターンが定義されている
- [ ] `plan()` エラーレスポンスの型・メッセージ要件が定義されている
- [ ] IPC レスポンスへのステータス付与方式が定義されている
- [ ] AC-1〜AC-6 への写像が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
