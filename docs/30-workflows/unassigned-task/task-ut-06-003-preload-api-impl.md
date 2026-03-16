# SafetyGate Preload API 実装 - タスク指示書

## メタ情報

```yaml
issue_number: 1290
```

## メタ情報

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | UT-06-003-PRELOAD-API-IMPL                                            |
| タスク名     | SafetyGate Preload API 実装（evaluateSafety safeInvoke チェーン完成） |
| 分類         | 実装                                                                  |
| 対象機能     | SafetyGate IPC / Preload                                              |
| 優先度       | 高                                                                    |
| 見積もり規模 | 小規模                                                                |
| ステータス   | 未実施                                                                |
| 発見元       | UT-06-003 Phase 12 未タスク検出                                       |
| 発見日       | 2026-03-17                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-06-003 において、SafetyGate の IPC ハンドラ（`skill:evaluate-safety`）を Main Process 側に実装した。チャンネル名は `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` として定数化され、`ALLOWED_INVOKE_CHANNELS` ホワイトリストへの追加も完了している。

しかし、Preload 層（`apps/desktop/src/preload/skill-api.ts` または `apps/desktop/src/preload/index.ts`）への `evaluateSafety` メソッドの追加が未実施のまま残された。Renderer → Main の IPC 通信チェーンが完成していない状態である。

### 1.2 問題点・課題

1. **Renderer から `evaluateSafety` を呼び出せない**: `window.electronAPI.skill.evaluateSafety(skillName)` を Renderer から呼び出しても、Preload Bridge にメソッドが存在しないため到達不能
2. **Preload 層の型定義が未追加**: `apps/desktop/src/preload/types.ts` に `SafetyGateResult` 関連の型が未定義であり、型安全なインターフェースが確立されていない
3. **IPC チャンネルは登録済みだが到達不能**: Main 側ハンドラは正常に登録されているが、Preload Bridge が欠落しているため Renderer からのリクエストが Main に届かない構造になっている
4. **E2E 通信チェーンの断絶**: SafetyGate 機能の Renderer → Preload → Main の全層通信が未完成であり、機能として使用不能な状態

### 1.3 放置した場合の影響

- SafetyGate 機能が Renderer から実際に使用できないため、UT-06-003 の実装が形骸化する
- UT-06-005 で実装した abort/skip フォールバックフローが SafetyGate 評価結果に依存している場合、エンドツーエンドの動作検証ができない
- IPC チャンネルが Main 側で登録されているにもかかわらず到達不能という「片道 IPC」の状態が継続し、デバッグが困難になる

---

## 2. 何を達成するか（What）

### 2.1 目的

Preload 層に `evaluateSafety` メソッドを追加し、Renderer → Preload → Main の SafetyGate IPC 通信チェーンを完成させる。

### 2.2 最終ゴール

- Renderer から `window.electronAPI.skill.evaluateSafety(skillName)` を呼び出して SafetyGate 評価結果を取得できる
- Preload 層の型定義に `SafetyGateResult` 関連型が追加されている
- `safeInvoke` による型安全な呼び出しが確立されている
- 関連するすべてのテストが PASS している

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/preload/skill-api.ts`（または `apps/desktop/src/preload/index.ts`）への `evaluateSafety` メソッド追加
- `apps/desktop/src/preload/types.ts` への SafetyGate 関連型定義追加
- Preload 層のテストファイル更新・追加
- 通信チェーン（Renderer → Preload → Main）の動作確認

#### 含まないもの

- Main Process 側ハンドラ本体の変更（UT-06-003 で実装済み）
- SafetyGate の評価ロジック変更
- Renderer 側 UI の実装（SafetyGate 評価結果を使用する UI は別タスク）

### 2.4 成果物

- `apps/desktop/src/preload/skill-api.ts`（または `apps/desktop/src/preload/index.ts`）に `evaluateSafety` メソッド追加
- `apps/desktop/src/preload/types.ts` に SafetyGate 関連型定義追加
- Preload 層のテストファイル（`evaluateSafety` の safeInvoke 呼び出しテスト）

---

## 3. どう実装するか（How）

### 3.1 実装方針

#### Step 1: 既存実装状況の調査

```bash
# Main 側ハンドラの引数・戻り値形式を確認
grep -rn "skill:evaluate-safety\|SKILL_EVALUATE_SAFETY" \
  apps/desktop/src/main/ipc/
grep -rn "evaluateSafety" apps/desktop/src/preload/
grep -rn "SafetyGate" packages/shared/src/types/
```

#### Step 2: 戻り値形式の確認（最重要）

Main 側ハンドラ（`registerSafetyGateHandlers`）が返す形式を先に確認する。以下のいずれかの形式に対応する:

- **パターン A（ラップ形式）**: `{ success: boolean, data?: SafetyGateResult, error?: { code: string, message: string } }`
- **パターン B（フラット形式）**: `SafetyGateResult` を直接返す

Preload 層の `evaluateSafety` は Main 側の戻り値形式に準拠して実装する。

#### Step 3: Preload メソッドの実装

```typescript
// apps/desktop/src/preload/skill-api.ts に追加する実装例（パターン A の場合）
evaluateSafety: (skillName: string) =>
  safeInvoke<SafetyGateResult>(
    IPC_CHANNELS.SKILL_EVALUATE_SAFETY,
    skillName
  ),
```

#### Step 4: Preload 型定義の追加

`packages/shared/src/types/safety-gate.ts` に定義された型を再利用し、`apps/desktop/src/preload/types.ts` での重複定義を避ける。

```bash
# 共有型の確認
cat packages/shared/src/types/safety-gate.ts
```

### 3.2 苦戦箇所・注意点（前回の教訓）

- **P23（API 二重定義の型管理）**: `apps/desktop/src/preload/types.ts` への型追加時は `packages/shared/src/types/safety-gate.ts` の型を再利用すること。Preload 層で SafetyGate 型を独自定義すると二重定義になり、将来の変更コストが増大する

- **P27（ハードコード文字列の見落とし）**: `safeInvoke` の第1引数は必ず `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` 定数を使用すること。文字列リテラル `"skill:evaluate-safety"` で実装しない。実装後に `grep -rn "safeInvoke" apps/desktop/src/preload/ | grep -v "IPC_CHANNELS"` で文字列リテラル残存を確認する

- **P60（IPC テスト応答形式不一致）**: Main 側ハンドラの戻り値形式を先に確認してから Preload を実装すること。ラップ形式（`{ success, data, error }`）とフラット形式（直接 `SafetyGateResult`）を混同すると、Renderer 側で `.data.result` か `.result` か判断できず、実行時エラーが発生する

- **P61（DIP 違反）**: Preload 層の型定義は `SafetyGatePort`（インターフェース）ベースにすること。`DefaultSafetyGate`（具象クラス）の型を Preload 層に持ち込むと、Preload と Main の実装が密結合になり、将来の差し替えが困難になる

- **P5（リスナー二重登録）**: Preload 層への追加実装時に、`ipcMain.handle()` の二重登録が発生していないか Main 側の登録コードを確認すること

- **P42（.trim() バリデーション漏れ）**: `skillName` を受け取る場合、Preload 層では基本的に Main 側にそのまま渡すが、型チェック（`typeof skillName === "string"`）は Preload 層でも実施することが望ましい

### 3.3 テスト方針

- **Preload 層の単体テスト**: `safeInvoke` が `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` チャンネルで呼び出されることをモックで検証
- **戻り値の型テスト**: `evaluateSafety` の戻り値が `SafetyGateResult`（またはラップ形式）として正しく型付けされていることを検証
- **引数検証テスト**: `skillName` が正しく safeInvoke に渡されることを検証

---

## 4. 関連情報

### 4.1 関連タスク

| タスクID    | 関係性                                                                |
| ----------- | --------------------------------------------------------------------- |
| UT-06-003   | 依存元（Main Process 側 SafetyGate IPC ハンドラ実装。本タスクの前提） |
| UT-06-005   | 関連（abort/skip フォールバックフロー。SafetyGate 評価結果を使用）    |
| UT-06-005-C | 関連（SkillStreamMessageType 拡張。同一 SafetyGate 機能群）           |

### 4.2 関連仕様書

| 参照資料                      | パス                                                                                        | 内容                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| SafetyGate IPC チャンネル仕様 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                   | skill:evaluate-safety チャンネル仕様  |
| SafetyGate セキュリティ要件   | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | SafetyGate セキュリティ設計           |
| IPC 契約チェックリスト        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC 修正時の Phase 1-6 チェックリスト |

### 4.3 関連 Pitfall

| Pitfall ID | 内容                                              |
| ---------- | ------------------------------------------------- |
| P23        | API 二重定義の型管理複雑性                        |
| P27        | Preload ハードコード文字列の見落とし              |
| P42        | 文字列引数の .trim() バリデーション漏れ           |
| P5         | リスナー二重登録（Main/Renderer 両プロセス）      |
| P61        | DIP 違反（具象クラスを Preload 層に持ち込まない） |
