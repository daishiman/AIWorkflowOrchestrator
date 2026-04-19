# executePlan → onProgress → GenerateStep 本番配線統合テスト追加 - タスク指示書

## メタ情報

```yaml
issue_number: 2298
```

## メタ情報

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | TASK-SC-08-FUP-01                                                                   |
| タスク名     | sc-08-integration-test                                                              |
| 分類         | テスト追加                                                                          |
| 対象機能     | executePlan → SKILL_CREATOR_PROGRESS → useStreamingProgress → GenerateStep 通し配線 |
| 優先度       | **中**                                                                              |
| 見積もり規模 | 中規模                                                                              |
| ステータス   | 未着手                                                                              |
| 発見元       | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE Phase 12 未タスク検出                        |
| 発見日       | 2026-04-19                                                                          |
| depends_on   | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE（完了済み）                                  |
| 関連タスク   | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SC-08 では `useStreamingProgress.ts` に collaborative/update/orchestrate/improve-prompt
用の phaseマッピングを追加し、Hook レイヤーのユニットテスト（TC-00〜TC-09）を整備した。

しかし、実際の本番フローである

```
skillCreatorAPI.executePlan()
  → (Main プロセス) creatorHandlers.ts の SKILL_CREATOR_EXECUTE_PLAN ハンドラー
    → RuntimeSkillCreatorFacade が onProgress コールバックを呼び出す
      → sendSkillCreatorProgress() で webContents.send(SKILL_CREATOR_PROGRESS, ...)
        → preload/skill-creator-api.ts の safeOn で ipcRenderer.on 受信
          → useStreamingProgress の onProgress コールバック発火
            → GenerateStep コンポーネントに stage / percent / message が反映される
```

というエンドツーエンドの配線を検証するテストは作成されていない。

TASK-SC-08 の Phase 12 未タスク検出（U-01）として記録された。

### 1.2 問題点・課題

- Hook レイヤー（`useStreamingProgress.test.ts`）は `skillCreatorAPI.onProgress` を
  モックしてコールバック直接呼び出ししているため、**preload ↔ Main の IPC チャンネル
  接続が正しいかどうかを検証していない**
- `sendSkillCreatorProgress()` の `webContents.send` 呼び出し → `ipcRenderer.on` 受信
  というプッシュ型通信の整合性（チャンネル名一致・payload 型一致）が静的型チェックだけ
  では保証しきれない
- `executePlan` が Ack を返した後に progress イベントが非同期で到着する挙動は、
  IPC ハンドラー単体テストでは再現されていない
- 将来的に `planId` ベースの進捗ルーティングを追加するとき（U-02）、
  統合テストの基盤がない状態だと修正の影響範囲を確認できない

### 1.3 放置した場合の影響

- `SKILL_CREATOR_PROGRESS` チャンネル名を preload/Main どちらかでリネームしたとき、
  実行時まで混線が検出されない
- phase 文字列（例: `"interview"`、`"improving"`）が Main 側のサービスから正しく送出
  されているかを手動テストでしか確認できず、退行リスクが高い
- U-02（`planId` 混線防止）の実装時に検証基盤が存在しないため、テスト追加コストが累積する

---

## 2. 何を達成するか（What）

### 2.1 目的

`executePlan` を起点とした Main → Renderer プッシュ型通信（`webContents.send` +
`ipcRenderer.on` パターン）の本番配線を、テスト環境で再現して検証する統合テストを追加する。

### 2.2 最終ゴール

- `executePlan` IPC ハンドラー呼び出し → `sendSkillCreatorProgress()` 発火 →
  `useStreamingProgress` hook のストア更新 → `GenerateStep` コンポーネント反映
  という一連のフローが1つのテストスイートで検証できる
- collaborative / update / orchestrate / improve-prompt モードの phase が
  各々正しく `GenerateStep` の stage に到達することを確認できる
- テストは CI（GitHub Actions）で PASS する（SIGKILL 回避策を含む）

### 2.3 スコープ

#### 含むもの

- `skillCreatorHandlers.ts` の `SKILL_CREATOR_EXECUTE_PLAN` ハンドラーが
  `onProgress` コールバックを受け取って `sendSkillCreatorProgress()` を呼ぶことの検証
- `sendSkillCreatorProgress()` が `webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, ...)`
  を正しいチャンネル名で呼ぶことの検証
- `useStreamingProgress` hook が progress イベントを受信してストアを更新することの検証
  （preload `safeOn` 経由のシミュレーション）
- `GenerateStep` コンポーネントが更新後のストア値を表示することの検証
- 全モード（create / collaborative / update / orchestrate / improve-prompt）で
  代表 phase が正しく表示に到達することの回帰テスト

#### 含まないもの

- 実 Electron プロセスを起動する E2E テスト（Playwright 等）
- `RuntimeSkillCreatorFacade` の LLM 呼び出し実装の検証
  （サービス層はモックで代替）
- U-02（`planId` 混線防止）のペイロード拡張
  （本タスクでは現在の payload 形状のみを対象とする）

### 2.4 成果物

| 種別                   | 成果物                                                          | 配置先                                 |
| ---------------------- | --------------------------------------------------------------- | -------------------------------------- |
| テストファイル（新規） | `skillCreatorHandlers.executePlan-progress.integration.test.ts` | `apps/desktop/src/main/ipc/__tests__/` |
| または既存ファイル拡充 | `skillCreatorIpc.integration.test.ts` に統合セクションを追記    | `apps/desktop/src/main/ipc/__tests__/` |

---

## 3. どのように実装するか（How）

### 3.1 変更対象ファイルと実装方針

#### 方針

Main → Renderer のプッシュ型通信は実 Electron コンテキストが必要なため、
テスト環境では以下の2層に分割して検証する。

**レイヤーA（Main 側）**: `skillCreatorHandlers.ts` の `SKILL_CREATOR_EXECUTE_PLAN`
ハンドラーが `RuntimeSkillCreatorFacade.executePlan()` に `onProgress` コールバックを
渡し、コールバックが呼ばれると `mainWindow.webContents.send()` が正しい引数で呼ばれること
を検証する。

**レイヤーB（Renderer 側）**: レイヤーA の `mainWindow.webContents.send()` 呼び出しを
受けて、`ipcRenderer.on` がリスナーに progress データを配信する部分は、
既存の `useStreamingProgress.test.ts` が `skillCreatorAPI.onProgress` モックで
カバーしているため、**phase-to-stage マッピング結果と GenerateStep 表示の連鎖**を
追加テストとして補完する。

#### 主要関連ファイル（変更なし・参照のみ）

| ファイル                                                             | 役割                                    |
| -------------------------------------------------------------------- | --------------------------------------- |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                       | `SKILL_CREATOR_EXECUTE_PLAN` ハンドラー |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                  | `sendSkillCreatorProgress()`            |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | `safeOn` + `onProgress`                 |
| `apps/desktop/src/preload/channels.ts`                               | `IPC_CHANNELS.SKILL_CREATOR_PROGRESS`   |
| `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`            | phase → stage マッピング                |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | 表示コンポーネント                      |

### 3.2 実装手順

#### Step 1: レイヤーA統合テストの追加

新規ファイル `skillCreatorHandlers.executePlan-progress.integration.test.ts`、
または `skillCreatorIpc.integration.test.ts` への追記として実装する。

```typescript
// テスト骨格（概要）
describe("SKILL_CREATOR_EXECUTE_PLAN → sendSkillCreatorProgress 統合", () => {
  it("executePlan ハンドラーが onProgress コールバックを受け取り webContents.send を呼ぶ", async () => {
    // 1. mockRuntimeFacade.executePlan を実装し、
    //    渡された onProgress コールバックを呼び出すスタブにする
    mockRuntimeFacade.executePlan.mockImplementation(
      async (_planId, _spec, _auth, _key, callbacks) => {
        callbacks?.onProgress?.({
          phase: "engine-selection",
          percentage: 15,
          message: "実行エンジン選択中",
        });
        return { accepted: true, planId: "plan-abc" };
      },
    );

    // 2. ハンドラーを呼び出す
    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN);
    await handler!(createMockEvent(), {
      planId: "plan-abc",
      skillSpec: "# My Skill",
    });

    // 3. webContents.send が SKILL_CREATOR_PROGRESS チャンネルで呼ばれたことを確認
    expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
      {
        phase: "engine-selection",
        percentage: 15,
        message: "実行エンジン選択中",
      },
    );
  });

  // 全モードの代表 phase でループ検証
  const modePhaseCases = [
    { label: "collaborative", phase: "interview", percentage: 10 },
    { label: "collaborative", phase: "consensus", percentage: 35 },
    { label: "update", phase: "loading-skill", percentage: 10 },
    { label: "update", phase: "analyzing", percentage: 20 },
    { label: "orchestrate", phase: "engine-selection", percentage: 15 },
    { label: "improve-prompt", phase: "improving", percentage: 50 },
  ] as const;

  modePhaseCases.forEach(({ label, phase, percentage }) => {
    it(`${label} mode: phase "${phase}" が webContents.send で送出される`, async () => {
      // ... 同様のパターンで各 phase を検証
    });
  });
});
```

#### Step 2: レイヤーB補完テスト（hook → GenerateStep 連鎖）

既存の `useStreamingProgress.test.ts` の `"hook から UI への反映"` describe ブロックに
orchestrate / update モードの代表 phase を追加する。

```typescript
// useStreamingProgress.test.ts への追記例
it("orchestrate mode: engine-selection phase が GenerateStep に表示される", () => {
  render(React.createElement(StreamingProgressHarness));
  const callback = mockOnProgress.mock.calls[0][0];

  act(() => {
    callback({
      phase: "engine-selection",
      percentage: 15,
      message: "実行エンジン選択中",
    });
  });

  expect(screen.getByText("実行エンジン選択中")).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "15",
  );
});
```

#### Step 3: チャンネル名一致の定数テスト

`IPC_CHANNELS.SKILL_CREATOR_PROGRESS` が preload と Main の両ファイルで
同一定数から参照されていることを確認するスナップショットテストを追加する。

```typescript
import { IPC_CHANNELS } from "../../../preload/channels";

it("SKILL_CREATOR_PROGRESS チャンネル名が変更されていない（退行チェック）", () => {
  expect(IPC_CHANNELS.SKILL_CREATOR_PROGRESS).toBe("skill-creator:progress");
});
```

### 3.3 確認コマンド

```bash
# レイヤーA 統合テストのみ実行（SIGKILL 対策: focused run）
pnpm --filter @repo/desktop exec vitest run \
  src/main/ipc/__tests__/skillCreatorHandlers.executePlan-progress.integration.test.ts

# または既存ファイルに追記した場合
pnpm --filter @repo/desktop exec vitest run \
  src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts \
  -t "executePlan → sendSkillCreatorProgress"

# レイヤーB 補完テスト（UI 反映確認）
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/hooks/__tests__/useStreamingProgress.test.ts \
  -t "hook から UI への反映"

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 4. 受け入れ基準（Acceptance Criteria）

| AC番号 | 条件                                                                                                                                                                                                               | 検証方法                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| AC-1   | `executePlan` ハンドラーが `onProgress` コールバックを受け取り、`webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, ...)` を呼ぶことが検証されている                                                            | vitest run（レイヤーA）              |
| AC-2   | collaborative（interview / consensus）/ update（loading-skill / analyzing）/ orchestrate（engine-selection）/ improve-prompt（improving）の代表 phase が `webContents.send` で送出されることをテストが検証している | vitest run（レイヤーA ループテスト） |
| AC-3   | `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` チャンネル名の退行チェックが存在する                                                                                                                                         | vitest run（定数テスト）             |
| AC-4   | orchestrate / update モードの代表 phase が `GenerateStep` コンポーネントに表示されることを検証するテストが存在する                                                                                                 | vitest run（レイヤーB）              |
| AC-5   | 追加した全テストが CI（pnpm --filter @repo/desktop test）で PASS する                                                                                                                                              | CI ログ確認                          |
| AC-6   | `pnpm --filter @repo/desktop typecheck` が PASS する                                                                                                                                                               | typecheck コマンド                   |

---

## 5. 苦戦箇所と知見（TASK-SC-08 の実装から）

### 5.1 SIGKILL 問題と focused verification

**苦戦した点**: TASK-SC-08 の Phase 11 手動テストおよび CI 環境で、
`useStreamingProgress.test.ts` をファイル全体で実行（full file run）すると
SIGKILL が発生してテストプロセスが強制終了した。

**知見**: テスト実行時は `-t <pattern>` で focused verification を採用することで
回避できた。本タスクの統合テストも同様に focused run で確認コマンドを設計すること。

```bash
# 良い例（focused run）
pnpm --filter @repo/desktop exec vitest run <test-file> -t "<test-name>"

# SIGKILL が起きやすいパターン（避ける）
pnpm --filter @repo/desktop test  # 全テストを一括実行
```

### 5.2 Main → Renderer プッシュ型通信のテスト設計

**苦戦した点**: `webContents.send` + `ipcRenderer.on` のプッシュ型通信は、
実 Electron コンテキストがないと end-to-end に通せない。
単体テストの境界をどこに引くかが曖昧になりやすい。

**知見**: 以下の2層分割が最も効果的だった。

1. **レイヤーA（Main 側）**: `sendSkillCreatorProgress()` に
   `mainWindow.webContents.send()` が正しい引数で呼ばれることを確認する。
   `mockMainWindow.webContents.send` を `vi.fn()` で差し替えれば実 Electron 不要。

2. **レイヤーB（Renderer 側）**: `skillCreatorAPI.onProgress` を `vi.fn(() => cleanup)`
   でモックし、フックが登録したコールバックを直接呼び出す。
   `useStreamingProgress.test.ts` の既存パターンがこの手法を採用している。

「Main が正しいチャンネルに正しい payload を送る（レイヤーA）」と
「Renderer がその payload を受け取って UI に反映する（レイヤーB）」を
**それぞれ独立して検証**し、チャンネル名を定数テストで固定することで
実質的なエンドツーエンド保証を得る。

### 5.3 onProgress コールバックシグネチャの取得

**知見**: `creatorHandlers.ts` の `SKILL_CREATOR_EXECUTE_PLAN` ハンドラーが
`RuntimeSkillCreatorFacade.executePlan()` に `onProgress` をどのように渡すかは
実装を読んで確認する必要がある。引数の順序・オプション有無がサービスの
インターフェース定義と一致していない場合、モックが意図通り機能しないため
実装コードと型定義（`@repo/shared/types`）を必ず参照すること。

### 5.4 interview / consensus フェーズの見落とし

**苦戦した点**: TASK-SC-08 の実装初期段階で `interview` / `consensus` フェーズが
`PHASE_TO_STAGE` マッピングに含まれておらず、collaborative モードの progress が
`planning` に正しく集約されていなかった。Phase 6 のテスト拡張で発見・修正した。

**知見**: 新しい実行モードを追加するときは、そのモードが送出する全 phase 名を
`PHASE_TO_STAGE` マッピングと統合テストの両方に追加すること。
実装だけ追加してテストを忘れると退行が検出されなくなる。

---

## 関連リンク

- [TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE 仕様書](../TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE/index.md)
- [Phase 12 未タスク検出](../TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE/outputs/phase-12/unassigned-task-detection.md)
- [useStreamingProgress.ts](../../../apps/desktop/src/renderer/hooks/useStreamingProgress.ts)
- [useStreamingProgress.test.ts](../../../apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts)
- [skillCreatorHandlers.ts](../../../apps/desktop/src/main/ipc/skillCreatorHandlers.ts)
- [creatorHandlers.ts](../../../apps/desktop/src/main/ipc/creatorHandlers.ts)
- [skill-creator-api.ts (preload)](../../../apps/desktop/src/preload/skill-creator-api.ts)
- [GenerateStep.tsx](../../../apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx)
