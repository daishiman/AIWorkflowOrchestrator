# TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| 機能名     | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 |
| 作成日     | 2026-03-05                                           |
| ステータス | Phase 1-12 実行完了（Phase 13 未実施）               |
| 総Phase数  | 13                                                   |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了       |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了       |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 完了       |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了       |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了       |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了       |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了       |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了       |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了       |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 完了       |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了       |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了       |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未実施     |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Atent Team編成（SubAgent）

| SubAgent   | 関心ごと        | 実行モード |
| ---------- | --------------- | ---------- |
| SubAgent-A | Main/IPC責務    | 並列       |
| SubAgent-B | Preload/API契約 | 並列       |
| SubAgent-C | Renderer/UX契約 | 並列       |
| SubAgent-D | 統合監査        | 直列       |

### 並列/直列ポリシー

1. Phase内は SubAgent-A/B/C を並列実行し、SubAgent-D が直列で統合監査する。
2. Phase間は `artifacts.json` の依存関係に従い直列で進める。
3. 依存衝突または重大矛盾を検出した場合は、直前依存Phaseへ差し戻す。

---

## aiworkflow-requirements 抽出カバレッジ

| 観点           | 抽出先仕様                                                                                                            | 反映先  |
| -------------- | --------------------------------------------------------------------------------------------------------------------- | ------- |
| アーキテクチャ | `architecture-overview.md`, `arch-electron-services.md`, `architecture-implementation-patterns.md`                    | 全Phase |
| API/IPC        | `api-ipc-auth.md`, `api-ipc-system.md`, `ipc-contract-checklist.md`                                                   | 全Phase |
| セキュリティ   | `security-electron-ipc.md`, `security-api-electron.md`, `security-principles.md`                                      | 全Phase |
| 品質/運用      | `quality-requirements.md`, `task-workflow.md`, `lessons-learned.md`, `development-guidelines.md`, `error-handling.md` | 全Phase |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物 |
| ----- | ---------- |
| 1     | -          |
| 2     | -          |
| 3     | -          |
| 4     | -          |
| 5     | -          |
| 6     | -          |
| 7     | -          |
| 8     | -          |
| 9     | -          |
| 10    | -          |
| 11    | -          |
| 12    | -          |
| 13    | -          |

---

_このファイルは `generate-index.js` の出力をベースに、Atent Team運用と aiworkflow-requirements 抽出カバレッジを手動補正しています。_
_最終更新: 2026-03-05T23:52:00+09:00_
