# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 4                                                                 |
| Phase名    | テスト作成                                                        |
| 対象機能   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 Phase 仕様書テンプレート改修 |
| 前提Phase  | Phase 3: 設計レビュー（PASS）                                     |
| 次Phase    | Phase 5: 実装                                                     |
| ステータス | pending                                                           |
| 作成日     | 2026-04-06                                                        |
| 更新日     | 2026-04-06                                                        |

## 目的

テンプレート改修の検証基準（テストケース）を定義する。TDD Red フェーズとして、改修後に満たすべき条件を先に明確化する。docs-only タスクのため、テストケースはテンプレートの仮生成確認とバリデーション基準として定義する。

## 実行タスク

### Task 4-1: テストケース定義

| TC    | 検証内容                                        | 検証方法                         | 期待結果                                                                   |
| ----- | ----------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------- |
| TC-01 | 改修済みテンプレートで Phase 12 仕様書を仮生成  | テンプレートへサンプルデータ流入 | 「実行タスク」と「検証ログ」が別セクションに分離され、Task 12-6 が存在する |
| TC-02 | docs-only Phase 11 仕様書の evidence ルール確認 | `IS_NON_VISUAL=true` で生成      | `manual-test-checklist.md` 必須、`screenshot-plan.json` 不要が明記される   |
| TC-03 | Phase 12 root evidence の必須化確認             | テンプレート目視レビュー         | `phase12-task-spec-compliance-check.md` が成果物に含まれる                 |
| TC-04 | Task/Step 分離ガイドラインの可読性確認          | テンプレート目視レビュー         | plan と current fact の境界が一読で判別できる                              |
| TC-05 | Handlebars 構文の妥当性確認                     | 構文パース                       | テンプレートエンジンでエラーが発生しない                                   |
| TC-06 | 既存フォーマットとの互換性                      | 既存仕様書との比較               | 改修済みテンプレートで生成した仕様書が既存フォーマットと一致               |
| TC-07 | `unassigned-task-template.md` 苦戦箇所記載欄    | テンプレート目視確認             | 備考セクションに苦戦箇所記載欄が明確化されている                           |

### Task 4-2: テストデータ定義

**TC-01 / TC-02 用サンプルデータ**:

```yaml
# docs-only / spec_created タスクのサンプル
IS_PHASE_11: true
IS_NON_VISUAL: true
phase: 11
taskId: UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001
taskName: Phase 仕様書フォーマット改修
```

**TC-01 用 Phase 12 サンプルデータ**:

```yaml
phase: 12
IS_PHASE_12: true
tasks:
  - id: "12-1"
    name: 実装ガイド作成
  - id: "12-2"
    name: システム仕様書更新
  - id: "12-3"
    name: ドキュメント更新履歴作成
  - id: "12-4"
    name: 未タスク検出レポート作成
  - id: "12-5"
    name: スキルフィードバックレポート作成
  - id: "12-6"
    name: phase12-task-spec-compliance-check
steps:
  - id: "1-A"
    parentTask: "12-2"
    name: タスク完了記録
  - id: "1-B"
    parentTask: "12-2"
    name: 実装状況テーブル更新
  - id: "1-C"
    parentTask: "12-2"
    name: 関連タスクテーブル更新
  - id: "1-D"
    parentTask: "12-2"
    name: topic-map 更新
  - id: "1-E"
    parentTask: "12-2"
    name: 未タスク参照リンク検証
  - id: "1-F"
    parentTask: "12-2"
    name: DevOps 更新（N/A 判定含む）
  - id: "1-G"
    parentTask: "12-2"
    name: SKILL 検証
  - id: "2"
    parentTask: "12-2"
    name: システム仕様更新（条件付き）
```

### Task 4-3: バリデーション基準

docs-only タスクのため、自動テストではなく手動バリデーション基準を定義する。

**Handlebars 構文チェック手順**:

```bash
# テンプレートファイルの Handlebars 構文を確認
# (node-handlebars または手動パースで確認)
node -e "
const Handlebars = require('handlebars');
const fs = require('fs');
const template = fs.readFileSync('.claude/skills/task-specification-creator/assets/phase-spec-template.md', 'utf8');
try {
  Handlebars.precompile(template);
  console.log('PASS: Handlebars syntax is valid');
} catch (e) {
  console.error('FAIL:', e.message);
}
"
```

**テンプレート差分確認手順**:

```bash
# 改修前後の差分確認
git diff .claude/skills/task-specification-creator/assets/phase-spec-template.md
```

## 参照資料

| 資料名           | パス                                      |
| ---------------- | ----------------------------------------- |
| Phase 2 設計書   | `outputs/phase-2/design-doc.md`           |
| Phase 3 レビュー | `outputs/phase-3/design-review-result.md` |

## 成果物

| 成果物       | パス                            | 説明                              |
| ------------ | ------------------------------- | --------------------------------- |
| テストケース | `outputs/phase-4/test-cases.md` | TC-01〜TC-07 のテストケース定義書 |

## 統合テスト連携

- Phase 5 の実装は本 Phase の TC-01〜TC-07 をそのまま受入基準として使う。
- Phase 6 で追加する TC-08〜TC-11 は本テストケースを拡張する形で扱う。

## 完了条件

- [ ] TC-01〜TC-07 のテストケースが定義されている
- [ ] テストデータが定義されている
- [ ] Handlebars 構文チェック手順が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
