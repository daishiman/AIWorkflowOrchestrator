# Phase 12チェックリスト自動検証スクリプト - タスク指示書

## メタ情報

```yaml
issue_number: 785
```

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | task-imp-phase12-auto-verification                           |
| タスク名     | Phase 12チェックリスト自動検証スクリプト                     |
| 分類         | 改善                                                         |
| 対象機能     | タスク仕様書作成スキル（task-specification-creator）         |
| 優先度       | 中                                                           |
| 見積もり規模 | 中規模                                                       |
| ステータス   | 未実施                                                       |
| Issue        | #785                                                         |
| 発見元       | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12 実装苦戦箇所 |
| 発見日       | 2026-02-12                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12（ドキュメント更新）は、タスク実行ワークフローで最も漏れが発生しやすいPhaseである。UT-STORE-HOOKS-COMPONENT-MIGRATION-001では初回実行時に12項目以上の更新漏れが発生し、複数回の修正セッションを要した。この問題はP1, P2, P4, P25, P26, P27, P28として記録されており、同様の漏れが繰り返し発生している。

### 1.2 問題点・課題

- Phase 12の必須タスクが4タスク（実装ガイド、システム仕様更新、changelog、未タスク検出）、合計20以上のサブステップで構成されており、手動チェックでは漏れが発生しやすい
- spec-update-workflow.mdの全Step（1-A〜1-E + Step 2）が複雑で、複数の更新対象ファイルが分散している
- `LOGS.md × 2`、`SKILL.md × 2`、`topic-map.md再生成`、`artifacts.json更新`など、更新対象が多い
- 「完了」と記載した後で漏れが発覚するパターンが繰り返されている（P4）

### 1.3 放置した場合の影響

- Phase 12の漏れが今後も発生し、修正セッションの工数が増加
- 仕様書と実装の乖離が放置される（P26）
- topic-map.mdの不整合が蓄積（P2, P27）
- LOGS.md/SKILL.mdの片方だけ更新される不完全な記録が発生（P1, P25）

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12完了時に自動実行される検証スクリプトを作成し、必須チェック項目の漏れを機械的に検出する。

### 2.2 最終ゴール

- `node scripts/verify-phase12.js --workflow docs/30-workflows/{{FEATURE_NAME}}` を実行するだけで、Phase 12の全必須項目の完了状態を検証できる
- 未完了項目がある場合は具体的なアクション（ファイルパス + 必要な操作）を出力する
- 既存の `complete-phase.js` と連携し、Phase 12完了時に自動実行される

### 2.3 スコープ

#### 含むもの

- `scripts/verify-phase12.js` の新規作成
- 以下の項目の自動検証:
  - `implementation-guide.md` の存在確認
  - `documentation-changelog.md` の存在確認
  - `unassigned-task-report.md` の存在確認
  - `unassigned-task-detection.md` の存在確認
  - `skill-feedback-report.md` の存在確認
  - `artifacts.json` のPhase 12ステータス確認
  - `aiworkflow-requirements/LOGS.md` の更新確認（タスクIDの存在）
  - `task-specification-creator/LOGS.md` の更新確認（タスクIDの存在）
  - `aiworkflow-requirements/SKILL.md` の更新確認
  - `task-specification-creator/SKILL.md` の更新確認
  - `topic-map.md` の最終更新日時確認
- `complete-phase.js` からの呼び出し連携

#### 含まないもの

- Phase 1-11の検証（既存の `verify-all-specs.js` で対応）
- ドキュメント内容の品質チェック（LLMタスク）
- 自動修正機能（検出のみ）

### 2.4 成果物

| 成果物                      | 説明                                        |
| --------------------------- | ------------------------------------------- |
| `scripts/verify-phase12.js` | Phase 12自動検証スクリプト                  |
| `complete-phase.js` の更新  | Phase 12完了時にverify-phase12.jsを呼び出す |
| テストファイル              | verify-phase12.jsのユニットテスト           |
| Phase 1-12 成果物           | 各Phaseの標準出力ドキュメント               |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 実行環境
- `scripts/complete-phase.js` が存在すること
- `scripts/verify-all-specs.js` の設計パターンを参考にできること

### 3.2 依存タスク

| タスクID | 状態 | 依存種別 |
| -------- | ---- | -------- |
| なし     | -    | -        |

### 3.3 必要な知識

- Node.js ファイルシステムAPI（fs.existsSync, fs.readFileSync）
- JSON解析（artifacts.json）
- 正規表現（LOGS.md/SKILL.md内のタスクID検索）
- 既存スクリプト（complete-phase.js, verify-all-specs.js）の設計パターン

### 3.4 推奨アプローチ

1. 既存の `verify-all-specs.js` の設計パターンを踏襲（入力パス受け取り → チェック実行 → 結果出力）
2. チェック項目を配列で定義し、拡張性を確保
3. 結果はJSON形式で出力し、CIパイプラインとの連携を考慮
4. 終了コード: 0（全PASS）/ 1（未完了あり）

### 3.5 実装課題と解決策（UT-STORE-HOOKS-COMPONENT-MIGRATION-001からの学び）

| 課題                                    | 原因                                     | 解決策                                        | 参照                |
| --------------------------------------- | ---------------------------------------- | --------------------------------------------- | ------------------- |
| Phase 12の12項目以上の更新漏れ          | 手動チェックに依存、チェックリストが分散 | 自動検証スクリプトで機械的に検出              | P1, P2, P4, P25-P28 |
| LOGS.md 2ファイル更新漏れ               | 2箇所あることを忘れがち                  | スクリプトで両方のLOGS.mdをチェック           | P1, P25             |
| topic-map.md 再生成忘れ                 | 更新トリガーの判断ミス                   | 仕様書変更があれば常にtopic-map更新をチェック | P2, P27             |
| artifacts.jsonステータス矛盾            | Phase完了とタスク全体完了の混同          | Phase個別ステータスのみチェック               | lessons-learned.md  |
| documentation-changelogへの早期完了記載 | 全Step完了前に完了記載                   | 全チェック項目PASSまで完了不可                | P4                  |

---

## 4. 実行手順

### Phase構成

本タスクはPhase 1-13のフルサイクルで実行する。

### Phase 1: 要件定義

#### 目的

検証項目の完全なリストアップと既存スクリプトの調査

#### 手順

1. `spec-update-workflow.md` から全必須Step（1-A〜1-E + Step 2）を抽出
2. `phase-11-12-guide.md` から Phase 12の必須出力ファイルを抽出
3. 既存の `verify-all-specs.js` の設計パターンを分析
4. 検証項目リストを作成

#### 成果物

- 要件定義書（検証項目リスト、入出力仕様）

### Phase 4-5: テスト作成・実装

#### 目的

verify-phase12.js の実装

#### 手順

1. テストケースを先に作成（TDDアプローチ）
2. `scripts/verify-phase12.js` を実装:
   - ファイル存在チェック（outputs/phase-12/配下の5ファイル）
   - artifacts.json パース（Phase 12ステータスチェック）
   - LOGS.md × 2 のタスクID検索
   - SKILL.md × 2 のタスクID検索
   - topic-map.md の更新日時チェック
3. `complete-phase.js` からの呼び出しフックを追加
4. JSON出力フォーマットを実装

#### 完了条件

- 全テストPASS
- サンプルワークフローでの検証成功

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `verify-phase12.js` が全必須チェック項目を検証できる
- [ ] 未完了項目がある場合、具体的なアクション（ファイルパス + 操作）を出力する
- [ ] 結果がJSON形式で出力される
- [ ] 終了コードが正しい（0: 全PASS / 1: 未完了あり）
- [ ] `complete-phase.js --phase 12` 実行時に自動検証が走る

### 品質要件

- [ ] Line Coverage ≥ 80%
- [ ] Branch Coverage ≥ 60%
- [ ] Function Coverage ≥ 80%
- [ ] 全テストPASS
- [ ] ESLint / TypeScript型チェックエラーなし

### ドキュメント要件

- [ ] Phase 12 実装ガイド（Part 1: 中学生レベル / Part 2: 開発者向け）
- [ ] LOGS.md × 2 更新
- [ ] SKILL.md × 2 更新
- [ ] documentation-changelog.md 作成
- [ ] commands.md にverify-phase12.jsコマンドを追加

---

## 6. 検証方法

### テストケース

| テストケース                              | 期待結果                                         |
| ----------------------------------------- | ------------------------------------------------ |
| 全ファイル存在時にPASS                    | 終了コード0、全項目OK                            |
| implementation-guide.md欠落時にFAIL       | 該当項目のエラーメッセージ                       |
| LOGS.md 1つだけ更新時にFAIL               | 「task-specification-creator/LOGS.md未更新」警告 |
| artifacts.json Phase 12が pending時にFAIL | 「Phase 12ステータスがpending」警告              |
| topic-map.md 最終更新が古い時にWARNING    | 再生成推奨メッセージ                             |

### 検証手順

1. テストワークフロー作成: `docs/30-workflows/TEST-VERIFY/` に最小構成を作成
2. `node scripts/verify-phase12.js --workflow docs/30-workflows/TEST-VERIFY` を実行
3. 意図的にファイルを削除して再実行、エラー検出を確認
4. `pnpm --filter @repo/desktop test` でユニットテスト実行

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                     |
| ------------------------------ | ------ | -------- | ---------------------------------------- |
| チェック項目の過不足           | 中     | 中       | spec-update-workflow.mdとの整合性を検証  |
| 既存スクリプトとの競合         | 低     | 低       | complete-phase.jsのフック方式を採用      |
| ファイルパス変更による検出失敗 | 中     | 低       | パスを定数化し、変更時の追従を容易に     |
| 偽陽性（不要な警告）           | 低     | 中       | 各チェック項目にスキップオプションを用意 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                                   | 用途                           |
| ------------------------------------------------------------------------------ | ------------------------------ |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Phase 12の必須Step定義         |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | Phase 12ガイド                 |
| `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`        | 既存検証スクリプト（設計参考） |
| `.claude/skills/task-specification-creator/scripts/complete-phase.js`          | Phase完了スクリプト（連携先）  |
| `.claude/rules/06-known-pitfalls.md` (P1, P2, P4, P25-P28)                     | Phase 12漏れの既知問題         |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 実装苦戦箇所の記録             |

### 参考資料

- Node.js fs API: ファイル存在・読み取り
- `verify-all-specs.js` のコード: 設計パターンの参考

---

## 9. 備考

### 先行タスクからの教訓

UT-STORE-HOOKS-COMPONENT-MIGRATION-001のPhase 12で発生した漏れパターン:

1. **LOGS.md 2ファイル更新漏れ（P1, P25）**: aiworkflow-requirements と task-specification-creator の両方を更新する必要があるが、片方を忘れがち
2. **topic-map.md 再生成忘れ（P2, P27）**: 仕様書変更後のtopic-map再生成を忘れる。セクションの追加/削除/更新いずれも再生成トリガー
3. **documentation-changelogへの早期完了記載（P4）**: 全Step完了前に「完了」と記載し、後続Stepの漏れに気付けない
4. **artifacts.jsonステータス矛盾**: Phase 12完了時にトップレベルstatusを誤って「completed」にした（Phase 13未完了なのに）
5. **スキルフィードバックレポート未作成（P28）**: 改善点がなくても「改善点なし」としてレポートを作成する必要がある

### 補足事項

- 本スクリプトは `task-specification-creator` スキルの `scripts/` ディレクトリに配置
- Script First原則（決定論的処理はスクリプトで100%精度を保証）に準拠
- 将来的にはCI/CDパイプラインに組み込み、Phase 12完了前の自動ゲートとして機能させることを推奨
