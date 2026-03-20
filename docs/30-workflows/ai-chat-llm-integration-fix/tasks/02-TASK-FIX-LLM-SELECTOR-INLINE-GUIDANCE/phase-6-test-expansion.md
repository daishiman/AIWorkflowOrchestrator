# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| Phase番号  | 6                                           |
| 機能名     | LLMモデル選択インラインガイダンス追加       |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE       |
| 作成日     | 2026-03-20                                  |
| ステータス | 作成済み                                    |
| 依存       | [Phase 5 実装](./phase-5-implementation.md) |

## 目的

Phase 5 実装後のカバレッジを計測し、不足している境界値・異常系・エッジケースのテストを追加する。カバレッジ基準（Line 80%以上、Branch 60%以上、Function 80%以上）を満たすことを目標とする。

## 実行タスク

### Task 1: 現状カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/views/ChatView/__tests__/LLMGuidanceBanner.test.tsx \
  src/renderer/views/ChatView/__tests__/ChatView.guidance.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx \
  --coverage
```

### Task 2: 追加テストケースの設計

Phase 4 で設定した TC-1〜TC-5 に加え、以下のエッジケースを追加する:

#### TC-6: LLMGuidanceBanner の境界値テスト

| テストID | テスト名                                              | 前提条件                  | 期待結果                |
| -------- | ----------------------------------------------------- | ------------------------- | ----------------------- |
| TC-6-1   | selectedModelId が空文字列の場合バナーが表示される    | selectedModelId=""        | バナーが DOM に存在する |
| TC-6-2   | selectedModelId が undefined の場合バナーが表示される | selectedModelId=undefined | バナーが DOM に存在する |
| TC-6-3   | 両方 undefined の場合バナーが表示される               | 両方 undefined            | バナーが DOM に存在する |

#### TC-7: LLMGuidanceBanner のアクセシビリティ追加テスト

| テストID | テスト名                                     | 前提条件             | 期待結果                             |
| -------- | -------------------------------------------- | -------------------- | ------------------------------------ |
| TC-7-1   | バナーのボタンに aria-label が設定されている | selectedModelId=null | ボタンに `aria-label` 属性が存在する |

#### TC-8: GuidanceBlock の action なし時の後退互換テスト

| テストID | テスト名                                               | 前提条件         | 期待結果                                      |
| -------- | ------------------------------------------------------ | ---------------- | --------------------------------------------- |
| TC-8-1   | action なしで GuidanceBlock が正常にレンダリングされる | action=undefined | GuidanceBlock が DOM に存在する（エラーなし） |

### Task 3: カバレッジ不足箇所の追加テスト実装

Task 1 のカバレッジ計測結果で不足している箇所に対してテストを追加する。

### Task 4: 再計測

追加テスト後にカバレッジを再計測し、基準を満たしていることを確認する。

## 参照資料

| ファイル                           | 用途                           |
| ---------------------------------- | ------------------------------ |
| `.claude/rules/02-code-quality.md` | カバレッジ基準（Line 80%以上） |

## 実行手順

### Step 1: カバレッジ計測（Task 1）

### Step 2: 不足テスト特定と追加（Task 2・Task 3）

カバレッジレポートを確認し、未カバーの分岐に対してテストを追加する。

### Step 3: 再計測（Task 4）

基準未達の場合は Phase 7 ゲートで戻ってくる。

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                 | パス                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------- |
| 拡充後テストファイル群 | `apps/desktop/src/renderer/views/ChatView/__tests__/LLMGuidanceBanner.test.tsx`（更新） |
| カバレッジレポート     | 計測コマンド実行結果（コンソール出力）                                                  |

## 完了条件

- [ ] Phase 5 完了後のカバレッジが計測されている
- [ ] 境界値テスト TC-6 が追加されている
- [ ] アクセシビリティテスト TC-7 が追加されている
- [ ] GuidanceBlock の後退互換テスト TC-8 が追加されている
- [ ] 全テストが PASS している

## 次Phase

[Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
