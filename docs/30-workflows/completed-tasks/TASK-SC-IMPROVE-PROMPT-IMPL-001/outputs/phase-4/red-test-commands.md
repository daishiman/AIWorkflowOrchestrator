# テスト実行コマンド

## targeted run (新規テスト)

```bash
pnpm --filter @repo/desktop test SkillCreatorService.improve-prompt
```

## 既存回帰テスト

```bash
pnpm --filter @repo/desktop test SkillCreatorService
```

## 全テスト

```bash
pnpm --filter @repo/desktop test
```
