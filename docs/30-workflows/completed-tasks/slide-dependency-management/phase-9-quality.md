# Phase 9: 品質保証 - スライド依存関係管理システム

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| タスクID   | task-feat-slide-dependency-management-003 |
| 名称       | 品質保証                                  |
| ステータス | 未実施                                    |
| 依存Phase  | Phase 5                                   |

---

## 目的

静的解析・セキュリティ・性能の観点から品質を保証する。

---

## 使用スキル

| スキル名            | パス                                          | 選定理由                                      |
| ------------------- | --------------------------------------------- | --------------------------------------------- |
| static-analysis     | `.claude/skills/static-analysis/SKILL.md`     | 静的解析（Trigger: 静的解析）                 |
| security-scanning   | `.claude/skills/security-scanning/SKILL.md`   | セキュリティ検査（Trigger: セキュリティ）     |
| performance-testing | `.claude/skills/performance-testing/SKILL.md` | パフォーマンス検査（Trigger: パフォーマンス） |

**実行方法**: 各スキルのSKILL.mdを読み込み、スキルを参照して実行

---

## 統合テスト連携【必須】

### Phase 9での統合テスト連携アクション

品質保証で統合テスト結果を確認する。

**確認項目**:

1. 統合テストの成功確認
2. パフォーマンス基準の達成確認
3. セキュリティ脆弱性の不在確認

---

## 実行手順

### Step 1: 静的解析

```bash
# ESLint
pnpm lint

# TypeScript型チェック
pnpm typecheck

# 循環依存チェック
npx madge --circular packages/shared/src/slide/
npx madge --circular apps/desktop/src/
```

### Step 2: セキュリティ検査

```bash
# 依存関係の脆弱性チェック
pnpm audit

# シークレット検出
npx secretlint packages/ apps/
```

### Step 3: パフォーマンス検査

| 検査項目                     | 基準      | 実績 | 判定 |
| ---------------------------- | --------- | ---- | ---- |
| ファイル変更検知のレイテンシ | 500ms以内 | -    | ☐    |
| スキル実行中のUI応答性       | 操作可能  | -    | ☐    |
| メモリ使用量（ウォッチャー） | 100MB以下 | -    | ☐    |

### Step 4: 品質レポート作成

#### チェックリスト

| カテゴリ       | 項目               | 結果 |
| -------------- | ------------------ | ---- |
| 静的解析       | ESLintエラー数     | 0    |
| 静的解析       | TypeScriptエラー数 | 0    |
| 静的解析       | 循環依存           | なし |
| セキュリティ   | 高危険度脆弱性     | 0    |
| セキュリティ   | 中危険度脆弱性     | 0    |
| セキュリティ   | シークレット検出   | 0    |
| パフォーマンス | レイテンシ基準     | 達成 |
| パフォーマンス | メモリ基準         | 達成 |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 使用スキルの実行（各スキルごとに1タスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## 成果物

| 成果物       | パス                                | 説明                       | 必須 |
| ------------ | ----------------------------------- | -------------------------- | ---- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 静的解析・セキュリティ結果 | ✅   |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 品質保証時に必ず以下のシステム仕様を確認してください。

| 参照資料             | パス                                                                     | 内容                    |
| -------------------- | ------------------------------------------------------------------------ | ----------------------- |
| Electron IPC設計     | `.claude/skills/aiworkflow-requirements/references/electron-ipc-spec.md` | IPC通信仕様             |
| Agent SDK統合        | `.claude/skills/aiworkflow-requirements/references/agent-sdk-spec.md`    | Agent SDK統合仕様       |
| 状態管理ガイドライン | `.claude/skills/aiworkflow-requirements/references/state-management.md`  | Zustand使用ガイドライン |

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-dependency-management --phase 9

# Phase完了・成果物登録
node .claude/skills/task-specification-creator/scripts/complete-phase.mjs \
  --workflow docs/30-workflows/slide-dependency-management --phase 9 --artifacts "quality-report.md"
```

---

## 完了条件チェックリスト

- [ ] ESLint/Prettierエラーが0件
- [ ] TypeScriptエラーが0件
- [ ] 循環依存がない
- [ ] 高・中危険度の脆弱性がない
- [ ] パフォーマンス基準を達成
- [ ] 統合テスト結果が確認されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## スキルフィードバック記録

| スキル              | 結果    | 備考 |
| ------------------- | ------- | ---- |
| static-analysis     | pending | -    |
| security-scanning   | pending | -    |
| performance-testing | pending | -    |

---

## 前後Phase

- 前: [Phase 8: リファクタリング](phase-8-refactoring.md)
- 次: [Phase 10: 最終レビューゲート](phase-10-final-review.md)
