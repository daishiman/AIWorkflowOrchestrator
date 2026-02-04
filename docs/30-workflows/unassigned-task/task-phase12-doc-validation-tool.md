# Phase 12 ドキュメント更新自動検証ツール - タスク指示書

## メタ情報

```yaml
issue_number: 700
```

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | task-imp-phase12-validation-001             |
| タスク名     | Phase 12 ドキュメント更新自動検証ツール     |
| 分類         | 改善                                        |
| 対象機能     | task-specification-creator スキル           |
| 優先度       | 中                                          |
| 見積もり規模 | 小規模                                      |
| ステータス   | 未実施                                      |
| 発見元       | Phase 12（AUTH-UI-004ドキュメント更新漏れ） |
| 発見日       | 2026-02-04                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AUTH-UI-004の実装完了後、Phase 12のドキュメント更新において以下の漏れが発生した：

- LOGS.md の更新が1ファイルのみ（aiworkflow-requirements/LOGS.md のみ更新、task-specification-creator/LOGS.md を更新忘れ）
- SKILL.md の変更履歴更新漏れ
- topic-map.md の再生成忘れ

これらは全て「Phase 12 Step 1-A」の必須タスクであり、spec-update-workflow.md に記載されているが、人間の記憶に依存するチェックリストでは漏れが発生しやすい。

### 1.2 問題点・課題

| 問題点                     | 詳細                                                |
| -------------------------- | --------------------------------------------------- |
| 手動チェックリストの限界   | 5〜7項目を毎回正確に実行するのは困難                |
| 漏れの発見タイミングが遅い | レビュー時まで漏れが発見されない                    |
| 複数ファイル更新の同期問題 | LOGS.md×2、SKILL.md×2など、関連ファイルの同期が必要 |

### 1.3 放置した場合の影響

- Phase 12完了時に毎回ドキュメント漏れが発生
- レビューの手戻りが増加し、タスク完了までの時間が延長
- システム仕様書とスキル仕様書の整合性が崩れる

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12完了前に、ドキュメント更新の漏れを自動検出するスクリプトを作成し、「決定論的」に品質を保証する。

### 2.2 最終ゴール

以下のコマンドを実行することで、Phase 12の必須更新項目が全て完了しているかを自動検証できる状態：

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-docs.js \
  --workflow docs/30-workflows/{{TASK_NAME}} \
  --task-id {{TASK_ID}}
```

出力例：

```
Phase 12 ドキュメント検証結果
================================
✅ Step 1-A: タスク完了記録
  ✅ aiworkflow-requirements/LOGS.md に {{TASK_ID}} のエントリあり
  ✅ task-specification-creator/LOGS.md に {{TASK_ID}} のエントリあり
  ✅ aiworkflow-requirements/SKILL.md の変更履歴にバージョン追加あり
  ✅ task-specification-creator/SKILL.md の変更履歴にバージョン追加あり
  ✅ topic-map.md の更新日が今日

✅ Step 1-B: 実装状況テーブル更新
  ℹ️ 対象なし（api-endpoints.mdに該当エントリなし）

✅ Step 1-C: 関連タスクテーブル更新
  ℹ️ 対象なし

✅ Step 2: システム仕様更新
  ✅ interfaces-auth.md に新規インターフェース追加あり

検証結果: PASS (4/4 チェック完了)
```

### 2.3 スコープ

#### 含むもの

- validate-phase12-docs.js スクリプト作成
- Phase 12 Step 1-A〜Step 2 の全チェック項目の自動検証
- 検証結果のJSON出力オプション
- CIへの統合用オプション（exit code）

#### 含まないもの

- Phase 1〜11の検証（既存のverify-all-specs.jsが担当）
- 自動修正機能（検出のみ、修正は手動）
- GUI/Web UI

### 2.4 成果物

| 成果物                         | 配置先                                             |
| ------------------------------ | -------------------------------------------------- |
| validate-phase12-docs.js       | .claude/skills/task-specification-creator/scripts/ |
| phase12-validation-schema.json | .claude/skills/task-specification-creator/schemas/ |
| 使用ガイド                     | references/phase-11-12-guide.md に追記             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 20.x以上
- タスク仕様書ディレクトリ（docs/30-workflows/{{TASK_NAME}}）が存在
- Phase 12成果物（outputs/phase-12/）が存在

### 3.2 依存タスク

なし（独立して実行可能）

### 3.3 必要な知識

| 知識領域             | 参照先                             |
| -------------------- | ---------------------------------- |
| Phase 12仕様         | references/phase-11-12-guide.md    |
| Step 1-A〜Step 2仕様 | references/spec-update-workflow.md |
| Node.js ファイル操作 | https://nodejs.org/api/fs.html     |

### 3.4 推奨アプローチ

1. **既存スクリプトのパターン踏襲**: verify-all-specs.js と同様の構造
2. **Progressive Disclosure**: 必要なファイルのみ読み込み
3. **検証ルールの外部化**: phase12-validation-schema.json で検証ルールを定義

### 3.5 実装課題と解決策（AUTH-UI-004からの学び）

| 課題                           | 原因                                     | 解決策                                   |
| ------------------------------ | ---------------------------------------- | ---------------------------------------- |
| LOGS.md更新漏れ                | 2ファイル同時更新の認識不足              | 検証スクリプトで両ファイルの存在を確認   |
| SKILL.md変更履歴漏れ           | 手動チェックリストの見落とし             | バージョン番号の増加を自動検出           |
| topic-map.md再生成忘れ         | 新規セクション追加時のみ必要という誤認識 | 更新日を検証（タスク完了日と比較）       |
| Step 1-B/1-Cの「該当なし」判定 | 本当に該当なしかの判断が曖昧             | キーワードマッピングで対象ファイルを推定 |

### 3.6 システム仕様書参照

| 参照先                               | 確認内容                   |
| ------------------------------------ | -------------------------- |
| `references/spec-update-workflow.md` | Step 1-A〜Step 2の詳細手順 |
| `references/phase-11-12-guide.md`    | Phase 12の必須タスク定義   |
| `agents/update-system-specs.md`      | システム仕様更新のルール   |

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 概要                                   |
| ----- | ------------ | -------------------------------------- |
| 1     | 要件定義     | 検証項目の詳細化                       |
| 2-3   | 設計         | スクリプト設計とレビュー               |
| 4-5   | 実装         | スクリプト実装とテスト                 |
| 6-10  | 品質保証     | テスト拡充・リファクタリング・レビュー |
| 11-12 | 検証・文書化 | 手動検証とドキュメント更新             |
| 13    | PR作成       | Pull Request作成                       |

### Phase 4-5: 実装

#### 目的

検証スクリプトを実装し、基本動作を確認する。

#### 手順

1. scripts/validate-phase12-docs.js を作成
2. 検証ルールを phase12-validation-schema.json に定義
3. 各Step（1-A, 1-B, 1-C, Step 2）の検証ロジックを実装
4. テストケースを作成

#### 成果物

- validate-phase12-docs.js
- phase12-validation-schema.json
- **tests**/validate-phase12-docs.test.js

#### 完了条件

- [ ] 全検証項目が自動チェックできる
- [ ] JSON出力オプションが動作する
- [ ] テストがパスする

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Step 1-A の5項目（LOGS.md×2、SKILL.md×2、topic-map.md）を検証できる
- [ ] Step 1-B の実装状況テーブル更新を検証できる
- [ ] Step 1-C の関連タスクテーブル更新を検証できる
- [ ] Step 2 のシステム仕様更新を検証できる
- [ ] 「該当なし」の正しい判定ができる

### 品質要件

- [ ] 実行時間が5秒以内
- [ ] エラーメッセージが具体的で修正箇所が分かる
- [ ] 既存のverify-all-specs.jsと競合しない

### ドキュメント要件

- [ ] phase-11-12-guide.md に使用方法が追記されている
- [ ] commands.md にコマンドが追加されている
- [ ] Phase 12ドキュメント更新5点セットが完了している

---

## 6. 検証方法

### テストケース

| ID  | テストケース                | 期待結果                       |
| --- | --------------------------- | ------------------------------ |
| T1  | 全項目が更新済みのケース    | PASS判定                       |
| T2  | LOGS.md が1ファイルのみ更新 | FAIL判定（具体的なエラー出力） |
| T3  | SKILL.md 変更履歴未更新     | FAIL判定                       |
| T4  | topic-map.md 未更新         | FAIL判定                       |
| T5  | 「該当なし」が正しいケース  | PASS判定（ℹ️対象なしと表示）   |

### 検証手順

1. AUTH-UI-004のワークフローディレクトリで実行
2. 全項目がPASSになることを確認
3. 意図的に1項目を元に戻し、FAILになることを確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                   |
| ------------------------------ | ------ | -------- | -------------------------------------- |
| 検証ルールの過検出             | 中     | 中       | 「該当なし」判定のロジックを慎重に設計 |
| ファイルパス変更時の追従漏れ   | 高     | 低       | パスを定数として外部化                 |
| 既存ワークフローとの互換性問題 | 中     | 低       | 古いワークフローでも動作するよう設計   |

---

## 8. 参照情報

### 関連ドキュメント

- spec-update-workflow.md: `references/spec-update-workflow.md`
- phase-11-12-guide.md: `references/phase-11-12-guide.md`
- verify-all-specs.js: `scripts/verify-all-specs.js`（既存の検証スクリプト参考）

### 参考資料

- AUTH-UI-004タスク仕様書: `docs/30-workflows/AUTH-UI-004-google-avatar/`
- interfaces-auth.md: `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`（苦戦箇所セクション参照）
- patterns.md: `.claude/skills/task-specification-creator/references/patterns.md`（Phase 12ドキュメント更新5点セット確認パターン）

---

## 9. 備考

### 発見時の状況

AUTH-UI-004のPhase 12完了時、以下の漏れが指摘された：

```
Phase 12 Step 1-A 漏れ:
- task-specification-creator/LOGS.md 未更新
- aiworkflow-requirements/SKILL.md 変更履歴 未更新
- task-specification-creator/SKILL.md 変更履歴 未更新
- topic-map.md 再生成忘れ
```

### 関連パターン（patterns.md）

AUTH-UI-004から抽出されたパターン：

**Phase 12ドキュメント更新5点セット確認パターン**

```
Phase 12 Step 1-A 実行時に以下の5点を必ずセットで更新:
1. aiworkflow-requirements/LOGS.md
2. task-specification-creator/LOGS.md
3. aiworkflow-requirements/SKILL.md（変更履歴）
4. task-specification-creator/SKILL.md（変更履歴）
5. indexes/topic-map.md（generate-index.js実行）
```

### 補足事項

- このスクリプトは「検出」のみを行い、「自動修正」は行わない
- 将来的には、検出結果に基づいて修正候補を提示する機能拡張も検討可能
- CI/CDパイプラインに組み込むことで、PR作成前の品質ゲートとして機能させることも可能
