---
description: |
  Zodスキーマ定義の作成（Zod 3.x + TypeScript 5.x準拠）。

  型安全なランタイムバリデーション、入力サニタイゼーション、型推論を含む完全なスキーマ設計を実行します。

  🤖 起動エージェント:
  - `.claude/agents/schema-def.md`: スキーマ定義専門エージェント（Phase 1で起動）

  📚 利用可能スキル（フェーズ別、schema-defエージェントが必要時に参照）:
  **Phase 1（要件理解時）:** なし（既存スキーマ・ドメインモデル分析のみ）
  **Phase 2（スキーマ設計時）:** zod-validation（必須）, type-safety-patterns（必須）
  **Phase 3（セキュリティ時）:** input-sanitization（必須）
  **Phase 4（テスト時）:** なし（TDDパターン適用）
  **Phase 5（統合時）:** api-contract-design（API連携時）, form-validation（フォーム連携時）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（未指定時はインタラクティブ）
  - allowed-tools: エージェント起動と最小限のスキーマ生成用
    • Task: schema-defエージェント起動用
    • Read: 既存スキーマ・ドメインモデル確認用
    • Write(src/**/*.schema.ts|features/**/*.schema.ts): スキーマファイル生成用（パス制限）
    • Edit: 既存スキーマファイル編集用
    • Grep, Glob: 既存パターン検索・重複チェック用
  - model: sonnet（構造化スキーマ設計タスク）

  トリガーキーワード: schema, zod, validation, バリデーション, スキーマ, 型定義, input validation
argument-hint: "[schema-name]"
allowed-tools:
  - Task
  - Read
  - Write(src/**/*.schema.ts|features/**/*.schema.ts)
  - Edit
  - Grep
  - Glob
model: sonnet
---

# Zodスキーマ作成コマンド

## Phase 1: 準備とコンテキスト収集

**対象スキーマ**: `$ARGUMENTS`（未指定時はインタラクティブに質問）

**必須参照**:
- `docs/00-requirements/master_system_design.md` 第2.1節（入力バリデーション原則）
- `src/shared/schemas/`（既存スキーマパターン）
- `features/*/schema.ts`（機能別スキーマ）

---

## Phase 2: schema-defエージェント起動

`.claude/agents/schema-def.md` を以下のパラメータで起動:

**入力情報**:
- 対象: `$ARGUMENTS` または対話的に決定
- 技術スタック: Zod 3.x + TypeScript 5.x（strictMode）
- スキーマ配置: `features/*/schema.ts` または `src/shared/schemas/`

**実行依頼内容**:
1. 要件理解（ドメインモデル・既存スキーマ分析）
2. Zodスキーマ設計（基本スキーマ、カスタムバリデーション、型推論）
3. セキュリティ・サニタイゼーション（XSS/SQLi/コマンドインジェクション防止）
4. テスト作成（スキーマテスト、エッジケース、エラーメッセージ検証）
5. 統合・ドキュメント化（型エクスポート、API/フォーム連携）

**エージェントが参照するスキル**（Progressive Disclosure方式）:
- `.claude/skills/zod-validation/SKILL.md`（Phase 2: スキーマ設計時）
- `.claude/skills/type-safety-patterns/SKILL.md`（Phase 2: 型安全設計時）
- `.claude/skills/input-sanitization/SKILL.md`（Phase 3: セキュリティ時）
- その他必要に応じて: api-contract-design, form-validation, data-transformation

---

## Phase 3: 成果物の確認

**期待される成果物**:
- `features/[feature]/schema.ts`（Zodスキーマ定義）
- `features/[feature]/schema.test.ts`（スキーマテスト）
- 型エクスポート（`z.infer<typeof schema>`）

**設計原則準拠チェック**（master_system_design.md 第2.1節）:
- ✅ 入力値サニタイゼーション適用
- ✅ カスタムエラーメッセージ（日本語対応）
- ✅ エラーコード 1000-5999 範囲
- ✅ 型推論による静的型安全性
- ✅ ランタイムバリデーション

---

**使用例**:

```bash
# 基本スキーマ作成
/ai:create-schema user

# 機能固有スキーマ
/ai:create-schema auth/login-request

# APIレスポンススキーマ
/ai:create-schema api/product-response

# インタラクティブモード
/ai:create-schema
```

**関連コマンド**:
- `/ai:design-api` - API設計（スキーマ連携）
- `/ai:create-component` - フォームコンポーネント作成（スキーマ連携）
