# コンポーネントテスト未使用importの除去 - タスク指示書

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | task-imp-component-tests-import-cleanup-001    |
| タスク名     | コンポーネントテスト未使用importの除去         |
| 分類         | 改善                                           |
| 対象機能     | skill-import-agent-system コンポーネントテスト |
| 優先度       | 低                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | Phase 10（TASK-8B最終レビュー、指摘M-02）      |
| 発見日       | 2026-02-02                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-8Bコンポーネントテスト（280テスト）のPhase 10最終レビューにおいて、テストファイル内に未使用のimport文（fireEvent, userEvent）が2件検出された（M-02）。これらはテスト開発時に使用されていたが、最終版では使われていない。

### 1.2 問題点・課題

- テストファイル内に未使用のimport文が残存
- 具体的なimport:
  - `fireEvent` from `@testing-library/react`（一部ファイルで未使用）
  - `userEvent` from `@testing-library/user-event`（一部ファイルで未使用）
- ESLintのno-unused-importsルールが設定されていないため警告が出ない

### 1.3 放置した場合の影響

- **機能的影響なし**: tree-shakingによりバンドルサイズに影響しない
- コードレビュー時に「使われていないimportがある」という指摘が繰り返される可能性
- 新規テスト作成時に不要なimportをコピーしてしまうリスク

---

## 2. 何を達成するか（What）

### 2.1 目的

コンポーネントテストファイルから未使用のimport文を除去し、クリーンなコードを維持する。

### 2.2 最終ゴール

- 9テストファイルすべてで未使用importが0件
- 280テスト全PASSが維持される
- ESLintエラー0件が維持される

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/components/skill/__tests__/`配下の9テストファイルの未使用import除去

#### 含まないもの

- テストロジックの変更
- 新規importの追加
- テストケースの追加・削除
- ESLintルールの追加（別タスクとして検討）

### 2.4 成果物

- 更新されたテストファイル（未使用import除去済み）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-8Bが完了していること（完了済み）
- apps/desktopパッケージのテストが実行可能であること

### 3.2 依存タスク

- TASK-8B（完了済み）

### 3.3 必要な知識

- TypeScript/JavaScript のimport文
- @testing-library/react と @testing-library/user-event のAPI

### 3.4 推奨アプローチ

1. 各テストファイルでimportされている関数を確認
2. ファイル内で使用されていないimportを特定
3. 未使用importを除去
4. テスト実行で全280テストがPASSすることを確認

---

## 4. 実行手順

### Phase構成

単一Phaseで完了（import文の除去のみ）

### Phase 1: 未使用import除去

#### 目的

9テストファイルから未使用importを除去する

#### 手順

1. 各テストファイルを開き、import文を確認:
   ```bash
   grep -n "^import" apps/desktop/src/renderer/components/skill/__tests__/*.ts*
   ```
2. 各ファイルでimportされた識別子がファイル内で使用されているか確認:
   ```bash
   # 例: fireEventの使用箇所を確認
   grep -n "fireEvent" apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
   ```
3. 未使用importを除去
4. テスト実行:
   ```bash
   cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/
   ```
5. 280テスト全PASSを確認

#### 成果物

- 更新されたテストファイル

#### 完了条件

- [ ] 9テストファイルすべてで未使用importが0件
- [ ] 280テスト全PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 未使用importが除去されている
- [ ] 使用中のimportが誤って除去されていない

### 品質要件

- [ ] 280テスト全PASS
- [ ] ESLintエラー0件
- [ ] テストカバレッジが維持されている

### ドキュメント要件

- [ ] なし（import除去のみ）

---

## 6. 検証方法

### テストケース

```bash
cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/
```

### 検証手順

1. テスト実行で280テスト全PASS
2. ESLint実行で0エラー
3. 未使用importがないことを確認:
   ```bash
   # TypeScript compilerの--noUnusedLocalsオプションで確認可能
   npx tsc --noEmit --noUnusedLocals src/renderer/components/skill/__tests__/*.tsx
   ```

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                           |
| ---------------------------------- | ------ | -------- | ------------------------------ |
| 使用中のimportを誤って除去         | 中     | 低       | テスト実行で即座に検出可能     |
| 間接的に使用されているimportの除去 | 中     | 低       | TypeScript型チェックで検出可能 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-8B-component-tests/outputs/phase-10/final-review-result.md`（M-02指摘）
- `apps/desktop/src/renderer/components/skill/__tests__/`（対象テストファイル群）

### 参考資料

- ESLint no-unused-imports ルール
- TypeScript --noUnusedLocals コンパイラオプション

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
M-02: 2件の未使用import（fireEvent, userEvent） - 軽微、記録のみ
```

### 補足事項

- 優先度は低。tree-shakingにより実行時影響なし
- ESLintにno-unused-importsルールを追加する場合は別タスクとして起票を推奨
