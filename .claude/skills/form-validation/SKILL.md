---
name: .claude/skills/form-validation/SKILL.md
description: |
  フォームバリデーション設計と実装を専門とするスキル。
  フロントエンド検証からサーバー側バリデーション、エラーハンドリングまで包括的に対応します。

  Anchors: フォームバリデーション, 入力検証, バリデーションルール, エラーメッセージ設計

  Triggers:
  - フォームバリデーション設計をする
  - 入力検証ロジックを実装する
  - バリデーションルールを定義する
  - クライアント側検証を構築する
  - サーバー側検証を実装する
  - エラーメッセージを設計する
  - バリデーションテストを作成する

  📖 参照書籍:
  - 『Designing Data-Intensive Applications』（Martin Kleppmann）: データ検証戦略
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 入力検証設計

  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト

---

# フォームバリデーション

## 概要

フォームバリデーション設計と実装を専門とするスキル。フロントエンド検証からサーバー側バリデーション、エラーハンドリングまで包括的に対応します。

再利用可能で保守性の高いバリデーション設計を支援し、ユーザー体験を損なわないエラーメッセージ戦略を提供します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 要件と設計の整理

**目的**: バリデーション要件を明確にし、設計方針を決定する

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. フォームの要件（フィールド定義、制約条件、エラーシナリオ）を把握
3. バリデーション戦略を選定（Zod、Yup、カスタム検証など）
4. クライアント側・サーバー側バリデーションの分担を決定
5. 必要なリソース・テンプレートを特定

### Phase 2: バリデーション実装

**目的**: バリデーションロジックを実装し、エラーハンドリングを統合する

**アクション**:

1. スキーマ定義（Zod/Yup）またはカスタム検証関数を作成
2. フロントエンド検証（リアルタイムフィードバック）を実装
3. サーバー側検証（セキュリティと一貫性）を実装
4. エラーメッセージ生成・表示ロジックを実装
5. バリデーション関数のテストケースを作成

### Phase 3: テストと最適化

**目的**: バリデーション処理の正確性と使いやすさを検証する

**アクション**:

1. 各フィールドの境界値テスト（boundary value analysis）を実行
2. エッジケース（空文字列、null、undefined、特殊文字）をテスト
3. `scripts/validate-skill.mjs` でスキル構造を確認
4. Playwrightでのエンドツーエンドテストを実行
5. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

| フェーズ | Task               | 説明                                              | リソース               |
| -------- | ------------------ | ------------------------------------------------- | ---------------------- |
| Phase 1  | 要件分析           | フォームフィールドと制約条件を明確化              | Level1_basics.md       |
| Phase 1  | ツール選定         | 最適なバリデーションライブラリを選択              | Level2_intermediate.md |
| Phase 1  | 設計決定           | クライアント/サーバー検証の分担を決定             | Level3_advanced.md     |
| Phase 2  | スキーマ定義       | Zod/Yupでバリデーションスキーマを定義             | Level2_intermediate.md |
| Phase 2  | UI統合             | フロームフレームワークと連携（react-hook-form等） | Level3_advanced.md     |
| Phase 2  | サーバー検証       | バックエンド検証ロジックを実装                    | Level2_intermediate.md |
| Phase 2  | エラーハンドリング | ユーザーフレンドリーなエラーメッセージを設計      | Level2_intermediate.md |
| Phase 3  | ユニットテスト     | バリデーション関数のテストを作成                  | Level3_advanced.md     |
| Phase 3  | E2Eテスト          | Playwrightでフォーム送信フローをテスト            | Level3_advanced.md     |
| Phase 3  | パフォーマンス     | バリデーション処理の効率化を実施                  | Level4_expert.md       |

## ベストプラクティス

### すべきこと

- **複数レイヤー検証**: フロントエンド検証はUX向上用、サーバー側検証はセキュリティ必須（両方実装）
- **スキーマの一元化**: Zodやカスタムスキーマを使い、検証ルールを1箇所で定義
- **明確なエラーメッセージ**: 何が間違っているか、どう直すかを具体的に示す
- **段階的フィードバック**: リアルタイムバリデーション（blur時など）でユーザーをサポート
- **テスト駆動**: 境界値分析やエッジケースをカバーするテストを先に書く
- **型安全性**: TypeScriptで入力・出力型を厳密に定義（anyを避ける）
- **国際化対応**: エラーメッセージはi18nで多言語対応を考慮

### 避けるべきこと

- **client-only検証**: サーバー側検証なしでセキュリティリスクを高める
- **曖昧なエラーメッセージ**: 「エラーが発生しました」では修正できない
- **過度なリアルタイム検証**: すべてのキー入力で検証するとパフォーマンスが低下
- **検証ルールの重複**: スキーマと実装で異なるルールを持つ
- **ハードコーディング**: バリデーションルールを複数箇所に分散させない
- **エラー隠蔽**: デバッグ時に必要なエラー情報を削除しない
- **入力サニタイゼーション省略**: SQLインジェクション等の脆弱性対策を必須に

## リソース参照

### 基本ガイド

```bash
cat .claude/skills/form-validation/references/Level1_basics.md
cat .claude/skills/form-validation/references/Level2_intermediate.md
```

### 応用・専門ガイド

```bash
cat .claude/skills/form-validation/references/Level3_advanced.md
cat .claude/skills/form-validation/references/Level4_expert.md
```

### スクリプト実行

```bash
node .claude/skills/form-validation/scripts/validate-skill.mjs
node .claude/skills/form-validation/scripts/log_usage.mjs --help
```

## 変更履歴

| Version | Date       | Changes                                                                               |
| ------- | ---------- | ------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に準拠: Trigger追加、Task仕様ナビ追加、allowed-tools定義、Anchors明示 |
| 1.0.0   | 2025-12-24 | 初版リリース                                                                          |
