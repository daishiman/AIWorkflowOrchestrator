# E2E権限テスト waitForTimeout改善 - タスク指示書

## メタ情報

```yaml
issue_number: 674
```

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | task-e2e-permission-waitfortimeout-001   |
| タスク名     | E2E権限テスト waitForTimeout改善         |
| 分類         | 改善                                     |
| 対象機能     | E2Eテスト - 権限ダイアログフロー         |
| 優先度       | 低                                       |
| 見積もり規模 | 小規模                                   |
| ステータス   | 未実施                                   |
| 発見元       | Phase 10（TASK-8C-D最終レビュー、TQ-M1） |
| 発見日       | 2026-02-02                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-8C-D（E2Eテスト - 権限ダイアログフロー）のPhase 10レビューにおいて、TC-5（選択記憶テスト）で`waitForTimeout(500)`および`waitForTimeout(1000)`を使用していることがMINOR指摘（TQ-M1）として記録された。

### 1.2 問題点・課題

- `waitForTimeout`は固定時間待機であり、CI環境や負荷状況により不安定（フレーキー）になるリスクがある
- Playwright公式ドキュメントでは、イベント完了やDOM変更を待機する方法（`waitForSelector`、`waitForFunction`等）を推奨
- 現状のテストは12/12 PASSしているが、将来的なCI並列実行時に不安定化の可能性

### 1.3 放置した場合の影響

- CI並列実行時にフレーキーテストとなる可能性（低確率）
- テスト実行時間の非効率化（固定待機のため）
- **機能的影響はなし**（現状テストは安定稼働中）

---

## 2. 何を達成するか（What）

### 2.1 目的

TC-5の`waitForTimeout`をイベントベースの待機処理に置き換え、テストの安定性と効率性を向上させる。

### 2.2 最終ゴール

- `waitForTimeout(500)`と`waitForTimeout(1000)`が削除されている
- 代替としてイベント完了待機（`waitForSelector`、`waitForFunction`等）を使用
- 12テスト全てが引き続きPASSする
- CI環境でのフレーキー率が0%を維持

### 2.3 スコープ

#### 含むもの

- `apps/desktop/e2e/skill-permission.spec.ts` の TC-5 修正

#### 含まないもの

- 他のテストケース（TC-1〜TC-4, TC-6〜TC-12）の修正
- テストケースの追加・削除
- テストロジックの変更（待機方法のみ変更）

### 2.4 成果物

- 更新された `skill-permission.spec.ts`（TC-5のwaitForTimeout削除）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-8C-Dが完了していること（完了済み）
- Playwright E2Eテストが実行可能であること

### 3.2 依存タスク

- TASK-8C-D（完了済み）

### 3.3 必要な知識

- Playwright の待機API（`waitForSelector`, `waitForFunction`, `waitForLoadState`等）
- 権限ダイアログのDOM構造とイベントフロー

### 3.4 推奨アプローチ

1. TC-5の現在の実装を確認し、waitForTimeoutの目的を特定
2. 対象のDOM要素またはイベントを特定
3. 適切な待機メソッドに置き換え
4. テスト実行で安定性を確認

---

## 4. 実行手順

### Phase構成

単一Phaseで完了（待機処理の置換のみ）

### Phase 1: waitForTimeout置換

#### 目的

TC-5の`waitForTimeout`をイベントベースの待機に置換

#### 手順

1. `apps/desktop/e2e/skill-permission.spec.ts`を開く
2. TC-5のテストコードを確認し、`waitForTimeout`の使用箇所を特定
3. `waitForTimeout(500)` → 該当するDOM変更またはイベント完了を待機する処理に置換
4. `waitForTimeout(1000)` → 同様に置換
5. テスト実行: `pnpm --filter @repo/desktop exec playwright test e2e/skill-permission.spec.ts`
6. 12テスト全PASSを確認
7. 複数回実行して安定性を確認（推奨: 5回以上）

#### 成果物

- 更新された `skill-permission.spec.ts`

#### 完了条件

- [ ] `waitForTimeout`がTC-5から削除されている
- [ ] 代替の待機処理が実装されている
- [ ] 12テスト全PASSする
- [ ] 複数回実行で安定性確認済み

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `waitForTimeout(500)`が削除されている
- [ ] `waitForTimeout(1000)`が削除されている
- [ ] 代替の待機処理が実装されている
- [ ] 12テスト全PASS

### 品質要件

- [ ] ESLintエラーが0件
- [ ] 5回以上のテスト実行で全PASS

### ドキュメント要件

- [ ] なし（コード修正のみ）

---

## 6. 検証方法

### テストケース

```bash
pnpm --filter @repo/desktop exec playwright test e2e/skill-permission.spec.ts
```

### 検証手順

1. テスト実行で12テスト全PASS
2. `grep -c "waitForTimeout" skill-permission.spec.ts`でwaitForTimeoutが0件
3. 5回連続実行で全PASS（フレーキーテストなし）

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                            |
| ---------------------- | ------ | -------- | ------------------------------- |
| 待機条件の誤り         | 中     | 低       | DOM構造を詳細に確認してから実装 |
| 新しい待機処理が不安定 | 中     | 低       | 複数回実行テストで安定性を確認  |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-8C-D-e2e-permission/outputs/phase-10/test-quality-review.md`（TQ-M1指摘）
- `apps/desktop/e2e/skill-permission.spec.ts`（対象ファイル）

### 参考資料

- Playwright公式ドキュメント: [Auto-waiting](https://playwright.dev/docs/actionability)
- Playwright公式ドキュメント: [Wait for events](https://playwright.dev/docs/events)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
TQ-M1: TC-5でwaitForTimeoutを使用している - フレーキーリスク低、将来のリファクタリング時に対応推奨
```

### 補足事項

- 優先度は低。現状テストは安定稼働中
- CI並列実行時の安定性向上が主目的
- TASK-8C-D完了後の品質改善タスクとして記録
