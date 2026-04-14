# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 3                                       |
| 機能名 | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| 作成日 | 2026-04-13                              |

## 目的

Phase 2 で確定した設計（`onValidationChange` Optional プロップ追加・`monthlyError` フラグ・
`useEffect` 通知パターン・`DayOfMonthSelector` 責務分担）が、
仕様・テスト・型安全性の三層で一貫しているかをレビューし、
PASS / MINOR / MAJOR を判定して Phase 4 への進行可否を決定する。

---

## 実行タスク

- **タスク1**: `onValidationChange` Optional プロップの後方互換性を確認する
- **タスク2**: `useEffect` による `onValidationChange` 呼び出しタイミング（レンダリング後）の適切性を確認する
- **タスク3**: `DayOfMonthSelector` が範囲外入力をUI側で拒否する場合の `monthlyError` 発生パターンを確認する
- **タスク4**: simpler alternative を検討し、不採用理由を記録する
- **タスク5**: PASS/MINOR/MAJOR 判定と Phase 4 開始条件を確定する

---

## 参照資料

| 資料名                     | パス                                                                   | 説明                 |
| -------------------------- | ---------------------------------------------------------------------- | -------------------- |
| Phase 2 設計決定記録       | `outputs/phase-2/design-decision.md`                                   | レビュー対象設計     |
| Phase 2 コード差分イメージ | `outputs/phase-2/code-diff-preview.md`                                 | 変更前/後の差分確認  |
| Phase 1 受入基準           | `outputs/phase-1/acceptance-criteria.md`                               | AC-1〜AC-10 との照合 |
| VisualCronPicker 実装      | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`   | 現状コード確認       |
| DayOfMonthSelector 実装    | `apps/desktop/src/renderer/components/schedule/DayOfMonthSelector.tsx` | UI側拒否パターン確認 |

---

## レビュー観点

### ステップ1: 後方互換性チェック

```bash
# onValidationChange の使用状況を確認（既存の呼び出し元への影響）
grep -rn "VisualCronPicker" \
  apps/desktop/src/renderer/

# VisualCronPickerProps インターフェースの現状確認
grep -n "onValidationChange\|VisualCronPickerProps" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx
```

**チェック項目**:

- [x] `onValidationChange` が Optional（`?`）として定義されていること（設計上）
- [x] 既存の `<VisualCronPicker value={...} onChange={...} />` の呼び出しが変更不要であること
- [x] `onValidationChange` を渡さない呼び出し元が AC-8（undefined 安全）を満たすこと

### ステップ2: `useEffect` 通知タイミングチェック

```bash
# useEffect の依存配列パターンを確認（既存コンポーネントの慣例）
grep -n "useEffect" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx
```

**チェック項目**:

- [x] `useEffect` の依存配列が `[isFormValid, onValidationChange]` として設計されていること
- [x] `isFormValid` が変化した場合のみ `onValidationChange` が呼ばれること（無限ループなし）
- [x] 初回レンダリング時にも `onValidationChange` が呼ばれること（初期バリデーション状態の通知）
- [x] `onValidationChange` の参照が変化した場合の再呼び出しリスクを確認すること（呼び出し元で `useCallback` 推奨の明記）

**useEffect タイミングに関する MINOR 候補**:

| 懸念事項                                        | 影響度 | 判定候補 |
| ----------------------------------------------- | ------ | -------- |
| 初回レンダリング時の通知が1サイクル遅延する     | 軽微   | MINOR    |
| `onValidationChange` 参照変化による過剰呼び出し | 軽微   | MINOR    |
| `useCallback` 推奨の JSDoc 記載漏れ             | 軽微   | MINOR    |

### ステップ3: `DayOfMonthSelector` の UI 側拒否と value 由来 `monthlyError` の関係チェック

```bash
# DayOfMonthSelector の入力制限実装を確認
grep -n "min\|max\|clamp\|Math\|range\|invalid" \
  apps/desktop/src/renderer/components/schedule/DayOfMonthSelector.tsx
```

**確認シナリオ**:

| シナリオ                                             | 期待される挙動                                                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------ |
| DayOfMonthSelector が `min=1 max=31` を設定している  | UI 上は範囲外入力が防がれるが、`value` から復元された `dayOfMonth` が範囲外なら `monthlyError = true` |
| DayOfMonthSelector が範囲制限なし                    | `value` 由来の `dayOfMonth < 1                                                                        |     | dayOfMonth > 31`で`monthlyError = true` が必ず発生する |
| `value` から復元された monthly config が範囲外の場合 | `monthlyError` のガードが VisualCronPicker で独立して動作すること                                     |

**チェック項目**:

- [x] `DayOfMonthSelector` が UI 側で範囲制限を持つ場合でも、`VisualCronPicker` の `monthlyError` 判定が独立して機能すること
- [x] `DayOfMonthSelector` の範囲制限有無に関わらず、AC-4/AC-5（エラーメッセージ表示）が満たされること
- [x] VisualCronPicker が DayOfMonthSelector の実装詳細（min/max 属性）に依存しないこと

### ステップ4: simpler alternative の検討

より単純な代替案を検討し、採用しない理由を記録する:

| 代替案                                                                 | 検討結果                                                                                                                |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| イベントハンドラ内で直接 `onValidationChange` を呼ぶ                   | 否定: 状態更新とコールバック呼び出しが分散し、`isFormValid` の状態と通知が不一致になるリスクがある                      |
| `DayOfMonthSelector` 内で `onValidationChange` を直接呼ぶ              | 否定: バリデーション状態の所有権が分散し、`isFormValid` の集約が `VisualCronPicker` でできなくなる                      |
| `isFormValid` を `useState` ではなく変数として計算する                 | 検討余地あり: `useEffect` のために `isFormValid` の前回値との比較が必要。`usePrevious` の追加が必要になるため採用しない |
| `onValidationChange` を必須プロップにする                              | 否定: 後方互換性が失われ、既存の呼び出し元を全て修正する必要が生じる                                                    |
| `monthlyError` を `DayOfMonthSelector` の `onError` プロップで受け取る | 否定: `DayOfMonthSelector` の API 変更が必要。スコープ外のコンポーネント修正が発生する                                  |

---

## PASS/MINOR/MAJOR 判定基準

| 判定  | 条件                                                                                         |
| ----- | -------------------------------------------------------------------------------------------- |
| PASS  | 全チェック項目が通過。Phase 4 へ進める                                                       |
| MINOR | 軽微な指摘あり（JSDoc 推奨事項・useEffect タイミング補足等）。Phase 5 で解決。Phase 4 継続可 |
| MAJOR | 設計の根本的問題（後方互換性破壊・状態所有権の矛盾・既存テスト破壊等）。Phase 2 へ戻る       |

### チェックリスト（判定用）

**後方互換性**:

- [x] `onValidationChange` が Optional プロップとして設計されていること
- [x] 既存の呼び出し元が変更不要であることが確認されていること
- [x] `onValidationChange?.(isFormValid)` の Optional チェーンが設計に含まれていること（AC-8）

**useEffect 通知タイミング**:

- [x] 依存配列 `[isFormValid, onValidationChange]` が設計に明示されていること
- [x] 無限ループが発生しないことが確認されていること
- [x] 初回レンダリング時の通知動作が設計に記載されていること

**monthlyError と DayOfMonthSelector の責務分担**:

- [x] `monthlyError` の判定が `VisualCronPicker` 内に集約されていること
- [x] `DayOfMonthSelector` の実装詳細に依存しない設計であること
- [x] UI 側拒否パターンの有無に関わらず AC-4/AC-5 が満たされること

**スコープ**:

- [x] `DayOfMonthSelector.tsx` の変更が不要であることが確認されていること
- [x] IPC 関連の変更が不要であることが確認されていること
- [x] 変更対象が `VisualCronPicker.tsx` と `VisualCronPicker.validation.test.tsx` の2ファイルのみであること

---

## MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘を追跡する（指摘がある場合のみ記入）:

| MINOR ID  | 指摘内容                                                        | 解決予定 Phase | 解決確認 Phase | 備考               |
| --------- | --------------------------------------------------------------- | -------------- | -------------- | ------------------ |
| TECH-M-01 | useEffect タイミングの補足説明（JSDoc への `useCallback` 推奨） | Phase 5        | Phase 9/10     | 機能に影響しない   |
| TECH-M-02 | DayOfMonthSelector の UI 拒否パターン有無をテストコメントに記載 | Phase 4        | Phase 9/10     | テストの可読性向上 |
| TECH-M-03 | （指摘がある場合に記入）                                        | -              | -              | -                  |

---

## 統合テスト連携

- `VisualCronPicker` は UI コンポーネントのため、IPC 統合テスト不要
- 設計レビューの結果（PASS/MINOR/MAJOR）を `outputs/phase-3/design-review-result.md` に記録
- Phase 4 テスト作成へのゲート判定を明示（PASS または MINOR のみで Phase 4 継続可）

---

## 多角的チェック観点（AIが判断）

### React コンポーネント設計原則

- `useEffect` でのコールバック通知は React の推奨パターン（`useImperativeHandle` を使わない選択として妥当）
- `onValidationChange` の参照安定性（`useCallback`）は呼び出し元の責務だが、JSDoc での推奨明記が品質向上に寄与する

### 型安全性

- `onValidationChange?: (isValid: boolean) => void` は TypeScript の Optional プロップとして型安全
- `isFormValid` は `boolean` 型で確定。`weeklyError` と `monthlyError` が `boolean` であれば型推論が成立する

### テスト観点

- AC-8（`onValidationChange` が `undefined` の場合）のテストは、プロップを渡さずレンダリングするだけで検証できる
- `useEffect` のタイミングは `@testing-library/react` の `act()` で自動処理されるため、テスト実装上の問題はない

---

## サブタスク管理

| ID     | タスク名                                                    | ステータス |
| ------ | ----------------------------------------------------------- | ---------- |
| T-03-1 | onValidationChange 後方互換性チェック                       | 完了       |
| T-03-2 | useEffect 通知タイミングチェック                            | 完了       |
| T-03-3 | DayOfMonthSelector UI拒否パターンと monthlyError の関係確認 | 完了       |
| T-03-4 | simpler alternative の検討と記録                            | 完了       |
| T-03-5 | PASS/MINOR/MAJOR 判定と Phase 4 開始条件確定                | 完了       |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | Markdown |

---

## 完了条件

- [x] `onValidationChange` Optional プロップの後方互換性が確認済みであること
- [x] `useEffect` 通知タイミングの適切性が確認済みであること（依存配列・無限ループ・初回通知）
- [x] `DayOfMonthSelector` の UI 拒否パターンと `monthlyError` の発生条件が整合していること
- [x] simpler alternative の検討が記録されていること
- [x] レビュー判定（PASS/MINOR/MAJOR）が確定していること
- [x] Phase 4 開始条件が明示されていること
- [x] `outputs/phase-3/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [x] T-03-1: 後方互換性チェックを実行し `outputs/phase-3/design-review-result.md` に記録済み
- [x] T-03-2: useEffect 通知タイミングチェック結果を記録済み
- [x] T-03-3: DayOfMonthSelector UI拒否パターンと monthlyError 関係チェックを記録済み
- [x] T-03-4: simpler alternative の検討を記録済み
- [x] T-03-5: PASS/MINOR/MAJOR 判定を明示的に確定済み（「PASS: Phase 4 へ進む」等）
- [x] MINOR 追跡テーブルを `outputs/phase-3/design-review-result.md` に記録済み（指摘なしの場合は「なし」と記録）

---

## 次Phase

**Phase 4: テスト作成（Red段階）** — TDD に従い、実装前にテストを先行作成する。
`VisualCronPicker.validation.test.tsx` に AC-1〜AC-8 対応のテストケース（TC-01〜TC-08）を作成し、
RED 状態を確認する。

**Phase 4 開始条件**: 本 Phase のレビュー判定が「PASS」または「MINOR のみ」であること。
**Phase 13 blocked 条件**: MAJOR 判定が残存している場合は PR 作成不可。
