# Phase 7: カバレッジ目標

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 7                                                        |
| 作成日   | 2026-03-08                                               |

---

## 統合テスト対象ファイルと目標カバレッジ

### カバレッジ数値目標

| ファイル                     | Line 最低 | Line 推奨 | Branch 最低 | Branch 推奨 | 備考                                                                                      |
| ---------------------------- | --------- | --------- | ----------- | ----------- | ----------------------------------------------------------------------------------------- |
| `SettingsView/index.tsx`     | 80%       | 90%       | 60%         | 70%         | 統合テストの主対象                                                                        |
| `AuthModeSelector/index.tsx` | 80%       | 90%       | 60%         | 70%         | 統合テスト経由でカバー。INT-02 で mode 切替パスを通過                                     |
| `ApiKeysSection/index.tsx`   | 50%       | 60%       | 40%         | 50%         | 巨大コンポーネントのため統合テストでは部分的。モーダル操作は component test（46件）で補完 |

### 基準の根拠

- Line/Function 80% 以上は `.claude/rules/02-code-quality.md` のカバレッジ基準に準拠
- Branch 60% 以上は同基準に準拠
- ApiKeysSection は巨大コンポーネント（モーダル操作・バリデーション・保存/削除フロー含む）のため、統合テスト単体では50%を目標とし、component test（46件）との合算で基準を満たす想定
- AccountSection は OAuth フローが統合テスト対象外のため、カバレッジ目標を個別に設定しない（既存 unit test に委譲）

---

## 統合テスト9ケースの GREEN 確認

| テストケース ID | シナリオ名                                 | 状態  |
| --------------- | ------------------------------------------ | ----- |
| INT-01          | 全セクション表示（real composition）       | GREEN |
| INT-02          | AuthModeSelector mode 切替（role="radio"） | GREEN |
| INT-03          | ApiKeysSection 正常プロバイダー表示        | GREEN |
| INT-04a         | ApiKeysSection 非配列フォールバック        | GREEN |
| INT-04b         | ApiKeysSection undefined フォールバック    | GREEN |
| INT-04c         | ApiKeysSection list 失敗エラー表示         | GREEN |
| INT-05a         | status null 時の非表示                     | GREEN |
| INT-05b         | status 設定時のメッセージ表示              | GREEN |
| INT-05c         | status.isValid 成功スタイル                | GREEN |

**結果**: 9/9 全テストケース GREEN

---

## カバレッジ計測コマンド

```bash
cd apps/desktop
pnpm vitest run src/renderer/views/SettingsView/ --coverage --coverage.provider=v8
```

---

## Phase 7 ゲート判定

| 条件                                             | 判定 | 未達時の対応                     |
| ------------------------------------------------ | ---- | -------------------------------- |
| SettingsView/index.tsx の Line coverage >= 80%   | 必須 | Phase 6 へ戻りテストケース追加   |
| SettingsView/index.tsx の Branch coverage >= 60% | 必須 | Phase 6 へ戻り条件分岐テスト追加 |
| 統合テスト9ケース全 PASS                         | 必須 | 失敗テストの修正                 |
| AC-01 〜 AC-06 の全てに対応テストケースが存在    | 必須 | 対応テスト未実装の AC を特定     |
