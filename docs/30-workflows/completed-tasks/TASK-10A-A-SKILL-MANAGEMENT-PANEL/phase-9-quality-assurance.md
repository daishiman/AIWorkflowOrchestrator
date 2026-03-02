# Phase 9: 品質検証

## メタ情報

| 項目           | 値                                                                                   |
| -------------- | ------------------------------------------------------------------------------------ |
| タスク ID      | TASK-10A-A                                                                           |
| タスク名       | SkillManagementPanel 実装                                                            |
| Phase          | 9                                                                                    |
| 作成日         | 2026-03-02                                                                           |
| 前 Phase       | Phase 8（リファクタリング）                                                          |
| 次 Phase       | Phase 10（最終レビュー）                                                             |
| 対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` |
| 状態           | 未着手                                                                               |

## 目的

ESLint・TypeScript 型チェック・Prettier・全テスト実行・カバレッジ確認の 5 項目を実行し、品質基準の充足を検証する。全項目で基準を満たさない限り Phase 10 に進めない。

---

## 実行タスク

- Gate 1（ESLint）: lint エラー/警告の閾値を確認する
- Gate 2（TypeScript）: 型エラー 0 件を確認する
- Gate 3（Prettier）: フォーマット不整合 0 件を確認する
- Gate 4（テスト）: 関連テストの全件 PASS を確認する
- Gate 5（カバレッジ）: Line/Branch/Function 基準達成を確認する

---

## 参照資料

| 参照資料              | パス                                                                                        | 内容                     |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 5 実装          | `phase-5-implementation.md`                                                                 | 実装品質の基準確認       |
| UI コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | UI 仕様                  |
| UI 機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 機能単位の品質確認       |
| UI デザインシステム   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | デザイントークン準拠確認 |
| IPC API契約           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | API契約逸脱の確認        |
| コード品質            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質基準                 |
| セキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ         |
| スキルIPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | スキル操作の防御観点     |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集           |
| 開発ガイドライン      | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | コーディング規約         |
| レビューゲート基準    | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`              | レビュー判定基準         |

---

## 実行手順

### Gate 1: ESLint 検証

```bash
cd apps/desktop && pnpm lint
```

**合格基準**:

- エラー: 0 件（1 件でも存在する場合は修正必須）
- 警告: 5 件以下（6 件以上の場合は修正必須）

**不合格時の対応**:

1. エラー内容を確認し、対象ファイルを修正する
2. `any` 型の使用が検出された場合は、正しい型定義に置き換える
3. 修正後に再度 `pnpm lint` を実行して 0 エラーを確認する

### Gate 2: TypeScript 型チェック

```bash
cd apps/desktop && pnpm typecheck
```

**合格基準**:

- 型エラー: 0 件

**不合格時の対応**:

1. エラー箇所を特定し、型定義を修正する
2. `any` 型の使用箇所がある場合は適切な型に置き換える
3. `@ts-ignore` / `@ts-expect-error` は使用禁止（使用する場合は理由コメント必須）
4. 型アサーション（`as`）でバリデーションを回避していないことを確認する
5. 修正後に再度 `pnpm typecheck` を実行して 0 エラーを確認する

### Gate 3: Prettier フォーマット検証

```bash
cd apps/desktop && pnpm format:check
```

**合格基準**:

- フォーマット不整合: 0 件

**不合格時の対応**:

1. `pnpm format` を実行して自動修正する
2. 修正後に再度 `pnpm format:check` を実行して 0 件を確認する

### Gate 4: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
```

**合格基準**:

- 関連テスト: 全件 PASS
- 既存テストの破壊なし（TASK-10A-A のテスト以外に新たな FAIL が発生していないこと）

**不合格時の対応**:

1. FAIL したテストのエラーメッセージを確認する
2. テストコードまたは実装コードを修正する
3. 修正後に再度テストを実行して全件 PASS を確認する

**既存テスト破壊の確認**:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose 2>&1 | tail -20
```

出力末尾の「Tests」行で FAIL 件数が 0 であることを確認する。

### Gate 5: カバレッジ最終確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx --coverage
```

**合格基準**（Phase 7 と同一基準）:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**不合格時の対応**:

- Phase 6 に戻り、不足テストを追加する

### Step 6: 品質レポートの作成

全 5 ゲートの結果を `outputs/phase-9/quality-report.md` に記録する:

```markdown
# Phase 9 品質検証レポート

## 品質ゲート結果サマリ

| #   | ゲート     | 結果    | 詳細                            |
| --- | ---------- | ------- | ------------------------------- |
| 1   | ESLint     | ✅ PASS | エラー0件, 警告X件              |
| 2   | TypeScript | ✅ PASS | エラー0件                       |
| 3   | Prettier   | ✅ PASS | 不整合0件                       |
| 4   | テスト     | ✅ PASS | X件中X件PASS                    |
| 5   | カバレッジ | ✅ PASS | Line X%, Branch X%, Function X% |

## Gate 1: ESLint 詳細

（コマンド出力を貼り付け）

## Gate 2: TypeScript 型チェック詳細

（コマンド出力を貼り付け）

## Gate 3: Prettier 詳細

（コマンド出力を貼り付け）

## Gate 4: テスト実行結果

（コマンド出力を貼り付け）

## Gate 5: カバレッジ詳細

| ファイル                 | Line | Branch | Function |
| ------------------------ | ---- | ------ | -------- |
| SkillManagementPanel.tsx | X%   | X%     | X%       |
```

---

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、一覧/検索/編集/分析/削除/新規作成の入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。

## 成果物

| 成果物       | パス                                | 説明                     |
| ------------ | ----------------------------------- | ------------------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 5 ゲートの検証結果を記録 |

---

## 完了条件

- [ ] ESLint エラー 0 件（警告 5 件以下）
- [ ] TypeScript 型エラー 0 件
- [ ] Prettier フォーマット不整合 0 件
- [ ] 全テスト PASS（既存テスト破壊なし）
- [ ] カバレッジ基準達成（Line ≥ 80%, Branch ≥ 60%, Function ≥ 80%）
- [ ] `outputs/phase-9/quality-report.md` を作成した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 10: 最終レビュー
