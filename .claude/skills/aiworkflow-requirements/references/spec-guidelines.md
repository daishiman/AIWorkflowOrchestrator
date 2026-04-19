# 仕様書記述ガイドライン

> 本ドキュメントは aiworkflow-requirements スキルの記述ルールを定義する。

---

## テンプレート一覧

新規仕様作成時は、カテゴリに応じたテンプレートを使用する。

| カテゴリ         | prefix          | テンプレート             | 用途                       |
| ---------------- | --------------- | ------------------------ | -------------------------- |
| インターフェース | `interfaces-`   | interfaces-template.md   | 型定義、IPC、Preload API   |
| アーキテクチャ   | `architecture-` | architecture-template.md | 設計パターン、レイヤー構成 |
| API設計          | `api-`          | api-template.md          | REST/IPC エンドポイント    |
| データベース     | `database-`     | database-template.md     | スキーマ、マイグレーション |
| UI/UX            | `ui-ux-`        | ui-ux-template.md        | コンポーネント、状態管理   |
| セキュリティ     | `security-`     | security-template.md     | 脅威モデル、対策           |
| 技術スタック     | `technology-`   | technology-template.md   | 技術選定、バージョン管理   |
| Claude Code      | `claude-code-`  | claude-code-template.md  | Skill/Agent/Command        |
| デプロイ         | `deployment-`   | deployment-template.md   | CI/CD、環境構成            |
| ワークフロー     | `workflow-`     | workflow-template.md     | フェーズ構成、トリガー     |
| その他           | (なし)          | spec-template.md         | 汎用仕様書                 |

**テンプレート配置**: `assets/` ディレクトリ

---

## 命名規則

### ファイル命名

```
{prefix}-{topic}.md
```

| ルール     | 説明                               | 例                                          |
| ---------- | ---------------------------------- | ------------------------------------------- |
| kebab-case | 小文字・ハイフン区切り             | `api-endpoints.md`                          |
| prefix     | トピックカテゴリ                   | `architecture-`, `api-`, `ui-ux-`           |
| 番号なし   | ファイル追加時にリネンバリング不要 | ✅ `database-schema.md` ❌ `15-database.md` |

### prefix ガイド

| prefix          | 用途                     |
| --------------- | ------------------------ |
| `architecture-` | アーキテクチャ・設計     |
| `interfaces-`   | 型定義・インターフェース |
| `api-`          | API設計・エンドポイント  |
| `database-`     | データベース・スキーマ   |
| `ui-ux-`        | UI/UXデザイン            |
| `security-`     | セキュリティ             |
| `technology-`   | 技術スタック             |
| `claude-code-`  | Claude Code関連          |
| `workflow-`     | ワークフロー             |
| (なし)          | 単独トピック             |

## 記述形式

仕様は**文章中心**で記述する。ソースコードは避け、誰でも理解できる粒度で記述する。

### 推奨形式

| 形式     | 用途                          | 例                        |
| -------- | ----------------------------- | ------------------------- |
| 文章     | 設計意図、目的、概念の説明    | 「認証は2要素認証を採用」 |
| 表       | データ構造、設定項目、API仕様 | フィールド定義表          |
| 箇条書き | 手順、要件、チェックリスト    | 実装手順リスト            |

### 見出しルール

| ルール        | 例                  | 説明                   |
| ------------- | ------------------- | ---------------------- |
| 番号なし      | `## 概要` ✅        | `## 1. 概要` ❌        |
| 命名ベース    | `### 機能要件`      | 内容を表す名前で管理   |
| 階層は3段まで | `##`, `###`, `####` | 深すぎるネストを避ける |

## すべきこと

- 文章による説明（設計意図・目的を明確に）
- 表形式でデータ構造・設定項目を整理
- 箇条書きで手順・要件をリスト化
- 見出しは命名ベースで管理（番号なし）
- 500行を超える場合は分割を検討
- prefix命名規則に従う

## 避けるべきこと

- ソースコードの直接記述（TypeScript, JSON, SQL等）
- 見出しへの番号付け（例: `## 1. 概要` → `## 概要`）
- 実装詳細への偏り
- 専門用語の説明なしでの使用
- references/以外に仕様情報を分散
- 深いネスト構造

## 新規仕様の追加手順

1. **テンプレートをコピー**: `assets/spec-template.md`
2. **命名規則に従う**: `{prefix}-{topic}.md`
3. **配置**: `references/` 直下
4. **SKILL.md更新**: 不要（自動反映）
5. **インデックス更新**: `node scripts/generate-index.js`

## 完了タスクセクション標準化

全仕様書の「完了タスク」セクションは以下のフォーマットに統一する。Phase 12 Step 1-A で仕様書にタスク完了記録を追加する際に、このフォーマットに従うこと。

### 標準フォーマット

```markdown
## 完了タスク

### タスク: {{TASK_NAME}}（{{YYYY-MM-DD}}完了）

| 項目 | 内容 |
| --- | --- |
| タスクID | {{TASK_ID}} |
| ステータス | **完了** |
| 完了日 | {{YYYY-MM-DD}} |
| 実装内容 | {{実装内容の1行サマリー}} |

**テスト結果サマリー**:
- テスト数: {{N}}件全PASS
- カバレッジ: Line {{X}}% / Branch {{Y}}% / Function {{Z}}%

**成果物**:

| 成果物 | パス |
| --- | --- |
| {{成果物名}} | {{相対パス}} |
```

### 記載ルール

| ルール | 説明 |
| --- | --- |
| 見出しレベル | `### タスク:` で統一（`##` ではない） |
| 日付形式 | ISO 8601（`YYYY-MM-DD`） |
| テスト結果 | 件数とカバレッジを必ず記載 |
| 成果物テーブル | 実際の出力ファイルパスを記載 |
| 複数タスク | 完了日降順で並べる（最新が上） |

### 避けるべきパターン

- 「完了」の一言だけで詳細なし
- テスト結果・カバレッジの省略
- 成果物テーブルの省略
- 日付なしの完了記録

---

## ファイルサイズ管理

| 閾値      | アクション |
| --------- | ---------- |
| 500行以下 | 適正       |
| 500-700行 | 分割検討   |
| 700行超   | 要分割     |

### 分割スクリプト

```bash
# 分割候補を分析
node scripts/split-reference.js --analyze

# 設定に基づいて分割
node scripts/split-reference.js --split <file> <config.json>
```

---

## Canonical/Mirror 原則

### 正本と鏡像の役割分担

スキル一式は 2 つの root に配置される。両者は「常に完全一致（full parity）」でなければならない。

| 役割      | パス              | 編集可否 | 生成方法                                           |
| --------- | ----------------- | -------- | -------------------------------------------------- |
| canonical | `.claude/skills/` | 可       | 仕様書作成・スキル更新の**唯一の正本**             |
| mirror    | `.agents/skills/` | 不可     | `sync-skills-mirror.sh` による canonical からの複製 |

### 運用スクリプト

| スクリプト                                | 役割                                        | exit コード契約                                                                                     |
| ----------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `.claude/scripts/verify-skills-parity.sh` | `diff -qr` による差分検証                   | 0=OK または bootstrap skip（両 root 不在 / canonical 不在） / 1=mirror 欠損 or 差分検出             |
| `.claude/scripts/sync-skills-mirror.sh`   | `rsync -a --delete` による canonical→mirror | 0=最終 parity OK / 1=再同期後も差分残存 or `--check-only` 差分検出                                  |

### ガードレール

- **pre-push hook** (`.husky/pre-push`): push 直前に `verify-skills-parity.sh` を実行。NG で push を拒否
- **session-init hook** (`.claude/hooks/session-init.sh`): セッション開始時に parity 警告を出力（`CLAUDE_SKIP_HEAVY_HOOKS=1` で opt-out 可）

### 復旧手順

parity NG 時は以下を実行する。

```bash
# 1. 差分を確認
bash .claude/scripts/verify-skills-parity.sh

# 2. canonical→mirror に再同期
bash .claude/scripts/sync-skills-mirror.sh

# 3. parity OK を再確認
bash .claude/scripts/verify-skills-parity.sh
```

### 禁止事項

- `.agents/skills/` 配下の直接編集（mirror は canonical の派生物であり SSoT ではない）
- pre-push hook のスキップ（`--no-verify`）
- mirror のみ先行更新（必ず canonical から同期する）
