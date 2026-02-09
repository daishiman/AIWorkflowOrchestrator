# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 8                                  |
| Phase名    | リファクタリング                   |
| 前提Phase  | Phase 7 (テストカバレッジ確認)     |
| 後続Phase  | Phase 9 (品質保証)                 |
| ステータス | 未実施                             |
| 作成日     | 2026-02-08                         |
| タスクID   | TASK-FIX-17-1-SKILL-SCAN-HANDLER   |
| タスク名   | skill:scan IPCハンドラーの新規追加 |

---

## 目的

TDD Refactor フェーズ：テストを維持しながらコード品質を改善する。

## 背景

Phase 5〜7で `SKILL_SCAN` ハンドラーの実装・テストが完了した状態で、コード品質改善のリファクタリングを行う。今回は新規ハンドラー追加のため、大規模なリファクタリングは不要だが、一貫性の確認を重点的に行う。

---

## リファクタリング方針

### 新規追加のため大規模リファクタリング不要

今回のタスクは既存コードの修正ではなく、新規ハンドラーの追加であるため、大規模なリファクタリングは必要ない。

---

## 確認ポイント

### 1. 命名規則の一貫性

- [ ] ハンドラー名が他のハンドラーと一貫している
  - `SKILL_LIST`, `SKILL_GET`, `SKILL_EXECUTE` と同様のパターン
  - `SKILL_SCAN` という命名が適切か確認
- [ ] 関数名・変数名が既存コードと整合している

### 2. エラーメッセージの日本語統一

- [ ] エラーメッセージが日本語で統一されているか確認
  - 例: `スキルスキャンに失敗しました` など
- [ ] 他のハンドラーのエラーメッセージ形式と整合しているか確認
- [ ] ユーザーに表示されるメッセージとログ用メッセージの使い分け確認

### 3. ログ出力の追加検討

- [ ] 適切なログレベルの選定
  - `log.info`: 正常なスキャン開始・完了
  - `log.debug`: 詳細なスキャン情報（スキル数等）
  - `log.error`: スキャン失敗時
- [ ] 他のハンドラーのログ出力パターンとの一貫性確認

---

## 参照資料

| 参照資料       | パス                                         | 内容                 |
| -------------- | -------------------------------------------- | -------------------- |
| 実装コード     | `apps/desktop/src/main/ipc/skillHandlers.ts` | リファクタリング対象 |
| 既存ハンドラー | `apps/desktop/src/main/ipc/skillHandlers.ts` | 参考パターン         |
| チャンネル定義 | `apps/desktop/src/preload/channels.ts`       | チャンネル名の確認   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                          | 内容        |
| ---------------- | ------------------------------------------------------------- | ----------- |
| コーディング規約 | `.claude/skills/aiworkflow-requirements/references/coding.md` | コード規約  |
| IPCセキュリティ  | `.claude/rules/04-electron-security.md`                       | IPC設計原則 |

---

## 成果物

| 成果物               | パス                                                                                                         | 内容             |
| -------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------- |
| リファクタリング記録 | `docs/30-workflows/skill-import-agent-system/phase-outputs/TASK-FIX-17-1/outputs/phase-8/refactoring-log.md` | 改善内容・変更点 |

---

## 一貫性確認チェックリスト

### コードパターン

- [ ] `withValidation()` ラッパーの使用
- [ ] `IPC_CHANNELS` 定数の参照
- [ ] `validateIpcSender` によるセキュリティ検証
- [ ] Result パターン（`{ success: true, data }` / `{ success: false, error }`）の使用

### 既存ハンドラーとの比較

```typescript
// SKILL_LIST（参考）
ipcMain.handle(
  IPC_CHANNELS.SKILL_LIST,
  withValidation(async (_event, forceRefresh?: boolean) => {
    const skills = await skillService.scanAvailableSkills(forceRefresh);
    return { success: true, data: skills };
  }),
);

// SKILL_SCAN（新規追加）
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCAN,
  withValidation(async (_event) => {
    const skills = await skillService.scanAvailableSkills(true);
    return { success: true, data: skills };
  }),
);
```

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- skillHandlers

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 完了条件

- [ ] 確認ポイント（命名規則・エラーメッセージ・ログ出力）の検証完了
- [ ] 全テストが成功している
- [ ] TypeScript型エラーがない
- [ ] ESLint警告がない
- [ ] リファクタリング記録が文書化されている
- [ ] **本Phase内の全確認項目を100%完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全確認項目を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5, 6, 7 が完了していること
- **後続**: Phase 9 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 確認結果

- 命名規則の一貫性: {{PASS/FAIL}}
- エラーメッセージの日本語統一: {{PASS/FAIL}}
- ログ出力の適切性: {{PASS/FAIL}}

### リファクタリング内容

- 変更点:
- 改善効果:

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

`docs/30-workflows/skill-import-agent-system/phase-outputs/TASK-FIX-17-1/phase-09-quality-assurance.md`
