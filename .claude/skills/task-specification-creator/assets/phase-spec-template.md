# Phase仕様書テンプレート

> **Progressive Disclosure**
> - 読み込みタイミング: Phase仕様書生成時（generate-task-specs Task実行時）
> - 読み込み条件: 各Phaseの詳細仕様書を生成するとき
> - 使用スキーマ: schemas/phase-spec.json
> - 構文: Handlebars（{{#each}}, {{#if}} など）
> - 組み合わせ: common-header-template.md, common-footer-template.md

---

# Phase {{PHASE_NUMBER}}: {{PHASE_NAME}} - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | {{PHASE_NUMBER}}     |
| Phase名    | {{PHASE_NAME}}       |
| 前提Phase  | Phase {{PREV_PHASE}} |
| 後続Phase  | Phase {{NEXT_PHASE}} |
| ステータス | 未実施               |
| 作成日     | {{CREATED_DATE}}     |
| 機能名     | {{FEATURE_NAME}}     |

---

## 目的

{{PHASE_PURPOSE}}

## 背景

{{PHASE_BACKGROUND}}

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**
> - このセクションには plan のみを書く。
> - `TASKS[*].steps` は実行前の手順だけを書く。実行結果、判定、取得値は書かない。
> - current fact は `Phase実行記録` または `outputs/phase-{{PHASE_NUMBER}}/` 配下の成果物へ記録する。
> - Phase 11 / Phase 12 の証跡は、本文と成果物を混在させずに分離する。

{{#each TASKS}}

### タスク{{@index}}: {{name}}

**目的**: {{purpose}}

**実行手順**:
{{#each steps}}
{{@index}}. {{this}}
{{/each}}

**期待される成果物**:
{{#each outputs}}
- {{this}}
{{/each}}

---

{{/each}}

## 参照資料

| 参照資料 | パス | 内容 |
| -------- | ---- | ---- |

{{#each REFERENCES}}
| {{name}} | {{path}} | {{description}} |
{{/each}}

---

## 成果物

| 成果物 | パス | 内容 |
| ------ | ---- | ---- |

{{#each OUTPUTS}}
| {{name}} | {{path}} | {{description}} |
{{/each}}

---

## 統合テスト連携（Phase 1〜11は必須）

{{INTEGRATION_TEST_ACTIONS}}

---

{{#if IS_PHASE_11}}
## Phase 11 手動テスト方針

{{#if IS_NON_VISUAL}}

- `manual-test-checklist.md` を必ず作成する
- `discovered-issues.md` を必ず作成する
- `screenshot-plan.json` は生成しない
- primary evidence は `vitest` / `typecheck` / `lint` / テンプレート仮生成確認
- `manual-test-result.md` には `TC-ID ↔ evidence`、NON_VISUAL である理由、代替 evidence を明記する
- placeholder-only の証跡は PASS 扱いにしない

{{else}}

- `manual-test-checklist.md` を必ず作成する
- `discovered-issues.md` を必ず作成する
- `screenshot-plan.json` と PNG 証跡を必須とする
- `manual-test-result.md` に `TC-ID ↔ PNG` の対応を明記する
- placeholder-only の証跡は PASS 扱いにしない

{{/if}}
{{/if}}

{{#if IS_PHASE_12}}
## Phase 12 記録分離方針

- `実行タスク` は plan、`Phase実行記録` と `outputs/phase-12/*.md` は current fact として扱う
- `phase12-task-spec-compliance-check.md` は Task / Step / validator / artifacts.json / current-baseline の同値性を集約する root evidence として必ず作成する
- docs-only / spec_created workflow では Step 1-B の status を `spec_created` とし、`completed` へ置き換えない
- 仕様更新の有無は `documentation-changelog.md` と `system-spec-update-summary.md` で同じ結論にする
- spec 変更がある場合は `topic-map.md` を同 wave で再生成する
{{/if}}

---

## 完了条件

{{#each COMPLETION_CRITERIA}}

- [ ] {{this}}
      {{/each}}

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase {{PREV_PHASE}} が完了していること
- **後続**: Phase {{NEXT_PHASE}} へ進む

---

## レビューゲート（Phase 3, 10 の場合）

{{#if IS_REVIEW_GATE}}

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

{{/if}}

---

## TDD検証（Phase 4, 5, 8 の場合）

{{#if IS_TDD_PHASE}}

### TDD サイクル確認

```bash
# テスト実行コマンド
{{TDD_TEST_COMMAND}}
```

**確認項目**:
{{#if IS_RED}}

- [ ] テストが失敗することを確認（Red状態）
      {{/if}}
      {{#if IS_GREEN}}
- [ ] テストが成功することを確認（Green状態）
      {{/if}}
      {{#if IS_REFACTOR}}
- [ ] リファクタリング後もテストが成功することを確認
      {{/if}}
      {{/if}}

---

## 品質ゲート（Phase 9 の場合）

{{#if IS_QUALITY_GATE}}

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全E2Eテスト成功

#### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] 総合カバレッジ指数180%+達成

#### セキュリティ

- [ ] 脆弱性スキャン完了
- [ ] 重大な脆弱性なし
      {{/if}}

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase {{PHASE_NUMBER}} 実行記録

### 実行タスク

{{#each TASKS}}
- {{name}}: {{result}}
{{/each}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/{{FEATURE_NAME}}/phase-{{NEXT_PHASE}}-*.md`
