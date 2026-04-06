# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 1                           |
| Phase名    | 要件定義                    |
| 前提Phase  | なし                        |
| 後続Phase  | Phase 2（設計）             |
| ステータス | 完了                        |
| 作成日     | 2026-04-06                  |
| タスクID   | TASK-FIX-IPC-SKILL-NAME-001 |

## 目的

30種の思考法による多角的検証（elegant-review）で特定された2バグの要件を定義し、修正範囲・成功基準・制約を明確にする。

## 背景

`SkillLifecyclePanel.tsx` のコンソールエラーログから以下が検出された。

```
[P0-08] listSessions failed: Error: No handler registered for 'skill-creator:cleanup-expired-sessions'
Error occurred in handler for 'skill-creator:execute-plan': Error: No handler registered for 'skill-creator:execute-plan'
skill:create failed: Error: スキル名はハイフンケース（小文字、数字、ハイフン）である必要があります
```

根本原因調査（論理・構造分析、メタ・発想分析、システム・戦略・問題解決分析の3エージェント並列実施）により以下を特定。

## バグ要件定義

### Bug 1: IPCハンドラ重複登録

**問題の所在**

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| ファイル     | `apps/desktop/src/main/ipc/creatorHandlers.ts`                     |
| 重複箇所     | `registerRuntimeSkillCreatorHandlers()` 内の同一チャンネル重複登録 |
| チャンネル名 | `skill-creator:get-adapter-status`                                 |

**因果連鎖**

```
重複登録 → Electron例外スロー → registerRuntimeSkillCreatorHandlers()中断
  → 後続ハンドラが未登録（14ハンドラ）
  → UIからのinvoke()が全てエラー応答
  → セッションクリーンアップ不能 → セッションリーク蓄積
```

**修正要件**

- `registerRuntimeSkillCreatorHandlers()` 内の 2回目の `ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS, ...)` ブロックを削除する
- `unregisterRuntimeSkillCreatorHandlers()` は変更不要（removeHandler は1回のみ）
- 削除後に後続ハンドラが連続登録されること

### Bug 2: スキル名生成・バリデーション不整合

**問題の所在**

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| 生成ファイル | `apps/desktop/src/main/services/skill/SkillService.ts` |
| 検証ファイル | `.agents/skills/skill-creator/scripts/init_skill.js`   |
| 仕様権威     | `docs/00-requirements/18-skills.md §3.2.2.1`           |

**不整合の詳細**

| 文字種                             | `toWizardSkillName` 現在の扱い | `init_skill.js` の要件 |
| ---------------------------------- | ------------------------------ | ---------------------- |
| 大文字（A-Z）                      | 通過（許可）                   | 拒否                   |
| アンダースコア（\_）               | 通過（許可）                   | 拒否                   |
| 日本語（ひらがな・カタカナ・漢字） | 通過（許可）                   | 拒否                   |

**修正要件**

- `toWizardSkillName()` の出力が常に `/^[a-z0-9]+(-[a-z0-9]+)*$/` に適合すること
- 最低限の変換: `.toLowerCase()` 追加、非許容文字を `-` に変換、先頭末尾のハイフンを除去
- 変換後も空文字になる場合は `"new-skill"` フォールバックを維持

## Acceptance Criteria

| ID   | 条件                                                                 | 検証方法                  |
| ---- | -------------------------------------------------------------------- | ------------------------- |
| AC-1 | `registerRuntimeSkillCreatorHandlers()` が例外なく完走する           | 統合テスト                |
| AC-2 | 全16のskill-creatorチャンネルがipcMainに登録される                   | ユニットテスト            |
| AC-3 | `toWizardSkillName()` 出力が `/^[a-z0-9]+(-[a-z0-9]+)*$/` に適合     | ユニットテスト            |
| AC-4 | 日本語・大文字・アンダースコア入力でもスキル作成が成功する           | ユニットテスト + 手動確認 |
| AC-5 | 既存スキル（英小文字・数字・ハイフンのみ）への後方互換性が維持される | 回帰テスト                |

## スコープ

### 含む

- `creatorHandlers.ts` の重複ハンドラブロック削除
- `SkillService.ts` の `toWizardSkillName()` 変換ロジック修正
- 上記2ファイルに対するユニットテスト追加

### 含まない

- `init_skill.js` のバリデーション緩和（仕様の権威を変更しない）
- UIウィザードでのリアルタイム名前バリデーション（別タスク）
- `@repo/shared` へのSKILL_NAME_PATTERN定数一元化（中長期改善、別タスク）
- 日本語→ローマ字の意味的変換（別タスク）

## 制約・リスク

| 制約       | 詳細                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| 変更最小性 | Bug 1は純粋削除のみ。Bug 2はtoWizardSkillName内のみ変更                                                    |
| 後方互換性 | 既存スキル（英小文字・数字・ハイフン）は影響を受けない                                                     |
| UX劣化許容 | 日本語入力は `new-skill` を基準に、衝突時のみ `new-skill-2` 以降へ解決されることは許容範囲（リネーム可能） |

## P50チェック（修正規模）

| バグ          | 変更行数              | 評価      |
| ------------- | --------------------- | --------- |
| Bug 1（削除） | 約35行削除（追加0行） | P50以内 ✓ |
| Bug 2（修正） | 約3行変更             | P50以内 ✓ |

## タスク分類

- **タスク種別**: Bug Fix（非UIタスク）
- **影響層**: Electron Main プロセス（IPC登録層、サービス層）
- **テスト種別**: ユニットテスト + 統合テスト

## 関連仕様書（aiworkflow-requirements参照）

- `docs/00-requirements/08-api-design.md §8.13`: IPC 4層整合性チェック
- `security-electron-ipc.md`: Electron IPC セキュリティ要件
- `18-skills.md §3.2.2.1`: スキル名自動変換規則
