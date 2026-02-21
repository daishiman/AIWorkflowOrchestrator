# skill:import IPCハンドラ戻り値型不整合修正 - タスク指示書

## メタ情報

```yaml
issue_number: 857
```

## メタ情報

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名     | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| 分類         | バグ修正                                                                     |
| 対象機能     | スキルインポート機能                                                         |
| 優先度       | 高（引数修正だけでは機能が正常動作しないため）                               |
| 見積もり規模 | 小規模（2-3時間）                                                            |
| ステータス   | 未実施                                                                       |
| 発見元       | 20フレームワーク多角的分析（仮説思考・抽象化思考・垂直思考）（2026-02-21）   |
| 発見日       | 2026-02-21                                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill:import` IPCチャンネルには、引数形式の不整合（UT-FIX-SKILL-IMPORT-INTERFACE-001で対応予定）とは別に、**戻り値型の不整合**が存在する。

Main Process側の `skillHandlers.ts` は `skillService.importSkills()` を呼び出し、`ImportResult` 型（バッチ操作の結果サマリー）を返す。しかし、Preload側の `skill-api.ts` は `Promise<ImportedSkill>` を戻り値として宣言しており、Renderer側の `agentSlice.ts` はその結果を `ImportedSkill` オブジェクトとして `importedSkills` 配列に直接追加する。

この型不整合により、引数形式を修正（UT-FIX-SKILL-IMPORT-INTERFACE-001）しても、Rendererが受け取るデータ構造が `ImportedSkill` と一致せず、スキル管理機能が正常に動作しない。

**再現性**: スキルインポート操作を実行するたびに100%再現する（2026-02-21実機確認: 5回実行→5回エラー）。現在は引数形式の不整合（INTERFACE-001）によりバリデーションエラーで先に止まるため、戻り値の問題はINTERFACE-001修正後に顕在化する。

### 1.2 問題点・課題

**根本原因**: IPCハンドラの戻り値型とPreload/Rendererの期待する型が不一致。

| レイヤー                   | ファイル                       | 戻り値型                                       | 実際のデータ構造                                                |
| -------------------------- | ------------------------------ | ---------------------------------------------- | --------------------------------------------------------------- |
| Main Process（ハンドラ）   | `skillHandlers.ts:136`         | `ImportResult`                                 | `{ success: boolean, importedCount: number, errors: string[] }` |
| Main Process（サービス）   | `SkillService.ts:103-105`      | `Promise<ImportResult>`                        | 同上                                                            |
| Main Process（マネージャ） | `SkillImportManager.ts:92-120` | `Promise<ImportResult>`                        | 同上                                                            |
| Preload（型宣言）          | `skill-api.ts:105`             | `Promise<ImportedSkill>`                       | -（宣言のみ）                                                   |
| Preload（実装）            | `skill-api.ts:261-262`         | `Promise<ImportedSkill>`（safeInvokeの戻り値） | 実際は `ImportResult` が返る                                    |
| Renderer（消費先）         | `agentSlice.ts:606-608`        | `ImportedSkill`（配列に追加）                  | 実際は `ImportResult` が格納される                              |

**型定義の差異**:

```typescript
// ImportResult（ハンドラが返す型） - packages/shared/src/types/skill.ts:165-172
interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}

// ImportedSkill（Rendererが期待する型） - packages/shared/src/types/skill.ts:284-295
interface ImportedSkill extends SkillMetadata {
  importedAt: Date;
  status: "active" | "disabled";
  content?: string;
}
```

**データフローの不整合**:

```
Handler:    skillService.importSkills([skillName])
              ↓ returns ImportResult { success: true, importedCount: 1, errors: [] }
Preload:    safeInvoke() returns the ImportResult as-is
              ↓ but declared as Promise<ImportedSkill>
Renderer:   const imported = await window.electronAPI.skill.import(skillName);
            set({ importedSkills: [...state.importedSkills, imported] });
              ↓ ImportResult is stored where ImportedSkill is expected
              ↓ imported.name → undefined, imported.importedAt → undefined
```

### 1.3 放置した場合の影響

- **UT-FIX-SKILL-IMPORT-INTERFACE-001だけでは不十分**: 引数形式を修正してもバリデーションエラーは解消するが、Rendererが受け取るデータ構造が間違っているため、スキル一覧表示が壊れる
- **RendererのimportedSkills配列に不正なオブジェクト混入**: `ImportResult` が `ImportedSkill` として格納されるため、`skill.name`、`skill.importedAt` 等のプロパティが `undefined` となり、UIコンポーネントでランタイムエラーが発生する
- **TypeScriptの型安全が実質無効化**: Preload層の `safeInvoke` は `Promise<any>` を返すため、Preloadの型宣言（`Promise<ImportedSkill>`）はコンパイル時にのみ機能し、ランタイムの型不整合を検出できない
- **P44パターンの不完全修正**: P44（skill:import/remove IPCインターフェース不整合）の「✅解決済み」ステータスが不正確であることを示す追加証拠となる

---

## 2. 何を達成するか（What）

### 2.1 目的

`skill:import` IPCハンドラの戻り値を `ImportResult`（バッチ結果）から `ImportedSkill`（個別スキル情報）に変換し、Preload/Renderer側の期待する型と一致させる。

### 2.2 最終ゴール

- `skill:import` ハンドラが `ImportedSkill` 型のオブジェクトを返す
- Rendererの `agentSlice.ts` が正しい `ImportedSkill` オブジェクトを `importedSkills` 配列に格納する
- UIでインポート済みスキルが正しく表示される（名前、ステータス、インポート日時）
- 関連テストが全件PASS
- `interfaces-agent-sdk-skill.md` の `import(skillName: string) → Promise<ImportedSkill>` 仕様と実装が一致する

### 2.3 スコープ

#### 含むもの

- `skillHandlers.ts` のハンドラ戻り値変換ロジック追加
- `SkillService.ts` の `getSkillByName()` メソッド活用（ImportedSkill取得用）
- 既存テスト（`skillHandlers.test.ts`、`skillIpc.integration.test.ts`）の戻り値検証修正
- `agentSlice.skill-integration.test.ts` のモック戻り値修正

#### 含まないもの

- 引数形式の修正（UT-FIX-SKILL-IMPORT-INTERFACE-001で対応）
- `ImportResult` 型自体の変更（他の用途で引き続き使用）
- 他のIPCチャンネルの戻り値修正
- `skill:import-batch` 等の新規チャンネル追加

### 2.4 成果物

| 成果物                                      | 説明                                                   |
| ------------------------------------------- | ------------------------------------------------------ |
| `skillHandlers.ts` 修正                     | ハンドラ内でImportResult→ImportedSkill変換ロジック追加 |
| `skillHandlers.test.ts` 修正                | 戻り値がImportedSkill型であることを検証するテスト追加  |
| `skillIpc.integration.test.ts` 修正         | 統合テストの戻り値検証をImportedSkill型に更新          |
| `agentSlice.skill-integration.test.ts` 修正 | モックの戻り値をImportedSkill型に変更                  |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-SKILL-IMPORT-INTERFACE-001（引数形式修正）が完了していること（同時実施も可）
- `SkillService.getSkillByName()` メソッド（`SkillService.ts:135-162`）が正常動作すること
- Electron IPC通信パターン、`safeInvoke` パターンの理解

### 3.2 依存タスク

| タスクID                          | タスク名                           | ステータス | 依存関係                                              |
| --------------------------------- | ---------------------------------- | ---------- | ----------------------------------------------------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | skill:import IPC引数形式不整合修正 | 未実施     | 同時実施推奨（引数+戻り値を一括で修正するのが効率的） |

### 3.3 必要な知識

- `ImportResult` 型と `ImportedSkill` 型の構造差異
- `SkillService.getSkillByName()` の動作（Skill → ImportedSkill変換）
- Electron IPCの戻り値シリアライゼーション（Date型は文字列化される点に注意）
- P23パターン（API二重定義の型管理）の適用

### 3.4 推奨アプローチ

**Option A-Extended（推奨）**: ハンドラ内で2ステップ呼び出しを行い、`ImportedSkill` を返す。

```typescript
// ✅ 推奨実装（skillHandlers.ts）
ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (event, skillName: string) => {
  // 1. バリデーション（P42準拠3段バリデーション）
  if (typeof skillName !== "string" || skillName.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    };
  }

  // 2. インポート実行
  const result = await skillService.importSkills([skillName]);

  // 3. インポート成功時、ImportedSkill を取得して返す
  if (result.success && result.importedCount > 0) {
    const importedSkill = await skillService.getSkillByName(skillName);
    if (importedSkill) {
      return importedSkill; // ImportedSkill型
    }
  }

  // 4. インポート失敗時はエラーを投げる
  throw {
    code: "IMPORT_ERROR",
    message:
      result.errors.length > 0
        ? result.errors.join(", ")
        : `Failed to import skill: ${skillName}`,
  };
});
```

**ポイント**:

1. `importSkills([skillName])` で既存のインポートロジックを再利用
2. `getSkillByName(skillName)` で `ImportedSkill` 型のオブジェクトを取得
3. Preload側の変更は不要（型宣言が `Promise<ImportedSkill>` で正しいため）
4. Renderer側の変更も不要（`agentSlice.ts` が `ImportedSkill` を期待しており、それが正しく返される）

### 3.5 実装課題と解決策（調査からの学び）

| 課題カテゴリ                             | 課題                                                                                                                                                                                                                                                          | 解決策                                                                                                                                                             | 参照パターン                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| **型不整合の不可視性**                   | TypeScriptのコンパイルチェックでは、Preload層の `safeInvoke` が `Promise<any>` を返すため、ハンドラの実際の戻り値型（`ImportResult`）とPreloadの宣言型（`ImportedSkill`）の不一致を検出できない。コンパイルは通るがランタイムでデータ構造が壊れる             | ハンドラ側で明示的に `ImportedSkill` 型を返すように変換ロジックを追加する。将来的にはIPC型スキーマ（Zod等）で両端の型を一元管理する                                | P23: API二重定義の型管理複雑性                  |
| **2ステップ呼び出し**                    | `importSkills()` は `ImportResult` を返し、`ImportedSkill` を取得するには別途 `getSkillByName()` の呼び出しが必要。1回のIPC呼び出しで2つのサービスメソッドを実行するため、トランザクション的な整合性（インポート成功 → 取得失敗のケース）を考慮する必要がある | `importSkills()` 成功後に `getSkillByName()` を呼び出す。`getSkillByName()` が `null` を返した場合はエラーとして処理する（インポート直後なのでnullは異常状態）     | なし（新規パターン）                            |
| **Date型のシリアライゼーション**         | `ImportedSkill.importedAt` は `Date` 型だが、Electron IPCのシリアライゼーション（structured clone algorithm）で `Date` オブジェクトが文字列に変換される可能性がある。Renderer側で `new Date()` に再変換が必要になるケースがある                               | Renderer側で受信後に `importedAt` を `new Date(imported.importedAt)` で再変換する、またはハンドラ側で `importedAt` を ISO 8601文字列として送信する設計を検討する   | なし（Electron IPC固有の課題）                  |
| **P44「解決済み」ステータスの不正確性**  | 06-known-pitfalls.md のP44エントリが「✅ 解決済み」となっているが、実際にはskill:importの引数形式（UT-FIX-SKILL-IMPORT-INTERFACE-001）も戻り値型（本タスク）も未修正。P4パターン（早期「完了」記載）の再発                                                    | 本タスクと UT-FIX-SKILL-IMPORT-INTERFACE-001 の両方が完了するまでP44のステータスを「解決済み」に戻さない。完了時にP44エントリを更新し、解決済みの根拠を明記する    | P4: documentation-changelogへの早期「完了」記載 |
| **20フレームワーク分析での発見プロセス** | 引数形式の不整合（表層的な問題）に注目が集まり、戻り値型の不整合（深層的な問題）の発見が遅れた。仮説思考で「引数修正だけで本当に直るか？」と問い、垂直思考でデータフローを端から端まで追跡して初めて発見された                                                | IPC不整合の調査時は「引数」「戻り値」「エラー形式」の3軸で必ず検証する。IPCチャンネルの修正タスクでは、ipc-contract-checklist.mdを参照して全契約項目をチェックする | ipc-contract-checklist.md                       |

**20フレームワーク分析の主な知見**:

1. **仮説思考**: 「引数修正だけで機能は正常化するか？」→ NO。戻り値型が不一致のため、Rendererが受け取るデータ構造が壊れる
2. **垂直思考**: データフローを `Renderer → Preload → Main → SkillService → SkillImportManager → Main → Preload → Renderer` と端から端まで追跡し、戻り値の変換漏れを発見
3. **抽象化思考**: IPC通信の「契約」を「引数契約」と「戻り値契約」に分離して分析。引数だけでなく戻り値も契約の一部として管理する必要性を認識
4. **システム思考**: ImportResult（バッチ結果）とImportedSkill（個別スキル情報）は異なるドメインモデル。バッチ操作の結果を個別オブジェクトとして返すためには、明示的な変換レイヤーが必要
5. **類推思考**: `skill:remove` の修正（UT-FIX-SKILL-REMOVE-INTERFACE-001）では戻り値が `void` だったため戻り値型の問題が発生しなかった。`skill:import` は戻り値がある分、追加の型整合性確認が必要
6. **因果関係ループ**: 引数不整合 → バリデーションエラー → 機能不全（表面化）。戻り値不整合 → UIデータ不正 → 表示崩壊（引数修正後に初めて表面化）。2つの因果チェーンが直列で存在するため、両方修正しないと機能回復しない

**UT-FIX-SKILL-IMPORT-INTERFACE-001 実装からの追加教訓**:

| 課題カテゴリ                               | 課題                                                                                                                                                                                                                | 解決策                                                                                                                                         | 参照パターン                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **P44パターン: IPCインターフェース不整合** | Main Processのハンドラが `{ skillIds: string[] }` を期待していたが、Preload側は単一文字列 `skillName` を渡していた。コンパイル時にはPreloadのモック化により検出されず、ランタイムで `VALIDATION_ERROR` として顕在化 | ハンドラ側の引数を `string`（単一スキル名）に変更し、Preload側の呼び出しパターンに合わせる。ipc-contract-checklist.md Phase 1-6 で事前検証する | P44: IPC契約ドリフト防止       |
| **P42準拠3段バリデーション**               | `typeof !== "string"` と `=== ""` の2段チェックだけではスペースのみの入力（`"   "`）がバリデーションを通過する                                                                                                      | `typeof !== "string"` → `=== ""` → `.trim() === ""` の3段階バリデーションを全IPC文字列引数に標準適用する                                       | P42: .trim()バリデーション漏れ |
| **P45パターン: 引数命名の契約ドリフト**    | 引数名 `skillId` で定義されているが、実際に渡される値はスキル「名前」（`skillName`）。命名と実態の乖離によりコードの可読性が低下                                                                                    | ハンドラ・サービス・マネージャーの全レイヤーで引数名を `skillName` に統一する                                                                  | P45: IPC引数命名の契約ドリフト |
| **並列エージェント管理**                   | UT-FIX-SKILL-IMPORT-INTERFACE-001では7エージェントの並列実行時にrate limitに到達し、一部エージェントが中断した                                                                                                      | 仕様書更新は3ファイル以下/エージェントに分割する。LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする                               | P43: rate limit中断            |
| **コンフリクト解消**                       | origin/main（UT-FIX-SKILL-REMOVE-INTERFACE-001のマージ後）との13件のマージコンフリクトが発生し、追加工数が必要になった                                                                                              | 長期ブランチは定期的にmainをマージして差分を小さく保つ。同一ファイルを修正する並行タスクは同一PRで一括実施を検討する                           | なし（プロセス改善）           |

### 3.6 システム仕様書参照（aiworkflow-requirements）

| 仕様書                                    | 該当セクション                          | 参照目的                                                                                                  |
| ----------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `interfaces-agent-sdk-skill.md`           | IPCチャンネル（スキル管理）skill:import | 契約定義: `import(skillName: string) → Promise<ImportedSkill>` — 本タスクの修正で実装がこの仕様に準拠する |
| `api-ipc-agent.md`                        | スキルファイル操作IPC                   | ハンドラの戻り値パターン参照（getSkillByNameを活用するパターン）                                          |
| `architecture-implementation-patterns.md` | S1: API二重定義の型管理複雑性           | P23パターンの解決ガイダンス（型変換レイヤーの設計）                                                       |
| `security-electron-ipc.md`                | skillFileAPI セキュリティ検証パターン   | 4層防御パターン（戻り値のサニタイズを含む）                                                               |
| `ipc-contract-checklist.md`               | IPC契約チェックリスト                   | 引数・戻り値・エラー形式の3軸チェック                                                                     |

---

## 4. 実行手順

### Phase構成

| Phase    | 名称                 | 目的                                      |
| -------- | -------------------- | ----------------------------------------- |
| Phase 1  | 要件定義             | ImportResult→ImportedSkill変換要件の確定  |
| Phase 2  | 設計                 | 変換ロジックのインターフェース設計        |
| Phase 3  | 設計レビューゲート   | 変換パターンの妥当性検証                  |
| Phase 4  | テスト作成           | 戻り値型検証テストの作成（TDD-Red）       |
| Phase 5  | 実装                 | ハンドラ内変換ロジックの実装（TDD-Green） |
| Phase 6  | テスト拡充           | エラーケース・境界値テストの追加          |
| Phase 7  | テストカバレッジ確認 | カバレッジ基準の充足確認                  |
| Phase 8  | リファクタリング     | 変換ロジックの簡素化                      |
| Phase 9  | 品質検証             | Lint・型チェック・全テスト実行            |
| Phase 10 | 最終レビューゲート   | 多角的品質検証                            |
| Phase 11 | 手動テスト           | UIからのスキルインポート動作確認          |
| Phase 12 | ドキュメント更新     | 実装ガイド・システム仕様書更新            |
| Phase 13 | 完了                 | PR準備                                    |

### Phase 4: テスト作成（TDD-Red）

#### 目的

ハンドラの戻り値が `ImportedSkill` 型であることを検証するテストケースを作成する。

#### 手順

1. `skillHandlers.test.ts` に戻り値型検証テストを追加:
   - `skill:import` ハンドラが `ImportedSkill` 型のオブジェクトを返すこと
   - 戻り値に `name`, `importedAt`, `status` プロパティが含まれること
   - `success`, `importedCount` 等の `ImportResult` プロパティが含まれないこと

2. `skillIpc.integration.test.ts` に統合テストを追加:
   - Main→Preload→Renderer のデータフロー全体で型が一致すること

3. `agentSlice.skill-integration.test.ts` のモック戻り値を修正:
   - モックが `ImportedSkill` 型の値を返すように変更

#### 成果物

- テストコード（Red状態 — 現在の実装では失敗する）

### Phase 5: 実装（TDD-Green）

#### 目的

ハンドラ内に `ImportResult` → `ImportedSkill` 変換ロジックを追加する。

#### 手順

1. `skillHandlers.ts` の `skill:import` ハンドラを修正:

   ```typescript
   // インポート実行
   const result = await skillService.importSkills([skillName]);
   // ImportedSkill を取得
   if (result.success && result.importedCount > 0) {
     const importedSkill = await skillService.getSkillByName(skillName);
     if (importedSkill) return importedSkill;
   }
   // エラー処理
   throw { code: "IMPORT_ERROR", message: ... };
   ```

2. テストがGreenになることを確認

#### 成果物

- `skillHandlers.ts` 修正

#### 完了条件

- Phase 4で作成したテストが全件PASS
- `pnpm typecheck` が通る

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skill:import` ハンドラが `ImportedSkill` 型のオブジェクトを返す
- [ ] 戻り値に `name`, `importedAt`, `status` プロパティが含まれる
- [ ] Rendererの `agentSlice.ts` が正しい `ImportedSkill` オブジェクトを格納する
- [ ] UIでインポート済みスキルが正しく表示される

### 品質要件

- [ ] 関連テスト全件PASS
- [ ] 新規テスト追加（戻り値型検証）
- [ ] `pnpm typecheck` が通る
- [ ] `pnpm lint` が通る
- [ ] P42準拠の3段バリデーションが適用されている（引数側）
- [ ] インポート失敗時のエラーハンドリングが適切

### 型定義要件

- [ ] ハンドラの戻り値型が `ImportedSkill` と一致する
- [ ] `preload/skill-api.ts` の型宣言 `Promise<ImportedSkill>` と実装が一致する
- [ ] `interfaces-agent-sdk-skill.md` の仕様 `import(skillName: string) → Promise<ImportedSkill>` と実装が一致する

### ドキュメント要件

- [ ] `interfaces-agent-sdk-skill.md` のskill:import仕様が正確に記載されている
- [ ] 修正内容が `06-known-pitfalls.md` P44に反映されている
- [ ] `ipc-contract-checklist.md` に戻り値型チェックの重要性が追記されている

---

## 6. 検証方法

### テストケース

| テストID | テストケース                                                     | 期待結果                                               |
| -------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| RT-01    | `skill:import` ハンドラが `ImportedSkill` 型を返す               | 戻り値に `name`, `importedAt`, `status` が含まれる     |
| RT-02    | 戻り値に `ImportResult` のプロパティが含まれない                 | `success`, `importedCount`, `errors` が含まれない      |
| RT-03    | インポート失敗時にエラーがthrowされる                            | `{ code: "IMPORT_ERROR", message: ... }` がthrowされる |
| RT-04    | `getSkillByName()` がnullを返した場合のエラー処理                | エラーがthrowされる                                    |
| RT-05    | Date型のシリアライゼーションが正しく行われる                     | `importedAt` がDate互換の値として返る                  |
| RT-06    | Rendererの `importedSkills` 配列に正しいオブジェクトが格納される | `imported.name` が期待するスキル名と一致               |

### 検証手順

```bash
# スキルハンドラテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers

# 統合テスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillIpc.integration

# agentSlice テスト
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.skill-integration

# 全テスト
pnpm --filter @repo/desktop test

# ランタイム確認
pnpm --filter @repo/desktop dev
# → UIからスキルをインポートし、インポート済みリストに正しく表示されることを確認
```

---

## 7. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                                                   |
| -------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------- |
| `getSkillByName()` がインポート直後に `null` を返す      | 中     | 低       | インポート処理の完了を確認後に取得する。必要ならリトライロジックを追加                 |
| Date型がIPC経由で文字列化される                          | 中     | 中       | Renderer側で `new Date()` に変換する。または ISO 8601 文字列として統一する             |
| UT-FIX-SKILL-IMPORT-INTERFACE-001との同時実施時の競合    | 低     | 中       | 同一PRで一括実施し、コンフリクトを回避する。引数+戻り値を同一コミットで修正            |
| `skillService.getSkillByName()` の内部実装変更による影響 | 低     | 低       | テストで戻り値の構造を明示的に検証する                                                 |
| 過去のP44パターンからのリグレッション                    | 低     | 低       | `skill:remove` の修正パターン（UT-FIX-SKILL-REMOVE-INTERFACE-001）を参照して一貫性確保 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                 | パス                                                                        |
| ---------------------------- | --------------------------------------------------------------------------- |
| スキルハンドラ実装           | `apps/desktop/src/main/ipc/skillHandlers.ts` (L120-138)                     |
| Preload スキルAPI            | `apps/desktop/src/preload/skill-api.ts` (L105, L261-262)                    |
| agentSlice（Renderer消費先） | `apps/desktop/src/renderer/store/slices/agentSlice.ts` (L600-622)           |
| SkillService                 | `apps/desktop/src/main/services/skill/SkillService.ts` (L103-105, L135-162) |
| SkillImportManager           | `apps/desktop/src/main/services/skill/SkillImportManager.ts` (L92-120)      |
| ImportResult型定義           | `packages/shared/src/types/skill.ts` (L165-172)                             |
| ImportedSkill型定義          | `packages/shared/src/types/skill.ts` (L284-295)                             |

### システム仕様書参照（aiworkflow-requirements）

| 仕様書                                    | 該当セクション              | 参照目的                              |
| ----------------------------------------- | --------------------------- | ------------------------------------- |
| `interfaces-agent-sdk-skill.md`           | IPCチャンネル（スキル管理） | skill:import 契約定義の正本           |
| `api-ipc-agent.md`                        | スキルファイル操作IPC       | ハンドラパターン参照                  |
| `architecture-implementation-patterns.md` | S1: API二重定義             | P23パターンの解決ガイダンス           |
| `security-electron-ipc.md`                | セキュリティ検証パターン    | 4層防御パターンの適用                 |
| `ipc-contract-checklist.md`               | IPC契約チェックリスト       | 引数・戻り値・エラー形式の3軸チェック |

### 関連タスク

| タスクID                          | 関係             | 説明                                                      |
| --------------------------------- | ---------------- | --------------------------------------------------------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | 依存（同時推奨） | skill:import 引数形式不整合修正（引数側の修正）           |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 参照             | skill:remove 修正の先行事例（戻り値はvoidのため問題なし） |
| TASK-FIX-5-1                      | 参照             | SkillAPI二重定義統一（P23パターンの先例）                 |
| UT-FIX-IPC-RESPONSE-UNWRAP-001    | 参照             | IPC レスポンスラッパー未展開修正（類似の戻り値型問題）    |

### 既知の落とし穴参照

| Pitfall ID | タイトル                                      | 関連度                                                |
| ---------- | --------------------------------------------- | ----------------------------------------------------- |
| P23        | API二重定義の型管理複雑性                     | 直接関連（戻り値型の不一致もP23パターンの一種）       |
| P32        | 型定義の二箇所同時更新必須                    | 適用（shared/types.tsとpreload/types.tsの整合性確認） |
| P44        | skill:import/remove IPCインターフェース不整合 | 直接関連（本タスクでP44の完全解決に向けた追加修正）   |
| P4         | documentation-changelogへの早期「完了」記載   | 間接関連（P44のステータスが不正確であることの根拠）   |

---

## 9. 備考

### 発見の経緯

20フレームワーク多角的分析（2026-02-21実施）において、以下の思考フレームワークで発見された：

1. **仮説思考**: 「UT-FIX-SKILL-IMPORT-INTERFACE-001で引数を修正すれば、スキルインポートは正常に動作するか？」→ 戻り値型が不一致のため、引数修正だけでは不十分
2. **垂直思考**: データフローの端から端までを追跡し、Main→Preload→Rendererの各レイヤーで型変換の有無を検証
3. **抽象化思考**: IPC通信の「契約」を引数・戻り値・エラーの3軸に分解し、戻り値軸の不整合を特定

### 設計上の考察

`SkillService.getSkillByName()` メソッド（`SkillService.ts:135-162`）は、`Skill` オブジェクトを `ImportedSkill` 型に変換して返す機能を既に持っている。この既存メソッドを活用することで、新たな型変換ロジックの追加を最小限に抑えられる。

```typescript
// SkillService.ts:135-162 の既存メソッド
async getSkillByName(name: string): Promise<ImportedSkill | null> {
  // Skill → ImportedSkill 変換ロジック
  // importedAt, status, content 等を付加して返す
}
```

### P44パターンの完全解決に必要な条件

P44（skill:import/remove IPCインターフェース不整合）を「✅解決済み」とするために必要な全タスク：

| タスクID                            | 対象   | 修正内容     | ステータス |
| ----------------------------------- | ------ | ------------ | ---------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001   | 引数   | 引数形式統一 | 未実施     |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | 戻り値 | 戻り値型変換 | 未実施     |
| UT-FIX-SKILL-REMOVE-INTERFACE-001   | 引数   | 引数形式統一 | ✅ 完了    |

3タスクすべてが完了して初めてP44を「✅解決済み」に更新できる。

### UT-FIX-SKILL-IMPORT-INTERFACE-001との同時実施推奨

本タスクは引数形式修正（UT-FIX-SKILL-IMPORT-INTERFACE-001）と密接に関連するため、同一PRで一括実施することを推奨する。分離実施する場合は、引数修正 → 戻り値修正 の順序で実施すること（引数修正なしでは戻り値テストが実行できないため）。
