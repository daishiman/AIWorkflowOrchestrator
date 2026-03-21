# Phase 5: 実装 - Slide Workspace UI 4領域実装

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 5 - 実装                     |
| 機能名   | ut-slide-ui-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

Phase 4 で作成したテストを全て PASS させるプロダクションコードを実装する。型定義・セレクタ・5コンポーネント・SlideWorkspace 再構成を行い、Red から Green への遷移を達成する。

## 実行タスク

| #   | タスク名                         | 目的                                                                     |
| --- | -------------------------------- | ------------------------------------------------------------------------ |
| T1  | 型定義（types.ts）実装           | SlideUIStatus, WatcherState, GuidanceVariant, deriveSlideUIStatus を定義 |
| T2  | 個別セレクタ（selectors.ts）実装 | useSyncStatus 等の store 個別セレクタを実装                              |
| T3  | SlideSyncCard 実装               | 同期状態を Badge + ラベルで表示するカードコンポーネント                  |
| T4  | SlideProgressRow 実装            | 進捗バーとキャンセル CTA を持つ行コンポーネント                          |
| T5  | SlideWatchStatus 実装            | ファイル監視状態をドット + ラベルで表示するコンポーネント                |
| T6  | SlideGuidanceBlock 実装          | ガイダンス/劣化の2バリアントを持つブロックコンポーネント                 |
| T7  | TerminalLauncher 実装            | コマンド表示 + コピー/起動 CTA を持つコンポーネント                      |
| T8  | SlideWorkspace 再構成            | 既存構造を4領域コンポーネントで再構成                                    |
| T9  | テスト実行・PASS 確認            | Phase 4 テスト全件 Green を確認                                          |

- 実装: 型、selector、4領域コンポーネント、SlideWorkspace 再構成を行い、Red から Green へ移行する。

## 参照資料

| 資料                                                         | 用途                                       |
| ------------------------------------------------------------ | ------------------------------------------ |
| `docs/30-workflows/ut-slide-ui-001/phase-2-design.md`        | 設計仕様（コンポーネント構造・Props 定義） |
| `docs/30-workflows/ut-slide-ui-001/phase-4-test-creation.md` | テストケース定義（Green の基準）           |
| `.claude/rules/01-architecture.md`                           | Apple HIG 準拠 UI/UX デザイン              |
| `.claude/rules/03-state-management.md`                       | Zustand 個別セレクタ設計原則               |
| `.claude/rules/06-known-pitfalls.md` P31                     | 個別セレクタ使用必須                       |
| `.claude/rules/06-known-pitfalls.md` P47                     | variantStyles Record パターン              |
| `.claude/rules/06-known-pitfalls.md` P48                     | useShallow 派生セレクタ                    |
| `.claude/rules/02-code-quality.md`                           | TypeScript 型安全・コーディング規約        |

## 実行手順

### Task 1: 型定義（types.ts）実装

**ファイル**: `apps/desktop/src/renderer/slide/types.ts`

1. Phase 2 設計書から型定義を転写する
2. `SlideUIStatus` enum を定義する:
   ```typescript
   export const SlideUIStatus = {
     synced: "synced",
     running: "running",
     degraded: "degraded",
     guidance: "guidance",
   } as const;
   export type SlideUIStatus =
     (typeof SlideUIStatus)[keyof typeof SlideUIStatus];
   ```
3. `WatcherState` enum を定義する:
   ```typescript
   export const WatcherState = {
     active: "active",
     paused: "paused",
     stopped: "stopped",
   } as const;
   export type WatcherState = (typeof WatcherState)[keyof typeof WatcherState];
   ```
4. `GuidanceVariant` を定義する:
   ```typescript
   export const GuidanceVariant = {
     guidance: "guidance",
     degraded: "degraded",
   } as const;
   export type GuidanceVariant =
     (typeof GuidanceVariant)[keyof typeof GuidanceVariant];
   ```
5. `deriveSlideUIStatus` 関数を実装する:
   - 入力パラメータから `SlideUIStatus` を導出するロジック
   - 未定義・無効値に対するデフォルト値返却
6. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/types.test.ts
   ```

### Task 2: 個別セレクタ（selectors.ts）実装

**ファイル**: `apps/desktop/src/renderer/slide/selectors.ts`

1. P31 対策: store 全体参照ではなく個別セレクタとして実装する
2. P48 対策: オブジェクトや配列を返すセレクタには `useShallow` を適用する
3. 各セレクタを実装する:

   ```typescript
   import { useShallow } from "zustand/react/shallow";
   import { useAppStore } from "@/renderer/store";

   export const useSyncStatus = () =>
     useAppStore((state) => state.slide.syncStatus);

   export const useWatcherState = () =>
     useAppStore((state) => state.slide.watcherState);

   export const useSlideProgress = () =>
     useAppStore(
       useShallow((state) => ({
         percent: state.slide.progress.percent,
         label: state.slide.progress.label,
       })),
     );

   export const useSlideGuidance = () =>
     useAppStore(
       useShallow((state) => ({
         variant: state.slide.guidance.variant,
         message: state.slide.guidance.message,
       })),
     );
   ```

4. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/selectors.test.ts
   ```

### Task 3: SlideSyncCard 実装

**ファイル**: `apps/desktop/src/renderer/slide/components/SlideSyncCard.tsx`

1. P47 対策: `variantStyles` を Record でモジュールスコープに定義し export する:
   ```typescript
   export const variantStyles: Record<SlideUIStatus, string> = {
     synced: "bg-[var(--status-success)] text-[var(--text-inverse)]",
     running: "bg-[var(--status-info)] text-[var(--text-inverse)]",
     degraded: "bg-[var(--status-warning)] text-[var(--text-primary)]",
     guidance: "bg-[var(--status-info)] text-[var(--text-inverse)]",
   };
   ```
2. コンポーネント Props を定義する:
   ```typescript
   interface SlideSyncCardProps {
     status: SlideUIStatus;
   }
   ```
3. Apple HIG 準拠のスタイルで実装する:
   - 8px グリッドスペーシング
   - 角丸 8-12px
   - 繊細な影（`shadow-sm`）
4. ARIA ラベルを付与する（`aria-label` でステータスを読み上げ可能に）
5. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/components/SlideSyncCard.test.tsx
   ```

### Task 4: SlideProgressRow 実装

**ファイル**: `apps/desktop/src/renderer/slide/components/SlideProgressRow.tsx`

1. Props を定義する:
   ```typescript
   interface SlideProgressRowProps {
     percent: number;
     label: string;
     onCancel?: () => void;
   }
   ```
2. プログレスバーを実装する:
   - `width` スタイルに `percent` を反映
   - `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax`
3. キャンセル CTA を実装する:
   - `percent === 100` の場合は `disabled` にする
   - `onCancel` が未定義の場合は CTA を非表示
4. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/components/SlideProgressRow.test.tsx
   ```

### Task 5: SlideWatchStatus 実装

**ファイル**: `apps/desktop/src/renderer/slide/components/SlideWatchStatus.tsx`

1. P47 対策: ドット色の variantStyles を Record で定義・export する:

   ```typescript
   export const dotStyles: Record<WatcherState, string> = {
     active: "bg-[var(--status-success)]",
     paused: "bg-[var(--status-warning)]",
     stopped: "bg-[var(--status-error)]",
   };

   export const labelMap: Record<WatcherState, string> = {
     active: "監視中",
     paused: "一時停止",
     stopped: "停止",
   };
   ```

2. `role="status"` を付与してアクセシビリティを確保する
3. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/components/SlideWatchStatus.test.tsx
   ```

### Task 6: SlideGuidanceBlock 実装

**ファイル**: `apps/desktop/src/renderer/slide/components/SlideGuidanceBlock.tsx`

1. Props を定義する:
   ```typescript
   interface SlideGuidanceBlockProps {
     variant: GuidanceVariant;
     message: string;
     ctaLabel: string;
     onCtaClick: () => void;
   }
   ```
2. P47 対策: variantStyles を Record で定義・export する
3. 2バリアントのスタイルを実装する:
   - `guidance`: 通常の情報スタイル（青系ボーダー）
   - `degraded`: 警告スタイル（オレンジ系ボーダー + 背景）
4. CTA ボタンのテキストをバリアントに応じて変更可能にする
5. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/components/SlideGuidanceBlock.test.tsx
   ```

### Task 7: TerminalLauncher 実装

**ファイル**: `apps/desktop/src/renderer/slide/components/TerminalLauncher.tsx`

1. Props を定義する:
   ```typescript
   interface TerminalLauncherProps {
     command: string;
     onCopy?: () => void;
     onLaunch?: () => void;
   }
   ```
2. コマンド表示を `<code>` 要素で実装する
3. コピー CTA を実装する:
   - `navigator.clipboard.writeText` を使用
   - コピー完了のフィードバック（一時的にラベル変更）
4. 起動 CTA を実装する:
   - P60 対策: IPC 呼び出しのレスポンスは wrapper 形式で処理する
5. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/components/TerminalLauncher.test.tsx
   ```

### Task 8: SlideWorkspace 再構成

**ファイル**: `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`（既存ファイル変更）

1. 既存の SlideWorkspace.tsx を Read ツールで確認する
2. P31 対策: 個別セレクタを使用して store 値を取得する:
   ```typescript
   const syncStatus = useSyncStatus();
   const watcherState = useWatcherState();
   const progress = useSlideProgress();
   const guidance = useSlideGuidance();
   const uiStatus = deriveSlideUIStatus(
     syncStatus,
     isExecuting,
     Boolean(guidance),
     error,
   );
   ```
3. 条件レンダリングを実装する:
   - 常時表示: `SlideSyncCard`
   - `running` 状態: `SlideProgressRow` を追加表示
   - `degraded` 状態: `SlideGuidanceBlock (degraded)` を追加表示
   - `guidance` 状態: `SlideGuidanceBlock (guidance)` を追加表示
   - `watching` 状態: `SlideWatchStatus` を追加表示
   - 全状態: `TerminalLauncher` を右下固定表示
4. `data-testid` 属性を各領域に付与する（統合テスト用）
5. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/SlideWorkspace.test.tsx
   ```

### Task 9: テスト実行・PASS 確認

1. 全テストを一括実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/ --reporter=verbose
   ```
2. 全テストが Green（PASS）であることを確認する
3. 失敗テストがある場合は該当 Task に戻って修正する
4. `pnpm lint` で ESLint エラーがないことを確認する
5. `pnpm typecheck` で型エラーがないことを確認する

## 統合テスト連携

- Task 9 で Phase 4 の全テスト（T1-T8）が Green であることを確認する
- Lint・TypeCheck も PASS であることを確認してから Phase 6 に進む
- 既存テスト（slide ディレクトリ外）に影響がないことを `pnpm vitest run` で確認する

## 多角的チェック観点

| 観点               | チェック内容                                               | 対応 Task  |
| ------------------ | ---------------------------------------------------------- | ---------- |
| テスト Green       | Phase 4 の全テストが PASS すること                         | T9         |
| P31 準拠           | store 全体参照がなく個別セレクタのみ使用していること       | T2, T8     |
| P47 準拠           | variantStyles が Record で export されていること           | T3, T5, T6 |
| P48 準拠           | オブジェクト返却セレクタに useShallow が適用されていること | T2         |
| Apple HIG 準拠     | 8px グリッド、角丸 8-12px、繊細な影が適用されていること    | T3-T7      |
| アクセシビリティ   | ARIA ラベル、role 属性、キーボード操作可能であること       | T3-T7      |
| 型安全             | any 型を使用していないこと                                 | T1-T8      |
| コンポーネント SRP | 各コンポーネントが単一責務であること                       | T3-T7      |
| P60 準拠           | IPC レスポンスが wrapper 形式で処理されていること          | T7         |
| 既存テスト非破壊   | slide ディレクトリ外のテストに影響がないこと               | T9         |

## 成果物

| ファイル                                                                      | 説明                           |
| ----------------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/renderer/slide/types.ts`                                    | 型定義（新規作成）             |
| `apps/desktop/src/renderer/slide/selectors.ts`                                | 個別セレクタ（新規作成）       |
| `apps/desktop/src/renderer/slide/components/SlideSyncCard.tsx`                | SlideSyncCard（新規作成）      |
| `apps/desktop/src/renderer/slide/components/SlideProgressRow.tsx`             | SlideProgressRow（新規作成）   |
| `apps/desktop/src/renderer/slide/components/SlideWatchStatus.tsx`             | SlideWatchStatus（新規作成）   |
| `apps/desktop/src/renderer/slide/components/SlideGuidanceBlock.tsx`           | SlideGuidanceBlock（新規作成） |
| `apps/desktop/src/renderer/slide/components/TerminalLauncher.tsx`             | TerminalLauncher（新規作成）   |
| `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`                          | SlideWorkspace（既存変更）     |
| `docs/30-workflows/ut-slide-ui-001/outputs/phase-5/implementation-summary.md` | 実装サマリ                     |

## 完了条件

- [ ] 全8ファイル（型定義 + セレクタ + 5コンポーネント + SlideWorkspace）が実装されていること
- [ ] Phase 4 の全テストが Green（PASS）であること
- [ ] `pnpm lint` がエラーなしで通ること
- [ ] `pnpm typecheck` がエラーなしで通ること
- [ ] any 型が一切使用されていないこと
- [ ] P31 準拠: 個別セレクタのみ使用していること
- [ ] P47 準拠: variantStyles が Record で export されていること
- [ ] P48 準拠: useShallow が適用されていること
- [ ] Apple HIG 準拠のスタイリングが適用されていること
- [ ] 実装サマリ（`outputs/phase-5/implementation-summary.md`）が作成されていること

## サブタスク管理

- [ ] T1: 型定義（types.ts）実装
- [ ] T2: 個別セレクタ（selectors.ts）実装
- [ ] T3: SlideSyncCard 実装
- [ ] T4: SlideProgressRow 実装
- [ ] T5: SlideWatchStatus 実装
- [ ] T6: SlideGuidanceBlock 実装
- [ ] T7: TerminalLauncher 実装
- [ ] T8: SlideWorkspace 再構成
- [ ] T9: テスト実行・PASS 確認
- [ ] Lint PASS 確認
- [ ] TypeCheck PASS 確認
- [ ] 実装サマリ作成

## タスク 100% 実行確認

Phase 5 の全タスクが完了したことを以下で確認する:

1. `cd apps/desktop && pnpm vitest run src/renderer/slide/ --reporter=verbose` で全テスト Green
2. `pnpm lint` でエラーなし
3. `pnpm typecheck` でエラーなし
4. `grep -rn "any" apps/desktop/src/renderer/slide/*.ts apps/desktop/src/renderer/slide/**/*.tsx | grep -v "test" | grep -v "node_modules"` で any 型使用がないこと
5. `grep -rn "useAppStore()" apps/desktop/src/renderer/slide/ --include="*.ts" --include="*.tsx" | grep -v "test" | grep -v "selectors"` で store 全体参照がないこと

## 次の Phase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）に進む。カバレッジ不足箇所の特定と追加テストの作成が目標である。
