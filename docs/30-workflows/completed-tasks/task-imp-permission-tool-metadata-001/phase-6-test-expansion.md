# Phase 6: テスト拡充

## メタ情報

| 項目           | 内容                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| Phase          | 6                                                                                  |
| Phase名        | テスト拡充                                                                         |
| カテゴリ       | 品質                                                                               |
| 機能名         | task-imp-permission-tool-metadata-001                                              |
| Issue          | #606                                                                               |
| 前提Phase      | Phase 5（実装）                                                                    |
| 次Phase        | Phase 7（テストカバレッジ確認）                                                    |
| テストコマンド | `pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/ --coverage` |

---

## 目的

Phase 5の実装完了後、テストカバレッジ目標（Lines 95%以上、Branch 60%以上、Function 80%以上）達成に向けて追加テストを作成する。境界値テスト、エッジケーステスト、アクセシビリティテストを拡充する。

---

## 実行タスク

### Task 1: 現在のカバレッジ測定

**目的**: Phase 5時点のテストカバレッジを測定し、不足領域を特定する。

**手順**:

1. カバレッジを測定する：

   ```bash
   pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/toolMetadata.test.ts apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.metadata.test.tsx --coverage
   ```

2. toolMetadata.tsのカバレッジ結果を確認する：
   - Lines, Branches, Functions, Statementsの各値を記録する
   - 未カバーの行・分岐を特定する

3. PermissionDialog.tsxの追加部分（RiskBadge関連）のカバレッジを確認する

**期待される成果物**: カバレッジ測定結果（改善前）

### Task 2: toolMetadata.tsの追加テスト作成

**目的**: toolMetadata.tsのカバレッジを95%以上にする。

**手順**:

1. 未カバーの分岐・行を特定し、追加テストを作成する

2. 追加テストケース候補：

   **境界値テスト**:
   - 空文字列のツール名に対するデフォルト値返却
   - 非常に長いツール名（100文字以上）に対する挙動

   **型安全性テスト**:
   - getRiskLevelの返り値がRiskLevel型の値のいずれかであること
   - getToolMetadataの返り値がToolMetadata型に合致すること

   **全ツール網羅テスト**:
   - TOOL_METADATAに定義された全ツールに対してgetRiskLevelが正しい値を返すこと（ループテスト）
   - TOOL_METADATAに定義された全ツールに対してgetSecurityImpactが非空文字列を返すこと

3. テストを実行し全てPASSすることを確認する

**期待される成果物**: toolMetadata.test.ts（追加テストケース）

### Task 3: PermissionDialog.metadata.test.tsxの追加テスト作成

**目的**: PermissionDialog内のリスクバッジ表示のカバレッジを拡充する。

**手順**:

1. 未カバーのUI分岐を特定し、追加テストを作成する

2. 追加テストケース候補：

   **全リスクレベル表示テスト**:
   - 全4レベル（Low/Medium/High/Critical）のバッジが正しいスタイルで表示される
   - 各レベルのバッジテキストが正確である

   **インタラクションテスト**:
   - リスクバッジ表示状態でのボタン操作（拒否/1回許可/許可）が正常に動作する
   - リスクバッジ表示状態での「次回から自動的に許可する」チェックボックスが正常に動作する

   **レイアウトテスト**:
   - ツールアイコン・ツール名・リスクバッジが同一行に表示される
   - セキュリティ影響テキストが人間可読説明文の直下に表示される

   **アクセシビリティ拡充テスト**:
   - Tabキーでリスクバッジ情報にフォーカス移動可能であること
   - Escapeキーでのダイアログ閉じが引き続き動作すること
   - role="dialog"が正しく設定されていること

3. テストを実行し全てPASSすることを確認する

**期待される成果物**: PermissionDialog.metadata.test.tsx（追加テストケース）

---

## 参照資料

| 資料名                 | パス                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| Phase 5実装サマリー    | `outputs/phase-5/implementation-summary.md`                                  |
| toolMetadata実装       | `apps/desktop/src/renderer/components/skill/toolMetadata.ts`                 |
| PermissionDialog修正版 | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`            |
| カバレッジ基準         | `.claude/skills/task-specification-creator/references/coverage-standards.md` |

---

## 統合テスト連携アクション

- 追加テストがPermissionDialogの既存テストスイートと干渉しないことを確認する
- カバレッジ計測でtoolMetadata.tsとPermissionDialog.tsxの両方が計測対象に含まれていることを確認する

---

## 成果物

| 成果物名           | パス                                      | 種別     |
| ------------------ | ----------------------------------------- | -------- |
| 拡充テストレポート | `outputs/phase-6/expanded-test-report.md` | document |

---

## 完了条件

- [ ] toolMetadata.tsのテストカバレッジがLines 95%以上を達成している
- [ ] 全4リスクレベルの表示テストが実装されている
- [ ] 境界値テスト（空文字列、長いツール名）が実装されている
- [ ] アクセシビリティ拡充テストが実装されている
- [ ] 既存機能の回帰テストが全てPASSしている
- [ ] 追加した全テストがPASSしている

---

## 次Phase

Phase 7（テストカバレッジ確認）: カバレッジ目標達成を正式に検証する。未達の場合はPhase 6に戻る。
