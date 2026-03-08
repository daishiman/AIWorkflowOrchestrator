# UT-08-001 SettingsView act warning 解消 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | UT-08-001                                  |
| タスク名     | SettingsView 統合テストの act warning 解消 |
| 分類         | 改善                                       |
| 対象機能     | SettingsView 統合テスト                    |
| 優先度       | 低                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | 08-TASK Phase 11/12                        |
| 発見日       | 2026-03-08                                 |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SettingsView 統合テスト（18件）はPASSしているが、ApiKeysSection 非同期更新に起因する `act()` warning が継続出力される。

### 1.2 問題点・課題

warning が残ると、本当に対処すべき warning と混在して検知性が落ちる。

### 1.3 放置した場合の影響

回帰時のノイズ増加により、実障害の兆候を見逃す可能性がある。

## 2. 何を達成するか（What）

### 2.1 目的

SettingsView 統合テスト実行時の `act()` warning をゼロ化する。

### 2.2 最終ゴール

`pnpm vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx` 実行時に `act()` warning が出ない。

### 2.3 スコープ

#### 含むもの

- INT-05/06/07 系の非同期待機見直し
- ハーネスの待機補助追加（必要時）

#### 含まないもの

- SettingsView 本体仕様変更
- 他画面テストの全面改修

### 2.4 成果物

- `SettingsView.integration.test.tsx` の warning 解消差分
- 追加検証ログ

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop` でテスト実行可能

### 3.2 依存タスク

- 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001

### 3.3 必要な知識

- React Testing Library の `act` / `waitFor`
- happy-dom 環境の非同期挙動

### 3.4 推奨アプローチ

warning 発生ケースを最小再現し、`waitFor` と `act` 境界を揃える。

## 4. 実行手順

### Phase 1: 再現

1. 対象テストを単独実行して warning ログを記録
2. warning 発生ケースを特定

### Phase 2: 修正

1. 非同期更新完了の待機を追加
2. 過剰待機を避けるため最小変更に限定

### Phase 3: 検証

1. 対象テスト再実行
2. warning 0件と18件PASSを確認

## 5. 完了条件チェックリスト

- [ ] `act()` warning が 0 件
- [ ] SettingsView 統合テスト 18/18 PASS
- [ ] 変更理由を phase-12 changelog へ追記

## 6. 検証方法

- `cd apps/desktop && pnpm vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx`
- stderr に `not wrapped in act(...)` が出ないことを確認

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                             |
| ------------------------ | ------ | -------- | -------------------------------- |
| 待機追加でテスト時間増加 | 低     | 中       | 対象ケース限定で待機を追加       |
| 非同期条件の過剰固定     | 中     | 低       | UI要件ではなくイベント完了で待機 |

## 8. 参照情報

- `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`

## 9. 備考

- 本タスクは品質ノイズ削減が目的。機能仕様変更は含まない。
