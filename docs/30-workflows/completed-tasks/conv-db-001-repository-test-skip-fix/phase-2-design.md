# Phase 2: 設計

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 2                                    |
| 機能名 | conv-db-001-repository-test-skip-fix |
| 作成日 | 2026-03-22                           |

## 目的

better-sqlite3 ネイティブバイナリのリビルド戦略を設計し、postinstall スクリプトの追加方針を決定する。

## 実行タスク

- リビルド戦略設計: better-sqlite3 のリビルド方法を選定
- postinstall 設計: 自動リビルドの仕組みを設計
- 影響範囲分析: リビルドによる副作用の洗い出し

## 参照資料

| 資料名            | パス                                                                             | 説明                            |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件定義  | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-1-requirements.md` | 要件・受け入れ基準              |
| P7 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md#P7`                                          | ネイティブモジュールのABI不一致 |
| package.json      | `apps/desktop/package.json`                                                      | 依存関係・スクリプト定義        |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料        | パス                                                                                | 内容                       |
| --------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| DB実装コア仕様  | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md` | SQLite/better-sqlite3 設計 |
| IPC永続化アーキ | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`         | ConversationRepository構成 |

## 実行手順

### ステップ1: リビルド戦略の選定

#### 方法A: pnpm store prune + force install（推奨 - 第1候補）

```bash
pnpm store prune && pnpm install --force
```

**利点**: シンプル。pnpm のキャッシュされた古いバイナリを完全にクリアし、Node.js v22 向けに再ビルドする。
**リスク**: 全パッケージの再ダウンロードが発生するため時間がかかる可能性がある。

#### 方法B: electron-rebuild（第2候補 - 方法Aが失敗した場合）

```bash
cd apps/desktop
npx @electron/rebuild -f -w better-sqlite3
```

**利点**: Electron の ABI に合わせてリビルドする専用ツール。
**リスク**: テスト実行は Node.js で行うため、Electron ABI ではなく Node.js ABI が必要。テスト目的では方法Aが適切。

#### 方法C: 直接 node-gyp rebuild（第3候補 - 方法A/Bが失敗した場合）

```bash
cd apps/desktop/node_modules/better-sqlite3
npx node-gyp rebuild
```

**利点**: ネイティブバイナリだけをピンポイントでリビルドできる。
**リスク**: binding.gyp の設定に依存。

#### 方法D: pnpm rebuild（推奨 - 第1候補）

```bash
cd apps/desktop
pnpm rebuild better-sqlite3
```

**利点**: pnpm ネイティブコマンドで、対象パッケージのネイティブバイナリのみを再ビルドする。プロジェクト全体への副作用が最小。
**リスク**: pnpm store にキャッシュされた古いソースを使う可能性がある（その場合は方法Aにフォールバック）。

#### 選定結果

**方法D を第1候補とし、失敗時は方法A → 方法C の順にフォールバック**する。

理由:

- 方法D は対象パッケージのみをリビルドするため副作用最小
- 方法A は P7 ドキュメントに記載された推奨手順（全パッケージ再インストール）
- 方法B は Electron ランタイム向けであり、テスト目的には不適切
- 方法C は node-gyp 直接実行でピンポイント修正（最終手段）

### ステップ2: postinstall スクリプト設計

#### 設計方針

`apps/desktop/package.json` の `scripts.postinstall` に better-sqlite3 のリビルドコマンドを追加する。

```json
{
  "scripts": {
    "postinstall": "electron-builder install-app-deps"
  }
}
```

**注意**: `electron-builder install-app-deps` は Electron のバージョンに合わせてネイティブモジュールをリビルドする。ただし、テスト実行は Node.js で行うため、以下の2段構えが必要:

1. **本番（Electron）**: `electron-builder install-app-deps` で Electron ABI にリビルド
2. **テスト（Node.js）**: `pnpm install --force` で Node.js ABI にリビルド

#### 決定事項

現時点では postinstall スクリプトの追加は**任意（推奨）**とする。理由:

1. テスト環境と本番環境で必要な ABI が異なる（Node.js vs Electron）
2. postinstall での自動リビルドはどちらか一方にしか対応できない
3. CI でのリビルドは別途 CI 設定で対応する方が柔軟

**代替案**: `package.json` に以下のスクリプトを追加して明示的にリビルドできるようにする:

```json
{
  "scripts": {
    "rebuild:native": "pnpm store prune && pnpm install --force",
    "rebuild:electron": "npx @electron/rebuild -f -w better-sqlite3"
  }
}
```

### ステップ3: 影響範囲分析

#### 影響を受けるファイル

| ファイル                                                  | 変更内容                                   | 影響             |
| --------------------------------------------------------- | ------------------------------------------ | ---------------- |
| `apps/desktop/node_modules/better-sqlite3/build/Release/` | `.node` バイナリ生成                       | テスト実行可能に |
| `apps/desktop/package.json`                               | `scripts` に `rebuild:native` 追加（任意） | 利便性向上       |

#### 影響を受けないファイル

- `conversationRepository.test.ts` - テストコードの変更不要
- `conversationRepository.ts` - 実装コードの変更不要
- `conversationDatabase.ts` - Factory 関数の変更不要
- 他の conversation 関連テスト - better-sqlite3 を直接使用していないため影響なし

#### describeIfBetterSqlite3 の動作確認設計

リビルド後、テストファイルの L19-37 で以下のフローが正常に完了することを確認:

```
require("better-sqlite3") → 成功
↓
new candidateCtor(":memory:") → 成功
↓
BetterSqlite3Ctor = candidateCtor（非null）
↓
describeIfBetterSqlite3 = describe（describe.skip ではない）
↓
75件のテストが実行される
```

## 統合テスト連携

設計フェーズのため、統合テストの実行は不要。Phase 4 でテスト構造を確認し、Phase 5 でリビルド後にテスト実行する。

## 成果物

| 成果物 | パス                                                                       | 説明           |
| ------ | -------------------------------------------------------------------------- | -------------- |
| 設計書 | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-2-design.md` | 本ドキュメント |

## 完了条件

- [ ] リビルド戦略が選定されている（方法D → 方法A → 方法C のフォールバック）
- [ ] postinstall の追加方針が決定されている
- [ ] 影響範囲が分析され、変更が必要なファイルが特定されている
- [ ] describeIfBetterSqlite3 の期待動作フローが定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                 | 仕様参照先                                                 |
| -------------- | ------------------------ | ---------------------------------------------------------- |
| データ整合性   | DB操作テストの回復       | `aiworkflow-requirements: database-implementation-core.md` |
| アーキテクチャ | ネイティブモジュール管理 | `aiworkflow-requirements: architecture-monorepo.md`        |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. リビルド戦略の選定
2. postinstall 設計の策定
3. 影響範囲分析の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/conv-db-001-repository-test-skip-fix --phase 2
```

## 次のPhase

Phase 3: 設計レビュー
