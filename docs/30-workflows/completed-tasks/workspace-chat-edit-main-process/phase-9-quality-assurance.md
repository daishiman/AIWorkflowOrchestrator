# Phase 9: 品質保証

## メタ情報

| 項目         | 内容                        |
| ------------ | --------------------------- |
| Phase        | 9                           |
| 名称         | 品質保証                    |
| 目的         | Lint/型チェック/静的解析    |
| 前提Phase    | Phase 8（リファクタリング） |
| 成果物       | qa-report.md                |
| 成果物配置先 | `outputs/phase-9/`          |

---

## 1. 目的

リファクタリング後のコードに対して、Lint、型チェック、静的解析を実行し、品質基準を満たすことを確認する。

---

## 2. 実行タスク

### Task 1: TypeScript型チェック

#### 2.1.1 型チェックコマンド

```bash
pnpm --filter @repo/desktop typecheck
```

#### 2.1.2 型チェック確認項目

| #   | 確認項目                 | 期待値 | 結果 |
| --- | ------------------------ | ------ | ---- |
| 1   | コンパイルエラー         | 0件    | -    |
| 2   | any型の使用箇所          | 最小限 | -    |
| 3   | 暗黙的any                | 0件    | -    |
| 4   | 未使用変数/インポート    | 0件    | -    |
| 5   | 型アサーション（as any） | 0件    | -    |

#### 2.1.3 対象ファイル

| ファイル            | 型エラー数 | 警告数 | 判定 |
| ------------------- | ---------- | ------ | ---- |
| FileService.ts      | -          | -      | -    |
| ContextBuilder.ts   | -          | -      | -    |
| ChatEditService.ts  | -          | -      | -    |
| chatEditHandlers.ts | -          | -      | -    |

---

### Task 2: ESLint実行

#### 2.2.1 Lintコマンド

```bash
pnpm --filter @repo/desktop lint -- apps/desktop/src/main/services/chat-edit/
pnpm --filter @repo/desktop lint -- apps/desktop/src/main/ipc/chatEditHandlers.ts
```

#### 2.2.2 Lint確認項目

| #   | ルール                             | 期待値 | 結果 |
| --- | ---------------------------------- | ------ | ---- |
| 1   | @typescript-eslint/no-explicit-any | 0件    | -    |
| 2   | @typescript-eslint/no-unused-vars  | 0件    | -    |
| 3   | prefer-const                       | 0件    | -    |
| 4   | no-console                         | 0件    | -    |
| 5   | eqeqeq                             | 0件    | -    |

#### 2.2.3 Lint結果

| ファイル            | エラー数 | 警告数 | 判定 |
| ------------------- | -------- | ------ | ---- |
| FileService.ts      | -        | -      | -    |
| ContextBuilder.ts   | -        | -      | -    |
| ChatEditService.ts  | -        | -      | -    |
| chatEditHandlers.ts | -        | -      | -    |

---

### Task 3: Prettier実行

#### 2.3.1 フォーマットコマンド

```bash
pnpm prettier --check "apps/desktop/src/main/services/chat-edit/**/*.ts"
pnpm prettier --check "apps/desktop/src/main/ipc/chatEditHandlers.ts"
```

#### 2.3.2 フォーマット結果

| ファイル            | フォーマット済み | 判定 |
| ------------------- | ---------------- | ---- |
| FileService.ts      | -                | -    |
| ContextBuilder.ts   | -                | -    |
| ChatEditService.ts  | -                | -    |
| chatEditHandlers.ts | -                | -    |

---

### Task 4: 静的解析（コード品質）

#### 2.4.1 複雑度チェック

| ファイル            | 関数名           | 複雑度 | 上限 | 判定 |
| ------------------- | ---------------- | ------ | ---- | ---- |
| FileService.ts      | readFile         | -      | 10   | -    |
| FileService.ts      | writeFile        | -      | 10   | -    |
| ContextBuilder.ts   | build            | -      | 10   | -    |
| ChatEditService.ts  | sendWithContext  | -      | 15   | -    |
| ChatEditService.ts  | parseResponse    | -      | 10   | -    |
| chatEditHandlers.ts | registerHandlers | -      | 10   | -    |

#### 2.4.2 依存関係チェック

| 確認項目           | 期待値           | 結果 |
| ------------------ | ---------------- | ---- |
| 循環依存           | なし             | -    |
| 不要な依存         | なし             | -    |
| セキュリティ脆弱性 | High/Critical: 0 | -    |

---

### Task 5: セキュリティ静的解析

#### 2.5.1 セキュリティチェック項目

| #   | チェック項目           | 期待値            | 結果 |
| --- | ---------------------- | ----------------- | ---- |
| 1   | パストラバーサル対策   | path.resolve使用  | -    |
| 2   | インジェクション対策   | 入力検証済み      | -    |
| 3   | 機密情報のハードコード | なし              | -    |
| 4   | eval/Function使用      | なし              | -    |
| 5   | nodeIntegration設定    | false             | -    |
| 6   | contextIsolation設定   | true              | -    |
| 7   | IPC sender検証         | validateIpcSender | -    |

#### 2.5.2 依存パッケージ脆弱性

```bash
pnpm audit
```

| 脆弱性レベル | 件数 | 判定 |
| ------------ | ---- | ---- |
| Critical     | -    | -    |
| High         | -    | -    |
| Moderate     | -    | -    |
| Low          | -    | -    |

---

## 3. QAレポート作成

### 3.1 レポート形式

```markdown
# 品質保証レポート

## 概要

- 検証日: YYYY-MM-DD
- 対象: Workspace Chat Edit Main Process
- 担当者: [担当者名]

## 型チェック結果

| 項目          | 結果 |
| ------------- | ---- |
| コンパイル    | PASS |
| エラー数      | 0    |
| any型使用箇所 | 0    |

## Lint結果

| 項目     | 結果 |
| -------- | ---- |
| エラー数 | 0    |
| 警告数   | 0    |

## 静的解析結果

| 項目         | 結果 |
| ------------ | ---- |
| 複雑度超過   | 0    |
| 循環依存     | 0    |
| セキュリティ | PASS |

## 総合判定

[ ] PASS - 全基準を満たす
[ ] CONDITIONAL - 軽微な問題あり（リスク受容）
[ ] FAIL - 重大な問題あり

## 改善提案

1. ...
```

---

## 4. 判定基準

### 4.1 PASS条件

以下の全てを満たすこと:

- [ ] TypeScript型チェックがエラー0件
- [ ] ESLintエラーが0件
- [ ] Prettierフォーマットが完了
- [ ] 関数複雑度が上限以下
- [ ] セキュリティチェックがPASS
- [ ] Critical/High脆弱性が0件

### 4.2 FAIL時のアクション

- 型エラーの場合 → Phase 8に戻り修正
- Lintエラーの場合 → 自動修正または手動修正
- セキュリティ問題の場合 → Phase 5に戻り実装修正

---

## 5. 参照資料

### 5.1 システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |
| セキュリティ要件 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` |

---

## 6. 成果物

| 成果物       | 配置先             | 説明             |
| ------------ | ------------------ | ---------------- |
| qa-report.md | `outputs/phase-9/` | 品質保証レポート |

---

## 7. 統合テスト連携【必須】

品質保証の観点から統合部分を重点チェック:

| 統合ポイント        | 品質確認項目               | 結果 |
| ------------------- | -------------------------- | ---- |
| Renderer → Main IPC | 型定義の整合性             | -    |
| Main → FileSystem   | エラーハンドリングの網羅性 | -    |
| Main → LLMAdapter   | インターフェースの明確さ   | -    |
| 認証/検証           | セキュリティパターン準拠   | -    |

---

## 8. 完了条件

- [ ] 型チェックがエラー0件で完了している
- [ ] Lintがエラー0件で完了している
- [ ] フォーマットが完了している
- [ ] 静的解析が完了している
- [ ] セキュリティチェックがPASSしている
- [ ] QAレポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 9. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. TypeScript型チェック（Task 1）
3. ESLint実行（Task 2）
4. Prettier実行（Task 3）
5. 静的解析（Task 4）
6. セキュリティ静的解析（Task 5）
7. 統合テスト連携の確認
8. QAレポート作成
9. 完了条件の検証

---

## 10. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/workspace-chat-edit-main-process --phase 9
```

---

## 11. 次のPhase

Phase 10: 最終レビュー
