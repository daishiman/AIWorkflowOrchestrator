# Phase 7: カバレッジ確認

## メタ情報

| 項目           | 値                                                                                   |
| -------------- | ------------------------------------------------------------------------------------ |
| タスク ID      | TASK-10A-A                                                                           |
| タスク名       | SkillManagementPanel 実装                                                            |
| Phase          | 7                                                                                    |
| 作成日         | 2026-03-02                                                                           |
| 前 Phase       | Phase 6（テスト拡充）                                                                |
| 次 Phase       | Phase 8（リファクタリング）                                                          |
| 対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` |
| 状態           | 未着手                                                                               |

## 目的

Phase 4-6 で作成したテスト（38 件）のカバレッジを計測し、プロジェクト品質基準を充足しているか検証する。未達の場合は Phase 6 に戻ってテストを追加する。

---

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 実行タスク

以下のタスクを順番に実行する。

---

### タスク 1: カバレッジレポートの生成

**目的**: SkillManagementPanel のカバレッジを計測する

**実行手順**:

1. 以下のコマンドを実行する:

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
```

2. コマンド出力のカバレッジサマリを確認する

**期待される出力例**:

```
 % Coverage report from v8
---------------------------------|---------|----------|---------|---------|
File                             | % Stmts | % Branch | % Funcs | % Lines |
---------------------------------|---------|----------|---------|---------|
SkillManagementPanel.tsx         |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
---------------------------------|---------|----------|---------|---------|
```

---

### タスク 2: カバレッジ分析

**目的**: 各指標が最低基準を充足しているか判定する

**実行手順**:

1. タスク 1 の出力から `SkillManagementPanel.tsx` の行を確認する
2. 以下の表に実測値を記入し、基準との比較を行う:

| 指標              | 最低基準 | 推奨基準 | 実測値 | 判定            |
| ----------------- | -------- | -------- | ------ | --------------- |
| Line Coverage     | 80%      | 90%      | XX.XX% | ✅達成 / ❌未達 |
| Branch Coverage   | 60%      | 70%      | XX.XX% | ✅達成 / ❌未達 |
| Function Coverage | 80%      | 90%      | XX.XX% | ✅達成 / ❌未達 |

3. 判定ルール:
   - 全指標が**最低基準**を満たしている → Phase 8 に進む
   - いずれかの指標が**最低基準**に未達 → タスク 3 を実行後、Phase 6 に戻る

---

### タスク 3: 未カバー箇所の特定（カバレッジ未達時のみ実行）

**目的**: テストされていないコードパスを特定し、Phase 6 で追加すべきテストを明確にする

**実行手順**:

1. カバレッジレポートの詳細（`coverage/` ディレクトリ内の HTML レポート）を確認する

```bash
cd apps/desktop && ls coverage/
```

2. `SkillManagementPanel.tsx` の未カバー行番号を一覧化する
3. 未カバー箇所を以下のカテゴリに分類する:

| カテゴリ   | 未カバー行（例）    | 追加すべきテスト内容 |
| ---------- | ------------------- | -------------------- |
| 分岐未通過 | L42-45（else 分岐） | 条件が false の場合  |
| 関数未呼出 | L80（handleXxx）    | 該当ハンドラのテスト |
| エラーパス | L90-95（catch 節）  | reject/throw テスト  |

4. 分類結果を `outputs/phase-7/uncovered-analysis.md` に記録する

**注意**: P41（v8 カバレッジプロバイダのインライン関数カウント）に留意する。インライン arrow function がカウントされる場合は、テスト内で明示的に呼び出すか、該当関数を別変数に切り出す

---

### タスク 4: カバレッジレポートの作成

**目的**: カバレッジ計測結果を成果物として記録する

**実行手順**:

`outputs/phase-7/coverage-report.md` に以下のフォーマットで記録する:

```markdown
# Phase 7 カバレッジレポート

## 対象ファイル

- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

## テスト件数

- Phase 4: 23 件
- Phase 6: 15 件
- 合計: 38 件

## カバレッジ結果

| 指標              | 最低基準 | 推奨基準 | 実測値 | 判定     |
| ----------------- | -------- | -------- | ------ | -------- |
| Line Coverage     | 80%      | 90%      | XX.XX% | （判定） |
| Branch Coverage   | 60%      | 70%      | XX.XX% | （判定） |
| Function Coverage | 80%      | 90%      | XX.XX% | （判定） |

## 総合判定

- [ ] 全指標が最低基準を充足 → Phase 8 に進む
- [ ] いずれかの指標が最低基準に未達 → Phase 6 に戻る

## 未カバー箇所（未達時のみ記載）

（タスク 3 の分析結果を記載）

## 実行日時

YYYY-MM-DD HH:mm:ss（実行時に記録）
```

---

## 参照資料

| 参照資料              | パス                                                                                        | 内容                             |
| --------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 5 実装          | `phase-5-implementation.md`                                                                 | 実装対象ファイルの確認           |
| Phase 6 テスト拡充    | `phase-6-test-expansion.md`                                                                 | 拡充テストケースの確認           |
| UI コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | スキル管理 UI 仕様               |
| UI 機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 機能別カバレッジ観点の確認       |
| テスト方針            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ基準                   |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | fireEvent 使い分けパターン       |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                                        | P41（v8 インライン関数カウント） |

---

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、一覧/検索/編集/分析/削除/新規作成の入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。

## 成果物

| 成果物                     | パス                                    | 説明                         |
| -------------------------- | --------------------------------------- | ---------------------------- |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`    | 計測結果と判定               |
| 未カバー分析（未達時のみ） | `outputs/phase-7/uncovered-analysis.md` | 未カバー箇所の分類と対応方針 |

---

## 完了条件

- [ ] `cd apps/desktop && pnpm vitest run --coverage` でカバレッジレポートを生成した
- [ ] `SkillManagementPanel.tsx` の Line Coverage が 80% 以上
- [ ] `SkillManagementPanel.tsx` の Branch Coverage が 60% 以上
- [ ] `SkillManagementPanel.tsx` の Function Coverage が 80% 以上
- [ ] 全 38 件のテストが PASS している
- [ ] `outputs/phase-7/coverage-report.md` が作成されている
- [ ] カバレッジ未達の場合は `outputs/phase-7/uncovered-analysis.md` を作成し、Phase 6 に戻る旨を記録した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

- カバレッジ基準充足 → Phase 8: リファクタリング（`phase-8-refactoring.md`）
- カバレッジ基準未達 → Phase 6: テスト拡充（`phase-6-test-expansion.md`）に戻る
