---
task_id: UT-FIX-SKILL-REMOVE-INTERFACE-001
task_name: "skill:remove IPCハンドラ・Preloadインターフェース不整合修正"
category: バグ修正
target_feature: スキル削除機能
priority: 高
scale: 小規模
status: 未実施
source_phase: 多角的検証（UT-FIX-SKILL-IMPORT-INTERFACE-001の水平思考で発見）
created_date: 2026-02-20
dependencies: []
issue_number: null
---

# skill:remove IPCハンドラ・Preloadインターフェース不整合修正 - タスク指示書

## メタ情報

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-REMOVE-INTERFACE-001                                |
| タスク名     | skill:remove IPCハンドラ・Preloadインターフェース不整合修正      |
| 分類         | バグ修正                                                         |
| 対象機能     | スキル削除機能                                                   |
| 優先度       | 高                                                               |
| 見積もり規模 | 小規模（1-2時間）                                                |
| ステータス   | 未着手                                                           |
| 発見元       | UT-FIX-SKILL-IMPORT-INTERFACE-001 の多角的検証（水平思考で検出） |
| 発見日       | 2026-02-20                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-IMPORT-INTERFACE-001（skill:import不整合）の調査中に、水平思考（他のskill:\*ハンドラの横断検索）により `skill:remove` にも全く同一のインターフェース不整合パターンが発見された。

Main Process側のIPCハンドラ（`skillHandlers.ts`）が `{ skillId: string }` 形式のオブジェクト引数を期待しているのに対し、Preload側（`skill-api.ts`）は単一の文字列 `skillName` をそのまま渡している。

### 1.2 問題点・課題

**根本原因**: skill:importと同一のP23パターン（API二重定義の型管理複雑性）。

| レイヤー                   | ファイル               | 期待する引数          | 実際の引数            |
| -------------------------- | ---------------------- | --------------------- | --------------------- |
| Main Process（ハンドラー） | `skillHandlers.ts`     | `{ skillId: string }` | -                     |
| Preload（呼び出し元）      | `skill-api.ts:264-265` | -                     | `string`（skillName） |

**エラー発生メカニズム**:

```
Renderer:  skill.remove("my-skill")
  ↓
Preload:   safeInvoke("skill:remove", "my-skill")   ← 文字列を渡す
  ↓
Main:      args = "my-skill"                          ← argsが文字列
           args?.skillId → undefined
           → バリデーション失敗（または予期しない動作）
```

### 1.3 放置した場合の影響

- スキル削除機能が正常に動作しない可能性
- skill:importの修正のみ行った場合、同一パターンが残存し続ける
- P23パターンの横展開修正漏れとして技術的負債が蓄積する

---

## 2. 何を達成するか（What）

### 2.1 目的

`skill:remove` IPCチャンネルのMain Process側ハンドラとPreload側呼び出し元のインターフェースを統一する。

### 2.2 最終ゴール

- `skill:remove` 呼び出し時にバリデーションエラーが発生しない
- スキル削除機能が正常に動作する
- 関連テストが全件PASS

### 2.3 スコープ

#### 含むもの

- `skillHandlers.ts` の skill:remove ハンドラ引数修正（アプローチAの場合）
- `skill-api.ts` のPreload API修正（アプローチBの場合）
- 関連テストの修正
- `preload/types.ts` の型定義修正（P32準拠）

#### 含まないもの

- skill:import の修正（別タスク UT-FIX-SKILL-IMPORT-INTERFACE-001）
- 他のIPCチャンネルの修正
- 新規機能の追加

### 2.4 成果物

| 成果物                | 説明                                        |
| --------------------- | ------------------------------------------- |
| skillHandlers.ts 修正 | skill:remove ハンドラのインターフェース統一 |
| skill-api.ts 修正     | 必要に応じてPreload API修正                 |
| テスト修正            | テストの期待引数を修正後の仕様に合わせる    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-SKILL-IMPORT-INTERFACE-001 と同時修正を推奨（同一パターンのため）
- P23/P42パターンの理解

### 3.2 依存タスク

| タスクID                          | タスク名                | ステータス | 関係         |
| --------------------------------- | ----------------------- | ---------- | ------------ |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | skill:import 不整合修正 | 未着手     | 同時修正推奨 |

### 3.3 推奨アプローチ

UT-FIX-SKILL-IMPORT-INTERFACE-001 と同一方針で修正すること。skill:import でアプローチA（ハンドラ修正）を選択した場合は本タスクもアプローチAに統一し、アプローチB（Preload修正）を選択した場合は本タスクもアプローチBに統一する。

**アプローチ A（ハンドラ修正）の場合**:

```typescript
// 修正前
async (event, args: { skillId: string }) => { ... }

// 修正後
async (event, skillName: string) => {
  if (typeof skillName !== "string" || skillName.trim() === "") {
    throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" };
  }
  return skillService.removeSkill(skillName);
}
```

**アプローチ B（Preload修正）の場合**:

```typescript
// 修正前
remove: (skillName: string): Promise<void> =>
  safeInvoke(IPC_CHANNELS.SKILL_REMOVE, skillName),

// 修正後
remove: (skillName: string): Promise<void> =>
  safeInvoke(IPC_CHANNELS.SKILL_REMOVE, { skillId: skillName }),
```

### 3.4 システム仕様書参照（aiworkflow-requirements）

| 仕様書                                  | 該当セクション              | 参照目的                    |
| --------------------------------------- | --------------------------- | --------------------------- |
| interfaces-agent-sdk-skill.md           | IPCチャンネル（スキル管理） | skill:remove 契約定義       |
| security-electron-ipc.md                | セキュリティ検証パターン    | 4層防御パターンの適用       |
| architecture-implementation-patterns.md | S1: API二重定義の型管理     | P23パターンの解決ガイダンス |

---

## 4. 実行手順

### Step 1: UT-FIX-SKILL-IMPORT-INTERFACE-001 の方針確認

1. skill:import でどちらのアプローチが採用されたか確認
2. 同一アプローチで skill:remove も修正

### Step 2: ハンドラ/Preload修正

1. 選択したアプローチに従い修正
2. P42準拠の3段バリデーション適用

### Step 3: テスト・検証

1. 関連テスト実行
2. `pnpm --filter @repo/desktop dev` で動作確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skill:remove` 呼び出し時にバリデーションエラーが発生しない
- [ ] スキル削除機能が正常動作する

### 品質要件

- [ ] P42準拠の3段バリデーション適用
- [ ] 関連テスト全件PASS
- [ ] `pnpm typecheck` が通る

### 型定義要件

- [ ] `preload/types.ts` の型定義が修正後のインターフェースと一致（P32準拠）

### ドキュメント要件

- [ ] `interfaces-agent-sdk-skill.md` の skill:remove IPC契約が正しく記載

---

## 6. 検証方法

### テストコマンド

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api
pnpm --filter @repo/desktop test
```

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                       |
| -------------------------------------- | ------ | -------- | ------------------------------------------ |
| skill:importと異なるアプローチ         | 中     | 低       | 必ずskill:importと同一アプローチで統一する |
| skillService.removeSkill()の引数不整合 | 中     | 中       | 内部実装を確認し、引数形式を合わせる       |

---

## 8. 参照情報

### 関連タスク

| タスクID                          | 関係     | 説明                                           |
| --------------------------------- | -------- | ---------------------------------------------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | 同時修正 | skill:import の同一パターン不整合              |
| TASK-9A-B                         | 参照     | skillFile\* ハンドラのオブジェクト引数パターン |

### 既知の落とし穴参照

| Pitfall ID | タイトル                                | 関連度       |
| ---------- | --------------------------------------- | ------------ |
| P23        | API二重定義の型管理複雑性               | 直接関連     |
| P32        | 型定義の二箇所同時更新必須              | 直接関連     |
| P42        | 文字列引数の .trim() バリデーション漏れ | 適用必須     |
| P44        | skill:import IPCインターフェース不整合  | 同一パターン |

---

## 9. 備考

### 発見の経緯

UT-FIX-SKILL-IMPORT-INTERFACE-001 の多角的検証（20思考フレームワーク）において、水平思考（他のskill:*ハンドラとの横断比較）により発見。全skill:*ハンドラのMain側期待引数とPreload側送信引数を比較した結果、skill:importとskill:removeの2チャンネルで同一の不整合パターンが検出された。

### セット対応の推奨

skill:import と skill:remove は同一のP23パターン再発であるため、セット（同一PR）で修正することを強く推奨する。別々に修正すると、修正方針の不一致リスクがある。
