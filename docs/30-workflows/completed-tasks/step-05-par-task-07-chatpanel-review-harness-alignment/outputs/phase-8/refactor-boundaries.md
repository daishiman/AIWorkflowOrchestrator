# Phase 8 リファクタリング: 境界定義

- タスク ID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
- 作成日: 2026-03-23
- フェーズ: Phase 8 - リファクタリング

---

## 目的

Phase 1-7 の成果物（GAP-01〜04 分析、状態機械設計、検証マトリクス）を踏まえ、
ChatPanel.tsx に対して安全に実施できるリファクタリングの境界を定義する。
プロダクションコードへの変更は後続実装タスクで行うため、本フェーズは設計レベルの境界確認である。

---

## 1. 安全なリファクタリング対象

### 1-A: no-op コールバックの handler 変数への抽出

**対象 GAP**: GAP-01（onTerminalSwitch）、GAP-02（onSelectProvider）、GAP-03（onSelectModel）、GAP-04（onOpenTerminal）

> 注記: Phase 1 正本（current-state-inventory.md）の GAP 定義に基づく。
> GAP-01=onTerminalSwitch、GAP-02=onSelectProvider、GAP-03=onSelectModel、GAP-04=onOpenTerminal。

**リファクタリング内容**:

- インライン no-op `() => {}` を命名済み handler 変数として抽出する
- 変数名は `handleTerminalSwitch`、`handleSelectProvider`、`handleSelectModel`、`handleOpenTerminal` とする
- 実装タスク（後続）でこれらの変数に Store action / IPC 呼び出しを配線する

**安全性の根拠**:

- 変数化は振る舞いを変えない純粋なリファクタリングである
- ESLint の `@typescript-eslint/no-empty-function` を黙らせるコメントが不要になる
- 後続実装タスクでの差分が最小化される

**before（現状）**:

```typescript
<RuntimeBanner
  onTerminalSwitch={() => {}}
/>
<LLMSelectorPanel
  onSelectProvider={() => {}}
  onSelectModel={() => {}}
/>
<HandoffBlock
  onOpenTerminal={() => {}}
/>
```

**after（リファクタリング後）**:

```typescript
const handleTerminalSwitch = useCallback(() => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): Store navigate 配線
}, []);

const handleSelectProvider = useCallback((_providerId: string) => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): Store action 配線
}, []);

const handleSelectModel = useCallback((_modelId: string) => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): Store action 配線
}, []);

const handleOpenTerminal = useCallback(() => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): IPC openTerminal 配線
}, []);

<RuntimeBanner
  onTerminalSwitch={handleTerminalSwitch}
/>
<LLMSelectorPanel
  onSelectProvider={handleSelectProvider}
  onSelectModel={handleSelectModel}
/>
<HandoffBlock
  onOpenTerminal={handleOpenTerminal}
/>
```

### 1-B: JSDoc アノテーションの追加

**対象**: `ChatPanel.tsx` のコンポーネント宣言部

**リファクタリング内容**:

- `@role review-harness` アノテーションを JSDoc として追加する
- 役割の意図を明文化し、設計意図のドリフトを防止する

**安全性の根拠**:

- JSDoc はランタイム挙動に影響しない
- TypeDoc / Storybook 等のドキュメント生成ツールで role が可視化される

**追加する JSDoc**:

```typescript
/**
 * ChatPanel - チャットパネルのメインコンテナコンポーネント
 *
 * @role review-harness
 * @description
 * このコンポーネントは Review Harness として機能する。
 * mainline（ChatView）との契約整合性を維持しながら、
 * UI レビューおよびビジュアル検証を目的として設計されている。
 *
 * no-op コールバックは暫定実装であり、後続実装タスクで
 * Store action / IPC call に置き換えられる。
 *
 * @see TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
 * @see docs/30-workflows/step-05-par-task-07-chatpanel-review-harness-alignment/
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({ ... }) => {
```

### 1-C: computed state のカスタムフック候補への注釈

**対象**: `isBlocked`、`isHandoff`、`showComposer` の計算ロジック

**リファクタリング内容（注釈のみ、今回は実施しない）**:

- Phase 8 では `simplification-candidates.md` の Candidate 1 として記録する
- 実際の抽出は後続タスクのスコープとする

---

## 2. リファクタリング禁止事項

### 禁止-A: 状態機械の変更

**禁止内容**: 8 state union（`idle` / `loading` / `streaming` / `blocked` / `handoff` / `error` / `empty` / `cancelled`）の追加・削除・名称変更

**禁止理由**:

- Phase 2 設計レビューで PASS 済みの contract である
- chatSlice の型定義と一対一対応しており、変更は chatSlice の変更を伴う
- chatSlice の変更は mainline の挙動に影響し、本タスクのスコープ外

**判定基準**: 状態名を含む文字列・型・switch 文の case は触らない

### 禁止-B: 子コンポーネント Props 型の変更

**禁止内容**: `ComposerPanel`、`BlockedBanner`、`HandoffBanner`、`RuntimeBanner` の Props インターフェース変更

**禁止理由**:

- 子コンポーネントは他の場所でも使用されている可能性がある
- Props 型変更は破壊的変更（BC break）であり、影響範囲調査が必要
- Phase 3 設計レビューの MINOR-B（ChatPanelProps role 型追加の要否再評価）は未クローズ

**判定基準**: `interface` / `type` キーワードを含む子コンポーネントのファイルは変更しない

### 禁止-C: chatSlice の変更

**禁止内容**: `chatSlice.ts` の state 型、action、reducer の変更

**禁止理由**:

- chatSlice は Zustand Store のグローバル状態であり、Renderer 全体に影響する
- 本タスクの Ownership は `ChatPanel.tsx` のみ

### 禁止-D: mainline（ChatView）への変更

**禁止内容**: `ChatView.tsx` および ChatView に関連するファイルの変更

**禁止理由**:

- mainline は review harness の比較基準であり、変更すると検証の前提が崩れる
- mainline の変更は別タスク（Task03-06）のスコープ

---

## 3. 変更してはいけない Contract

### Contract A: State Contract（8 state）

ChatPanel は以下の 8 状態を網羅しなければならない。状態の追加・削除は設計変更扱いとし、Phase 2 からやり直す。

| State       | 表示コンテンツ               |
| ----------- | ---------------------------- |
| `idle`      | ComposerPanel                |
| `loading`   | LoadingIndicator             |
| `streaming` | StreamingPanel + Cancel CTA  |
| `blocked`   | BlockedBanner + Settings CTA |
| `handoff`   | HandoffBanner + Terminal CTA |
| `error`     | ErrorBanner + Retry CTA      |
| `empty`     | EmptyState                   |
| `cancelled` | CancelledNotice              |

### Contract B: Action Contract（no-op 禁止原則）

後続実装タスク完了後、以下の 4 handler はすべて実装済みでなければならない。
リファクタリングフェーズでは「変数化」のみ行い、実装は後続タスクに委ねる。

| Handler                | 配線先                                                |
| ---------------------- | ----------------------------------------------------- |
| `handleTerminalSwitch` | Store navigate action（"terminal" / "agent" view）    |
| `handleSelectProvider` | Store action: useSetSelectedProvider()                |
| `handleSelectModel`    | Store action: useSetSelectedModel()                   |
| `handleOpenTerminal`   | IPC: `app:open-terminal`（MINOR-A: channel 名要確認） |

### Contract C: Ownership

- **変更可**: `ChatPanel.tsx`（JSDoc、handler 変数抽出）
- **変更不可**: `ChatView.tsx`、`chatSlice.ts`、子コンポーネントの Props 型定義ファイル

---

## 4. リファクタリング実施チェックリスト

- [ ] handler 4 個（handleTerminalSwitch / handleSelectProvider / handleSelectModel / handleOpenTerminal）を `useCallback` 付き命名変数として抽出（GAP-01〜04）
- [ ] 各 handler に `// TODO(TASK-ID):` コメントを追加
- [ ] JSDoc `@role review-harness` を ChatPanel 宣言部に追加
- [ ] 状態機械（8 state union）の変更がないことを確認
- [ ] 子コンポーネント Props 型に変更がないことを確認
- [ ] chatSlice に変更がないことを確認
- [ ] `pnpm typecheck` が通ることを確認
- [ ] `pnpm lint` が通ることを確認
