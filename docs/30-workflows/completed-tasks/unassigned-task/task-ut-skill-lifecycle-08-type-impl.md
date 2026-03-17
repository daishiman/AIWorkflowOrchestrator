# TASK-SKILL-LIFECYCLE-08 型定義ランタイム実装 - タスク指示書

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | UT-SKILL-LIFECYCLE-08-TYPE-IMPL                        |
| タスク名     | TASK-SKILL-LIFECYCLE-08 設計済み型定義のランタイム実装 |
| 分類         | 実装                                                   |
| 対象機能     | スキル公開・共有・互換性統合                           |
| 優先度       | 中                                                     |
| 見積もり規模 | 中規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | Phase 12（TASK-SKILL-LIFECYCLE-08）                    |
| 発見日       | 2026-03-17                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-08 は spec_created の設計タスクとして完了しているが、型定義の実体ファイルは未作成のままである。

### 1.2 問題点・課題

仕様書上の型（SkillVisibility / PublishReadiness 等）をコードから import できず、後続タスク（IPC 実装・UI 実装）が型安全に着手できない。

### 1.3 放置した場合の影響

後続タスクで独自型が乱立し、仕様ドリフトと互換性不整合が再発する。

---

## 2. 何を達成するか（What）

### 2.1 目的

設計済み型を `packages/shared` と `apps/desktop` の実コードへ確定配置し、import 可能な状態にする。

### 2.2 最終ゴール

8型と関連インターフェースが実ファイル化され、`packages/shared/src/index.ts` から re-export されている。

### 2.3 スコープ

#### 含むもの

- `publishing-types.ts` / `publish-eligibility.ts` / `skill-distribution.ts` の新規作成
- `SkillRegistryService` / `SkillDistributionService` / `CompatibilityChecker` / `PublishReadinessChecker` 型の配置
- shared barrel export 追加

#### 含まないもの

- IPC ハンドラ実装
- React UI 実装
- E2E テスト実装

### 2.4 成果物

- 実装済み型ファイル
- 変更に対応した unit test
- 更新済み `index.ts` export

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-LIFECYCLE-08 の Phase 2/5 仕様を参照可能
- shared package の build が通る環境

### 3.2 依存タスク

- TASK-SKILL-LIFECYCLE-08（spec_created）

### 3.3 必要な知識

- TypeScript discriminated union
- shared package export 設計
- semver/互換性定義

### 3.4 推奨アプローチ

Phase 5 `type-definitions.md` を正本にし、仕様どおりの型を first-pass で実装してから命名・lint 調整を行う。

### 3.5 親タスクの苦戦箇所（継承）

> 出典: TASK-SKILL-LIFECYCLE-08 lessons-learned-current.md / 06-known-pitfalls.md

#### P57: worktree 環境でのシステム仕様書更新先送り

| 項目   | 内容                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| リスク | worktree で `.claude/skills/` の実更新を「merge 後でよい」と先送りすると、仕様書と実装の乖離が Phase 12 完了条件を満たさなくなる |
| 回避策 | Phase 12 完了時点で `.claude/skills/` を実更新する。コンフリクトリスクより乖離リスクの方が高い                                   |

#### P36: カスタム declare module と SDK 実型の共存問題

| 項目   | 内容                                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| リスク | `packages/shared/src/` にカスタム `.d.ts` と SDK 実型が共存すると、TypeScript が実型を優先してカスタム型が無視される |
| 回避策 | 型定義を作成する前に `grep -rn "declare module" packages/shared/` で既存カスタム型を確認し、衝突を排除する           |

#### Object.freeze + satisfies パターン（UT-06-001 教訓）

| 項目   | 内容                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------- |
| リスク | `Object.freeze()` の戻り値を `as Record<K, V>` でキャストすると freeze の不変性保証が型レベルで失われる（P19 違反） |
| 回避策 | `satisfies Record<K, V>` パターンで型チェック + リテラル型保持 + freeze 不変性の三重防御を実現する                  |

#### 5分解決カード

1. Phase 1 で `grep -rn "declare module\|SkillVisibility" packages/shared/` を実行し、既存型との衝突を先に確認する。
2. discriminated union は `satisfies` で型検査し、`as` キャストを排除する。
3. shared barrel export 追加後は `pnpm --filter @repo/shared build && pnpm --filter @repo/desktop typecheck` を同ターンで実行する。
4. Phase 12 では `.claude/skills/` の実更新を先送りしない（P57 準拠）。

---

## 4. 実行手順

### Phase構成

Phase A（型定義実装）→ Phase B（export/テスト）→ Phase C（仕様同期）

### Phase A: 型定義実装

#### 目的

設計済み型をコードへ反映する。

#### 手順

1. `outputs/phase-5/type-definitions.md` の型一覧を確定する
2. `packages/shared/src/skill/publishing-types.ts` を作成する
3. `packages/shared/src/types/publish-eligibility.ts` / `skill-distribution.ts` を作成する

#### 成果物

3ファイルの型定義実装

#### 完了条件

型エラーがなく、設計との差分が説明可能である

### Phase B: export とテスト

#### 目的

実装型を利用可能にし、基本品質を担保する。

#### 手順

1. `packages/shared/src/index.ts` に export を追加する
2. 型レベルの単体テストを追加する
3. `pnpm --filter @repo/shared test:run` と `build` を実行する

#### 成果物

export 更新、テスト結果

#### 完了条件

shared の test/build が PASS

### Phase C: 仕様同期

#### 目的

実装結果を system spec へ同期する。

#### 手順

1. `task-workflow-backlog.md` の該当行ステータスを更新する
2. `interfaces-agent-sdk-skill.md` へ実装済み情報を追記する
3. `documentation-changelog` と `lessons-learned` を更新する

#### 成果物

更新済み仕様書

#### 完了条件

仕様と実装の差分が0件

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 設計済み8型が実装されている
- [ ] Service interface 型が実装されている

### 品質要件

- [ ] `pnpm --filter @repo/shared build` が PASS
- [ ] `pnpm --filter @repo/shared test:run` が PASS

### ドキュメント要件

- [ ] system spec に実装反映済み
- [ ] backlog ステータスが同期済み

---

## 6. 検証方法

### テストケース

- 型 import 成功
- discriminated union narrowing 成功
- invalid visibility 値コンパイルエラー

### 検証手順

1. `pnpm --filter @repo/shared test:run`
2. `pnpm --filter @repo/shared build`
3. `pnpm --filter @repo/shared typecheck`

---

## 7. リスクと対策

| リスク           | 影響度 | 発生確率 | 対策                               |
| ---------------- | ------ | -------- | ---------------------------------- |
| 既存型との衝突   | 中     | 中       | 新規ファイルへ隔離し段階移行する   |
| 命名不整合の拡大 | 中     | 中       | naming-audit を同時実施する        |
| export 漏れ      | 中     | 低       | build と import テストを必須化する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/outputs/phase-5/type-definitions.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`（TASK-08 苦戦箇所）
- `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`（PublishReadiness 公開判定マトリクス）
- `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`（登録・更新・停止フロー）

### 参考資料

- `packages/shared/src/types/skill-share.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 12 未タスク検出: 型定義は設計完了だがランタイム実装未完了。
```

### 補足事項

本タスクは TASK-SKILL-LIFECYCLE-08 の実装フェーズ先頭で実施する。
