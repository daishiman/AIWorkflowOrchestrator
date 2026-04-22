# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 12                                                  |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| 前提Phase  | Phase 11                                            |
| 後続Phase  | Phase 13                                            |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |

## 目的

以下の5タスクを全て完了させ、実装ガイド・仕様同期・未タスク・フィードバックを記録する。

| タスク | 名称                         | 必須 |
| ------ | ---------------------------- | ---- |
| T1     | 実装ガイド作成               | 必須 |
| T2     | システム仕様書更新           | 必須 |
| T3     | ドキュメント更新履歴作成     | 必須 |
| T4     | 未タスク検出レポート作成     | 必須 |
| T5     | スキルフィードバックレポート | 必須 |

## T1: 実装ガイド作成

### Part 1: 中学生レベルの概念説明

**EVALS.json のバリデーションとは何か？**

料理レシピを想像してください。レシピには「材料リスト」が書いてあります。
もし材料リストが**白紙**だったり、**読めない文字**で書かれていたり、「砂糖」の代わりに「◯◯」と書かれていたりすると、そのレシピは使えませんよね。

`EVALS.json` は、AIスキルの「材料リスト（評価項目リスト）」に相当します。
今回の変更前は「材料リストがそのファイルに入っているか（ファイルが存在するか・大きさがあるか）」だけを確認していました。
今回の変更後は「**材料リストの中身が正しく書かれているか**」まで確認するようになりました。

- 白紙のレシピ（`{}`）→ バリデーション失敗
- 読めない文字（破損 JSON）→ パースエラーとして報告
- 必要な項目が書かれていない（必須キー欠落）→ バリデーション失敗
- 英語表記（camelCase）でも日本語表記（snake_case）でも両方OK

これにより、壊れた EVALS.json を持つスキルが「正常なスキル」として扱われるバグが修正されます。

### Part 2: 技術者向け詳細

#### 変更対象ファイル

- `apps/desktop/src/main/services/skill/SkillScanner.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`

#### TypeScript 型定義の変更

```typescript
// 変更前: EVALS.json はファイル存在・サイズのみで判定
interface SkillScanResult {
  hasEvals: boolean; // 存在 + サイズチェックのみ
}

// 変更後: バリデーション結果を含む型
type EvalsValidationStatus =
  | { valid: true }
  | { valid: false; reason: "empty" | "parse-error" | "missing-required-keys" };

interface SkillScanResult {
  hasEvals: boolean;
  evalsValidation?: EvalsValidationStatus; // コンテンツバリデーション結果
}
```

#### バリデーションフック API シグネチャ

```typescript
// SkillScanner.ts 内部バリデーション関数
function validateEvalsContent(
  filePath: string,
  rawContent: string,
): EvalsValidationStatus;
```

#### camelCase / snake_case 許容ポリシー

```typescript
// SkillScanner.ts 内コメント（方針明文化）
// POLICY: EVALS.json のキー命名規則
// - camelCase（例: evalName, testCases）: 許容
// - snake_case（例: eval_name, test_cases）: 許容
// 理由: 既存スキルフィクスチャに snake_case が混在しているため、
//       移行完了まで両言語を受け入れる。
//       将来的には camelCase に統一予定（Issue: TODO）
```

#### エラーハンドリング方針

| ケース       | 処理                               | 戻り値                                              |
| ------------ | ---------------------------------- | --------------------------------------------------- |
| 空 `{}`      | 必須キー欠落チェックで検出         | `{ valid: false, reason: 'empty' }`                 |
| 破損 JSON    | try/catch でパースエラーをキャッチ | `{ valid: false, reason: 'parse-error' }`           |
| 必須キー欠落 | キー存在チェックで検出             | `{ valid: false, reason: 'missing-required-keys' }` |
| 正常         | バリデーション通過                 | `{ valid: true }`                                   |

## T2: システム仕様書更新

### 更新対象

`aiworkflow-requirements` スキル経由で以下の仕様を更新する。

| ドキュメント            | 更新内容                                      | 優先度 |
| ----------------------- | --------------------------------------------- | ------ |
| SkillScanner 設計仕様   | EVALS.json コンテンツバリデーション追加の記述 | 必須   |
| EVALS.json スキーマ仕様 | camelCase/snake_case 両許容ポリシーの明記     | 必須   |
| SkillScanner テスト仕様 | 新規テストケース（破損 EVALS）の仕様追記      | 推奨   |

### 仕様書更新手順

```bash
# search-spec.js を使って関連仕様を検索・更新
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js \
  --query "SkillScanner EVALS validation" \
  --update

# 更新後の整合性確認
node .claude/skills/aiworkflow-requirements/scripts/validate-spec.js
```

## T3: ドキュメント更新履歴作成

変更内容の記録として以下を `outputs/phase-12/documentation-changelog.md` に記録する。

| 日付       | 変更種別 | 対象ファイル                       | 変更概要                                                |
| ---------- | -------- | ---------------------------------- | ------------------------------------------------------- |
| 2026-04-21 | feat     | `SkillScanner.ts`                  | EVALS.json コンテンツバリデーションフック追加           |
| 2026-04-21 | refactor | `SkillScanner.ts`                  | `SkillScanResult` 型に `evalsValidation` フィールド追加 |
| 2026-04-21 | test     | `SkillScanner.test.ts`             | 既存3テストの契約更新 + 破損 EVALS 新規ケース追加       |
| 2026-04-21 | docs     | `SkillScanner.ts` コード内コメント | camelCase/snake_case 両許容ポリシーの明文化             |

## T4: 未タスク検出レポート作成

本タスク実施中に発見された未対応事項を記録する（0件でも出力必須）。

### 検出ルール

以下に該当する事項は未タスクとして記録する。

- 本タスクのスコープ外と判断して対応しなかった問題
- 将来的に対応が必要と判断した技術的負債
- 依存タスク（UNASSIGNED-EVALS-VALIDATOR-GUARD-001）との調整が必要な事項

### 未タスク候補（実施後に更新）

| ID  | 発見箇所 | 内容                                                | 優先度 |
| --- | -------- | --------------------------------------------------- | ------ |
| -   | -        | （実施後に記入。0件の場合は「未タスクなし」と記載） | -      |

出力先: `outputs/phase-12/unassigned-task-detection-report.md`

## T5: スキルフィードバックレポート作成

本タスクを通じて得られた改善提案を記録する（改善点なしでも出力必須）。

### フィードバック観点

| 観点                       | 確認内容                                                  |
| -------------------------- | --------------------------------------------------------- |
| task-specification-creator | Phase 仕様書の記述粒度・網羅性は適切だったか              |
| 実装フロー                 | Phase 1〜9 の順序・依存関係は実装に適していたか           |
| テスト設計                 | 破損 EVALS のテストケース設計は仕様書の段階で明確だったか |
| スコープ定義               | 対象外（fixture 移行・UI 変更）の明示は適切だったか       |

出力先: `outputs/phase-12/skill-feedback-report.md`

## NON_VISUAL タスク宣言

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要

## 参照資料

| 資料名         | パス                                        | 用途            |
| -------------- | ------------------------------------------- | --------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`    | Phase 11 成果物 |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物  |
| 品質レポート   | `outputs/phase-9/quality-report.md`         | Phase 9 成果物  |

## 成果物

| 成果物               | パス                                                   | 説明                                   |
| -------------------- | ------------------------------------------------------ | -------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`             | Part 1（概念説明）+ Part 2（技術詳細） |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`              | システム仕様書更新内容と影響範囲       |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`          | ドキュメント変更の記録                 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection-report.md` | 発見された未対応事項（0件でも出力）    |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`            | 改善提案（改善点なしでも出力）         |
| Task2 実行ログ       | `outputs/phase-12/spec-update-task2-log.md`            | search-spec.js 実行結果ログ            |

## 完了条件

- [ ] T1: 実装ガイド（Part 1 中学生レベル + Part 2 技術詳細）を作成した
- [ ] T2: システム仕様書（SkillScanner 関連）を更新した
- [ ] T3: ドキュメント更新履歴を作成した
- [ ] T4: 未タスク検出レポートを作成した（0件でも出力）
- [ ] T5: スキルフィードバックレポートを作成した（改善点なしでも出力）
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（T1〜T5）を100%実行完了
- [ ] 受け入れ基準 AC-1〜AC-10 全 PASS 確認
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 13: PR 作成
