# Phase 12: Skill Feedback Report

## workflow 改善点

| ID   | カテゴリ  | 内容                                                                                                                                                       |
| ---- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-01 | テスト    | Rosetta 2 環境での arch 検出は Phase 4 のテスト計画で事前に検出すべきだった。Phase 11 での発見は遅い                                                       |
| F-02 | 設計      | pnpm strict resolution の影響を Phase 2 の設計時に考慮すべき。setup-native-modules.sh の require テストが pnpm 環境で動かない問題は Phase 5 以前に気づけた |
| F-03 | 並列化    | 問題A と問題B の並列実行は効果的だった。依存が少ない修正は積極的に並列化すべき                                                                             |
| F-04 | close-out | Phase 12 で placeholder 証跡や system spec 更新保留を残すと、完了判定が見かけ上だけ先に閉じる。evidence と canonical spec を same-wave で閉じるべき        |
| F-05 | 回帰防止  | build hook のような packaging 専用コードでも静的存在確認だけでは足りない。arch enum 正規化のような実値テストを 1 本持つべき                                |
