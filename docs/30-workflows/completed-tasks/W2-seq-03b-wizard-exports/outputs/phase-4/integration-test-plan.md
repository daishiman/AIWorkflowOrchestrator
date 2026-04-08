# 統合テスト計画

**タスクID**: UT-SKILL-WIZARD-W2-seq-03b

## 目的

ビルド後の成果物において、`wizard/index.ts` のエクスポート変更が他モジュールと正しく統合されることを確認する。

## 検証シナリオ

### シナリオ 1: SkillCreateWizard からの利用確認

- `SkillCreateWizard` が `SkillInfoStep` を `wizard/index` から正常にインポートできること
- ウィザード Step 0 のレンダリングが正常に動作すること

### シナリオ 2: 旧 DescribeStep 参照の不在確認

- プロダクションバンドルに `DescribeStep` のエクスポートパスが含まれないこと
- `DescribeStep` を直接インポートしているファイルがあれば警告を確認すること

### シナリオ 3: TypeScript ビルド成功確認

```bash
pnpm --filter @repo/desktop typecheck
```

型エラーが 0 件であること。

### シナリオ 4: Electron レンダラーでの動作確認

- 開発環境で `pnpm --filter @repo/desktop dev` を起動
- スキル作成ウィザードを開いて Step 0（SkillInfoStep）が表示されること

## 合否基準

| 項目                  | 基準            |
| --------------------- | --------------- |
| TypeScript 型チェック | エラー 0 件     |
| ユニットテスト        | 全 13 件 PASS   |
| ウィザード起動        | Step 0 表示確認 |
