# SkillMetadataProvider stub→実装（SKILL.md からツール情報取得） - タスク指示書

## メタ情報

```yaml
issue_number: 1289
```

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-06-003-METADATA-PROVIDER-IMPL                               |
| タスク名     | SkillMetadataProvider stub→実装（SKILL.md からツール情報取得） |
| 分類         | 実装                                                           |
| 対象機能     | SafetyGate MetadataProvider                                    |
| 優先度       | 中                                                             |
| 見積もり規模 | 中規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | UT-06-003 Phase 12 未タスク検出                                |
| 発見日       | 2026-03-17                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-06-003 で `DefaultSafetyGate` のコンストラクタに以下のスタブ実装を渡している（`apps/desktop/src/main/ipc/index.ts` L840-843）：

```typescript
metadataProvider: {
  getRequiredTools: async () => [],
  getAccessPaths: async () => [],
}
```

実スキル実行時にはスキルの SKILL.md マニフェストからツール情報・アクセスパスを動的に取得する本格実装が必要である。現在のスタブ実装は開発中の一時措置として許容されているが、本番環境への移行前に実 `SkillMetadataProvider` に差し替えなければならない。

### 1.2 問題点・課題

1. `SafetyGate` の `evaluate()` が常に空のツールリスト・アクセスパスで評価するため、セキュリティチェックが事実上無効になっている
2. スキルが `Bash` や `Write` などの危険なツールを使用しても、SafetyGate がそれを検知できない
3. `protectedPaths` のチェックも空のアクセスパスに対して実行されるため、常に safe 判定になる
4. スタブのまま本番リリースした場合、SafetyGate 機能がセキュリティ保護として機能しない

### 1.3 放置した場合の影響

- SafetyGate の安全性チェックが完全に無効化された状態が本番環境に存在し続ける
- スキルが宣言されていないツール（`Bash`、`Write` 等）を使用しても検知できず、意図しないファイル操作やコマンド実行が発生する
- セキュリティ監査で SafetyGate の形骸化が指摘されるリスク

---

## 2. 何を達成するか（What）

### 2.1 目的

`DefaultSafetyGate` に渡す `MetadataProvider` を、スタブ実装から SKILL.md マニフェストを実際に読み込んで `allowed-tools` と `allowed-paths` フィールドを取得する本格実装に置き換える。

### 2.2 最終ゴール

- スキル実行時に SKILL.md の `allowed-tools` フィールドから `getRequiredTools()` が正しいツールリストを返す
- SKILL.md の `allowed-paths`（またはそれに相当するフィールド）から `getAccessPaths()` が正しいパスリストを返す
- 実装が `apps/desktop/src/main/ipc/index.ts` のスタブと差し替えられている
- 単体テストが作成されカバレッジ基準（Line 80%、Function 80%）を充足している

### 2.3 スコープ

#### 含むもの

- `SkillMetadataProvider` クラスの新規実装（`apps/desktop/src/main/permissions/skill-metadata-provider.ts`）
- 単体テスト（`apps/desktop/src/main/permissions/__tests__/skill-metadata-provider.test.ts`）
- `apps/desktop/src/main/ipc/index.ts` のスタブを実 `SkillMetadataProvider` に差し替え
- SKILL.md パースロジック（既存の `SkillScanner` から再利用可能な部分は再利用）

#### 含まないもの

- `DefaultSafetyGate` 本体の変更
- SafetyGate の評価ロジック変更
- SKILL.md のフォーマット変更

### 2.4 成果物

- `apps/desktop/src/main/permissions/skill-metadata-provider.ts`（新規）
- `apps/desktop/src/main/permissions/__tests__/skill-metadata-provider.test.ts`（新規）
- `apps/desktop/src/main/ipc/index.ts`（スタブ → 実装に差し替え）

---

## 3. どう実装するか（How）

### 3.1 実装方針

#### データソースの確認（最初に実施すること）

実装前に以下の調査を必ず行う：

1. `apps/desktop/src/main/services/skill/SkillScanner.ts` で SKILL.md の読み込みロジックを確認し、`allowed-tools` フィールドの取得方法を把握する
2. SKILL.md の実際のフォーマット（`allowed-tools` フィールドの構造）をサンプルスキルで確認する
3. `SafetyGatePort` のインターフェース定義（`getRequiredTools`, `getAccessPaths` のシグネチャ）を確認する

#### 実装方針

- `SkillMetadataProvider` はスキル名を受け取ってスキルディレクトリを特定し、SKILL.md を読み込む
- スキル名からスキルディレクトリのパスを解決するロジックは `SkillFileManager` または `SkillScanner` の既存実装を参考にする
- SKILL.md のパース結果から `allowed-tools` を抽出して配列として返す
- SKILL.md の読み込みや解析に失敗した場合は空配列を返す（フェイルセーフ設計）

```typescript
// apps/desktop/src/main/permissions/skill-metadata-provider.ts
export class SkillMetadataProvider implements MetadataProviderPort {
  constructor(private readonly skillsBaseDir: string) {}

  async getRequiredTools(skillName: string): Promise<string[]> {
    try {
      // SKILL.md を読み込み、allowed-tools を解析して返す
      // 失敗時は [] を返す（P54 対策: フェイルセーフ）
    } catch {
      return [];
    }
  }

  async getAccessPaths(skillName: string): Promise<string[]> {
    try {
      // SKILL.md を読み込み、allowed-paths（相当するフィールド）を解析して返す
      // 失敗時は [] を返す
    } catch {
      return [];
    }
  }
}
```

### 3.2 苦戦箇所・注意点（前回の教訓）

#### データソースの所在が不明確（P61 候補）

型レベルでは正しい抽象化（`getRequiredTools`, `getAccessPaths`）でも、実装時に「SKILL.md のどのフィールドからツール情報を取得するか」が未定義だった。実装開始前にデータフロー図を書き、「SKILL.md → どのフィールド → どの型 → インターフェースのどのメソッド」を明確にすること。

#### P34（遅延初期化 DI パターン）

`MetadataProvider` はスキル実行時に動的にスキル名を受け取る必要がある。コンストラクタ時点ではスキル名が不明なため、Factory Pattern または Setter Injection を検討する。`getRequiredTools(skillName: string)` のようにスキル名を引数として受け取る設計が自然である。

#### P54（フェイルセーフ設計）

`SkillMetadataProvider` の初期化または SKILL.md 読み込みが失敗した場合のフォールバック（空配列を返す）を設計すること。これにより SafetyGate が例外で停止せず、グレースフルデグラデーションが実現できる。ただし、失敗時はログに記録すること。

#### SKILL.md パース精度

SKILL.md はマークダウン形式であり、`allowed-tools` フィールドの値は YAML フロントマターまたはリスト形式で記載されている可能性がある。既存の `SkillScanner.ts` のパースロジックを再利用すること（重複実装を避ける）。

### 3.3 テスト方針

- 正常系: SKILL.md に `allowed-tools: [Bash, Write]` が記載されている場合、`["Bash", "Write"]` が返ること
- 異常系1: 存在しないスキル名を渡した場合、空配列が返ること（例外でなく）
- 異常系2: SKILL.md の `allowed-tools` フィールドが空の場合、空配列が返ること
- 異常系3: SKILL.md が破損している場合、空配列が返ること
- カバレッジ基準: Line 80%、Function 80%

---

## 4. 関連情報

### 4.1 関連タスク

| タスクID               | 関係性                                  |
| ---------------------- | --------------------------------------- |
| UT-06-003              | 親タスク（SafetyGate IPC 実装）         |
| UT-06-003-DIP-REFACTOR | 関連（SafetyGate DIP リファクタリング） |

### 4.2 関連仕様書

| 仕様書                         | パス                                                                                        | 内容                              |
| ------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------- |
| SafetyGate IPC 仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-safety.md`                 | MetadataProvider インターフェース |
| スキル実行セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`             | SafetyGatePort 定義               |
| Electron サービス詳細（Part2） | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | PermissionStore 共有パターン      |

### 4.3 関連 Pitfall

| Pitfall ID | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| P34        | 遅延初期化が必要な依存オブジェクトの DI パターン選択          |
| P54        | safeRegister パターン不適合（戻り値キャプチャ必要なハンドラ） |
| P61        | DIP 違反検出遅延（設計時にデータフロー未定義）                |

---

## 5. 実行手順

### Phase 1: 調査

#### 目的

実装前の調査で、データソースとインターフェースを明確にする。

#### 手順

1. `apps/desktop/src/main/services/skill/SkillScanner.ts` を読み込み、SKILL.md パースロジックを把握する
2. サンプルスキルの SKILL.md を確認し、`allowed-tools` フィールドの形式を把握する
3. `SafetyGatePort` のインターフェース定義（`getRequiredTools`, `getAccessPaths`）を確認する
4. データフロー図を `outputs/phase-1/data-flow.md` に記録する

#### 完了条件

- SKILL.md の `allowed-tools` フィールドの形式が明確になっている
- `SkillMetadataProvider` の入出力仕様が確定している

### Phase 2: テスト設計・作成（TDD）

#### 目的

実装前にテストケースを設計する。

#### 手順

1. 正常系・異常系のテストケースを列挙する
2. `apps/desktop/src/main/permissions/__tests__/skill-metadata-provider.test.ts` を作成する
3. テストが Red（失敗）状態であることを確認する

#### 完了条件

- テストケースが実装されている
- `pnpm --filter @repo/desktop test` でテストが Red になる

### Phase 3: 実装

#### 目的

`SkillMetadataProvider` を実装し、スタブを差し替える。

#### 手順

1. `apps/desktop/src/main/permissions/skill-metadata-provider.ts` を実装する
2. `apps/desktop/src/main/ipc/index.ts` のスタブを `SkillMetadataProvider` に差し替える
3. テストが Green になることを確認する

#### 完了条件

- `pnpm --filter @repo/desktop test` で全テストが Green になる
- カバレッジが基準（Line 80%、Function 80%）を充足している
- `pnpm typecheck` が通る

---

## 6. 完了条件チェックリスト

### 機能要件

- [ ] SKILL.md の `allowed-tools` からツールリストが正しく取得できる
- [ ] SKILL.md が存在しない場合、空配列が返る（例外でなく）
- [ ] SKILL.md の `allowed-tools` が空の場合、空配列が返る
- [ ] SKILL.md が破損している場合、空配列が返る
- [ ] `apps/desktop/src/main/ipc/index.ts` のスタブが実装に差し替えられている

### 品質要件

- [ ] `pnpm --filter @repo/desktop test` が全 PASS
- [ ] Line カバレッジ 80% 以上
- [ ] Function カバレッジ 80% 以上
- [ ] `pnpm typecheck` が通る
- [ ] `pnpm lint` が通る
