# Phase 11 スクリーンショット

CLI環境のためスクリーンショット取得は P53 に基づき自動テスト結果で代替。

## P53 参照

> CLI 環境では Electron アプリの実画面キャプチャができない。
> 自動テスト結果を「間接的な視覚検証」として代替記録する方式を採用する。

## 代替検証方法

本ディレクトリに PNG スクリーンショットは存在しない。
Phase 11 の視覚検証は以下の方法で代替している:

1. JSX 構造・CSS クラスのコード目視確認
2. 自動テスト（AgentView.cta.test.tsx 10 tests PASS）による間接的検証
3. SkillAnalysisView.tsx の props 定義による型レベルの動作保証

## 代替証跡

| シナリオ                               | 代替証跡                                       |
| -------------------------------------- | ---------------------------------------------- |
| CTA バナー表示                         | AgentView.cta.test.tsx L161-173 PASS           |
| CTA バナー非表示条件                   | AgentView.cta.test.tsx L175-265 PASS (7 tests) |
| CTA クリック -> SkillAnalysisView 遷移 | AgentView.cta.test.tsx L268-289 PASS           |
| アクセシビリティ aria-label            | AgentView.cta.test.tsx L292-308 PASS           |
| 戻り導線 onNavigateBack                | SkillAnalysisView.tsx L73-81 コード目視確認    |
| 再実行ボタン onNavigateToAgent         | SkillAnalysisView.tsx L164-172 コード目視確認  |
