# SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除） - タスク指示書

## メタ情報

```yaml
issue_number: 2015
task_id: UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001
task_name: SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除）
category: リファクタリング
target_feature: SkillLifecyclePanel - ウィザード遷移ボタン化
priority: 中
scale: 小規模
status: unassigned
source: skill-wizard-redesign-lane Wave 0 完了後（W0と同時実行可能）
created_date: 2026-04-08
wave: W1-par-02d
dependencies:
  - W0-seq-01-types-skill-info-form（Phase 12 完了済み）
  - W0-seq-02-smart-default-reasoning-service（Phase 12 完了済み）
blocking:
  - W2-seq-03a-skill-create-wizard（ウィザード本体への遷移が機能するには W1-par-02a/02b/02c 完了も必要）
```

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| タスクID     | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001                                    |
| タスク名     | SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除）                           |
| 分類         | リファクタリング                                                                     |
| 対象機能     | SkillLifecyclePanel - ウィザード遷移ボタン化                                         |
| 優先度       | 中                                                                                   |
| 見積もり規模 | 小規模                                                                               |
| ステータス   | unassigned                                                                           |
| 発見元       | skill-wizard-redesign-lane Wave 0 完了後（W0と同時実行可能）                         |
| 発見日       | 2026-04-08                                                                           |
| Wave         | W1-par-02d                                                                           |
| 依存タスク   | W0-seq-01（完了済み）、W0-seq-02（完了済み）                                         |
| 後続タスク   | W2-seq-03a（ウィザードへの遷移ボタンが機能するには W1-par-02a/02b/02c の完了も必要） |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill-wizard-redesign-lane` の設計確定仕様として、`SkillLifecyclePanel.tsx` の UI を以下の方針に変更することが決まった。

- **テキストエリア削除**: 現行の自由入力テキストエリア（`skill-lifecycle-request-input`・`skill-lifecycle-execution-input`）を廃止する
- **ウィザード遷移ボタン化**: スキル作成は新しいウィザード（`SkillCreateWizard`）経由のみとし、`SkillLifecyclePanel` にはウィザードへの遷移ボタンを配置する

Wave 0 で共有型定義（W0-seq-01）とスマートデフォルト推論サービス（W0-seq-02）が完了し、Wave 1 の並列タスクが実行可能な状態となった。本タスクは Wave 1 の他タスク（02a/02b/02c）と独立して実行できる。

### 1.2 問題点・課題

現状の `SkillLifecyclePanel.tsx` では以下の問題が存在する。

- テキストエリアによる自由入力フローが残っており、新ウィザードと並行して 2 つの作成導線が混在している
- テキストエリアに依存した `request` state・`executionPrompt` state が使用されており、削除後に不要なコードが残る
- 遷移先のウィザードが完成する前でも、ボタン UI の配置・スタイリングは先行して実装できる

### 1.3 放置した場合の影響

- UI の重複導線が残り、ユーザーがどちらのフローを使うべきか混乱する
- W2-seq-03a（SkillCreateWizard オーケストレーション）の統合テスト時に不整合が生じる
- 不要な state・イベントハンドラが残り、コードの可読性・保守性が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillLifecyclePanel.tsx` からテキストエリアと関連ロジックを削除し、新ウィザードへの遷移ボタンのみを持つ軽量な UI に変更する。

### 2.2 最終ゴール

1. `SkillLifecyclePanel.tsx` のテキストエリア（`skill-lifecycle-request-input`・`skill-lifecycle-execution-input`）が削除されている
2. ウィザード遷移ボタンが配置されており、クリックで `SkillCreateWizard` への遷移が開始できる
3. 削除した state（`request`・`executionPrompt` 等のテキストエリア依存）がコード上に残っていない
4. 既存テストが更新されており全 PASS する
5. Phase 9 QA の `git delete OR export {} stub化かつ live import ゼロ` 基準を満たす

### 2.3 スコープ（含む/含まない）

**含む:**

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` のテキストエリア削除
- テキストエリアに依存する state・ハンドラの削除または整理（`request` state、`executionPrompt` state 等）
- ウィザード遷移ボタンの追加（`data-testid="skill-lifecycle-open-wizard-button"` 等）
- 既存テストファイル（`SkillLifecyclePanel.test.tsx` 等）の更新
- レイアウト調整（テキストエリア削除後のスペース整理）

**含まない:**

- ウィザード本体（`SkillCreateWizard`）の実装（W1-par-02a/02b/02c が担当）
- IPC チャネルの変更
- `SkillLifecyclePanel` の plan/execute/improve ロジック本体の変更（ボタンフロー以外）
- `W2-seq-03a` 以降の統合処理

### 2.4 成果物

| 成果物                                                                                                   | 種別           |
| -------------------------------------------------------------------------------------------------------- | -------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（修正済み）                         | 実装ファイル   |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`（更新）              | テストファイル |
| 関連テストファイル（adapter-status, approval, auth-regression, error-persistence, llm-generation）の更新 | テストファイル |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- W0-seq-01（`packages/shared/src/types/skillCreator` の型定義）が Phase 12 完了済みであること
- W0-seq-02（`inferSmartDefaults` サービス）が Phase 12 完了済みであること
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の現行コードを把握すること（読み込み必須）
- `SkillLifecyclePanel` に関連する全テストファイルの内容を把握すること

### 3.2 依存タスク

| タスク ID          | ステータス | 依存理由                                         |
| ------------------ | ---------- | ------------------------------------------------ |
| W0-seq-01          | 完了済み   | 共有型（SkillInfoFormData 等）の利用             |
| W0-seq-02          | 完了済み   | inferSmartDefaults の利用                        |
| W1-par-02a/02b/02c | 未完了     | ウィザード遷移ボタンの遷移先（完成後に疎通確認） |

### 3.3 必要な知識

- React の useState・useCallback フックの基本
- Tailwind CSS クラスによるスタイリング
- `data-testid` 属性を使用した Vitest + Testing Library のテスト記述方法
- `SkillLifecyclePanel.tsx` の現行 state 管理（`request`・`executionPrompt`・`approvedSkillSpec` 等）
- Phase 9 QA 基準: `git delete OR export {} stub化かつ live import ゼロ`

### 3.4 推奨アプローチ

1. `SkillLifecyclePanel.tsx` を全量読み込み、削除対象の state・ハンドラ・JSX 要素を特定する
2. テストファイル（`SkillLifecyclePanel.test.tsx` 含む 6 ファイル）を読み込み、`textarea` / `skill-lifecycle-request-input` / `skill-lifecycle-execution-input` を参照しているテストを特定する
3. テキストエリアを参照するテストを削除または書き換える（テキストエリアが存在しないことを検証するテストに変更も可）
4. `SkillLifecyclePanel.tsx` のテキストエリア 2 箇所を削除し、ウィザード遷移ボタンを追加する
5. 依存する state（`request`・`executionPrompt`・`approvedSkillSpec`）のうち、ウィザード遷移後に不要になるものを削除する
6. `pnpm --filter @repo/desktop typecheck` → `pnpm --filter @repo/desktop lint` → `pnpm --filter @repo/desktop test` の順に品質確認する

---

## 4. 実行手順（Phase 1-13）

| Phase | 名称             | 概要                                                                                                       |
| ----- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義         | `SkillLifecyclePanel.tsx` を全量読み込み、削除対象 state・JSX・テストを特定する。削除範囲を確定する        |
| 2     | 設計             | テキストエリア削除後のレイアウト設計。ウィザード遷移ボタンの配置・`data-testid`・スタイルを設計する        |
| 3     | 設計レビュー     | 設計が lane index の確定仕様（テキストエリア廃止・ウィザード遷移ボタンのみ）と整合するか確認する           |
| 4     | テスト作成       | 削除後の状態を検証するテストを作成する（テキストエリアが存在しないこと・遷移ボタンが存在することを検証）   |
| 5     | 実装             | テキストエリア 2 箇所・依存 state・依存ハンドラを削除し、ウィザード遷移ボタンを追加する                    |
| 6     | テスト拡充       | テキストエリアを参照していた既存テストを更新する。遷移ボタンのクリック動作テストを追加する                 |
| 7     | カバレッジ確認   | `SkillLifecyclePanel.tsx` の変更箇所のカバレッジを確認する                                                 |
| 8     | リファクタリング | 削除後に残った不要コード・コメントを整理する。`request` state 等のコメント（"live textarea"）を削除する    |
| 9     | 品質保証         | `git delete OR export {} stub化かつ live import ゼロ` を確認する。typecheck / lint / test を全 PASS させる |
| 10    | 最終レビュー     | 変更が lane index の確定仕様と完全に整合しているか最終確認する                                             |
| 11    | 手動テスト       | NON_VISUAL タスクのため console / mock / automation evidence を証跡として記録する                          |
| 12    | ドキュメント更新 | `implementation-guide.md` / `unassigned-task-detection.md` 等の canonical 6 成果物を揃える                 |
| 13    | PR 作成          | ユーザー承認後のみ実施（blocked 維持）                                                                     |

---

## 5. 完了条件チェックリスト

- [ ] `<textarea data-testid="skill-lifecycle-request-input">` が `SkillLifecyclePanel.tsx` から削除されている
- [ ] `<textarea data-testid="skill-lifecycle-execution-input">` が `SkillLifecyclePanel.tsx` から削除されている
- [ ] `request` state（テキストエリア入力値）が削除されている（または遷移ボタン用に用途変更されている）
- [ ] `executionPrompt` state が削除されている（または遷移ボタン用に用途変更されている）
- [ ] `approvedSkillSpec` state が削除されている（テキストエリア snapshot 用途の場合）
- [ ] ウィザード遷移ボタン（`data-testid="skill-lifecycle-open-wizard-button"` 相当）が追加されている
- [ ] `SkillLifecyclePanel.test.tsx` の更新が完了しており全 PASS している
- [ ] `SkillLifecyclePanel.adapter-status.test.tsx` の更新が完了している
- [ ] `SkillLifecyclePanel.approval.test.tsx` の更新が完了している
- [ ] `SkillLifecyclePanel.auth-regression.test.tsx` の更新が完了している
- [ ] `SkillLifecyclePanel.error-persistence.test.tsx` の更新が完了している
- [ ] `SkillLifecyclePanel.llm-generation.test.tsx` の更新が完了している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している
- [ ] `pnpm --filter @repo/desktop test` が PASS している
- [ ] Phase 9 QA 基準 `git delete OR export {} stub化かつ live import ゼロ` を満たしている

---

## 6. 検証方法

### 6.1 ユニットテスト

```bash
# SkillLifecyclePanel 関連テストの実行
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel
```

### 6.2 型チェック・Lint

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

### 6.3 削除確認（Phase 9 QA）

```bash
# テキストエリアの残存確認（0件であること）
grep -n "skill-lifecycle-request-input\|skill-lifecycle-execution-input" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# live textarea コメントの残存確認（0件であること）
grep -n "live textarea" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### 6.4 遷移ボタン存在確認

```bash
# ウィザード遷移ボタンの存在確認
grep -n "skill-lifecycle-open-wizard-button\|open.*wizard\|wizard.*button" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

---

## 7. リスクと対策

| リスク                                               | 確率 | 影響 | 対策                                                                                         |
| ---------------------------------------------------- | ---- | ---- | -------------------------------------------------------------------------------------------- |
| 既存テストが `textarea` を直接参照しており多数壊れる | 高   | 中   | テスト読み込みを Phase 1 で必ず行い、影響ファイル数を事前に確定する                          |
| `request` state を `textarea` 以外も参照している     | 中   | 中   | `request` の参照箇所を全量 grep で確認してから削除する                                       |
| テキストエリア削除後のレイアウト崩れ                 | 中   | 低   | 削除後のセクション（1. スキルを作成する / 2. 実行する）のパディング・余白を再確認する        |
| W1-par-02a/02b/02c 未完了時に遷移ボタンが機能しない  | 高   | 低   | このタスクの完了条件はボタンの「配置」のみ。遷移先未完成は既知の制約として記録する           |
| `approvedSkillSpec` を executePlan ハンドラが参照中  | 中   | 中   | executePlan ロジックとの依存関係を Phase 1 で確認し、必要なら state は維持しつつ UI だけ削除 |

---

## 8. 参照情報

| 参照先                                                                              | 用途                                          |
| ----------------------------------------------------------------------------------- | --------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                | 削除対象ファイル（実装の主体）                |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | 更新対象の主要テスト                          |
| `docs/30-workflows/skill-wizard-redesign-lane/index.md`                             | lane 設計確定仕様（テキストエリア廃止の根拠） |
| `docs/30-workflows/W0-seq-01-types-skill-info-form/`                                | 依存完了タスク（共有型定義）                  |
| `docs/30-workflows/W0-seq-02-smart-default-reasoning-service/`                      | 依存完了タスク（推論サービス）                |
| `.claude/skills/task-specification-creator/SKILL.md`                                | Phase 1-13 フォーマット準拠確認               |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                   | システム仕様正本                              |

---

## 9. 備考

### 苦戦箇所【記入必須】

1. **既存テストへの影響範囲の広さ**
   `SkillLifecyclePanel.tsx` の関連テストファイルは 6 ファイル存在する（`SkillLifecyclePanel.test.tsx` / `adapter-status` / `approval` / `auth-regression` / `error-persistence` / `llm-generation`）。これらの全ファイルで `textarea` の `data-testid` を参照している箇所があれば、一つずつ確認・更新が必要。Phase 1 でテストを全量読み込んで影響を把握すること。

2. **テキストエリア削除後のレイアウト調整**
   現行の UI は以下の 3 セクション構成となっており、セクション 1・2 にそれぞれ `textarea` が含まれる。
   - セクション 1: 「1. スキルを作成する」（`skill-lifecycle-request-input`）
   - セクション 2: 「2. 生成したスキルを実行する」（`skill-lifecycle-execution-input`）
   - セクション 3: 「3. 改善の次アクションを決める」（テキストエリアなし）

   テキストエリアを削除した後のセクション内のレイアウト（ボタン・説明文の配置）を再整理する必要がある。

3. **Phase 9 QA の `git delete OR export {} stub化かつ live import ゼロ` 基準**
   削除した state（`request`・`executionPrompt`）が他ファイルから import されていないか、`grep` で確認すること。これらは local state のため問題は低いが、型やユーティリティ関数として export されていた場合は stub 化またはそちらも削除が必要。

4. **`approvedSkillSpec` state の取り扱い**
   `approvedSkillSpec` は `executePlan` ハンドラで使用されており（`approvedSkillSpec ?? undefined`）、plan 承認時の snapshot を保持するために使用されている。テキストエリア（`request` state）からセットされるため、テキストエリア削除に伴い `setApprovedSkillSpec(trimmedRequest)` も削除対象となる可能性が高い。ただし `executePlan` ロジックへの影響があるため、Phase 1 でフロー全体を確認してから慎重に判断すること。

5. **ウィザードへの遷移ボタン機能は W1-par-02a/02b/02c 完了後**
   本タスクで追加するウィザード遷移ボタンは、完成したウィザード（`SkillCreateWizard` の Step 0/1/3）への遷移を行う。しかし W1-par-02a/02b/02c が未完了の段階では、ボタンクリック後の遷移先が存在しないため機能しない。このタスクは「ボタンの UI 配置・スタイリング・`data-testid` の追加」を完了条件とし、疎通確認は W2-seq-03a で行う。
