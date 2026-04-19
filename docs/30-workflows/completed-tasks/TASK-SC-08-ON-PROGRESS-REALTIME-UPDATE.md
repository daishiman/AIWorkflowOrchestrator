# TASK-SC-08: onProgress コールバックによるリアルタイムプログレス更新 - タスク指示書

## メタ情報

```yaml
issue_number: 2268
```

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | TASK-SC-08                                                    |
| タスク名     | on-progress-realtime-update                                   |
| 分類         | 機能実装                                                      |
| 対象機能     | Renderer - onProgress リアルタイム表示                        |
| 優先度       | **中**                                                        |
| 見積もり規模 | 中規模                                                        |
| ステータス   | 未着手                                                        |
| 発見元       | TASK-SW-STREAM-FUP-03 Phase 12 未タスク検出                   |
| 発見日       | 2026-04-18                                                    |
| depends_on   | TASK-SW-STREAM-FUP-03（完了）, TASK-SW-STREAM-002（IPC 配線） |
| 関連タスク   | TASK-SC-06-UI-RUNTIME-CONNECTION / TASK-SW-STREAM-FUP-03      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SC-06-UI-RUNTIME-CONNECTION では `generationProgress` に静的テキスト
（「計画を生成中...」「スキルを生成中...」）を設定している。
`onProgress` コールバックを接続することで AI の進捗状況をリアルタイム表示できる。

TASK-SW-STREAM-FUP-03 で `SkillCreatorService` 側の progress phase が mode-specific に拡張された。
しかし renderer 側の `useStreamingProgress.ts` は新しい phase 名をまだ 5 段階の stage にマッピングしておらず、
未知の phase を `planning` に吸収してしまう。結果として、`collaborative` / `orchestrate` / `update` / `improve-prompt`
の進捗が見た目上は `planning` のまま残る可能性がある。

### 1.2 問題点・課題

- `useStreamingProgress.ts` の phase → stage マッピングが `create` モード前提の 5 段階のみで定義されており、
  mode-specific な phase 名（`update` の `"変更差分を解析しています"` 等）を認識できない
- `GenerateStep.tsx` の表示テキストが静的で、AI が実際に何をしているかをユーザーに伝えられない
- `onProgress` コールバックの IPC 接続が renderer 側に存在せず、Main プロセスからの progress 通知が届かない

### 1.3 放置した場合の影響

- TASK-SW-STREAM-FUP-03 でモード別 progress が Main 側に実装済みにもかかわらず、
  Renderer 側が未対応のため UX 改善の恩恵をユーザーが受けられない
- `collaborative` / `orchestrate` / `update` / `improve-prompt` モードでプログレスバーが
  `planning` のまま固まって見えるなど、誤解を招く表示が残り続ける
- 後付けで対応すると `useStreamingProgress.ts` の型・テストの変更量が増大する

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorAPI.onProgress(callback)` を Renderer 側に接続し、`executePlan` 実行中に
AI からのリアルタイム progress 通知を UI に反映する。
あわせて `useStreamingProgress.ts` の phase → stage マッピングをモード別に拡張し、
mode-specific phase が `planning` に吸収されない状態を実現する。

### 2.2 最終ゴール

- `executePlan` 実行中に `onProgress` コールバックが正しく呼ばれる
- `generationProgress` がリアルタイム更新され、UI のプログレステキストが動的に変化する
- `collaborative` / `orchestrate` / `update` / `improve-prompt` の各 mode-specific phase が
  対応する stage / 表示に正しくマッピングされる
- `create` モード以外で progress 表示が退行しない

### 2.3 スコープ

#### 含むもの

- `useStreamingProgress.ts` の phase → stage マッピングをモード別に拡張
- `SkillLifecyclePanel.tsx`（または `useSkillLLMGeneration.ts`）への `onProgress` コールバック接続
- `generationProgressSlice.ts` の stage 型拡張確認・対応
- `GenerateStep.tsx` への mode-specific 表示反映
- `preload/skill-creator-api.ts` の `onProgress` 型確認

#### 含まないもの

- Main プロセス側（`SkillCreatorService.ts`）の progress 定義変更（TASK-SW-STREAM-FUP-03 完了済み）
- IPC チャンネル自体の新規追加（TASK-SW-STREAM-002 のスコープ）
- `orchestrate` / `improve-prompt` モードの詳細フロー実装（フロー未確定のため）

### 2.4 成果物

| 種別     | 成果物                               | 配置先                                                                                                       |
| -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 機能実装 | onProgress コールバック接続          | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` または `hooks/useSkillLLMGeneration.ts` |
| 機能改善 | phase → stage モード別マッピング拡張 | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                                                    |
| 型拡張   | stage 型の拡張確認・修正             | `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`                                          |
| UI 改善  | mode-specific 表示反映               | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                                         |
| 型確認   | onProgress 型定義確認                | `apps/desktop/src/preload/skill-creator-api.ts`                                                              |

---

## 3. どのように実装するか（How）

### 3.1 変更対象ファイルと実装方針

#### 3.1.1 `useStreamingProgress.ts` — phase → stage マッピング拡張

現在の実装は `create` モードの 5 段階のみ対応しており、未知の phase を `planning` に吸収している。
モード別 phase 名（`update` モードの `"変更差分を解析しています"` など）を受け取れるよう、
マッピングテーブルを拡張する。

```typescript
// 例: モード別 phase → stage マッピング追加
const PHASE_TO_STAGE_MAP: Record<string, GenerationStage> = {
  planning: "planning",
  "generating-skill": "generating-skill",
  "generating-agents": "generating-agents",
  validating: "validating",
  done: "done",
  // update モード
  変更差分を解析しています: "planning",
  "SKILL.md を更新しています": "generating-skill",
  更新内容を検証しています: "validating",
  // collaborative モード
  対話フローを準備しています: "planning",
  // ... 必要に応じて追加
};
```

#### 3.1.2 `SkillLifecyclePanel.tsx` / `useSkillLLMGeneration.ts` — onProgress 接続

`executePlan` 呼び出し時に `onProgress` コールバックを渡し、
受け取った progress データを `setGenerationProgress` で Store に反映する。

```typescript
// onProgress コールバックの接続例
await skillCreatorAPI.executePlan(plan, {
  onProgress: (data) => {
    dispatch(setGenerationProgress(data));
  },
});
```

#### 3.1.3 `GenerateStep.tsx` — mode-specific 表示

`generationProgress` の `message` フィールドを動的に表示するよう変更し、
静的テキストからリアルタイムテキストへ切り替える。

```tsx
// 静的テキストをリアルタイム表示に変更
<p aria-live="polite">{generationProgress?.message ?? "生成中..."}</p>
```

### 3.2 実装手順

1. `useStreamingProgress.ts` のマッピングテーブルをモード別に拡張する
2. `generationProgressSlice.ts` の stage 型に新規 stage が必要か確認・対応する
3. `SkillLifecyclePanel.tsx`（または `useSkillLLMGeneration.ts`）に `onProgress` コールバックを接続する
4. `GenerateStep.tsx` の進捗テキストを `generationProgress.message` の動的表示に変更する
5. `preload/skill-creator-api.ts` の `onProgress` 型が正しいことを確認する

### 3.3 確認コマンド

```bash
# 関連テスト実行
pnpm --filter @repo/desktop test -- --run useStreamingProgress

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 4. 受け入れ基準（Acceptance Criteria）

| AC番号 | 条件                                                                                                       | 検証方法           |
| ------ | ---------------------------------------------------------------------------------------------------------- | ------------------ |
| AC-1   | `executePlan` 実行中に `onProgress` コールバックが呼ばれる                                                 | vitest / 手動確認  |
| AC-2   | `generationProgress` がリアルタイム更新される                                                              | vitest             |
| AC-3   | UI のプログレステキストが動的に変化する（静的テキストでない）                                              | 手動確認           |
| AC-4   | mode-specific phase が `planning` に吸収されず、対応する stage / 表示に反映される                          | vitest             |
| AC-5   | `collaborative` / `orchestrate` / `update` / `improve-prompt` で progress 表示が `create` 前提に退行しない | vitest / 手動確認  |
| AC-6   | `pnpm typecheck`（desktop）が PASS                                                                         | typecheck コマンド |

---

## 5. 苦戦箇所と知見

### 5.1 generationProgress の Store/Local 二重管理

**苦戦した点**: `setGenerationProgress` は Store 経由だが、UI 表示に反映するには
JSX 側で `generationProgress` 変数を宣言・表示する必要がある。

**知見**: `useGenerationProgress` のセレクタ呼び出しで Store から値を取得し、
`aria-live="polite"` 付きの JSX 要素で動的表示を追加する。
セレクタを通じた参照にすることで、Store 更新が即座に UI へ反映されるようになる。

### 5.2 onProgress コールバックの IPC チャンネル設計

**苦戦した点**: Main → Renderer への push 型通信は `ipcMain.handle` ではなく
`webContents.send` + `ipcRenderer.on` パターンが必要で、設計を誤ると通知が届かない。

**知見**: Preload に `safeOn` パターンでリスナー登録し、P5（リスナー二重登録）を防止する。
コンポーネントのアンマウント時に必ずリスナーを解除するクリーンアップ関数を返すこと。

### 5.3 isGenerating ガードと進捗更新の競合

**苦戦した点**: `isGenerating=true` の間に `onProgress` が来ると、
UI 更新とガード判定が競合する可能性がある。

**知見**: `onProgress` は `isGenerating=true` の間のみ受け入れ、
`false` 転向時にリスナーを解除する。これにより、生成完了後の遅延通知による
不正な状態遷移を防止できる。

---

## 関連リンク

- [TASK-SC-06-UI-RUNTIME-CONNECTION 実装ガイド](../unassigned-task/)
- [TASK-SW-STREAM-FUP-03 仕様書](../TASK-SW-STREAM-FUP-03/)
- [useStreamingProgress.ts](../../../../apps/desktop/src/renderer/hooks/useStreamingProgress.ts)
- [SkillCreatorService.ts](../../../../apps/desktop/src/main/services/skill/SkillCreatorService.ts)
- Phase 3 設計レビュー（R-3）
