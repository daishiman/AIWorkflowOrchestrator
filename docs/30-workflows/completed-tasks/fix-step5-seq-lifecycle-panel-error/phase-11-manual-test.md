# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 11                        |
| Phase名    | 手動テスト                |
| 前提Phase  | Phase 10                  |
| 後続Phase  | Phase 12                  |
| ステータス | 完了                      |
| 作成日     | 2026-04-02                |
| 機能名     | fix-lifecycle-panel-error |

---

## 目的

エラー表示の有無による確認を行う。本タスクは `NON_VISUAL`（UIの目視確認不要）タスクであり、自動テスト代替で確認する。

## 背景

`currentPhase: 'handoff'` 時のエラー永続化はUIの視覚的変更を伴わない（エラーが「消えない」という消極的変化）ため、手動目視確認は自動テスト代替とする。ただし手動テスト結果ファイルは必ず作成する。

---

## 実行タスク

### タスク1: NON_VISUAL判定の記録

**目的**: 本タスクがNON_VISUALである理由を明記し、自動テスト代替の根拠を記録する。

**実行手順**:

1. `outputs/phase-11/manual-test-result.md` を作成する
2. NON_VISUALである理由を記載する:
   - 変更は「エラーメッセージが消えない」という消極的動作（UIの見た目変化なし）
   - `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントの連続配信はElectronアプリ起動なしに再現困難
   - 自動テストでIPCイベントをモックして完全に検証済み
3. 自動テスト代替の証跡（Phase 4-6のテスト結果）を参照リンクとして記載する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`（NON_VISUAL判定・理由・代替証跡）

---

### タスク2: 自動テスト代替確認の最終実行

**目的**: Phase 11時点での最終テスト実行結果を記録する。

**実行手順**:

1. エラー永続化テストを実行し、結果を記録する

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel.error-persistence"
```

2. 実行結果（テスト件数・PASS/FAIL）を `outputs/phase-11/manual-test-result.md` に追記する

**期待される成果物**:

- 最終テスト実行結果の記録

---

## 参照資料

| 参照資料         | パス                                                                                                  | 内容                  |
| ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------- |
| テストファイル   | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` | 自動テスト代替証跡    |
| 品質保証レポート | `outputs/phase-9/quality-report.md`                                                                   | Phase 9の品質確認結果 |

---

## 成果物

| 成果物         | パス                                     | 内容                                                   |
| -------------- | ---------------------------------------- | ------------------------------------------------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | NON_VISUAL判定・理由・自動テスト代替証跡・最終実行結果 |

---

## 統合テスト連携

- NON_VISUALタスクのため自動テスト代替で確認する
- 手動テストが不要な理由を明確に記録する（`screenshots/` ディレクトリは作成しない）

---

## 完了条件

- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] NON_VISUAL判定の理由が記載されている
- [ ] 自動テスト代替の証跡が参照されている
- [ ] Phase 11時点の最終テスト実行結果が記録されている
- [ ] `screenshots/` ディレクトリは作成しない（NON_VISUALのため `.gitkeep` も不要）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜2）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 手動テスト結果ファイルが生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート）が PASS または MINOR解消済みであること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/phase-12-documentation.md`
