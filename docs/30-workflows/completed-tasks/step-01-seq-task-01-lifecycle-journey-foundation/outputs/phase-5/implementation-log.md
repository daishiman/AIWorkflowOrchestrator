# 実装ログ

## 変更順序

1. skillLifecycleJourney.ts を追加し、journey / responsibility / advanced policy / downstream contract を正本化
2. App.tsx で skill-center alias を描画前に正規化
3. SkillCenterView に一次導線 guide panel と surface ownership panel を追加
4. renderer テスト 2 ファイル / 18 テストで回帰確認
5. Phase 11 用 screenshot script を追加し、TC-11-05 は surface ownership 要素を直接採取

## 実装判断

- 既存の UI を大改修せず、foundation task として 正本契約 + 入口/責務の見える化 に絞った。
- Chat 側の legacy button は触らず、shell 側で安全に正規化した。
- advanced ルートは削除せず、補助導線として証跡化した。
