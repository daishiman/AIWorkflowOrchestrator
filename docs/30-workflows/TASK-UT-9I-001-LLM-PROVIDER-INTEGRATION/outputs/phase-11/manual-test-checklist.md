# Phase 11 Manual Test Checklist

## 判定

- タスク種別: `docs-only / NON_VISUAL`
- 実機 Anthropic API 検証: `BLOCKED`
- blocked 理由: `ANTHROPIC_API_KEY` 未設定のため current wave では実施不可

## チェック項目

- [x] `NON_VISUAL` 判定を index.md / artifacts.json / phase-11-manual-test.md で整合化した
- [x] `視覚証跡` セクションに screenshot 不要を明記した
- [ ] シナリオ 1: 正常生成
- [ ] シナリオ 2: API キー未設定
- [x] シナリオ 3: stub 排除確認
- [ ] シナリオ 4: エラー回復可能性確認
- [x] blocked 理由を `manual-test-result.md` と同一内容で記録した
- [x] follow-up の要否を `discovered-issues.md` に記録した
