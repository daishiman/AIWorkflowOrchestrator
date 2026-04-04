# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 4                                                |
| 機能名 | skill-creator-layer34-ui-display-severity-filter |
| 作成日 | 2026-04-03                                       |

## 目的

設計に基づき、失敗するテストを先に作成する（TDD Red フェーズ）。

## 実行タスク

### タスク1: テストヘルパーの準備

- 目的: severity フィルタテスト用の `buildVerifyDetailForFilter` と `renderWithFilter` を作成
- 手順:
  1. 既存の `buildVerifyDetail` を参考に、4種の severity (`error` / `warning` / `warning` / `info`) を持つテストデータを定義
  2. `renderWithFilter` ヘルパーを作成（`mockGetVerifyDetail` + `render` + `findByTestId`）
- 期待出力: テストヘルパー関数

### タスク2: コアテストケースの作成

- 目的: SF-01〜SF-08 の 8テストケースを作成
- 手順:
  1. SF-01: デフォルト `all`、`aria-checked=true`
  2. SF-02: `all` で全4件表示
  3. SF-03: `warning+` で `info` 非表示
  4. SF-04: `error` で `warning` / `info` 非表示
  5. SF-05: 空 layer 非表示
  6. SF-06: 件数バッジ表示
  7. SF-07: reverify 後フィルタ維持
  8. SF-08: フィルタ切替後 accordion 操作
- 期待出力: 8テストケース（この時点では FAIL）

## 参照資料

| 資料名     | パス                                                                                | 説明             |
| ---------- | ----------------------------------------------------------------------------------- | ---------------- |
| 既存テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | 既存パターン参照 |
| 設計書     | `phase-2-design.md`                                                                 | 型・関数・UI設計 |

## 成果物

| 成果物       | パス                                                                                | 説明         |
| ------------ | ----------------------------------------------------------------------------------- | ------------ |
| テストコード | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | SF-01〜SF-08 |

## TDD検証

| 項目           | 期待                                      |
| -------------- | ----------------------------------------- |
| テスト実行結果 | RED（全テスト FAIL）                      |
| 失敗理由       | `severity-filter` 要素が DOM に存在しない |

## 完了条件

- [ ] SF-01〜SF-08 のテストが作成されている
- [ ] テスト実行で全て FAIL することを確認
- [ ] テストが設計書の仕様を正確に反映している
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 5: 実装
