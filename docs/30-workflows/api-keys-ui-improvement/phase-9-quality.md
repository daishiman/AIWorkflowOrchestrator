# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 9                              |
| Phase名    | 品質保証                       |
| 前提Phase  | Phase 8（リファクタリング）    |
| 後続Phase  | Phase 10（最終レビューゲート） |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | api-keys-ui-improvement        |

---

## 目的

品質チェックを実行し、UI変更がコード品質とテスト基準を満たすことを確認する。

## 背景

UI変更であっても、Lint・型・テストの結果を確認して品質を担保する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Lint/型チェック/テスト実行

**目的**: 基本的な品質チェックを実行する

**実行手順**:

1. Lintを実行してエラーがないことを確認
2. TypeScriptの型チェックを実行
3. ApiKeysSection関連テストを実行
4. 結果を `outputs/phase-9/eslint-result.md` と `outputs/phase-9/typecheck-result.md` と `outputs/phase-9/final-test-result.md` に記録

**期待される成果物**:

- `outputs/phase-9/eslint-result.md`
- `outputs/phase-9/typecheck-result.md`
- `outputs/phase-9/final-test-result.md`

---

### タスク2: 品質サマリー作成

**目的**: 品質確認結果をまとめる

**実行手順**:

1. Lint/型/テスト結果を統合
2. `outputs/phase-9/quality-summary.md` を作成

**期待される成果物**:

- `outputs/phase-9/quality-summary.md`

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

| 参照資料             | パス                                 | 内容     |
| -------------------- | ------------------------------------ | -------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | 変更記録 |

---

**依存Phase成果物**

| 参照資料     | パス                                        | 内容         |
| ------------ | ------------------------------------------- | ------------ |
| Phase 5 実装 | `outputs/phase-5/implementation-summary.md` | 実装サマリー |

## 成果物

| 成果物         | パス                                   | 内容           |
| -------------- | -------------------------------------- | -------------- |
| ESLint結果     | `outputs/phase-9/eslint-result.md`     | Lint結果       |
| TypeScript結果 | `outputs/phase-9/typecheck-result.md`  | 型チェック結果 |
| テスト結果     | `outputs/phase-9/final-test-result.md` | テスト結果     |
| 品質サマリー   | `outputs/phase-9/quality-summary.md`   | 品質まとめ     |

---

## 統合テスト連携（Phase 1〜11は必須）

- UI変更後の設定画面表示が統合テストで確認できることを確認
- テスト結果を品質サマリーに集約

---

## 完了条件

- [ ] Lintが成功している
- [ ] 型チェックが成功している
- [ ] テストが成功している
- [ ] 品質サマリーが作成されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 9
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

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

- **前提**: Phase 8（リファクタリング）の完了
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 品質ゲート（Phase 9 の場合）

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全E2Eテスト成功

#### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし

#### テスト網羅性

- [ ] 総合カバレッジ指数180%+達成

#### セキュリティ

- [ ] APIキー値のログ出力がない
- [ ] 重大な脆弱性なし

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/api-keys-ui-improvement/phase-10-final-review.md`
