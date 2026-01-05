# 検索・置換機能 UI実装 - タスク指示書

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | task-imp-search-ui-001                          |
| タスク名     | 検索・置換機能 UI実装                           |
| 分類         | 改善                                            |
| 対象機能     | 検索・置換パネル                                |
| 優先度       | 高                                              |
| 見積もり規模 | 中規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 9（手動テスト検証）                       |
| 発見日       | 2026-01-05                                      |
| 前提タスク   | TASK-SEARCH-REPLACE-001（バックエンド実装完了） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

検索・置換機能のバックエンド実装（SearchService、PatternMatcher、ReplaceEngine等）は完了し、テストカバレッジ83.92%を達成した。しかし、フロントエンドUIコンポーネントはElectronアプリとの統合が必要なため、別フェーズでの実装が必要となった。

### 1.2 問題点・課題

- ユーザーが検索・置換機能を利用できない状態
- バックエンド実装があっても、UIがなければ機能として完結しない
- キーボードショートカット（Cmd+F/Ctrl+F）が動作しない

### 1.3 放置した場合の影響

- 開発者の生産性低下（ファイル内検索が使えない）
- 競合製品との機能差が開く
- ユーザー離脱のリスク

---

## 2. 何を達成するか（What）

### 2.1 目的

バックエンド検索エンジンと連携し、ユーザーがUIから検索・置換機能を利用できるようにする。

### 2.2 最終ゴール

1. Cmd+F（Mac）/ Ctrl+F（Windows/Linux）で検索パネルが開く
2. 検索パネルでファイル内検索・置換ができる
3. Cmd+Shift+F / Ctrl+Shift+Fでワークスペース検索パネルが開く
4. 検索結果がハイライト表示される
5. E2Eテストが全て通過する

### 2.3 スコープ

#### 含むもの

- SearchPanel コンポーネント実装
- WorkspaceSearchPanel コンポーネント実装
- Zustand ストア実装（useSearchStore）
- キーボードショートカット実装
- E2Eテスト（Playwright）

#### 含まないもの

- バックエンド検索エンジンの修正（実装済み）
- 検索アルゴリズムの変更
- 新規検索オプションの追加

### 2.4 成果物

| 成果物               | パス                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| SearchPanel          | apps/desktop/src/features/search/SearchPanel.tsx                     |
| WorkspaceSearchPanel | apps/desktop/src/features/search/WorkspaceSearchPanel.tsx            |
| Zustand Store        | apps/desktop/src/features/search/stores/useSearchStore.ts            |
| カスタムフック       | apps/desktop/src/features/search/hooks/useSearchKeyboardShortcuts.ts |
| E2Eテスト            | apps/desktop/tests/e2e/search.spec.ts                                |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- バックエンド検索エンジン実装完了（packages/shared/src/search/）
- Electronアプリが起動可能な状態
- Playwrightがセットアップ済み

### 3.1.1 ⚠️ 重要: 現在除外されているテストファイル

バックエンド実装時（TASK-SEARCH-REPLACE-001）に、UIコンポーネントが未実装のため、以下のテストファイルが**typecheckとテスト実行の両方から一時的に除外**されています。

#### 除外されているファイル

| ファイル                                                      | 説明                                         |
| ------------------------------------------------------------- | -------------------------------------------- |
| `src/features/search/__tests__/SearchPanel.test.tsx`          | ファイル内検索パネルのテスト（作成済み）     |
| `src/features/search/__tests__/WorkspaceSearchPanel.test.tsx` | ワークスペース検索パネルのテスト（作成済み） |

#### 除外設定の場所

| 設定ファイル                    | 除外の目的                   |
| ------------------------------- | ---------------------------- |
| `apps/desktop/tsconfig.json`    | TypeScript型チェックから除外 |
| `apps/desktop/vitest.config.ts` | テスト実行から除外           |

#### なぜ除外されているか

- テストファイルは**TDDアプローチで先に作成済み**
- しかしテスト対象のUIコンポーネント（`SearchPanel.tsx`、`WorkspaceSearchPanel.tsx`）が未実装
- そのため、importエラーが発生しCIが失敗する
- UI実装完了までの一時的な措置として除外

#### UI実装後の動作

**Phase 0で除外を解除すると：**

1. 作成済みのテストが自動的にCI/テスト実行の対象になる
2. 最初はimportエラーで失敗する（Red状態）
3. Phase 5でUIコンポーネントを実装すると、テストが通過する（Green状態）

**Phase 0（実装開始時）で必ず除外を解除してください。**

### 3.2 依存タスク

| タスクID                | 名称                       | ステータス |
| ----------------------- | -------------------------- | ---------- |
| TASK-SEARCH-REPLACE-001 | 検索・置換機能バックエンド | 完了       |

### 3.3 必要な知識・スキル

- React コンポーネント設計
- Zustand 状態管理
- Electron IPC通信
- Playwright E2Eテスト
- ARIA アクセシビリティ

### 3.4 推奨アプローチ

1. TDDでテストファーストで実装
2. 既存のUI設計書（ui-ux-panels.md）に準拠
3. アクセシビリティ（WCAG 2.1 AA）準拠

---

## 4. 実行手順

### Phase構成

このタスクはPhase 0（準備）+ Phase 4-9のTDDサイクルに従う。

### Phase 0: 準備作業（除外解除）【必須】

#### 目的

バックエンド実装時に一時的に除外されたテストファイルをtypecheckとテスト実行の両方に再追加する。

#### 手順

1. **tsconfig.json の除外解除**
   - `apps/desktop/tsconfig.json` を開く
   - `exclude` 配列から以下のエントリを**削除**する:

   ```json
   "src/features/search/__tests__/SearchPanel.test.tsx",
   "src/features/search/__tests__/WorkspaceSearchPanel.test.tsx"
   ```

2. **vitest.config.ts の除外解除**
   - `apps/desktop/vitest.config.ts` を開く
   - `test.exclude` 配列から以下のエントリを**削除**する:

   ```typescript
   "src/features/search/__tests__/SearchPanel.test.tsx",
   "src/features/search/__tests__/WorkspaceSearchPanel.test.tsx",
   ```

3. ファイルを保存

#### 確認コマンド

```bash
# 除外解除後は型エラーが出ることを確認（これはPhase 5で解消される）
pnpm --filter @repo/desktop typecheck

# テスト実行でもエラーが出ることを確認
pnpm --filter @repo/desktop test:run
```

#### 完了条件

- [ ] tsconfig.jsonからテストファイル除外が削除されている
- [ ] vitest.config.tsからテストファイル除外が削除されている
- [ ] 型エラーが出ることを確認（UIコンポーネント未実装のため）
- [ ] テスト実行でimportエラーが出ることを確認（UIコンポーネント未実装のため）

---

### Phase 4: テスト作成（Red）

#### 使用スキル

| スキル             | パス                                       |
| ------------------ | ------------------------------------------ |
| frontend-testing   | .claude/skills/frontend-testing/SKILL.md   |
| playwright-testing | .claude/skills/playwright-testing/SKILL.md |

#### 目的

UIコンポーネントとE2Eの失敗するテストを作成する。

#### 成果物

- apps/desktop/src/features/search/**tests**/SearchPanel.test.tsx
- apps/desktop/src/features/search/**tests**/WorkspaceSearchPanel.test.tsx
- apps/desktop/tests/e2e/search.spec.ts

#### 完了条件

- [ ] 全テストが失敗する（Red状態）
- [ ] テスト設計書で定義された全ケースがカバーされている

---

### Phase 5: 実装（Green）

#### 使用スキル

| スキル               | パス                                         |
| -------------------- | -------------------------------------------- |
| electron-ui-patterns | .claude/skills/electron-ui-patterns/SKILL.md |
| accessibility-wcag   | .claude/skills/accessibility-wcag/SKILL.md   |
| state-lifting        | .claude/skills/state-lifting/SKILL.md        |

#### 目的

テストを通す最小限の実装を行う。

#### 成果物

- SearchPanel.tsx
- WorkspaceSearchPanel.tsx
- useSearchStore.ts
- useSearchKeyboardShortcuts.ts

#### 完了条件

- [ ] 全テストが通過する（Green状態）
- [ ] キーボードショートカットが動作する
- [ ] 検索結果がハイライト表示される

---

### Phase 6: リファクタリング

#### 使用スキル

| スキル               | パス                                         |
| -------------------- | -------------------------------------------- |
| refactoring-patterns | .claude/skills/refactoring-patterns/SKILL.md |
| clean-code-practices | .claude/skills/clean-code-practices/SKILL.md |

#### 目的

コード品質を改善しつつテストが通る状態を維持する。

#### 完了条件

- [ ] コードの重複が排除されている
- [ ] 命名が適切
- [ ] テストが引き続き通過する

---

### Phase 7: 品質保証

#### 使用スキル

| スキル             | パス                                       |
| ------------------ | ------------------------------------------ |
| static-analysis    | .claude/skills/static-analysis/SKILL.md    |
| accessibility-wcag | .claude/skills/accessibility-wcag/SKILL.md |

#### 目的

品質基準を満たすことを検証する。

#### 完了条件

- [ ] ESLint警告0件
- [ ] TypeScript型チェック通過
- [ ] WCAG 2.1 AA準拠
- [ ] テストカバレッジ80%以上

---

### Phase 8: 最終レビューゲート

#### 目的

全体品質と仕様準拠を確認する。

#### 完了条件

- [ ] 全自動テスト通過
- [ ] UI設計書との整合性確認
- [ ] パフォーマンス基準達成（検索応答200ms以内）

---

### Phase 9: 手動テスト検証

#### 使用スキル

| スキル             | パス                                       |
| ------------------ | ------------------------------------------ |
| playwright-testing | .claude/skills/playwright-testing/SKILL.md |

#### 目的

実際の操作で動作確認する。

#### 完了条件

- [ ] Cmd+F/Ctrl+Fで検索パネルが開く
- [ ] 検索・置換が正常動作する
- [ ] ワークスペース検索が動作する
- [ ] スクリーンショット取得

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SearchPanelが開閉できる
- [ ] 検索入力でリアルタイム検索が動作する
- [ ] 検索オプション（大文字小文字、単語単位、正規表現）が切り替え可能
- [ ] 置換（単一/全置換）が動作する
- [ ] ワークスペース検索でファイル横断検索ができる
- [ ] 検索結果クリックでファイル/位置にジャンプできる

### 品質要件

- [ ] テストカバレッジ80%以上
- [ ] ESLint警告0件
- [ ] TypeScript型チェック通過
- [ ] WCAG 2.1 AA準拠
- [ ] 検索応答200ms以内

### ドキュメント要件

- [ ] コンポーネントにJSDocコメント
- [ ] READMEなし（プロジェクト規約に従う）

---

## 6. 検証方法

### テストケース

参照: docs/30-workflows/search-replace-functionality/phase-4-testing.md

### 検証手順

1. pnpm --filter @repo/desktop test:run でユニットテスト実行
2. pnpm --filter @repo/desktop test:e2e でE2Eテスト実行
3. アプリを起動してCmd+F/Ctrl+Fで検索パネルを開く
4. 検索・置換操作を実行して動作確認

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                   |
| -------------------------------- | ------ | -------- | -------------------------------------- |
| Electron IPC通信の遅延           | 中     | 低       | 非同期処理とローディング状態の実装     |
| 大規模ワークスペースでの性能低下 | 高     | 中       | ストリーミング結果表示、仮想スクロール |
| アクセシビリティ準拠漏れ         | 中     | 中       | axe-coreによる自動チェック             |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| UI設計仕様           | .claude/skills/aiworkflow-requirements/references/ui-ux-panels.md                     |
| SearchService API    | .claude/skills/aiworkflow-requirements/references/api-internal.md                     |
| 検索・置換タスク仕様 | docs/30-workflows/search-replace-functionality/                                       |
| Phase 9検証レポート  | docs/30-workflows/search-replace-functionality/outputs/phase-9/verification-report.md |

### 参考資料

- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Playwright: https://playwright.dev/
- Zustand: https://github.com/pmndrs/zustand

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

Phase 9 検証レポートより:

### フロントエンドUIコンポーネント（未実装）

- **ステータス**: 未実装
- **理由**: Electronアプリとの統合が必要

#### 必要な作業

1. SearchPanel コンポーネントの実装
2. WorkspaceSearchPanel コンポーネントの実装
3. Zustand ストアの実装
4. キーボードショートカットの実装
5. E2Eテストの実行

### 補足事項

- バックエンド実装はpackages/shared/src/search/に完了済み
- テストカバレッジ83.92%達成済み
- 設計書はdocs/30-workflows/search-replace-functionality/outputs/phase-2/にある

### 作成済みUIテストについて

以下のテストファイルは**すでに作成済み**ですが、現在はCI/テスト実行から除外されています：

| テストファイル                  | テストケース数 | 内容                                                                           |
| ------------------------------- | -------------- | ------------------------------------------------------------------------------ |
| `SearchPanel.test.tsx`          | 約30件         | 検索入力、オプション切替、置換操作、キーボードナビゲーション、アクセシビリティ |
| `WorkspaceSearchPanel.test.tsx` | 約25件         | ワークスペース検索、ファイルフィルタ、結果表示、ファイルジャンプ               |

**UI実装完了後、これらのテストが自動的に実行されます。**

除外状態の追跡情報：

- 追跡ファイル: `docs/30-workflows/search-replace-functionality/artifacts.json`
- キー: `pendingTestExclusions`
