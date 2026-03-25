# UT-2: Disclosure banner 再表示アイコン配置実装

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| ID         | UT-2                                             |
| 由来タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001  |
| 由来       | Phase 3 MINOR R-M2 / Phase 11 DI-2               |
| 優先度     | LOW                                              |
| ステータス | 設計コード実装済み（production統合は後続タスク） |
| 検出日     | 2026-03-24                                       |

---

## 概要

SessionDisclosureBanner dismiss 後の再表示アイコンを Session Dock ヘッダー右端に info icon として配置する。機能的影響は小さく、UX の配置位置調整が目的。

## 実装根拠

`ExecutionConsoleView/index.tsx` に再表示アイコン（disclosure-reopen ボタン）実装済み。

## 対象ファイル

| ファイル                                                                          | 変更種別 |
| --------------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/components/execution/`（SessionDisclosureBanner 関連） | 確認     |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`                  | 確認     |

## 受入基準

- [ ] バナー dismiss 後に Session Dock ヘッダー右端に info アイコンが表示される
- [ ] アイコンクリックでバナーが再表示される
- [ ] production統合時にアイコンが正しい位置に描画される
