# Phase 6: テスト拡張レポート

## 拡張内容

- `handoffBundle` の有無を明示的に分けた。
- `getWorkflowState` / `submitUserInput` / `executePlan` の各経路から `handoff` snapshot が届くケースを追加した。
- 連続 snapshot の回帰シナリオをまとめて検証できるようにした。

## 実行結果

```bash
pnpm exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx --reporter=verbose
```

- 結果: PASS
- テスト数: 8

## 回帰観点

- `handoff` のときだけエラーを保持すること
- `handoffBundle` の更新は継続すること
- 非 `handoff` の snapshot では既存のクリア動作を維持すること
