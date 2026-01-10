# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 7                          |
| Phase名    | テストカバレッジ確認       |
| 前提Phase  | Phase 6                    |
| 後続Phase  | Phase 8                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | agent-dashboard-foundation |

---

## 目的

テストカバレッジが目標値を満たしているか確認し、不足があれば追加テストを作成する。

## 背景

品質基準を満たすために、コードカバレッジの確認と必要に応じた追加テストの実装を行う。

---

## 使用スキル

> このPhaseはゲートフェーズのため、スキルの呼び出しは不要です。
> カバレッジ計測とレポート作成を行います。

---

## 参照資料

| 参照資料     | パス                                      | 内容          |
| ------------ | ----------------------------------------- | ------------- |
| テスト仕様   | `outputs/phase-4/test-specification.md`   | Phase 4成果物 |
| 境界値テスト | `outputs/phase-6/boundary-value-tests.md` | Phase 6成果物 |
| エッジケース | `outputs/phase-6/edge-case-tests.md`      | Phase 6成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容           |
| -------- | --------------------------------------------------------------------------- | -------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ目標 |

---

## カバレッジ目標

| メトリクス         | 目標値 | 必須/推奨 |
| ------------------ | ------ | --------- |
| Line Coverage      | 80%+   | 必須      |
| Branch Coverage    | 60%+   | 必須      |
| Function Coverage  | 80%+   | 必須      |
| Statement Coverage | 80%+   | 推奨      |

---

## カバレッジ計測

### 計測コマンド

```bash
# カバレッジ計測
pnpm --filter @repo/desktop test:coverage

# カバレッジレポート生成
pnpm --filter @repo/desktop test:coverage --reporter=html

# 特定ファイルのカバレッジ確認
pnpm --filter @repo/desktop test:coverage -- --coverage.include="**/agentSlice.ts"
pnpm --filter @repo/desktop test:coverage -- --coverage.include="**/AgentView/**"
```

### 対象ファイル

| ファイル        | パス                                                        | 目標カバレッジ   |
| --------------- | ----------------------------------------------------------- | ---------------- |
| agentSlice      | `apps/desktop/src/renderer/store/slices/agentSlice.ts`      | 80%+             |
| AgentView       | `apps/desktop/src/renderer/views/AgentView/index.tsx`       | 80%+             |
| navigationSlice | `apps/desktop/src/renderer/store/slices/navigationSlice.ts` | 80%+ (agent部分) |

---

## 判定基準

| 判定 | 条件                             | 対応                   |
| ---- | -------------------------------- | ---------------------- |
| PASS | 全メトリクスが目標値以上         | Phase 8へ進行          |
| FAIL | いずれかのメトリクスが目標値未満 | 追加テスト作成後再計測 |

---

## 成果物

| 成果物             | パス                                 | 内容               |
| ------------------ | ------------------------------------ | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ計測結果 |
| 不足箇所リスト     | `outputs/phase-7/coverage-gaps.md`   | 未カバー箇所       |

---

## カバレッジレポートテンプレート

```markdown
## Phase 7 カバレッジレポート

### 計測日時

- 日時: {{datetime}}
- コミットハッシュ: {{commit-hash}}

### 全体カバレッジ

| メトリクス         | 実測値 | 目標値 | 判定    |
| ------------------ | ------ | ------ | ------- |
| Line Coverage      | {{%}}  | 80%    | {{✓/✗}} |
| Branch Coverage    | {{%}}  | 60%    | {{✓/✗}} |
| Function Coverage  | {{%}}  | 80%    | {{✓/✗}} |
| Statement Coverage | {{%}}  | 80%    | {{✓/✗}} |

### ファイル別カバレッジ

| ファイル            | Line  | Branch | Function | 判定    |
| ------------------- | ----- | ------ | -------- | ------- |
| agentSlice.ts       | {{%}} | {{%}}  | {{%}}    | {{✓/✗}} |
| AgentView/index.tsx | {{%}} | {{%}}  | {{%}}    | {{✓/✗}} |

### 未カバー箇所

- {{file}}:{{line}} - {{reason}}

### 総合判定

- 判定: {{PASS/FAIL}}
- 備考: {{note}}
```

---

## 完了条件

- [ ] カバレッジ計測が実行されている
- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上
- [ ] カバレッジレポートが作成されている
- [ ] 判定がPASSである

---

## Phase末端アクション【必須】

- [ ] カバレッジ計測を実行
- [ ] レポートを作成
- [ ] 判定結果を記録

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む（PASS時）

---

## スキルフィードバック記録（Phase完了後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### カバレッジ結果

- Line Coverage: {{%}}
- Branch Coverage: {{%}}
- Function Coverage: {{%}}
- 判定: {{PASS/FAIL}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-dashboard-foundation/phase-8-refactoring.md`
