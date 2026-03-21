# Phase 4: テスト作成 - Slide Workspace UI 4領域実装

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 4 - テスト作成               |
| 機能名   | ut-slide-ui-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

テストファーストの原則に従い、Phase 2 設計で定義された5コンポーネント・型定義・セレクタの全テストケースを先行作成する。Red 状態（テスト失敗）を確認し、Phase 5 実装の完了基準を明確にする。

## 実行タスク

| #   | タスク名                         | 目的                                                             |
| --- | -------------------------------- | ---------------------------------------------------------------- |
| T1  | deriveSlideUIStatus 単体テスト   | 型定義の派生関数が全状態マッピングを正しく導出するか検証         |
| T2  | 個別セレクタ renderHook テスト   | useSyncStatus 等のセレクタが store 値を正しく返すか検証          |
| T3  | SlideSyncCard レンダリングテスト | 4状態（synced/running/degraded/guidance）の Badge 色・ラベル検証 |
| T4  | SlideProgressRow テスト          | 進捗バー表示・キャンセル CTA の動作検証                          |
| T5  | SlideWatchStatus テスト          | 3状態（active/paused/stopped）のドット色・ラベル検証             |
| T6  | SlideGuidanceBlock テスト        | guidance/degraded 2バリアント × CTA 動作検証                     |
| T7  | TerminalLauncher テスト          | コマンド表示・コピー CTA・起動 CTA 動作検証                      |
| T8  | SlideWorkspace 統合テスト        | 条件レンダリング（状態に応じた領域表示切替）検証                 |

- テスト設計: 派生状態、selector、4領域 UI、Terminal Launcher、統合レンダリングの Red テストを先行作成する。

## 参照資料

| 資料                                                          | 用途                                       |
| ------------------------------------------------------------- | ------------------------------------------ |
| `docs/30-workflows/ut-slide-ui-001/phase-1-requirements.md`   | Phase 1 受入基準と 4領域 UI 要件の再確認   |
| `docs/30-workflows/ut-slide-ui-001/phase-2-design.md`         | 設計仕様（コンポーネント構造・Props 定義） |
| `docs/30-workflows/ut-slide-ui-001/phase-3-design-review.md`  | Phase 3 指摘事項の反映確認                 |
| `.claude/rules/06-known-pitfalls.md` P39                      | happy-dom 環境での userEvent 禁止          |
| `.claude/rules/06-known-pitfalls.md` P40                      | テスト実行ディレクトリ依存                 |
| `.claude/rules/06-known-pitfalls.md` P47                      | variantStyles Record パターン              |
| `.claude/rules/06-known-pitfalls.md` P48                      | useShallow 派生セレクタ無限ループ防止      |
| `.claude/rules/06-known-pitfalls.md` P60                      | IPC レスポンス wrapper 形式                |
| `.claude/rules/06-known-pitfalls.md` P31                      | 個別セレクタ使用必須                       |
| `.claude/rules/02-code-quality.md`                            | TDD 原則・カバレッジ基準                   |
| 既存テスト: `apps/desktop/src/renderer/slide/**/*.test.ts(x)` | 既存テストパターンの参照                   |

## 実行手順

### Task 1: deriveSlideUIStatus 単体テスト

**ファイル**: `apps/desktop/src/renderer/slide/types.test.ts`

1. Phase 2 設計書から `deriveSlideUIStatus` の入力・出力マッピングを確認する
2. 全状態パターンのテストケースを列挙する:
   - synced 状態 → `SlideUIStatus.synced`
   - running 状態 → `SlideUIStatus.running`
   - degraded 状態 → `SlideUIStatus.degraded`
   - guidance 状態 → `SlideUIStatus.guidance`
3. 境界値・無効値のテストケースを追加する:
   - undefined 入力 → デフォルト値
   - 未定義の文字列 → デフォルト値
4. テストを作成し、Red 状態（失敗）を確認する

```bash
cd apps/desktop && pnpm vitest run src/renderer/slide/types.test.ts
```

### Task 2: 個別セレクタ renderHook テスト

**ファイル**: `apps/desktop/src/renderer/slide/selectors.test.ts`

1. 既存テストから `renderHook` パターンを参照する:
   ```bash
   grep -rn "renderHook" apps/desktop/src/renderer/ --include="*.test.ts" -l
   ```
2. 各セレクタのテストケースを作成する:
   - `useSyncStatus`: store の syncStatus 値を返すことを検証
   - `useWatcherState`: store の watcherState 値を返すことを検証
   - `useSlideProgress`: store の progress 値を返すことを検証
   - `useSlideGuidance`: store の guidance 値を返すことを検証
3. store のモック設定:
   ```typescript
   vi.mock("@/renderer/store", () => ({
     useAppStore: vi.fn(),
   }));
   ```
4. P48 対策: `useShallow` を使用するセレクタはオブジェクト比較の安定性もテストする
5. Red 状態を確認する

```bash
cd apps/desktop && pnpm vitest run src/renderer/slide/selectors.test.ts
```

### Task 3: SlideSyncCard レンダリングテスト

**ファイル**: `apps/desktop/src/renderer/slide/components/SlideSyncCard.test.tsx`

1. 既存コンポーネントテストのインポートパスパターンを確認する（P63 対策）:
   ```bash
   grep -n "^import" apps/desktop/src/renderer/slide/**/*.test.tsx
   ```
2. テスト環境セットアップ:
   - `@testing-library/react` の `render`, `screen` をインポート
   - `fireEvent` を使用（P39: userEvent 禁止）
3. 4状態のレンダリングテストを作成する:
   - `synced`: 緑 Badge + "同期完了" ラベル
   - `running`: 青 Badge + "実行中" ラベル
   - `degraded`: オレンジ Badge + "問題あり" ラベル
   - `guidance`: 青 Badge + "設定が必要" ラベル
4. P47 対策: `variantStyles` を SlideSyncCard からインポートし、テスト側で期待値として使用する
5. アクセシビリティ: ARIA ラベルの存在を検証する
6. Red 状態を確認する

```bash
cd apps/desktop && pnpm vitest run src/renderer/slide/components/SlideSyncCard.test.tsx
```

### Task 4: SlideProgressRow テスト

**ファイル**: `apps/desktop/src/renderer/slide/components/SlideProgressRow.test.tsx`

1. テストケースを作成する:
   - 進捗 0% 表示: プログレスバー幅 0%
   - 進捗 50% 表示: プログレスバー幅 50%
   - 進捗 100% 表示: プログレスバー幅 100%、完了状態
   - キャンセル CTA: `fireEvent.click` でコールバック発火を検証
   - キャンセル CTA disabled 状態: 100% 時に disabled
2. Props 検証:
   - `percent: number` (0-100)
   - `label: string`
   - `onCancel?: () => void`
3. Red 状態を確認する

```bash
cd apps/desktop && pnpm vitest run src/renderer/slide/components/SlideProgressRow.test.tsx
```

### Task 5: SlideWatchStatus テスト

**ファイル**: `apps/desktop/src/renderer/slide/components/SlideWatchStatus.test.tsx`

1. 3状態のレンダリングテストを作成する:
   - `active`: 緑ドット + "監視中" ラベル
   - `paused`: 黄ドット + "一時停止" ラベル
   - `stopped`: 赤ドット + "停止" ラベル
2. P47 対策: ドット色の variantStyles を Record で定義・検証する
3. アクセシビリティ: ステータスの role="status" を検証する
4. Red 状態を確認する

```bash
cd apps/desktop && pnpm vitest run src/renderer/slide/components/SlideWatchStatus.test.tsx
```

### Task 6: SlideGuidanceBlock テスト

**ファイル**: `apps/desktop/src/renderer/slide/components/SlideGuidanceBlock.test.tsx`

1. 2バリアントのレンダリングテストを作成する:
   - `guidance`: 通常ガイダンス表示 + CTA ボタン
   - `degraded`: 警告スタイル + フォールバック CTA
2. CTA 動作テスト:
   - `fireEvent.click` でコールバック発火を検証
   - CTA テキストがバリアントに応じて変わることを検証
3. P47 対策: variantStyles Record でスタイル検証
4. Red 状態を確認する

```bash
cd apps/desktop && pnpm vitest run src/renderer/slide/components/SlideGuidanceBlock.test.tsx
```

### Task 7: TerminalLauncher テスト

**ファイル**: `apps/desktop/src/renderer/slide/components/TerminalLauncher.test.tsx`

1. コマンド表示テスト:
   - `command` props が `<code>` 要素内に表示されることを検証
2. コピー CTA テスト:
   - `fireEvent.click` でコピーコールバック発火を検証
   - clipboard API モック（`navigator.clipboard.writeText`）
3. 起動 CTA テスト:
   - `fireEvent.click` で起動コールバック発火を検証
   - P60 対策: IPC レスポンスは `{ success: boolean, data?, error? }` wrapper 形式で検証
4. Red 状態を確認する

```bash
cd apps/desktop && pnpm vitest run src/renderer/slide/components/TerminalLauncher.test.tsx
```

### Task 8: SlideWorkspace 統合テスト

**ファイル**: `apps/desktop/src/renderer/slide/SlideWorkspace.test.tsx`

1. store モックを設定し、状態に応じた条件レンダリングを検証する:
   - synced 状態: SlideSyncCard + SlideWatchStatus が表示
   - running 状態: SlideSyncCard + SlideProgressRow が表示
   - degraded 状態: SlideSyncCard + SlideGuidanceBlock (degraded) が表示
   - guidance 状態: SlideSyncCard + SlideGuidanceBlock (guidance) が表示
2. Persistent Terminal Launcher が全状態で表示されることを検証する
3. P31 対策: store は個別セレクタ経由でモック化する
4. 全子コンポーネントの存在を `screen.getByTestId` で検証する
5. Red 状態を確認する

```bash
cd apps/desktop && pnpm vitest run src/renderer/slide/SlideWorkspace.test.tsx
```

## 統合テスト連携

- Task 1-7 の単体テストが全て Red（失敗）であることを確認してから Phase 5 に進む
- Task 8 の統合テストも Red であることを確認する
- テスト実行コマンドは全て `cd apps/desktop && pnpm vitest run` で実行する（P40 準拠）

## 多角的チェック観点

| 観点             | チェック内容                                                     | 対応 Task  |
| ---------------- | ---------------------------------------------------------------- | ---------- |
| TDD 原則         | 全テストが Red（実装前に失敗する）であること                     | T1-T8      |
| P39 準拠         | `userEvent` を使用せず `fireEvent` のみであること                | T3-T8      |
| P40 準拠         | テスト実行が `cd apps/desktop` から行われること                  | T1-T8      |
| P47 準拠         | variantStyles を Record でコンポーネントから import していること | T3, T5, T6 |
| P48 準拠         | useShallow 使用セレクタのテストで安定性を検証していること        | T2         |
| P31 準拠         | store 全体参照ではなく個別セレクタをモックしていること           | T2, T8     |
| P60 準拠         | IPC レスポンスが wrapper 形式で検証されていること                | T7         |
| P63 準拠         | インポートパスが既存テストを参照して記述されていること           | T1-T8      |
| アクセシビリティ | ARIA ラベル・role 属性がテストに含まれていること                 | T3, T5     |
| 境界値           | 0%, 50%, 100% や空文字列のテストケースが含まれていること         | T4         |

## 成果物

| ファイル                                                                 | 説明                             |
| ------------------------------------------------------------------------ | -------------------------------- |
| `apps/desktop/src/renderer/slide/types.test.ts`                          | deriveSlideUIStatus 単体テスト   |
| `apps/desktop/src/renderer/slide/selectors.test.ts`                      | 個別セレクタ renderHook テスト   |
| `apps/desktop/src/renderer/slide/components/SlideSyncCard.test.tsx`      | SlideSyncCard レンダリングテスト |
| `apps/desktop/src/renderer/slide/components/SlideProgressRow.test.tsx`   | SlideProgressRow テスト          |
| `apps/desktop/src/renderer/slide/components/SlideWatchStatus.test.tsx`   | SlideWatchStatus テスト          |
| `apps/desktop/src/renderer/slide/components/SlideGuidanceBlock.test.tsx` | SlideGuidanceBlock テスト        |
| `apps/desktop/src/renderer/slide/components/TerminalLauncher.test.tsx`   | TerminalLauncher テスト          |
| `apps/desktop/src/renderer/slide/SlideWorkspace.test.tsx`                | SlideWorkspace 統合テスト        |
| `docs/30-workflows/ut-slide-ui-001/outputs/phase-4/test-design.md`       | テスト設計書                     |

## 完了条件

- [ ] 全8テストファイルが作成されていること
- [ ] 全テストが Red（実装なしで失敗する）であることが確認されていること
- [ ] P39 準拠: `userEvent` が一切使用されていないこと
- [ ] P40 準拠: テスト実行が `cd apps/desktop` から行われていること
- [ ] P47 準拠: variantStyles が Record 定数としてテスト側で参照されていること
- [ ] P31 準拠: 個別セレクタのモック化が行われていること
- [ ] P60 準拠: IPC レスポンスが wrapper 形式で検証されていること
- [ ] アクセシビリティテスト（ARIA ラベル）が含まれていること
- [ ] テスト設計書（`outputs/phase-4/test-design.md`）が作成されていること

## サブタスク管理

- [ ] T1: deriveSlideUIStatus 単体テスト作成
- [ ] T2: 個別セレクタ renderHook テスト作成
- [ ] T3: SlideSyncCard レンダリングテスト作成
- [ ] T4: SlideProgressRow テスト作成
- [ ] T5: SlideWatchStatus テスト作成
- [ ] T6: SlideGuidanceBlock テスト作成
- [ ] T7: TerminalLauncher テスト作成
- [ ] T8: SlideWorkspace 統合テスト作成
- [ ] 全テスト Red 状態確認
- [ ] テスト設計書作成

## タスク 100% 実行確認

Phase 4 の全タスクが完了したことを以下で確認する:

1. `cd apps/desktop && pnpm vitest run src/renderer/slide/ --reporter=verbose` で全テストファイルの存在と Red 状態を確認
2. `grep -rn "userEvent" apps/desktop/src/renderer/slide/**/*.test.ts*` で P39 違反がないことを確認
3. `grep -rn "useAppStore()" apps/desktop/src/renderer/slide/**/*.test.ts*` で P31 違反（store 全体参照）がないことを確認

## 次の Phase

Phase 5: 実装（`phase-5-implementation.md`）に進む。Phase 4 で作成した全テストを Green（PASS）にすることが Phase 5 の目標である。
