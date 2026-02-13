# IpcResult型の重複定義統一 - タスク指示書

## フロントマター

```yaml
issue_number: 795
```

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-9B-H-001                                              |
| タスク名     | IpcResult型の重複定義を@repo/sharedに統一                |
| 分類         | リファクタリング                                         |
| 対象機能     | Skill Creator IPC                                        |
| 優先度       | 低                                                       |
| 見積もり規模 | 小規模                                                   |
| ステータス   | 未実施                                                   |
| 発見元       | TASK-9B-H-SKILL-CREATOR-IPC Phase 10 m-01 / Phase 11 D-1 |
| 発見日       | 2026-02-12                                               |
| ブロック対象 | なし                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9B-H-SKILL-CREATOR-IPCの実装において、`IpcResult<T>` 型がMain側（`skillCreatorHandlers.ts`）とPreload側（`skill-creator-api.ts`）で個別に定義されている。

### 1.2 問題点

- `skillCreatorHandlers.ts` L27-31 に `interface IpcResult<T> { success: boolean; data?: T; error?: string; }` が定義
- `skill-creator-api.ts` L26-30 に同一の `interface IpcResult<T>` が定義
- 両ファイルの型定義は現時点で同一だが、片方のみ変更した場合に型不整合が発生するリスクがある

### 1.3 放置した場合の影響

- 保守性の低下: 型変更時に2ファイル同時更新が必要
- P32パターン（型定義の二箇所同時更新必須）に該当
- 将来的な型不整合リスク

---

## 2. 何を達成するか（What）

### 2.1 目的

`IpcResult<T>` 型を `@repo/shared/types` に一元化し、両ファイルからimportする。

### 2.2 最終ゴール

- `IpcResult<T>` 型が `packages/shared/src/types/` 配下に1箇所のみ定義されている
- `skillCreatorHandlers.ts` と `skill-creator-api.ts` が共有型を参照している
- 全テストがPASSする

### 2.3 スコープ

#### 含むもの

- `@repo/shared` への `IpcResult<T>` 型追加
- `skillCreatorHandlers.ts` のローカル型定義削除とimport追加
- `skill-creator-api.ts` のローカル型定義削除とimport追加
- プロジェクト内の他の `IpcResult` 重複定義の調査と統一

#### 含まないもの

- IpcResult型の構造変更（フィールド追加・削除）
- 他のIPC関連型の統一（別タスク）

### 2.4 成果物

| 成果物     | パス                                         |
| ---------- | -------------------------------------------- |
| 共有型定義 | `packages/shared/src/types/ipcResult.ts`     |
| 型のexport | `packages/shared/src/types/index.ts`（追記） |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9B-H-SKILL-CREATOR-IPCが完了していること（完了済み）
- `@repo/shared` パッケージのビルドが正常に通ること

### 3.2 依存タスク

| タスクID                    | 関係   | 説明                                  |
| --------------------------- | ------ | ------------------------------------- |
| TASK-9B-H-SKILL-CREATOR-IPC | 完了済 | IpcResult型の重複が発見された元タスク |

### 3.3 必要な知識

- TypeScript のモジュール間型共有パターン
- `@repo/shared` パッケージの export 構成（package.json, tsup.config.ts）
- P32パターン（型定義の二箇所同時更新必須）の理解

### 3.4 推奨アプローチ

`IpcResult<T>` を `packages/shared/src/types/` に新規ファイルとして追加し、index.ts から再エクスポートする。その後、各ファイルのローカル定義を削除して共有型を import する。

### 3.5 実装課題と解決策（TASK-9B-Hからの学び）

#### 課題1: IPC型定義の配置戦略

- **問題**: Main側(`skillCreatorHandlers.ts`)とPreload側(`skill-creator-api.ts`)で`IpcResult<T>`を個別定義した結果、型の重複が発生。どちらが正本か不明確になった
- **根本原因**: ElectronのMain/Preload/Rendererプロセス間で型を共有する明確な戦略がなかった
- **解決策**: `@repo/shared/types`に共通型を配置し、Main・Preload両方からimportする。P32（型定義の二箇所同時更新必須）パターンを参考に、型変更時は必ず全レイヤーの影響を確認する
- **参照**: [architecture-implementation-patterns.md](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) のIPC型定義配置戦略

#### 課題2: sharedパッケージのexport設定

- **問題**: `@repo/shared`に型を追加しても、パッケージのexport設定（`package.json`の`exports`フィールドやバレルファイル）を更新しないとimportエラーが発生する
- **解決策**: 型追加時のチェックリスト: (1)型定義追加 → (2)バレルファイル（index.ts）にexport追加 → (3)package.jsonのexportsに必要に応じてパス追加 → (4)`pnpm --filter @repo/shared build`で確認
- **参照**: P8（幽霊依存）パターン

#### 課題3: L3ドメイン検証パターンとの型整合性

- **問題**: UT-9B-H-003でIPC L3ドメイン検証（validatePath, sanitizeErrorMessage, ALLOWED_SCHEMA_NAMES）を追加した際、IpcResult型を直接返却するパターンが確立された。型統一時にこのパターンとの整合性を保つ必要がある
- **解決策**: `@repo/shared/types/ipcResult.ts`でIpcResult<T>を定義する際、sanitizeErrorMessage()の返却パターン（errorフィールドにサニタイズ済みメッセージを設定）との互換性を確保する
- **参照**: architecture-implementation-patterns.md v1.21.0 IPC L3ドメイン検証パターン

---

## 4. 実行手順

### Phase構成

Phase 4-9（テスト作成→実装→品質検証）の構成で実施。

### Phase 4-5: テスト作成と実装

#### 目的

IpcResult型の共有化と各ファイルのimport修正

#### 手順

1. `grep -rn "IpcResult" apps/desktop/src/` でプロジェクト内の全IpcResult定義を調査
2. `packages/shared/src/types/ipcResult.ts` に統一型を定義
3. `packages/shared/src/types/index.ts` に再エクスポートを追加
4. `skillCreatorHandlers.ts` のローカル型定義を削除し、`@repo/shared` からimport
5. `skill-creator-api.ts` のローカル型定義を削除し、`@repo/shared` からimport
6. 他にIpcResult重複定義がある場合は同様に統一

### Phase 9: 品質検証

#### 目的

型整合性と全テストの成功を確認

#### 手順

1. `pnpm --filter @repo/shared build` でsharedパッケージをビルド
2. `pnpm typecheck` で型整合性を検証
3. `pnpm lint` でリント確認
4. 全テストがPASSすることを確認

---

## 5. 完了条件チェックリスト

- [ ] `IpcResult<T>` 型が `@repo/shared` に1箇所のみ定義されている
- [ ] `skillCreatorHandlers.ts` のローカル定義が削除されている
- [ ] `skill-creator-api.ts` のローカル定義が削除されている
- [ ] `pnpm typecheck` がPASS
- [ ] 関連テスト全PASS

---

## 6. 検証方法

### テストケース

- `pnpm typecheck` が全パッケージでPASS
- `skillCreatorHandlers.ts` のテスト（85件）が全PASS
- `skill-creator-api.ts` のテスト（14件）が全PASS
- `@repo/shared` のビルドが正常完了

### 検証手順

1. `grep -rn "interface IpcResult" apps/desktop/src/` で重複定義が0件であることを確認
2. `grep -rn "IpcResult" packages/shared/src/` で共有型が1箇所のみであることを確認
3. `pnpm --filter @repo/shared build && pnpm typecheck` を実行
4. `pnpm vitest run --reporter=verbose` で関連テスト全PASSを確認

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                                                                                                |
| --------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| 他のファイルにもIpcResult重複定義がある | 中     | 中       | `grep -rn "IpcResult" apps/ packages/` で全量調査してから着手                                                       |
| sharedパッケージのexport設定漏れ        | 高     | 低       | package.json, tsup.config.ts, index.ts の3箇所を必ず確認（P1対策）                                                  |
| import変更による既存テストの型エラー    | 低     | 低       | 型定義の構造自体は変更しないため影響は最小限                                                                        |
| PostToolUseフックのPrettier干渉         | 低     | 中       | Markdownコードブロック内の型表記がPrettier自動フォーマットで変形される可能性。Edit後にReadで検証する（P11パターン） |

---

## 8. 参照情報

| ドキュメント                                      | パス                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Phase 10 最終レビュー                             | `docs/30-workflows/skill-creator-ipc/outputs/phase-10/final-review-result.md`        |
| Phase 11 発見課題                                 | `docs/30-workflows/skill-creator-ipc/outputs/phase-11/discovered-issues.md`          |
| P32（型定義二箇所更新）                           | `.claude/rules/06-known-pitfalls.md#P32`                                             |
| `architecture-implementation-patterns.md`         | IPC型定義配置戦略                                                                    |
| `api-ipc-agent.md`                                | Skill Creator IPCチャンネル定義                                                      |
| `lessons-learned.md`                              | Lesson 3: IPC型定義の配置戦略                                                        |
| `security-electron-ipc.md` v1.3.1                 | L3ドメイン検証パターン完了記録                                                       |
| `architecture-implementation-patterns.md` v1.21.0 | IPC L3ドメイン検証パターン（validatePath/sanitizeErrorMessage/ALLOWED_SCHEMA_NAMES） |
| `lessons-learned.md` v1.6.0                       | UT-9B-H-003苦戦箇所5件                                                               |

### 関連タスク

| タスクID                    | 関係   | 説明                              |
| --------------------------- | ------ | --------------------------------- |
| TASK-9B-H-SKILL-CREATOR-IPC | 発見元 | SkillCreatorService IPC実装タスク |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 10 m-01: IpcResult<T>型がskillCreatorHandlers.tsとskill-creator-api.tsで個別に定義されている。@repo/sharedに統一すべき。
Phase 11 D-1: 開発者ツールで型定義の重複を確認。同一構造だが別ファイルに定義されている。
```

### 補足事項

- 現時点で両ファイルの `IpcResult<T>` 型は同一構造であるため、型の構造変更は不要
- P32パターン（型定義の二箇所同時更新必須）のリスク解消が主目的
