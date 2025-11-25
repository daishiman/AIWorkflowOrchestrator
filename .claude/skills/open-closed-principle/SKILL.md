---
name: open-closed-principle
description: |
  SOLID原則の開放閉鎖原則（OCP）を専門とするスキル。
  Robert C. Martinの『アジャイルソフトウェア開発の奥義』に基づき、
  拡張に開かれ、修正に閉じた設計を提供します。

  専門分野:
  - OCP原則: 拡張と修正の分離
  - Strategy: 振る舞いの動的交換
  - Template Method: アルゴリズムの骨格定義
  - Plugin Architecture: 拡張ポイントの設計

  使用タイミング:
  - 新しいワークフロータイプの追加が必要な時
  - 既存コードを修正せずに機能拡張したい時
  - 拡張ポイントを設計する時
  - レガシーコードをOCP準拠にリファクタリングする時

  Use proactively when designing extension points, adding workflow types,
  or refactoring for better extensibility.
version: 1.0.0
---

# Open-Closed Principle (OCP)

## 概要

このスキルは、SOLID原則の一つである開放閉鎖原則（OCP）に関する知識を提供します。

**OCPの定義**: ソフトウェアのエンティティ（クラス、モジュール、関数など）は、拡張に対して開いていて、修正に対して閉じているべきである。

**主要な価値**:
- 既存コードの安定性維持
- 新機能追加の容易性
- リグレッションリスクの低減

**対象ユーザー**:
- ワークフローエンジンの拡張ポイントを設計するエージェント
- 既存システムに新機能を追加する開発者
- レガシーコードをリファクタリングするチーム

## リソース構造

```
open-closed-principle/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── ocp-fundamentals.md                     # OCP原則の基本
│   ├── extension-mechanisms.md                 # 拡張メカニズム
│   ├── ocp-patterns.md                         # OCP準拠パターン
│   └── refactoring-to-ocp.md                   # OCPへのリファクタリング
├── scripts/
│   └── analyze-extensibility.mjs               # 拡張性分析スクリプト
└── templates/
    └── extension-point-template.md             # 拡張ポイントテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# OCP原則の基本
cat .claude/skills/open-closed-principle/resources/ocp-fundamentals.md

# 拡張メカニズム
cat .claude/skills/open-closed-principle/resources/extension-mechanisms.md

# OCP準拠パターン
cat .claude/skills/open-closed-principle/resources/ocp-patterns.md

# OCPへのリファクタリング
cat .claude/skills/open-closed-principle/resources/refactoring-to-ocp.md
```

### スクリプト実行

```bash
# 拡張性分析
node .claude/skills/open-closed-principle/scripts/analyze-extensibility.mjs <file.ts>
```

### テンプレート参照

```bash
# 拡張ポイントテンプレート
cat .claude/skills/open-closed-principle/templates/extension-point-template.md
```

---

## 核心知識

### 1. OCP原則の本質

**問題**: 変更のたびに既存コードを修正

```
# 悪い例: 新しいタイプを追加するたびに修正が必要
WorkflowEngine:
  execute(workflow: Workflow):
    switch (workflow.type):
      case 'AI_ANALYSIS':
        return this.executeAIAnalysis(workflow)
      case 'DATA_TRANSFORM':
        return this.executeDataTransform(workflow)
      # 新しいタイプを追加 → ここを修正
      case 'NEW_TYPE':
        return this.executeNewType(workflow)
```

**解決**: 拡張に開き、修正に閉じる

```
# 良い例: 新しいタイプは登録するだけ
WorkflowEngine:
  private executors: Map<string, IWorkflowExecutor>

  registerExecutor(executor: IWorkflowExecutor):
    this.executors.set(executor.type, executor)

  execute(workflow: Workflow):
    executor = this.executors.get(workflow.type)
    if (!executor):
      throw new UnknownTypeError(workflow.type)
    return executor.execute(workflow.input, context)

# 新しいタイプの追加（既存コードを修正しない）
engine.registerExecutor(new NewTypeExecutor())
```

### 2. 拡張メカニズム

| メカニズム | 説明 | 使用場面 |
|-----------|------|---------|
| **Strategy** | 振る舞いを動的に交換 | アルゴリズムの切り替え |
| **Template Method** | アルゴリズムの骨格を定義 | 処理フローの共通化 |
| **Plugin/Registry** | 動的な機能追加 | プラグインシステム |
| **Decorator** | 機能の動的追加 | 横断的関心事 |
| **Abstract Factory** | オブジェクトファミリーの生成 | 製品バリエーション |

### 3. ワークフローエンジンでのOCP適用

**拡張ポイントの設計**:

```
# 拡張ポイント1: Executor登録
IWorkflowExecutor:
  + readonly type: string
  + execute(input, context): Promise<Output>

WorkflowRegistry:
  + register(executor: IWorkflowExecutor): void  # 拡張ポイント
  + create(type: string): IWorkflowExecutor

# 拡張ポイント2: ミドルウェア/インターセプター
IExecutionMiddleware:
  + execute(input, context, next): Promise<Output>

MiddlewareChain:
  + use(middleware: IExecutionMiddleware): void  # 拡張ポイント
  + execute(input, context): Promise<Output>

# 拡張ポイント3: イベントフック
IWorkflowHook:
  + onBeforeExecute?(context): void
  + onAfterExecute?(result, context): void
  + onError?(error, context): void

HookRegistry:
  + register(hook: IWorkflowHook): void  # 拡張ポイント
```

**新しいワークフロータイプの追加**:

```
# 既存コードを修正せずに新しいタイプを追加

# 1. 新しいExecutorを作成
NotificationExecutor implements IWorkflowExecutor:
  readonly type = 'NOTIFICATION'
  readonly displayName = '通知'

  execute(input, context):
    # 実装

# 2. レジストリに登録
registry.register(new NotificationExecutor())

# 完了！WorkflowEngineのコードは一切変更なし
```

### 4. OCP違反の兆候

| 兆候 | 説明 |
|------|------|
| **長いswitch文** | 新しいケースを追加するたびに修正 |
| **if-elseチェーン** | 条件分岐の追加で既存コードを変更 |
| **型チェック** | instanceof/typeofによる分岐 |
| **フラグパラメータ** | ブール値で振る舞いを切り替え |
| **頻繁な修正** | 機能追加で既存ファイルを頻繁に変更 |

---

## 実装ワークフロー

### Phase 1: 変動点の特定

1. 頻繁に変更される部分を特定
2. 将来の変更可能性を評価
3. 拡張ポイントを設計

**判断基準**:
- [ ] 新しい機能タイプは追加される可能性があるか？
- [ ] アルゴリズムは交換される可能性があるか？
- [ ] 外部システムの統合は増える可能性があるか？

### Phase 2: 抽象化の導入

1. 安定した抽象（インターフェース）を定義
2. 変動する部分を抽象に依存させる
3. 具体的な実装を分離

**判断基準**:
- [ ] インターフェースは安定しているか？
- [ ] 実装の詳細は隠蔽されているか？
- [ ] 新しい実装の追加は容易か？

### Phase 3: 拡張メカニズムの実装

1. 適切なパターンを選択（Strategy/Template/Plugin）
2. 登録/解決メカニズムを実装
3. 拡張APIを提供

**判断基準**:
- [ ] 拡張方法は明確か？
- [ ] 既存コードの修正なしに拡張できるか？
- [ ] 拡張のドキュメントは十分か？

### Phase 4: 検証

1. 新機能追加のシミュレーション
2. 既存コードへの影響確認
3. テストの実施

**判断基準**:
- [ ] 新機能追加で既存ファイルの変更は最小限か？
- [ ] リグレッションテストはパスするか？
- [ ] 拡張ポイントは適切に機能するか？

---

## アンチパターン

### 1. 早すぎる抽象化

```
# 悪い例: 1つの実装しかないのに抽象化
IUserRepository:
  + findById(id): User

# 実装は1つだけ
UserRepository implements IUserRepository

# 将来の拡張が明確でない場合は直接実装でOK
```

### 2. 過度な拡張ポイント

```
# 悪い例: すべてが拡張ポイント
IWorkflowExecutor:
  + type: ITypeProvider           # 過度
  + execute: IExecutionStrategy   # 過度
  + validate: IValidationStrategy # 過度
  + log: ILoggingStrategy         # 過度

# 良い例: 本当に変動する部分のみ
IWorkflowExecutor:
  + readonly type: string
  + execute(input, context): Promise<Output>
  + validate?(input): ValidationResult  # オプション
```

### 3. 抽象の漏れ

```
# 悪い例: 抽象が具体的な実装に依存
IWorkflowExecutor:
  + execute(input, context): Promise<Output>
  + getAIClient(): AIClient  # AIに依存 → 漏れ

# 良い例: 純粋な抽象
IWorkflowExecutor:
  + execute(input, context): Promise<Output>
  # AI依存はコンストラクタ注入で解決
```

---

## 関連スキル

- `.claude/skills/design-patterns-behavioral/SKILL.md`: Strategy, Template Method
- `.claude/skills/plugin-architecture/SKILL.md`: プラグインアーキテクチャ
- `.claude/skills/interface-segregation/SKILL.md`: ISP準拠設計
- `.claude/skills/factory-patterns/SKILL.md`: Factory実装

---

## 参考文献

- **『アジャイルソフトウェア開発の奥義』** Robert C. Martin著
- **『Clean Architecture』** Robert C. Martin著
- **『Design Patterns』** Erich Gamma他著

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース - OCP原則、拡張メカニズム、ワークフローエンジン適用 |
