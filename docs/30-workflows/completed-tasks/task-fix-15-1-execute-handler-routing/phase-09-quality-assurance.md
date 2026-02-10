# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 9                                          |
| Phase名    | 品質保証                                   |
| タスクID   | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| タスク名   | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 前提Phase  | Phase 8                                    |
| 後続Phase  | Phase 10                                   |
| ステータス | 未実施                                     |
| 作成日     | 2026-02-09                                 |
| 規模       | 小規模                                     |

---

## 目的

静的解析、セキュリティ、テスト網羅性の観点から品質を保証する。
skill:executeハンドラーのSkillExecutor委譲が、品質基準を満たしていることを検証する。

## 背景

本タスクはIPCセキュリティに関わる変更であるため、以下の観点での品質保証が重要:

- IPCセキュリティ原則の遵守（Sender検証、パストラバーサル防止）
- エラーハンドリングの適切性（SkillExecutionErrorCode準拠）
- 型安全性（TypeScript strict mode対応）

---

## 品質ゲート

| 項目         | 基準                  | 必須 |
| ------------ | --------------------- | ---- |
| 機能検証     | 全テスト成功          | Yes  |
| コード品質   | Lint/型チェッククリア | Yes  |
| テスト網羅性 | カバレッジ基準達成    | Yes  |
| セキュリティ | 重大な脆弱性なし      | Yes  |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 静的解析の実行

**目的**: TypeScript/ESLintによる静的解析を実行する

**実行手順**:

1. TypeScriptコンパイルを実行する
2. ESLintを実行する
3. Prettierフォーマットチェックを実行する
4. エラーがないことを確認する

**検証コマンド**:

```bash
# 型チェック（desktop全体）
pnpm --filter @repo/desktop typecheck

# Lint（desktop全体）
pnpm --filter @repo/desktop lint

# Prettier（フォーマット確認）
pnpm --filter @repo/desktop format:check

# 型チェック（全体）
pnpm typecheck

# Lint（全体）
pnpm lint
```

**品質基準**:

- [ ] TypeScriptエラー: 0
- [ ] ESLintエラー: 0
- [ ] フォーマットエラー: 0

**期待される成果物**:

- 静的解析結果レポート

---

### タスク2: セキュリティチェック

**目的**: IPCセキュリティ観点での問題がないか確認する

**実行手順**:

1. IPC Sender検証が正しく実装されているか確認する
2. パストラバーサル防止が適切か確認する
3. エラー情報のサニタイズが適切か確認する

**セキュリティチェックリスト**:

#### IPC Sender検証

- [ ] `validateIpcSender`が呼び出されている
- [ ] 検証失敗時に`toIPCValidationError`でエラーをスローしている
- [ ] `getAllowedWindows`でmainWindowのみを許可している

#### パストラバーサル防止

- [ ] skillIdのバリデーションが行われている
- [ ] ファイルパスの正規化が適切に行われている（該当する場合）
- [ ] 許可されていないディレクトリへのアクセスがブロックされている

#### エラー情報のサニタイズ

- [ ] 内部スタックトレースがRendererに送信されていない
- [ ] 機密情報（パス、認証情報等）がエラーメッセージに含まれていない
- [ ] ログには内部情報を記録し、Rendererには一般的なエラーメッセージを返している

**参照ドキュメント**:

- `.claude/rules/04-electron-security.md` - IPC セキュリティ原則

#### 仕様準拠確認

- [ ] security-skill-ipc.md 準拠確認（IPC Sender検証）
- [ ] error-handling.md 準拠確認（SkillExecutionErrorCode使用）
- [ ] interfaces-agent-sdk-executor.md 準拠確認（型定義）

**期待される成果物**:

- セキュリティチェックリスト

---

### タスク3: テスト網羅性の確認

**目的**: テストカバレッジが基準を満たしていることを確認する

**実行手順**:

1. カバレッジレポートを生成する
2. 対象ファイルのカバレッジを確認する
3. 基準未達の場合は不足箇所を特定する

**検証コマンド**:

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test -- --coverage --collectCoverageFrom="src/main/ipc/skillHandlers.ts" --collectCoverageFrom="src/main/services/skill/SkillService.ts" --collectCoverageFrom="src/main/services/skill/SkillExecutor.ts"

# または全体カバレッジ
pnpm --filter @repo/desktop test:coverage
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**確認項目**:

- [ ] skillHandlers.ts のカバレッジが基準を満たしている
- [ ] SkillService.ts のカバレッジが基準を満たしている
- [ ] SkillExecutor.ts のカバレッジが基準を満たしている

**期待される成果物**:

- カバレッジレポート

---

### タスク4: エラーハンドリング検証

**目的**: エラーハンドリングがSkillExecutionErrorCode準拠であることを確認する

**実行手順**:

1. エラーコードの使用状況を確認する
2. エラーメッセージの形式を確認する
3. リトライ可能性の判定が適切か確認する

**エラーコード確認チェックリスト**:

| カテゴリ               | コード範囲 | リトライ | 確認 |
| ---------------------- | ---------- | -------- | ---- |
| Validation Error       | 1000-1999  | 不可     | [ ]  |
| Business Error         | 2000-2999  | 不可     | [ ]  |
| External Service Error | 3000-3999  | 可能     | [ ]  |
| Infrastructure Error   | 4000-4999  | 可能     | [ ]  |
| Internal Error         | 5000-5999  | 不可     | [ ]  |

**確認項目**:

- [ ] 不正なskillIdに対してValidation Errorを返している
- [ ] スキルが見つからない場合にBusiness Errorを返している
- [ ] 実行時エラーに対して適切なエラーカテゴリを返している

**期待される成果物**:

- エラーハンドリング検証レポート

---

### タスク5: 品質レポートの作成

**目的**: 品質保証の結果を文書化する

**実行手順**:

1. 静的解析結果をまとめる
2. セキュリティチェック結果をまとめる
3. テスト網羅性結果をまとめる
4. エラーハンドリング検証結果をまとめる
5. outputs/phase-9/に保存する

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

---

## 参照資料

| 参照資料           | パス                                                    | 内容             |
| ------------------ | ------------------------------------------------------- | ---------------- |
| skillHandlers.ts   | `apps/desktop/src/main/ipc/skillHandlers.ts`            | 品質検証対象     |
| SkillService.ts    | `apps/desktop/src/main/services/skill/SkillService.ts`  | 品質検証対象     |
| SkillExecutor.ts   | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 品質検証対象     |
| セキュリティルール | `.claude/rules/04-electron-security.md`                 | セキュリティ基準 |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                      | 品質基準         |

---

## 多角的チェック観点（AIが判断）

本タスク（SKILL_EXECUTEハンドラーのSkillExecutor委譲）では以下の観点を適用：

| 観点                 | 確認内容                                    | 仕様参照先                                                  |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| セキュリティ         | IPC送信元検証、エラーメッセージのサニタイズ | `aiworkflow-requirements: security-skill-ipc.md`            |
| API設計              | チャンネル定義、入出力型の統一性            | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| エラーハンドリング   | SkillExecutionErrorCode準拠                 | `aiworkflow-requirements: error-handling.md`                |
| Electronセキュリティ | Main Process実装、validateIpcSender使用     | `aiworkflow-requirements: security-api-electron.md`         |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                                       | 仕様参照先                    |
| -------------------- | ---------------------------------------------- | ----------------------------- |
| バックエンド（Main） | 静的解析、セキュリティチェック、カバレッジ検証 | `architecture-*.md`           |
| IPC通信              | エラーハンドリング検証、型安全性確認           | `interfaces-*.md`, `api-*.md` |

---

## 成果物

| 成果物       | パス                                | 内容         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

品質保証で統合テスト結果を確認:

| 品質項目     | 確認内容           | 結果       |
| ------------ | ------------------ | ---------- |
| 機能検証     | 全自動テスト成功   | {{RESULT}} |
| 統合テスト   | IPC連携テスト成功  | {{RESULT}} |
| セキュリティ | 脆弱性スキャン通過 | {{RESULT}} |

---

## 完了条件

- [ ] TypeScriptコンパイルエラーがない
- [ ] ESLintエラーがない
- [ ] フォーマットエラーがない
- [ ] セキュリティチェックに問題がない
- [ ] テストカバレッジが基準を満たしている
- [ ] エラーハンドリングがSkillExecutionErrorCode準拠である
- [ ] 品質レポートを作成した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 品質ゲートサマリー

### 機能検証

- [ ] 全ユニットテスト成功
- [ ] IPC通信テスト成功

### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

### テスト網羅性

- [ ] Line Coverage >= 80%
- [ ] Branch Coverage >= 60%
- [ ] Function Coverage >= 80%

### セキュリティ

- [ ] IPC Sender検証実装済み
- [ ] パストラバーサル防止実装済み
- [ ] エラー情報サニタイズ実装済み

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-fix-15-1-execute-handler-routing/phase-10-final-review.md`
