# アーキテクチャ設計書 — packages/shared ソースディレクトリ構造統一

## 現行アーキテクチャ

```
packages/shared/
├── types/                          ← 旧ディレクトリ（削除対象）
│   ├── index.ts                    ← src/types/index.ts に統合
│   ├── auth.ts                     ← src/types/ に移動
│   ├── api-keys.ts                 ← src/types/ に移動
│   ├── common.ts                   ← src/types/ に移動
│   ├── file-selection.ts           ← src/types/ に移動
│   ├── workflow.ts                 ← src/types/ に移動
│   └── __tests__/
│       └── auth.test.ts            ← src/types/__tests__/ に移動
├── src/
│   └── types/
│       ├── index.ts                ← 統合先（re-export 追加）
│       ├── skill.ts
│       ├── agent.ts
│       ├── agent-execution.ts
│       ├── auth-mode.ts
│       ├── replace.ts
│       ├── skill-improver.ts
│       ├── skill-share.ts
│       ├── skill-schedule.ts
│       ├── skill-debug.ts
│       ├── skill-docs.ts
│       ├── skill-analytics.ts
│       ├── skill-chain.ts
│       ├── chat-session.ts
│       ├── chat-message.ts
│       ├── llm-metadata.ts
│       ├── slideSettings.ts
│       ├── permission-store.ts
│       ├── skillCreator.ts
│       ├── rag/
│       └── llm/
├── package.json                    ← exports / typesVersions 更新
└── tsup.config.ts                  ← entry 更新
```

## 目標アーキテクチャ

```
packages/shared/
├── src/
│   └── types/
│       ├── index.ts                ← 統合済み（workflow/common/auth/api-keys の re-export 追加）
│       ├── auth.ts                 ← types/ から移動
│       ├── api-keys.ts             ← types/ から移動
│       ├── common.ts               ← types/ から移動
│       ├── file-selection.ts       ← types/ から移動（import パス更新済み）
│       ├── workflow.ts             ← types/ から移動
│       ├── skill.ts
│       ├── agent.ts
│       ├── agent-execution.ts
│       ├── auth-mode.ts
│       ├── replace.ts
│       ├── ...（既存ファイル変更なし）
│       └── __tests__/
│           └── auth.test.ts        ← types/__tests__/ から移動
├── package.json                    ← exports / typesVersions 更新済み
└── tsup.config.ts                  ← entry 更新済み
```

## パスマッピング設計

### 公開パス → 実体ファイルの対応

| 公開パス                      | package.json exports                     | typesVersions                     | tsconfig paths                                        | tsup entry                      |
| ----------------------------- | ---------------------------------------- | --------------------------------- | ----------------------------------------------------- | ------------------------------- |
| `@repo/shared/types`          | `./dist/src/types/index.d.ts`（不変）    | `./src/types/index.ts`（不変）    | `../../packages/shared/src/types/index.ts`（不変）    | `src/types/index.ts`（不変）    |
| `@repo/shared/types/auth`     | `./dist/src/types/auth.d.ts`（変更）     | `./src/types/auth.ts`（変更）     | `../../packages/shared/src/types/auth.ts`（変更）     | `src/types/auth.ts`（追加）     |
| `@repo/shared/types/api-keys` | `./dist/src/types/api-keys.d.ts`（変更） | `./src/types/api-keys.ts`（変更） | `../../packages/shared/src/types/api-keys.ts`（変更） | `src/types/api-keys.ts`（追加） |

### 4ファイル同期チェック結果

| ファイル                         | 変更要否 | 変更エントリ数                |
| -------------------------------- | -------- | ----------------------------- |
| `packages/shared/package.json`   | はい     | exports: 2, typesVersions: 2  |
| `apps/desktop/tsconfig.json`     | はい     | paths: 2                      |
| `apps/desktop/vitest.config.ts`  | いいえ   | 0（tsconfigPaths が自動解決） |
| `packages/shared/tsup.config.ts` | はい     | 削除: 3, 追加: 2              |

## aiworkflow-requirements 抽出結果

| 参照仕様                    | 抽出した必須情報                                                 | 設計への反映                                    |
| --------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| `architecture-overview.md`  | レイヤー境界を変えずに `shared` の実体パスのみ整理する           | 目標アーキテクチャで Main/Renderer 契約を不変化 |
| `architecture-monorepo.md`  | 公開パスは維持し、`exports/typesVersions/paths/entry` を同期する | パスマッピング設計・4ファイル同期チェック       |
| `directory-structure.md`    | 型定義の配置は `src/types/` に集約する                           | 目標ディレクトリ構造                            |
| `quality-requirements.md`   | 検証可能な完了条件（ビルド/型/テスト）を設計段階で定義する       | Step 5〜9 の検証計画                            |
| `development-guidelines.md` | ロールバック可能な順序で変更する                                 | 移行順序（コピー→設定更新→検証→削除）           |

## ビルド出力構造の変更

### 変更前の dist/

```
dist/
├── types/
│   ├── index.js / index.d.ts
│   ├── auth.js / auth.d.ts
│   └── api-keys.js / api-keys.d.ts
└── src/types/
    ├── index.js / index.d.ts
    ├── skill.js / skill.d.ts
    └── ...
```

### 変更後の dist/

```
dist/
└── src/types/
    ├── index.js / index.d.ts        ← 統合済み
    ├── auth.js / auth.d.ts          ← 新規
    ├── api-keys.js / api-keys.d.ts  ← 新規
    ├── skill.js / skill.d.ts
    └── ...
```

`dist/types/` ディレクトリは生成されなくなる。
