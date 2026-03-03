# Phase 7: カバレッジ確認（TDD: 基準充足確認）

## メタ情報

| 項目             | 値                                         |
| ---------------- | ------------------------------------------ |
| Phase            | 7                                          |
| タスクID         | UT-UI-05A-IMPLEMENTATION-CLOSURE-001       |
| 機能名           | SkillEditorView 実装残課題収束             |
| 作成日           | 2026-03-03                                 |
| 前Phase          | Phase 6（テスト拡充）完了                  |
| 依存成果物       | `outputs/phase-6/test-expansion-report.md` |
| カバレッジツール | Vitest + v8 カバレッジプロバイダ           |
| 対象課題         | UT-UI-05A-001〜007（7課題）                |

## 目的

Phase 5-6 で実装・拡充した7課題のコードカバレッジを測定し、プロジェクト基準（Line 80%+, Branch 60%+, Function 80%+）を満たしていることを確認する。未達の場合は不足箇所を特定し、Phase 6 へ戻って追加テストを作成する。全基準を達成した段階で Phase 8 リファクタリング用のベースラインを固定する。

---

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 未達時の対応   |
| ----------------- | -------- | -------- | -------------- |
| Line Coverage     | 80%      | 90%      | Phase 6 へ戻る |
| Branch Coverage   | 60%      | 70%      | Phase 6 へ戻る |
| Function Coverage | 80%      | 90%      | Phase 6 へ戻る |

---

## 実行タスク

- 測定実行: 7課題別および統合のカバレッジ測定を実行する
- 基準判定: Line/Branch/Function の閾値達成可否を判定する
- 未達分析: 未カバー行・分岐・関数を課題ごとに特定する
- 追加改善: 未達時は Phase 6 に戻るための不足テストリストを作成する
- 再測定: 追加テスト後の再測定で基準達成を確認する
- 記録固定: Phase 8 リファクタリング前のベースライン値をレポートに固定する

### Task 1: カバレッジ測定コマンド実行

**目的**: SkillEditorView の全7課題対象ファイルのカバレッジを測定する。

**注意事項（P40対策）**: テスト実行は必ず `cd apps/desktop` から行う。プロジェクトルートから実行すると `apps/desktop/vitest.config.ts` の happy-dom 設定が読み込まれず `document is not defined` エラーが発生する。

#### 1-1. SkillEditorView 全体カバレッジ測定

```bash
# SkillEditorView 全体（7課題全て）
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/SkillEditorView/
```

#### 1-2. 課題別カバレッジ測定（未達箇所の特定用）

```bash
# UT-UI-05A-001: FileTree キーボードナビゲーション
cd apps/desktop && pnpm vitest run --coverage -- \
  src/renderer/views/SkillEditorView/__tests__/FileTreePanel.keyboard.test.tsx

# UT-UI-05A-002: モバイルドロワー
cd apps/desktop && pnpm vitest run --coverage -- \
  src/renderer/views/SkillEditorView/__tests__/MobileDrawer.test.tsx

# UT-UI-05A-003: Cmd/Ctrl+S 保存ショートカット
cd apps/desktop && pnpm vitest run --coverage -- \
  src/renderer/views/SkillEditorView/__tests__/SaveShortcut.test.tsx

# UT-UI-05A-004: 保存成功 Toast
cd apps/desktop && pnpm vitest run --coverage -- \
  src/renderer/views/SkillEditorView/__tests__/Toast.test.tsx \
  src/renderer/views/SkillEditorView/__tests__/useToast.test.tsx

# UT-UI-05A-005: 読み取り専用表示強化
cd apps/desktop && pnpm vitest run --coverage -- \
  src/renderer/views/SkillEditorView/__tests__/ReadOnlyBanner.test.tsx

# UT-UI-05A-006: ナビゲーション導線配線
cd apps/desktop && pnpm vitest run --coverage -- \
  src/renderer/views/SkillEditorView/__tests__/NavigationWiring.test.tsx

# UT-UI-05A-007: マイクロアニメーション
cd apps/desktop && pnpm vitest run --coverage -- \
  src/renderer/views/SkillEditorView/__tests__/MicroAnimations.test.tsx
```

#### 1-3. 統合カバレッジ確認（最終確認用）

```bash
# Phase 5 で追加した全ファイルを含む統合測定
cd apps/desktop && pnpm vitest run --coverage \
  --reporter=verbose \
  -- src/renderer/views/SkillEditorView/
```

### Task 2: カバレッジレポート分析

**目的**: 測定結果を分析し、各課題の基準充足状況を判定する。

**P41 対策**: v8 カバレッジプロバイダはインライン arrow function（`onClick={() => ...}` 等）を独立した関数としてカウントする。Function Coverage が低い場合はインライン関数の実行テストを優先的に追加する。

**記録テンプレート**:

#### UT-UI-05A-001: FileTree キーボードナビゲーション

| ファイル                 | Line   | Branch | Function | 判定  |
| ------------------------ | ------ | ------ | -------- | ----- |
| FileTreePanel.tsx        | —%     | —%     | —%       | —     |
| FileTreeNode.tsx         | —%     | —%     | —%       | —     |
| useKeyboardNavigation.ts | —%     | —%     | —%       | —     |
| **合計**                 | **—%** | **—%** | **—%**   | **—** |

#### UT-UI-05A-002: モバイルドロワー

| ファイル                  | Line   | Branch | Function | 判定  |
| ------------------------- | ------ | ------ | -------- | ----- |
| MobileDrawer.tsx          | —%     | —%     | —%       | —     |
| SkillEditorView/index.tsx | —%     | —%     | —%       | —     |
| **合計**                  | **—%** | **—%** | **—%**   | **—** |

#### UT-UI-05A-003: Cmd/Ctrl+S 保存ショートカット

| ファイル                  | Line   | Branch | Function | 判定  |
| ------------------------- | ------ | ------ | -------- | ----- |
| isPlatformSaveKey.ts      | —%     | —%     | —%       | —     |
| SkillEditorView/index.tsx | —%     | —%     | —%       | —     |
| **合計**                  | **—%** | **—%** | **—%**   | **—** |

#### UT-UI-05A-004: 保存成功 Toast

| ファイル           | Line   | Branch | Function | 判定  |
| ------------------ | ------ | ------ | -------- | ----- |
| Toast.tsx          | —%     | —%     | —%       | —     |
| ToastContainer.tsx | —%     | —%     | —%       | —     |
| useToast.ts        | —%     | —%     | —%       | —     |
| **合計**           | **—%** | **—%** | **—%**   | **—** |

#### UT-UI-05A-005: 読み取り専用表示強化

| ファイル           | Line   | Branch | Function | 判定  |
| ------------------ | ------ | ------ | -------- | ----- |
| ReadOnlyBanner.tsx | —%     | —%     | —%       | —     |
| EditorToolBar.tsx  | —%     | —%     | —%       | —     |
| **合計**           | **—%** | **—%** | **—%**   | **—** |

#### UT-UI-05A-006: ナビゲーション導線配線

| ファイル                  | Line   | Branch | Function | 判定  |
| ------------------------- | ------ | ------ | -------- | ----- |
| SkillEditorView/index.tsx | —%     | —%     | —%       | —     |
| useSkillEditorStore.ts    | —%     | —%     | —%       | —     |
| **合計**                  | **—%** | **—%** | **—%**   | **—** |

#### UT-UI-05A-007: マイクロアニメーション

| ファイル                    | Line   | Branch | Function | 判定  |
| --------------------------- | ------ | ------ | -------- | ----- |
| useReducedMotion.ts         | —%     | —%     | —%       | —     |
| FileTreeNode.tsx（CSS変数） | —%     | —%     | —%       | —     |
| MobileDrawer.tsx（アニメ）  | —%     | —%     | —%       | —     |
| **合計**                    | **—%** | **—%** | **—%**   | **—** |

#### SkillEditorView 全体サマリー

| 課題ID        | 課題名                  | Line   | Branch | Function | 全指標基準達成 |
| ------------- | ----------------------- | ------ | ------ | -------- | -------------- |
| UT-UI-05A-001 | FileTree キーボードナビ | —%     | —%     | —%       | —              |
| UT-UI-05A-002 | モバイルドロワー        | —%     | —%     | —%       | —              |
| UT-UI-05A-003 | Cmd/Ctrl+S 保存         | —%     | —%     | —%       | —              |
| UT-UI-05A-004 | 保存成功 Toast          | —%     | —%     | —%       | —              |
| UT-UI-05A-005 | 読み取り専用表示強化    | —%     | —%     | —%       | —              |
| UT-UI-05A-006 | ナビゲーション導線      | —%     | —%     | —%       | —              |
| UT-UI-05A-007 | マイクロアニメーション  | —%     | —%     | —%       | —              |
| **全体平均**  |                         | **—%** | **—%** | **—%**   | **—**          |

### Task 3: 未達箇所の特定と追加テスト作成

**目的**: カバレッジ未達の課題に対して不足箇所を特定し、テストを追加する。

**判定フロー**:

```
全7課題の全指標（Line/Branch/Function）が最低基準以上か？
  ├── YES → Task 4（最終確認・レポート作成）へ
  └── NO  → 未達課題・ファイルを特定
              ├── 未カバー行・分岐・関数のリスト作成
              ├── テスト追加（Phase 6 と同じルール: happy-dom環境でfireEvent使用）
              ├── 追加テストの Green 確認
              └── Task 1 へ戻りカバレッジ再測定
```

**未達時の対応手順**:

1. カバレッジレポートの未カバー行（`| uncovered |`表示）を特定する
2. 未カバー行が属する分岐・関数を分析し、対応するテストケースを設計する
3. 対象テストファイル（Phase 6 で拡充済み）にテストを追加する
4. 追加テストが Green であることを確認する（`pnpm vitest run -- <test-file>`）
5. カバレッジを再測定し、基準達成を確認する

**課題別未達時の追加観点**:

| 課題ID        | 未達になりやすい箇所                                             | 追加テスト例                                   |
| ------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| UT-UI-05A-001 | useKeyboardNavigation の複合キー分岐、expandedNodes 境界値       | PageUp/PageDown/Home/End コーナーケース        |
| UT-UI-05A-002 | MobileDrawer 内のフォーカストラップ完全循環、Escape キー閉じ     | Tab/Shift+Tab ループ確認、Escape 閉じ確認      |
| UT-UI-05A-003 | isPlatformSaveKey の metaKey/ctrlKey 排他分岐（両方 true 等）    | e.metaKey=true && e.ctrlKey=true ケース        |
| UT-UI-05A-004 | useToast の TOAST_DURATION_MS タイムアウト後の自動消去分岐       | vi.advanceTimersByTime(TOAST_DURATION_MS) 検証 |
| UT-UI-05A-005 | ReadOnlyBanner の readOnlyReason プロップが空文字列の場合の分岐  | readOnlyReason="" / undefined 境界値           |
| UT-UI-05A-006 | ナビゲーション失敗時のエラーハンドリング分岐                     | navigate 失敗時の状態確認                      |
| UT-UI-05A-007 | useReducedMotion のメディアクエリ変化イベント（change リスナー） | matchMedia の change イベント発火確認          |

**P41 対策（インライン関数 Function Coverage 低下）**:

```typescript
// ❌ インライン arrow function はカバレッジが取れにくい
<button onClick={() => handleClose()}>

// ✅ 関数を変数に切り出してカバレッジ計測しやすくする
const handleCloseClick = useCallback(() => handleClose(), [handleClose]);
<button onClick={handleCloseClick}>

// テスト側: インライン関数もクリックイベントで実行確認
fireEvent.click(getByRole('button', { name: '閉じる' }));
expect(mockHandleClose).toHaveBeenCalledTimes(1);
```

**最大繰り返し回数**: テスト追加→再測定のサイクルは最大3回。3回後も最低基準未達の場合は、未達箇所と技術的理由を `outputs/phase-7/coverage-report.md` に記録して Phase 8 へ進む（推奨基準未達は許容、最低基準未達は要記録）。

### Task 4: 最終カバレッジ確認・レポート作成

**目的**: 全7課題が全指標で最低基準以上であることを最終確認し、Phase 8 用ベースラインを固定する。

**最終測定コマンド**:

```bash
# 全テスト実行確認（全テスト Green を確認する）
cd apps/desktop && pnpm vitest run -- src/renderer/views/SkillEditorView/

# カバレッジ最終測定
cd apps/desktop && pnpm vitest run --coverage \
  --reporter=verbose \
  -- src/renderer/views/SkillEditorView/
```

**最終判定基準**:

- SkillEditorView/ 全体の Line Coverage が 80% 以上である
- SkillEditorView/ 全体の Branch Coverage が 60% 以上である
- SkillEditorView/ 全体の Function Coverage が 80% 以上である
- 上記 3 条件を全て満たす場合、Phase 8 へ進む

**`outputs/phase-7/coverage-report.md` 記載内容**:

```markdown
# Phase 7 カバレッジレポート

## 測定日: YYYY-MM-DD

## テスト総数: N件（全 Green）

## 最終カバレッジ

| 課題ID        | Line | Branch | Function | 判定 |
| ------------- | ---- | ------ | -------- | ---- |
| UT-UI-05A-001 | N%   | N%     | N%       | PASS |
| ...           | ...  | ...    | ...      | ...  |
| 全体          | N%   | N%     | N%       | PASS |

## 未達箇所（あれば記録）

（技術的理由と代替確認方法を記載）

## Phase 8 へのメモ

（リファクタ時に注意すべき箇所を記載）
```

---

## 参照資料

| 資料                       | パス / 参照先                                                                     |
| -------------------------- | --------------------------------------------------------------------------------- |
| Phase 5 実装サマリー       | `outputs/phase-5/implementation-summary.md`                                       |
| Phase 6 テスト拡充レポート | `outputs/phase-6/test-expansion-report.md`                                        |
| コード品質ルール           | `.claude/rules/02-code-quality.md#カバレッジ基準`                                 |
| 既知の落とし穴 (P40, P41)  | `.claude/rules/06-known-pitfalls.md#P40` `.claude/rules/06-known-pitfalls.md#P41` |
| Vitest カバレッジ設定      | `apps/desktop/vitest.config.ts`                                                   |
| aiworkflow 品質要件        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       |
| aiworkflow テスト規約      | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |

---

## 実行手順

### Step 1: 初回カバレッジ測定

1. Task 1-1 の全体測定コマンドを `cd apps/desktop` から実行する（P40対策）
2. 測定結果を Task 2 のテンプレートに課題別・ファイル別に記録する

### Step 2: 基準判定

1. 全7課題の全指標を最低基準（Line 80%+, Branch 60%+, Function 80%+）と比較する
2. 全指標が基準以上であれば Step 4 へ進む
3. 1 つでも未達があれば Step 3 へ進む

### Step 3: 追加テスト作成（未達時のみ）

1. Task 3 の課題別未達時の追加観点テーブルを参照して、未カバー箇所を特定する
2. 該当テストファイルにテストを追加する（happy-dom環境なので `fireEvent` を使用）
3. `pnpm vitest run -- <test-file>` で追加テストが Green であることを確認する
4. Step 1 に戻りカバレッジを再測定する
5. 最大 3 回の繰り返しで基準未達の場合は理由を記録して Step 4 へ進む

### Step 4: 最終確認・レポート作成

1. Task 4 の最終測定コマンドで全テスト Green + カバレッジを確認する
2. `outputs/phase-7/coverage-report.md` を作成する（Task 4 のテンプレート使用）
3. Phase 8 で安全にリファクタリングできるベースラインが固定された状態を確認する

## 統合テスト連携【必須】

| 連携観点                 | 実施内容                                   | 出力先                                    |
| ------------------------ | ------------------------------------------ | ----------------------------------------- |
| Phase 5 実装             | 実装差分の未カバー分岐を可視化する         | `outputs/phase-7/coverage-report.md`      |
| Phase 6 テスト拡充       | 追加テストの効果を定量確認する             | `outputs/phase-7/coverage-report.md`      |
| Phase 8 リファクタリング | リファクタ前のカバレッジベースラインを固定 | `outputs/phase-8/refactoring-log.md`      |
| Phase 10 最終レビュー    | テスト品質指標として提出する               | `outputs/phase-10/final-review-result.md` |

---

## 成果物

| 成果物             | パス                                 | 説明                                                     |
| ------------------ | ------------------------------------ | -------------------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 課題別・ファイル別カバレッジ数値、未達箇所、Phase 8 メモ |

---

## 完了条件

- [ ] 全7課題のカバレッジが測定されている
- [ ] SkillEditorView/ 全体の Line Coverage が 80% 以上である（推奨: 90%）
- [ ] SkillEditorView/ 全体の Branch Coverage が 60% 以上である（推奨: 70%）
- [ ] SkillEditorView/ 全体の Function Coverage が 80% 以上である（推奨: 90%）
- [ ] カバレッジレポート `outputs/phase-7/coverage-report.md` が作成されている
- [ ] レポートに課題別・ファイル別のカバレッジ数値が記載されている
- [ ] 未達箇所がある場合は理由と対応方針が記載されている
- [ ] 全テストが Green 状態である
- [ ] テスト実行は `cd apps/desktop` から行っている（P40 対策）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 8: リファクタリング。全テスト Green・カバレッジ基準達成の状態で、コード品質を改善する。
