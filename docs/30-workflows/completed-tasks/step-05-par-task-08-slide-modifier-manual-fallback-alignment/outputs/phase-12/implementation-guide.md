# Phase 12: 実装ガイド

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 12                                                    |
| 作成日   | 2026-03-23                                            |
| 対象読者 | Part 1: 中学生 / Part 2: 開発者                       |

---

# Part 1: 中学生レベルの概念説明

## スライドを動かすロボットと手動係員の話

### 背景: 2人のキャラクター

あなたは大きなプレゼンテーション会場でスライドを操作する係員です。
この会場には2種類のスライド操作係員がいます。

**ロボット係員（integrated lane）**
自動でスライドを操作してくれる優秀なロボット。
普段はロボットがスライドをきれいに整えてくれます。

**手動係員（manual lane）**
ロボットが困ったときに助けてくれる人間の係員。
「この状況は私が対応します！」と言って画面に出てきます。

### 4つの状態: 会場の状況を表す4つの看板

会場の入口には今の状況を示す看板（状態）があります。

**看板1: synced（準備完了）**
スライドがきちんと整っています。ロボットも人間係員も待機中。
会場で見える表示: 「スライド準備OK」のバーだけ

**看板2: running（作業中）**
ロボットがスライドを動かしています。グルグルするアニメーションが出ています。
会場で見える表示: 「作業中」のバーが点滅

**看板3: degraded（ちょっと困ってる）**
ロボットが「うまくできなかった！」と報告しました。
人間係員が「私が手伝います！」というカードを見せています。
会場で見える表示: バー + 説明 + 「手動で対応する」ボタン

**看板4: guidance（案内中）**
あなたが「手動で対応する」ボタンを押しました。
人間係員が「ターミナル（専門の道具）を開いてください」と案内しています。
会場で見える表示: バー + 説明 + ターミナル起動ボタン

### ルールブック: やってはいけないこと4つ

会場には絶対に守らなければならないルールがあります。

**禁止1: 作業せずに「困ってる」にならない**
ロボットが何もしていないのに「困った」状態になるのはおかしい。
（準備完了 → 困ってる は禁止）

**禁止2: 作業せずに「案内中」にならない**
ロボットが何もしていないのに「案内します」と出てくるのはおかしい。
（準備完了 → 案内中 は禁止）

**禁止3: 案内中に「困ってる」に戻らない**
「案内してるんだから、困ってる状態には戻りません！」
（案内中 → 困ってる は禁止）

**禁止4: 困ってる状態でロボットが勝手に再起動しない**
「もう一回やれば直るかも」と勝手に再実行するのは危険。
必ず人間が判断します。（困ってる → 作業中 は禁止）

### なぜこの設計が大切か

**ロボットが失敗したとき**、アプリが黙って何度もリトライするのはユーザーに見えない「秘密の操作」です。
この設計では、失敗したらちゃんとユーザーに教えて、ユーザーが「手動でやる」か決めます。
これが「transparent（透明性のある）」なシステムです。

---

# Part 2: 開発者向け実装詳細

## 1. 設計の全体構造

```
Renderer（SlideWorkspace.tsx）
    ↕ IPC（contextBridge 経由）
Main（skill-executor.ts）
    ├── integrated lane → Agent SDK adapter → modifier-skill.ts
    └── manual lane → SlideCapabilityDTO を Renderer に返す
```

## 2. SlideUIStatus 型定義（packages/shared に配置）

```typescript
// packages/shared/src/slide/types.ts
export type SlideUIStatus = "synced" | "running" | "degraded" | "guidance";

export type SlideLane = "integrated" | "manual";

export type ApiKeySource = "safeStorage" | "env" | "none";

export interface SlideCapabilityDTO {
  lane: SlideLane;
  apiKeySource: ApiKeySource; // P62 対策: 暗黙 fallback を UI に開示
  uiStatus: SlideUIStatus;
  blockedReason?: string; // degraded / guidance 時のみ存在
}

export interface ModifierResponse {
  success: boolean;
  changes?: ChangeItem[];
  error?: string;
  fallback_reason?: string; // 追加（optional: 後方互換）
  suggested_action?: string; // 追加（optional: 後方互換）
}
```

## 3. 状態遷移の実装指針

```typescript
// 不正遷移ガード（slideStore.ts で実装）
const FORBIDDEN_TRANSITIONS: [SlideUIStatus, SlideUIStatus][] = [
  ["synced", "degraded"],
  ["synced", "guidance"],
  ["guidance", "degraded"],
  ["degraded", "running"], // P62 準拠
];

function validateTransition(from: SlideUIStatus, to: SlideUIStatus): void {
  const forbidden = FORBIDDEN_TRANSITIONS.find(
    ([f, t]) => f === from && t === to,
  );
  if (forbidden) {
    throw new Error(
      `Invalid transition: ${from} -> ${to}. This transition is forbidden.`,
    );
  }
}
```

## 4. UI 4領域の実装パターン

```typescript
// SlideWorkspace.tsx（UI 4領域の表示制御）
// P31 対策: 個別セレクタを使用（合成 Hook 禁止）
const uiStatus = useSlideUIStatus(); // 個別セレクタ
const lane = useSlideLane(); // 個別セレクタ

const showGuidanceBlock = uiStatus === "degraded" || uiStatus === "guidance";
const showFallbackCard = uiStatus === "degraded";
const showTerminalLauncher = uiStatus === "guidance";

// progress row は常に表示（全状態で show）
```

## 5. IPC バリデーション（P42 準拠3段）

```typescript
// slideSettingsHandlers.ts
ipcMain.handle("slide:capability:get", async (event, args) => {
  // 3段バリデーション: 型 → 空文字 → trim
  if (typeof args?.sessionId !== "string") {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "sessionId must be a string",
      },
    };
  }
  if (args.sessionId === "") {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "sessionId must not be empty",
      },
    };
  }
  if (args.sessionId.trim() === "") {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "sessionId must not be whitespace-only",
      },
    };
  }
  // 処理...
});
```

## 6. Cleanup 順序の実装依存関係

| 順序 | 実装タスク               | 前提（Gate 条件）              |
| ---- | ------------------------ | ------------------------------ |
| 1    | Task08（本タスク）       | Phase 3 PASS 済み              |
| 2    | Task08（本タスク）       | Phase 3 PASS 済み              |
| 3    | UT-SLIDE-IMPL-001        | Task08 完了（本タスク完了後）  |
| 4    | UT-SLIDE-UI-001          | 順序3 完了                     |
| 5    | UT-SLIDE-IMPL-001        | 順序4 完了 + Task09 governance |
| 6    | Task09 follow-up         | 順序5 完了                     |
| 7    | UT-SLIDE-IMPL-001        | 順序6 完了                     |
| 8    | UT-SLIDE-P31-001         | 順序4 完了                     |
| 9    | UT-SLIDE-HANDOFF-DUP-001 | 順序2 完了 + Task05 完了       |

## 7. P31 / P48 対策の実装パターン

```typescript
// P31 対策: 合成 Hook ではなく個別セレクタ
// 禁止
const { uiStatus, lane } = useSlideStore(); // 合成 Hook は禁止

// 推奨
const uiStatus = useSlideUIStatus(); // 個別セレクタ
const lane = useSlideLane(); // 個別セレクタ

// P48 対策: 派生セレクタに useShallow を適用
import { useShallow } from "zustand/react/shallow";
const visibleRegions = useSlideStore(
  useShallow((state) => ({
    showGuidance:
      state.uiStatus === "degraded" || state.uiStatus === "guidance",
    showFallback: state.uiStatus === "degraded",
    showTerminal: state.uiStatus === "guidance",
  })),
);
```

## 8. MN-01 フォローアップ（UT-SLIDE-IMPL-001 への引き継ぎ）

- SlideCapabilityDTO を返す IPC channel 名を `slide:capability:get` として仮定義している
- UT-SLIDE-IMPL-001 の Phase 5 で以下を確定すること:
  1. channel 名の確定（`slide:capability:get` でよいか検証）
  2. IPC allowlist への登録
  3. Preload の型定義への追加
  4. P42 準拠の3段バリデーション実装

## 9. 参照ファイル

| ファイル                      | 内容                                   |
| ----------------------------- | -------------------------------------- |
| contract-matrix.md            | 状態遷移・Action・DTO・screenshot 契約 |
| design-summary.md             | Concern A/B/C の設計サマリー           |
| phase-3/gate-decision.md      | MN-01 追跡情報                         |
| phase-9/risk-register.md      | リスク一覧（R-01〜R-06）               |
| phase-11/screenshot-plan.json | UX-07 撮影計画                         |
