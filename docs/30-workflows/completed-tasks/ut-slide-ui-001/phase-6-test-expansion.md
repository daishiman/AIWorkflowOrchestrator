# Phase 6: テスト拡充 - Slide Workspace UI 4領域実装

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 6 - テスト拡充               |
| 機能名   | ut-slide-ui-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

Phase 5 実装後のカバレッジ測定結果に基づき、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）未達箇所を特定し、境界値・エッジケース・アクセシビリティ・エラー状態のテストを追加する。

## 実行タスク

| #   | タスク名                   | 目的                                                    |
| --- | -------------------------- | ------------------------------------------------------- |
| T1  | カバレッジ測定             | 現在のカバレッジを測定し、不足箇所を特定する            |
| T2  | 境界値テスト追加           | percent 0/50/100、長いテキスト、null/undefined 値を検証 |
| T3  | エッジケーステスト追加     | 全状態遷移パターン、CTA disabled 状態を検証             |
| T4  | アクセシビリティテスト追加 | ARIA ラベル、role 属性、キーボード操作を網羅的に検証    |
| T5  | エラー状態テスト追加       | degraded + guidance の詳細シナリオを検証                |

- テスト拡充: カバレッジ不足、状態遷移、アクセシビリティ、degraded/guidance の回帰を追加で塞ぐ。

## 参照資料

| 資料                                                          | 用途                                    |
| ------------------------------------------------------------- | --------------------------------------- |
| `docs/30-workflows/ut-slide-ui-001/phase-4-test-creation.md`  | 既存テストケースの確認                  |
| `docs/30-workflows/ut-slide-ui-001/phase-5-implementation.md` | 実装詳細の確認                          |
| `.claude/rules/02-code-quality.md`                            | カバレッジ基準（Line 80%, Branch 60%+） |
| `.claude/rules/06-known-pitfalls.md` P39                      | happy-dom: fireEvent 使用               |
| `.claude/rules/06-known-pitfalls.md` P40                      | テスト実行ディレクトリ準拠              |
| `.claude/rules/01-architecture.md`                            | WCAG 2.1 AA 準拠要件                    |

## 実行手順

### Task 1: カバレッジ測定

1. Phase 5 完了後のカバレッジを測定する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/ --coverage --reporter=verbose
   ```
2. カバレッジレポートの各ファイルについて以下を記録する:
   - Line Coverage（%）
   - Branch Coverage（%）
   - Function Coverage（%）
3. 基準未達のファイル・行番号を一覧化する:
   - Line Coverage < 80%
   - Branch Coverage < 60%
   - Function Coverage < 80%
4. 未カバー行の分析:
   - 分岐の片側のみテスト済み（Branch 不足）
   - デフォルト値パス未通過（Line 不足）
   - ユーティリティ関数未呼び出し（Function 不足）

### Task 2: 境界値テスト追加

**対象ファイル**: 各コンポーネントのテストファイルに追記

1. **SlideProgressRow 境界値テスト**:
   - `percent: 0` — プログレスバー幅が 0% であること
   - `percent: 50` — プログレスバー幅が 50% であること
   - `percent: 100` — プログレスバー幅が 100%、キャンセル CTA が disabled
   - `percent: -1` — 0% にクランプされること（防御的処理）
   - `percent: 101` — 100% にクランプされること（防御的処理）
   - `percent: NaN` — デフォルト値（0%）にフォールバックすること

2. **長いテキスト境界値テスト**:
   - `label` に 200 文字の文字列を渡した場合のレンダリング確認
   - `command` に 500 文字のコマンドを渡した場合の表示確認
   - `message` に改行を含む文字列を渡した場合の表示確認

3. **null/undefined 値テスト**:
   - `deriveSlideUIStatus(undefined)` — デフォルト値を返すこと
   - `deriveSlideUIStatus(null as unknown)` — デフォルト値を返すこと
   - 各セレクタが store に該当 slice がない場合のフォールバック動作

4. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/ --reporter=verbose
   ```

### Task 3: エッジケーステスト追加

**対象ファイル**: 各コンポーネントのテストファイルに追記

1. **状態遷移テスト（SlideWorkspace）**:
   - synced → running への遷移: SlideSyncCard の Badge が更新されること
   - running → degraded への遷移: SlideProgressRow が消え SlideGuidanceBlock が表示されること
   - degraded → guidance への遷移: CTA と terminal handoff surface が切り替わること
   - guidance → synced への遷移: ガイダンスが消え通常状態に戻ること

2. **CTA disabled 状態テスト**:
   - SlideProgressRow: `onCancel` が undefined の場合、キャンセルボタンが非表示
   - TerminalLauncher: `onLaunch` が undefined の場合、起動ボタンが非表示
   - SlideGuidanceBlock: CTA クリック後の二重送信防止

3. **コンポーネント非表示テスト**:
   - 各条件レンダリングで、不要なコンポーネントが DOM に存在しないことを `queryByTestId` で検証

4. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/ --reporter=verbose
   ```

### Task 4: アクセシビリティテスト追加

**対象ファイル**: 各コンポーネントのテストファイルに追記

1. **ARIA ラベルテスト**:
   - SlideSyncCard: `aria-label` にステータスを含む読み上げテキストがあること
   - SlideProgressRow: `role="progressbar"` + `aria-valuenow` + `aria-valuemin="0"` + `aria-valuemax="100"` が設定されていること
   - SlideWatchStatus: `role="status"` が設定されていること

2. **キーボード操作テスト**:
   - SlideProgressRow キャンセル CTA: `fireEvent.keyDown(button, { key: "Enter" })` で発火
   - SlideGuidanceBlock CTA: `fireEvent.keyDown(button, { key: "Enter" })` で発火
   - TerminalLauncher コピー CTA: `fireEvent.keyDown(button, { key: "Enter" })` で発火
   - TerminalLauncher 起動 CTA: `fireEvent.keyDown(button, { key: "Enter" })` で発火

3. **コントラスト・視覚テスト**（テストコードで検証可能な範囲）:
   - Badge テキストと背景色の組み合わせが WCAG AA コントラスト比要件を満たす CSS クラスであること
   - disabled 状態のボタンに `aria-disabled="true"` が設定されていること

4. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/ --reporter=verbose
   ```

### Task 5: エラー状態テスト追加

**対象ファイル**: `SlideGuidanceBlock.test.tsx`, `SlideWorkspace.test.tsx` に追記

1. **degraded バリアント詳細テスト**:
   - 長いエラーメッセージの表示確認
   - エラーメッセージに HTML 特殊文字（`<`, `>`, `&`）が含まれる場合のエスケープ
   - CTA クリック後のコールバック引数検証

2. **guidance バリアント詳細テスト**:
   - ガイダンスメッセージの表示確認
   - CTA ラベルのカスタマイズ検証
   - CTA が非活性の場合の表示

3. **SlideWorkspace エラー状態統合テスト**:
   - degraded 状態で SlideGuidanceBlock が degraded バリアントで表示されること
   - degraded → synced への復帰で SlideGuidanceBlock が消えること
   - 複数エラーが連続した場合の表示更新

4. テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/slide/ --reporter=verbose
   ```

## 統合テスト連携

- Task 1 のカバレッジ測定結果を基に、Task 2-5 の追加テストを優先度付けする
- 全テスト追加後に再度カバレッジ測定を行い、基準充足を確認する
- 基準未達の場合は追加テストを作成し、再測定を繰り返す
- Phase 7 で最終カバレッジ確認を行う

## 多角的チェック観点

| 観点                | チェック内容                                                 | 対応 Task |
| ------------------- | ------------------------------------------------------------ | --------- |
| カバレッジ基準      | Line 80%+, Branch 60%+, Function 80%+ を満たすこと           | T1-T5     |
| 境界値網羅          | 0, 50, 100, 負値, 超過値, NaN がテストされていること         | T2        |
| null/undefined 安全 | 無効値入力時にデフォルトフォールバックが検証されていること   | T2        |
| 状態遷移            | 全状態間の遷移パターンがテストされていること                 | T3        |
| CTA 状態            | disabled, 非表示, 二重送信防止がテストされていること         | T3        |
| WCAG 2.1 AA         | ARIA ラベル, role 属性, キーボード操作がテストされていること | T4        |
| エラー状態          | degraded/guidance の詳細シナリオがテストされていること       | T5        |
| P39 準拠            | 追加テストでも userEvent を使用していないこと                | T2-T5     |
| P40 準拠            | テスト実行が `cd apps/desktop` から行われていること          | T1-T5     |

## 成果物

| ファイル                                                                     | 説明                         |
| ---------------------------------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/renderer/slide/types.test.ts`                              | 境界値テスト追加             |
| `apps/desktop/src/renderer/slide/selectors.test.ts`                          | フォールバック動作テスト追加 |
| `apps/desktop/src/renderer/slide/components/SlideSyncCard.test.tsx`          | ARIA テスト追加              |
| `apps/desktop/src/renderer/slide/components/SlideProgressRow.test.tsx`       | 境界値・キーボードテスト追加 |
| `apps/desktop/src/renderer/slide/components/SlideWatchStatus.test.tsx`       | ARIA テスト追加              |
| `apps/desktop/src/renderer/slide/components/SlideGuidanceBlock.test.tsx`     | エラー状態詳細テスト追加     |
| `apps/desktop/src/renderer/slide/components/TerminalLauncher.test.tsx`       | キーボード操作テスト追加     |
| `apps/desktop/src/renderer/slide/SlideWorkspace.test.tsx`                    | 状態遷移テスト追加           |
| `docs/30-workflows/ut-slide-ui-001/outputs/phase-6/test-expansion-report.md` | テスト拡充レポート           |

## 完了条件

- [ ] カバレッジ測定が実行され、不足箇所が特定されていること
- [ ] 境界値テスト（percent 0/50/100/-1/101/NaN、長いテキスト、null/undefined）が追加されていること
- [ ] エッジケーステスト（状態遷移、CTA disabled、コンポーネント非表示）が追加されていること
- [ ] アクセシビリティテスト（ARIA ラベル、role 属性、キーボード操作）が追加されていること
- [ ] エラー状態テスト（degraded/guidance 詳細シナリオ）が追加されていること
- [ ] 全テストが Green（PASS）であること
- [ ] P39 準拠: 追加テストで userEvent を使用していないこと
- [ ] テスト拡充レポート（`outputs/phase-6/test-expansion-report.md`）が作成されていること

## サブタスク管理

- [ ] T1: カバレッジ測定・不足箇所特定
- [ ] T2: 境界値テスト追加
- [ ] T3: エッジケーステスト追加
- [ ] T4: アクセシビリティテスト追加
- [ ] T5: エラー状態テスト追加
- [ ] 全テスト Green 確認
- [ ] カバレッジ再測定
- [ ] テスト拡充レポート作成

## タスク 100% 実行確認

Phase 6 の全タスクが完了したことを以下で確認する:

1. `cd apps/desktop && pnpm vitest run src/renderer/slide/ --coverage --reporter=verbose` でカバレッジ測定
2. カバレッジレポートで Line 80%+, Branch 60%+, Function 80%+ を確認
3. `grep -rn "userEvent" apps/desktop/src/renderer/slide/**/*.test.ts*` で P39 違反がないこと
4. 全テスト PASS を確認

## 次の Phase

Phase 7: カバレッジ確認（`phase-7-coverage-check.md`）に進む。カバレッジ基準の最終充足確認を行い、未達の場合は Phase 6 に戻る。
