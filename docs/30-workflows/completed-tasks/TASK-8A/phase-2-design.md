# Phase 2: 設計

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 2                  |
| Phase名    | 設計               |
| 前提Phase  | Phase 1            |
| 後続Phase  | Phase 3            |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

Phase 1のギャップ分析結果に基づき、追加テストのアーキテクチャ設計（モック戦略、フィクスチャ設計、テストヘルパー設計）を行う。

## 背景

既存テストはTDD Red Phaseパターン（動的import）やvi.mock/vi.fnを活用した包括的なモック戦略を採用している。新規テストは既存パターンと整合性を保ちながら、不足分を補完する設計が必要。

## 実行タスク

### Task 1: テスト設計書作成

**目的**: 各モジュールのテスト構造・テストケース設計を詳細に定義する。

**実行手順**:

1. Phase 1の `outputs/phase-1/gap-analysis.md` から追加が必要なテストケースを読み込む
2. 各モジュールについて以下のテスト設計を記述する：
   - **テストファイル構造**: `describe` / `it` のネスト構造（日本語テスト名使用）
   - **Given-When-Then**: 各テストケースの前提条件・操作・期待結果
   - **アサーション戦略**: 使用する `expect` マッチャー（`toBe`, `toEqual`, `toThrow`, `toHaveBeenCalledWith` 等）
3. テストケースIDとの対応表を含める（SS-01〜SKS-12）
4. 以下のElectronアプリ固有観点を設計に反映する：
   - **Main Process層**: `fs/promises`, `electron-store`, SDK のモック方針
   - **Renderer Process層**: `window.electronAPI.skill` のスタブ方針
   - **IPC境界**: 単体テストではIPCを越えないことの確認
5. 結果を `outputs/phase-2/test-design.md` に出力する

**期待される成果物**:

- `outputs/phase-2/test-design.md`

### Task 2: モック戦略設計

**目的**: 各モジュールの外部依存に対するモック・スタブ・スパイの使い分けを定義する。

**実行手順**:

1. Phase 1の `outputs/phase-1/module-analysis.md` から各モジュールの外部依存を確認する
2. 以下のモック戦略を定義する：

| モジュール         | 外部依存                         | モック手法                  |
| ------------------ | -------------------------------- | --------------------------- |
| SkillScanner       | `fs/promises`                    | `vi.mock("fs/promises")`    |
| SkillImportManager | `electron-store`                 | `vi.mock("electron-store")` |
| SkillExecutor      | `@anthropic-ai/claude-agent-sdk` | `vi.mock(...)` + スパイ     |
| PermissionResolver | なし                             | モック不要（純粋ロジック）  |
| skillSlice         | `window.electronAPI.skill`       | `vi.stubGlobal("window")`   |

3. 各モック手法について以下を明記する：
   - モックの初期化タイミング（`beforeEach` / `beforeAll`）
   - モックのリセットタイミング（`vi.clearAllMocks()` / `vi.restoreAllMocks()`）
   - 戻り値の設定方法（`mockResolvedValue` / `mockReturnValue` / `mockImplementation`）
4. 既存テストセットアップ `apps/desktop/src/test/setup.ts` との整合性を確認する
5. 結果を `outputs/phase-2/mock-strategy.md` に出力する

**期待される成果物**:

- `outputs/phase-2/mock-strategy.md`

### Task 3: テストフィクスチャ設計

**目的**: テストで使用するテストデータ（フィクスチャ）の構造と配置を設計する。

**実行手順**:

1. 既存フィクスチャディレクトリ `apps/desktop/src/main/services/skill/__tests__/__fixtures__/` の内容を確認する
2. 追加テストで必要なフィクスチャデータを特定する：
   - SKILL.md のサンプルコンテンツ（正常系・異常系・境界値）
   - スキルメタデータオブジェクト（`name`, `description`, `allowedTools`, `agents` 等）
   - 実行パラメータ（`skillName`, `prompt` の組み合わせ）
   - 権限リクエスト/レスポンスデータ
3. フィクスチャの共有方針を決定する：
   - **ファイルベースフィクスチャ**: `__fixtures__/` ディレクトリに配置（ファイルシステム系テスト用）
   - **インラインフィクスチャ**: テストファイル内の定数として定義（データオブジェクト系テスト用）
   - **ファクトリ関数**: テストヘルパーとして共通化（複数テストで使い回すデータ用）
4. 結果を `outputs/phase-2/fixture-design.md` に出力する

**期待される成果物**:

- `outputs/phase-2/fixture-design.md`

### Task 4: テストヘルパー設計

**目的**: テスト間で共有するヘルパー関数・ユーティリティの設計を行う。

**実行手順**:

1. 既存テストから重複パターンを抽出する：
   - モックセットアップの共通パターン
   - テストデータ生成の共通パターン
   - アサーションの共通パターン
2. 以下のヘルパー関数候補を検討する：
   - `createMockSkill(overrides?)`: スキルオブジェクトのファクトリ
   - `createMockPermissionRequest(overrides?)`: 権限リクエストのファクトリ
   - `setupSkillAPIMock(methods?)`: skillAPI モックのセットアップ
   - `createMockFrontmatter(fields?)`: フロントマターのファクトリ
3. ヘルパー関数は新規ファイルではなく、各テストファイル内に定義する方針とする（過度な抽象化を避ける）
4. 結果を `outputs/phase-2/test-helper-design.md` に出力する

**期待される成果物**:

- `outputs/phase-2/test-helper-design.md`

## 参照資料

| 参照資料               | パス                                                           | 説明                        |
| ---------------------- | -------------------------------------------------------------- | --------------------------- |
| Phase 1 既存テスト監査 | `outputs/phase-1/existing-test-audit.md`                       | テストの現状把握            |
| Phase 1 ギャップ分析   | `outputs/phase-1/gap-analysis.md`                              | 追加テスト要件              |
| Phase 1 モジュール分析 | `outputs/phase-1/module-analysis.md`                           | API・依存関係情報           |
| 既存テストパターン     | `apps/desktop/src/main/services/skill/__tests__/`              | 既存テストの実装パターン    |
| テストセットアップ     | `apps/desktop/src/test/setup.ts`                               | グローバルモック設定        |
| テストフィクスチャ     | `apps/desktop/src/main/services/skill/__tests__/__fixtures__/` | 既存フィクスチャ            |
| 品質要件               | aiworkflow-requirements `quality-requirements.md`              | TDDパターン・テスト環境設定 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                       | Phase 1 成果物              |

## 成果物

| 成果物             | パス                                    | 説明                         |
| ------------------ | --------------------------------------- | ---------------------------- |
| テスト設計書       | `outputs/phase-2/test-design.md`        | テスト構造・ケース詳細設計   |
| モック戦略         | `outputs/phase-2/mock-strategy.md`      | モック・スタブ・スパイの設計 |
| フィクスチャ設計   | `outputs/phase-2/fixture-design.md`     | テストデータの構造・配置設計 |
| テストヘルパー設計 | `outputs/phase-2/test-helper-design.md` | 共通ヘルパー関数の設計       |

## 統合テスト連携

- 単体テストのモック境界は IPC チャネルの手前で切る。`window.electronAPI.skill` より先のMain Process側ロジックは統合テスト（TASK-8B）で検証する
- SkillExecutor のSDK呼び出し部分のモック粒度を設計し、統合テスト（TASK-8C）との重複を最小化する
- テストヘルパーのうち、統合テストでも流用可能なもの（ファクトリ関数等）は `__tests__/helpers/` に配置する方針を検討する

## 完了条件

- [ ] 44テストケースすべてのGiven-When-Then設計が完了している
- [ ] 5モジュールすべてのモック戦略が定義されている
- [ ] フィクスチャの配置方針（ファイルベース/インライン/ファクトリ）が確定している
- [ ] 既存テストパターン（TDD Red Phase、動的import等）との整合性が確認されている
- [ ] Electron固有観点（Main/Renderer/IPC境界）がテスト設計に反映されている
- [ ] 4つの成果物ファイルが `outputs/phase-2/` に生成されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 2 \
  --artifacts "outputs/phase-2/test-design.md:テスト設計書,outputs/phase-2/mock-strategy.md:モック戦略,outputs/phase-2/fixture-design.md:フィクスチャ設計,outputs/phase-2/test-helper-design.md:テストヘルパー設計"
```

## 依存関係

| 項目      | 内容    |
| --------- | ------- |
| 前提Phase | Phase 1 |
| 後続Phase | Phase 3 |

## 次のPhase

→ [phase-3-design-review.md](phase-3-design-review.md)
