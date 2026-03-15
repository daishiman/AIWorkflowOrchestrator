# TASK-IMP-SKILL-LIFECYCLE-05-E2E-SCENARIOS-COVERAGE-001

## メタ情報

```yaml
issue_number: 1244
```

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| タスクID   | TASK-IMP-SKILL-LIFECYCLE-05-E2E-SCENARIOS-COVERAGE-001 |
| カテゴリ   | imp（改善）                                            |
| 優先度     | 中                                                     |
| 規模       | large                                                  |
| ステータス | 未着手                                                 |
| 発見源     | TASK-SKILL-LIFECYCLE-05 Phase 12 実装ガイド作成時      |
| 作成日     | 2026-03-15                                             |

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-SKILL-LIFECYCLE-05 で定義した3シナリオ（作成直後に使う/あとから使う/履歴から再利用する）の導線契約は Phase 4 テスト設計（TC-FLOW-A01〜A05, TC-FLOW-B01〜B05, TC-FLOW-C01〜C05）で定義済みだが、E2E テストとして自動化されていない。単体テスト（30件 GREEN）では画面間遷移とデータフローの統合を検証できない。

### 問題点

3導線の画面遷移契約が E2E レベルで固定されていないため、コンポーネント単体の変更が導線全体を破壊しても回帰テストで検出できない。特に ScoringGate 境界値（59/60/79/80/99/100）での CTA 表示切替は、画面間のデータ受け渡しと連動するため E2E レベルでの検証が必須。

### 放置時の影響

- 画面間契約が回帰で崩れても検出されない
- ScoringGate 境界値での CTA 表示判定が画面遷移と連動する部分の不具合が見逃される
- 3シナリオの導線が実装変更で暗黙的に壊れるリスクが継続する

## 2. 何を達成するか（What）

### 目的

TASK-SKILL-LIFECYCLE-05 の3シナリオを Playwright E2E テストとして自動化し、導線契約を固定する。

### 最終ゴール

3本の E2E spec ファイルが CI で安定実行され、ScoringGate 境界値を含む導線検証が自動化されている。

### スコープ

- **含む**: 3シナリオの E2E テスト作成、seed データ/mock 整備、ScoringGate 境界値テスト
- **含まない**: ユニットテストの追加、コンポーネントの実装変更

### 成果物

| 名前                                      | 説明                                            |
| ----------------------------------------- | ----------------------------------------------- |
| `e2e/created-skill-immediate-use.spec.ts` | シナリオA: スキル作成→即時利用の E2E テスト     |
| `e2e/skill-center-reuse.spec.ts`          | シナリオB: Skill Center → 再利用の E2E テスト   |
| `e2e/history-rerun.spec.ts`               | シナリオC: 履歴→再実行の E2E テスト             |
| seed データ定義                           | シナリオ別の前提データと mock 定義              |
| ScoringGate 境界値テスト                  | 59/60/79/80/99/100 の6ポイントでの CTA 表示検証 |

## 3. どのように実行するか（How）

### 前提条件

- Playwright が `apps/desktop` に設定済み
- `cta-visibility.ts` の CTA 制御マトリクスが実装済み（30テスト GREEN）
- Phase 4 テスト設計（TC-FLOW-A/B/C）が完了している

### 推奨アプローチ

シナリオ単位で spec を分離し、mock 戦略と screenshot 証跡を同時に整備する。ScoringGate 境界値は `test.each` で parameterized テストとして実装する。

### 3.5. 苦戦しやすいポイント（TASK-SKILL-LIFECYCLE-05 実体験ベース）

- **NaN 境界値テストの教訓**: TASK-SKILL-LIFECYCLE-05 で `getScoreGateResult(NaN)` が `normalizeScore()` のクランプ処理で 0 に正規化される挙動の把握に時間がかかった。E2E テストでも ScoringGate 境界値（59/60 の切替、79/80 の切替）を正確にテストする必要がある。`normalizeScore()` のクランプ挙動を前提としたテストケース設計が重要
- **create/use/improve の前提データ不足**: シナリオA（作成直後）は作成済みスキルが必要だが、作成フローの mock が不完全だとテストが不安定化する。seed データを固定的に定義し、フロー全体を mock で制御する
- **設計タスクでの実装判断の応用**: TASK-SKILL-LIFECYCLE-05 は設計タスクだが `cta-visibility.ts` を実装した。E2E テストも「テスト設計の検証」として設計タスクの延長で実装可能だが、Playwright 環境の整備は実装タスクのスコープとして明確に分離する
- **ScoreGate 境界値と導線判定の組み合わせ爆発**: 3シナリオ × 6境界値 = 18ケースだが、各シナリオで有効な CTA が異なるため、テストケースの重複と漏れに注意する。`CTA_VISIBILITY_MAP` を直接参照して期待値を生成する

```typescript
// ScoringGate 境界値 parameterized テスト例
const boundaryValues = [
  { score: 59, expectedGate: "NEEDS_IMPROVEMENT" },
  { score: 60, expectedGate: "SAVE_ALLOWED" },
  { score: 79, expectedGate: "SAVE_ALLOWED" },
  { score: 80, expectedGate: "USE_ALLOWED" },
  { score: 99, expectedGate: "USE_ALLOWED" },
  { score: 100, expectedGate: "RECOMMENDED" },
] as const;

test.each(boundaryValues)(
  "score $score → gate $expectedGate",
  async ({ score, expectedGate }) => {
    // CTA_VISIBILITY_MAP[expectedGate] から期待される CTA 表示を取得
  },
);
```

## 4. 実行手順

1. Playwright 環境を確認し、Electron テスト設定を整備する
2. シナリオ A/B/C の E2E spec ファイルを作成する
3. seed データと mock をシナリオ別に準備する（スキル作成済み/未作成/履歴あり/なし）
4. 各シナリオの基本フロー（画面遷移 → CTA クリック → 結果画面表示）をテストする
5. ScoringGate 境界値（59/60/79/80/99/100）を `test.each` で追加する
6. NaN/Infinity の異常値テストを追加する
7. screenshot 証跡を保存し、Phase 11 の手動テスト結果と紐づける
8. CI で安定実行されることを確認する（retry 設定含む）

## 5. 完了条件チェックリスト

- [ ] シナリオ A/B/C の E2E spec が作成されている
- [ ] 各シナリオの画面遷移フロー全体がテストされている
- [ ] ScoringGate 境界値（59/60/79/80/99/100）がテストされている
- [ ] NaN/Infinity の異常値テストが含まれている
- [ ] seed データと mock が固定的に定義されている
- [ ] CI で3回連続安定実行できる（flake rate 0%）
- [ ] Phase 11 証跡と紐づいている

## 6. 検証方法

```bash
# シナリオ A: 作成直後→即時利用
pnpm --filter @repo/desktop exec playwright test e2e/created-skill-immediate-use.spec.ts

# シナリオ B: Skill Center → 再利用
pnpm --filter @repo/desktop exec playwright test e2e/skill-center-reuse.spec.ts

# シナリオ C: 履歴 → 再実行
pnpm --filter @repo/desktop exec playwright test e2e/history-rerun.spec.ts

# 全シナリオ一括
pnpm --filter @repo/desktop exec playwright test e2e/created-skill-*.spec.ts e2e/skill-center-*.spec.ts e2e/history-*.spec.ts

# CI 安定性確認（3回連続実行）
for i in 1 2 3; do pnpm --filter @repo/desktop exec playwright test e2e/ && echo "Run $i: PASS"; done
```

## 7. リスクと対策

| リスク                          | 影響度 | 確率 | 対策                                                        |
| ------------------------------- | ------ | ---- | ----------------------------------------------------------- |
| E2E が flake する               | 高     | 高   | seed/mock 固定と retry 基準（最大2回）を定義する            |
| 境界値ケースが冗長化            | 低     | 中   | `CTA_VISIBILITY_MAP` を直接参照して期待値を生成し重複を防ぐ |
| Electron テスト環境の整備コスト | 中     | 中   | 既存の Playwright 設定を確認し、最小限の追加で対応する      |
| NaN 境界値で予期しない挙動      | 中     | 低   | `normalizeScore()` のクランプ挙動をテスト前提条件に明記する |

## 8. 参照情報

| ドキュメント              | パス                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase 4 テスト設計        | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-4/flow-test-design.md`        |
| Phase 12 未タスクレポート | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-12/unassigned-task-report.md` |
| CTA 制御マトリクス        | `packages/shared/src/types/cta-visibility.ts`                                                                                  |
| CTA テスト（単体）        | `packages/shared/src/types/__tests__/cta-visibility.test.ts`                                                                   |
| workflow 正本             | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`                    |
| ScoringGate 正本          | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`                        |
| Phase 11 手動テスト       | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-11/`                          |

## 9. 備考

- E2E 導入時は `phase11-static-server` fallback との責務境界を明示する
- TASK-SKILL-LIFECYCLE-05 の NaN 境界値テストの教訓（`normalizeScore()` のクランプ挙動）を E2E テスト設計に直接反映する
- 3シナリオ × 6境界値 = 18ケースの組み合わせ爆発に対して、`CTA_VISIBILITY_MAP` を期待値の single source of truth として使用する
