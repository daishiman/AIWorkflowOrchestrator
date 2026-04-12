# DescribeStep 除外確認

## カバレッジ対象から除外されていることの確認

```bash
ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
# → No such file or directory（正常）
```

DescribeStep.tsx が存在しないため、カバレッジレポートに現れない。これが期待状態。
