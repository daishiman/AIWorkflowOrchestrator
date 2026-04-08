# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 10                              |
| Phase名    | 最終レビューゲート              |
| 前提Phase  | Phase 9                         |
| 後続Phase  | Phase 11                        |
| ステータス | 未実施                          |
| 作成日     | 2026-04-08                      |
| 機能名     | skill-wizard-runtime-validation |

---

## 目的

受入基準 AC-1〜AC-5 を全て確認し、実装の品質・設計・命名・責務境界が
プロジェクト標準を満たしていることを判定する。
全項目PASSの場合のみ Phase 11 へ進む。

---

## 実行タスク

### タスク1: AC-1〜AC-5 の検証

**目的**: 受入基準が全て実装により充足されていることを最終確認する

**実行手順**:

1. `outputs/phase-9/quality-check-result.md` を読み込む
2. 各ACの達成状況を以下のテーブルに記録する
3. 結果を `outputs/phase-10/ac-verification.md` に出力する

| AC番号 | 基準                                                                       | 検証エビデンス         | 判定 |
| ------ | -------------------------------------------------------------------------- | ---------------------- | ---- |
| AC-1   | `skillName` が空白のみの場合、バリデーションエラーが返される               | テスト結果（テスト名） |      |
| AC-2   | `purpose` が最小文字数（10文字）未満の場合、バリデーションエラーが返される | テスト結果（テスト名） |      |
| AC-3   | バリデーション関数のユニットテストが実装され PASS する                     | `pnpm test` 全件PASS   |      |
| AC-4   | バリデーションエラーメッセージが日本語で定義されている                     | コードレビュー結果     |      |
| AC-5   | `pnpm --filter @repo/shared typecheck` が通る                              | typecheck 0エラー      |      |

**期待成果物**: `outputs/phase-10/ac-verification.md`

---

### タスク2: コードレビュー（インターフェース・命名・責務境界）

**目的**: 実装がプロジェクト標準の設計原則に準拠しているかを確認する

**実行手順**:

1. `packages/shared/src/types/skillInfoFormValidation.ts` を読み込む
2. `packages/shared/src/types/index.ts` を読み込み、公開エクスポートの整合を確認する
3. 以下のレビュー観点でチェックを実施する

**インターフェースレビュー**:

- [ ] フィールド結果型が `SkillInfoFieldValidationResult`（または同等の専用名）であり、`ValidationResult` 汎用名の衝突を回避していること
- [ ] フォーム結果型が `SkillInfoFormValidationResult`（または同等の専用名）であり、`isValid` を含む戻り値構造が明示されていること
- [ ] 入力型が `SkillInfoValidationInput`（または同等の専用名）であり、`category` を検証対象から除外していること
- [ ] `validateSkillName` 関数のシグネチャが設計書と一致すること
- [ ] `validatePurpose` 関数のシグネチャが設計書と一致すること
- [ ] `validateSkillInfoForm` 関数が対象フィールド（`skillName` / `purpose`）を全て検証していること

**命名レビュー**:

- [ ] 関数名が `validate*` プレフィックスで統一されていること
- [ ] エラーメッセージ定数が `SKILL_INFO_VALIDATION_MESSAGES` 等の SCREAMING_SNAKE_CASE であること
- [ ] 文字数制限が `SKILL_INFO_VALIDATION_LIMITS` に集約されていること
- [ ] 既存の `packages/shared/src/agent/validation.ts` の命名規則と整合していること

**責務境界レビュー**:

- [ ] バリデーション関数が副作用のないピュア関数であること
- [ ] UI コンポーネントへの依存が存在しないこと
- [ ] IPC ハンドラへの依存が存在しないこと
- [ ] `packages/shared` の外部依存が最小限であること
- [ ] `packages/shared/src/types/index.ts` の公開エクスポートが整合していること

**期待成果物**: `outputs/phase-10/final-review-result.md` に記録

---

### タスク3: 最終判定（PASS/MINOR/MAJOR/CRITICAL）

**目的**: タスク1・タスク2の結果を総合し、Phase 11 に進む可否を判定する

**実行手順**:

1. タスク1・タスク2 の結果を総合評価する
2. 以下の判定テーブルに基づき判定を行う
3. 判定結果と根拠を `outputs/phase-10/final-review-result.md` に記録する

---

## レビュー結果判定テーブル

| 判定     | 条件                                          | 次のアクション                     |
| -------- | --------------------------------------------- | ---------------------------------- |
| PASS     | AC-1〜AC-5 全て達成、コードレビュー全項目OK   | Phase 11 へ進行                    |
| MINOR    | AC 全達成、軽微な指摘あり（命名・コメント等） | 指摘を記録・対応後 Phase 11 へ進行 |
| MAJOR    | 1件以上のACが未達、または重大な設計問題あり   | 該当 Phase へ戻り再実装・再設計    |
| CRITICAL | 複数ACが未達、または責務境界に致命的問題あり  | Phase 1 へ戻りユーザーと要件再確認 |

---

## 戻り先決定基準テーブル

| 問題種別                              | 戻り先     | 理由                       |
| ------------------------------------- | ---------- | -------------------------- |
| AC-1 未達（空白チェック未実装）       | Phase 4〜8 | テスト・実装フェーズで修正 |
| AC-2 未達（最小文字数チェック未実装） | Phase 4〜8 | テスト・実装フェーズで修正 |
| AC-4 未達（エラーメッセージが英語）   | Phase 8    | 実装フェーズで定数を修正   |
| AC-5 未達（型エラーあり）             | Phase 8    | 実装フェーズで型定義を修正 |
| インターフェース設計に問題あり        | Phase 2〜3 | 設計フェーズで再設計       |
| 責務境界に致命的問題あり              | Phase 1    | 要件・スコープを再確認     |

---

## 参照資料

| 資料名                     | パス                                                                  | 説明                |
| -------------------------- | --------------------------------------------------------------------- | ------------------- |
| 品質チェック結果           | `outputs/phase-9/quality-check-result.md`                             | Phase 9 の検証結果  |
| バリデーション実装ファイル | `packages/shared/src/types/skillInfoFormValidation.ts`                | レビュー対象コード  |
| 公開エクスポート           | `packages/shared/src/types/index.ts`                                  | 公開APIの整合確認   |
| テストファイル             | `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | テスト内容確認      |
| 受入基準                   | `outputs/phase-1/acceptance-criteria.md`                              | AC-1〜AC-5 の定義元 |
| 設計決定書                 | `outputs/phase-2/design-decisions.md`                                 | 設計の根拠・判断    |
| P50チェック結果            | `outputs/phase-1/p50-check-result.md`                                 | Phase 1 成果物      |
| スコープ定義書             | `outputs/phase-1/scope-definition.md`                                 | Phase 1 成果物      |
| バリデーションI/F設計      | `outputs/phase-2/validation-interface.md`                             | Phase 2 成果物      |
| エラーメッセージ設計       | `outputs/phase-2/error-messages.md`                                   | Phase 2 成果物      |
| 実装結果記録               | `outputs/phase-5/implementation-result.md`                            | Phase 5 成果物      |
| Green確認記録              | `outputs/phase-5/green-confirmation.md`                               | Phase 5 成果物      |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`                                  | Phase 7 成果物      |
| リファクタリング結果       | `outputs/phase-8/refactoring-result.md`                               | Phase 8 成果物      |

---

## 成果物

| 成果物             | 配置先                                    | 形式     |
| ------------------ | ----------------------------------------- | -------- |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md` | Markdown |
| AC検証ドキュメント | `outputs/phase-10/ac-verification.md`     | Markdown |

---

## 統合テスト連携

- `final-review-result.md` と `ac-verification.md` の判定は Phase 11 の手動テスト入力として渡す
- 受入基準で残った不一致は Phase 12 の未タスク検出で formalize する
- Phase 10 までの current facts は Phase 12 の system spec 更新へそのまま引き継ぐ

## 完了条件

- [ ] AC-1〜AC-5 の検証が完了し、`outputs/phase-10/ac-verification.md` に記録されていること
- [ ] コードレビュー（インターフェース・命名・責務境界）が全項目実施済みであること
- [ ] 最終判定（PASS/MINOR/MAJOR/CRITICAL）が `outputs/phase-10/final-review-result.md` に記録されていること
- [ ] PASS または MINOR（対応済み）の場合のみ Phase 11 へ進むこと
- [ ] MAJOR/CRITICAL の場合は戻り先決定基準テーブルに従い該当 Phase へ戻ること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜3）を100%実行完了
- [ ] 各タスクの実行結果を成果物として出力
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 9（品質保証）が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-wizard-runtime-validation/phase-11-manual-test.md`
