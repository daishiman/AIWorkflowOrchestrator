# Phase 11 手動テスト結果

## preflight

| 項目                                                                | 実測                                                                                                                       |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| build                                                               | `pnpm --dir apps/desktop exec vite build --config vite.e2e.config.ts` PASS                                                 |
| preview                                                             | `pnpm --dir apps/desktop exec vite preview --config vite.e2e.config.ts --host 127.0.0.1 --port 4173 --strictPort` 起動成功 |
| port 4173                                                           | `node 55618 ... TCP 127.0.0.1:4173 (LISTEN)`                                                                               |
| `curl -I http://127.0.0.1:4173/advanced/skill-center?skipAuth=true` | `HTTP/1.1 200 OK`                                                                                                          |
| port 5174                                                           | listener なし                                                                                                              |

## 証跡対応表

| テストケース | 証跡                                                                                   | 結果 | 備考                               |
| ------------ | -------------------------------------------------------------------------------------- | ---- | ---------------------------------- |
| TC-11-01     | `screenshots/TC-11-01-desktop-expanded-dashboard.png`                                  | PASS | desktop expanded                   |
| TC-11-02     | `screenshots/TC-11-02-tablet-collapsed-focus.png`                                      | PASS | tablet collapsed                   |
| TC-11-03     | `screenshots/TC-11-03-mobile-default.png`, `screenshots/TC-11-03-mobile-more-menu.png` | PASS | mobile default + More              |
| TC-11-04     | `screenshots/TC-11-04-desktop-history-search-shortcut.png`                             | PASS | shortcut 実行後                    |
| TC-11-05     | `NON_VISUAL: editable guard`                                                           | PASS | Playwright で確認                  |
| TC-11-06     | `NON_VISUAL: go back`                                                                  | PASS | Playwright で確認                  |
| TC-11-07     | `NON_VISUAL: feature flag rollback drill + AppDock.test.tsx`                           | PASS | ON は実画面、OFF は rollback drill |

## テストカテゴリ別結果

### 機能テスト（正常系）

| テストケース | 機能                  | 期待結果                         | 結果 | 備考                                                                                   |
| ------------ | --------------------- | -------------------------------- | ---- | -------------------------------------------------------------------------------------- |
| TC-11-01     | desktop expanded      | 9項目 / 3セクション / ラベル表示 | PASS | `screenshots/TC-11-01-desktop-expanded-dashboard.png`                                  |
| TC-11-02     | tablet collapsed      | 56px / アイコンのみ / focus 導線 | PASS | `screenshots/TC-11-02-tablet-collapsed-focus.png`                                      |
| TC-11-03     | mobile default + More | primary 5 + More 4               | PASS | `screenshots/TC-11-03-mobile-default.png`, `screenshots/TC-11-03-mobile-more-menu.png` |
| TC-11-04     | shortcut navigation   | `Cmd/Ctrl+6` で履歴検索へ遷移    | PASS | `screenshots/TC-11-04-desktop-history-search-shortcut.png`                             |

### アクセシビリティ/操作テスト

| テストケース | 要件                    | 結果 | WCAG違反 |
| ------------ | ----------------------- | ---- | -------- |
| TC-11-05     | editable guard          | PASS | なし     |
| TC-11-06     | `Cmd/Ctrl+[` による戻る | PASS | なし     |

### 移行/運用テスト

| テストケース | 観点                                     | 結果 | 備考                                                                                                    |
| ------------ | ---------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------- |
| TC-11-07     | feature flag OFF / ON / Step 3 readiness | PASS | ON は preview 実画面で確認。OFF は rollback drill + `AppDock.test.tsx` で確認。Step 3 は readiness のみ |

### 非視覚確認ログ

| テストケース | 実施内容                          | 結果 |
| ------------ | --------------------------------- | ---- |
| TC-11-04     | Playwright で `Control+6` 実行    | PASS |
| TC-11-05     | input focus 中に `Control+2` 実行 | PASS |
| TC-11-06     | input blur 後に `Control+[` 実行  | PASS |

## 仕様照合結果サマリー

| 確認項目           | 結果   |
| ------------------ | ------ |
| レイアウト一致     | PASS   |
| カラーパレット準拠 | PASS   |
| 8pxグリッド準拠    | PASS   |
| ダークモード確認   | 対象外 |
| エラー状態UI       | 対象外 |

## 総合判定

- 結果: **PASS with minor observations**
- blocking な nav-specific defect は未検出。
