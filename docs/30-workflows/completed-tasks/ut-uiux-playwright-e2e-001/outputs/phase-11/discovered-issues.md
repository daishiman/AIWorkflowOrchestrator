# Phase 11: 発見事項

## HIGH 問題

### ISSUE-001: モーダル表示中に背景フォーカスが残る

| 項目   | 内容                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| テスト | `SEM-006` chat-main / sidebar-navigation                                     |
| 内容   | Onboarding オーバーレイ表示中でも背景ナビゲーションへフォーカス到達できる    |
| 影響   | キーボード利用者が dialog 外へ逸脱する                                       |
| 対応   | `docs/30-workflows/unassigned-task/TASK-A11Y-FOCUS-TRAP-001.md` に formalize |
| 優先度 | HIGH                                                                         |

## MEDIUM 問題

### ISSUE-002: Visual baseline drift

| 項目   | 内容                                                                 |
| ------ | -------------------------------------------------------------------- |
| テスト | `TC-11-05` / `TC-11-06` / `TC-11-07`                                 |
| 内容   | `error-display` / `loading-state` / `dark-mode` で 113px diff が出る |
| 影響   | snapshot 更新か UI 変更の再判定が必要                                |
| 対応   | `unassigned-task-detection.md` では MEDIUM として記録のみ            |
| 優先度 | MEDIUM                                                               |

## 今回解消したノイズ

- native button / textbox の implicit role を PASS 扱いに是正
- roving tabindex を positive tabindex 重複検知から除外
