# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 3                  |
| Phase名    | 設計レビューゲート |
| 前提Phase  | Phase 2            |
| 後続Phase  | Phase 4            |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

Phase 1-2の成果物（要件定義・テスト設計）の品質を検証し、Phase 4（テスト作成）への進行可否を判定する。

## 背景

テスト設計の品質がテスト実装の品質を決定する。設計段階でモック境界の誤りやテストケースの漏れを検出することで、Phase 4以降の手戻りを防止する。

## 実行タスク

### Task 1: テストケース網羅性検証

**目的**: TASK-8A仕様の44テストケースが設計で100%カバーされていることを検証する。

**実行手順**:

1. `outputs/phase-2/test-design.md` を読み込む
2. index.md のテストケース一覧（SS-01〜SKS-12）と設計のGiven-When-Then定義を1対1で突合する
3. 以下の検証を行う：
   - **網羅性**: 44件すべてに対応するテスト設計が存在すること
   - **正確性**: Given-When-Then が実装ソースコードの振る舞いと一致すること
   - **テスタビリティ**: 設計されたテストが実際にVitestで実行可能であること
4. 不備があれば具体的な修正指示を記録する
5. 結果を `outputs/phase-3/design-review-result.md` に出力する

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`

### Task 2: モック境界検証

**目的**: モック戦略がモジュール境界を正しく反映していることを検証する。

**実行手順**:

1. `outputs/phase-2/mock-strategy.md` を読み込む
2. 以下の観点で検証する：
   - **分離性**: 各テストが他モジュールの実装に依存していないこと
   - **リアリズム**: モックの振る舞いが実際のモジュール仕様と乖離していないこと
   - **IPC境界**: Main Process のモジュール同士が直接依存をモックし、IPC経由のテストを含めていないこと
   - **SDK境界**: `@anthropic-ai/claude-agent-sdk` のモックが公開APIのみをモックしていること
3. SkillExecutor テストにおいて、PermissionResolver への依存がモック化されていることを確認する
4. skillSlice テストにおいて、`window.electronAPI.skill` の全メソッドがスタブ化されていることを確認する
5. 不備があれば修正指示を `outputs/phase-3/design-review-result.md` に追記する

### Task 3: レビュー判定

**目的**: レビュー結果に基づきPASS/MINOR/MAJOR/CRITICALの判定を行う。

**実行手順**:

1. Task 1, Task 2の検証結果を集約する
2. 以下の基準で判定する：

| 判定     | 条件                                 | アクション          |
| -------- | ------------------------------------ | ------------------- |
| PASS     | 不備なし                             | Phase 4へ進行       |
| MINOR    | 軽微な表現修正のみ                   | 修正後Phase 4へ進行 |
| MAJOR    | テストケース漏れまたはモック境界誤り | 該当Phaseへ差し戻し |
| CRITICAL | 要件定義の根本的な誤り               | Phase 1へ差し戻し   |

3. 差し戻し先と修正内容を具体的に記載する
4. 判定結果を `outputs/phase-3/design-review-result.md` の末尾に記載する

## 参照資料

| 参照資料           | パス                                                                      | 説明           |
| ------------------ | ------------------------------------------------------------------------- | -------------- |
| テスト設計書       | `outputs/phase-2/test-design.md`                                          | レビュー対象   |
| モック戦略         | `outputs/phase-2/mock-strategy.md`                                        | レビュー対象   |
| フィクスチャ設計   | `outputs/phase-2/fixture-design.md`                                       | レビュー対象   |
| テストヘルパー設計 | `outputs/phase-2/test-helper-design.md`                                   | レビュー対象   |
| TASK-8A仕様書      | `docs/30-workflows/skill-import-agent-system/tasks/task-8a-unit-tests.md` | 元仕様         |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                                  | 定量基準       |
| 既存テスト監査結果 | `outputs/phase-1/existing-test-audit.md`                                  | Phase 1 成果物 |
| ギャップ分析       | `outputs/phase-1/gap-analysis.md`                                         | Phase 1 成果物 |
| モジュール分析     | `outputs/phase-1/module-analysis.md`                                      | Phase 1 成果物 |

## 成果物

| 成果物           | パス                                      | 説明                                |
| ---------------- | ----------------------------------------- | ----------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | PASS/MINOR/MAJOR/CRITICAL判定と詳細 |

## 統合テスト連携

- 単体テスト設計が統合テスト（TASK-8B, TASK-8C）の設計と矛盾しないことを確認する
- 特にモック境界の設計が統合テストのテスト範囲と重複・漏れなく補完関係にあることを検証する

## 完了条件

- [ ] 44テストケースの設計網羅性が検証されている
- [ ] モック境界が5モジュールすべてで正しいことが確認されている
- [ ] PASS/MINOR/MAJOR/CRITICALの判定が下されている
- [ ] MAJORまたはCRITICALの場合、差し戻し先と修正内容が具体的に記載されている
- [ ] 設計レビュー結果が `outputs/phase-3/` に生成されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 3 \
  --artifacts "outputs/phase-3/design-review-result.md:設計レビュー結果"
```

## 依存関係

| 項目      | 内容    |
| --------- | ------- |
| 前提Phase | Phase 2 |
| 後続Phase | Phase 4 |

## 次のPhase

→ [phase-4-test-creation.md](phase-4-test-creation.md)
