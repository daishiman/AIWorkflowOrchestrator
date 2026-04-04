# Phase 9: 品質保証 - SkillCreator Layer3/4 severity フィルタ追加

## メタ情報

| 項目      | 値                                                    |
| --------- | ----------------------------------------------------- |
| Phase     | 9                                                     |
| 機能名    | task-skill-creator-layer34-ui-display-severity-filter |
| 作成日    | 2026-04-03                                            |
| 前提Phase | Phase 8                                               |
| 後続Phase | Phase 10                                              |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 実行タスク

### タスク1: 機能検証

**目的**: 自動テストの完全成功を確認する。

**手順**:

```bash
pnpm --filter @repo/desktop test -- SkillLifecyclePanel
```

### タスク2: コード品質

**目的**: Lint/型チェックをクリアする。

**手順**:

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

### タスク3: セキュリティ確認

**目的**: 重大な脆弱性がないことを確認する。

**手順**:

1. XSS: ユーザー入力を直接表示していないことを確認する（severity filter は固定値のみ）
2. 不正な state 操作: filter 値が型安全に制約されていることを確認する

### タスク4: IPC契約ドリフト検証

**目的**: IPC契約に影響がないことを確認する。

**手順**:

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
```

本タスクは Renderer 内完結のため、IPC契約への影響はないことを確認する。

## 品質ゲート

| 品質項目     | 確認内容              | 結果       |
| ------------ | --------------------- | ---------- |
| 機能検証     | 全自動テスト成功      | {{RESULT}} |
| コード品質   | Lint/型チェッククリア | {{RESULT}} |
| テスト網羅性 | カバレッジ基準達成    | {{RESULT}} |
| セキュリティ | 重大な脆弱性の不在    | {{RESULT}} |
| IPC契約      | ドリフトなし          | {{RESULT}} |

## 参照資料

| 資料名        | パス                                    | 説明             |
| ------------- | --------------------------------------- | ---------------- |
| Phase 7成果物 | `outputs/phase-7/coverage-report.md`    | カバレッジ       |
| Phase 8成果物 | `outputs/phase-8/refactoring-report.md` | リファクタリング |

## 統合テスト連携

| 品質項目   | 確認内容              | 結果       |
| ---------- | --------------------- | ---------- |
| 機能検証   | 全自動テスト成功      | {{RESULT}} |
| コード品質 | Lint/型チェッククリア | {{RESULT}} |
| IPC契約    | exit 0                | {{RESULT}} |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] 全自動テストが成功する
- [ ] Lint/型チェックがクリアする
- [ ] セキュリティ確認が完了する（XSS/不正state操作なし）
- [ ] IPC契約ドリフト検証が exit 0 で完了する
- [ ] 全品質ゲートをクリアする
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビューゲート
