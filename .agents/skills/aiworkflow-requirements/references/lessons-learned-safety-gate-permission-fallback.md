# Lessons Learned（教訓集） / SafetyGate・Permission・Fallback 実装

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: SafetyGate / PermissionStore / Fallback 実装 domain lessons

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 対象タスク | UT-06-005（abort/skip/retry/timeout フォールバック）, TASK-SKILL-LIFECYCLE-08 仕様作成 |
| 作成日   | 2026-03-17 |
| 関連PitfallID | P62, P63 |

---

## TASK-SKILL-LIFECYCLE-08 / UT-06-005 実装知見（2026-03-17）

### 苦戦箇所1: PermissionStore の DI スコープ問題（P62）

| 項目 | 内容 |
| --- | --- |
| 課題 | `apps/desktop/src/main/ipc/index.ts` で PermissionStore が `track("registerPermissionStoreHandlers")` のクロージャ内部でインスタンス化されていたため、SafetyGate がそのインスタンスにアクセスできなかった。SafetyGate の evaluate() が PermissionStore のデータを参照できず、常にデフォルト判定になる |
| 再発条件 | Graceful Degradation パターン（P54）で `track()` クロージャを使う場合に、クロージャ間で共有が必要なインスタンスをスコープ内でインスタンス化する |
| 解決策 | PermissionStore を `track()` クロージャの外（上位スコープ）に抽出し、PermissionStoreHandlers と SafetyGate の両方から共有参照可能にした |
| 標準ルール | `track()` クロージャを使う場合、複数クロージャ間で共有が必要なインスタンスはスコープ外に抽出する。P34（遅延初期化 DI）と同じく、依存オブジェクトのライフサイクルを事前に設計する |
| 関連パターン | P34（遅延初期化 DI パターン選択）、P54（safeRegister パターン不適合）、P60（createAuthModeService のスコープ制限）|
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

```typescript
// ❌ クロージャ内でインスタンス化 → SafetyGate から参照不能
registerAllIpcHandlers() {
  track("registerPermissionStoreHandlers", () => {
    const permissionStore = new PermissionStore(); // ← スコープ内でインスタンス化
    registerPermissionStoreHandlers(permissionStore);
  });
  // SafetyGate はこの permissionStore にアクセスできない
  const safetyGate = new DefaultSafetyGate(permissionStore); // ← 参照不能
}

// ✅ 上位スコープに抽出 → 複数クロージャから共有参照
registerAllIpcHandlers() {
  const permissionStore = new PermissionStore(); // ← 上位スコープ
  track("registerPermissionStoreHandlers", () => {
    registerPermissionStoreHandlers(permissionStore);
  });
  track("registerSafetyGateHandlers", () => {
    const safetyGate = new DefaultSafetyGate(permissionStore); // ← 共有参照
    registerSafetyGateHandlers(safetyGate);
  });
}
```

---

### 苦戦箇所2: SafetyGate metadataProvider の抽象化境界（P63）

| 項目 | 内容 |
| --- | --- |
| 課題 | DefaultSafetyGate のコンストラクタに `metadataProvider: { getRequiredTools, getAccessPaths }` を渡す設計にしたが、実行時にスキルのメタデータをどこから取得するかが未定義だった。暫定的に空配列を返すスタブ実装（`async () => []`）を入れたが、実スキル実行時にはスキルマニフェストからの動的取得が必要 |
| 再発条件 | インターフェース設計時にデータフローの「ソース（どのモジュールがデータを持つか）」を設計ドキュメントに明示しない場合 |
| 解決策 | 現時点ではスタブ実装を維持し、TASK-SKILL-LIFECYCLE-08 実装フェーズでスキルマニフェストとの統合を行う設計とした。スタブ判断の根拠を Phase 2 設計ドキュメントに明記し、未タスク化した |
| 標準ルール | インターフェースの設計時に「このメソッドのデータソースはどのモジュールか」をデータフロー図またはコメントで明記する。実装時にスタブが残る場合は設計ドキュメントに判断根拠を記録して未タスク化する |
| 関連パターン | P34（遅延初期化 DI）、S-PF-2（revokeSessionEntries スタブ実装の設計判断）|
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

```typescript
// ❌ metadataProvider の実装が未定義のまま設計進行
interface MetadataProvider {
  getRequiredTools(skillName: string): Promise<string[]>; // ← どこから取得？未定義
  getAccessPaths(skillName: string): Promise<string[]>;
}

// ✅ 設計時にデータソースを明記
// TODO(TASK-SKILL-LIFECYCLE-08-実装): SkillManifestService.getManifest() から取得
// スタブ実装（空配列返却）を一時的に使用。本格実装は未タスク化済み
const metadataProvider: MetadataProvider = {
  getRequiredTools: async (_skillName) => [], // スタブ: SkillManifest統合で置換予定
  getAccessPaths: async (_skillName) => [],   // スタブ: SkillManifest統合で置換予定
};
```

---

### 苦戦箇所3: フォールバック制御の境界条件テスト設計

| 項目 | 内容 |
| --- | --- |
| 課題 | abort/skip/retry/timeout の4パターン × 正常/異常の組み合わせが多く、テストケースの網羅性確保が困難だった。23テストに絞り込む判断基準が明確でなかった |
| 再発条件 | フォールバック戦略が4種類以上ある場合に、全組み合わせを網羅しようとして最初からテスト数が膨張する |
| 解決策 | 各フォールバック戦略の代表的なケース（成功/失敗/タイムアウト）に限定。revokeSessionEntries は独立したテストグループとして分離することで、テスト間の依存を排除した |
| 標準ルール | フォールバック戦略のテストは「各戦略の最重要パス（成功/失敗）」+「共通インフラ（revokeSessionEntries等）の独立テスト」の2層構造で設計する。全組み合わせは Phase 6（テスト拡充）で対応する |
| 関連パターン | S-PF-1（既実装コードの4ステップ abort フロー発見遅延）、S-PF-2（revokeSessionEntries スタブ実装）|
| 関連タスク | UT-06-005 |

---

### 同種課題の5分解決カード（DI スコープ + 抽象化境界 + フォールバックテスト）

| 症状 | 原因 | 最短手順 |
| --- | --- | --- |
| SafetyGate が PermissionStore のデータを参照できない | DI スコープがクロージャ内に閉じている（P62） | クロージャ外の上位スコープでインスタンス化し、複数クロージャに渡す |
| metadataProvider の実装先が不明で設計が止まる | データフローの「ソース」を設計時に定義していない（P63） | スタブ実装を選択し、判断根拠を Phase 2 に記録して未タスク化する |
| フォールバックテストが膨張して管理不能 | 全組み合わせ網羅を Phase 4 で試みる | 「代表パス × 戦略数」+ 独立インフラテストの2層構造で分割する |
| revokeSessionEntries がセッション別フィルタリングに対応していない | 型定義（AllowedToolEntry）の拡張がスコープ外 | スタブ実装（全クリア）を選択し、本格実装を未タスク化する（S-PF-2 準拠）|
| `track()` クロージャで依存関係が複数になる | ライフサイクル設計なしでクロージャを使用 | 依存オブジェクトのライフサイクルを事前に設計し、共有インスタンスは最も外側のスコープに置く |

---

### 関連PitfallID（06-known-pitfalls.md に追記済み）

| ID | タイトル | 追記先 |
| --- | --- | --- |
| P62 | PermissionStore の DI スコープ問題（track クロージャ間共有インスタンス） | `06-known-pitfalls.md` |
| P63 | SafetyGate metadataProvider のデータソース未定義による抽象化境界失敗 | `06-known-pitfalls.md` |
