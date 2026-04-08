# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 3                               |
| Phase名    | 設計レビューゲート              |
| 前提Phase  | Phase 2                         |
| 後続Phase  | Phase 4                         |
| ステータス | 未実施                          |
| 作成日     | 2026-04-08                      |
| 機能名     | skill-wizard-runtime-validation |

---

## 目的

Phase 2 の設計（インターフェース・エラーメッセージ・ファイル配置）が
受入基準を満たせる品質かを判定し、Phase 4 へ進めるか決定する。

---

## 実行タスク

### タスク1: 設計レビュー実施

**目的**: Phase 2 成果物を多角的にレビューする

**実行手順**:

1. `outputs/phase-2/design-decisions.md` を読み込む
2. `outputs/phase-2/validation-interface.md` を読み込む
3. `outputs/phase-2/error-messages.md` を読み込む
4. 以下のレビュー観点でチェックを実施する

---

### レビュー観点チェックリスト

#### 機能設計

- [ ] `skillName` が `undefined` / `null` の場合に valid を返す設計になっているか（任意フィールド）
- [ ] `skillName` が空白のみの文字列（例: `"   "`）の場合に invalid を返す設計になっているか
- [ ] `skillName` が最大100文字を超える場合に invalid を返す設計になっているか
- [ ] `purpose` が10文字未満の場合に invalid を返す設計になっているか
- [ ] `purpose` が500文字を超える場合に invalid を返す設計になっているか
- [ ] trim処理の適用箇所が明確になっているか

#### 型安全性

- [ ] `SkillInfoFieldValidationResult` 型が `valid: boolean` と `error?: string` を持つか
- [ ] `SkillInfoFormValidationResult` 型が `skillName?` / `purpose?` / `isValid` を持つか
- [ ] 関数シグネチャが `SkillInfoFormData` 型と整合しているか
- [ ] `SkillInfoValidationInput = Pick<SkillInfoFormData, "skillName" | "purpose">` で I/O 境界が明確化されているか
- [ ] `SKILL_INFO_VALIDATION_LIMITS` が定数化され、文字数制限の magic number を排除しているか
- [ ] `as const` による型の厳密性が確保されているか
- [ ] TypeScript strict mode で問題がない設計か

#### 命名規則

- [ ] 既存の `packages/shared/src/agent/validation.ts` の命名規則と整合しているか
- [ ] `validate*` プレフィックスが一貫して使われているか
- [ ] 定数名（`SKILL_INFO_VALIDATION_MESSAGES` 等）が SCREAMING_SNAKE_CASE になっているか
- [ ] `slideSettings.ts` 既存 `ValidationResult` と新規型名が衝突しない設計になっているか

#### エラーメッセージ

- [ ] 全エラーメッセージが日本語で定義されているか（AC-4）
- [ ] エラーメッセージが具体的で分かりやすいか
- [ ] 文字数制限の数値がメッセージ内に含まれているか

#### 責務境界

- [ ] バリデーション関数がピュア関数として設計されているか（副作用なし）
- [ ] UI コンポーネントへの依存がないか
- [ ] IPC への依存がないか
- [ ] `packages/shared/src/types/index.ts` に公開エクスポートを集約し、root `packages/shared/index.ts` は既存の types 再エクスポート経由で追随できるか

---

## レビュー結果判定

| 判定     | 条件                                   | 次のアクション             |
| -------- | -------------------------------------- | -------------------------- |
| PASS     | 全レビュー観点で問題なし               | Phase 4へ進行              |
| MINOR    | 軽微な指摘あり（命名・コメント等）     | 指摘対応後、Phase 4へ      |
| MAJOR    | 重大な問題あり（型設計・責務境界）     | Phase 2 へ戻り再設計       |
| CRITICAL | 致命的な問題（スコープ・AC不達リスク） | Phase 1 へ戻りユーザー確認 |

---

## 参照資料

| 参照資料              | パス                                      | 内容                   |
| --------------------- | ----------------------------------------- | ---------------------- |
| Phase 2 設計決定書    | `outputs/phase-2/design-decisions.md`     | ファイル配置・設計判断 |
| バリデーションI/F設計 | `outputs/phase-2/validation-interface.md` | 型定義・関数シグネチャ |
| エラーメッセージ設計  | `outputs/phase-2/error-messages.md`       | 日本語メッセージ定数   |
| 受入基準              | `outputs/phase-1/acceptance-criteria.md`  | AC-1〜AC-5             |
| P50チェック結果       | `outputs/phase-1/p50-check-result.md`     | Phase 1 成果物         |
| スコープ定義書        | `outputs/phase-1/scope-definition.md`     | Phase 1 成果物         |

---

## 成果物

| 成果物           | パス                                      | 内容                      |
| ---------------- | ----------------------------------------- | ------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | PASS/MINOR/MAJOR/CRITICAL |
| MINOR管理表      | `outputs/phase-3/minor-tracking.md`       | MINOR指摘の追跡           |

---

## 統合テスト連携

- レビュー観点に「統合ポイントの型契約」を含める
- バリデーション結果型が UI 側（後続 Wave）と契約として機能するか確認する

---

## 完了条件

- [ ] 全レビュー観点チェックリストを実施済みであること
- [ ] レビュー結果（PASS/MINOR/MAJOR/CRITICAL）が `outputs/phase-3/design-review-result.md` に記録されていること
- [ ] MINOR 指摘がある場合は `outputs/phase-3/minor-tracking.md` に記録されていること
- [ ] PASS または MINOR（対応済み）の場合のみ Phase 4 へ進むこと

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 2 が完了していること
- **後続**: Phase 4（テスト作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-wizard-runtime-validation/phase-4-test-creation.md`
