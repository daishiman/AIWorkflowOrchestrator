# Phase 6: テスト拡充

## メタ情報

| 項目           | 値                                              |
| -------------- | ----------------------------------------------- |
| タスク ID      | UT-UI-05A-IMPLEMENTATION-CLOSURE-001            |
| Phase          | 6 — テスト拡充                                  |
| 前提 Phase     | Phase 5（実装）完了 — 全 67 テストが Green 状態 |
| 作成日         | 2026-03-03                                      |
| 対象課題       | UT-UI-05A-001〜007（7 課題全て）                |
| カバレッジ目標 | Line 80%+ / Branch 60%+ / Function 80%+         |

## 目的

Phase 5 で実装したコードに対してカバレッジ不足箇所を特定し、境界値・異常系・アクセシビリティ・レスポンシブ・アニメーション無効化のテストを追加する。Phase 7 でのカバレッジ基準達成に向けた土台を作る。

## 実行タスク

- カバレッジ診断: 現状カバレッジの不足箇所を可視化する
- 境界値強化: 空値/上限値/異常入力のエッジケーステストを追加する
- 異常系強化: IPC エラー/保存失敗/ネットワーク断のテストを追加する
- a11y 強化: 残 ARIA/フォーカストラップ/スクリーンリーダー対応テストを追加する
- アニメーション強化: prefers-reduced-motion/CSS 変数テストを追加する
- 回帰防止確認: 追加テストを含む全テストの Green を確認する

### Task 1: 現状カバレッジ測定

**目的**: Phase 5 完了時点のカバレッジを測定し、不足箇所を特定する。

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/SkillEditorView/
```

**記録項目**:

| ファイル / コンポーネント      | Line   | Branch | Function | 不足箇所   |
| ------------------------------ | ------ | ------ | -------- | ---------- |
| FileTreePanel.tsx              | —%     | —%     | —%       | 測定後記載 |
| MobileDrawer.tsx               | —%     | —%     | —%       | 測定後記載 |
| Toast.tsx                      | —%     | —%     | —%       | 測定後記載 |
| ReadOnlyBanner.tsx             | —%     | —%     | —%       | 測定後記載 |
| hooks/useKeyboardNavigation.ts | —%     | —%     | —%       | 測定後記載 |
| hooks/useToast.ts              | —%     | —%     | —%       | 測定後記載 |
| hooks/useSkillEditor.ts        | —%     | —%     | —%       | 測定後記載 |
| utils/keyboardUtils.ts         | —%     | —%     | —%       | 測定後記載 |
| **全体**                       | **—%** | **—%** | **—%**   | —          |

### Task 2: UT-UI-05A-001 境界値・異常系テスト追加

**目的**: FileTree キーボードナビゲーションのエッジケースをカバーする。

| テストケース                                               | 対象ファイル                    | 検証内容                              |
| ---------------------------------------------------------- | ------------------------------- | ------------------------------------- |
| ノードが 0 件のとき Arrow キーを押しても何も起きない       | `FileTreePanel.test.tsx`        | `focusedIndex` が -1 のまま           |
| 展開済みディレクトリを ArrowLeft で閉じる                  | `FileTreePanel.test.tsx`        | `aria-expanded="false"` への変化      |
| 折り畳みディレクトリを ArrowLeft で親へ移動する            | `FileTreePanel.test.tsx`        | 親ノードのフォーカス                  |
| ネストしたディレクトリ（3 階層）でナビゲーションが動作する | `FileTreePanel.test.tsx`        | 深い階層での Arrow キーナビゲーション |
| ファイルが 100 件ある状態での Home/End キー動作            | `FileTreePanel.test.tsx`        | 0 番目と 99 番目へのフォーカス        |
| Tab キーでフォーカスが正しい順序になる                     | `FileTreePanel.test.tsx`        | `tabIndex` のフォーカス順序           |
| moveFocus('home') でインデックスが 0 になる                | `useKeyboardNavigation.test.ts` | `focusedIndex === 0`                  |
| moveFocus('end') でインデックスが最後になる                | `useKeyboardNavigation.test.ts` | `focusedIndex === nodes.length - 1`   |

### Task 3: UT-UI-05A-002 境界値・異常系テスト追加

**目的**: モバイルドロワーのエッジケースをカバーする。

| テストケース                                                 | 対象ファイル                      | 検証内容                                       |
| ------------------------------------------------------------ | --------------------------------- | ---------------------------------------------- |
| ドロワーが閉じている状態で Escape を押しても何も起きない     | `SkillEditorView.drawer.test.tsx` | isDrawerOpen が false のまま                   |
| ドロワー開時に背景スクロールが防止される                     | `SkillEditorView.drawer.test.tsx` | `overflow: hidden` の適用または同等処理        |
| ドロワー内でTabキーが循環する（フォーカストラップ）          | `SkillEditorView.drawer.test.tsx` | Tab/Shift+Tab でフォーカスがドロワー内に留まる |
| 768px ちょうどのとき 2 ペインレイアウトになる（境界値）      | `SkillEditorView.drawer.test.tsx` | ハンバーガーボタンの非表示                     |
| リサイズで 767px → 768px に変化したとき 2 ペインに切り替わる | `SkillEditorView.drawer.test.tsx` | viewport 変化後のレイアウト変化                |

### Task 4: UT-UI-05A-003 境界値・異常系テスト追加

**目的**: 保存ショートカットのエッジケースをカバーする。

| テストケース                                                  | 対象ファイル                      | 検証内容                                           |
| ------------------------------------------------------------- | --------------------------------- | -------------------------------------------------- |
| Cmd+S 以外のキー（Cmd+A 等）では保存されない                  | `useSkillEditor.shortcut.test.ts` | `handleSave` が呼ばれないこと                      |
| Shift+S では保存されない                                      | `useSkillEditor.shortcut.test.ts` | `handleSave` が呼ばれないこと                      |
| 保存成功後に isSaving が false に戻る                         | `useSkillEditor.shortcut.test.ts` | `isSaving` 状態のリセット確認                      |
| コンポーネントアンマウント時にリスナーが解除される（P5 対策） | `useSkillEditor.shortcut.test.ts` | `removeEventListener` の呼び出し確認（unmount 後） |

### Task 5: UT-UI-05A-004 境界値・異常系テスト追加

**目的**: Toast の連続表示・エラーケースをカバーする。

| テストケース                                                  | 対象ファイル       | 検証内容                                                    |
| ------------------------------------------------------------- | ------------------ | ----------------------------------------------------------- |
| 保存失敗時にエラー Toast が「保存に失敗しました」と表示される | `useToast.test.ts` | エラーメッセージの内容                                      |
| 成功 Toast 表示中に再度成功したとき、Timer がリセットされる   | `useToast.test.ts` | `vi.advanceTimersByTime(1000)` + 再呼び出し後 2500ms で消去 |
| 複数の Toast を同時に表示できる                               | `useToast.test.ts` | toasts 配列のサイズ                                         |
| Toast の × ボタンクリック後に Toast が消える                  | `Toast.test.tsx`   | Toast 要素の非存在                                          |
| エラー Toast は 10000ms 後も表示されたまま                    | `useToast.test.ts` | `vi.advanceTimersByTime(10000)` 後の isVisible=true         |

### Task 6: UT-UI-05A-005 境界値・異常系テスト追加

**目的**: 読み取り専用モードの切り替えと状態遷移をカバーする。

| テストケース                                                      | 対象ファイル                        | 検証内容                                                |
| ----------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------- |
| `isReadOnly` が false → true に変わったとき即座にバナーが出現する | `SkillEditorView.readonly.test.tsx` | Props 変化後のバナー表示確認                            |
| `isReadOnly=true` のとき Cmd/Ctrl+S を押しても保存されない        | `SkillEditorView.readonly.test.tsx` | 保存 IPC が呼ばれないこと                               |
| `isReadOnly=true` のときエディターがテキスト入力を拒否する        | `SkillEditorView.readonly.test.tsx` | `readOnly` 属性または `aria-readonly="true"` の存在確認 |

### Task 7: UT-UI-05A-006 境界値・異常系テスト追加

**目的**: ナビゲーション遷移のエッジケースをカバーする。

| テストケース                                                             | 対象ファイル                          | 検証内容                         |
| ------------------------------------------------------------------------ | ------------------------------------- | -------------------------------- |
| 未保存変更なしで閉じるボタンを押したときダイアログが表示されない         | `SkillEditorView.navigation.test.tsx` | ダイアログの非存在確認           |
| `currentSkillName` が null のとき SkillEditorView がエラーなく表示される | `SkillEditorView.navigation.test.tsx` | コンポーネントのレンダリング確認 |
| `ViewType` が `'skill-editor'` 以外のとき SkillEditorView が非表示       | `SkillEditorView.navigation.test.tsx` | 非表示または非レンダリング確認   |

### Task 8: UT-UI-05A-007 アニメーション強化テスト追加

**目的**: アニメーション動作と prefers-reduced-motion の詳細動作をカバーする。

| テストケース                                                                | 対象ファイル                         | 検証内容                                                       |
| --------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------- |
| `prefers-reduced-motion: reduce` のとき FileTreeNode のトランジションが無効 | `SkillEditorView.animation.test.tsx` | `motion-reduce:transition-none` クラスまたはトランジションなし |
| `prefers-reduced-motion: reduce` のとき MobileDrawer のトランジションが無効 | `SkillEditorView.animation.test.tsx` | `motion-reduce:transition-none` クラスの存在                   |
| `prefers-reduced-motion: reduce` のとき Toast のアニメーションが無効        | `SkillEditorView.animation.test.tsx` | `motion-reduce:transition-none` クラスの存在                   |
| CSS 変数 `--animation-duration-fast` が 150ms に設定されている              | `SkillEditorView.animation.test.tsx` | CSS カスタムプロパティの値確認（P47 対策）                     |

### Task 9: 追加テストの品質確認

**目的**: 追加テスト全体の品質を確認する。

**確認項目**:

1. 全追加テストが Green であることを確認する
2. `userEvent` が追加テストで使用されていないことを確認する（P39 対策）
3. `runAllTimers` が追加テストで使用されていないことを確認する（P13 対策）
4. テスト間の状態共有がないことを確認する（`beforeEach` でリセット、P9 対策）
5. `vi.useFakeTimers()` が使用されているテストで `vi.useRealTimers()` を呼び出していることを確認する

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillEditorView/
```

## 参照資料

| 資料                  | パス / 参照先                                                                     |
| --------------------- | --------------------------------------------------------------------------------- |
| Phase 4 テスト仕様書  | `phase-4-test-creation.md`                                                        |
| Phase 5 実装サマリー  | `phase-5-implementation.md`                                                       |
| コード品質ルール      | `.claude/rules/02-code-quality.md`                                                |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`（P5, P9, P13, P31, P39, P40, P41, P47）      |
| アクセシビリティ基準  | `.claude/rules/01-architecture.md#アクセシビリティ`                               |
| aiworkflow テスト規約 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |
| aiworkflow a11y 規約  | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      |

## 実行手順

### Step 1: カバレッジ測定

1. `cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/SkillEditorView/` を実行する
2. 測定結果を `outputs/phase-6/test-expansion-report.md` に記録する
3. 不足箇所（Line/Branch/Function の未カバー行）を特定する

### Step 2: 境界値テスト追加（Task 2-7）

1. Task 2〜7 の全テストケースを既存テストファイルに追加する
2. 追加テストが Green であることを確認する

### Step 3: アニメーション強化テスト追加（Task 8）

1. Task 8 の `prefers-reduced-motion` テストを追加する
2. CSS カスタムプロパティの値テストを追加する（P47 対策）
3. 追加テストが Green であることを確認する

### Step 4: 品質確認

1. Task 9 の全確認項目をチェックする
2. `outputs/phase-6/test-expansion-report.md` を更新する

## 統合テスト連携【必須】

| 連携観点           | 反映内容                                                 | 次 Phase への受け渡し      |
| ------------------ | -------------------------------------------------------- | -------------------------- |
| Phase 5 実装差分   | 未カバー分岐の補完テストを追加する                       | Phase 7 カバレッジ測定対象 |
| IPC 契約           | 保存成功/失敗の異常系を追加する                          | Phase 10 最終レビュー証跡  |
| a11y 契約          | ARIA/キーボード/フォーカストラップの自動テストを追加する | Phase 11 手動テスト観点    |
| アニメーション契約 | `prefers-reduced-motion` 対応の自動テストを追加する      | Phase 11 手動テスト観点    |

## 成果物

| 成果物             | パス                                       |
| ------------------ | ------------------------------------------ |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` |
| 追加テスト         | 既存テストファイルへの追加（9 ファイル）   |

## 完了条件

- [ ] 現状カバレッジが測定・記録されている
- [ ] UT-UI-05A-001 境界値テストが追加されている（8 テスト以上）
- [ ] UT-UI-05A-002 境界値テストが追加されている（5 テスト以上）
- [ ] UT-UI-05A-003 境界値テストが追加されている（4 テスト以上）
- [ ] UT-UI-05A-004 境界値テストが追加されている（5 テスト以上）
- [ ] UT-UI-05A-005 境界値テストが追加されている（3 テスト以上）
- [ ] UT-UI-05A-006 境界値テストが追加されている（3 テスト以上）
- [ ] UT-UI-05A-007 アニメーション強化テストが追加されている（4 テスト以上）
- [ ] 全テストが Green 状態である
- [ ] `userEvent` が全テストで未使用である（P39 対策）
- [ ] `runAllTimers` が全テストで未使用である（P13 対策）
- [ ] テスト間の状態リークがない（P9 対策）
- [ ] `outputs/phase-6/test-expansion-report.md` が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了していること**

## 次 Phase

Phase 7（カバレッジ確認）へ進む。カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成を確認する。未達の場合は本 Phase に戻り追加テストを作成する。
