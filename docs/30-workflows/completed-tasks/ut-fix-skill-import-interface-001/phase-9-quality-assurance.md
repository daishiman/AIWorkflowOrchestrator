# Phase 9: 品質保証 - skill:import IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 9                                     |
| Phase名    | 品質保証                              |
| タスクID   | UT-FIX-SKILL-IMPORT-INTERFACE-001     |
| 機能名     | skill:import IPC インターフェース修正 |
| 種別       | バグ修正 (fix)                        |
| 前提Phase  | Phase 8（リファクタリング）           |
| 後続Phase  | Phase 10（最終レビューゲート）        |
| ステータス | 未実施                                |
| 作成日     | 2026-02-21                            |

---

## 目的

Lint、型チェック、全テスト実行による静的解析・動的解析を行い、skill:import ハンドラの引数変更（`{ skillIds: string[] }` → `skillName: string`）後のコード品質が基準を満たすことを検証する。P42準拠の3段バリデーションが正しく実装されていること、P23/P32準拠の3箇所同時更新（ハンドラ・Preload API・テスト）の整合性を確認する。

## 背景

skill:import IPCハンドラがオブジェクト形式 `{ skillIds: string[] }` を期待していたのに対し、Preload側は単一の文字列 `skillName` を渡していた。この不整合（P44）を修正し、ハンドラ側を `skillName: string` に統一した。修正後のコード品質・セキュリティ・テスト整合性を品質保証する。

---

## 実行タスク

- タスク実行: 本Phaseで定義したタスクを上から順に実行し、結果を成果物に記録する。

### Task 1: ESLint 実行と全エラー修正

- `pnpm --filter @repo/desktop lint` を実行し、エラーが0であることを確認する
- 新規追加・変更コードに起因する警告がある場合は全て修正する
- 修正対象ファイル:
  - `apps/desktop/src/main/ipc/skillHandlers.ts`
  - `apps/desktop/src/preload/skill-api.ts`
  - `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts`
  - 修正に伴い変更された全ファイル

### Task 2: TypeScript 型チェック実行と全型エラー修正

- `pnpm typecheck` を実行し、strict mode でエラーが0であることを確認する
- `any` 型が使用されていないことを確認する
- 型アサーション（`as`）が不必要に使用されていないことを確認する
- P32確認: `apps/desktop/src/preload/types.ts` と `packages/shared/src/agent/types.ts` の型定義が整合していることを確認する

### Task 3: 関連テスト全パス確認

- 以下のコマンドで関連テストを実行し、全テストが PASS することを確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
```

```bash
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api
```

- テスト結果から以下を記録する:
  - 総テスト数
  - PASS 数
  - FAIL 数（0であること）
  - テスト実行時間

### Task 4: プロジェクト全体のテスト実行

- 以下のコマンドでデスクトップパッケージ全体のテストを実行する:

```bash
pnpm --filter @repo/desktop test
```

- 既存テストへの副作用がないことを確認する
- FAIL するテストがある場合は、本タスクの修正に起因するかどうかを判定する

### Task 5: IPCセキュリティ4層防御の維持確認

- 以下の4層が全て維持されていることをコードレベルで確認する:

| 層  | 防御               | 確認内容                                                                         |
| --- | ------------------ | -------------------------------------------------------------------------------- |
| L1  | ホワイトリスト     | `channels.ts` の `SKILL_IMPORT` チャンネル定義が維持されていること               |
| L2  | Sender検証         | `validateIpcSender` による送信元検証コードが維持されていること                   |
| L3  | 引数バリデーション | P42準拠3段バリデーション（typeof → 空文字列 → trim空文字列）が実装されていること |
| L4  | エラーサニタイズ   | エラーレスポンスに内部スタックトレース・ファイルパスが含まれていないこと         |

### Task 6: P23/P44/P45 整合性確認

- P23確認: ハンドラ・Preload API・テストの3箇所が整合していることを確認する
  - ハンドラ: `skillName: string` を受け取る
  - Preload API: `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)` で文字列を渡す
  - テスト: 修正後の引数形式（`string`）でテストが記述されている
- P44確認: ハンドラとPreload間のインターフェース契約が一致していること
- P45確認: 引数名 `skillName` が実際のセマンティクス（スキル名）と一致していること

### Task 7: 他IPCハンドラへの影響確認

- 以下のIPCハンドラが修正の影響を受けていないことを確認する:
  - `skill:remove` — 既に UT-FIX-SKILL-REMOVE-INTERFACE-001 で修正済み
  - `skill:abort` — 変更なし
  - `skill:get-status` — 変更なし
  - `skill:readFile` — 変更なし
  - `skill:writeFile` — 変更なし
  - `skill:list` — 変更なし
- skill:remove との実装パターン一致を確認する（同一の3段バリデーションパターン）

---

## 参照資料

| 参照資料         | パス                                                                            | 内容                      |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------- |
| Phase 5 実装     | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-5-implementation.md` | 品質検証の基準実装        |
| ハンドラ実装     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                    | 修正対象ハンドラ          |
| Preload API      | `apps/desktop/src/preload/skill-api.ts`                                         | Preload側インターフェース |
| Preload型定義    | `apps/desktop/src/preload/types.ts`                                             | Preload層型定義           |
| 共有型定義       | `packages/shared/src/agent/types.ts`                                            | 共有型定義                |
| IPC チャネル定義 | `apps/desktop/src/preload/channels.ts`                                          | ホワイトリスト定義        |
| skill:remove修正 | `docs/30-workflows/completed-tasks/ut-fix-skill-remove-interface/`              | 同一パターンの先行修正    |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                          | 内容                     |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| セキュリティIPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | IPC セキュリティ原則     |
| セキュリティSkill IPC | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`     | sender検証・入力検証     |
| テスト品質            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 品質基準                 |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラー応答整合           |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | P23/P32/P42/P44 統合確認 |

---

## 実行手順

### Step 1: ESLint 実行

```bash
pnpm --filter @repo/desktop lint
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
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api
```

- テスト結果を記録する

### Step 4: プロジェクト全体テスト実行

```bash
pnpm --filter @repo/desktop test
```

- テスト結果を記録する
- FAIL テストがある場合は原因を分析する

### Step 5: セキュリティ検証

- 4層防御の各層をコードレベルで確認する
- P42準拠の3段バリデーションが正しく実装されていることを確認する
- 確認結果を品質レポートに記録する

### Step 6: P23/P44/P45 整合性確認

- ハンドラ・Preload API・テストの3箇所が整合していることを確認する
- 引数名 `skillName` のセマンティクス一致を確認する

### Step 7: 他IPCハンドラ影響確認

- skill:remove, skill:abort, skill:get-status, skill:readFile 等への副作用がないことを確認する

### Step 8: 品質レポート作成

- 全タスクの結果を `outputs/phase-9/quality-report.md` に集約する

---

## 品質チェックリスト

### 静的解析

- [ ] ESLint: エラー0
- [ ] ESLint: 新規追加・変更コードに起因する警告0
- [ ] TypeScript: strict mode でエラー0
- [ ] `any` 型の不使用
- [ ] 不必要な型アサーション（`as`）の不使用

### テスト実行

- [ ] `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers` 全テスト PASS
- [ ] `cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api` 全テスト PASS
- [ ] `pnpm --filter @repo/desktop test` 全テスト PASS
- [ ] 既存テストへの副作用なし

### テストカバレッジ

- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] Function Coverage 80% 以上

### セキュリティ（4層防御）

- [ ] L1（ホワイトリスト）: `SKILL_IMPORT` チャンネル定義が維持されている
- [ ] L2（Sender検証）: `validateIpcSender` 検証コードが維持されている
- [ ] L3（引数バリデーション）: P42準拠3段バリデーション実装（typeof → 空文字列 → trim空文字列）
- [ ] L4（エラーサニタイズ）: 内部情報がレスポンスに含まれていない

### P44/P45 整合性

- [ ] P23: ハンドラ・Preload API・テストの3箇所が整合している
- [ ] P32: `preload/types.ts` と `shared/types.ts` の型定義が一致している
- [ ] P44: ハンドラ-Preload間のインターフェース契約が一致（`skillName: string`）
- [ ] P45: 引数名がセマンティクスと一致（`skillName`）

### 他IPCハンドラへの影響

- [ ] skill:remove に副作用なし
- [ ] skill:abort に副作用なし
- [ ] skill:get-status に副作用なし
- [ ] skill:readFile / skill:writeFile に副作用なし
- [ ] skill:list に副作用なし
- [ ] skill:remove との実装パターン一致

### コード品質

- [ ] コードフォーマットが Prettier で適用済み
- [ ] 未使用の import が存在しない
- [ ] Result型による適切なエラーハンドリング（該当箇所がある場合）

---

## 統合テスト連携【必須】

- 本Phaseの決定事項・検証観点を `outputs/phase-11/auto-test-result.md` の手動テスト観点に反映する。
- skill:import の「スキルインポート」操作シナリオの確認観点を維持する。

## 多角的チェック観点

| 観点         | 確認内容                                                     |
| ------------ | ------------------------------------------------------------ |
| 機能要件     | skill:import ハンドラが `skillName: string` を正しく受け取る |
| セキュリティ | 4層防御パターンが維持されている                              |
| 一貫性       | skill:remove との実装パターンが一致している                  |
| P42準拠      | 3段バリデーションが正しく実装されている                      |
| P44解決      | ハンドラ-Preload間のインターフェース整合                     |
| P45解決      | 引数命名のセマンティクス一致（skillName）                    |
| 退行テスト   | 他のIPCハンドラ・テストに影響がない                          |

---

## 成果物

| 成果物       | パス                                | 内容                                                 |
| ------------ | ----------------------------------- | ---------------------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | ESLint・TypeScript・テスト・セキュリティ・整合性結果 |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` PASS（エラー0）
- [ ] `pnpm typecheck` PASS（エラー0）
- [ ] `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers` 全テスト PASS
- [ ] `cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api` 全テスト PASS
- [ ] `pnpm --filter @repo/desktop test` 全テスト PASS
- [ ] テストカバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] IPC セキュリティ4層防御が維持されている
- [ ] P23/P32/P44/P45 整合性が確認されている
- [ ] 他IPCハンドラへの影響がないことが確認されている
- [ ] 品質レポート（`outputs/phase-9/quality-report.md`）が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（Task 1-7）を100%実行完了
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
- 関連テスト（skillHandlers）: {{PASS数}}/{{総数}}
- 関連テスト（skill-api）: {{PASS数}}/{{総数}}
- 全体テスト: {{PASS数}}/{{総数}}
- テストカバレッジ: Line {{%}} / Branch {{%}} / Function {{%}}

### セキュリティ検証結果

- L1 ホワイトリスト: {{OK/NG}}
- L2 Sender検証: {{OK/NG}}
- L3 引数バリデーション（P42準拠3段）: {{OK/NG}}
- L4 エラーサニタイズ: {{OK/NG}}

### P44/P45 整合性確認結果

- P23 3箇所同時更新: {{OK/NG}}
- P32 型定義整合: {{OK/NG}}
- P44 インターフェース整合: {{OK/NG}}
- P45 引数命名セマンティクス: {{OK/NG}}

### 他IPCハンドラ影響確認

- skill:remove: {{影響なし/影響あり}}
- skill:abort: {{影響なし/影響あり}}
- skill:get-status: {{影響なし/影響あり}}
- skill:readFile/writeFile: {{影響なし/影響あり}}

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

`docs/30-workflows/ut-fix-skill-import-interface-001/phase-10-final-review.md`
