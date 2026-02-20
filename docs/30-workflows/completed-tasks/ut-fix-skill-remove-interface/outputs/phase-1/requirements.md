# Phase 1 要件定義書 — UT-FIX-SKILL-REMOVE-INTERFACE-001

## 検証日時

2026-02-20

## 問題の根本原因分析

### 不整合の所在

| レイヤー     | ファイル                                           | 期待する引数          | 実際の引数            |
| ------------ | -------------------------------------------------- | --------------------- | --------------------- |
| Main Process | `apps/desktop/src/main/ipc/skillHandlers.ts` 行143 | `{ skillId: string }` | —                     |
| Preload      | `apps/desktop/src/preload/skill-api.ts` 行264-265  | —                     | `string`（skillName） |

### エラー発生メカニズム

```
Renderer: window.electronAPI.skill.remove("my-skill")
  ↓
Preload: safeInvoke(IPC_CHANNELS.SKILL_REMOVE, "my-skill") ← 文字列を渡す
  ↓
Main: handler(event, args)
      args = "my-skill"  ← argsが文字列
      typeof args?.skillId !== "string"  ← args.skillId = undefined
      → VALIDATION_ERROR: "skillId must be a string"
```

### 根本原因

P23パターン（API二重定義の型管理複雑性）の再発。ハンドラ実装時にオブジェクト形式 `{ skillId }` で設計したが、Preload側の `skill-api.ts` が文字列を直接渡す設計になっており、インターフェース契約が乖離。

## 影響範囲

### 直接影響（変更必要: 2件）

| ファイル                                                    | 変更内容                     |
| ----------------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                | ハンドラ引数シグネチャ修正   |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | テスト引数形式修正・新規追加 |

### 影響なし（変更不要: 4件）

| ファイル                                               | 確認結果                                                |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts`                | 既に文字列を渡しており正しい                            |
| `apps/desktop/src/preload/__tests__/skill-api.test.ts` | 既に文字列を期待しており正しい                          |
| `packages/shared/src/agent/types.ts`                   | skill:remove関連型定義なし                              |
| `apps/desktop/src/preload/types.ts`                    | `remove: (skillName: string) => Promise<void>` で正しい |

## 受入基準

### 機能要件

| ID   | 受入基準                                               | 検証方法                                     |
| ---- | ------------------------------------------------------ | -------------------------------------------- |
| FR-1 | 文字列引数でバリデーションエラーが発生しない           | テスト SH-RM-01 PASS                         |
| FR-2 | skillService.removeSkill に正しいスキル名が渡される    | テスト SH-RM-01 で toHaveBeenCalledWith 検証 |
| FR-3 | 存在しないスキル名での呼び出しが graceful に処理される | テスト SH-RM-04 PASS                         |

### 品質要件

| ID   | 受入基準                                                 | 検証方法                         |
| ---- | -------------------------------------------------------- | -------------------------------- |
| QR-1 | P42準拠の3段バリデーション                               | テスト SH-RM-02, 03, 05, 06 PASS |
| QR-2 | validateIpcSender によるセキュリティ検証維持             | テスト SH-RM-07, 08 PASS         |
| QR-3 | カバレッジ基準: Line ≥ 80%, Branch ≥ 60%, Function ≥ 80% | Phase 7 カバレッジレポート       |
| QR-4 | pnpm typecheck が通る                                    | Phase 9 品質検証                 |
| QR-5 | skill:remove 以外の全テストにリグレッションなし          | Phase 9 全テスト実行             |

### 非スコープ

- skill:import の修正（別タスク UT-FIX-SKILL-IMPORT-INTERFACE-001）
- 他の skill:\* ハンドラの修正
- Preload側の変更（既に正しい実装）
- 新規機能の追加

## 完了条件チェック

- [x] 不整合の所在が特定されている
- [x] エラー発生メカニズムが記述されている
- [x] 根本原因が P23 パターンとして特定されている
- [x] 影響範囲が列挙されている
- [x] 機能要件（FR-1〜FR-3）が定義されている
- [x] 品質要件（QR-1〜QR-5）が定義されている
- [x] 非スコープが明示されている
