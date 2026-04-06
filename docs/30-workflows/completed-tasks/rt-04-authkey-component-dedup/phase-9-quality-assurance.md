# Phase 9: 品質保証

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 9                             |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

Phase 8（リファクタリング）後の実装に対して lint / typecheck / test を一括実行し、
品質ゲートをすべて通過したうえで Phase 10（最終レビューゲート）への進行可否を判定する。

---

## 実行タスク

### タスク1: lint 実行

```bash
# desktop パッケージ
pnpm --filter @repo/desktop lint

# shared パッケージ
pnpm --filter @repo/shared lint
```

**判定基準**: エラー 0 件（警告は許容、ただし記録すること）

**結果記録テーブル:**

| パッケージ    | エラー件数 | 警告件数 | 判定 |
| ------------- | ---------- | -------- | ---- |
| @repo/desktop | -          | -        | -    |
| @repo/shared  | -          | -        | -    |

---

### タスク2: typecheck 実行

```bash
# desktop パッケージ
pnpm --filter @repo/desktop typecheck

# shared パッケージ
pnpm --filter @repo/shared typecheck
```

**判定基準**: エラー 0 件

**結果記録テーブル:**

| パッケージ    | エラー件数 | 判定 |
| ------------- | ---------- | ---- |
| @repo/desktop | -          | -    |
| @repo/shared  | -          | -    |

---

### タスク3: テスト実行

```bash
# desktop パッケージのテスト全実行
pnpm --filter @repo/desktop test
```

**判定基準**: 全テスト PASS（FAIL 0 件）

**結果記録テーブル:**

| スイート                       | PASS件数 | FAIL件数 | SKIP件数 | 判定 |
| ------------------------------ | -------- | -------- | -------- | ---- |
| `useAuthKeyManagement.test.ts` | -        | -        | -        | -    |
| `AuthKeySection.test.tsx`      | -        | -        | -        | -    |
| その他関連テスト               | -        | -        | -        | -    |

---

### タスク4: カバレッジ確認（変更ファイル対象）

```bash
# useAuthKeyManagement フックのカバレッジ確認
pnpm --filter @repo/desktop test -- --coverage \
  apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts \
  apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx \
  apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx
```

**判定基準**: 変更ファイルの Line Coverage 80%以上

**結果記録テーブル:**

| ファイル                   | Line% | Branch% | Function% | 判定 |
| -------------------------- | ----- | ------- | --------- | ---- |
| `useAuthKeyManagement.ts`  | -     | -       | -         | -    |
| `AuthKeySection/index.tsx` | -     | -       | -         | -    |
| `ApiKeySettingsPanel.tsx`  | -     | -       | -         | -    |

---

### タスク5: 品質ゲート総合判定

| ゲート項目                    | 基準    | 結果 | 判定 |
| ----------------------------- | ------- | ---- | ---- |
| lint エラー（desktop）        | 0 件    | -    | -    |
| lint エラー（shared）         | 0 件    | -    | -    |
| typecheck エラー（desktop）   | 0 件    | -    | -    |
| typecheck エラー（shared）    | 0 件    | -    | -    |
| テスト FAIL                   | 0 件    | -    | -    |
| Line Coverage（変更ファイル） | 80%以上 | -    | -    |

**総合判定: （PASS / FAIL）**

> FAIL の場合は該当する Phase に戻ること:
>
> - lint / typecheck エラー → Phase 8（リファクタリング）または Phase 5（実装）へ
> - テスト FAIL → Phase 6（テスト拡充）または Phase 4（テスト作成）へ
> - カバレッジ未達 → Phase 7（カバレッジ確認）へ

---

## 参照資料

| 参照資料             | パス                                                                     | 内容                            |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------- |
| システム仕様         | `.claude/skills/aiworkflow-requirements/references/`                     | AIWorkflowOrchestrator 正本仕様 |
| 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)                       | AC-1〜AC-6                      |
| 設計書               | [phase-2-design.md](phase-2-design.md)                                   | フック設計・型統一方針          |
| リファクタリング結果 | [phase-8-refactoring.md](phase-8-refactoring.md)                         | Phase 8 成果物                  |
| useAuthKeyManagement | `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`                | 対象実装フック                  |
| AuthKeySection       | `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` | 対象コンポーネント              |
| ApiKeySettingsPanel  | `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`     | 委譲先コンポーネント            |
| ApiKeyStatus 型      | `packages/shared/src/types/skillCreator.ts`                              | 共有型定義                      |

---

## 統合テスト連携【必須】

| 判定項目                        | 基準                         | 確認方法                                      |
| ------------------------------- | ---------------------------- | --------------------------------------------- |
| AC-5: lint/typecheck エラーなし | エラー 0 件                  | `pnpm lint` / `pnpm typecheck` 出力確認       |
| AC-4: 既存テスト全 PASS         | FAIL 0 件                    | `pnpm test` 出力確認                          |
| カバレッジ基準達成              | Line 80%以上（変更ファイル） | `--coverage` オプション付きテスト実行結果確認 |
| Phase 10 進行可否               | 全ゲート PASS 時のみ進行     | タスク5 総合判定テーブル                      |

---

## 成果物

| 成果物           | パス                                | 説明                                  |
| ---------------- | ----------------------------------- | ------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | lint/typecheck/test/coverage 結果一覧 |

---

## 完了条件

- [ ] lint エラー 0 件（desktop・shared 両方）
- [ ] typecheck エラー 0 件（desktop・shared 両方）
- [ ] テスト全 PASS（FAIL 0 件）
- [ ] Line Coverage 80%以上（変更ファイル対象）
- [ ] 品質ゲート総合判定: PASS
- [ ] 成果物 `outputs/phase-9/quality-report.md` 作成済み
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク100%実行確認【必須】

| タスク                      | 完了 |
| --------------------------- | ---- |
| タスク1: lint 実行          | [ ]  |
| タスク2: typecheck 実行     | [ ]  |
| タスク3: テスト実行         | [ ]  |
| タスク4: カバレッジ確認     | [ ]  |
| タスク5: 品質ゲート総合判定 | [ ]  |

---

## 次のPhase

Phase 10: 最終レビューゲート（[phase-10-final-review.md](phase-10-final-review.md)）

**品質ゲート総合判定が PASS の場合のみ Phase 10 へ進むこと。**
