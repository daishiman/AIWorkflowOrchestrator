# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 6                        |
| Phase名    | テスト拡充               |
| 対象機能   | TASK-SW-FIX-FEEDBACK-008 |
| 前提Phase  | Phase 5: 実装            |
| 次Phase    | Phase 7: カバレッジ確認  |
| ステータス | completed                |
| 作成日     | 2026-04-15               |

## 目的

回帰ガードと失敗パスのテストを追加し、`fetchSkills()` 非ブロッキング化の品質を強化する。

Phase 5 の実装で TC-F8-01〜TC-F8-05 が PASS に反転したことを前提として、
エッジケースおよびエラーメッセージ検証のテストを追加することで、
将来の回帰に対する保護層を厚くする。

## 実行タスク

### Task 1: fetchSkills 複数回失敗シナリオのテスト追加

- `fetchSkills` が連続して複数回 throw するシナリオのテストケースを追加する
- 複数回失敗時でも `selectSkillByName` が毎回呼ばれることを検証する
- 失敗間でコンポーネントの状態（`generationError` など）が汚染されないことを確認する

### Task 2: console.warn のエラーメッセージ内容確認テスト追加

- `fetchSkills` が特定のエラーメッセージを持つ `Error` を throw した場合に、
  そのメッセージが `console.warn` の引数に含まれることを検証するテストを追加する
- プレフィックス `[SkillLifecyclePanel] fetchSkills failed (non-blocking):` が含まれることを確認する
- `console.warn` の呼び出し回数が期待通りであることをアサートする

### Task 3: selectSkillByName の null/undefined skillName 時の挙動確認

- `executeResult.skillName` が `null` または `undefined` の場合に `selectSkillByName` が呼ばれないことを確認するテストを追加する
- `fetchSkills` が失敗し、かつ `skillName` が `null`/`undefined` の場合でも処理が正常に完了することを確認する
- エッジケースとして `skillName` が空文字 `""` の場合の挙動も定義する

## 追加テストケース一覧

| テストID | シナリオ                          | 入力条件                                                | 期待結果                                                        | 備考                             |
| -------- | --------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------- |
| TC-F8-06 | fetchSkills 複数回失敗            | fetchSkills が2回連続 throw / skillName あり            | selectSkillByName が毎回呼ばれ、state が汚染されない            | 複数フロー呼び出しシナリオ       |
| TC-F8-07 | console.warn メッセージ内容確認   | fetchSkills が特定エラーメッセージで throw              | console.warn の引数にプレフィックスとエラーメッセージが含まれる | エラーログ品質確認               |
| TC-F8-08 | skillName が null の場合          | fetchSkills 失敗 / executeResult.skillName が null      | selectSkillByName が呼ばれない、処理が正常完了                  | null ガード確認                  |
| TC-F8-09 | skillName が undefined の場合     | fetchSkills 失敗 / executeResult.skillName が undefined | selectSkillByName が呼ばれない、処理が正常完了                  | undefined ガード確認             |
| TC-F8-10 | fetchSkills 成功 + skillName なし | fetchSkills 成功 / executeResult.skillName が null      | selectSkillByName が呼ばれない（fetchSkills 成功の回帰）        | 正常系 + null ガードの組み合わせ |

---

## 参照資料

| 資料名                 | パス                                                                                               | 説明                  |
| ---------------------- | -------------------------------------------------------------------------------------------------- | --------------------- |
| 修正済みコンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | L769-784 / L1110-1113 |
| テストファイル         | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | テスト追加対象        |
| Phase 4 テスト仕様書   | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-008/phase-4-test-creation.md`                              | 基本テストケース      |
| Phase 5 実装記録       | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-008/phase-5-implementation.md`                             | 実装パターン参照      |

## 実行手順

```bash
# テスト実行（全テスト）
pnpm --filter @repo/desktop test

# 特定テストファイルのみ実行
pnpm --filter @repo/desktop test SkillLifecyclePanel.llm-generation

# テスト結果の詳細表示
pnpm --filter @repo/desktop test --reporter=verbose
```

## 統合テスト連携

- TC-F8-06〜TC-F8-10 の追加後、全 10 ケース（TC-F8-01〜10）が PASS であることを確認する
- Phase 7 のカバレッジ確認で追加テストが対象パスを網羅していることを確認する

## 多角的チェック観点（AIが判断）

- `console.warn` のモック（`vi.spyOn(console, 'warn')`）が各テスト後にリストアされているか確認する
- 複数回失敗シナリオで `fetchSkills` のモック実装がテスト間でリセットされているか確認する
- `skillName` の型定義（`string | null | undefined`）に対してテストケースが網羅的か確認する

## サブタスク管理

| サブタスクID | 内容                                               | ステータス |
| ------------ | -------------------------------------------------- | ---------- |
| ST-F8-6-01   | TC-F8-06 複数回失敗シナリオのテスト追加            | completed  |
| ST-F8-6-02   | TC-F8-07 console.warn メッセージ内容確認テスト追加 | completed  |
| ST-F8-6-03   | TC-F8-08/09 null/undefined skillName テスト追加    | completed  |
| ST-F8-6-04   | TC-F8-10 成功 + null ガード組み合わせテスト追加    | completed  |
| ST-F8-6-05   | 全 10 ケース PASS 確認                             | completed  |

## 成果物

| 成果物             | パス                                                                                               | 説明                  |
| ------------------ | -------------------------------------------------------------------------------------------------- | --------------------- |
| 拡充テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | TC-F8-06〜10 追加済み |

## 完了条件

- [x] TC-F8-06（fetchSkills複数回失敗シナリオ）が追加・PASSされている
- [x] TC-F8-07（console.warnメッセージ内容確認）が追加・PASSされている
- [x] TC-F8-08/09（null/undefined skillName時の挙動確認）が追加・PASSされている
- [x] TC-F8-10（fetchSkills成功 + null ガード組み合わせ）が追加・PASSされている
- [x] console.warn のモックが各テスト後に適切にリストアされている
- [x] 全10ケース（TC-F8-01〜10）がPASSである
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
