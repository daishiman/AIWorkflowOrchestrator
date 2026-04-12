# Phase 2: テスト戦略

## テスト種別

- ユニットテスト: inferSmartDefaults の全推論ルール分岐
- 統合テスト: handleStep0Next → smartDefaults 推論 → Step 1 遷移
- 統合テスト: handleGenerate("complete"/"skip") → LLM生成 → Step 3 遷移
- ユニットテスト: handleQualityFeedback → trackEvent 呼び出し
- 統合テスト: handleRetry → Step 0 復帰 + formData 保持

## カバレッジ目標

- SkillCreateWizard.tsx: 80% 以上
- inferSmartDefaults: 90% 以上
