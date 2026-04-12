# UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001         |
| タイトル   | ConversationRoundStep semantic default 入力元拡張対応      |
| 作成日     | 2026-04-11                                                 |
| ステータス | spec_created                                               |
| 総Phase数  | 13                                                         |
| タスク種別 | リファクタリング（NON_VISUAL）                             |
| 規模       | small                                                      |
| 優先度     | medium                                                     |
| 前提タスク | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001（完了済み） |
| Issue      | #2042                                                      |

---

## 背景・課題

`ConversationRoundStep.tsx` の `applySmartDefaults()` は `inferSmartDefaults()` から返される
semantic default 値を UI ラベルへ正規化する純粋関数として実装された。
現在は q1-q6 の固定変換テーブル（`resolveSemanticLabel`）が定義されているが、
将来的に入力元が増える場合、変換テーブルの追加・更新が分散しやすい。

**問題点:**

- `resolveSemanticLabel()` の変換テーブルが `ConversationRoundStep.tsx` にハードコード
- 入力元（semantic defaults のプロバイダ）が増えた際に変換テーブルの管理が困難
- q5（共有ターゲット）と q6（実行頻度）の正規化ルールが暗黙的で文書化不十分

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## スコープ

### 含む

- `resolveSemanticLabel()` のリファクタリング（設定テーブル外部化 / option registry パターン）
- `packages/shared/src/types/skill-wizard-label-map.ts` 新規作成（`QuestionSemanticLabelMap` 型と正準マッピング定数）
- `ConversationRoundStep.tsx` の `resolveSemanticLabel()` を shared マッピング参照に変更
- `applySmartDefaults()` のユニットテスト強化（10件以上のバリエーション）
- `outputs/phase-3/design-decisions.md` に正準形マッピング表を追記

### 含まない

- `inferSmartDefaults()` 本体の変更
- 新しい semantic default プロバイダの実装
- UI の見た目変更（NON_VISUAL タスク）

---

## 受け入れ基準

| ID   | 基準                                                                                | 検証方法              |
| ---- | ----------------------------------------------------------------------------------- | --------------------- |
| AC-1 | `QuestionSemanticLabelMap` 型が `@repo/shared` からエクスポートされる               | TypeScript 型チェック |
| AC-2 | `resolveSemanticLabel()` が shared マッピングを参照する                             | コードレビュー        |
| AC-3 | `applySmartDefaults()` のテストが10件以上存在し全件 PASS                            | `pnpm test` PASS      |
| AC-4 | 変換ルールの正準形対応表が `outputs/phase-3/design-decisions.md` に文書化されている | ドキュメント確認      |
| AC-5 | 既存の動作が変わらないことを回帰テストで確認できる                                  | vitest 全 PASS        |

---

## 主要対象ファイル

| ファイル                                                                      | 変更種別 | 説明                                  |
| ----------------------------------------------------------------------------- | -------- | ------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 修正     | resolveSemanticLabel を shared 参照へ |
| `packages/shared/src/types/skill-wizard-label-map.ts`                         | 新規     | QuestionSemanticLabelMap 型定義       |
| `packages/shared/index.ts` (または barrel)                                    | 修正     | 新型のエクスポート追加                |
| `outputs/phase-3/design-decisions.md`                                         | 修正     | 正準形マッピング表追記                |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-skill-wizard-semantic-default-extensibility-001 \
  --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物一覧

| Phase | 主要成果物                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, 仕様抽出結果, 差分カバレッジ, トレーサビリティ行列                                        |
| 2     | アーキテクチャ設計, 型設計書, テスト戦略, 依存整合マトリクス                                                        |
| 3     | 設計レビュー結果, ゲート判定, 矛盾チェック表                                                                        |
| 4     | テスト仕様書, Red結果, 統合テスト計画                                                                               |
| 5     | 実装サマリー, 変更ファイル一覧, 契約差分                                                                            |
| 6     | 拡張テストケース, 回帰テスト結果, 異常系結果                                                                        |
| 7     | カバレッジ計画, 未到達分析, トレーサビリティ網羅率                                                                  |
| 8     | リファクタ計画, 再テスト計画, 責務境界マップ                                                                        |
| 9     | 品質レポート, リスク台帳, 因果ループ監査                                                                            |
| 10    | 最終レビュー結果, 是正計画, 出荷準備チェック                                                                        |
| 11    | 手動テスト結果（NON_VISUAL）, 証跡インデックス, スクリーンショット計画                                              |
| 12    | 実装ガイド, 仕様更新サマリー, 更新履歴, 未タスク検出, スキルフィードバック, `phase12-task-spec-compliance-check.md` |
| 13    | PR（ユーザー承認後のみ）                                                                                            |

---

## 苦戦箇所（前タスクからの知見）

- **silent mismatch**: `inferSmartDefaults()` が `"自分だけ"` を返すが UI ラベルは `"自分のみ"` — 変換テーブルがないと黙って不一致になる
- **変換テーブル分散**: 同一変換を別コンポーネントが再実装するリスク → shared パッケージに集約が必要
- **成果物整合**: shared 型定義の変更は型定義→テスト→ドキュメントの順で修正すること
- **境界値テスト**: テスト文字列の `.length` は日本語漢数字表記の意味と一致しない（Feedback W0-RV-001）
