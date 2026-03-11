# Phase 6 アクセシビリティケース

| ID         | ケース                                                                     | 結果 |
| ---------- | -------------------------------------------------------------------------- | ---- |
| A11Y-06-01 | Bell が `aria-label` / `aria-haspopup=\"dialog\"` / `aria-expanded` を持つ | PASS |
| A11Y-06-02 | popover が `role=\"dialog\"` と `aria-labelledby` を持つ                   | PASS |
| A11Y-06-03 | Escape で close し trigger へ focus return                                 | PASS |
| A11Y-06-04 | Tab wrap で hidden delete button を踏まずに循環する                        | PASS |
| A11Y-06-05 | unread 数通知用 `role=\"status\" aria-live=\"polite\"` を持つ              | PASS |
| A11Y-06-06 | icon-only close button が `aria-label` を持つ                              | PASS |

## 手動で残す確認

- VoiceOver 読み上げ文脈
- touch gesture と keyboard 利用時の認知負荷
