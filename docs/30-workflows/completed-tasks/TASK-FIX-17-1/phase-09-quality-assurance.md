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
| タスクID   | TASK-FIX-17-1-SKILL-SCAN-HANDLER   |
| タスク名   | skill:scan IPCハンドラーの新規追加 |

---

## 目的

静的解析・セキュリティ・機能の観点から品質を検証する。

## 背景

実装・リファクタリング完了後、本番リリースに向けた品質保証を行う。

---

## 実行コマンド

### 1. ESLint実行

```bash
pnpm lint
```

**期待結果**: エラー・警告なし

### 2. TypeScript型チェック

```bash
pnpm typecheck
```

**期待結果**: 型エラーなし

### 3. 全テスト実行

```bash
pnpm --filter @repo/desktop test
```

**期待結果**: 全テストPASS

---

## 確認ポイント

### 1. 型エラーなし

- [ ] `pnpm typecheck` が正常終了
- [ ] `SKILL_SCAN` ハンドラーの戻り値型が正しい
- [ ] `IPC_CHANNELS.SKILL_SCAN` の参照が正しい

### 2. Lintエラーなし

- [ ] `pnpm lint` が正常終了
- [ ] 未使用変数・インポートがない
- [ ] 命名規則違反がない

### 3. テスト全PASS

- [ ] `skillHandlers.test.ts` の全テストがPASS
- [ ] 新規追加した `SKILL_SCAN` のテストがPASS
- [ ] 既存の `SKILL_LIST` テストが影響を受けていない

---

## セキュリティチェック

### 1. validateIpcSender が使用されている

- [ ] `withValidation()` ラッパー内で送信元検証が行われる
- [ ] 未認証のウィンドウからの呼び出しが拒否される

### 2. エラーメッセージに内部情報を漏洩していない

- [ ] スタックトレースがユーザーに露出しない
- [ ] ファイルパスなどの機密情報がエラーメッセージに含まれない
- [ ] エラーはサニタイズされてRendererに送られる

### セキュリティ観点の確認コード

```typescript
// 期待されるエラーハンドリングパターン
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCAN,
  withValidation(async (_event) => {
    try {
      const skills = await skillService.scanAvailableSkills(true);
      return { success: true, data: skills };
    } catch (error) {
      // 内部エラー情報を漏洩しない
      log.error("スキルスキャンに失敗しました", error);
      return {
        success: false,
        error: "スキルのスキャンに失敗しました", // サニタイズされたメッセージ
      };
    }
  }),
);
```

---

## 参照資料

| 参照資料       | パス                                              | 内容     |
| -------------- | ------------------------------------------------- | -------- |
| 実装コード     | `apps/desktop/src/main/ipc/skillHandlers.ts`      | 検証対象 |
| テストファイル | `apps/desktop/src/main/ipc/skillHandlers.test.ts` | 検証対象 |
| チャンネル定義 | `apps/desktop/src/preload/channels.ts`            | 参照確認 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                           | 内容        |
| ---------------- | -------------------------------------------------------------- | ----------- |
| 品質基準         | `.claude/skills/aiworkflow-requirements/references/quality.md` | 品質基準    |
| セキュリティ原則 | `.claude/rules/04-electron-security.md`                        | IPC安全基準 |

---

## 成果物

| 成果物       | パス                                                                                                        | 内容         |
| ------------ | ----------------------------------------------------------------------------------------------------------- | ------------ |
| 品質レポート | `docs/30-workflows/skill-import-agent-system/phase-outputs/TASK-FIX-17-1/outputs/phase-9/quality-report.md` | 品質検証結果 |

---

## 品質チェックリスト

### 機能検証

- [ ] 全ユニットテスト成功
- [ ] `SKILL_SCAN` ハンドラーが正常動作

### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

### テスト網羅性

- [ ] Line Coverage 80%+
- [ ] Branch Coverage 60%+
- [ ] Function Coverage 80%+

### セキュリティ

- [ ] 入力バリデーションが適切（`withValidation`）
- [ ] エラーメッセージに機密情報が含まれていない
- [ ] Result型による適切なエラーハンドリング

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 9での必須アクション

- [ ] 品質保証で統合テスト結果を確認
- [ ] セキュリティ観点の検証（validateIpcSender）
- [ ] 既存ハンドラーへの影響がないことを確認

---

## 完了条件

- [ ] 全ユニットテスト成功
- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み
- [ ] テストカバレッジ基準達成
- [ ] セキュリティチェック完了
- [ ] 品質レポートが出力されている
- [ ] **本Phase内の全チェック項目を100%完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全チェック項目を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
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
- テスト結果: {{PASS/FAIL}}
- テストカバレッジ: {{%}}

### セキュリティ検証結果

- validateIpcSender使用: {{PASS/FAIL}}
- エラーメッセージ漏洩なし: {{PASS/FAIL}}

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

`docs/30-workflows/skill-import-agent-system/phase-outputs/TASK-FIX-17-1/phase-10-final-review.md`
