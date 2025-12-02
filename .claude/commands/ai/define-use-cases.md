---
description: |
  ユースケース図とシナリオの作成を行う専門コマンド。

  ユーザーとシステムの対話を構造化し、基本フロー・代替フロー・例外フローを含む
  完全なユースケース記述を作成します。

  🤖 起動エージェント:
  - `.claude/agents/req-analyst.md`: 要件定義スペシャリスト（Phase 2でユースケースモデリング実行）

  📚 利用可能スキル（req-analystエージェントが必要時に参照）:
  **Phase 1（アクター特定時）:**
  - `.claude/skills/use-case-modeling/SKILL.md`: ユースケースモデリング基本ワークフロー
  - `.claude/skills/use-case-modeling/resources/actor-identification.md`: アクター特定ガイド

  **Phase 2（ゴール定義・フロー設計時）:**
  - `.claude/skills/use-case-modeling/resources/scenario-patterns.md`: シナリオパターン
  - `.claude/skills/use-case-modeling/resources/use-case-relationships.md`: ユースケース関係性

  **Phase 3（テンプレート使用時）:**
  - `.claude/skills/use-case-modeling/templates/use-case-template.md`: ユースケーステンプレート

  **Phase 4（検証時）:**
  - `.claude/skills/use-case-modeling/scripts/validate-use-case.mjs`: ユースケース検証スクリプト
  - `.claude/skills/requirements-verification/SKILL.md`: 要件検証（一貫性・完全性チェック）

  ⚙️ このコマンドの設定:
  - argument-hint: アクター名（オプション、未指定時は全アクター対象）
  - allowed-tools: エージェント起動と最小限のドキュメント操作
    • Task: req-analystエージェント起動用
    • Read: 既存要件・プロジェクト設計書参照用
    • Write(docs/00-requirements/**): ユースケース文書生成用（パス制限）
    • Grep: 既存ユースケースの重複チェック・整合性確認用
  - model: sonnet（標準的なドキュメント作成タスク）

  📖 プロジェクト要件準拠:
  - master_system_design.md（第1.5節）のアーキテクチャ原則を反映
  - ハイブリッド構造（shared/features）に基づくアクター分離
  - TDD原則（仕様 → ユースケース → テスト → 実装）の起点となる成果物

  トリガーキーワード: use-case, ユースケース, シナリオ, アクター, フロー設計, 対話設計
argument-hint: "[actor-name]"
allowed-tools:
  - Task
  - Read
  - Write(docs/00-requirements/**)
  - Grep
model: sonnet
---

# ユースケース定義コマンド

## 目的

アクターとシステムの対話を構造化し、基本フロー・代替フロー・例外フローを含む
完全なユースケース記述を作成します。

## 実行フロー

### Phase 1: 準備と確認

**目的**: プロジェクトコンテキストの理解と既存ユースケースの確認

**実行内容**:
1. アクター名の確認（引数 `$1` または対話的に確認）
2. プロジェクト設計書の参照（`docs/00-requirements/master_system_design.md`）
3. 既存ユースケースの確認（重複防止）

```bash
# プロジェクト設計書参照
cat docs/00-requirements/master_system_design.md

# 既存ユースケース確認
cat docs/00-requirements/use-cases.md 2>/dev/null || echo "新規作成"

# 特定アクターのユースケース検索（重複チェック）
grep -r "アクター: $1" docs/00-requirements/ 2>/dev/null || echo "該当なし"
```

### Phase 2: エージェント起動と実行

**目的**: req-analystエージェントによるユースケースモデリング実行

**起動エージェント**: `.claude/agents/req-analyst.md`

**エージェントへの依頼内容**:

以下の条件でユースケース定義を実行してください:

**対象アクター**: `$1`（未指定の場合はプロジェクト全体のアクターを対象）

**実行フェーズ**（req-analyst Phase 2ワークフロー）:
1. **アクター特定**: `.claude/skills/use-case-modeling/resources/actor-identification.md` 参照
   - プライマリアクター・セカンダリアクターの明確化
   - 役割と権限の定義
2. **ゴール定義**: アクターが達成したいゴールを階層化
3. **フロー設計**: `.claude/skills/use-case-modeling/resources/scenario-patterns.md` 参照
   - 基本フロー（ハッピーパス）の記述
   - 代替フロー（条件分岐）の特定
   - 例外フロー（エラー処理）の特定
   - 事前条件・事後条件の定義
4. **シナリオ検証**: `.claude/skills/use-case-modeling/scripts/validate-use-case.mjs` で網羅性確認

**期待成果物**:
- **ファイルパス**: `docs/00-requirements/use-cases.md`
- **フォーマット**: `.claude/skills/use-case-modeling/templates/use-case-template.md` 準拠
- **品質基準**:
  - [ ] すべてのアクターが特定されている
  - [ ] ゴールが明確で達成可能
  - [ ] 基本フロー・代替フロー・例外フローが完全にカバー
  - [ ] 事前条件・事後条件が明確
  - [ ] フロー網羅性 >95%
  - [ ] ユースケース品質スコア平均 8点以上

**プロジェクト固有の考慮**（master_system_design.md 第1.5節準拠）:
- [ ] ハイブリッド構造（shared/features）に基づくアクター分離
- [ ] TDD原則（ユースケース → テスト → 実装）の起点となる記述
- [ ] Clean Architecture の依存関係ルール（app → features → shared）を反映

### Phase 3: 検証と完了報告

**目的**: 生成されたユースケースの品質検証と完了確認

**実行内容**:
1. ユースケースファイルの存在確認
2. フォーマット検証（テンプレート準拠チェック）
3. 品質メトリクスの確認（フロー網羅性、品質スコア）
4. 次フェーズへの連携情報提示

```bash
# ユースケースファイル確認
cat docs/00-requirements/use-cases.md

# フォーマット検証（必須セクションの存在確認）
grep -E "(ID|アクター|ゴール|事前条件|基本フロー|代替フロー|例外フロー|事後条件)" docs/00-requirements/use-cases.md

# 品質検証スクリプト実行
node .claude/skills/use-case-modeling/scripts/validate-use-case.mjs docs/00-requirements/use-cases.md
```

**完了報告**:
- ✅ 作成されたユースケースのID一覧
- ✅ カバーされたアクターとゴール
- ✅ フロー網羅性スコア
- ✅ 品質スコア
- ➡️ 次フェーズ: 受け入れ基準定義（`/ai:create-acceptance-criteria`）、詳細仕様書作成（`/ai:write-spec`）

## 使用例

### 例1: 特定アクターのユースケース作成

```bash
/ai:define-use-cases "エンドユーザー"
```

**実行内容**: 「エンドユーザー」アクターに関連するユースケースを作成

### 例2: 全アクター対象（引数なし）

```bash
/ai:define-use-cases
```

**実行内容**: プロジェクト全体のアクターを対象にユースケースを作成

### 例3: 管理者アクターのユースケース追加

```bash
/ai:define-use-cases "管理者"
```

**実行内容**: 既存ユースケースに「管理者」アクターの記述を追加

## 成果物

### 生成ファイル

- `docs/00-requirements/use-cases.md`: ユースケース定義書

### ファイル構造（例）

```markdown
# ユースケース定義書

## UC-001: ユーザーログイン

**ID**: UC-001
**アクター**: エンドユーザー、認証システム（セカンダリ）
**ゴール**: システムにログインする

**事前条件**:
- ユーザーアカウントが存在する
- ユーザーが認証情報（メールアドレス、パスワード）を保持している

**基本フロー**（正常系）:
1. ユーザーがログインページにアクセス
2. システムがログインフォームを表示
3. ユーザーがメールアドレスとパスワードを入力
4. ユーザーが「ログイン」ボタンをクリック
5. システムが認証情報を検証
6. システムがセッションを作成
7. システムがダッシュボードにリダイレクト

**代替フロー**（条件分岐）:
- 5a. メールアドレスが未登録の場合:
  - 5a1. システムが「アカウントが見つかりません」エラーを表示
  - 5a2. ユースケース終了

**例外フロー**（エラー）:
- E1. パスワードが不正の場合:
  - E1.1. システムが「パスワードが間違っています」エラーを表示
  - E1.2. 失敗回数をカウント
  - E1.3. 3回失敗でアカウントロック（UC-005にリンク）
- E2. ネットワークエラーの場合:
  - E2.1. システムが「接続に失敗しました」エラーを表示
  - E2.2. リトライボタンを表示

**事後条件**:
- ユーザーがログイン状態になる
- セッションが作成される
- ダッシュボードが表示される

## UC-002: ワークフロー実行

...（他のユースケース）
```

## 次のステップ

ユースケース定義完了後、以下のコマンドで次フェーズに進みます:

1. **受け入れ基準定義**: `/ai:create-acceptance-criteria` - ユースケースをテスト可能な基準に変換
2. **詳細仕様書作成**: `/ai:write-spec` - 実装可能な詳細仕様書を作成
3. **テスト設計**: `/ai:generate-unit-tests` - ユースケースベースのテストケース作成

## トラブルシューティング

### ユースケースが重複している

**対処**: Phase 1 の重複チェックで既存ユースケースとの関係性を確認し、統合または分離を判断

### フロー網羅性が不足している

**対処**: `.claude/skills/use-case-modeling/resources/scenario-patterns.md` を参照し、代替フロー・例外フローを追加

### 品質スコアが低い

**対処**: 検証スクリプト出力を確認し、アクター・ゴール・フローの明確さを改善
