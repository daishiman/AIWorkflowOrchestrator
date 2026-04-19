# Phase Template Core

## 対象

Phase 1、Phase 2、Phase 3。

---

## 成果物配置ルール（重要）

**成果物には2種類あり、配置先が異なる:**

| 成果物タイプ       | 配置先                         | Phase         |
| ------------------ | ------------------------------ | ------------- |
| ドキュメント成果物 | `outputs/phase-N/`             | 全Phase       |
| コード成果物       | プロジェクトの該当ディレクトリ | Phase 4, 5, 6 |

**コード成果物（テストコード、実装コード）は `outputs/` 配下に配置しない。**
必ず `packages/*/src/` や `apps/*/src/` に配置すること。

---

## 変数一覧

テンプレートで使用する変数の定義：

| 変数名              | 説明                   | 例                                 |
| ------------------- | ---------------------- | ---------------------------------- |
| `{{FEATURE_NAME}}`  | 機能名（ケバブケース） | `search-replace-ui`                |
| `{{PHASE_NUMBER}}`  | Phase番号（1-13）      | `4`                                |
| `{{PHASE_NAME}}`    | Phase名称              | `テスト作成`                       |
| `{{CREATED_DATE}}`  | 作成日（ISO形式）      | `2026-01-06`                       |
| `{{PREV_PHASE}}`    | 前のPhase番号          | `3`                                |
| `{{NEXT_PHASE}}`    | 次のPhase番号          | `5`                                |
| `{{TASK_NAME}}`     | タスク名               | `search-replace-ui-implementation` |
| `{{ISO_TIMESTAMP}}` | ISO8601タイムスタンプ  | `2026-01-06T10:00:00Z`             |

---

## 共通ルール

1. タイトルは `# Phase N: ...` を維持する。
2. `## メタ情報`、`## 目的`、`## 実行タスク`、`## 参照資料`、`## 成果物`、`## 完了条件` を省略しない。
3. Phase 1〜11 では `## 統合テスト連携` を必ず残す。
4. `完了条件` と `タスク100%実行確認` はチェックリストで書く。
5. outputs と phase 本文の名称は 1:1 に揃える。

---

## 共通骨格

```md
# Phase {{N}}: {{PHASE_NAME}}

## メタ情報
## 目的
## 実行タスク
## 参照資料
## 実行手順
## 統合テスト連携
## 多角的チェック観点（AIが判断）
## サブタスク管理
## 成果物
## 完了条件
## タスク100%実行確認【必須】
## 次Phase
```

## Phase 1 のポイント

- **Step 0: P50チェック（必須）** — Phase 1 開始前に対象ファイルの実装状態を `git log` と `grep` で確認し、既実装コードの重複作成を防止する（詳細: [phase-template-phase1.md](phase-template-phase1.md)）。
- inventory と source scope の差分を固定する。
- acceptance criteria を番号付きで定義し、**本文に AC-1, AC-2... を列挙する**。
- `spec-extraction-map.md` で aiworkflow-requirements 正本と current code anchor の対応を固定する。
- Phase 1-3 完了前に Phase 4 へ進まない gate を書く。

### chain task の scope セクション必須フィールド（[CANCEL-003-FB-3]）

複数タスクが連携する cancel chain などの chain task では、各タスクの `scope` セクションに以下のフィールドを必ず明記する。

| フィールド | 必須 | 説明 |
| --- | --- | --- |
| `chain_position` | ✅ | chain における位置（例: `"1/3"`, `"2/3"`, `"3/3"`） |
| `chain_id` | ✅ | chain を一意に識別する ID（例: `"CANCEL-CHAIN-001"`） |
| `chain_completion_definition` | ✅ | このタスクが完了した時点での chain 全体の完了定義（何が達成されれば OK か） |
| `depends_on_chain_tasks` | 条件付 | 前タスクの成果物のうち、本タスクが依存するものを列挙 |
| `provides_to_chain_tasks` | 条件付 | 本タスクが後タスクへ引き渡す成果物を列挙 |

**記載例（Phase 1 scope セクション内）:**

```yaml
chain_position: "2/3"
chain_id: "SW-CANCEL-CHAIN-001"
chain_completion_definition: |
  このタスクが完了 = キャンセルボタンの UI が表示され、クリックイベントが IPC に到達する。
  chain 全体の完了は TASK-SW-CANCEL-003 の Phase 12 close-out をもって判定する。
depends_on_chain_tasks:
  - TASK-SW-CANCEL-001: cancelToken 型定義（packages/shared/src/types/cancel.ts）
provides_to_chain_tasks:
  - TASK-SW-CANCEL-003: cancelHandler IPC チャンネル（cancel:request）
```

- chain の途中タスクで `scope` セクションにこれらが欠落すると、後続タスクの依存関係が曖昧になり Phase 1 でリワークが発生する
- 単独タスク（chain でない）では不要フィールドは省略してよい

### 画面遷移 / handoff 改修タスクの追加ルール

- Phase 1 で **実在する state 名** をコードから確定してから書く。`previousView` / `sourceView` / `isExecutionComplete` のような placeholder を spec に書かない。
- navigation state と feature state を分離して記録する。
  - 例: `currentSkillName` / `viewHistory` は navigation、`selectedSkillName` / `skillExecutionStatus` は feature state。
- 「戻る導線」は既存 `goBack()` / `viewHistory` / 既存 handoff pattern で足りるかを先に確認し、新規 state は最後に検討する。

## Phase 2 のポイント

- concern ごとの target topology を table 化する。
- lane 数は 3 以下に固定する。
- validation matrix を command 単位で定義する。
- DI 境界の型配置判断を明示する（下記フロー参照）。
- 画面遷移 / handoff 改修では、Phase 1 で確定した **既存 state 名** と **既存 route pattern** をそのまま設計へ持ち込む。未定義 state を設計本文で発明しない。

### concern 数による設計書分割基準（TASK-SKILL-LIFECYCLE-08 知見）

| concern 数 | 推奨構成 |
| --- | --- |
| 1〜2 concern | 単一 `phase-2-design.md` に全て記述 |
| 3〜4 concern | concern ごとにセクション分割（同一ファイル内） |
| 5+ concern | サブタスク分割を検討（`phase-2-design-{concern}.md` 形式） |

- 分割すると Phase 3/10 の指摘が concern 単位で追跡しやすくなる
- 分割後は各設計書に「他 concern との依存境界」を明示する

### DI 境界の型配置判断フロー（Phase 2 設計時に確認）

| 条件 | 配置先 | 例 |
| --- | --- | --- |
| DI 依存型を1つの具象クラスのみで使用 | 具象クラスファイル内に定義 | `DefaultSafetyGateDeps` → `default-safety-gate.ts` |
| DI 依存型を複数の具象クラスで共有 | Port インターフェースと同階層に配置 | `ServiceDeps` → `ports/` ディレクトリ |
| DI 依存型がレイヤー境界をまたぐ | `packages/shared/` に配置 | Main/Renderer 両方で参照する型 |

### IPC ハンドラ設計時の確認項目

- IPC ハンドラの依存先が Port/Interface であること（具象クラスを直接参照しない）
- IPC レスポンス形式（`{ success, error }` ラッパー使用の有無）を設計時点で明示的に決定する
- **[RT-04知見] 並行リクエスト防止機構（IPC二重送信防止）**: IPC 呼び出しを含む Hook/Component では、同一チャンネルへの並行送信を防止する機構を設計項目として明示すること。具体的には `isSubmittingRef`（`useRef<boolean>`）などの ref ガードを設計書に記載し、テストケースに「保存中は再送信不可」を含める。
  - 根拠: TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001 Phase 6 TC-24 にて `isSubmittingRef` の追加が必要になった（Phase 2 設計での漏れ）
  - 適用条件: ユーザー操作（ボタンクリック等）から IPC を発火する Hook / Component 全般

### IPC 4層整合性チェック（デッドチャンネル防止）

新規 IPC チャンネルを追加する場合、以下の4層が全て整合していることを設計時に確認する:

| 層 | 確認内容 | ファイル例 |
| --- | --- | --- |
| 1. 定数定義 | `IPC_CHANNELS` に新チャンネルが追加されているか | `packages/shared/src/ipc/channels.ts` |
| 2. ホワイトリスト | Preload の `allowedChannels` / `validChannels` に登録されているか | `preload/index.ts` |
| 3. ハンドラ登録 | `ipcMain.handle()` が対応するチャンネルを処理しているか | `main/ipc/*.ts` |
| 4. Preload API | `contextBridge.exposeInMainWorld()` で公開され、Renderer から呼び出せる形になっているか | `preload/skill-api.ts` 等 |

- 設計書に4層の対応表を記載する（Phase 2 の成果物として）
- 既存チャンネルを変更する場合も4層全てを追跡する

### GAP ID参照の整合確認（P64対策）

- 上流の GAP ID 正本テーブル（ui-ux-diagrams.md 等）を確認し、設計で使用する GAP ID が正本と一致するか検証する
- 正本テーブルが存在しない場合は、Phase 2 の成果物として GAP ID 正本テーブルを上流文書に追加する

### Factory パターン設計時の型互換性検証 decision tree（Phase 2 で下書き → Phase 3 で確認）

Factory パターンや依存注入を含む設計タスクでは、Phase 2 設計時に以下の decision tree で型配置方針を決定し、**型互換性検証テーブルの下書き**を成果物に含める。Phase 3 でその検証結果を記録する（詳細は Phase 3 セクション参照）。

```
Factory が返す型 T を使用する注入先 Port/Interface が存在するか？
  ├─ NO  → 型 T は Factory 実装ファイル内に閉じる（`packages/shared/` 不要）
  └─ YES → T は注入先 Interface を満たすか（implements / 構造的互換）？
              ├─ YES → Factory ファイルと注入先が同一パッケージか？
              │          ├─ YES → 現在のパッケージ内に型定義を置く
              │          └─ NO  → `packages/shared/` への型集約を検討（未タスク候補）
              └─ NO  → Phase 2 MAJOR 候補: 型を修正するか注入先 Interface を調整する
```

**Phase 2 成果物として記載する型互換性検証テーブル（下書き）:**

| Factory | 返す具象型 | 注入先 Interface | 互換性（Phase 3 で確認） |
| ------- | ---------- | ---------------- | ------------------------ |
| `{{FactoryName}}` | `{{ConcreteClass}}` | `{{PortInterface}}` | TBD |

- 同名インターフェースが複数パッケージに存在する場合は `grep -rn "interface {{TypeName}}" packages/ apps/` で全定義箇所を確認する
- 互換性検証は Phase 3 の「同名インターフェース型ドリフト検出」チェックで最終確定する

### UI コンポーネントテスト設計時の Props vs internal state 確認（[VSCPKR-03] 対策）

UI コンポーネントを含むタスクの Phase 4 テスト設計前に、テストで操作する入力媒体を確認する。

| チェック観点 | 確認内容 |
| --- | --- |
| コンポーネントのモード管理 | モード切替が内部 `useState`（internal state）か、親から渡す props（external prop）か |
| テスト操作方法の選択 | `fireEvent.click` でトグルするか、props を変えて再レンダリングするか |
| Phase 4 仕様書への記載 | 「テスト操作対象は internal state か external prop か」を1行で明記する |

- **根拠**: TASK-CRON-CUSTOM-VALIDATION-001 Phase 4 で `VisualCronPicker` の `isAdvancedMode` が内部 state であることを Phase 2 で確認せず、TDD RED のテスト操作が誤った前提で書かれた
- **適用条件**: UI コンポーネントで複数のモード・状態を持つ場合（例: advanced/simple トグル、ウィザードステップ）

### インターフェース定義にはモック実装雛型を含めること（Phase 4テスト作成高速化）

新規インターフェース（`IEncoder`、`ILLMProvider` 等）を Phase 2 設計書に定義する場合、**テスト用モック実装例** を同一設計書内に雛型として記載する。

**理由**: Phase 4 でテストを作成する際、モック実装を一から書くのは手間がかかる。Phase 2 設計時にインターフェースの意図が最も明確なため、その時点でモック雛型を残すと Phase 4 の作業時間が短縮される。

**テスト用モック実装例テンプレート（Phase 2 設計書に含める）:**

```typescript
// テスト用モック実装例（Phase 4 で vi.fn() に置き換えて使用）
export class Mock{{InterfaceName}} implements {{InterfaceName}} {
  // 各メソッドをスタブ実装
  {{method1}}({{args}}): {{returnType}} {
    return {{defaultValue}};
  }

  // 戻り値を制御するヘルパー（必要に応じて）
  private _{{method1}}ReturnValue: {{returnType}} = {{defaultValue}};
  set{{Method1}}ReturnValue(value: {{returnType}}) {
    this._{{method1}}ReturnValue = value;
  }
}
```

**適用条件**: 新規インターフェースを Phase 2 で定義する場合、特に以下のケース:
- 外部サービス・LLM・Encoder 等の IO を抽象化するインターフェース
- テストで差し替えが必要な依存クラスの Port 定義
- `IEncoder`、`ILLMProvider`、`IEmbeddingService` のようなサービス抽象化

**根拠**: UNASSIGNED-EMB-005-late-chunking Phase 12 フィードバック「Phase 2 の設計書にモック実装の雛型を含めるとPhase 4テスト作成がスムーズになる」

## Phase 3 のポイント

- PASS / MINOR / MAJOR の戻り先を明示する。
- simpler alternative を検討した結果を記録する。
- Phase 4 開始条件と Phase 13 blocked 条件を残す。

### 上流文書の複数図整合チェック

- 上流文書（ui-ux-diagrams.md 等）に複数の状態遷移図/コンポーネント図がある場合、全図間の整合性をチェックする
- 特に同一概念（状態遷移、コンポーネント名）が異なる図で矛盾していないか確認する

### MINOR 追跡テーブル（gate-decision.md 用）

Phase 3 で MINOR 判定された指摘は、以下のテーブルで追跡計画を明示する。

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| -------- | -------- | ------------- | ------------- | ---- |
| TECH-M-01 | ... | Phase 5 | Phase 9/10 | ... |

- 「解決予定Phase」を Phase 3 時点で決定し、追跡の見通しを立てる
- 「解決確認Phase」は Phase 9（品質検証）または Phase 10（最終レビュー）で記録する

### 同名インターフェース型ドリフト検出（Factory パターン適用時）

Factory パターンや依存注入で複数レイヤーに同名インターフェースが存在する場合、型ドリフトが発生しやすい。Phase 3 設計レビューで以下を確認する。

| チェック観点 | 確認内容 | 検出コマンド例 |
| ---- | ---- | ---- |
| 同名インターフェースの多重定義 | 例: `ILLMClient` が `packages/shared/` と `apps/desktop/src/` に両方存在しないか | `grep -rn "interface ILLMClient\|type ILLMClient" packages/ apps/` |
| Factory の生成型と注入先の型互換性 | Factory が返す具象クラスが、注入先の Port/Interface を満たすか | 設計書に型チェック表を記載 |
| 依存モジュール間の型バージョン不一致 | `packages/shared/` の型を別パッケージが異なるバージョンで定義していないか | `pnpm typecheck` でエラー確認 |

**型互換性検証テーブル**（Factory パターン設計時に記載）:

| Factory | 返す型 | 注入先インターフェース | 互換性 |
| ------- | ------ | ---------------------- | ------ |
| `{{FactoryName}}` | `{{ConcreteClass}}` | `{{PortInterface}}` | ✅ / ❌ |

- 非互換が検出された場合は MAJOR 判定とし、Phase 2 へ戻る
- 同名インターフェースが複数箇所に定義されている場合は `packages/shared/` への統合を検討し、未タスクとして記録する

### IPC 変更時の consumer 契約確認（IPC ハンドラー変更がある場合のみ）

- [ ] `ipcMain.handle` の戻り値型を変更する場合、preload 層での type guard による差分吸収が可能か確認したか
- [ ] Renderer consumer（コンポーネント）が現行の戻り値型を直接 consume しているか grep で確認したか
- [ ] Fire-and-forget パターンの場合、即時 ack 型（`{ accepted: true, planId }`）を preload で `IpcResult<T>` に変換しているか確認したか
- [ ] consumer 契約が変わる場合、完全整合を Phase 12 の follow-up 未タスクとして積むことを決定したか
