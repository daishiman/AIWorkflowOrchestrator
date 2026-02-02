# コンポーネントテスト名の日本語統一 - タスク指示書

## メタ情報

```yaml
issue_number: 662
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | task-imp-component-tests-naming-consistency-001 |
| タスク名     | コンポーネントテスト名の日本語統一              |
| 分類         | 改善                                            |
| 対象機能     | skill-import-agent-system コンポーネントテスト  |
| 優先度       | 低                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 10（TASK-8B最終レビュー、指摘M-01）       |
| 発見日       | 2026-02-02                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-8Bコンポーネントテスト（280テスト）のPhase 10最終レビューにおいて、SkillStreamingView.test.tsxのテストケース名が英語で記述されていることが指摘された（M-01）。他の8テストファイル（SkillSelector, SkillImportDialog, PermissionDialog等）はすべて日本語のテストケース名を使用している。

### 1.2 問題点・課題

- SkillStreamingView.test.tsx（33テスト）のdescribe/itブロック名が英語
- 他の8ファイルは日本語テストケース名を使用（「TC-001: スキル未選択時に "なし" を表示する」等）
- コードベース内でテスト命名規則の一貫性が欠如

### 1.3 放置した場合の影響

- テスト失敗時のエラーメッセージが英語と日本語で混在し、デバッグ効率がわずかに低下
- 新規メンバーがテスト追加時にどちらの命名規則に従うべきか迷う可能性
- **機能的影響はなし**（テスト結果・カバレッジに影響しない）

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillStreamingView.test.tsxのテストケース名を日本語に統一し、9テストファイル全体で一貫した命名規則を確立する。

### 2.2 最終ゴール

- SkillStreamingView.test.tsxのdescribe/itブロック名が日本語に変換されている
- 33テスト全てが引き続きPASSする
- カバレッジが維持されている（Line 99.31%, Branch 93.75%, Function 100%）

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx`のテストケース名変換

#### 含まないもの

- テストロジックの変更
- 他テストファイルの修正（既に日本語）
- テストケースの追加・削除

### 2.4 成果物

- 更新されたSkillStreamingView.test.tsx（テストケース名のみ変更）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-8Bが完了していること（完了済み）
- apps/desktopパッケージのテストが実行可能であること

### 3.2 依存タスク

- TASK-8B（完了済み）

### 3.3 必要な知識

- Vitest/Jest のdescribe/itブロック構文
- 既存テストの日本語命名規則（「TC-XXX: 日本語の説明」パターン）

### 3.4 推奨アプローチ

1. 既存の日本語テストケース名のパターンを確認（例: PermissionDialog.test.tsx）
2. SkillStreamingView.test.tsxの英語テストケース名を日本語に変換
3. テスト実行で全33テストがPASSすることを確認

---

## 4. 実行手順

### Phase構成

単一Phaseで完了（テストケース名の文字列置換のみ）

### Phase 1: テストケース名変換

#### 目的

SkillStreamingView.test.tsxのdescribe/itブロック名を日本語に変換

#### 手順

1. `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx`を開く
2. 各describeブロック名を日本語に変換（例: `"rendering"` → `"レンダリング"`）
3. 各itブロック名をTC番号付きの日本語に変換（例: `"should display skill name"` → `"TC-001: スキル名を表示する"`）
4. テスト実行: `cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx`
5. 33テスト全PASSを確認

#### 成果物

- 更新されたSkillStreamingView.test.tsx

#### 完了条件

- [ ] 全describe/itブロック名が日本語に変換されている
- [ ] 33テスト全PASSする
- [ ] カバレッジが維持されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillStreamingView.test.tsxの全テストケース名が日本語
- [ ] TC番号が付与されている（TC-001〜TC-033）
- [ ] 33テスト全PASS

### 品質要件

- [ ] テストカバレッジが変わっていない
- [ ] ESLintエラーが0件

### ドキュメント要件

- [ ] なし（テストケース名変更のみ）

---

## 6. 検証方法

### テストケース

```bash
cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx
```

### 検証手順

1. テスト実行で33テスト全PASS
2. `grep -c "describe\|it(" SkillStreamingView.test.tsx`でテスト数確認
3. 英語のdescribe/itが残っていないことを確認

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                            |
| ------------------------ | ------ | -------- | ------------------------------- |
| テストケース名の誤訳     | 低     | 低       | 既存テストの命名パターンを参照  |
| 文字エンコーディング問題 | 低     | 低       | UTF-8で保存されていることを確認 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-8B-component-tests/outputs/phase-10/final-review-result.md`（M-01指摘）
- `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx`（日本語命名の参考）

### 参考資料

- Vitest公式ドキュメント: テストケース命名

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
M-01: SkillStreamingViewのテスト名が英語（他は日本語） - 機能に影響なし、記録のみ
```

### 補足事項

- 優先度は低。機能に影響なく、コードベースの一貫性向上が目的
- TASK-8Bの品質レポート（Phase 9）で全テストPASS・カバレッジ基準達成済み
