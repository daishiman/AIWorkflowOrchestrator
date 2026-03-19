# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 |
| Phase      | 1 — 要件定義                         |
| 作成日     | 2026-03-19                           |
| ステータス | 完了                                 |

## 目的

スキル関連IPC層に存在する2件のCritical不整合を解消し、RendererからすべてのスキルIPCチャンネルにアクセスできる状態を確立する。

## P50チェック結果（現状調査）

→ 詳細: [current-state-survey.md](./current-state-survey.md)

**判定: 実装済みPASS** — 全項目が実装済み（Phase 4-5 は「検証・補完」モードに切替）

| 確認箇所                                 | 状態                                                              |
| ---------------------------------------- | ----------------------------------------------------------------- |
| SKILL_UPDATE ハンドラ (skillHandlers.ts) | **実装済み** — L279-339 に `ipcMain.handle()` あり                |
| SKILL_UPDATE unregister                  | **実装済み** — L848 の `removeHandler` に含まれている             |
| skill-api.ts getDetail                   | **実装済み** — L507-519 にメソッド定義あり                        |
| skill-api.ts update                      | **実装済み** — L522-551 にメソッド定義あり                        |
| channels.ts SKILL_UPDATE                 | 定義済み + ホワイトリスト済み                                     |
| channels.ts SKILL_GET_DETAIL             | 定義済み + ホワイトリスト済み                                     |
| packages/shared/src/ipc/channels.ts      | **実装済み** — L69/74 に `SKILL_GET_DETAIL` / `SKILL_UPDATE` あり |
| SkillService.updateSkill                 | **実装済み** — SkillService に updateSkill メソッドあり           |
| types.ts SkillAPI                        | `import("./skill-api").SkillAPI` で自動反映 — 更新不要            |

## 機能要件（FR）

| ID   | 要件                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------- |
| FR-1 | `skill:update` チャンネルに対するIPCハンドラを Main Process に登録する                                           |
| FR-2 | `skill:update` ハンドラの登録解除（removeHandler）を `unregisterSkillHandlers` に追加する                        |
| FR-3 | Preload（skill-api.ts）に `getDetail(skillId)` メソッドを追加し、`SKILL_GET_DETAIL` チャンネルを invoke する     |
| FR-4 | Preload（skill-api.ts）に `update(skillName, updates)` メソッドを追加し、`SKILL_UPDATE` チャンネルを invoke する |

## 非機能要件（NFR）

| ID    | 要件                                                                                 |
| ----- | ------------------------------------------------------------------------------------ |
| NFR-1 | 全引数にP42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用する |
| NFR-2 | P44/P45準拠: ハンドラ引数形式とPreload呼び出し形式のセマンティクスを一致させる       |
| NFR-3 | P5準拠: `ipcMain.handle` の二重登録を防止するため `removeHandler` を必ず追加する     |
| NFR-4 | P32準拠: `packages/shared/src/ipc/channels.ts` に未定義のチャンネル定数を追加する    |
| NFR-5 | 既存の全テストがPASSを維持すること（デグレなし）                                     |

## 受入基準（AC）

| ID   | 基準                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| AC-1 | `skill:update` チャンネルに対する `ipcMain.handle()` が登録されている                                       |
| AC-2 | `unregisterSkillHandlers()` に `skill:update` の `removeHandler` が含まれている                             |
| AC-3 | skill-api.ts に `getDetail()` メソッドが追加され、`SKILL_GET_DETAIL` チャンネルを invoke する               |
| AC-4 | skill-api.ts に `update()` メソッドが追加され、`SKILL_UPDATE` チャンネルを invoke する                      |
| AC-5 | 全引数にP42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が適用されている                  |
| AC-6 | IPC契約チェックリスト Phase 1-6 を実施済み                                                                  |
| AC-7 | 既存テストが全てPASS                                                                                        |
| AC-8 | `packages/shared/src/ipc/channels.ts` に `SKILL_GET_DETAIL` / `SKILL_UPDATE` チャンネル定数が定義されている |

## スコープ定義

### スコープ内

- `skillHandlers.ts` への `skill:update` ハンドラ追加
- `skillHandlers.ts` の unregister リストへの `skill:update` 追加
- `skill-api.ts` への `getDetail()` / `update()` メソッド追加
- `packages/shared/src/ipc/channels.ts` へのチャンネル定数追加
- 上記に対応するユニットテスト追加

### スコープ外

- `agentSlice.ts` の Store アクション追加（Renderer側の利用は後続タスク）
- SkillService の `updateSkill` 実装（ハンドラが呼び出すサービス層の完全実装）
  → ハンドラ内では stub 実装またはプレースホルダーとする
- Renderer UIコンポーネントの変更
- E2Eテスト追加

## 依存関係

| 依存先 | 状態                     |
| ------ | ------------------------ |
| なし   | 独立タスク、並列実行可能 |
