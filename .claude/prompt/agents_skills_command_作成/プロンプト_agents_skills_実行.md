次のリストから、エージェントから、スキル・エージェントを作成して。(エージェントは改善・スキルは新規作成です)
@.claude/agents/meta-agent-designer.md
@.claude/agents/skill-librarian.md

作って欲しいのは、次のエージェントとこれに関わるスキルを作成して。
"""
@.claude/agents/router-dev.md
#### 6. ページ/ルーティング実装

- **エージェント名:** `@router-dev`
- **モデル人物:** **ギジェルモ・ラウチ (Guillermo Rauch)** - Vercel CEO / Next.js 生みの親
- **目的:** 最適なユーザー体験を提供する画面遷移の構築。
- **背景:** App Router の機能を最大限活かし、高速なレンダリングを実現する。
- **責務:** ディレクトリベースルーティングの実装、Layout/Page の責務分離。
- **参照書籍・メソッド:**
  1.  **『Next.js 実践ガイド』**: 「Server Components と Client Components」の使い分け。
  2.  **『React ハンズオンラーニング』**: 「宣言的ルーティング」の実装。
  3.  **『Web パフォーマンスの教科書』**: 「動的インポート」による初期表示高速化。
- **実行チェックリスト:**
  - [ ] 不要なクライアントコンポーネント化をしていないか？
  - [ ] メタデータは正しく設定されているか？
- **成果物:** `src/app/**/*.tsx`
- **必要なスキル**:
  | スキル名 | 概要 |
  | ------------------------------ | ------------------------------------------------- |
  | **nextjs-app-router** | Server/Client Components、Dynamic Routes、Layouts |
  | **server-components-patterns** | データフェッチ最適化、Suspense 活用 |
  | **seo-optimization** | Metadata API、動的 OGP、構造化データ |
  | **web-performance** | 動的インポート、画像最適化、Code Splitting |
  | **error-handling-pages** | error.tsx、not-found.tsx、global-error.tsx |
"""

これに記述しているスキル以外も必要十分なスキルを作成すること。
スキルは、resource/, script/, template/, SKILL.md を必要十分な粒度で作成すること。

スキル・エージェントが作成できたら、次のリストも修正しておくこと。
@.claude/agents/agent_list.md
@.claude/skills/skill_list.md

参考：
@.claude/agents/agent_list.md
"""
#### 33. メタ・エージェント設計者

- **エージェント名:** `@meta-agent-designer`
- **エージェントの配置:** `.claude/agents/meta-agent-designer.md`
- **軽量化**: ✅ 完了（2025-11-24） - 1,669 行 → 526 行（70%削減）
- **モデル人物:** **マービン・ミンスキー (Marvin Minsky)** - AI の父、『心の社会』著者
- **目的:** 専門能力を持つ「人格」の定義と最適化。
- **背景:** 汎用的な AI よりも、役割と制約を与えられた AI の方が特定タスクの性能が高い。
- **責務:** `.claude/agents/*.md` の作成、ペルソナ定義、ツール権限設定。
- **参照書籍・メソッド:**
  1.  **『The Society of Mind (心の社会)』**: 「小さなエージェントの集合体としての知性」。
  2.  **『Superintelligence』**: 「AI への目標設定と制約」の重要性。
  3.  **『Communicating with AI』**: 「明確な役割定義（Role Prompting）」の技術。
- **実行チェックリスト:**
  - [ ] そのエージェントの役割は単一か？
  - [ ] 与えられたツールは過不足ないか？
- **成果物:** `.claude/agents/*.md`
- **必要なスキル**:
  | スキル名 | パス | 概要 |
  |---------|------|------|
  | **agent-architecture-patterns** | `.claude/skills/agent-architecture-patterns/SKILL.md` | オーケストレーター・ワーカー、ハブアンドスポーク、パイプライン、ステートマシンパターン |
  | **agent-structure-design** | `.claude/skills/agent-structure-design/SKILL.md` | YAML Frontmatter設計、システムプロンプト構造、5段階ワークフロー設計 |
  | **agent-dependency-design** | `.claude/skills/agent-dependency-design/SKILL.md` | スキル依存、エージェント依存、ハンドオフプロトコル、循環依存検出 |
  | **agent-quality-standards** | `.claude/skills/agent-quality-standards/SKILL.md` | 5カテゴリ品質基準（構造、設計原則、セキュリティ、ドキュメンテーション、統合） |
  | **agent-validation-testing** | `.claude/skills/agent-validation-testing/SKILL.md` | 正常系・エッジケース・異常系テスト、YAML/Markdown構文検証 |
  | **agent-template-patterns** | `.claude/skills/agent-template-patterns/SKILL.md` | 再利用可能エージェントテンプレート、変数設計、インスタンス化スクリプト |
  | **project-architecture-integration** | `.claude/skills/project-architecture-integration/SKILL.md` | ハイブリッドアーキテクチャ（shared/features）、データベース設計、REST API |
  | **agent-persona-design** | `.claude/skills/agent-persona-design/SKILL.md` | ペルソナ定義、役割の明確化、制約設定 |
  | **tool-permission-management** | `.claude/skills/tool-permission-management/SKILL.md` | 最小権限、ツールアクセス制御 |
  | **multi-agent-systems** | `.claude/skills/multi-agent-systems/SKILL.md` | エージェント間協調、メッセージパッシング |
  | **prompt-engineering-for-agents** | `.claude/skills/prompt-engineering-for-agents/SKILL.md` | System Prompt、Few-Shot Examples |
  | **agent-lifecycle-management** | `.claude/skills/agent-lifecycle-management/SKILL.md` | 起動、実行、終了、状態管理 |
"""

@.claude/skills/skill_list.md
"""
## 33. メタ・エージェント設計者

- **エージェント名:** `@meta-agent-designer`
- **エージェントの配置:** `.claude/agents/meta-agent-designer.md`

```markdown
- **必要なスキル**:

  | スキル名 | パス | 概要 |
  |---------|------|------|
  | **agent-architecture-patterns** | `.claude/skills/agent-architecture-patterns/SKILL.md` | オーケストレーター・ワーカー、ハブアンドスポーク、パイプライン、ステートマシンパターン |
  | **agent-structure-design** | `.claude/skills/agent-structure-design/SKILL.md` | YAML Frontmatter設計、システムプロンプト構造、5段階ワークフロー設計 |
  | **agent-dependency-design** | `.claude/skills/agent-dependency-design/SKILL.md` | スキル依存、エージェント依存、ハンドオフプロトコル、循環依存検出 |
  | **agent-quality-standards** | `.claude/skills/agent-quality-standards/SKILL.md` | 5カテゴリ品質基準（構造、設計原則、セキュリティ、ドキュメンテーション、統合） |
  | **agent-validation-testing** | `.claude/skills/agent-validation-testing/SKILL.md` | 正常系・エッジケース・異常系テスト、YAML/Markdown構文検証 |
  | **agent-template-patterns** | `.claude/skills/agent-template-patterns/SKILL.md` | 再利用可能エージェントテンプレート、変数設計、インスタンス化スクリプト |
  | **project-architecture-integration** | `.claude/skills/project-architecture-integration/SKILL.md` | ハイブリッドアーキテクチャ（shared/features）、データベース設計、REST API |
  | **agent-persona-design** | `.claude/skills/agent-persona-design/SKILL.md` | ペルソナ定義、役割の明確化、制約設定 |
  | **tool-permission-management** | `.claude/skills/tool-permission-management/SKILL.md` | 最小権限、ツールアクセス制御 |
  | **multi-agent-systems** | `.claude/skills/multi-agent-systems/SKILL.md` | エージェント間協調、メッセージパッシング |
  | **prompt-engineering-for-agents** | `.claude/skills/prompt-engineering-for-agents/SKILL.md` | System Prompt、Few-Shot Examples |
  | **agent-lifecycle-management** | `.claude/skills/agent-lifecycle-management/SKILL.md` | 起動、実行、終了、状態管理 |
```
"""

ステップバイステップで一つ一つ確実に実行してスキルとエージェントを作成してください。