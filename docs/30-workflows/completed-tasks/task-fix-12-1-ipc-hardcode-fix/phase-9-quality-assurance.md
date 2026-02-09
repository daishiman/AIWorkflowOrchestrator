# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 9                                  |
| Phase名    | 品質保証                           |
| 前提Phase  | Phase 8 (リファクタリング)         |
| 後続Phase  | Phase 10 (最終レビューゲート)      |
| ステータス | 未実施                             |
| 作成日     | 2026-02-08                         |
| タスクID   | TASK-FIX-12-1-IPC-HARDCODE-FIX     |
| 機能名     | SkillExecutorのIPCチャネル名定数化 |
| 分類       | リファクタリング（小規模）         |

---

## 目的

静的解析・セキュリティ・テストの観点から品質を検証する。

## 背景

IPC チャネル名の定数化完了後、本番リリースに向けた品質保証を行う。
小規模変更のため、品質検証は簡潔に実施する。

---

## 使用スキル

> 本タスクは小規模リファクタリングのため、追加スキルは不要。
> 標準品質チェックコマンドを実行する。

---

## 参照資料

| 参照資料           | パス                                                    | 内容             |
| ------------------ | ------------------------------------------------------- | ---------------- |
| 実装コード         | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 検証対象         |
| IPC定数定義        | `packages/shared/src/ipc/channels.ts`                   | SKILL_STREAM定数 |
| セキュリティルール | `.claude/rules/04-electron-security.md`                 | IPC セキュリティ |

---

## 成果物

| 成果物       | パス                                                                                 | 内容         |
| ------------ | ------------------------------------------------------------------------------------ | ------------ |
| 品質レポート | `docs/30-workflows/task-fix-12-1-ipc-hardcode-fix/outputs/phase-9/quality-report.md` | 品質検証結果 |

---

## 品質チェックリスト

### 1. Lint検証

```bash
pnpm lint
```

- [ ] ESLint エラーなし
- [ ] ESLint 警告なし（または既存の警告のみ）

### 2. 型チェック検証

```bash
pnpm typecheck
```

- [ ] TypeScript 型エラーなし
- [ ] `SKILL_CHANNELS.SKILL_STREAM` が正しく参照されている

### 3. テスト検証

```bash
pnpm --filter @repo/desktop test
```

- [ ] 全ユニットテスト成功
- [ ] SkillExecutor関連テスト成功

### 4. ハードコード残存確認

```bash
# SkillExecutor.ts 内の "skill:stream" ハードコード残存チェック
grep -n '"skill:stream"' apps/desktop/src/main/services/skill/SkillExecutor.ts

# プロジェクト全体での確認（参考）
grep -rn '"skill:stream"' apps/desktop/src/main/ --include="*.ts"
```

- [ ] `SkillExecutor.ts` に `"skill:stream"` のハードコードが残っていないこと
- [ ] `SKILL_CHANNELS.SKILL_STREAM` 経由でのみ参照されていること

### 5. セキュリティルール準拠確認

`.claude/rules/04-electron-security.md` の IPC セキュリティ原則:

- [ ] チャンネル名はホワイトリストで管理されている
- [ ] チャンネル名は定数で参照されている
- [ ] ハードコード文字列でチャンネル名を指定していない

---

## 実行コマンド一覧

```bash
# 1. Lint実行
pnpm lint

# 2. 型チェック
pnpm typecheck

# 3. テスト実行（desktop パッケージ）
pnpm --filter @repo/desktop test

# 4. ハードコード残存確認
grep -n '"skill:stream"' apps/desktop/src/main/services/skill/SkillExecutor.ts

# 5. 定数参照確認
grep -n 'SKILL_CHANNELS.SKILL_STREAM' apps/desktop/src/main/services/skill/SkillExecutor.ts
```

---

## 統合テスト連携

**該当なし**: 本タスクは動作変更を伴わないリファクタリング（IPCチャネル名の定数化）のため、統合テストへの影響はありません。既存のテストスイートがPASSすることで動作互換性を確認します。

---

## 完了条件

- [ ] `pnpm lint` がエラーなしで完了
- [ ] `pnpm typecheck` がエラーなしで完了
- [ ] `pnpm --filter @repo/desktop test` が全テスト成功
- [ ] `"skill:stream"` のハードコードが残存していないこと
- [ ] セキュリティルール準拠が確認されていること
- [ ] 品質レポートが出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各チェック項目を100%完了し、完了を明記
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

- Lintエラー: {{数}}
- 型エラー: {{数}}
- テスト成功率: {{%}}
- ハードコード残存: {{あり/なし}}

### セキュリティルール準拠

- IPCチャンネル名定数化: {{完了/未完了}}

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

`docs/30-workflows/task-fix-12-1-ipc-hardcode-fix/phase-10-final-review.md`
