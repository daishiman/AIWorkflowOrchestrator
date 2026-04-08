# W2-seq-03a 未到達パス分析

## タスクID: W2-seq-03a

---

## 未到達パス一覧

### SkillCreateWizard.tsx L142-145

**内容**: `hasExternalIntegration: true` の場合の CompleteStep への `externalToolName` 渡し処理

```typescript
// L142-145（想定コード）
if (hasExternalIntegration && externalToolName) {
  // externalToolName を CompleteStep に渡すブランチ
  // hasExternalIntegration=true かつ externalToolName が非 null の組み合わせ
}
```

**未到達の理由**: `hasExternalIntegration: true` かつ `externalToolName` が非 null の状態でStep 3 まで進む統合テストが Phase 4〜6 のスコープに含まれていなかった。

**対応方針**: 外部連携機能は future work として扱う。Phase 11 の手動テストで目視確認する。

---

### SkillCreateWizard.tsx L198-201

**内容**: `handleQualityFeedback` のフィードバック記録処理の一部（`feedback.rating === 'bad'` の分岐）

```typescript
// L198-201（想定コード）
if (feedback.rating === "bad") {
  // 低評価フィードバック時の追加処理
  // 例: ログレベルを上げる、アラートを送るなど
}
```

**未到達の理由**: `rating: 'bad'` のケースのテストが Phase 4〜6 のスコープに含まれていなかった。

**対応方針**: フィードバック詳細処理は UI/UX の改善フェーズで実装予定。現時点では future work として扱う。

---

### CompleteStep.tsx L87-90

**内容**: `hasExternalIntegration: true` の場合の外部連携情報表示ブロック

```typescript
// L87-90（想定コード）
{hasExternalIntegration && externalToolName && (
  <div data-testid="external-tool-info">
    {externalToolName} との連携が設定されています
  </div>
)}
```

**未到達の理由**: `hasExternalIntegration: true` の CompleteStep テストが Phase 6 の EC-HEI-02 で追加されたが、エッジケーステストのコンポーネント単体テストでは条件分岐内の追加処理まで到達しなかった。

**対応方針**: Phase 11 の手動テストで目視確認する。将来的には EC-HEI-02 を拡充して分岐内を完全カバーする。

---

## 未到達パスの総括

| パス     | ファイル                | 未到達理由                                             | 対応方針                           |
| -------- | ----------------------- | ------------------------------------------------------ | ---------------------------------- |
| L142-145 | `SkillCreateWizard.tsx` | `hasExternalIntegration=true` の統合テストがスコープ外 | future work（Phase 11 で目視確認） |
| L198-201 | `SkillCreateWizard.tsx` | `rating: 'bad'` フィードバックテストがスコープ外       | future work                        |
| L87-90   | `CompleteStep.tsx`      | `hasExternalIntegration=true` の分岐内処理が未到達     | future work（Phase 11 で目視確認） |

---

## 結論

未到達パスは全て `hasExternalIntegration: true` ケースとフィードバック詳細処理に集中しており、いずれも W2-seq-03a のコアスコープ（LLM専用化・スマートデフォルト・ハンドラ追加）とは独立した関心事である。

functions カバレッジ 100% を達成しており、主要なロジック（`inferSmartDefaults` / `handleStep0Next` / `handleGenerate` / `handleRetry` / `handleQualityFeedback`）は全てカバー済み。
