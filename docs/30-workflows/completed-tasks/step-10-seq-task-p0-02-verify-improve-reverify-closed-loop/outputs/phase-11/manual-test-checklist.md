# Phase 11 Manual Test Checklist

## テスト方式

- 種別: `NON_VISUAL`
- 主証跡: command / log / documentation walkthrough
- validator 互換: `screenshot-plan.json` と placeholder evidence を inventory として保持

## チェック項目

- [x] TC-01: スキル作成を開始し execute phase まで進める
- [x] TC-01: execute 完了後、verify phase に遷移することを確認する
- [x] TC-02: verify で意図的に fail を発生させ、improve phase に遷移することを確認する
- [x] TC-03: improve で修正を適用し、re-verify を要求する
- [x] TC-04: verify phase に再遷移し、pass になることを確認する
- [x] TC-05: verify pass 後の最終状態を確認する
- [x] TC-01〜TC-05 の結果を `manual-test-result.md` に記録する
