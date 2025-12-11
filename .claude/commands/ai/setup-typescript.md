---
description: |
  TypeScript設定の最適化を行うコマンド。

  厳格度レベル（strict/moderate/loose）に応じたtsconfig.jsonを生成し、
  型安全性とプロジェクト要件のバランスを最適化します。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/schema-def.md` - 型定義・スキーマ専門エージェント

  📚 利用可能スキル（schema-defエージェントが参照）:
  - `.claude/skills/type-safety-patterns/SKILL.md` - TypeScript strict設定、型ガード、型推論
  - `.claude/skills/typescript-configuration/SKILL.md` - tsconfig.json最適化、コンパイラオプション

  ⚙️ このコマンドの設定:
  - argument-hint: "[strictness]"（strict/moderate/loose、デフォルト: strict）
  - allowed-tools: TypeScript設定用
    • Task: schema-defエージェント起動用
    • Read: 既存tsconfig.json確認用
    • Edit: tsconfig.json更新用
  - model: sonnet（標準的なTypeScript設定タスク）

  📋 成果物:
  - `tsconfig.json`（最適化済み）
  - `tsconfig.node.json`（Node.js用、必要時）

  🎯 厳格度レベル:
  - **strict**（推奨、本番用）: 最大限の型安全性、any型禁止
  - **moderate**: バランス型、実用的な型チェック
  - **loose**: 緩い設定、移行期・プロトタイプ向け

  トリガーキーワード: typescript, tsconfig, 型チェック, 型安全性
argument-hint: "[strictness]"
allowed-tools:
  - Task
  - Read
  - Edit
model: sonnet
---

# TypeScript設定

このコマンドは、TypeScript設定を最適化します。

## 📋 実行フロー

### Phase 1: 厳格度レベルの選択

**引数検証**:

```bash
strictness="${ARGUMENTS:-strict}"

if ! [[ "$strictness" =~ ^(strict|moderate|loose)$ ]]; then
  エラー: 無効な厳格度レベルです
  使用可能: strict, moderate, loose
fi
```

### Phase 2: schema-defエージェントを起動

**使用エージェント**: `.claude/agents/schema-def.md`

**エージェントへの依頼内容**:

````markdown
TypeScript設定を「${strictness}」レベルで最適化してください。

**要件**:

1. tsconfig.json更新:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "lib": ["ES2022", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "moduleResolution": "bundler",
       "strict": true, // strictnessに応じて調整
       "noUncheckedIndexedAccess": true,
       "noImplicitReturns": true,
       "skipLibCheck": true,
       "esModuleInterop": true,
       "paths": {
         "@/*": ["./src/*"]
       }
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", ".next", "out"]
   }
   ```
````

2. 厳格度別設定:
   - **strict**: `strict: true`, `noUncheckedIndexedAccess: true`
   - **moderate**: `strict: true`, `skipLibCheck: true`
   - **loose**: `strict: false`, `noImplicitAny: false`

3. Next.js固有設定:
   ```json
   {
     "compilerOptions": {
       "jsx": "preserve",
       "incremental": true,
       "plugins": [{ "name": "next" }]
     },
     "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
   }
   ```

**スキル参照**:

- `.claude/skills/type-safety-patterns/SKILL.md` - 型安全性パターン
- `.claude/skills/typescript-configuration/SKILL.md` - tsconfig最適化

**成果物**: tsconfig.json

````

### Phase 3: 完了報告

```markdown
## TypeScript設定完了

厳格度: ${strictness}

### 設定内容
✅ strict モード: ${strict_enabled}
✅ noUncheckedIndexedAccess: ${enabled_or_not}
✅ Path Aliases: @/* → src/*

### Next Steps
1. 型チェック実行: `pnpm typecheck`
2. エラー修正（strictモードの場合）
````

## 使用例

### strict（推奨、本番用）

```bash
/ai:setup-typescript strict
```

最大限の型安全性、any型警告

### moderate（バランス型）

```bash
/ai:setup-typescript moderate
```

実用的な型チェック、移行しやすい

### loose（プロトタイプ向け）

```bash
/ai:setup-typescript loose
```

緩い設定、素早い開発

## 厳格度比較

| オプション               | strict | moderate | loose |
| ------------------------ | ------ | -------- | ----- |
| strict                   | ✅     | ✅       | ❌    |
| noImplicitAny            | ✅     | ✅       | ❌    |
| noUncheckedIndexedAccess | ✅     | ❌       | ❌    |
| skipLibCheck             | ❌     | ✅       | ✅    |

## ベストプラクティス

### 段階的strict化

```bash
# 1. looseで開始
/ai:setup-typescript loose

# 2. moderateに移行
/ai:setup-typescript moderate

# 3. strictに到達（本番投入前）
/ai:setup-typescript strict
```

### CI/CD統合

```yaml
# .github/workflows/typecheck.yml
- name: Type Check
  run: pnpm typecheck
```

## 参照

- schema-def: `.claude/agents/schema-def.md`
- type-safety-patterns: `.claude/skills/type-safety-patterns/SKILL.md`
