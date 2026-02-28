# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成・CI確認               |
| タスクID   | TASK-9J                      |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし（マージ準備完了）       |
| ステータス | 未実施                       |
| 作成日     | 2026-02-28                   |
| 機能名     | TASK-9J-skill-analytics      |

---

## 目的

`/ai:diff-to-pr` スキルを使用してコミット・PR作成・CI確認を行い、マージ準備を完了する。

## 背景

全ての開発フェーズが完了した後、変更をリモートリポジトリに反映する。
PR作成とCI確認により、マージ前の最終チェックを行う。

---

## 重要な注意事項

**⚠️ PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                           | 理由                                     |
| ---------------------------------- | ---------------------------------------- |
| 勝手にPRを作成する                 | レビュー前の変更がリモートに反映される   |
| ユーザー確認なしでスキルを実行する | 意図しないブランチやコミットが作成される |
| ローカル確認をスキップする         | 動作確認されていないコードがPRに含まれる |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認チェック

**目的**: PR作成前に全てのチェックがパスすることを確認する

**実行手順**:

1. shared パッケージをビルドする
2. 型チェックがパスすることを確認する
3. Lintエラーがないことを確認する
4. 全テストがパスすることを確認する

**コマンド**:

```bash
# shared パッケージビルド
pnpm --filter @repo/shared build

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint確認
pnpm --filter @repo/desktop lint

# テスト確認（SkillAnalytics + AnalyticsStore + skillHandlers）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillAnalytics --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/AnalyticsStore --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**チェックリスト**:

- [ ] shared ビルドが成功する
- [ ] 型チェックがパスする
- [ ] Lintエラーがない
- [ ] 全テストがパスする

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

---

### タスク2: 変更内容の確認

**目的**: コミット対象の変更内容を確認する

**実行手順**:

1. `git status` で変更ファイルを確認する
2. `git diff` で差分を確認する
3. 意図しない変更がないか確認する
4. 機密情報が含まれていないか確認する

**確認事項**:

| 確認項目           | 確認内容                             |
| ------------------ | ------------------------------------ |
| 変更ファイル       | 想定通りのファイルのみ変更されている |
| 機密情報           | APIキー等が含まれていない            |
| 不要ファイル       | ビルド成果物等が含まれていない       |
| コードフォーマット | Prettier が適用されている            |

**想定される変更ファイル**:

| ファイル                                                                | 変更種別 |
| ----------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/services/skill/SkillAnalytics.ts`                | 新規     |
| `apps/desktop/src/main/services/skill/AnalyticsStore.ts`                | 新規     |
| `packages/shared/src/types/skill-analytics.ts`                          | 新規     |
| `packages/shared/src/types/index.ts`                                    | 修正     |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                            | 修正     |
| `apps/desktop/src/preload/channels.ts`                                  | 修正     |
| `apps/desktop/src/preload/skill-api.ts`                                 | 修正     |
| `apps/desktop/src/preload/types.ts`                                     | 修正     |
| `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics.test.ts` | 新規     |
| `apps/desktop/src/main/services/skill/__tests__/AnalyticsStore.test.ts` | 新規     |
| `apps/desktop/src/main/ipc/__tests__/skillAnalyticsHandlers.test.ts`    | 新規     |
| `packages/shared/src/types/__tests__/skill-analytics.test.ts`           | 新規     |
| `docs/30-workflows/TASK-9J-skill-analytics/**`                          | 新規     |

**期待される成果物**:

- `outputs/phase-13/change-summary.md`

---

### タスク3: ユーザー確認の取得

**目的**: PR作成の許可をユーザーから取得する

**実行手順**:

1. 変更内容のサマリーを提示する
2. PR作成の許可を求める
3. 許可が得られたら次のタスクへ進む

**提示内容**:

```markdown
## PR作成確認

以下の内容でPRを作成します:

### 変更サマリー

TASK-9J: スキル使用統計・分析機能をMain Processに実装

### 新規ファイル

- SkillAnalytics.ts（分析サービス: イベント記録・統計・サマリー・トレンド・エクスポート）
- AnalyticsStore.ts（electron-storeによる永続化）
- skillAnalyticsHandlers.ts（skill:analytics:\* IPCハンドラー5件）
- skill-analytics.ts（8インターフェース型定義）

### 修正ファイル

- ipc/index.ts（SkillAnalyticsハンドラー登録・DI配線）
- channels.ts / skill-api.ts（Preload API拡張）
- types/index.ts（re-export追加）

### テスト

- SkillAnalytics.test.ts, AnalyticsStore.test.ts, skillAnalyticsHandlers.test.ts, skill-analytics.test.ts

### ローカルチェック結果

- 型チェック: PASS
- Lint: PASS
- テスト: PASS

PRを作成してよろしいですか？
```

**期待される成果物**:

- ユーザーからの許可（チャット上）

---

### タスク4: `/ai:diff-to-pr` 実行

**目的**: PR作成スキルを実行する

**実行手順**:

1. ユーザーの許可を確認する
2. `/ai:diff-to-pr` スキルを実行する
3. PRが作成されたことを確認する
4. PR URLを記録する

**スキル実行**:

```
/ai:diff-to-pr
```

**PR情報テンプレート**:

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| タイトル | feat(skill-analytics): TASK-9J スキル使用統計・分析機能を実装 |
| ブランチ | feature/task-9j-skill-analytics-spec                          |
| ベース   | main                                                          |

**PR本文テンプレート**:

```markdown
## Summary

- スキル使用統計・分析機能のバックエンド（Main Process）を実装
- IPCハンドラー5チャンネル（record/statistics/summary/trend/export）を追加
- electron-storeによるイベントデータ永続化を実装
- 共有型定義8インターフェースを追加

## Test Plan

- [ ] SkillAnalytics ユニットテストが全PASSする
- [ ] AnalyticsStore ユニットテストが全PASSする
- [ ] skillHandlers 分析関連テストが全PASSする
- [ ] skill-analytics 型テストが全PASSする
- [ ] 型チェック（pnpm typecheck）がPASSする
- [ ] Lint（pnpm lint）がPASSする
```

**期待される成果物**:

- `outputs/phase-13/pr-creation-result.md`
- PR URL

---

### タスク5: CI確認・マージ準備完了報告

**目的**: CIがパスしマージ準備が完了したことを確認・報告する

**実行手順**:

1. GitHub上でCIの実行状況を確認する
2. 全CIジョブがパスすることを確認する
3. PRのレビュー準備が整ったことを報告する
4. タスクディレクトリを `completed-tasks/` に移動する準備をする

**確認事項**:

| CI項目     | 期待結果 | 実際 |
| ---------- | -------- | ---- |
| ビルド     | PASS     | -    |
| テスト     | PASS     | -    |
| 型チェック | PASS     | -    |
| Lint       | PASS     | -    |

**タスクディレクトリ移動（マージ後に実行）**:

```bash
# マージ後に実行
mv docs/30-workflows/TASK-9J-skill-analytics docs/30-workflows/completed-tasks/TASK-9J-skill-analytics
```

**期待される成果物**:

- `outputs/phase-13/ci-result.md`
- `outputs/phase-13/merge-readiness-report.md`

---

## 参照資料

| 参照資料               | パス                                                     | 内容                 |
| ---------------------- | -------------------------------------------------------- | -------------------- |
| ai:diff-to-pr コマンド | `.claude/commands/ai/diff-to-pr.md`                      | PR作成手順           |
| SkillAnalytics実装     | `apps/desktop/src/main/services/skill/SkillAnalytics.ts` | 実装コード           |
| AnalyticsStore実装     | `apps/desktop/src/main/services/skill/AnalyticsStore.ts` | 実装コード           |
| Phase 1成果物          | `outputs/phase-1/requirements-definition.md`             | 要件定義             |
| Phase 2成果物          | `outputs/phase-2/architecture-design.md`                 | 設計成果物           |
| Phase 5成果物          | `outputs/phase-5/implementation-summary.md`              | 実装成果物           |
| Phase 6成果物          | `outputs/phase-6/coverage-report.md`                     | テスト拡充           |
| Phase 7成果物          | `outputs/phase-7/coverage-report.md`                     | カバレッジ           |
| Phase 8成果物          | `outputs/phase-8/refactoring-log.md`                     | リファクタ結果       |
| Phase 9成果物          | `outputs/phase-9/quality-report.md`                      | 品質保証結果         |
| Phase 10成果物         | `outputs/phase-10/final-review-result.md`                | 最終レビュー         |
| Phase 11成果物         | `outputs/phase-11/discovered-issues.md`                  | 手動テスト結果       |
| Phase 12成果物         | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴 |
| Gitルール              | `.claude/rules/07-git-and-tooling.md`                    | Git操作ルール        |

---

## 成果物

| 成果物           | パス                                         | 内容         |
| ---------------- | -------------------------------------------- | ------------ |
| ローカルチェック | `outputs/phase-13/local-check-result.md`     | チェック結果 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`         | 変更内容     |
| PR作成結果       | `outputs/phase-13/pr-creation-result.md`     | PR情報       |
| CI結果           | `outputs/phase-13/ci-result.md`              | CI状況       |
| マージ準備報告   | `outputs/phase-13/merge-readiness-report.md` | 最終報告     |

---

## 完了条件

- [ ] ローカルチェック（ビルド、テスト、型、Lint）が全てパスしている
- [ ] 変更内容が確認されている
- [ ] ユーザーからPR作成の許可が得られている
- [ ] PRが作成されている
- [ ] CIが全てパスしている
- [ ] マージ準備完了報告が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] PR URLをユーザーに報告

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（マージ準備完了）

---

## タスク完了

**⚠️ 注意**: マージはユーザーがGitHub UI上で手動で実行してください。

```markdown
## TASK-9J: スキル使用統計・分析機能実装 完了

### 成果物

- SkillAnalytics.ts（イベント記録・統計・サマリー・トレンド・エクスポート）
- AnalyticsStore.ts（electron-storeによる永続化）
- skill-analytics.ts（8インターフェース型定義）
- skillHandlers.ts に5ハンドラー追加（record, statistics, summary, trend, export）
- Preload API拡張（channels.ts, skill-api.ts, types.ts）
- ユニットテスト実装完了
- 実装ガイド作成完了

### PR

- URL: {{PR_URL}}
- ステータス: マージ準備完了

### 次のステップ

- GitHub UIでPRをレビュー・マージしてください
- マージ後、task-031b（スキル使用統計UI）が開始可能になります
```
