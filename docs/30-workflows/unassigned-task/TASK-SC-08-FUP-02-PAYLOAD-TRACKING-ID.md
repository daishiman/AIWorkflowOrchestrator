# progress payload への planId / requestId 付与による混線防止 - タスク指示書

## メタ情報

```yaml
issue_number: 2300
```

## メタ情報

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | TASK-SC-08-FUP-02                                                         |
| タスク名     | sc-08-payload-tracking-id                                                 |
| 分類         | 機能改善                                                                  |
| 対象機能     | SkillCreatorService / IPC progress チャンネル / useStreamingProgress Hook |
| 優先度       | **中**                                                                    |
| 見積もり規模 | 中規模                                                                    |
| ステータス   | 未着手                                                                    |
| 発見元       | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE Phase 12 未タスク検出              |
| 発見日       | 2026-04-19                                                                |
| depends_on   | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE（完了済み）                        |
| 関連タスク   | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE の実装により、`useStreamingProgress.ts` には
collaborative / update / orchestrate / improve-prompt 用の phaseマッピングが追加され、
IPC チャンネル `skill-creator:progress` 経由でリアルタイム進捗通知が届くようになった。

現在の progress payload の型定義は以下のとおりである。

```typescript
// apps/desktop/src/preload/skill-creator-api.ts
export interface SkillCreatorProgress {
  phase: string;
  percentage: number;
  message: string;
}
```

この payload には、**どの実行計画から発生した通知なのかを識別するフィールドが存在しない**。

### 1.2 問題点・課題

IPC 通信の `skill-creator:progress` チャンネルは **単一のブロードキャストチャンネル** であり、
`mainWindow.webContents.send()` で全リスナーに一斉送信される構造になっている。

```typescript
// apps/desktop/src/main/ipc/skillCreatorHandlers.ts
export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: { phase: string; percentage: number; message: string },
): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}
```

Renderer 側の `useStreamingProgress` はこのチャンネルのすべての通知を無条件に受け取り、
グローバルな Zustand ストアへ書き込む。

```typescript
// apps/desktop/src/renderer/hooks/useStreamingProgress.ts
const cleanup = api.onProgress((progress) => {
  const mappedStage = mapPhaseToStage(progress.phase);
  updateProgress({
    stage: mappedStage,
    percent: progress.percentage,
    message: progress.message,
  });
});
```

これにより、以下の問題が起きる可能性がある。

1. **並行実行時の混線**: 複数の `executePlan` がバックグラウンドで並行実行されると（`executeAsync` は fire-and-forget）、
   異なる planId から発生した progress 通知が同一チャンネルに流れ込み、UI 上の進捗表示が混在する。
2. **セッション復元後の誤表示**: セッションを復元した際に、復元中の planId と現在表示中の planId が異なる場合でも、
   progress 通知が UI に反映されてしまう。
3. **フィルタリング不能**: Renderer 側でどの planId の通知かを判断する手段がないため、
   意図しない planId の通知を弾くことができない。

### 1.3 放置した場合の影響

- 将来的に複数スキル並行生成機能を追加した際に、重大なバグとなる（UI 進捗が混線）
- セッション復元機能（TASK-P0-08 で実装済み）との組み合わせで、
  意図しない planId の進捗を表示してしまうリスクがある
- デバッグ困難性の増大: どの planId から progress が来ているのか追跡できない

---

## 2. 何を達成するか（What）

### 2.1 目的

`skill-creator:progress` チャンネルの payload に `planId` および `requestId` を追加し、
Renderer 側で「自分が待っている planId の通知だけ」を選択的に処理できるようにする。

### 2.2 最終ゴール

- `SkillCreatorProgress` 型に `planId` と `requestId` フィールドが追加されている
- Main プロセス（`sendSkillCreatorProgress`）が常に `planId` / `requestId` を付与して送信する
- `useStreamingProgress` が `planId` を受け取り、対象外の通知をスキップするフィルタリングロジックを持つ
- 既存のテストがすべて PASS する（後方互換性を維持する場合はオプショナルフィールドとする）

### 2.3 スコープ

#### 含むもの

- `SkillCreatorProgress` インターフェースへの `planId` / `requestId` フィールド追加
- `sendSkillCreatorProgress` 関数のシグネチャ変更（`planId` / `requestId` を受け取る）
- `RuntimeSkillCreatorFacade.executeAsync` から `sendSkillCreatorProgress` への `planId` 引き渡し
- `useStreamingProgress` Hook へのフィルタリングロジック追加（対象 `planId` の受け取りと比較）
- 上記に対応するテストの修正・追加

#### 含まないもの

- progress チャンネルの多重化（planId 別の専用チャンネル作成）
- Zustand ストアの planId 別管理（複数 planId の同時追跡）
- UI コンポーネントの変更
- `createSkill` ルート（非 Runtime ルート）の変更（優先度低）

### 2.4 成果物

| 種別       | 成果物                          | 配置先                                                                        |
| ---------- | ------------------------------- | ----------------------------------------------------------------------------- |
| 型修正     | `SkillCreatorProgress` 型拡張   | `apps/desktop/src/preload/skill-creator-api.ts`                               |
| 実装修正   | `sendSkillCreatorProgress` 関数 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                           |
| 実装修正   | `executeAsync` progress 伝播    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`         |
| 実装修正   | フィルタリングロジック          | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                     |
| テスト修正 | 既存テスト・新規テスト          | `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts` など |

---

## 3. どのように実装するか（How）

### 3.1 変更対象ファイルと実装方針

#### ファイル 1: `apps/desktop/src/preload/skill-creator-api.ts`

`SkillCreatorProgress` インターフェースに `planId` と `requestId` を追加する。
後方互換性のためオプショナルフィールドとし、既存の呼び出しを壊さない。

```typescript
// 変更前
export interface SkillCreatorProgress {
  phase: string;
  percentage: number;
  message: string;
}

// 変更後
export interface SkillCreatorProgress {
  phase: string;
  percentage: number;
  message: string;
  /** 発生元の planId。複数 executePlan 並行時の混線防止に使用 */
  planId?: string;
  /** 発生元の requestId（UI インタラクション識別用） */
  requestId?: string;
}
```

#### ファイル 2: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

`sendSkillCreatorProgress` 関数のシグネチャを拡張し、`planId` / `requestId` を受け取って
payload に含めて送信する。

```typescript
// 変更前
export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: { phase: string; percentage: number; message: string },
): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}

// 変更後
export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: {
    phase: string;
    percentage: number;
    message: string;
    planId?: string;
    requestId?: string;
  },
): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}
```

#### ファイル 3: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

`executeAsync` 内で progress を emit する箇所（または `workflowEngine.triggerPhaseTransition` の後続処理）に
`planId` を付与する仕組みを追加する。

現状の `executeAsync` は `workflowEngine.triggerPhaseTransition(planId, phase, percentage)` を呼び出すことで
`onWorkflowStateSnapshot` コールバックへ状態変化を通知している。

`skill-creator:progress` チャンネルへの送信は `skillCreatorHandlers.ts` 内の
`createSkill` ルートにのみ存在し、Runtime ルート（`executeAsync`）では直接 progress を
送信していない可能性がある。実装調査の上、Runtime ルートで `skill-creator:progress` を
送信している箇所があれば `planId` を付与する。

```typescript
// Runtime ルートで progress を送信している場合（調査後に確定）
// 例: onProgressCallback が呼ばれる箇所
onProgressCallback({
  phase: currentPhase,
  percentage: currentPercentage,
  message: currentMessage,
  planId: planId, // 追加
  requestId: requestId, // 追加（利用可能な場合）
});
```

#### ファイル 4: `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`

`useStreamingProgress` Hook に `activePlanId` 引数を追加し、
受信した progress の `planId` と一致しない場合はスキップするフィルタリングロジックを実装する。

```typescript
// 変更前のシグネチャ
export function useStreamingProgress(): UseStreamingProgressReturn;

// 変更後のシグネチャ
export interface UseStreamingProgressOptions {
  /** フィルタリング対象の planId。undefined の場合はすべての通知を受け入れる（後方互換） */
  planId?: string;
}

export function useStreamingProgress(
  options?: UseStreamingProgressOptions,
): UseStreamingProgressReturn;

// フィルタリングロジック（useEffect 内）
const cleanup = api.onProgress((progress) => {
  // planId フィルタリング: 指定された planId と一致しない通知はスキップ
  if (
    options?.planId !== undefined &&
    progress.planId !== undefined &&
    progress.planId !== options.planId
  ) {
    return;
  }

  // エラーチェック
  if (progress.phase === "error") {
    const errorCode = parseErrorCode(progress.message);
    setStage("error");
    setError({ code: errorCode, message: progress.message });
    return;
  }

  const mappedStage = mapPhaseToStage(progress.phase);
  updateProgress({
    stage: mappedStage,
    percent: progress.percentage,
    message: progress.message,
  });
});
```

**フィルタリング条件の設計方針**:

- `options?.planId` が未指定（`undefined`）の場合: 後方互換のため全通知を受け入れる
- `progress.planId` が未設定（古い Main 実装など）の場合: 後方互換のため通知を受け入れる
- 両方が指定されており、値が一致しない場合のみスキップ

### 3.2 実装手順

#### Step 1: 型定義の拡張

`SkillCreatorProgress` インターフェースに `planId?: string` / `requestId?: string` を追加する。

#### Step 2: `sendSkillCreatorProgress` のシグネチャ拡張

関数の progress 引数型に `planId?: string` / `requestId?: string` を追加する。
内部実装は変更不要（payload をそのまま `send` するだけ）。

#### Step 3: Runtime ルートの調査と対応

`RuntimeSkillCreatorFacade.executeAsync` および関連するコールバック経路を調査し、
`skill-creator:progress` に流れ込む箇所に `planId` を付与する。

#### Step 4: `useStreamingProgress` のフィルタリング実装

オプショナル引数 `options?: { planId?: string }` を追加し、フィルタリングロジックを実装する。
`useEffect` の依存配列に `options?.planId` を追加する点に注意。

#### Step 5: テストの修正・追加

- 既存テストが PASS することを確認（オプショナルフィールドのため破壊的変更なし）
- 以下のテストケースを追加:
  - `planId` が一致する場合に通知が処理されること
  - `planId` が不一致の場合に通知がスキップされること
  - `progress.planId` が未設定の場合に通知が受け入れられること（後方互換）
  - `options.planId` が未設定の場合に全通知が受け入れられること（後方互換）

### 3.3 確認コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# useStreamingProgress のテスト実行
pnpm --filter @repo/desktop test -- --run useStreamingProgress

# skillCreatorHandlers のテスト実行
pnpm --filter @repo/desktop test -- --run skillCreatorHandlers

# planId 未付与箇所の確認（残存チェック）
grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/

# SkillCreatorProgress 型の参照箇所確認
grep -rn "SkillCreatorProgress" apps/desktop/src/
```

---

## 4. 受け入れ基準（Acceptance Criteria）

| AC番号 | 条件                                                                                   | 検証方法               |
| ------ | -------------------------------------------------------------------------------------- | ---------------------- |
| AC-1   | `SkillCreatorProgress` 型に `planId?: string` と `requestId?: string` が追加されている | 型定義・コードレビュー |
| AC-2   | `sendSkillCreatorProgress` が `planId` / `requestId` を payload に含めて送信できる     | コードレビュー         |
| AC-3   | `useStreamingProgress` に `planId` フィルタリングロジックが実装されている              | コードレビュー         |
| AC-4   | `planId` が一致する progress 通知のみが Zustand ストアに書き込まれる（指定時）         | vitest                 |
| AC-5   | `planId` が不一致の progress 通知はスキップされる                                      | vitest                 |
| AC-6   | `progress.planId` が未設定の場合（後方互換）は通知が受け入れられる                     | vitest                 |
| AC-7   | `options?.planId` が未指定の場合（後方互換）は全通知が受け入れられる                   | vitest                 |
| AC-8   | 既存の `useStreamingProgress` テストがすべて PASS する                                 | vitest run             |
| AC-9   | `pnpm typecheck`（desktop）が PASS する                                                | typecheck コマンド     |

---

## 5. 苦戦箇所と知見（TASK-SC-08 の実装から）

### 5.1 IPC チャンネルの単一性と並行実行の不整合

**背景**: TASK-SC-08 の実装調査で判明したこととして、`skill-creator:progress` チャンネルは
単一のブロードキャストチャンネルであり、全ウィンドウの全リスナーが同一の通知を受け取る。

**知見**: Electron の `webContents.send` は送信先が特定のウィンドウであっても、
そのウィンドウ上で登録された全てのリスナーが同じ通知を受け取る。
planId 別の専用チャンネルを作る（例: `skill-creator:progress:{planId}`）ことも選択肢だが、
Electron の IPC チャンネルは動的に追加・削除するのが難しいため、
**payload にメタデータを乗せてフィルタリングするアプローチが現実的**。

### 5.2 `useEffect` の依存配列に関する注意点

**苦戦した点**: TASK-SC-08 実装中、`useEffect` の依存配列の管理が難しかった。
`options?.planId` を依存配列に含めると、`planId` が変わるたびにリスナーが再登録される。

**知見**: `planId` の変更でリスナーを張り直すのは正しい挙動（古い planId のリスナーをクリーンアップして
新しい planId のリスナーを登録するのが意図通り）。
ただし `planId` が頻繁に変わる場合はパフォーマンスへの影響に注意する。
`useRef` で `planId` を保持し、コールバック内で参照する方法も検討できる。

### 5.3 オプショナルフィールドによる後方互換の維持

**知見**: `planId` をオプショナル（`?`）にすることで、
既存の `sendSkillCreatorProgress` 呼び出し箇所を一括修正しなくてよくなる。
ただし、後方互換のために「`progress.planId` が未設定なら受け入れる」というロジックを
フィルタリング条件に明示的に含める必要がある。
このロジックを省くと、既存の progress 送信箇所が修正されるまで
`useStreamingProgress(planId: "xxx")` と指定したコンポーネントが一切 progress を受け取れなくなる。

### 5.4 Runtime ルートと従来ルートの progress 経路の違い

**知見**: TASK-SC-08 調査を通じて、progress の発生経路が 2 つあることが判明した。

1. **従来ルート** (`createSkill`): `skillCreatorHandlers.ts` の `sendSkillCreatorProgress` が直接 emit
2. **Runtime ルート** (`executeAsync`): `workflowEngine.triggerPhaseTransition` → `onWorkflowStateSnapshot` 経由で snapshot を push

Runtime ルートが `skill-creator:progress` を直接 emit しているかどうかは、
本タスク実装時に改めて調査が必要。
emit していない場合は、Runtime ルートにも progress emit を追加するかどうかを設計判断する。

---

## 関連リンク

- [TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE 仕様書](../TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE/index.md)
- [Phase 12 未タスク検出レポート](../TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE/outputs/phase-12/unassigned-task-detection.md)
- [useStreamingProgress.ts](../../../../apps/desktop/src/renderer/hooks/useStreamingProgress.ts)
- [skill-creator-api.ts](../../../../apps/desktop/src/preload/skill-creator-api.ts)
- [skillCreatorHandlers.ts](../../../../apps/desktop/src/main/ipc/skillCreatorHandlers.ts)
- [RuntimeSkillCreatorFacade.ts](../../../../apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts)
