---
task_id: UT-FIX-SKILL-IMPORT-INTERFACE-001
task_name: "skill:import IPCハンドラ・Preloadインターフェース不整合修正"
category: バグ修正
target_feature: スキルインポート機能
priority: 高
scale: 小規模
status: 未実施
source_phase: 開発実行時（ランタイムエラー）
created_date: 2026-02-20
dependencies: []
issue_number: null
---

# skill:import IPCハンドラ・Preloadインターフェース不整合修正 - タスク指示書

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-IMPORT-INTERFACE-001                               |
| タスク名     | skill:import IPCハンドラ・Preloadインターフェース不整合修正     |
| 分類         | バグ修正                                                        |
| 対象機能     | スキルインポート機能                                            |
| 優先度       | 高（毎起動時エラー発生のため）                                  |
| 見積もり規模 | 小規模（2-4時間）                                               |
| ステータス   | 未着手                                                          |
| 発見元       | 開発実行時ランタイムエラー（`pnpm --filter @repo/desktop dev`） |
| 発見日       | 2026-02-20                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`pnpm --filter @repo/desktop dev` でアプリケーションを起動し、スキルインポート操作を実行すると、以下のエラーが**毎回**発生する（2026-02-21実機確認: 5回実行→5回エラー、再現率100%）：

```
Error occurred in handler for 'skill:import': { code: 'VALIDATION_ERROR', message: 'skillIds must be an array' }
```

Main Process側のIPCハンドラ（`skillHandlers.ts`）が `{ skillIds: string[] }` 形式のオブジェクト引数を期待しているのに対し、Preload側（`skill-api.ts`）は単一の文字列 `skillName` をそのまま渡しているため、インターフェース不整合が発生している。

### 1.2 問題点・課題

**根本原因**: IPCハンドラとPreload APIのインターフェース契約が一致していない。

| レイヤー                   | ファイル                   | 期待する引数             | 実際の引数            |
| -------------------------- | -------------------------- | ------------------------ | --------------------- |
| Main Process（ハンドラー） | `skillHandlers.ts:120-138` | `{ skillIds: string[] }` | -                     |
| Preload（呼び出し元）      | `skill-api.ts:261-262`     | -                        | `string`（skillName） |
| Renderer（UI）             | `agentSlice.ts:600-622`    | -                        | `string`（skillName） |

**エラー発生メカニズム**:

```
Renderer:  skill.import("my-skill")
  ↓
Preload:   safeInvoke("skill:import", "my-skill")   ← 文字列を渡す
  ↓
Main:      args = "my-skill"                          ← argsが文字列
           args?.skillIds → undefined                 ← undefinedは配列ではない
           → VALIDATION_ERROR
```

**エラー再現性**（2026-02-21実機確認）: スキルインポート操作を実行するたびに100%再現する。5回実行→5回エラー。

**エラー発生の原因**: IPCハンドラが `{ skillIds: string[] }` 形式のオブジェクト引数を期待しているが、Preload側から `string`（単一スキル名）がそのまま渡されるため、`args?.skillIds` が `undefined` となりバリデーションエラーが発生する。

**同一パターンの未修正箇所**: `skill:remove` ハンドラにも同一のインターフェース不整合が存在する（ハンドラ: `{ skillId: string }` vs Preload: `skillName` string直接渡し）。詳細は関連タスク UT-FIX-SKILL-REMOVE-INTERFACE-001 を参照。

### 1.3 放置した場合の影響

- アプリ起動時に毎回エラーログが出力され、開発体験が悪化する
- スキルインポート機能が正常に動作しない
- 他の開発者がエラーを見て混乱する可能性がある
- P23パターン（API二重定義の型管理複雑性）の未修正事例として残り続ける

---

## 2. 何を達成するか（What）

### 2.1 目的

`skill:import` IPCチャンネルのMain Process側ハンドラとPreload側呼び出し元のインターフェースを統一し、バリデーションエラーを解消する。

### 2.2 最終ゴール

- `pnpm --filter @repo/desktop dev` 起動時に `skill:import` 関連のエラーが0件
- スキルインポート機能が正常に動作する（UIからスキルを選択してインポートできる）
- 関連テストが全件PASS

### 2.3 スコープ

#### 含むもの

- `skillHandlers.ts` のハンドラ引数バリデーション修正（アプローチAの場合）
- `skill-api.ts` のPreload API呼び出し引数修正（アプローチBの場合）
- `agentSlice.ts` の呼び出し元確認（必要に応じて修正）
- 既存テスト（`skill-api.test.ts`）の修正
- `preload/types.ts` の型定義修正（P32準拠）
- `interfaces-agent-sdk-skill.md` の仕様書更新（IPC契約の正確な記載）

#### 含まないもの

- 他のIPCチャンネルの修正
- スキルインポートUIの変更
- 新規機能の追加

### 2.4 成果物

| 成果物                             | 説明                                            |
| ---------------------------------- | ----------------------------------------------- |
| skillHandlers.ts 修正              | ハンドラ引数をPreload側と一致させる             |
| skill-api.ts 修正                  | Preload API呼び出し引数をハンドラ側と一致させる |
| skill-api.test.ts 修正             | テストの期待引数を修正後の仕様に合わせる        |
| interfaces-agent-sdk-skill.md 更新 | IPC契約の正確な記載                             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Electron IPC通信パターンの理解
- safeInvoke パターンの理解
- P23（API二重定義の型管理複雑性）パターンの理解

### 3.2 依存タスク

| タスクID | タスク名 | ステータス |
| -------- | -------- | ---------- |
| なし     | -        | -          |

### 3.3 必要な知識

- Electron `ipcMain.handle()` / `ipcRenderer.invoke()` の引数渡しパターン
- `safeInvoke` ラッパーの引数転送仕様
- `skillService.importSkills()` の引数仕様

### 3.4 アプローチ比較（実装者が判断）

**方針選定**: 多角的検証の結果、両アプローチにそれぞれ正当な根拠がある。実装者は `skillService.importSkills()` の実装を確認した上で最終判断すること。

#### アプローチ A: ハンドラ側をPreload側に合わせる（直接引数パターン）

**根拠**: 現在のUI設計が単一スキルインポートであり、Preload側の `skillName: string` がUI意図と一致。

```typescript
// ❌ 現在のハンドラ（skillHandlers.ts:120-138）
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event, args: { skillIds: string[] }) => {
    if (!Array.isArray(args?.skillIds)) {
      throw { code: "VALIDATION_ERROR", message: "skillIds must be an array" };
    }
    return skillService.importSkills(args.skillIds);
  },
);

// ✅ 修正案（単一スキルインポート）
ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (event, skillName: string) => {
  if (typeof skillName !== "string" || skillName.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    };
  }
  return skillService.importSkills([skillName]);
});
```

| 利点                                                     | 欠点                                        |
| -------------------------------------------------------- | ------------------------------------------- |
| Preload側の変更不要                                      | 一括インポート追加時に新チャンネル必要      |
| `skill:abort`, `skill:get-status` と同じ直接引数パターン | ハンドラ内で `[skillName]` への配列化が必要 |
| 単純で理解しやすい                                       | -                                           |

#### アプローチ B: Preload側をハンドラ側に合わせる（オブジェクト引数パターン）

**根拠**: ハンドラ側の `{ skillIds: string[] }` が `skillService.importSkills()` の引数仕様と一致。新しい `skillFile*` ハンドラ（TASK-9A-B）はすべてオブジェクト形式を採用しており、プロジェクトの設計方向と一致。

```typescript
// ❌ 現在のPreload（skill-api.ts:261-262）
import: (skillName: string): Promise<ImportedSkill> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName),

// ✅ 修正案（オブジェクト形式で渡す）
import: (skillName: string): Promise<ImportedSkill> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPORT, { skillIds: [skillName] }),
```

| 利点                                           | 欠点                                      |
| ---------------------------------------------- | ----------------------------------------- |
| ハンドラ側の変更不要                           | Preload + agentSlice + テストの修正が必要 |
| 新しいskillFile\*ハンドラと一貫性あり          | 単一値の配列化がPreload側の責務になる     |
| 将来の一括インポートに既存チャンネルで対応可能 | 引数ネストが増える                        |

#### 判断基準

| 確認事項                                                 | アプローチAが適切    | アプローチBが適切            |
| -------------------------------------------------------- | -------------------- | ---------------------------- |
| `skillService.importSkills()` が単一文字列も受け取れる   | ✅                   | -                            |
| プロジェクト全体でオブジェクト引数パターンに統一する方針 | -                    | ✅                           |
| `skill:remove` も同時修正する場合の一貫性                | 両方を直接引数に統一 | 両方をオブジェクト引数に統一 |
| 変更箇所を最小化したい                                   | ✅（ハンドラ1箇所）  | -                            |

### 3.5 実装課題と解決策（調査からの学び）

| 課題カテゴリ               | 課題                                                                                                                                                                                                                           | 解決策                                                                                                                                     | 参照パターン                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| **インターフェース不整合** | Main ProcessハンドラとPreload APIの引数形式が一致していない。ハンドラは `{ skillIds: string[] }`（複数一括インポート想定）、Preloadは `string`（単一インポート想定）で設計が乖離                                               | 現在のUI設計（単一インポート）に合わせ、ハンドラ側の引数を `string` に変更。`skillService.importSkills()` への配列変換はハンドラ内部で行う | P23: API二重定義の型管理複雑性               |
| **バリデーション不足**     | 文字列引数に対する `.trim()` チェックがPreload側で欠落しており、スペースのみの入力がバリデーションを通過する可能性がある                                                                                                       | P42パターン準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用                                                         | P42: 文字列引数の .trim() バリデーション漏れ |
| **テスト期待値の乖離**     | `skill-api.test.ts:1042-1046` のテストが文字列引数を直接渡す設計で書かれており、ハンドラの期待する `{ skillIds: [] }` と不整合。テストが「偽グリーン」状態（テスト自体は通るがモックされているため実際の不整合を検出できない） | ハンドラ修正後にテストの期待引数も合わせて修正。統合テストでMain-Preload間の引数一致を検証するテストを追加                                 | P32: 型定義の二箇所同時更新必須              |
| **エラー2回発生**          | 起動時にエラーが2回出力される。React StrictModeの二重実行、またはUIイベントの二重発火が原因の可能性                                                                                                                            | インポート処理のガード（重複呼び出し防止）を確認。既に `isImporting` フラグでガードされているが、初回レンダリング時の挙動を確認する        | P5: リスナー二重登録                         |

**実装のポイント**:

1. **P23パターンの適用**: IPCチャンネルの引数型を変更する場合、以下の3ファイルを同時に更新する必要がある
   - `apps/desktop/src/main/ipc/skillHandlers.ts`（ハンドラ定義）
   - `apps/desktop/src/preload/skill-api.ts`（Preload API）
   - `apps/desktop/src/preload/__tests__/skill-api.test.ts`（テスト）

2. **P42パターンの適用**: 文字列引数バリデーションは3段階で行う

   ```typescript
   if (
     typeof skillName !== "string" ||
     skillName === "" ||
     skillName.trim() === ""
   ) {
     throw {
       code: "VALIDATION_ERROR",
       message: "skillName must be a non-empty string",
     };
   }
   ```

3. **仕様書の同時更新**: `interfaces-agent-sdk-skill.md` のIPCチャンネルテーブルで `skill:import` の Request 列を正しい引数形式に修正する

### 3.6 システム仕様書参照（aiworkflow-requirements）

| 仕様書                                  | 該当セクション                        | 参照目的                                                                   |
| --------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| api-ipc-agent.md                        | スキルファイル操作IPC                 | ハンドラ引数・セキュリティ仕様パターン                                     |
| interfaces-agent-sdk-skill.md           | IPCチャンネル（スキル管理）           | skill:import の契約定義                                                    |
| security-electron-ipc.md                | skillFileAPI セキュリティ検証パターン | 4層防御パターン（Sender検証→引数バリデーション→内部検証→エラーサニタイズ） |
| architecture-implementation-patterns.md | S1: API二重定義の型管理複雑性         | P23パターンの実装ガイダンス                                                |

---

## 4. 実行手順

### Step 1: 現状分析・方針決定

1. `skillHandlers.ts` のハンドラ引数 `{ skillIds: string[] }` を確認
2. `skill-api.ts` の呼び出し引数 `skillName: string` を確認
3. `skillService.importSkills()` の内部実装を確認し、単一文字列受け取りが可能か検証
4. アプローチ A or B を最終決定

### Step 2: Main Process側修正

1. `skillHandlers.ts` のハンドラ引数を修正
2. バリデーションを P42 パターン準拠に変更（3段バリデーション）
3. `skillService.importSkills()` への引数変換を調整

### Step 3: Preload側確認・修正

1. `skill-api.ts` の呼び出しコードを確認（アプローチAの場合は変更不要、アプローチBの場合はオブジェクト形式に変更）
2. `skill-api.test.ts` のテスト期待値を修正後の仕様に合わせる
3. `preload/types.ts` の型定義が修正後のインターフェースと一致するか確認（P32準拠）
4. `packages/shared/src/agent/types.ts` に関連型がある場合、同時更新

### Step 4: 検証

1. `pnpm --filter @repo/desktop test -- skillHandlers` を実行
2. `pnpm --filter @repo/desktop test -- skill-api` を実行
3. `pnpm --filter @repo/desktop dev` で起動し、エラーが出ないことを確認
4. UIからスキルインポートが正常動作することを手動確認

### Step 5: 仕様書更新

1. `interfaces-agent-sdk-skill.md` の skill:import Request 列を修正
2. 関連する型定義ファイルの確認・更新

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `pnpm --filter @repo/desktop dev` 起動時に `skill:import` エラーが0件
- [ ] UIからスキルインポートが正常動作する
- [ ] `skillService.importSkills()` が正しい引数で呼ばれる

### 品質要件

- [ ] P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が適用されている
- [ ] 関連テスト全件PASS
- [ ] 他のIPCハンドラに影響を与えていない
- [ ] `pnpm typecheck` が通る

### 型定義要件

- [ ] `preload/types.ts` の型定義が修正後のインターフェースと一致している（P32準拠）
- [ ] `packages/shared/src/agent/types.ts` に関連型がある場合、同時更新されている

### ドキュメント要件

- [ ] `interfaces-agent-sdk-skill.md` の skill:import IPC契約が正しく記載されている
- [ ] 修正内容が06-known-pitfalls.mdに記録されている（P44）

---

## 6. 検証方法

### テストコマンド

```bash
# スキルハンドラテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers

# Preload APIテスト
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api

# 全テスト（影響確認）
pnpm --filter @repo/desktop test

# 開発サーバー起動でのランタイム確認
pnpm --filter @repo/desktop dev
```

### 期待結果

```
# テスト
✓ skillHandlers.test.ts (XX tests)
✓ skill-api.test.ts (XX tests)

# ランタイム
# "Error occurred in handler for 'skill:import'" が出力されないこと
```

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                                                      |
| -------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------- |
| skillService.importSkills() が配列のみ受け取り可能 | 中     | 中       | ハンドラ内部で `[skillName]` として配列化してから渡す                                     |
| Preload側の型定義（types.ts）との不整合            | 中     | 中       | P32準拠で `preload/types.ts` と `shared/types.ts` を同時更新                              |
| インターフェース修正後も他の箇所で不整合が残る     | 低     | 低       | P23準拠で3箇所同時更新（ハンドラ・Preload・型定義）を確認。修正後にランタイムテストで検証 |
| テストのモック設定が不完全                         | 低     | 低       | 統合テストを追加して実際のIPC通信パスを検証                                               |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                     | パス                                                   |
| -------------------------------- | ------------------------------------------------------ |
| スキルハンドラ実装               | `apps/desktop/src/main/ipc/skillHandlers.ts`           |
| Preload スキルAPI                | `apps/desktop/src/preload/skill-api.ts`                |
| agentSlice（Renderer呼び出し元） | `apps/desktop/src/renderer/store/slices/agentSlice.ts` |
| Preload APIテスト                | `apps/desktop/src/preload/__tests__/skill-api.test.ts` |
| IPCチャンネル定義                | `apps/desktop/src/preload/channels.ts`                 |

### システム仕様書参照（aiworkflow-requirements）

| 仕様書                                  | 該当セクション              | 参照目的                       |
| --------------------------------------- | --------------------------- | ------------------------------ |
| api-ipc-agent.md                        | スキルファイル操作IPC       | ハンドラ引数形式のパターン参照 |
| interfaces-agent-sdk-skill.md           | IPCチャンネル（スキル管理） | skill:import 契約定義の更新先  |
| security-electron-ipc.md                | セキュリティ検証パターン    | 4層防御パターンの適用          |
| architecture-implementation-patterns.md | S1: API二重定義の型管理     | P23パターンの解決ガイダンス    |

### 関連タスク

| タスクID                          | 関係     | 説明                                                        |
| --------------------------------- | -------- | ----------------------------------------------------------- |
| TASK-9A-B                         | 関連     | SkillFileManager IPC実装（同様の4層防御パターンを適用）     |
| TASK-FIX-5-1                      | 参照     | SkillAPI二重定義統一（P23パターンの先例）                   |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 同時修正 | skill:remove の同一インターフェース不整合（セット対応推奨） |

### 既知の落とし穴参照

| Pitfall ID | タイトル                                                 | 関連度                 |
| ---------- | -------------------------------------------------------- | ---------------------- |
| P23        | API二重定義の型管理複雑性                                | 直接関連（同パターン） |
| P32        | 型定義の二箇所同時更新必須                               | 直接関連               |
| P42        | 文字列引数の .trim() バリデーション漏れ                  | 適用必須               |
| P44        | skill:import IPCインターフェース不整合（本タスクで追加） | 本タスクそのもの       |

---

## 9. 備考

### 発見時の状況

`pnpm --filter @repo/desktop dev` でアプリケーションを起動し、スキルインポート操作を実行した際、コンソールに以下のエラーが出力された（2026-02-21実機確認: 5回実行→5回エラー、再現率100%）：

```
[AuthFlowOrchestrator] Session established successfully
Error occurred in handler for 'skill:import': { code: 'VALIDATION_ERROR', message: 'skillIds must be an array' }
```

スキルインポート操作を実行するたびに確実に発生する。原因はIPCハンドラとPreload APIのインターフェース不整合であり、ハンドラ側の引数形式を `string` に統一することで解消する。

### 設計上の考察

現在のハンドラは `{ skillIds: string[] }` として複数スキルの一括インポートを想定した設計だが、UI側は単一スキルのインポートしかサポートしていない。将来的に一括インポート機能を追加する場合は、別途IPCチャンネル（例: `skill:import-batch`）を新設することを推奨する。単一操作と一括操作を同一チャンネルで処理すると、バリデーションの複雑性が増す。

### P23パターンからの教訓

本問題は P23（API二重定義の型管理複雑性）の典型的な再発事例。IPCチャンネルの引数仕様を変更する際は、以下の3箇所を同時に更新する必要がある：

1. Main Process ハンドラ（`skillHandlers.ts`）
2. Preload API（`skill-api.ts`）
3. Preload 型定義（`types.ts` / `types.d.ts`）

片方だけ更新すると、コンパイルは通るがランタイムでバリデーションエラーが発生する。

### 多角的検証の結果（2026-02-20実施）

20の思考フレームワーク（水平・逆説・システム・垂直・類推・if・素人・トレードオン・プラスサム・2軸・価値提案・why・改善・戦略的・ダブルループ・抽象化・プロセス・仮説・論点・因果関係ループ）で検証した結果、以下の重要な発見があった：

1. **逆説思考**: ハンドラ側が「正しい設計」（`skillService.importSkills()` が `string[]` を期待）である可能性 → 推奨アプローチを二択から実装者判断に変更
2. **水平思考**: `skill:remove` にも同一のインターフェース不整合を発見 → 別途未タスク化（UT-FIX-SKILL-REMOVE-INTERFACE-001）
3. **2軸思考**: 毎起動時エラーのため優先度を「中」から「高」に変更
4. **抽象化思考**: IPC引数形式が「直接単一引数」「直接複数引数」「オブジェクト引数」の3パターン混在 → 標準化が今後の課題
5. **改善思考**: IPC型スキーマ一元管理（Zodスキーマ等）による根本解決の可能性

これらの発見は、単一バグ修正にとどまらず、IPC設計の体系的改善につながる知見である。
