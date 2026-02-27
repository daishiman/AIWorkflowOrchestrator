# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 9                   |
| Phase名    | 品質保証            |
| 前提Phase  | Phase 8             |
| 後続Phase  | Phase 10            |
| ステータス | 未実施              |
| 作成日     | 2026-02-27          |
| 機能名     | TASK-9H-skill-debug |

---

## 目的

静的解析、セキュリティチェック、パフォーマンス確認を行い、TASK-9H デバッグ機能のコード品質を保証する。

## 背景

実装とリファクタリングが完了した後、品質保証フェーズで ESLint・TypeScript 型チェック・セキュリティ脆弱性の確認・パフォーマンス測定を行う。デバッグ機能は式評価（evaluate）を含むため、入力サニタイズのセキュリティ確認が重要である。

---

## 実行タスク

### タスク1: 静的品質検証

- ESLint と TypeScript 型チェックを実行し、品質ゲートを満たすことを確認する

### タスク2: セキュリティ検証

- 式評価サンドボックス、Sender検証、P42 バリデーションの適用を確認する

### タスク3: 性能・複雑度検証

- 応答時間、メモリ増分、複雑度メトリクスを測定して基準内か判定する

### タスク4: 品質レポート確定

- 判定結果を `outputs/phase-9/quality-report.md` に集約し次 Phase に引き継ぐ

---

## SubAgent 分担

| SubAgent               | 関心ごと                               | 参照先                                                                                                                         | 期待成果物           |
| ---------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `static-quality-agent` | ESLint/TypeScript/複雑度の静的品質確認 | `.claude/skills/task-specification-creator/SKILL.md` / `references/quality-standards.md`                                       | 品質メトリクス       |
| `security-audit-agent` | IPC・式評価セキュリティ監査            | `.claude/skills/aiworkflow-requirements/SKILL.md` / `references/security-electron-ipc.md` / `references/security-skill-ipc.md` | セキュリティ監査記録 |
| `runtime-check-agent`  | 性能・回帰テスト確認                   | `.claude/skills/claude-agent-sdk/SKILL.md`                                                                                     | 実行結果サマリー     |

SubAgent は静的品質・セキュリティ・実行時品質を分離して検証し、最終判定のみ統合する。

---

## 参照資料

| 参照資料         | パス                                                                              | 内容                     |
| ---------------- | --------------------------------------------------------------------------------- | ------------------------ |
| Phase 5 成果物   | `apps/desktop/src/main/services/skill/SkillDebugger.ts`                           | 実装コード基準           |
| Phase 8 成果物   | `apps/desktop/src/main/services/skill/SkillDebugger.ts`                           | リファクタリング済コード |
| Phase 8 成果物   | `apps/desktop/src/main/services/skill/DebugSession.ts`                            | リファクタリング済コード |
| Phase 8 成果物   | `apps/desktop/src/main/ipc/skillDebugHandlers.ts`                                 | リファクタリング済コード |
| Phase 8 成果物   | `packages/shared/src/types/skill-debug.ts`                                        | 共有型定義               |
| セキュリティ基準 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC セキュリティ         |
| IPC Agent仕様    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPC契約の正本            |
| Skill I/F仕様    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型契約の正本             |
| IPC契約チェック  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | P42/P44/P45検証          |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | TDD/性能要件             |
| 品質基準         | `.claude/skills/task-specification-creator/references/quality-standards.md`       | 品質基準                 |

---

## 品質ゲート

### 1. ESLint チェック

**合格基準**: エラー 0 件、警告 0 件

```bash
# ESLint チェック（デバッグ関連ファイル）
pnpm --filter @repo/desktop lint

# 特定ファイルのチェック
cd apps/desktop && pnpm eslint src/main/services/skill/SkillDebugger.ts src/main/services/skill/DebugSession.ts src/main/ipc/skillHandlers.ts
```

**確認ファイル一覧**:

| ファイル                                                        | ESLint エラー | ESLint 警告 | 判定 |
| --------------------------------------------------------------- | ------------- | ----------- | ---- |
| `apps/desktop/src/main/services/skill/SkillDebugger.ts`         | -             | -           | -    |
| `apps/desktop/src/main/services/skill/DebugSession.ts`          | -             | -           | -    |
| `apps/desktop/src/main/ipc/skillDebugHandlers.ts`（debug 部分） | -             | -           | -    |
| `packages/shared/src/types/skill-debug.ts`                      | -             | -           | -    |
| `apps/desktop/src/preload/channels.ts`（debug 追加分）          | -             | -           | -    |
| `apps/desktop/src/preload/skill-api.ts`（debug 追加分）         | -             | -           | -    |
| `apps/desktop/src/preload/types.ts`（debug 追加分）             | -             | -           | -    |

### 2. TypeScript 型チェック

**合格基準**: 型エラー 0 件

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

**確認事項**:

- [ ] `any` 型が使用されていない
- [ ] `@ts-ignore` / `@ts-expect-error` が使用されていない
- [ ] 型アサーション（`as`）がバリデーション回避に使用されていない
- [ ] IPC ハンドラの引数型と Preload 側の呼び出し型が一致（P44/P45 対策）

### 3. 全テスト実行

**合格基準**: 全テスト PASS

```bash
# デバッグ関連テスト
cd apps/desktop && pnpm vitest run -- --grep "SkillDebugger|DebugSession|debug"

# 共有型定義テスト
cd packages/shared && pnpm vitest run src/types/__tests__/skill-debug.test.ts

# 既存テストへの影響確認（skillHandlers 全体）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
```

### 4. セキュリティチェック

**式評価（skill:debug:evaluate）の入力サニタイズ確認**:

| チェック項目                                                                 | 判定 |
| ---------------------------------------------------------------------------- | ---- |
| `require()` / `import()` を含む式が拒否される                                | -    |
| `process` / `global` / `globalThis` へのアクセスが拒否される                 | -    |
| `eval()` / `Function()` を含む式が拒否される                                 | -    |
| `__dirname` / `__filename` へのアクセスが拒否される                          | -    |
| ファイルシステム操作（`fs`）関連の式が拒否される                             | -    |
| ネットワーク操作（`http` / `net`）関連の式が拒否される                       | -    |
| 式の長さ上限が設定されている（1024 文字以下）                                | -    |
| エラーメッセージに内部情報（ファイルパス、スタックトレース）が含まれていない | -    |

**IPC セキュリティ確認**:

| チェック項目                                                                             | 判定 |
| ---------------------------------------------------------------------------------------- | ---- |
| 全7チャネルで `validateIpcSender` が呼び出されている                                     | -    |
| 全7チャネルで P42 準拠3段バリデーション（型 → 空文字列 → trim 空文字列）が実装されている | -    |
| チャネル名が `IPC_CHANNELS` 定数で参照されている（ハードコード文字列なし）               | -    |
| エラーレスポンスがサニタイズされている（内部情報漏洩なし）                               | -    |

### 5. パフォーマンス確認

| メトリクス                               | 基準値  | 実測値 | 判定 |
| ---------------------------------------- | ------- | ------ | ---- |
| デバッグセッション開始の応答時間         | ≤ 100ms | -      | -    |
| ブレークポイント追加の応答時間           | ≤ 50ms  | -      | -    |
| 変数インスペクションの応答時間           | ≤ 200ms | -      | -    |
| 式評価の応答時間                         | ≤ 500ms | -      | -    |
| 100 個ブレークポイント登録時のメモリ増加 | ≤ 10MB  | -      | -    |

### 6. 複雑度メトリクス

| メトリクス   | 基準値 | SkillDebugger.ts | DebugSession.ts | skillHandlers（debug） | 判定 |
| ------------ | ------ | ---------------- | --------------- | ---------------------- | ---- |
| 循環的複雑度 | ≤ 10   | -                | -               | -                      | -    |
| 認知的複雑度 | ≤ 15   | -                | -               | -                      | -    |
| メソッド行数 | ≤ 30   | -                | -               | -                      | -    |
| ファイル行数 | ≤ 300  | -                | -               | -                      | -    |

---

## 実行手順

1. SubAgent 分担に沿って静的品質・セキュリティ・性能確認を実施する。
2. 下記コマンドで品質ゲート項目を実測する。
3. チェックリスト判定を `outputs/phase-9/quality-report.md` に集約する。

### 実行コマンド

```bash
# ESLint チェック
pnpm --filter @repo/desktop lint

# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# フォーマットチェック
pnpm --filter @repo/desktop format:check

# 全テスト実行
cd apps/desktop && pnpm vitest run -- --grep "SkillDebugger|DebugSession|debug"

# 脆弱性スキャン
pnpm audit
```

---

## 成果物

| 成果物       | パス                                                                      | 内容             |
| ------------ | ------------------------------------------------------------------------- | ---------------- |
| 品質レポート | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-9/quality-report.md` | 品質チェック結果 |

---

## 統合テスト連携（Phase 1〜11 は必須）

Phase 9 では以下の統合テスト連携アクションを実施:

- [ ] 品質保証で統合テスト結果を確認（全テスト PASS）
- [ ] パフォーマンス影響がある変更がないことを確認
- [ ] セキュリティチェック結果を統合テスト結果に反映

---

## 品質チェックリスト

### 機能検証

- [ ] SkillDebugger の全ユニットテスト成功
- [ ] DebugSession の全ユニットテスト成功
- [ ] IPC ハンドラの全テスト成功（7チャネル）
- [ ] 共有型定義の全テスト成功
- [ ] 既存の skillHandlers テストへの影響がない

### コード品質

- [ ] ESLint エラー 0 件
- [ ] ESLint 警告 0 件
- [ ] TypeScript 型エラー 0 件
- [ ] コードフォーマット適用済み（Prettier）
- [ ] `any` 型が使用されていない
- [ ] `@ts-ignore` / `@ts-expect-error` が使用されていない

### セキュリティ

- [ ] 式評価の入力サニタイズが実装されている（禁止キーワード拒否）
- [ ] 式の長さ上限が設定されている（1024 文字以下）
- [ ] 全7チャネルで `validateIpcSender` が呼び出されている
- [ ] P42 準拠3段バリデーションが全チャネルに実装されている
- [ ] チャネル名が `IPC_CHANNELS` 定数で参照されている
- [ ] エラーメッセージに内部情報が含まれていない

### パフォーマンス

- [ ] デバッグセッション開始の応答時間 ≤ 100ms
- [ ] ブレークポイント追加の応答時間 ≤ 50ms
- [ ] 変数インスペクションの応答時間 ≤ 200ms
- [ ] 式評価の応答時間 ≤ 500ms

---

## 完了条件

- [ ] ESLint エラー・警告 0 件
- [ ] TypeScript 型エラー 0 件
- [ ] コードフォーマット適用済み
- [ ] 全テスト成功（デバッグ関連 + 既存テストへの影響なし）
- [ ] セキュリティチェック全項目 PASS
- [ ] パフォーマンス基準全項目 PASS
- [ ] 複雑度メトリクス全項目が基準内
- [ ] 統合テスト連携アクションが完了している
- [ ] 本 Phase 内の全 SubAgent タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全 SubAgent タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] SubAgent 実行記録が記録されている

---

## 依存関係

- **前提**: Phase 5, 6, 7, 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. SubAgent 分担タスクの実行（各担当ごとに1タスク）
3. ESLint チェック実施
4. TypeScript 型チェック実施
5. 全テスト実行
6. セキュリティチェック実施（式評価サニタイズ + IPC セキュリティ）
7. パフォーマンス確認
8. 複雑度メトリクス測定
9. 統合テスト連携の実施
10. 成果物の作成・配置
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## SubAgent 100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全 SubAgent タスクを 100%実行完了
- [ ] 各担当の成果物が生成されている
- [ ] SubAgent 実行記録が `outputs/phase-9/quality-report.md` に記録されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9H-skill-debug --phase 9
```

---

## SubAgent 実行記録（全 Phase 共通）

Phase 完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### SubAgent 実行結果

- static-quality-agent: [success/failure/partial]
- security-audit-agent: [success/failure/partial]
- runtime-check-agent: [success/failure/partial]

### 品質メトリクス

- ESLint エラー: [数値]件
- ESLint 警告: [数値]件
- TypeScript 型エラー: [数値]件
- 循環的複雑度（最大）: [数値]

### セキュリティチェック

- 式評価サニタイズ: [PASS/FAIL]
- IPC セキュリティ: [PASS/FAIL]

### パフォーマンス

- セッション開始応答時間: [数値]ms
- ブレークポイント追加応答時間: [数値]ms
- 変数インスペクション応答時間: [数値]ms
- 式評価応答時間: [数値]ms

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次 Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9H-skill-debug/phase-10-final-review.md`
