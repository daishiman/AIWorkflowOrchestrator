# TASK-RALLY-001 - SkillLifecyclePanel dead code削除

## メタ情報

| 項目                | 値                                                           |
| ------------------- | ------------------------------------------------------------ |
| タスクID            | TASK-RALLY-001                                               |
| 機能名              | skill-lifecycle-panel-dead-code-removal                      |
| 作成日              | 2026-04-21                                                   |
| ステータス          | in-progress                                                  |
| 総Phase数           | 13                                                           |
| 衝突ドメイン        | SkillLifecyclePanel                                          |
| 実行形態            | seq（SkillLifecyclePanelドメイン先頭）                       |
| タスク間依存        | なし（Wave 0: RALLY-001, RALLY-002, RALLY-004 が並列実行可） |
| implementation_mode | new                                                          |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

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

### タスク間の直列/並列

```
Wave 0（並列）: RALLY-001, RALLY-002, RALLY-004 は同時実行可（ファイル衝突なし）
↓
Wave 1（直列）: RALLY-005 ← RALLY-001完了が前提
               （SkillLifecyclePanel.tsx に対してRALLY-005が変更を加えるため、
                 RALLY-001でdead codeを先に除去しておく必要がある）
```

### Phase内の直列/並列

```
Phase 1内:
  SubAgent-A（対象コード調査: SkillLifecyclePanel.tsx grep確認）┐ 並列
  SubAgent-B（影響範囲分析: 他ファイルからの参照確認）          ┘
  ↓
  SubAgent-C（統合・矛盾チェック: 削除可否の最終判断）← 直列

Phase 2〜3: 監査結果の統合が必要なため直列
Phase 4〜10: Phase依存チェーンを尊重して直列
Phase 11〜13: close-out / approval gate のため直列
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/wave0-par-RALLY-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                              |
| ----- | ------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, P50チェック結果, 影響範囲分析 |
| 2     | 削除対象コードリスト, 削除手順設計, 検証方法            |
| 3     | 設計レビュー結果, ゲート判定, リスク評価表              |
| 4     | テスト仕様書（既存テスト通過確認計画）                  |
| 5     | 実装サマリー, 変更ファイル一覧                          |
| 6     | 回帰テスト結果                                          |
| 7     | カバレッジ確認結果                                      |
| 8     | リファクタリング計画（本タスクでは不要なし確認）        |
| 9     | 品質レポート                                            |
| 10    | 最終レビュー結果, ゲート判定                            |
| 11    | 手動テスト結果                                          |
| 12    | 変更サマリー, ドキュメント更新履歴                      |
| 13    | PR作成準備記録（user approval 待ち）                    |

## 現在地

- Phase 1〜12 完了（dead code 削除実装・全 AC PASS・全成果物出力済み）
- Phase 13 は user approval 取得まで `blocked` 扱い
