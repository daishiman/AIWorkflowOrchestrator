# Implementation Guide: Advanced Console Safety Governance

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001      |
| Phase      | 12 (Task 12-1)                                       |
| 作成日     | 2026-03-24                                           |
| タスク種別 | 設計・実装タスク（IPC handler・Service・UI実装含む） |

---

# Part 1: 概念説明（中学生レベル）

## 1. この機能は何をするの？

想像してみてください。あなたが料理ロボットに「カレーを作って」とお願いする場面を。

### 1-1. 承認画面（Approval Sheet）-- 「本当にやっていい？」の確認

料理ロボットが包丁を使おうとするとき、いきなり刃物を振り回したら危ないですよね。だから、ロボットは必ず「包丁を使っていいですか？」と聞いてきます。あなたが「いいよ」と言うまで、ロボットは包丁に触りません。

このアプリでも同じです。AIが「外部サービスにデータを送る」「ファイルを書き換える」「別のアプリを起動する」といった**重要な操作**をする前に、必ず**確認画面**を表示します。

- 「承認」を押すと、操作が実行される
- 「拒否」を押すと、操作はキャンセルされる
- 途中で止めたくなったら「中止」ボタンがある

### 1-2. お知らせバナー（Disclosure Banner）-- 「AIが手伝っていますよ」の表示

お店に入ったときに「このお店では防犯カメラが動作しています」という張り紙を見たことはありませんか？ あれは、お客さんに「こういうことが行われています」と正直に伝えるためのものです。

このアプリでも同じように、セッションが始まった瞬間に「AIがあなたの操作を手伝っています」「外部サービスにデータを送ることがあります」というバナーを表示します。

- バナーは閉じることができる（邪魔にならないように）
- でも、いつでも見直せるボタンが残っている
- 重要な操作の確認画面（承認画面）の中にも同じ情報が表示される（こちらは閉じられない）

### 1-3. 高度な表示（Advanced Console）-- 「裏側を覗きたい人向け」の機能

料理ロボットの例に戻ると、普通の人は「カレーが出来上がった」という結果だけ見えればいいですよね。でも料理に詳しい人は「今、玉ねぎを切っています」「鍋の温度は180度です」という詳しい情報も見たいかもしれません。

この「高度な表示」は、そういった**詳しい情報を見たい人向け**の機能です。

- 最初は隠れている（初心者には必要ないから）
- 「高度な表示」というボタンを自分で押さないと表示されない
- 表示されると、AIの実行ログやコマンドの詳細が見える

### 1-4. 勝手に送らない（No Auto-Send）-- 「あなたが言うまで送りません」

友達との会話のメモを、勝手に他の人に見せられたら嫌ですよね？ このアプリでは、セッションの記録（transcript）を**自動で**他のサービスに送ることは絶対にしません。

送りたい場合は、あなたが自分で「選ぶ」→「確認する」→「送信する」の3ステップを踏む必要があります。

### まとめの図

```
┌──────────────────────────────────────────┐
│  普通の画面（Layer 1）                   │
│  カレーが作れます！ [実行する]           │
│                                          │
│  ── お知らせ ──────────────────           │
│  AIが手伝います。外部に送ることもあります │  ← Layer 2（安全面）
│  ─────────────────────────────           │
│                                          │
│  [高度な表示] ← 押すと裏側が見える       │
│  ┌── 裏側の情報 ──────────────┐          │
│  │ > 玉ねぎを切っています...  │          │  ← Layer 3（詳細面、最初は隠れている）
│  │ > 鍋を温めています...      │          │
│  └────────────────────────────┘          │
└──────────────────────────────────────────┘
```

---

# Part 2: 開発者向け実装詳細

## 2. アーキテクチャ概要

### 2-1. 3層構造（Layer Architecture）

```
Layer 1: Primary Surface（初期表示）
  - Action Card / Runtime Banner / Session Dock
  - Task01 で定義済み。変更しない

Layer 2: Safety Surface（安全性担保）
  - ApprovalSheet.tsx（新規）
  - SessionDisclosureBanner.tsx（新規）
  - Manual Share Rail（Task02 で定義済み）

Layer 3: Detail Surface（opt-in 詳細）
  - AdvancedConsolePanel.tsx（新規）
  - Raw Terminal Output / Copy Command / Operation Log
```

### 2-2. プロセス間通信（IPC）構造

```
Renderer (React)
  │
  ├─ ApprovalSheet ──────────────────┐
  │   onApprove() / onReject()       │
  │                                   │
  ├─ SessionDisclosureBanner ────────┤ IPC (safeInvoke)
  │   aiServiceName / destinations    │
  │                                   │
  ├─ AdvancedConsolePanel ───────────┤
  │   execution:get-terminal-log      │
  │   execution:get-copy-command      │
  │                                   ▼
Preload (contextBridge)
  │
  ▼
Main Process
  ├─ ApprovalGate (enforcement)
  ├─ RuntimePolicyResolver (lane authority)
  └─ TerminalHandlers (external terminal)
```

## 3. コンポーネント設計

### 3-1. ApprovalSheet

**ファイル**: `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`（新規）

```typescript
interface ApprovalSheetProps {
  operationType: "dangerous_operation" | "external_send";
  description: string;
  destination?: string;
  onApprove: () => void;
  onReject: () => void;
  onShowDetails?: () => void;
}
```

**表示条件**:

| Session State | Trigger                   | 表示   |
| ------------- | ------------------------- | ------ |
| ready         | 「実行する」CTA押下後     | 表示   |
| handoff       | 「端末で続ける」CTA押下後 | 表示   |
| その他        | -                         | 非表示 |

**Approval Trigger マッピング**:

| ID     | 操作種別         | operationType       |
| ------ | ---------------- | ------------------- |
| APR-T1 | 外部API呼び出し  | external_send       |
| APR-T2 | ファイル書き込み | dangerous_operation |
| APR-T3 | 外部プロセス起動 | dangerous_operation |
| APR-T4 | システム設定変更 | dangerous_operation |

**表示必須セクション**: 操作タイトル、操作説明、送信先情報（条件付き）、データ概要、停止方法案内、承認/拒否ボタン

**Main Process Enforcement（ApprovalGate interface）**:

```typescript
interface ApprovalGate {
  checkApproval(sessionId: string, operationId: string): ApprovalStatus;
}

type ApprovalStatus =
  | { approved: true; approvedAt: number }
  | { approved: false; reason: "not_requested" | "rejected" | "expired" };
```

- approval token は単一操作ごとに失効する（TTL は実装時に 300s で固定: R-M1）
- Renderer で承認後、IPC 経由で Main Process に token 送信
- Main Process は session ID + operation ID + 有効期限を検証

### 3-2. SessionDisclosureBanner

**ファイル**: `apps/desktop/src/renderer/components/execution/SessionDisclosureBanner.tsx`（新規）

```typescript
interface SessionDisclosureBannerProps {
  aiServiceName: string;
  externalDestinations: string[];
  onDismiss: () => void;
  canReopen: boolean;
}
```

**表示規則**:

| 規則ID | 規則                                            |
| ------ | ----------------------------------------------- |
| DSC-R1 | Session open時に必ず1回表示（初期状態は表示）   |
| DSC-R2 | dismiss後はバナー非表示、再表示アイコンを維持   |
| DSC-R3 | 同一Session内で再表示要求時、同じ内容を表示     |
| DSC-R4 | Approval Sheet内のdisclosureはdismiss不可       |
| DSC-R5 | guidance-only stateでは「AI実行なし」の旨を開示 |

**データフロー**:

- Main Process から IPC 経由で LLM config（provider名、model名）を取得
- API key / token は Renderer に送信しない（DENY-5 準拠）
- 表示する情報: provider名、model名、送信先種別
- 送信しない情報: API key、token、internal path

### 3-3. AdvancedConsolePanel

**ファイル**: `apps/desktop/src/renderer/components/execution/AdvancedConsolePanel.tsx`（新規）

```typescript
interface AdvancedConsolePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  terminalOutput: string[];
  copyCommand?: string;
}
```

**Gate Rules（表示条件）**:

| Gate ID | 条件                                    |
| ------- | --------------------------------------- |
| GATE-1  | ユーザーが「高度な表示」を明示選択      |
| GATE-2  | Session State が操作可能（非collapsed） |
| GATE-3  | ExecutionConsoleView がアクティブ       |

**CTA 配置契約**:

| Level     | CTA                | 配置位置                            |
| --------- | ------------------ | ----------------------------------- |
| Primary   | state依存の主CTA   | Session Dock ヘッダー右端           |
| Secondary | 「高度な表示」     | Session Dock フッターまたはメニュー |
| Tertiary  | 「ログをコピー」等 | Advanced Console Panel内            |

**パネル内の許可/禁止操作**:

| 操作             | 可否 | 理由                         |
| ---------------- | ---- | ---------------------------- |
| Raw log 閲覧     | 許可 | API key 非含有であること     |
| Copy command     | 許可 | API key 非含有であること     |
| Operation log    | 許可 | パス sanitize 済みであること |
| Scroll / Search  | 許可 | -                            |
| 直接コマンド入力 | 禁止 | front surface scope外        |
| 自動実行トリガー | 禁止 | manual boundary 違反         |
| 外部送信ボタン   | 禁止 | Approval Sheet経由でのみ     |

### 3-4. IPC Channel 追加

| Channel                         | 方向           | 種別    | 目的                    | P42準拠 |
| ------------------------------- | -------------- | ------- | ----------------------- | ------- |
| `execution:get-terminal-log`    | Renderer->Main | invoke  | raw terminal output取得 | 必須    |
| `execution:get-copy-command`    | Renderer->Main | invoke  | handoff用command取得    | 必須    |
| `execution:get-disclosure-info` | Renderer->Main | invoke  | AI/送信先情報取得       | 必須    |
| `approval:respond`              | Renderer->Main | invoke  | 承認/拒否トークン送信   | 必須    |
| `approval:request`              | Main->Renderer | push/on | 承認要求のプッシュ通知  | 必須    |

- invoke channel（4件）は `ALLOWED_INVOKE_CHANNELS` に追加必須
- push channel（`approval:request`）は `ALLOWED_ON_CHANNELS` に追加必須
- P42 準拠 3段バリデーション（型チェック -> 空文字列 -> trim空文字列）を適用
- 応答型の詳細定義は後続の実装タスクで確定（DI-6）

## 4. Session State Machine 連携

Task02 で定義済みの Session State Machine との統合マトリクス:

| State         | Disclosure Banner | Approval Sheet     | Advanced Console | Primary CTA      |
| ------------- | ----------------- | ------------------ | ---------------- | ---------------- |
| collapsed     | 非表示            | 非表示             | 非表示           | 「開く」         |
| ready         | 初回表示          | 「実行する」押下時 | opt-in toggle    | 「実行する」     |
| handoff       | 表示維持          | 「端末で続ける」時 | opt-in toggle    | 「キャンセル」   |
| running       | 表示維持          | 非表示             | opt-in (R/O)     | 「中止」         |
| done          | 表示維持          | 非表示             | opt-in (R/O)     | 「成果物を見る」 |
| aborted       | 表示維持          | 非表示             | opt-in (R/O)     | 「やり直す」     |
| unavailable   | 非表示            | 非表示             | 非表示           | 「設定を見る」   |
| guidance-only | guidance開示      | 非表示             | 非表示           | 「案内を見る」   |

## 5. Compliance 契約

### 5-1. 禁止事項（DENY-1〜DENY-10）

実装時に以下が全て防止されていることを検証する:

- DENY-1: claude.ai consumer認証の流用禁止
- DENY-2: transcript auto-send禁止
- DENY-3: hidden parsing禁止
- DENY-4: hidden prompt injection禁止
- DENY-5: API key/tokenのRenderer直接渡し禁止
- DENY-6: terminal commandへのAPI key含有禁止
- DENY-7: advanced consoleのfront default surface配置禁止
- DENY-8: 「terminalを開く」のfront主導線ラベル禁止
- DENY-9: 承認なしの危険操作/外部送信禁止
- DENY-10: DEFAULT_CONFIGへの暗黙fallback禁止（P62準拠）

### 5-2. 遵守事項（MUST-1〜MUST-10）

実装時に以下が全て満たされていることを検証する:

- MUST-1: セッション開始時にAI利用を明示開示
- MUST-2: 外部送信はapproval sheetで明示承認
- MUST-3: 危険操作はapproval sheetで明示承認
- MUST-4: transcript共有は3操作で明示的に実行
- MUST-5: advanced consoleはopt-inでのみ表示
- MUST-6: primary CTAは常に1個
- MUST-7: 「端末で続ける」はhandoff stateのprimary CTAとしてのみ表示
- MUST-8: 「高度な表示」はsecondary/tertiary CTAとして配置
- MUST-9: エラーメッセージはsanitizeErrorMessage()でサニタイズ
- MUST-10: 新規IPC引数はP42準拠3段バリデーション適用

### 5-3. Consumer Auth Guard（CAG-1〜CAG-3）

- CAG-1: claude.ai session tokenをアプリ内で受け入れない
- CAG-2: claude.ai cookieをアプリ内で参照しない
- CAG-3: consumer認証フローをアプリ内で実装しない

## 6. 変更対象ファイル一覧

### 6-1. 実装済みファイル（本タスクで変更・追加済み）

**修正ファイル**

| ファイル                                                          | 変更種別 | 変更内容                       |
| ----------------------------------------------------------------- | -------- | ------------------------------ |
| `apps/desktop/src/main/ipc/terminalHandlers.ts`                   | 修正     | open flow の明示条件追加       |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` | 修正     | lane authority 拡張            |
| `apps/desktop/src/preload/channels.ts`                            | 修正     | IPC チャネル定数の追加         |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`  | 修正     | advanced console gate 組み込み |

**新規ファイル（IPC ハンドラ）**

| ファイル                                               | 変更種別 | 変更内容                             |
| ------------------------------------------------------ | -------- | ------------------------------------ |
| `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts` | 新規     | terminal log / copy command ハンドラ |
| `apps/desktop/src/main/ipc/approvalHandlers.ts`        | 新規     | approval:respond ハンドラ            |
| `apps/desktop/src/main/ipc/disclosureHandlers.ts`      | 新規     | disclosure info ハンドラ             |

**新規ファイル（サービス）**

| ファイル                                                 | 変更種別 | 変更内容               |
| -------------------------------------------------------- | -------- | ---------------------- |
| `apps/desktop/src/main/services/runtime/ApprovalGate.ts` | 新規     | 承認トークン管理・検証 |

**新規ファイル（React hooks）**

| ファイル                                                | 変更種別 | 変更内容                      |
| ------------------------------------------------------- | -------- | ----------------------------- |
| `apps/desktop/src/renderer/hooks/useAdvancedConsole.ts` | 新規     | advanced console IPC フック   |
| `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`    | 新規     | approval フロー状態管理フック |

**新規ファイル（UI コンポーネント）**

| ファイル                                                                     | 変更種別 | 変更内容                   |
| ---------------------------------------------------------------------------- | -------- | -------------------------- |
| `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`           | 新規     | approval UI コンポーネント |
| `apps/desktop/src/renderer/components/execution/SessionDisclosureBanner.tsx` | 新規     | disclosure UI              |
| `apps/desktop/src/renderer/components/execution/AdvancedConsolePanel.tsx`    | 新規     | opt-in raw terminal UI     |

**新規ファイル（テスト）**

| ファイル                                                                | 変更種別 | 変更内容                            |
| ----------------------------------------------------------------------- | -------- | ----------------------------------- |
| `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`        | 新規     | advanced console IPC テスト         |
| `apps/desktop/src/main/ipc/__tests__/approvalHandlers.test.ts`          | 新規     | approval ハンドラテスト             |
| `apps/desktop/src/main/ipc/__tests__/consumerAuthGuard.test.ts`         | 新規     | consumer auth guard テスト          |
| `apps/desktop/src/main/ipc/__tests__/noAutoSend.test.ts`                | 新規     | no auto-send コンプライアンステスト |
| `apps/desktop/src/main/services/runtime/__tests__/approvalGate.test.ts` | 新規     | ApprovalGate ユニットテスト         |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/__tests__/`       | 新規     | ExecutionConsoleView テスト群       |

### 6-2. 後続の実装タスクで変更予定のファイル

下記ファイルは本タスクの設計スコープ内だが、integration作業として後続タスクで変更する。

| ファイル                                                              | 変更種別 | 変更内容                                         |
| --------------------------------------------------------------------- | -------- | ------------------------------------------------ |
| `apps/desktop/src/main/ipc/index.ts`                                  | 修正     | 3ハンドラの registerAllIpcHandlers 登録          |
| `apps/desktop/src/preload/index.ts`                                   | 修正     | approval / disclosure / advancedConsole API 公開 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 修正     | handoff/disclosure bundle 連携                   |

## 7. 後続実装タスクでのIntegration要件

本タスクで定義・実装したコンポーネントを既存システムに繋ぎ込む際に、後続タスクで必ず対応すべき項目を列挙する。

### 7-1. IPC Handler 登録

`apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers()` に以下3ハンドラを追加登録する。

```typescript
// registerAllIpcHandlers() 内に追加
registerApprovalHandlers(mainWindow, approvalGate);
registerDisclosureHandlers(mainWindow);
registerAdvancedConsoleHandlers(mainWindow);
```

- `approvalGate` は `DefaultApprovalGate` インスタンスを渡す（下記 7-2 参照）
- `mainWindow` は既存の `BrowserWindow` インスタンスを再利用

### 7-2. ApprovalGate の DI（依存性注入）

`registerTerminalHandlers()` に `DefaultApprovalGate` インスタンスを注入する。

```typescript
const approvalGate = new DefaultApprovalGate();
registerTerminalHandlers(mainWindow, approvalGate);
registerApprovalHandlers(mainWindow, approvalGate);
```

- `approvalGate` インスタンスはシングルトンとして `registerAllIpcHandlers()` スコープで管理する
- セッション跨ぎの token 汚染を防ぐため、インスタンスの再利用範囲はアプリケーション起動から終了まで

### 7-3. Preload API 公開

`apps/desktop/src/preload/index.ts` の `contextBridge.exposeInMainWorld` に以下 API を追加する。

```typescript
contextBridge.exposeInMainWorld("electronAPI", {
  // 既存 API ...

  // approval
  approvalRespond: (
    sessionId: string,
    operationId: string,
    approved: boolean,
  ) => safeInvoke("approval:respond", sessionId, operationId, approved),
  onApprovalRequest: (callback: (payload: ApprovalRequestPayload) => void) =>
    safeOn("approval:request", callback),

  // disclosure
  getDisclosureInfo: (sessionId: string) =>
    safeInvoke("execution:get-disclosure-info", sessionId),

  // advancedConsole
  getTerminalLog: (sessionId: string) =>
    safeInvoke("execution:get-terminal-log", sessionId),
  getCopyCommand: (sessionId: string) =>
    safeInvoke("execution:get-copy-command", sessionId),
});
```

### 7-4. Approval Request Push 通知の送信実装

Main Process から Renderer へ `approval:request` をプッシュする実装を追加する。

- 呼び出し元: `ApprovalGate.requestApproval()` または terminal handler 内の危険操作検出ポイント
- 送信方法: `mainWindow.webContents.send('approval:request', payload)`
- payload 型:

```typescript
interface ApprovalRequestPayload {
  sessionId: string;
  operationId: string;
  operationType: "dangerous_operation" | "external_send";
  description: string;
  destination?: string;
}
```

- Renderer 側は `onApprovalRequest` で受信し `useApprovalFlow` フックに渡す

### 7-5. セッション終了時の revokeAll() 呼び出し

セッション終了イベントのハンドラ内で `approvalGate.revokeAll(sessionId)` を呼び出す。

```typescript
// セッション終了ハンドラ内（例: session:end IPC handler）
approvalGate.revokeAll(sessionId);
```

- 呼び出しタイミング: Session State が `done` / `aborted` へ遷移した直後
- 目的: 期限切れ前のトークンを即時無効化し、再利用攻撃を防止（DENY-9 準拠）
