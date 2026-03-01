# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| Phase名    | テスト拡充                      |
| 前提Phase  | Phase 5（実装）                 |
| 後続Phase  | Phase 7（カバレッジ確認）       |
| ステータス | pending                         |
| 作成日     | 2026-02-28                      |
| 機能名     | TASK-9D: スキルチェーン機能実装 |

---

## 目的

カバレッジ目標（Line 80%+、Branch 60%+、Function 80%+）達成に向けた追加テストを作成する。Phase 4 の基本テストに加え、境界値・エラーパス・統合テスト・セキュリティテストを追加し、実装の堅牢性を検証する。

## 背景

Phase 4 で基本的なテストは作成したが、全ての分岐やエッジケースをカバーしていない。特に以下の領域が未カバーの可能性がある：

- errorHandling の全パターン（stop/skip/retry）の網羅的な分岐
- 境界値（空文字列、null、undefined、超長文字列、特殊文字）
- IPC 経由の統合フロー
- セキュリティ（sender 検証、パストラバーサル）

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現在のカバレッジ分析

**目的**: Phase 5 実装後の現在のカバレッジを測定し、不足領域を特定する

**実行手順**:

1. カバレッジ付きでテストを実行する：

```bash
# SkillChainExecutor カバレッジ
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/SkillChainExecutor.test.ts

# SkillChainStore カバレッジ
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/SkillChainStore.test.ts

# IPC ハンドラカバレッジ
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/skillHandlers.chain.test.ts
```

2. 各ファイルのカバレッジ指標を記録する：

| 対象ファイル                  | Line | Branch | Function | 目標達成 |
| ----------------------------- | ---- | ------ | -------- | -------- |
| SkillChainExecutor.ts         |      |        |          | □        |
| SkillChainStore.ts            |      |        |          | □        |
| skillHandlers.ts（chain部分） |      |        |          | □        |

3. カバーされていない行・分岐を特定する

4. `outputs/phase-6/coverage-report.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`

---

### タスク2: 境界値テスト追加

**目的**: 入力の境界値に対する堅牢性を検証する

**実行手順**:

1. 以下の境界値テストを各テストファイルに追加する：

#### SkillChainExecutor 境界値

```typescript
describe("boundary cases", () => {
  it("steps 配列が100ステップの大規模チェーンを正しく実行する", async () => {
    // 100ステップのチェーン定義を生成
    // 全ステップが順次実行されることを確認
  });

  it("変数名に特殊文字（日本語、絵文字、記号）を含むチェーンを処理する", async () => {
    // variables: { "テスト変数": "値", "key-with-dash": "v" }
  });

  it("previousOutput が null の場合、次ステップに null が渡される", async () => {});

  it("previousOutput が undefined の場合、次ステップに undefined が渡される", async () => {});

  it("template に {{}} のみ（変数名なし）が含まれる場合、空文字列に置換する", async () => {
    // template: "prefix-{{}}-suffix"
    // 期待値: "prefix--suffix"
  });

  it("extractPath に存在しない深いパス（a.b.c.d.e）を指定した場合、undefined を格納する", async () => {});

  it("definition.variables が undefined の場合、空オブジェクトとして初期化する", async () => {});
});
```

#### SkillChainStore 境界値

```typescript
describe("boundary cases", () => {
  it("id が UUID 形式の超長文字列（36文字）でも正しく保存・取得する", async () => {});

  it("name が1文字でも正しく保存する", async () => {});

  it("description が10000文字の長文でも正しく保存する", async () => {});

  it("steps が空配列の場合でも保存可能", async () => {});

  it("variables が深くネストしたオブジェクト（5階層）でも保存・復元する", async () => {});

  it("同時に10件保存した場合、全件が list で取得可能", async () => {});

  it("ストレージファイルが破損（不正JSON）の場合、空配列を返す", async () => {});
});
```

#### IPC ハンドラ境界値

```typescript
describe("boundary cases", () => {
  it("chainId に null を渡した場合、VALIDATION_ERROR を投げる", async () => {});

  it("chainId に undefined を渡した場合、VALIDATION_ERROR を投げる", async () => {});

  it("chainId に数値を渡した場合、VALIDATION_ERROR を投げる", async () => {});

  it("chainId にオブジェクトを渡した場合、VALIDATION_ERROR を投げる", async () => {});

  it("definition に配列を渡した場合、VALIDATION_ERROR を投げる", async () => {});

  it("variables に null を渡した場合、VALIDATION_ERROR を投げる", async () => {});

  it("variables に配列を渡した場合、VALIDATION_ERROR を投げる", async () => {});

  it("definition.errorHandling に 'invalid' を渡した場合、VALIDATION_ERROR を投げる", async () => {});
});
```

**期待される成果物**:

- 各テストファイルに境界値テストが追加されている

---

### タスク3: エラーパステスト追加

**目的**: errorHandling（stop/skip/retry）の全パターンを網羅的にテストする

**実行手順**:

1. 以下のエラーパステストを SkillChainExecutor テストに追加する：

```typescript
describe("error handling patterns", () => {
  describe("stop モード", () => {
    it("最初のステップで失敗した場合、即座に中断し results.length === 1", async () => {});

    it("中間ステップで失敗した場合、後続ステップは実行されない", async () => {});

    it("最後のステップで失敗した場合、前のステップの結果は保持される", async () => {});

    it("失敗ステップの error にエラーメッセージが含まれる", async () => {});
  });

  describe("skip モード", () => {
    it("失敗ステップを skipped: true にし、次ステップに進む", async () => {});

    it("skip されたステップの previousOutput は前の成功ステップの出力が維持される", async () => {});

    it("全ステップが skip された場合、success: true で全結果を返す", async () => {});
  });

  describe("retry モード", () => {
    it("retryCount: 0 の場合、即座に失敗とする", async () => {});

    it("retryCount: 3 で3回目に成功した場合、success: true になる", async () => {
      // mockSkillExecute: 1回目失敗、2回目失敗、3回目成功
    });

    it("retryCount: 2 で3回連続失敗した場合、errorHandling に従い処理する", async () => {});

    it("retry 中にタイムアウトした場合、retry をタイムアウトエラーとして扱う", async () => {});
  });

  describe("条件分岐との組み合わせ", () => {
    it("ifPreviousSuccess 条件で前ステップ失敗（skip）の場合、条件不成立で skip する", async () => {});

    it("ifVariable 条件で変数が未設定の場合、条件不成立で skip する", async () => {});
  });
});
```

**期待される成果物**:

- エラーパステストが SkillChainExecutor テストファイルに追加されている

---

### タスク4: 統合テスト追加

**目的**: IPC 経由のチェーン操作フローを端から端までテストする

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.chain.integration.test.ts` を作成する

2. 以下の統合テストシナリオを実装する：

```typescript
describe("Skill Chain Integration Tests", () => {
  describe("CRUD フロー", () => {
    it("save → get で保存したチェーンが取得できる", async () => {
      // 1. skill:chain:save で保存
      // 2. skill:chain:get で取得
      // 3. 内容が一致することを確認
    });

    it("save → list で保存したチェーンが一覧に含まれる", async () => {});

    it("save → delete → get で削除後に null が返る", async () => {
      // 1. skill:chain:save で保存
      // 2. skill:chain:delete で削除
      // 3. skill:chain:get で null を確認
    });

    it("save → delete → list で削除後に一覧から除外される", async () => {});
  });

  describe("実行フロー", () => {
    it("save → execute でチェーンが実行される", async () => {
      // 1. skill:chain:save でチェーンを保存
      // 2. skill:chain:execute で実行
      // 3. SkillChainResult が返ることを確認
    });

    it("execute で variables を渡すと実行時変数として使用される", async () => {});
  });

  describe("Date シリアライズ検証", () => {
    it("save した createdAt/updatedAt が ISO 8601 文字列として返される", async () => {
      // 1. save 時に createdAt/updatedAt を ISO 8601 文字列で設定
      // 2. get で取得
      // 3. typeof === "string" かつ ISO 8601 形式であることを確認
    });
  });
});
```

3. `outputs/phase-6/integration-test.md` に統合テスト実行結果を記録する

**期待される成果物**:

- `apps/desktop/src/main/ipc/skillHandlers.chain.integration.test.ts`
- `outputs/phase-6/integration-test.md`

---

### タスク5: セキュリティテスト追加

**目的**: IPC ハンドラのセキュリティを検証する

**実行手順**:

1. 以下のセキュリティテストを IPC ハンドラテストに追加する：

```typescript
describe("security", () => {
  describe("sender 検証", () => {
    it("不正な sender からの skill:chain:list 呼び出しを拒否する", async () => {});

    it("不正な sender からの skill:chain:save 呼び出しを拒否する", async () => {});

    it("不正な sender からの skill:chain:execute 呼び出しを拒否する", async () => {});
  });

  describe("入力サニタイズ", () => {
    it("chainId にパストラバーサル文字列（../）を含む場合、バリデーションエラーを返して拒否する", async () => {});

    it("definition.name に HTML タグを含む場合、保存時にそのまま保持（Renderer で表示時にエスケープ）", async () => {});

    it("variables に __proto__ キーを含む場合、プロトタイプ汚染しない", async () => {});
  });

  describe("validateIpcSender コールバック検証", () => {
    it("getAllowedWindows コールバックが正しく呼ばれる（P41 カバレッジ対策）", async () => {
      // P41: v8カバレッジのインライン関数カウント
      // mockValidateIpcSender.mock.calls[i][2].getAllowedWindows() を明示的に呼ぶ
    });
  });
});
```

**期待される成果物**:

- セキュリティテストが IPC ハンドラテストファイルに追加されている

---

### タスク6: 最終カバレッジ確認

**目的**: 追加テスト後のカバレッジを確認する

**実行手順**:

1. カバレッジ付きで全テストを実行する：

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/services/skill/SkillChainExecutor.test.ts \
  src/main/services/skill/SkillChainStore.test.ts \
  src/main/ipc/skillHandlers.chain.test.ts \
  src/main/ipc/skillHandlers.chain.integration.test.ts
```

2. カバレッジが目標を達成していることを確認する：

| 対象ファイル                  | Line | Branch | Function | 目標達成 |
| ----------------------------- | ---- | ------ | -------- | -------- |
| SkillChainExecutor.ts         | 80%+ | 60%+   | 80%+     | □        |
| SkillChainStore.ts            | 80%+ | 60%+   | 80%+     | □        |
| skillHandlers.ts（chain部分） | 80%+ | 60%+   | 80%+     | □        |

3. 目標未達の場合、不足箇所を特定し追加テストを作成する

4. `outputs/phase-6/coverage-report.md` を更新する

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`（更新）

---

## 参照資料

| 参照資料              | パス                                                                          | 内容                   |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------- |
| Phase 4 テスト        | `apps/desktop/src/main/services/skill/SkillChainExecutor.test.ts`             | 元テストコード         |
| Phase 4 テスト        | `apps/desktop/src/main/services/skill/SkillChainStore.test.ts`                | 元テストコード         |
| Phase 4 テスト        | `apps/desktop/src/main/ipc/skillHandlers.chain.test.ts`                       | 元テストコード         |
| Phase 5 実装          | `apps/desktop/src/main/services/skill/SkillChainExecutor.ts`                  | Executor 実装          |
| Phase 5 実装          | `apps/desktop/src/main/services/skill/SkillChainStore.ts`                     | Store 実装             |
| Phase 5 実装          | `apps/desktop/src/main/ipc/skillHandlers.ts`                                  | IPC ハンドラ           |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | Phase 6 テスト検証     |
| セキュリティIPC       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`     | sender 検証パターン    |
| 教訓集                | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | P39/P41 テスト注意事項 |

---

## 成果物

| 成果物             | パス                                                                | 内容                        |
| ------------------ | ------------------------------------------------------------------- | --------------------------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                | カバレッジ分析・最終結果    |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`                               | 統合テスト実行結果          |
| 境界値テスト       | 各テストファイルに追加                                              | 境界値テストケース          |
| エラーパステスト   | `apps/desktop/src/main/services/skill/SkillChainExecutor.test.ts`   | errorHandling 全パターン    |
| 統合テスト         | `apps/desktop/src/main/ipc/skillHandlers.chain.integration.test.ts` | IPC 経由統合テスト          |
| セキュリティテスト | `apps/desktop/src/main/ipc/skillHandlers.chain.test.ts`             | sender 検証・入力サニタイズ |

---

## 統合テスト連携

**Phase 6 では統合テストの実施として**:

- IPC 経由の CRUD フロー（save→get→delete→list）を統合テストで検証
- Date 型シリアライズの IPC 境界往復テストを実施
- モック SkillChainStore / SkillChainExecutor を使用した IPC ハンドラの統合テスト

---

## 多角的チェック観点

### テスト拡充品質

| 観点                     | 確認内容                                                        | 結果 |
| ------------------------ | --------------------------------------------------------------- | ---- |
| errorHandling 全パターン | stop/skip/retry の全分岐がテストされている                      | □    |
| 境界値網羅               | null, undefined, 空文字列, スペースのみ, 超長文字列がテスト済み | □    |
| P42 異常系               | 各チャネルで3段バリデーション失敗時のエラーコードが検証済み     | □    |
| P41 インライン関数       | validateIpcSender コールバックが明示的にテストされている        | □    |
| P39 happy-dom 互換       | 追加テストで userEvent を使用していない                         | □    |
| 統合テスト CRUD          | save→get、save→delete→get のフローがテスト済み                  | □    |
| Date シリアライズ        | createdAt/updatedAt の ISO 8601 往復テストがある                | □    |
| プロトタイプ汚染防止     | **proto** キーによる汚染が防がれている                          | □    |

### Electron 固有観点

| 観点             | 確認内容                                           | 結果 |
| ---------------- | -------------------------------------------------- | ---- |
| sender 検証      | 全5チャネルで不正 sender 拒否テストがある          | □    |
| パストラバーサル | chainId にパストラバーサル文字列を含むテストがある | □    |

---

## 完了条件

- [ ] 初期カバレッジが記録されている
- [ ] 境界値テストが追加されている（null, undefined, 空文字列, スペースのみ, 超長文字列, 特殊文字）
- [ ] エラーパステスト（stop/skip/retry 全パターン）が追加されている
- [ ] 統合テスト（CRUD フロー、実行フロー、Date シリアライズ）が追加されている
- [ ] セキュリティテスト（sender 検証、入力サニタイズ、P41 対策）が追加されている
- [ ] 最終カバレッジが目標（Line 80%+、Branch 60%+、Function 80%+）に近づいている
- [ ] P39 準拠で追加テストに userEvent を使用していない

---

## サブタスク管理

Phase 6 の進行中に検出したサブタスクは以下に記録し、Phase 12 の未タスク検出で処理する：

| #   | サブタスク | 対応Phase | ステータス |
| --- | ---------- | --------- | ---------- |
|     |            |           |            |

---

## タスク100%実行確認

| タスク | 内容                   | 完了 |
| ------ | ---------------------- | ---- |
| 1      | カバレッジ分析         | □    |
| 2      | 境界値テスト追加       | □    |
| 3      | エラーパステスト追加   | □    |
| 4      | 統合テスト追加         | □    |
| 5      | セキュリティテスト追加 | □    |
| 6      | 最終カバレッジ確認     | □    |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] カバレッジレポートが最新の値で更新されている

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/TASK-9D-skill-chain/phase-7-coverage-check.md`
