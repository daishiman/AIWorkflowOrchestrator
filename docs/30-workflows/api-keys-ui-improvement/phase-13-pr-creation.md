# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし（完了）                 |
| ステータス | 未実施                       |
| 作成日     | 2026-01-18                   |
| 機能名     | api-keys-ui-improvement      |

---

## 目的

変更内容をPull Requestとしてまとめ、CI結果を確認して完了報告を作成する。

## 背景

全Phaseが完了した段階で、リモートへの反映に向けた最終手順を実行する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認

**目的**: PR作成前に品質チェックを実行する

**実行手順**:

1. 以下のコマンドを順番に実行:

```bash
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test -- ApiKeysSection
```

2. 全て成功したことを確認
3. 結果を `outputs/phase-13/local-check-result.md` に記録

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

---

### タスク2: コミット作成

**目的**: 変更内容をコミットする

**実行手順**:

1. 変更ファイルを確認
2. コミットメッセージを作成
3. **ユーザーの明示的な許可を得てから**コミットを実行

**期待される成果物**:

- コミット作成

---

### タスク3: PR作成

**目的**: Pull Requestを作成する

**実行手順**:

1. **ユーザーの明示的な許可を得る**
2. `/ai:diff-to-pr` を実行してPRを作成
3. PR本文に概要・変更点・テスト計画を記載

**期待される成果物**:

- PR URL

---

### タスク4: CI確認

**目的**: CIが成功することを確認する

**実行手順**:

1. PR作成後にCIの結果を確認
2. 成功結果を `outputs/phase-13/ci-result.md` に記録

**期待される成果物**:

- `outputs/phase-13/ci-result.md`

---

### タスク5: 完了報告

**目的**: 最終報告を作成する

**実行手順**:

1. PR URLとCI結果を整理
2. `outputs/phase-13/completion-report.md` に記録

**期待される成果物**:

- `outputs/phase-13/completion-report.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料          | パス                                                               | 内容                              |
| ----------------- | ------------------------------------------------------------------ | --------------------------------- |
| APIキー設定UI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md` | APIキー設定と連携済み表示のUI仕様 |

**前Phase成果物**

| 参照資料   | パス                                       | 内容     |
| ---------- | ------------------------------------------ | -------- |
| 実装ガイド | `outputs/phase-12/implementation-guide.md` | 機能解説 |

---

**依存Phase成果物**

| 参照資料                 | パス                                        | 内容         |
| ------------------------ | ------------------------------------------- | ------------ |
| Phase 2 設計             | `outputs/phase-2/design-document.md`        | 設計書       |
| Phase 5 実装             | `outputs/phase-5/implementation-summary.md` | 実装サマリー |
| Phase 6 テスト拡充       | `outputs/phase-6/test-expansion-result.md`  | 拡充結果     |
| Phase 7 カバレッジ確認   | `outputs/phase-7/gate-result.md`            | ゲート結果   |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-log.md`        | 変更記録     |
| Phase 9 品質保証         | `outputs/phase-9/quality-summary.md`        | 品質まとめ   |
| Phase 10 最終レビュー    | `outputs/phase-10/final-review-result.md`   | レビュー判定 |
| Phase 11 手動テスト      | `outputs/phase-11/manual-test-result.md`    | 手動結果     |

## 成果物

| 成果物           | パス                                     | 内容     |
| ---------------- | ---------------------------------------- | -------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | 確認結果 |
| CI結果           | `outputs/phase-13/ci-result.md`          | CI結果   |
| 完了報告         | `outputs/phase-13/completion-report.md`  | 最終報告 |

---

## 完了条件

- [ ] ローカル確認が全て成功している
- [ ] コミットが作成されている
- [ ] PRが作成されている
- [ ] CIが成功している
- [ ] 完了報告が作成されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 13
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

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

## PR作成前ローカル確認チェックリスト

| #   | 確認項目             | コマンド                                             | 結果 |
| --- | -------------------- | ---------------------------------------------------- | ---- |
| 1   | ビルドが成功する     | `pnpm --filter @repo/desktop build`                  | ?    |
| 2   | 全テストがパスする   | `pnpm --filter @repo/desktop test -- ApiKeysSection` | ?    |
| 3   | 型チェックがパスする | `pnpm --filter @repo/desktop typecheck`              | ?    |
| 4   | Lintエラーがない     | `pnpm --filter @repo/desktop lint`                   | ?    |
