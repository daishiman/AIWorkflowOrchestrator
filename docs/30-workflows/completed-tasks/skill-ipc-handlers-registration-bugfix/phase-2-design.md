# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| Phase名    | 設計                                   |
| 前提Phase  | Phase 1                                |
| 後続Phase  | Phase 3                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-17                             |
| 機能名     | skill-ipc-handlers-registration-bugfix |

---

## 目的

Phase 1で特定された根本原因に対する修正設計を行う。
preloadのskillAPIとmainプロセスのIPCハンドラー間の引数形式を統一する設計を確立する。

## 背景

Phase 1の分析により、preloadで配列を直接渡しているがハンドラー側はオブジェクト形式
`{ skillIds: string[] }` を期待している不一致が原因と特定された。
この不一致を解消するための修正設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現状のコード構造分析

**目的**: 修正対象のコード構造を詳細に理解する

**実行手順**:

1. `apps/desktop/src/renderer/preload/index.ts` の全skillAPIメソッドを分析
2. `apps/desktop/src/main/ipc/skillHandlers.ts` の全ハンドラーを分析
3. 引数形式の不一致箇所を一覧化
4. 影響範囲を特定

**分析対象メソッド**:

| メソッド        | preload側（現状）  | ハンドラー側（期待）          | 修正必要 |
| --------------- | ------------------ | ----------------------------- | -------- |
| `import`        | `skillIds` (配列)  | `{ skillIds }` (オブジェクト) | Yes      |
| `remove`        | `skillId` (文字列) | `{ skillId }` (オブジェクト)  | Yes      |
| `getDetail`     | `skillId` (文字列) | `{ skillId }` (オブジェクト)  | Yes      |
| `listAvailable` | -                  | -                             | 要確認   |
| `listImported`  | -                  | -                             | 要確認   |

**期待される成果物**:

- `outputs/phase-2/code-structure-analysis.md`: コード構造分析レポート

---

### タスク2: 修正設計書の作成

**目的**: 具体的な修正内容を設計する

**実行手順**:

1. 修正方針を決定（preload側をオブジェクト形式に変更）
2. 各メソッドの修正内容を詳細に記述
3. 型定義の整合性を確認
4. 後方互換性の影響を評価

**修正設計**:

```typescript
// Before: apps/desktop/src/renderer/preload/index.ts
import: async (skillIds: string[]) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:import",
    skillIds,  // ← 配列を直接渡している
  );
}

// After: apps/desktop/src/renderer/preload/index.ts
import: async (skillIds: string[]) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:import",
    { skillIds },  // ← オブジェクトとして渡す
  );
}
```

**期待される成果物**:

- `outputs/phase-2/fix-design.md`: 修正設計書

---

### タスク3: IPCハンドラー登録確認設計

**目的**: IPCハンドラー登録が正しく行われているか確認する設計

**実行手順**:

1. `apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers` を確認
2. `registerSkillHandlers` の呼び出しが存在するか確認
3. 必要に応じてログ出力の追加設計
4. 確認手順を文書化

**確認ポイント**:

| 確認項目                           | 確認方法                              |
| ---------------------------------- | ------------------------------------- |
| `registerSkillHandlers` のimport   | import文の存在確認                    |
| `registerSkillHandlers` の呼び出し | 関数呼び出しの存在確認                |
| 引数の正しさ                       | `mainWindow`, `skillService` の渡し方 |

**期待される成果物**:

- `outputs/phase-2/ipc-registration-check.md`: IPC登録確認設計書

---

### タスク4: テスト戦略設計

**目的**: バグ修正を検証するテスト戦略を設計する

**実行手順**:

1. ユニットテストの対象を特定
2. 統合テストのシナリオを設計
3. 手動テストの項目を設計
4. テスト優先順位を決定

**テスト対象**:

| テスト種別     | 対象             | 目的               |
| -------------- | ---------------- | ------------------ |
| ユニットテスト | preload/index.ts | 引数形式の正しさ   |
| ユニットテスト | skillHandlers.ts | ハンドラーの動作   |
| 統合テスト     | IPC通信全体      | preload⇔mainの連携 |
| 手動テスト     | Agent画面        | UIの正常動作       |

**期待される成果物**:

- `outputs/phase-2/test-strategy.md`: テスト戦略設計書

---

## 参照資料

| 参照資料               | パス                                                                           | 内容                      |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| Phase 1成果物          | `outputs/phase-1/`                                                             | 原因分析・受け入れ基準    |
| IPC Handler Pattern    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | IPCハンドラー登録パターン |
| セキュリティ実装ガイド | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | IPC sender検証要件        |

---

## 成果物

| 成果物            | パス                                         | 内容               |
| ----------------- | -------------------------------------------- | ------------------ |
| コード構造分析    | `outputs/phase-2/code-structure-analysis.md` | 修正対象の詳細分析 |
| 修正設計書        | `outputs/phase-2/fix-design.md`              | 具体的な修正内容   |
| IPC登録確認設計書 | `outputs/phase-2/ipc-registration-check.md`  | ハンドラー登録確認 |
| テスト戦略設計書  | `outputs/phase-2/test-strategy.md`           | テスト計画         |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 2の統合テスト連携アクション**:

- preload/mainプロセス間の引数形式を設計に反映
- IPC通信の契約（引数・戻り値の型）を明確化
- エラーハンドリングの設計を含める

---

## 完了条件

- [ ] 全修正対象メソッドの現状分析が完了している
- [ ] 各メソッドの修正内容が詳細に設計されている
- [ ] IPCハンドラー登録の確認方法が設計されている
- [ ] テスト戦略が設計されている
- [ ] 全成果物が `outputs/phase-2/` に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-ipc-handlers-registration-bugfix/phase-3-design-review.md`
