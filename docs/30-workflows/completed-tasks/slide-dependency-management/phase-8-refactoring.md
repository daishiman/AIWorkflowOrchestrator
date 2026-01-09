# Phase 8: リファクタリング - スライド依存関係管理システム

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 8                                         |
| タスクID   | task-feat-slide-dependency-management-003 |
| 名称       | リファクタリング                          |
| ステータス | 未実施                                    |
| 依存Phase  | Phase 1, 2, 5, 6, 7                       |

---

## 目的

TDD: Refactor - テストを維持しながらコード品質を改善する。

---

## 使用スキル

| スキル名               | パス                                             | 選定理由                                    |
| ---------------------- | ------------------------------------------------ | ------------------------------------------- |
| refactoring-techniques | `.claude/skills/refactoring-techniques/SKILL.md` | リファクタリング技法（Trigger: リファクタ） |
| clean-code-practices   | `.claude/skills/clean-code-practices/SKILL.md`   | クリーンコード実践（Anchor: Clean Code）    |
| solid-principles       | `.claude/skills/solid-principles/SKILL.md`       | SOLID原則チェック（Trigger: SOLID）         |

**実行方法**: 各スキルのSKILL.mdを読み込み、スキルを参照して実行

---

## 統合テスト連携【必須】

### Phase 8での統合テスト連携アクション

リファクタ後の統合テスト継続成功を確認する。

**確認項目**:

1. 既存の統合テストがすべて成功すること
2. リファクタリングによる振る舞いの変化がないこと
3. パフォーマンスの劣化がないこと

---

## 実行手順

### Step 1: コード品質分析

```bash
# 静的解析
pnpm lint

# 複雑度分析
npx eslint --format=json packages/shared/src/slide/ > complexity-report.json

# 重複コード検出
npx jscpd packages/shared/src/slide/ apps/desktop/src/
```

### Step 2: リファクタリング対象の特定

| 対象             | 問題点           | 改善方針         |
| ---------------- | ---------------- | ---------------- |
| （分析後に記載） | （分析後に記載） | （分析後に記載） |

### Step 3: リファクタリング実施

#### 安全なリファクタリングの原則

1. **小さな変更**: 一度に1つの変更のみ
2. **テスト実行**: 各変更後にテストを実行
3. **コミット**: 各成功した変更をコミット

#### 一般的なリファクタリングパターン

- **Extract Function**: 長い関数を分割
- **Extract Variable**: 複雑な式に名前を付ける
- **Rename**: より明確な名前に変更
- **Move**: 適切な場所に移動
- **Inline**: 不要な抽象化を削除

### Step 4: テスト実行

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run

# 統合テスト実行
pnpm test:integration

# カバレッジ確認（低下していないこと）
pnpm test:coverage
```

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

| 成果物               | パス                                 | 説明                         | 必須 |
| -------------------- | ------------------------------------ | ---------------------------- | ---- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 実施したリファクタリング内容 | ✅   |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> リファクタリング時に必ず以下のシステム仕様を確認し、仕様との整合性を確保してください。

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-dependency-management --phase 8

# Phase完了・成果物登録
node .claude/skills/task-specification-creator/scripts/complete-phase.mjs \
  --workflow docs/30-workflows/slide-dependency-management --phase 8 --artifacts "refactoring-log.md"
```

---

## 完了条件チェックリスト

- [ ] すべてのテストが成功している
- [ ] 統合テストが継続成功している
- [ ] コードカバレッジが低下していない
- [ ] ESLint/Prettierエラーがない
- [ ] 重複コードが削減されている
- [ ] コードの可読性が向上している
- [ ] **本Phase内の全スキルを100%実行完了**

---

## スキルフィードバック記録

| スキル                 | 結果    | 備考 |
| ---------------------- | ------- | ---- |
| refactoring-techniques | pending | -    |
| clean-code-practices   | pending | -    |
| solid-principles       | pending | -    |

---

## 前後Phase

- 前: [Phase 7: カバレッジ確認](phase-7-coverage-check.md)
- 次: [Phase 9: 品質保証](phase-9-quality.md)
