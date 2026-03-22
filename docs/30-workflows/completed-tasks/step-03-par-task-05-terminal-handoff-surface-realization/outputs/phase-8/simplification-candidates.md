# Phase 8 成果物: 簡素化候補

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 8                                                 |
| 成果物種別 | 簡素化候補一覧                                    |
| 作成日     | 2026-03-22                                        |

---

## 1. 簡素化候補と検討結果

### 候補-1: Chat Edit / Runtime の TerminalHandoffBuilder を 1 クラスに統合

**案**: `ChatEditTerminalHandoffBuilder` と `RuntimeTerminalHandoffBuilder` を廃止し、
`TerminalHandoffBuilder` の `buildForSurface(surfaceType)` オーバーロードで全 surface に対応する。

**検討**:

surface ごとに `contextSummary` フォーマットが異なる点が課題:

| surface       | contextSummary フォーマット                     |
| ------------- | ----------------------------------------------- |
| Chat Edit     | `command=<type> files=<names> workspace=<name>` |
| Runtime Agent | `surface=agent skill=<name>`                    |
| Runtime Skill | `surface=skill skill=<name>`                    |

`buildForSurface(request, surfaceType, reason)` のシグネチャで `surfaceType` を受け取り、内部で switch 分岐すれば、
Runtime Agent / Runtime Skill の 2 surface は単一クラスで対応可能。Chat Edit は request 型が大きく異なるため別オーバーロードとして維持する。

**結論**: **部分採用**

- `buildForSurface(request, surfaceType, reason)` を `TerminalHandoffBuilder` に追加する
- 旧メソッド（`buildForAgentExecution`、`buildForSkillExecution`）は `@deprecated` シムとして残す
- Chat Edit の `buildForChatEdit` は引数型が大きく異なるため、別オーバーロードとして維持する
- 統合の恩恵: contextSummary フォーマット決定ロジックが 1 箇所に集約され、drift しにくくなる（P65 対策）

**採用により解決する問題**:

- contextSummary の surface 間 drift リスクが低下する
- 将来の新 surface 追加時に `surfaceType` に値を追加するだけで対応できる

---

### 候補-2: SkillDocsCapabilityResult を HandoffGuidance のサブセットに変更

**案**: `SkillDocsCapabilityResult` を廃止し、`HandoffGuidance | null` を直接返す型に変更する。

**検討**:

`SkillDocsCapabilityResult` には 3 つのパスがある:

| capability       | HandoffGuidance への変換 | 備考                                                         |
| ---------------- | ------------------------ | ------------------------------------------------------------ |
| integrated-api   | 不要（null を返す）      | LLM が使えるため handoff 不要。provider 情報を返す必要がある |
| guidance-only    | 必要                     | API key 未設定のガイダンス表示                               |
| terminal-handoff | 必要                     | LLM 到達不可の CLI handoff                                   |

`integrated-api` の場合は handoff が不要であるが、「どの provider で実行するか」を示す `provider` フィールドが必要。
`HandoffGuidance | null` では `provider` 情報を運べない。

**結論**: **不採用**

- `capability === "integrated-api"` 時に `provider` フィールドが必要なため、union 型の維持が適切
- `SkillDocsCapabilityResult` を廃止すると integrated-api パスの provider 情報が失われ、実行時の表示が壊れる
- 代替として `toHandoffGuidance()` 純粋関数（候補-1 に付随）で変換する設計が既に採用済み

---

### 候補-3: GuidanceBlock を TerminalHandoffCard の wrapper に変更

**案**: `GuidanceBlock(variant="handoff")` を `TerminalHandoffCard` への薄い wrapper として実装し、
コンポーネントを 1 つに統合する。

**検討**:

`GuidanceBlock` は `error`、`blocked`、`unavailable`、`handoff` の 4 variant を持つ。
`handoff` variant だけを `TerminalHandoffCard` に委譲すると:

- `GuidanceBlock` の switch 文に `case "handoff": return <TerminalHandoffCard ... />` が追加される
- Props 変換が `GuidanceBlock` 内に隠蔽され、呼び出し元から見えなくなる
- 他 variant のロジックと `handoff` のロジックが 1 コンポーネントに混在する

一方、`TerminalHandoffCard` は「terminal コマンドを copy する専用 UX」として設計されており、
`GuidanceBlock(handoff)` は「設定導線 + terminal CTA の複合 UX」である。両者の責務は重なっていない。

**結論**: **不採用**

- `GuidanceBlock` は `error`/`blocked`/`unavailable` variant も持つ汎用コンポーネントであり、独立維持が適切
- wrapper 化すると他 variant との props 型が複雑になり、型安全性が低下する（P46 HTMLAttributes 衝突リスク）
- MN-3 の解決は「Props を HandoffGuidance に統一する」（refactor-boundaries.md 1.3 参照）で十分

---

### 候補-4: Launcher を AppShellHeader に完全インライン化

**案**: Launcher を独立した Concern（C-A）として設計せず、AppShellHeader の内部実装として扱い、
concern 分解を 2 concern（Handoff Card / Consumer Adapter）に削減する。

**検討**:

Launcher の責務は「terminal dock を開閉する button の配置」に限定されており、
AppShellHeader の一部として実装すること自体は技術的に可能。

ただし、以下の理由で独立設計が必要:

- AC-1 で「persistent launcher と shared handoff card の UI 責務定義」が明示的に要求されている
- Launcher は CLI 存在確認（`AccessCapability`）に依存し、Main Process への IPC が必要
- Launcher の `unavailable` 状態（CLI なし）は独立した state machine を持つ
- AppShellHeader にインライン化すると、Launcher の状態管理ロジックが AppShellHeader に混入する

**結論**: **不採用**

- AC-1 が独立した launcher 設計を明示的に要求している
- state machine の責務が AppShellHeader に混入すると単一責務原則（SRP）が崩れる
- 将来の Launcher 挙動変更（persistent session 表示等）で AppShellHeader の大規模修正が必要になる

---

## 2. 採用・不採用サマリー

| 候補   | 内容                                                   | 結論     | 理由の要約                                                      |
| ------ | ------------------------------------------------------ | -------- | --------------------------------------------------------------- |
| 候補-1 | Chat Edit / Runtime TerminalHandoffBuilder の統合      | 部分採用 | buildForSurface() 追加、Chat Edit は別オーバーロード維持        |
| 候補-2 | SkillDocsCapabilityResult → HandoffGuidance 型変更     | 不採用   | integrated-api の provider 情報が失われ、実行時表示が壊れる     |
| 候補-3 | GuidanceBlock を TerminalHandoffCard の wrapper に変更 | 不採用   | 責務が異なる独立コンポーネント。wrapper 化で他 variant が複雑化 |
| 候補-4 | Launcher を AppShellHeader にインライン化              | 不採用   | AC-1 の明示的要件、SRP 違反、将来の変更コスト増大               |

---

## 3. 採用後の残存複雑性と受容判断

### 残存複雑性の詳細

**複雑性-1: TerminalHandoffBuilder に 2 種のオーバーロード共存**

`buildForSurface()` と `buildForChatEdit()` が共存する。Chat Edit と Runtime で request 型が異なるため統一できない。

- `buildForSurface(request: AgentRequest | SkillRequest, surfaceType: "agent" | "skill", reason: string)`
- `buildForChatEdit(request: ChatEditRequest, reason: string)`

**受容理由**: Chat Edit の `ChatEditRequest` は `AgentRequest | SkillRequest` と直交する型であり、統一するとユニオン型が広がり過ぎて型安全性が低下する。2 オーバーロード共存が最もシンプルなトレードオフ。

**複雑性-2: GuidanceBlock と TerminalHandoffCard の 2 コンポーネント並存**

使い分けルール（refactor-boundaries.md § 1.3 のテーブル）で明示しているため、開発者が混乱しにくい。
判定ロジックのコードスニペットも同テーブルに付属している。

**受容理由**: 両コンポーネントの UX 目的が異なる（copy UX vs 設定導線）ため、統合すると one component が many variants を担当する責務過多になる。

**複雑性-3: toHandoffGuidance() の null 返却**

`integrated-api` 時は `null` を返すため、呼び出し元で null チェックが必要。

```typescript
const guidance = toHandoffGuidance(skillDocsResult);
if (guidance !== null) {
  // TerminalHandoffCard を表示
}
```

**受容理由**: `null` 返却は「handoff 不要」を型で明示する設計であり、呼び出し元の分岐が明確になる。`HandoffGuidance | null` という型は意図を正確に表現している。省略した場合（常に HandoffGuidance を返す設計）は `integrated-api` で空 HandoffGuidance を作るという不自然な実装になる。

### 受容の総括

上記 3 点はいずれも「複雑さを縮減すると別の問題が発生する」トレードオフの結果。
Phase 3 設計レビューで PASS 判定を得た設計からの逸脱を最小化する。
残存複雑性のドキュメント化（本ファイル）により、将来の担当者が判断根拠を追跡できる。

---

## 4. 将来の簡素化パス（現在は実施しない）

### 簡素化パス-A: ChatEditRequest と AgentRequest | SkillRequest の型統一

将来的に Chat Edit / Runtime の request 型が収束した場合、`buildForSurface()` に Chat Edit も統合できる。
現時点では型が大きく異なるため、この簡素化は Phase 5 以降の別タスクとして検討する。

### 簡素化パス-B: TerminalHandoffCard の GuidanceBlock 吸収

将来的に GuidanceBlock の `handoff` variant が事実上 TerminalHandoffCard と同一の UX になった場合、
コンポーネント統合を再検討できる。現時点では UX 目的が異なるため、不採用のまま維持する。

### 簡素化パス-C: toHandoffGuidance() の Result 型化

現在は `HandoffGuidance | null` を返すが、将来的にエラー情報（配置理由等）が必要になった場合、
`Result<HandoffGuidance, HandoffError>` 型に変更することを検討できる。
現時点では単純な null で十分。
