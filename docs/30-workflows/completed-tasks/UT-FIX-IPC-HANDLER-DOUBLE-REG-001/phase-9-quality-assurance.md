# Phase 9: 品質保証 - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| Phase        | 9                                 |
| Phase名      | 品質保証                          |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 機能名       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 種別         | バグ修正 (fix)                    |
| GitHub Issue | #815                              |
| 前提Phase    | Phase 8（リファクタリング）       |
| 後続Phase    | Phase 10（最終レビューゲート）    |
| ステータス   | 未実施                            |
| 作成日       | 2026-02-14                        |

---

## 目的

Lint、型チェック、全テスト実行による静的解析・動的解析を行い、リファクタリング後のコード品質が基準を満たすことを検証する。IPC セキュリティ4層防御が維持されていることを確認する。

## 背景

Phase 8 のリファクタリング完了後、本番リリースに向けた品質保証を行う。IPC ハンドラの二重登録修正は Electron セキュリティモデルの中核部分に影響するため、セキュリティ観点の検証を含む。

---

## 実行タスク

- タスク実行: 本Phaseで定義したタスクを上から順に実行し、結果を成果物に記録する。

### Task 1: ESLint 実行と全エラー修正

- `pnpm lint` を実行し、エラーが0であることを確認する
- 新規追加コードに起因する警告がある場合は全て修正する
- 修正対象ファイル:
  - `apps/desktop/src/main/index.ts`
  - `apps/desktop/src/main/ipc/index.ts`
  - 修正に伴い変更された全ファイル

### Task 2: TypeScript 型チェック実行と全型エラー修正

- `pnpm typecheck` を実行し、strict mode でエラーが0であることを確認する
- `any` 型が使用されていないことを確認する
- 型アサーション（`as`）が不必要に使用されていないことを確認する

### Task 3: 関連テスト全パス確認

- 以下のコマンドで関連テストを実行し、全テストが PASS することを確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/
```

- テスト結果から以下を記録する:
  - 総テスト数
  - PASS 数
  - FAIL 数（0であること）
  - テスト実行時間

### Task 4: プロジェクト全体のテスト実行

- 以下のコマンドでプロジェクト全体のテストを実行する:

```bash
pnpm test
```

- 既存テストへの副作用がないことを確認する
- FAIL するテストがある場合は、本タスクの修正に起因するかどうかを判定する

### Task 5: IPC セキュリティ4層防御の維持確認

- 以下の4層が全て維持されていることをコードレベルで確認する:

| 層  | 防御               | 確認内容                                                 |
| --- | ------------------ | -------------------------------------------------------- |
| L1  | ホワイトリスト     | `channels.ts` のチャンネル定義が改変されていないこと     |
| L2  | Sender検証         | `event.senderFrame.url` の検証コードが維持されていること |
| L3  | 引数バリデーション | 各ハンドラの引数チェックコードが維持されていること       |
| L4  | エラーサニタイズ   | エラーレスポンスに内部情報が含まれていないことを確認する |

- `unregisterAllIpcHandlers()` 実行中（ハンドラ解除中）に未認証リクエストが処理されないことを確認する

---

## 参照資料

| 参照資料                   | パス                                                                            | 内容                          |
| -------------------------- | ------------------------------------------------------------------------------- | ----------------------------- |
| Phase 5 実装               | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-5-implementation.md` | 品質検証の基準実装            |
| リファクタリング済みコード | `apps/desktop/src/main/index.ts`                                                | 検証対象                      |
| リファクタリング済みコード | `apps/desktop/src/main/ipc/index.ts`                                            | 検証対象                      |
| リファクタリング記録       | `outputs/phase-8/refactoring-log.md`                                            | Phase 8 の変更履歴            |
| IPC チャネル定義           | `apps/desktop/src/preload/channels.ts`                                          | ホワイトリスト定義            |
| セキュリティ原則           | `.claude/rules/04-electron-security.md`                                         | 4層防御・IPC セキュリティ原則 |

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                               | 内容     |
| ---------- | ---------------------------------- | -------- |
| コード品質 | `.claude/rules/02-code-quality.md` | 品質基準 |

---

## 実行手順

### Step 1: ESLint 実行

```bash
pnpm lint
```

- 結果を記録する（エラー数、警告数）
- エラーがある場合は修正後に再実行する

### Step 2: TypeScript 型チェック

```bash
pnpm typecheck
```

- 結果を記録する（エラー数）
- エラーがある場合は修正後に再実行する

### Step 3: 関連テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/
```

- テスト結果を記録する

### Step 4: プロジェクト全体テスト実行

```bash
pnpm test
```

- テスト結果を記録する
- FAIL テストがある場合は原因を分析する

### Step 5: セキュリティ検証

- 4層防御の各層をコードレベルで確認する
- 確認結果を品質レポートに記録する

### Step 6: 品質レポート作成

- 全タスクの結果を `outputs/phase-9/quality-report.md` に集約する

---

## 品質チェックリスト

### 静的解析

- [ ] ESLint: エラー0
- [ ] ESLint: 新規追加コードに起因する警告0
- [ ] TypeScript: strict mode でエラー0
- [ ] `any` 型の不使用
- [ ] 不必要な型アサーション（`as`）の不使用

### テスト実行

- [ ] `cd apps/desktop && pnpm vitest run src/main/` 全テスト PASS
- [ ] `pnpm test` 全テスト PASS
- [ ] 既存テストへの副作用なし

### テストカバレッジ

- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] Function Coverage 80% 以上

### セキュリティ

- [ ] L1（ホワイトリスト）: チャンネル定義が改変されていない
- [ ] L2（Sender検証）: 検証コードが維持されている
- [ ] L3（引数バリデーション）: バリデーションコードが維持されている
- [ ] L4（エラーサニタイズ）: 内部情報がレスポンスに含まれていない
- [ ] ハンドラ解除中に未認証リクエストが処理されない

### コード品質

- [ ] コードフォーマットが Prettier で適用済み
- [ ] 未使用の import が存在しない
- [ ] Result型による適切なエラーハンドリング（該当箇所がある場合）

---

## 統合テスト連携【必須】

- 本Phaseの決定事項・検証観点を `outputs/phase-11/manual-test-result.md` の手動テスト観点に反映する。
- `app.on("activate")` 再初期化シナリオ（unregister → createWindow → register）の確認観点を維持する。

## 成果物

| 成果物       | パス                                | 内容                                         |
| ------------ | ----------------------------------- | -------------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | ESLint・TypeScript・テスト・セキュリティ結果 |

---

## 完了条件

- [ ] `pnpm lint` PASS（エラー0）
- [ ] `pnpm typecheck` PASS（エラー0）
- [ ] `cd apps/desktop && pnpm vitest run src/main/` 全テスト PASS
- [ ] `pnpm test` 全テスト PASS
- [ ] テストカバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] IPC セキュリティ4層防御が維持されている
- [ ] 品質レポート（`outputs/phase-9/quality-report.md`）が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（Task 1-5）を100%実行完了
- [ ] 各タスクの完了状態を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5, 8 が完了していること
- **後続**: Phase 10 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 品質検証結果

- ESLint エラー数: {{数}}
- ESLint 警告数: {{数}}
- TypeScript エラー数: {{数}}
- 関連テスト: {{PASS数}}/{{総数}}
- 全体テスト: {{PASS数}}/{{総数}}
- テストカバレッジ: Line {{%}} / Branch {{%}} / Function {{%}}

### セキュリティ検証結果

- L1 ホワイトリスト: {{OK/NG}}
- L2 Sender検証: {{OK/NG}}
- L3 引数バリデーション: {{OK/NG}}
- L4 エラーサニタイズ: {{OK/NG}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-10-final-review.md`
