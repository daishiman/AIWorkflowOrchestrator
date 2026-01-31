# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目           | 内容                                                                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase          | 4                                                                                                                                                                                   |
| Phase名        | テスト作成                                                                                                                                                                          |
| カテゴリ       | TDD-Red                                                                                                                                                                             |
| 機能名         | task-imp-permission-tool-metadata-001                                                                                                                                               |
| Issue          | #606                                                                                                                                                                                |
| 前提Phase      | Phase 3（設計レビューゲート）PASS                                                                                                                                                   |
| 次Phase        | Phase 5（実装）                                                                                                                                                                     |
| テストコマンド | `pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/toolMetadata.test.ts apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.metadata.test.tsx` |

---

## 目的

Phase 2の設計に基づき、toolMetadata.tsのユニットテストとPermissionDialogのリスクバッジ統合テストをTDD Redフェーズとして作成する。全テストが実装前のため失敗（Red）状態であることを確認する。

---

## 実行タスク

### Task 1: toolMetadata.tsユニットテスト作成

**目的**: toolMetadata.tsの公開API（getRiskLevel, getSecurityImpact, getToolMetadata）のテストを作成する。

**手順**:

1. テストファイルを作成する: `apps/desktop/src/renderer/components/skill/__tests__/toolMetadata.test.ts`

2. 以下のテストケースを実装する：

   **getRiskLevel関数テスト**:
   - Bash → 'High' を返す
   - Read → 'Low' を返す
   - Write → 'Medium' を返す
   - Edit → 'Medium' を返す
   - Glob → 'Low' を返す
   - Grep → 'Low' を返す
   - WebSearch → 'Low' を返す
   - Task → 'Medium' を返す
   - NotebookEdit → 'Medium' を返す（デフォルト or 定義値）
   - WebFetch → 'Medium' を返す
   - Skill → 'Medium' を返す（デフォルト or 定義値）
   - AskUser → 'Low' を返す
   - 未定義ツール（例: 'UnknownTool'）→ 'Medium' を返す

   **getSecurityImpact関数テスト**:
   - 各12ツールに対して空でない文字列が返る
   - 未定義ツールに対してデフォルトテキストが返る
   - 返却テキストが1行（改行を含まない）であること

   **getToolMetadata関数テスト**:
   - 各ツールに対してriskLevelとsecurityImpactの両方を含むオブジェクトが返る
   - 未定義ツールに対してデフォルト値が返る

   **エッジケーステスト**:
   - 空文字列のツール名 → デフォルト値が返る
   - 大文字小文字の違い（例: 'bash' vs 'Bash'）→ 設計に基づく挙動
   - null/undefined → TypeScriptで防がれるが型安全性の確認

3. テストを実行し、全テストがFAIL（Red）状態であることを確認する

**期待される成果物**: `toolMetadata.test.ts`（全テストFAIL状態）

### Task 2: PermissionDialogリスクバッジ統合テスト作成

**目的**: PermissionDialogにリスクバッジが正しく表示されることをテストする。

**手順**:

1. テストファイルを作成する: `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.metadata.test.tsx`

2. 以下のテストケースを実装する：

   **リスクバッジ表示テスト**:
   - Bashツールの権限確認ダイアログでリスクバッジ「High」が表示される
   - Readツールの権限確認ダイアログでリスクバッジ「Low」が表示される
   - 未定義ツールの権限確認ダイアログでリスクバッジ「Medium」が表示される

   **色分けテスト**:
   - Lowリスクのバッジに緑色系クラス（bg-green-100等）が適用されている
   - Mediumリスクのバッジに黄色系クラス（bg-yellow-100等）が適用されている
   - Highリスクのバッジにオレンジ色系クラス（bg-orange-100等）が適用されている

   **セキュリティ影響テキスト表示テスト**:
   - 各ツールのセキュリティ影響テキストがダイアログ内に表示される
   - テキストが空でないことを確認する

   **アクセシビリティテスト**:
   - リスクバッジにaria-labelが設定されている
   - スクリーンリーダーでリスクレベルが読み上げ可能な構造である

   **既存機能の回帰テスト**:
   - 3ボタン（拒否/1回許可/許可）が引き続き正常に動作する
   - 人間可読説明文が引き続き表示される
   - 詳細展開/折りたたみが引き続き動作する

3. テストを実行し、新規テストがFAIL（Red）状態であることを確認する（回帰テストはPASS可能）

**期待される成果物**: `PermissionDialog.metadata.test.tsx`（新規テストFAIL状態）

### Task 3: テスト仕様書の作成

**目的**: テスト設計の全体像を文書化する。

**手順**:

1. テストケース一覧をテーブル形式でまとめる
2. テスト優先度（Critical/High/Medium/Low）を付与する
3. テストカバレッジ目標（Lines 95%以上）を明記する

**期待される成果物**: テスト仕様書

---

## Electron層別テスト配置

本タスクのテストはRenderer Process層のみに配置する。

| テスト対象           | 層       | テストファイル配置先                                                                      |
| -------------------- | -------- | ----------------------------------------------------------------------------------------- |
| toolMetadata.ts      | Renderer | `apps/desktop/src/renderer/components/skill/__tests__/toolMetadata.test.ts`               |
| PermissionDialog.tsx | Renderer | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.metadata.test.tsx` |

- Main Process層のテストは不要（リスクデータはRenderer側で静的定義）
- IPC通信のテストは不要（新規IPCなし）
- Preload層のテストは不要（contextBridge変更なし）

---

## 参照資料

| 資料名                               | パス                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| Phase 2設計書                        | `outputs/phase-2/architecture-design.md`                                                  |
| Phase 2 UIデザイン仕様               | `outputs/phase-2/ui-design-specification.md`                                              |
| Phase 3レビュー結果                  | `outputs/phase-3/design-review-report.md`                                                 |
| 既存テスト（permissionDescriptions） | `apps/desktop/src/renderer/components/skill/__tests__/permissionDescriptions.test.ts`     |
| 既存テスト（PermissionDialog）       | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx`          |
| 既存テスト（readable）               | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.readable.test.tsx` |
| カバレッジ基準                       | `.claude/skills/task-specification-creator/references/coverage-standards.md`              |

---

## 統合テスト連携アクション

- コンポーネントテスト（PermissionDialog.metadata.test.tsx）がReact Testing Libraryのレンダリングテストとして機能することを確認する
- 既存テストとの干渉がないことを確認する

---

## 成果物

| 成果物名                         | パス                                                                                      | 種別     |
| -------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| テスト仕様書                     | `outputs/phase-4/test-specification.md`                                                   | document |
| toolMetadataテスト               | `apps/desktop/src/renderer/components/skill/__tests__/toolMetadata.test.ts`               | test     |
| PermissionDialogメタデータテスト | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.metadata.test.tsx` | test     |

---

## 完了条件

- [ ] toolMetadata.test.tsが作成され、全テストケースがFAIL（Red）状態である
- [ ] PermissionDialog.metadata.test.tsxが作成され、新規テストケースがFAIL（Red）状態である
- [ ] getRiskLevel関数のテストが12ツール + 未定義ツール + エッジケースをカバーしている
- [ ] getSecurityImpact関数のテストが12ツール + 未定義ツールをカバーしている
- [ ] リスクバッジの色分けテストが4レベル（Low/Medium/High/Critical）をカバーしている
- [ ] アクセシビリティテスト（aria-label）が含まれている
- [ ] 既存機能の回帰テストが含まれている
- [ ] テスト仕様書が作成されている

---

## 次Phase

Phase 5（実装）: TDD Red状態のテストを全てPASS（Green）にするための最小実装を行う。
