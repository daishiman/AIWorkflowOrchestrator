# Phase 12出力要件検証スクリプト作成 - タスク指示書

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | TSC-VALIDATION-002                            |
| タスク名     | Phase 12出力要件検証スクリプト作成            |
| 分類         | 改善                                          |
| 対象機能     | task-specification-creatorスキル Phase 12検証 |
| 優先度       | 中                                            |
| 見積もり規模 | 小規模                                        |
| ステータス   | 未実施                                        |
| 発見元       | TASK-3-1-D Phase 12実施時（パターン分析）     |
| 発見日       | 2026-01-26                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-1-D Phase 12実施時に、タスク仕様書（phase-12-documentation.md）に記載された出力成果物と、スキル仕様（phase-11-12-guide.md）で要求される出力成果物が乖離していることが発覚した。

具体的には以下の3ファイルがタスク仕様書に未記載だった:

1. `implementation-guide.md` の Part 1（中学生レベル概念説明）
2. `documentation-changelog.md`（システム仕様書更新履歴）
3. `unassigned-task-report.md`（0件でも出力必須）

### 1.2 問題点・課題

- 既存の`validate-phase-output.js`はPhaseファイル構造のみを検証し、Phase 12出力成果物要件は検証しない
- タスク仕様書作成者がスキル仕様を見落とした場合、不完全なPhase 12成果物が生成される
- 手動での確認に依存しており、人的ミスが発生しやすい
- 「Part 1（中学生レベル）」の存在を検証する仕組みがない

### 1.3 放置した場合の影響

- Phase 12成果物の品質にばらつきが生じる
- 初学者向けドキュメント（Part 1）が欠落したまま完了扱いになる
- システム仕様書への更新履歴記録が漏れる
- 未タスク検出レポートが欠落し、残課題の追跡が困難になる

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12出力成果物がスキル仕様（phase-11-12-guide.md）の要件を満たしているかを自動検証するスクリプトを作成する。

### 2.2 最終ゴール

- `validate-phase12-outputs.js` スクリプトが作成されている
- Phase 12完了前に全必須成果物の存在を検証できる
- `implementation-guide.md` に Part 1/Part 2 両方が含まれていることを検証できる
- 検証結果がPASS/FAIL形式で出力される

### 2.3 スコープ

#### 含むもの

- `validate-phase12-outputs.js` スクリプト作成
- 以下の検証項目の実装:
  - `outputs/phase-12/` ディレクトリ内の必須ファイル存在確認
  - `implementation-guide.md` の Part 1/Part 2 セクション存在確認
  - `documentation-changelog.md` の存在確認
  - `unassigned-task-report.md` の存在確認
- 検証レポートの出力機能
- `--fix` オプションで欠落ファイルの雛形生成

#### 含まないもの

- Phase 12以外のPhase検証
- 成果物の内容品質の検証（構造検証のみ）
- CI/CDパイプラインへの統合

### 2.4 成果物

| 成果物                     | パス                                                                            |
| -------------------------- | ------------------------------------------------------------------------------- |
| Phase 12出力検証スクリプト | `.claude/skills/task-specification-creator/scripts/validate-phase12-outputs.js` |
| 検証ルール定義             | `.claude/skills/task-specification-creator/schemas/phase12-outputs.json`        |
| 使用ガイド更新             | `.claude/skills/task-specification-creator/references/commands.md` に追記       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 18以上がインストールされていること
- task-specification-creatorスキルの構造を理解していること
- Phase 12のタスク要件（phase-11-12-guide.md）を把握していること

### 3.2 依存タスク

| タスク      | ステータス | 備考                      |
| ----------- | ---------- | ------------------------- |
| TASK-3-1-D  | 完了       | パターン発見元            |
| patterns.md | 完了       | 失敗/成功パターン記録済み |

### 3.3 必要な知識

- Node.js/JavaScriptスクリプト作成
- Markdownパース（正規表現）
- JSONスキーマ定義
- CLI引数処理

### 3.4 推奨アプローチ

1. 既存スクリプト（`validate-phase-output.js`, `validate-phase12-step1.js`）のパターンを踏襲
2. 検証ルールをJSONスキーマ（`phase12-outputs.json`）で定義
3. `--workflow` パスを引数で受け取る統一インターフェース
4. 検証結果を構造化形式（JSON + 人間可読）で出力

---

## 4. 実行手順

### Phase構成

| Phase | 名称           | 目的                     |
| ----- | -------------- | ------------------------ |
| 1     | 要件定義       | 検証ルールの仕様定義     |
| 2     | 設計           | スクリプト構造設計       |
| 4     | テスト作成     | ユニットテスト作成       |
| 5     | 実装           | スクリプト実装           |
| 7     | カバレッジ確認 | 動作検証・カバレッジ確認 |
| 12    | ドキュメント   | 使用ガイド更新           |

### Phase 5: 実装

#### 目的

Phase 12出力検証スクリプトを実装する。

#### 手順

1. `phase12-outputs.json` スキーマを作成
   - 必須ファイル一覧を定義
   - 各ファイルの必須セクションを定義

2. `validate-phase12-outputs.js` を作成
   - コマンドライン引数処理（`--workflow`, `--fix`, `--json`）
   - ファイル存在チェック機能
   - セクション存在チェック機能（Part 1/Part 2検出）
   - 検証レポート出力機能

3. テストを実行し動作確認

#### 成果物

- `validate-phase12-outputs.js`
- `phase12-outputs.json`

#### 完了条件

- 正常なPhase 12成果物でPASS判定
- 欠落ファイルでFAIL判定 + 欠落ファイル一覧出力
- Part 1欠落時にFAIL判定

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `validate-phase12-outputs.js` が作成されている
- [ ] 必須ファイル（4種類）の存在を検証できる
- [ ] `implementation-guide.md` の Part 1/Part 2 を検証できる
- [ ] 検証結果がPASS/FAIL形式で出力される
- [ ] `--fix` オプションで雛形生成ができる

### 品質要件

- [ ] ESLint/Prettierでフォーマット済み
- [ ] エラーハンドリングが実装されている
- [ ] `--help` オプションで使用方法が表示される

### ドキュメント要件

- [ ] `commands.md` にスクリプト使用方法が追記されている
- [ ] `patterns.md` の成功パターンと連携している

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容                          | 期待結果                              |
| ------ | ----------------------------------- | ------------------------------------- |
| TC-001 | 完全なPhase 12成果物で検証          | PASS判定                              |
| TC-002 | implementation-guide.md欠落で検証   | FAIL判定 + 欠落ファイル名出力         |
| TC-003 | Part 1セクション欠落で検証          | FAIL判定 + "Part 1 missing"メッセージ |
| TC-004 | unassigned-task-report.md欠落で検証 | FAIL判定 + 欠落ファイル名出力         |
| TC-005 | `--fix` オプションで雛形生成        | 欠落ファイルの雛形が生成される        |
| TC-006 | `--json` オプションで出力           | JSON形式で検証結果が出力される        |

### 検証コマンド

```bash
# Phase 12出力検証
node .claude/skills/task-specification-creator/scripts/validate-phase12-outputs.js \
  --workflow docs/30-workflows/TASK-3-1-D-permission-dialog-ui

# JSON形式で出力
node .claude/skills/task-specification-creator/scripts/validate-phase12-outputs.js \
  --workflow docs/30-workflows/TASK-3-1-D-permission-dialog-ui \
  --json

# 欠落ファイルの雛形生成
node .claude/skills/task-specification-creator/scripts/validate-phase12-outputs.js \
  --workflow docs/30-workflows/TASK-3-1-D-permission-dialog-ui \
  --fix
```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                   |
| -------------------------------- | ------ | -------- | -------------------------------------- |
| Part 1検出の正規表現誤り         | 中     | 中       | 複数パターンの正規表現でフォールバック |
| ワークフローディレクトリ構造変更 | 低     | 低       | 柔軟なパス解決ロジック                 |
| 既存検証スクリプトとの重複       | 低     | 低       | 責務を明確に分離（Phase構造 vs 出力）  |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント            | パス                                                                          |
| ----------------------- | ----------------------------------------------------------------------------- |
| Phase 11/12ガイド       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`   |
| 既存Phase検証スクリプト | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`  |
| Phase 12 Step 1検証     | `.claude/skills/task-specification-creator/scripts/validate-phase12-step1.js` |
| パターン集              | `.claude/skills/task-specification-creator/references/patterns.md`            |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                 | 内容               |
| ------------------ | -------------------------------------------------------------------- | ------------------ |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | Phase 12フロー仕様 |

---

## 9. 備考

### 発見経緯

TASK-3-1-D Phase 12実施時に以下の問題が発生:

1. タスク仕様書に記載された出力成果物が4ファイル
2. スキル仕様（phase-11-12-guide.md）では7ファイル以上を要求
3. 差分の3ファイル（Part 1含むimplementation-guide、documentation-changelog、unassigned-task-report）が欠落

この問題を自動検出するための検証スクリプトが必要と判断。

### パターン参照

`patterns.md` に記録済み:

- **失敗パターン**: Phase 12出力要件の漏れ
- **成功パターン**: Phase 12出力成果物チェックリスト

### 補足事項

- 既存の`validate-phase-output.js`はPhaseファイル構造を検証（phase-1.md〜phase-13.mdの存在）
- 本タスクはPhase 12の**出力成果物**を検証（implementation-guide.md等の存在・内容）
- 責務を分離することで保守性を確保
