# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 8                         |
| Phase名    | リファクタリング          |
| 前提Phase  | Phase 7（カバレッジ確認） |
| 後続Phase  | Phase 9（品質保証）       |
| ステータス | 未実施                    |
| 作成日     | 2026-01-18                |
| 機能名     | api-keys-ui-improvement   |

---

## 目的

UI変更で追加したスタイル定義を整理し、可読性と保守性を高める。

## 背景

ApiKeysSectionと連携サービス表示で同じスタイル要素が増えるため、重複を整理して管理しやすい構造にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: スタイル重複の整理

**目的**: 登録済み表示に関するスタイル重複を減らす

**実行手順**:

1. ApiKeysSection内の登録済みスタイル文字列を抽出
2. `statusStyles` 定数を作成し、クラス名を集約
3. 変更点を `outputs/phase-8/refactoring-log.md` に記録

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

---

### タスク2: コード品質の再確認

**目的**: リファクタリングによる振る舞い変更がないことを確認する

**実行手順**:

1. 追加した定数が表示条件に影響しないことを確認
2. 結果を `outputs/phase-8/code-analysis.md` に記録

**期待される成果物**:

- `outputs/phase-8/code-analysis.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料          | パス                                                                       | 内容                              |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------- |
| APIキー設定UI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`         | APIキー設定と連携済み表示のUI仕様 |
| セキュリティ原則  | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | APIキーの取り扱いと表示制約       |
| APIエンドポイント | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`       | APIキー取得/登録/削除のAPI仕様    |

**前Phase成果物**

| 参照資料           | パス                                 | 内容           |
| ------------------ | ------------------------------------ | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ結果 |
| ゲート判定結果     | `outputs/phase-7/gate-result.md`     | 判定結果       |

---

**依存Phase成果物**

| 参照資料           | パス                                         | 内容         |
| ------------------ | -------------------------------------------- | ------------ |
| Phase 1 要件定義   | `outputs/phase-1/requirements-definition.md` | 要件整理     |
| Phase 2 設計       | `outputs/phase-2/design-document.md`         | 設計書       |
| Phase 5 実装       | `outputs/phase-5/implementation-summary.md`  | 実装サマリー |
| Phase 6 テスト拡充 | `outputs/phase-6/test-expansion-result.md`   | 拡充結果     |

## 成果物

| 成果物               | パス                                 | 内容     |
| -------------------- | ------------------------------------ | -------- |
| コード品質分析       | `outputs/phase-8/code-analysis.md`   | 影響確認 |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | 変更記録 |

---

## 統合テスト連携（Phase 1〜11は必須）

- リファクタ後に統合テストの結果が変わらないことを確認
- UI表示の差分がないことを確認

---

## 完了条件

- [ ] スタイル定義が整理されている
- [ ] リファクタリングログが作成されている
- [ ] テストがGreenである

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 8
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 実行タスク

- タスク1:
- タスク2:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 7（カバレッジ確認）の完了
- **後続**: Phase 9（品質保証）へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
pnpm --filter @repo/desktop test -- ApiKeysSection
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/api-keys-ui-improvement/phase-9-quality.md`
