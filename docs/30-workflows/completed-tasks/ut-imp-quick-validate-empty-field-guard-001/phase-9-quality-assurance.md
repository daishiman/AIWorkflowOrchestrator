# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001              |
| Phase        | 9                                                        |
| Phase名      | 品質保証                                                 |
| 前提Phase    | Phase 8（リファクタリング）                              |
| 後続Phase    | Phase 10（最終レビューゲート）                           |
| ステータス   | 完了（2026-02-27）                                       |
| 作成日       | 2026-02-27                                               |
| 機能名       | ut-imp-quick-validate-empty-field-guard-001              |
| Issue        | #913                                                     |
| 対象ファイル | `.claude/skills/skill-creator/scripts/quick_validate.js` |

---

## 目的

静的解析・セキュリティ・機能検証の観点から、修正後のコード品質がプロジェクト基準を満たしていることを検証する。
Node.js スクリプト（非 TypeScript）であるため、型チェックとビルド検証は非該当とし、Lint・テスト・手動実行確認を中心に検証する。

## 背景

本タスクは `.claude/skills/skill-creator/scripts/quick_validate.js`（JavaScript ESM）の修正である。
Electron アプリケーション本体（`apps/desktop`）のコードではないため、TypeScript 型チェック（`pnpm typecheck`）とプロダクションビルド（`pnpm build`）は検証対象外となる。
品質ゲートは以下の 3 項目に限定する: (1) テスト全件 PASS、(2) ESLint クリア、(3) 手動実行確認。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク 9-1: 全テスト実行と結果確認

**目的**: Phase 5/6/8 を経たコードが全テストに PASS することを最終確認する

**実行手順**:

1. テストを実行する
2. 全テストが PASS することを確認する
3. テスト数・成功数・失敗数・スキップ数を記録する

**コマンド**:

```bash
cd .claude/skills/skill-creator && pnpm test -- quick_validate
```

**確認項目**:

| テストスイート                         | テスト ID 範囲       | 期待結果 | 実績 |
| -------------------------------------- | -------------------- | -------- | ---- |
| 正常系                                 | TC-N-001〜TC-N-014   | 全 PASS  | -    |
| 異常系                                 | TC-E-001〜TC-E-012   | 全 PASS  | -    |
| 境界値                                 | TC-B-001〜TC-B-003   | 全 PASS  | -    |
| 運用フロー                             | TC-OP-001〜TC-OP-004 | 全 PASS  | -    |
| Warning 分類                           | TC-WC-001〜TC-WC-006 | 全 PASS  | -    |
| リグレッション                         | TC-RG-001〜TC-RG-007 | 全 PASS  | -    |
| エッジケース                           | TC-EC-001〜TC-EC-009 | 全 PASS  | -    |
| 統合                                   | TC-IT-001〜TC-IT-003 | 全 PASS  | -    |
| NFR                                    | TS-008〜TS-011       | 全 PASS  | -    |
| 空フィールドガード（Phase 5/6 追加分） | 新規テスト           | 全 PASS  | -    |

**期待される成果物**:

- `outputs/phase-9/test-execution-report.md`

---

### タスク 9-2: ESLint 検証

**目的**: 対象ファイルが ESLint ルールに準拠していることを確認する

**実行手順**:

1. 対象ファイルに ESLint を実行する
2. エラー・警告の有無を確認する
3. エラーがあれば修正する
4. 修正後に再度テストを実行して PASS を確認する

**コマンド**:

```bash
# 対象ファイルの Lint
pnpm eslint .claude/skills/skill-creator/scripts/quick_validate.js

# テストファイルの Lint
pnpm eslint .claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js
```

**確認項目**:

- [ ] `quick_validate.js` に ESLint エラーがない
- [ ] `quick_validate.test.js` に ESLint エラーがない
- [ ] ESLint 警告がある場合は内容を記録し、対応要否を判断する

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク 9-3: セキュリティ検証（入力バリデーション網羅性）

**目的**: P42 準拠 3 段バリデーションが不正入力に対して安全に動作することを確認する

**実行手順**:

1. `quick_validate.js` の `validateSkill()` 関数を読み込む
2. 以下のチェックリストに基づき、各入力パターンでクラッシュしないことを確認する
3. テストケースでカバーされていない入力パターンがあれば記録する

**セキュリティチェックリスト**:

| 入力パターン                         | 期待動作                  | テストでカバー済み |
| ------------------------------------ | ------------------------- | ------------------ |
| `name` が `undefined`                | `addError()` でエラー報告 | -                  |
| `name` が `null`                     | `addError()` でエラー報告 | -                  |
| `name` が空文字列 `""`               | `addError()` でエラー報告 | -                  |
| `name` がスペースのみ `"   "`        | `addError()` でエラー報告 | -                  |
| `name` が数値 `123`                  | `addError()` でエラー報告 | -                  |
| `name` がオブジェクト `{}`           | `addError()` でエラー報告 | -                  |
| `name` が配列 `[]`                   | `addError()` でエラー報告 | -                  |
| `description` が `undefined`         | `addError()` でエラー報告 | -                  |
| `description` が `null`              | `addError()` でエラー報告 | -                  |
| `description` が空文字列 `""`        | `addError()` でエラー報告 | -                  |
| `description` がスペースのみ `"   "` | `addError()` でエラー報告 | -                  |
| `description` が数値 `123`           | `addError()` でエラー報告 | -                  |
| `description` がオブジェクト `{}`    | `addError()` でエラー報告 | -                  |

**重要**: 上記の入力パターンでランタイムエラー（`TypeError: Cannot read property 'toLowerCase' of undefined` 等）が発生しないことが最重要確認項目である。これが本タスクの根本的な修正目的である。

**期待される成果物**:

- `outputs/phase-9/security-report.md`

---

### タスク 9-4: 手動実行確認

**目的**: 実スキルディレクトリに対して `quick_validate.js` を手動実行し、正常動作を確認する

**実行手順**:

1. 以下の 3 つのスキルディレクトリに対してスクリプトを実行する
2. 出力内容が正しいことを目視確認する
3. 終了コードが正しいことを確認する

**コマンド**:

```bash
# スキル 1: task-specification-creator（正常なスキル）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
echo "Exit code: $?"

# スキル 2: skill-creator（正常なスキル）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
echo "Exit code: $?"

# スキル 3: aiworkflow-requirements（正常なスキル）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
echo "Exit code: $?"
```

**確認項目**:

| スキル                     | 期待される終了コード | 期待される出力      | 実績 |
| -------------------------- | -------------------- | ------------------- | ---- |
| task-specification-creator | 0（成功）            | `✓ 検証成功` を含む | -    |
| skill-creator              | 0（成功）            | `✓ 検証成功` を含む | -    |
| aiworkflow-requirements    | 0（成功）            | `✓ 検証成功` を含む | -    |

**期待される成果物**:

- `outputs/phase-9/manual-execution-report.md`

---

### タスク 9-5: 品質ゲート総合判定

**目的**: タスク 9-1〜9-4 の結果を統合し、品質基準を満たしているか総合判定する

**実行手順**:

1. タスク 9-1〜9-4 の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] 全ユニットテスト PASS（タスク 9-1）
- [ ] リグレッションテスト PASS（タスク 9-1）
- [ ] 統合テスト PASS（タスク 9-1）

#### コード品質

- [ ] ESLint エラーなし（タスク 9-2）
- [ ] 型チェック: **非該当**（JavaScript ファイルのため）
- [ ] ビルド: **非該当**（CLI スクリプトのため）

#### セキュリティ

- [ ] 全入力パターンでクラッシュなし（タスク 9-3）
- [ ] P42 準拠 3 段バリデーション実装確認（タスク 9-3）

#### 手動実行

- [ ] 実スキル 3 件で正常動作確認（タスク 9-4）

**総合判定**:

| 品質項目     | 基準                       | 結果 |
| ------------ | -------------------------- | ---- |
| 機能検証     | 全テスト PASS              | -    |
| コード品質   | ESLint エラーなし          | -    |
| セキュリティ | 不正入力でクラッシュしない | -    |
| 手動実行     | 実スキルで正常動作         | -    |

**期待される成果物**:

- `outputs/phase-9/quality-gate-result.md`

---

## 参照資料

| 参照資料               | パス                                                                                                      | 内容             |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ---------------- |
| 対象ファイル           | `.claude/skills/skill-creator/scripts/quick_validate.js`                                                  | 実装コード       |
| テストファイル         | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`                                   | テストコード     |
| Phase 5 実装仕様       | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-5-implementation.md` | 実装内容         |
| Phase 8 リファクタ結果 | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/outputs/phase-8/`          | リファクタ成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                            |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------- |
| P42 準拠ルール             | `.claude/rules/06-known-pitfalls.md#P42`                                          | 3段バリデーション規約           |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質基準・カバレッジ            |
| security-input-validation  | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`  | 入力検証の型強制/ホワイトリスト |
| error-handling             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | Validation Error分類            |
| claude-code-skills-process | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md` | quick_validate運用フロー        |

---

## 多角的チェック観点

| 観点               | 該当/非該当 | 判断理由                                                               |
| ------------------ | ----------- | ---------------------------------------------------------------------- |
| セキュリティ       | **該当**    | 入力バリデーション網羅性の確認が本タスクの核心                         |
| UI/UX              | 非該当      | CLI 出力のみ。Renderer/コンポーネント変更なし                          |
| アーキテクチャ     | 非該当      | 単一ファイル修正。レイヤー変更なし                                     |
| API 設計           | 非該当      | IPC/REST API 変更なし                                                  |
| データ整合性       | 非該当      | DB/ストア変更なし                                                      |
| エラーハンドリング | **該当**    | 不正入力時に Validation Error が仕様どおりの文言で出力されることを確認 |
| パフォーマンス     | 非該当      | 小規模修正のため計測不要                                               |
| アクセシビリティ   | 非該当      | UI 実装なし                                                            |
| テスタビリティ     | **該当**    | テスト網羅性の最終確認                                                 |

---

## 成果物

| 成果物               | パス                                         | 内容                   |
| -------------------- | -------------------------------------------- | ---------------------- |
| テスト実行レポート   | `outputs/phase-9/test-execution-report.md`   | テスト全件結果         |
| Lint レポート        | `outputs/phase-9/lint-report.md`             | ESLint 結果            |
| セキュリティレポート | `outputs/phase-9/security-report.md`         | 入力バリデーション確認 |
| 手動実行レポート     | `outputs/phase-9/manual-execution-report.md` | 実スキル動作確認       |
| 品質ゲート結果       | `outputs/phase-9/quality-gate-result.md`     | 総合判定               |

---

## 統合テスト連携【必須】

> 品質保証で統合テスト結果を確認する

| 品質項目       | 確認内容                       | 結果 |
| -------------- | ------------------------------ | ---- |
| 機能検証       | 全自動テスト PASS              | -    |
| 統合テスト     | TC-IT-001〜TC-IT-003 PASS      | -    |
| リグレッション | TC-RG-001〜TC-RG-007 PASS      | -    |
| セキュリティ   | 不正入力でランタイムエラーなし | -    |

---

## 完了条件

- [ ] 全テストが PASS している（タスク 9-1）
- [ ] ESLint エラーがない（タスク 9-2）
- [ ] セキュリティ検証が完了し、不正入力でクラッシュしない（タスク 9-3）
- [ ] 手動実行で 3 スキル全て正常動作（タスク 9-4）
- [ ] 品質ゲート全項目をクリア（タスク 9-5）

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスク（5 タスク）を 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物（5 ファイル）が全て生成されていることを確認
- [ ] 品質ゲート全項目 PASS を確認

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了状態を明記している

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-10-final-review.md`
