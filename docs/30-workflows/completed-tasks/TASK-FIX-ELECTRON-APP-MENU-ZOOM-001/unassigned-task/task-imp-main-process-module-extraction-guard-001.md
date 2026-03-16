# Main Process index.ts トップレベル副作用モジュール分離ガード - タスク指示書

## メタ情報

```yaml
task_id: UT-IMP-MAIN-PROCESS-MODULE-EXTRACTION-GUARD-001
task_name: Main Process index.ts トップレベル副作用モジュール分離ガード
category: 改善
target_feature: Electron Main Process
priority: 中
scale: 中規模
status: 未実施
source_phase: Phase 12（スキルフィードバックレポート）
created_date: 2026-03-16
dependencies: [TASK-FIX-ELECTRON-APP-MENU-ZOOM-001]
spec_path: docs/30-workflows/unassigned-task/task-imp-main-process-module-extraction-guard-001.md
```

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-IMP-MAIN-PROCESS-MODULE-EXTRACTION-GUARD-001              |
| タスク名     | Main Process index.ts トップレベル副作用モジュール分離ガード |
| 分類         | 改善                                                         |
| 対象機能     | Electron Main Process                                        |
| 優先度       | 中                                                           |
| 見積もり規模 | 中規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | Phase 12（スキルフィードバックレポート）                     |
| 発見日       | 2026-03-16                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 の実装で、`apps/desktop/src/main/index.ts` にトップレベル副作用（`app.whenReady()`, `createWindow()`, Electronモジュールインポート等）があり、index.ts から import されるモジュールのユニットテストが Vitest 環境で実行不可能だった。解決策として `menu.ts` を分離したが、index.ts には他にも分離すべきモジュールが残っている。

### 1.2 問題点・課題

- index.ts のトップレベルで `app.whenReady()`, `app.on('activate', ...)`, `createWindow()` 等の Electron API 呼び出しが実行される
- index.ts から他のモジュール（optimizer設定、IPC初期化、セキュリティ設定等）を直接 import すると、Electron API の副作用が走り Vitest 環境でテストできない
- `vi.mock("electron")` だけでは回避できないケースがあり、ファイル分離が必要になる
- 現状、index.ts が起動エントリポイントとビジネスロジックの両方を担っており、単一責務原則に違反している

### 1.3 放置した場合の影響

- 将来の Main Process 機能追加時にも同じテスト不可問題が繰り返される
- 新機能ごとにファイル分離の手戻りが発生し、開発効率が低下する
- Main Process のユニットテストカバレッジが構造的に向上できない
- テストが書けないことで、リグレッションの検出が遅れる

---

## 2. 何を達成するか（What）

### 2.1 目的

index.ts のトップレベル副作用を監査し、独立テスト可能なモジュールへの分離計画を策定・実行する。

### 2.2 最終ゴール

1. index.ts が100行以内の薄い起動エントリポイントのみになっている
2. 各機能モジュール（menu.ts, optimizer.ts, security.ts 等）が個別にユニットテスト可能になっている
3. 分離した全モジュールにユニットテストが存在し、全て PASS している
4. Phase 12 仕様同期が完了している

### 2.3 スコープ

#### 含むもの

- index.ts のトップレベルコード監査（副作用の全量リストアップ）
- 分離対象モジュールの特定と優先順位付け
- 各モジュールのファイル分離実装
- 分離した各モジュールへのユニットテスト追加
- index.ts から分離モジュールへの呼び出し構造のリファクタリング

#### 含まないもの

- Renderer 側の構造改善
- Preload 層の変更
- 既存の分離済みモジュール（menu.ts）の再修正
- IPC ハンドラの内部ロジック変更

### 2.4 成果物

- 分離された各機能モジュールファイル（`apps/desktop/src/main/` 配下）
- 各モジュールのユニットテスト（`apps/desktop/src/main/__tests__/` 配下）
- リファクタリング後の index.ts（100行以内の起動エントリポイント）
- Phase 12 仕様同期成果物

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 の menu.ts 分離が完了していること
- `apps/desktop/src/main/menu.ts` と `apps/desktop/src/main/__tests__/menu.test.ts` が存在すること

### 3.2 依存タスク

- TASK-FIX-ELECTRON-APP-MENU-ZOOM-001（完了済み — menu.ts 分離の成功パターン）

### 3.3 必要な知識

- Electron Main Process の起動シーケンス（`app.whenReady()`, `app.on()` イベントの実行順序）
- Vitest のモジュールモック（`vi.mock("electron")` パターン）
- `vi.spyOn(process, "platform", "get")` による platform 分岐のモック（S31パターン）
- モノレポ環境でのテスト実行ディレクトリ依存（P40）

### 3.4 推奨アプローチ

1. index.ts を読み、トップレベル副作用のあるコードブロックを全てリストアップする
2. 各ブロックの分離可能性を判定する（依存関係マッピング）
3. 優先度順にファイル分離する（menu.ts パターンを踏襲）
   - 分離判断の3条件: (1) テスト対象が index.ts から import される (2) index.ts にトップレベル副作用がある (3) `vi.mock("electron")` だけでは回避不可 — 3条件全て Yes ならファイル分離を実施
4. 分離した各モジュールにユニットテストを追加する
5. index.ts を薄い起動エントリポイントに整理する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                            | 発見経緯                                                                | 解決策                                                                          | 教訓                                                                        |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| index.ts の import 時に `app.whenReady()` が実行される          | Phase 4 で menu.ts のテストを書こうとした際に Vitest 環境が即座にエラー | 機能ごとにファイルを分離し、index.ts は各モジュールを呼び出すだけにする         | テスト対象ファイルの import 副作用は Phase 4 開始前に確認する               |
| ファイル分離のタイミング判断                                    | Phase 8（リファクタリング）を待つと Phase 4-5 のテストが書けない        | 3条件（上記3.4参照）で判断し、全て Yes なら Phase 5 でファイル分離を先行実施    | リファクタリングとテスタビリティ改善は Phase 5 で先行実施が必要な場合がある |
| `vi.spyOn(process, "platform", "get")` で platform 分岐をモック | Phase 4 のテスト設計時に `process.platform` のモック方法が不明          | `vi.spyOn(process, "platform", "get").mockReturnValue("darwin")` パターンを使用 | architecture-implementation-patterns S31 に記録済み                         |

---

## 4. 実行手順

### Phase構成

- Phase 1-3: 要件・設計・レビュー（index.ts の監査と分離計画）
- Phase 4-7: テスト・実装・拡充・カバレッジ（各モジュール分離とテスト）
- Phase 8-10: リファクタ・品質・最終レビュー
- Phase 11: 手動テスト（起動シーケンスの動作確認）
- Phase 12: ドキュメント（仕様同期）

### Phase 1: 要件定義（index.ts 監査）

#### 目的

index.ts のトップレベル副作用を全量リストアップし、分離対象を特定する。

#### 手順

1. `apps/desktop/src/main/index.ts` を読み、トップレベルで実行されるコードブロックを全てリストアップする
2. 各ブロックを以下のカテゴリに分類する:
   - A: 既に分離済み（menu.ts 等）
   - B: 分離すべき（テスト対象のビジネスロジックを含む）
   - C: 分離不要（`app.whenReady()` 等の起動エントリポイント固有コード）
3. カテゴリ B の各ブロックについて、依存関係と分離先ファイル名を決定する
4. P50 対策として、既に実装済みの分離がないか `git log` と現在のコードを確認する

#### 成果物

- 副作用コードブロック一覧（カテゴリ A/B/C 分類付き）
- 分離計画（優先順位、ファイル名、依存関係）

#### 完了条件

- 全トップレベル副作用が分類され、分離計画が策定されている

### Phase 2-3: 設計・設計レビュー

#### 目的

分離後のモジュール構造と index.ts のインターフェースを設計し、レビューする。

#### 手順

1. 分離後の `apps/desktop/src/main/` ディレクトリ構造を設計する
2. 各モジュールの公開インターフェース（export する関数/型）を定義する
3. index.ts の起動シーケンス（各モジュール呼び出し順序）を設計する
4. 設計レビューで循環依存・起動順序の問題がないか検証する

#### 成果物

- モジュール構造設計書
- 各モジュールのインターフェース定義

#### 完了条件

- 設計レビュー PASS（循環依存なし、起動順序が明確）

### Phase 4-7: テスト・実装・拡充・カバレッジ

#### 目的

各モジュールを分離し、ユニットテストを追加する。

#### 手順

1. カテゴリ B の各ブロックについて、優先度順に以下を実行:
   a. テストファイルを先に作成（TDD: Red）
   b. index.ts からモジュールを分離（TDD: Green）
   c. テストを拡充し、カバレッジ基準を満たす
2. 分離時は menu.ts パターン（純粋関数 + DI）を踏襲する
3. index.ts を各モジュールの呼び出しのみに整理する
4. `cd apps/desktop && pnpm vitest run src/main/` で全テスト PASS を確認（P40対策）

#### 成果物

- 分離された各機能モジュール
- 各モジュールのユニットテスト
- リファクタリング後の index.ts

#### 完了条件

- 全テスト PASS
- Line Coverage 80% 以上（推奨 90%）
- index.ts が100行以内

### Phase 8-10: リファクタ・品質・最終レビュー

#### 目的

コード品質を改善し、最終検証を行う。

#### 手順

1. ESLint `import/no-cycle` で循環依存がないことを確認する
2. `pnpm lint` と `pnpm typecheck` が PASS することを確認する
3. 全テスト PASS を確認する
4. 最終レビューで PASS 判定を得る

#### 成果物

- 品質検証ログ

#### 完了条件

- Lint / TypeCheck / 全テスト PASS
- 最終レビュー PASS

### Phase 11: 手動テスト

#### 目的

起動シーケンスのリグレッションがないことを確認する。

#### 手順

1. `pnpm --filter @repo/desktop dev` でアプリを起動する
2. メニュー、IPC通信、セキュリティ設定が正常に動作することを確認する
3. macOS `activate` イベント（Dockアイコンクリック）での再起動を確認する

#### 成果物

- 手動テスト結果ログ

#### 完了条件

- 全機能が正常に動作する

### Phase 12: ドキュメント

#### 目的

仕様書を更新し、Phase 12 チェックリストを完了する。

#### 手順

1. `implementation-guide.md` を作成する
2. システム仕様書を更新する（`technology-desktop.md` 等）
3. LOGS.md を2ファイル更新する（P1/P25対策）
4. `node generate-index.js` で topic-map.md を再生成する（P2/P27対策）
5. documentation-changelog.md を作成する（全Step事後記録、P4/P51対策）
6. 未タスクレポートを作成する

#### 成果物

- Phase 12 全成果物

#### 完了条件

- Phase 12 チェックリスト全項目完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] index.ts が100行以内の起動エントリポイントのみになっている
- [ ] 分離した各モジュールにユニットテストが存在する
- [ ] 全テストが PASS している
- [ ] 起動シーケンスにリグレッションがない

### 品質要件

- [ ] `pnpm lint` が PASS
- [ ] `pnpm typecheck` が PASS
- [ ] Line Coverage 80% 以上
- [ ] ESLint `import/no-cycle` で循環依存なし

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] Phase 12 仕様同期が完了している
- [ ] LOGS.md が2ファイル更新されている（P1/P25対策）
- [ ] topic-map.md が再生成されている（P2/P27対策）

---

## 6. 検証方法

### テストケース

- Case 1: 分離した各モジュールが `vi.mock("electron")` なしで（または最小限のモックで）テスト可能
- Case 2: index.ts が100行以内で、トップレベル副作用が起動エントリポイント固有のもののみ
- Case 3: `pnpm --filter @repo/desktop dev` で起動シーケンスが正常動作
- Case 4: macOS `activate` イベントでの再起動が正常動作（P5対策）

### 検証手順

```bash
# テスト実行（P40対策: パッケージディレクトリから実行）
cd apps/desktop && pnpm vitest run src/main/

# カバレッジ確認
cd apps/desktop && pnpm vitest run src/main/ --coverage

# Lint / TypeCheck
pnpm lint
pnpm typecheck

# index.ts の行数確認
wc -l apps/desktop/src/main/index.ts

# 循環依存チェック
pnpm --filter @repo/desktop exec eslint --rule '{"import/no-cycle": "error"}' src/main/
```

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                                                                        |
| --------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------- |
| 循環依存の発生                          | 高     | 中       | ESLint `import/no-cycle` ルールで検出。分離前に依存関係マッピングを実施                     |
| 起動順序の変更によるリグレッション      | 高     | 低       | Phase 11 で起動シーケンスの手動テスト。`app.whenReady()` 前後の呼び出し順序を設計書で明確化 |
| テストモック量の増大（P21/P35）         | 中     | 高       | 共通 mock ファクトリを `__tests__/helpers/` に作成し、各テストファイルで再利用              |
| Electron イベントリスナー二重登録（P5） | 高     | 中       | `unregisterAllIpcHandlers()` パターンの適用。分離時にリスナー登録のガードを確認             |
| モノレポ環境でのテスト実行失敗（P40）   | 中     | 中       | `cd apps/desktop && pnpm vitest run` で実行。CI でも同ディレクトリから実行                  |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/menu.ts` — 分離済みの成功パターン
- `apps/desktop/src/main/__tests__/menu.test.ts` — テストパターン
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-fallback-validation.md` S31（`vi.spyOn(process, "platform", "get")` パターン）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — index.ts 副作用分離の教訓
- `.claude/skills/aiworkflow-requirements/references/technology-desktop.md` — ディレクトリ構造

### 参考資料

- `.claude/rules/06-known-pitfalls.md` P5（リスナー二重登録）、P21/P35（DI追加時のテストモック大規模修正）、P40（テスト実行ディレクトリ依存）
- `.claude/rules/01-architecture.md` — レイヤー依存方向
- `.claude/rules/02-code-quality.md` — TDD原則・カバレッジ基準

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 のスキルフィードバックレポートにて検出:
index.ts にトップレベル副作用（app.whenReady(), createWindow(), Electronモジュールインポート等）があり、
index.ts から import されるモジュールのユニットテストが Vitest 環境で実行不可能。
menu.ts は分離済みだが、他にも分離すべきモジュールが残っている可能性がある。
```

### 補足事項

- menu.ts 分離の成功パターン（純粋関数 + DI + `vi.spyOn(process, "platform", "get")`）を他モジュールにも適用する
- Phase 4 開始前に、テスト対象ファイルの import 副作用を必ず確認する（phase-template-execution.md に追加済みの教訓）
- ファイル分離の判断基準（3条件）は 3.4 推奨アプローチに記載
