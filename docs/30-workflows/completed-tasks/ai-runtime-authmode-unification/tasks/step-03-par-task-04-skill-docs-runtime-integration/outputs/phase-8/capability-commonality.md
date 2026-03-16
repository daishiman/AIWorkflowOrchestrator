# Phase 8 T-8-5: Capability チェックの共通化可能性評価

## メタ情報

| 項目   | 内容                                             |
| ------ | ------------------------------------------------ |
| タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 Phase 8 T-8-5 |
| 評価日 | 2026-03-16                                       |

---

## 評価対象

`SkillDocsCapabilityResolver.resolve()` の判定パターンが、他の surface（Chat Edit, RAG, Slide AI）と共有可能かを評価する。

---

## 現在の実装パターン

```typescript
// SkillDocsCapabilityResolver.ts
async resolve(): Promise<SkillDocsCapabilityResult> {
  if (!(await this.adapter.isAvailable())) {
    return {
      capability: "guidance-only",
      guidance: "設定画面から API key を設定してください",
    };
  }
  return {
    capability: "integrated-api",
    provider: this.adapter.getProviderName(),
  };
}
```

**判定ロジック:** `await ILLMDocQueryAdapter.isAvailable()` の結果を 2 パス（`guidance-only` / `integrated-api`）に振り分ける。

---

## 他 Surface との比較

| Surface             | タスク             | API key 判定                             | Capability パス                |
| ------------------- | ------------------ | ---------------------------------------- | ------------------------------ |
| Skill Docs          | TASK-04 (本タスク) | `await LLMDocQueryAdapter.isAvailable()` | guidance-only / integrated-api |
| Workspace Chat Edit | TASK-02            | runtime の authMode 参照                 | 実装タスク別                   |
| Main Chat Settings  | TASK-06            | runtime の authMode 参照                 | 実装タスク別                   |
| RAG Embedding       | TASK-08            | プロバイダ設定参照                       | 実装タスク別                   |
| Slide AI            | TASK-09            | プロバイダ設定参照                       | 実装タスク別                   |

---

## 共通化の可能性評価

### 共通化できる部分

**API key 有効性の確認という概念** は他 surface でも必要だが、以下の理由で抽象化が困難:

1. **判定基準が異なる**: Skill Docs は `await LLMDocQueryAdapter.isAvailable()` を使用。他 surface は Zustand Store の `authMode` / `runtime` 設定を参照する
2. **戻り値の型が異なる**: `SkillDocsCapabilityResult` は Skill Docs 専用の型。Chat Edit は `ChatEditCapabilityResult`（別型）
3. **guidance メッセージが異なる**: surface ごとに適切なガイダンス文が必要

### 将来的な共通化の方向性

もし複数 surface で同一パターンが多発した場合、以下のアーキテクチャを検討できる:

```typescript
// 将来の共通インターフェース（現段階では不要）
interface ICapabilityResolver<T> {
  resolve(): T;
}

// 共通ベースクラス（将来）
abstract class BaseCapabilityResolver<T> implements ICapabilityResolver<T> {
  protected abstract checkAvailability(): boolean;
  protected abstract buildAvailableResult(): T;
  protected abstract buildUnavailableResult(): T;

  resolve(): T {
    return this.checkAvailability()
      ? this.buildAvailableResult()
      : this.buildUnavailableResult();
  }
}
```

---

## 判断: 現段階での共通化は不要

**根拠:**

1. **実装数が少ない（1件のみ）**: `SkillDocsCapabilityResolver` の実装が1件の段階で共通基底クラスを作成するのは時期尚早（YAGNI 原則）
2. **判定基準が surface ごとに異なる**: API key チェック / authMode チェック / runtime チェックが混在しており、統一的な抽象化が難しい
3. **型定義が surface 固有**: `SkillDocsCapabilityResult` 型は Skill Docs 専用で定義されており、共通化するには型設計の再検討が必要
4. **32行のシンプルな実装**: `SkillDocsCapabilityResolver` はすでに十分シンプルで、共通化による恩恵が小さい

**結論:** 他 surface で同様のリゾルバが2件以上実装された時点で共通基底クラスの導入を再評価する。現段階では `SkillDocsCapabilityResolver` を独立したクラスとして維持する。

---

## 未タスク候補

将来の共通化検討のために以下を記録する（現段階では着手不要）:

| 候補タスク                        | トリガー条件                                   | 優先度 |
| --------------------------------- | ---------------------------------------------- | ------ |
| CapabilityResolver 基底クラス導入 | 他 surface で 2 件以上の同様実装が完成した時点 | LOW    |
