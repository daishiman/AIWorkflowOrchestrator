# Phase 1: 受け入れ基準

| AC#   | 受け入れ基準                                               | 検証方法       |
| ----- | ---------------------------------------------------------- | -------------- |
| AC-01 | generationMode state が SkillCreateWizard.tsx に存在しない | コードレビュー |
| AC-02 | description / options state が存在しない                   | コードレビュー |
| AC-03 | template 条件分岐が全て除去されている                      | コードレビュー |
| AC-04 | STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"]     | ユニットテスト |
| AC-05 | inferSmartDefaults が purpose を小文字化して判定する       | ユニットテスト |
| AC-06 | handleGenerate が二重呼び出しを防止する                    | ユニットテスト |
| AC-07 | Step 3 で skillPath が表示される                           | 統合テスト     |
| AC-08 | handleRetry が formData を保持して Step 0 に戻る           | 統合テスト     |
| AC-09 | GenerateStep に generationMode prop が渡されない           | コードレビュー |
| AC-10 | CompleteStep に onRetry が接続されている                   | 統合テスト     |
