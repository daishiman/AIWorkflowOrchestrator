# サービスインターフェース確定書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書       | Phase 5 - タスク2 成果物                                                                                                                                                                             |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                                                                                                                                              |
| 作成日     | 2026-03-17                                                                                                                                                                                           |
| 依存成果物 | `outputs/phase-2/publishing-metadata-design.md`、`outputs/phase-2/compatibility-check-design.md`、`outputs/phase-2/distribution-operations-design.md`、`outputs/phase-2/publish-readiness-design.md` |
| 参照型定義 | `outputs/phase-5/type-definitions.md`                                                                                                                                                                |

---

## 目的

Phase 2 で設計した 4 つのサービスインターフェース（SkillRegistryService / SkillDistributionService / PublishReadinessChecker / CompatibilityChecker）を確定し、DI パターンへの適合性（P34: Setter Injection 対応、P61: インターフェース依存）を明記する。各インターフェースは Port 層に配置し、IPC ハンドラ登録関数の引数型として使用することで、具象クラスへの直接依存を排除する。

---

## 1. SkillRegistryService インターフェース

```typescript
/**
 * スキルのライフサイクル管理（登録・更新・非推奨化・削除）を担う Port インターフェース。
 * P61 準拠: IPC ハンドラ登録関数の引数型はこのインターフェース（具象クラスではない）。
 *
 * 配置先: packages/shared/src/types/skill-registry.ts
 * 具象クラス: apps/desktop/src/main/services/registry/DefaultSkillRegistryService.ts
 */
interface SkillRegistryService {
  /**
   * スキルを Skill Center に新規登録する。
   *
   * @param metadata - 公開メタデータ（SkillPublishingMetadata）。visibility に応じた全必須フィールドが揃っていること
   * @returns 登録結果。成功時は skillId を含む RegisterResult
   *
   * 事前条件:
   * - metadata.version が semver 形式に準拠していること
   * - metadata.visibility が "team" 以上の場合、author/tags/teamId が非空文字列であること（P42準拠3段バリデーション）
   * - metadata.visibility が "public" の場合、license/readme/changelog/minAppVersion が揃っていること
   */
  register(metadata: SkillPublishingMetadata): Promise<RegisterResult>;

  /**
   * 既存スキルのメタデータを更新する。
   *
   * @param skillId    - 更新対象スキルの ID（UUID v4 形式）
   * @param newMetadata - 新しい公開メタデータ
   * @returns 更新結果。compatibilityLevel と requiresManualApproval を含む
   *
   * 事後条件（M-AC-2 後方互換保持世代数対応）:
   * - suggestedBump === "major" の場合、旧2世代（public）または旧1世代（team）を非推奨マークする
   * - requiresManualApproval === true の場合、管理者承認が完了するまで公開状態に遷移しない
   */
  update(
    skillId: string,
    newMetadata: SkillPublishingMetadata,
  ): Promise<UpdateResult>;

  /**
   * スキルを非推奨（deprecated）状態に移行する。
   *
   * @param skillId - 非推奨化対象スキルの ID（UUID v4 形式）
   * @param notice  - 非推奨化通知。reason/gracePeriodDays/alternativeSkillId を含む
   * @returns void（成功時）または例外（失敗時）
   *
   * 事後条件:
   * - metadata.visibility が "team" に設定される（StateChart S_PUBLIC → S_DEPRECATED）
   * - gracePeriodDays（30日固定）経過後に作成者が明示的削除操作を実行可能になる
   */
  deprecate(skillId: string, notice: DeprecationNotice): Promise<void>;

  /**
   * スキルを Skill Center から完全削除する。
   *
   * @param skillId - 削除対象スキルの ID（UUID v4 形式）
   * @returns void（成功時）または例外（失敗時）
   *
   * 事前条件:
   * - deprecated 状態に移行してから 30 日以上経過していること
   * - 作成者（requestorRole === "author"）が削除確認ダイアログを承認していること
   */
  remove(skillId: string): Promise<void>;

  /**
   * 指定スキルに依存しているスキルの ID 一覧を返す。
   *
   * @param skillId - 被依存スキルの ID
   * @returns 依存元スキル ID の配列（0件の場合は空配列）
   */
  getDependents(skillId: string): Promise<string[]>;
}
```

**補助型定義（packages/shared/src/types/skill-registry.ts に同梱）**:

```typescript
interface RegisterResult {
  success: boolean;
  skillId: string;
  errors?: string[];
}

interface UpdateResult {
  success: boolean;
  /** 更新内容が管理者承認を要求するか（M-AC-2 後方互換保持世代数管理用） */
  requiresManualApproval: boolean;
  compatibilityLevel: CompatibilityLevel;
  affectedUserCount?: number;
}

interface DeprecationNotice {
  /** 非推奨化の理由（1文字以上500文字以下の非空文字列） */
  reason: string;
  /** 猶予期間（日数）。現在は 30 固定 */
  gracePeriodDays: 30;
  /** 代替スキルの ID（任意）。存在する場合は UUID v4 形式 */
  alternativeSkillId?: string;
}
```

**配置先**: `packages/shared/src/types/skill-registry.ts`

**DI 適合性（P61 準拠）**:

```typescript
// 正しい設計: IPC ハンドラ登録関数の引数型はインターフェース
export function registerSkillRegistryHandlers(
  skillRegistryService: SkillRegistryService, // インターフェース型
): void {
  /* ... */
}

// 禁止（P61 違反）
// export function registerSkillRegistryHandlers(
//   skillRegistryService: DefaultSkillRegistryService, // 具象クラス型 → 禁止
// ): void { /* ... */ }
```

**モック可能性**: `SkillRegistryService` がインターフェース型であるため、テストでは以下のようにモック可能:

```typescript
const mockSkillRegistryService: SkillRegistryService = {
  register: vi.fn(),
  update: vi.fn(),
  deprecate: vi.fn(),
  remove: vi.fn(),
  getDependents: vi.fn(),
};
```

---

## 2. SkillDistributionService インターフェース

```typescript
/**
 * スキルの配布操作（import / export / fork / share）を担う Port インターフェース。
 * P61 準拠: IPC ハンドラ登録関数の引数型はこのインターフェース（具象クラスではない）。
 *
 * 配置先: packages/shared/src/types/skill-distribution.ts
 * 具象クラス: apps/desktop/src/main/services/distribution/DefaultSkillDistributionService.ts
 */
interface SkillDistributionService {
  /**
   * 外部 URL からスキルをインポートする。
   *
   * @param sourceUrl - インポート元 URL（https:// または http:// 形式）。P42準拠バリデーション必須
   * @param options   - インポートオプション
   * @returns インポート結果。skillId / importedAt / resolvedDependencies を含む
   */
  importSkill(sourceUrl: string, options: ImportOptions): Promise<ImportResult>;

  /**
   * スキルを .skill パッケージファイルとしてエクスポートする。
   *
   * @param skillId - エクスポート対象スキルの ID（UUID v4 形式）。P42準拠バリデーション必須
   * @param options - エクスポートオプション
   * @returns エクスポート結果。filePath（.skill 拡張子）と metadata を含む
   */
  exportSkill(skillId: string, options: ExportOptions): Promise<ExportPackage>;

  /**
   * スキルをフォーク（複製）する。
   *
   * @param skillId - フォーク元スキルの ID（UUID v4 形式）
   * @param newName - フォーク後のスキル名（P42準拠: 1文字以上100文字以下の非空文字列）
   * @returns フォーク結果。newSkillId（UUID v4）と parentRef を含む
   */
  forkSkill(skillId: string, newName: string): Promise<ForkResult>;

  /**
   * スキルをチームメンバーと共有する一時リンクを生成する。
   *
   * @param skillId - 共有対象スキルの ID（UUID v4 形式）
   * @param teamId  - 共有先チームの ID（P42準拠バリデーション必須）
   * @param options - 共有オプション（有効期限 expireAt を含む）
   * @returns 共有リンク。url / token（有効期限付き JWT）/ expireAt を含む
   */
  shareSkill(
    skillId: string,
    teamId: string,
    options: ShareOptions,
  ): Promise<ShareLink>;
}
```

**補助型定義（packages/shared/src/types/skill-distribution.ts に同梱）**:

```typescript
interface ImportOptions {
  /**
   * 依存スキルを自動解決するか。
   * false の場合は依存なしでインポートし警告ラベルを付与する。
   */
  autoResolveDependencies: boolean;
  /**
   * インポート先ディレクトリ（省略時はデフォルトスキルディレクトリを使用）。
   * P42 準拠: 指定する場合は非空文字列かつ trim 後も非空であること。
   */
  targetDirectory?: string;
}

interface ImportResult {
  /** インポートされたスキルの ID（UUID v4） */
  skillId: string;
  /** インポート完了日時（ISO 8601 形式） */
  importedAt: string;
  /**
   * 自動解決した依存スキル ID の配列。
   * autoResolveDependencies=false の場合は空配列。
   */
  resolvedDependencies: string[];
}

interface ExportOptions {
  /** メタデータ（name, description, tags 等）をパッケージに含めるか */
  includeMetadata: boolean;
  /** 出力フォーマット。現在は ".skill" 形式（zip アーカイブ）のみ対応 */
  format: "skill-package";
}

interface ExportPackage {
  /** エクスポートされたファイルパス（.skill 拡張子） */
  filePath: string;
  /** パッケージに含まれるメタデータ */
  metadata: SkillPublishingMetadata;
}

interface ForkResult {
  /** フォークされたスキルの ID（UUID v4） */
  newSkillId: string;
  /** フォーク元スキルの ID（UUID v4） */
  parentRef: string;
}

interface ShareOptions {
  /** 共有リンクの有効期限 */
  expireAt: Date;
}

interface ShareLink {
  /** 共有 URL */
  url: string;
  /** 有効期限付き JWT トークン */
  token: string;
  /** 有効期限 */
  expireAt: Date;
}
```

**配置先**: `packages/shared/src/types/skill-distribution.ts`

**DI 適合性（P61 準拠）**: IPC ハンドラ登録関数の引数型は `SkillDistributionService` インターフェースを使用する（具象クラス `DefaultSkillDistributionService` を引数に取ることは禁止）。

**モック可能性**: インターフェース型のため vi.fn() でのスタブ差し替えが可能。

---

## 3. PublishReadinessChecker インターフェース

```typescript
/**
 * 公開可否判定ロジックのインターフェース（Port）。
 * IPC ハンドラ登録関数の引数型として使用する（P61準拠）。
 *
 * 配置先: packages/shared/src/types/publish-eligibility.ts
 * 具象クラス: apps/desktop/src/main/services/publish/DefaultPublishReadinessChecker.ts
 */
interface PublishReadinessChecker {
  /**
   * 安全性ゲート結果と観測指標を基に公開可否を判定する。
   *
   * @param safetyGate - Task-06 出力から変換した安全性ゲート入力型
   * @param metrics    - Task-07 出力から変換した観測指標入力型
   * @returns PublishReadiness - 4段階の判定結果
   *
   * 判定優先順位（publish-readiness-design.md §3.1 に準拠）:
   * 1. gateStatus === "rejected" → "blocked"
   * 2. riskLevel === "critical"  → "blocked"
   * 3. riskLevel === "high"      → "manual-approval-required"
   * 4. riskLevel === "medium"    → 成功率/トレンド/スキャン/feedbackScore による分岐
   * 5. riskLevel === "low"       → 成功率/スキャン/トレンド/feedbackScore による分岐
   */
  check(
    safetyGate: SafetyGateInput,
    metrics: ObservabilityMetrics,
  ): PublishReadiness;
}
```

**配置先**: `packages/shared/src/types/publish-eligibility.ts`（`PublishReadiness` と同ファイルに定義）

**DI 適合性（P61 準拠）**: IPC ハンドラ登録関数の引数型として `PublishReadinessChecker` を使用する。

**モック可能性**: 判定マトリクスのテストでは以下のようにモック可能:

```typescript
const mockReadinessChecker: PublishReadinessChecker = {
  check: vi.fn().mockReturnValue({ status: "auto-approved" }),
};
```

---

## 4. CompatibilityChecker インターフェース

```typescript
/**
 * 互換性チェッカー統合インターフェース（Port）。
 * SkillRegistryService と SkillDistributionService の両方が依存する。
 * P61 準拠: IPC ハンドラ登録関数の引数型はこのインターフェース（具象クラスではない）。
 *
 * 配置先: apps/desktop/src/main/domain/compatibility-checker.ts（Port 同階層）
 * 具象クラス: apps/desktop/src/main/domain/default-compatibility-checker.ts
 */
interface CompatibilityChecker {
  /**
   * 旧/新スキーマを比較し、互換性チェック結果を返す。
   *
   * @param oldSchema - 旧バージョンのスキーマ（SkillSchema 形式）
   * @param newSchema - 新バージョンのスキーマ（SkillSchema 形式）
   * @returns CompatibilityCheckResult（level/breakingChanges/warnings/suggestedBump）
   *
   * 事後条件:
   * - M-1〜M-5 のいずれかが検出 → level="breaking", suggestedBump="major"
   * - m-1〜m-3 のいずれかが検出（かつ breaking なし） → level="minor-incompatible", suggestedBump="minor"
   * - 上記以外 → level="compatible", suggestedBump="patch"
   */
  check(oldSchema: unknown, newSchema: unknown): CompatibilityCheckResult;

  /**
   * 依存スキルのバージョン制約を解決する。
   *
   * @param constraints - スキルID と versionRange（semver range）のレコード
   * @returns CompatibilityCheckResult 形式で解決結果を返す（conflict 時は breakingChanges に格納）
   */
  checkDependencies(
    constraints: Record<string, string>,
  ): CompatibilityCheckResult;
}
```

**配置先**: `apps/desktop/src/main/domain/compatibility-checker.ts`（Domain Logic 内部 / Port 同階層）

**注記**: `CompatibilityChecker` は Main プロセス内のみで使用するため `apps/desktop/src/main/domain/` に配置する（`packages/shared` には配置しない）。ただし、戻り値型 `CompatibilityCheckResult` は `packages/shared` に配置し、IPC レスポンス経由で Renderer にも返却可能とする。

**DI 適合性（P61 準拠）**: IPC ハンドラ登録関数の引数型として使用:

```typescript
// P61 準拠
export function registerSkillCompatibilityHandlers(
  compatibilityChecker: CompatibilityChecker, // インターフェース型
): void {
  /* ... */
}
```

**モック可能性**:

```typescript
const mockCompatibilityChecker: CompatibilityChecker = {
  check: vi.fn().mockReturnValue({
    level: "compatible",
    breakingChanges: [],
    warnings: [],
    suggestedBump: "patch",
  }),
  checkDependencies: vi.fn(),
};
```

---

## 5. 4サービスの配置先サマリー

| インターフェース         | 配置先                                                | 具象クラス配置先                                                               |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| SkillRegistryService     | packages/shared/src/types/skill-registry.ts           | apps/desktop/src/main/services/registry/DefaultSkillRegistryService.ts         |
| SkillDistributionService | packages/shared/src/types/skill-distribution.ts       | apps/desktop/src/main/services/distribution/DefaultSkillDistributionService.ts |
| PublishReadinessChecker  | packages/shared/src/types/publish-eligibility.ts      | apps/desktop/src/main/services/publish/DefaultPublishReadinessChecker.ts       |
| CompatibilityChecker     | apps/desktop/src/main/domain/compatibility-checker.ts | apps/desktop/src/main/domain/default-compatibility-checker.ts                  |

---

## 6. M-DQ-4 SkillDependency DI 境界（Phase 3 MINOR 対応）

Phase 3 MINOR M-DQ-4（`SkillDependency` の DI 境界配置先未確定）に対する確定事項:

`SkillDependency` 型（依存制約情報）は `apps/desktop/src/main/domain/compatibility-checker.ts` と同階層の `dependency-constraint.ts` に配置する（Port 同階層）。IPC 経由で Renderer に公開しないため `packages/shared` には配置しない。

---

## 7. M-DQ-2 update() 内の in-app 通知（Phase 3 MINOR 対応）

Phase 3 MINOR M-DQ-2（`update()` 内の in-app 通知の責務越境懸念）に対する確定事項:

`SkillRegistryService.update()` は通知の送信を直接行わない。更新結果（`UpdateResult`）に `requiresManualApproval: boolean` と `affectedUserCount: number` を含め、呼び出し元（IPC ハンドラ）が通知サービスへ委譲する設計を採用する。責務境界: RegistryService は「状態変更のみ」、NotificationService は「通知のみ」。

---

## 8. M-DQ-1 semver ライブラリ選定（Phase 3 MINOR 対応）

Phase 3 MINOR M-DQ-1（`satisfies` 関数の外部依存 semver ライブラリが未定義）に対する確定事項:

| 用途                  | 採用ライブラリ | 理由                                                   |
| --------------------- | -------------- | ------------------------------------------------------ |
| semver バリデーション | `semver`       | npm 公式の semver パッケージ。Node.js エコシステム標準 |
| semver range 解決     | `semver`       | `satisfies()` / `minSatisfying()` が利用可能           |
| バンドルサイズ        | 軽量（約 8KB） | `packages/shared` への追加が許容可能なサイズ           |

`semver` パッケージを `packages/shared/package.json` の dependencies に追加する（後続の実装タスクで対応）。

---

## 9. Phase 3 MINOR 対応状況（全10件）

| MINOR ID | 指摘内容                           | 対応状況   | 本文書での対応内容                                                                                    |
| -------- | ---------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| M-AC-1   | `"deprecated"` 状態の型未収録      | 未対象     | サービスIF設計に直接影響なし。type-definitions.md で isDeprecated フィールドとして対応                |
| M-AC-2   | 後方互換保持世代数ポリシー未定義   | 解決済み   | セクション1 の `update()` 事後条件で N-2世代/N-1世代の非推奨マーク方針を確定                          |
| M-AC-3   | カテゴリ固定値の列挙未収録         | 未対象     | サービスIF設計に直接影響なし。type-definitions.md で tags 代替方針を確定済み                          |
| M-SS-1   | CSS変数衝突確認                    | 未対象     | サービスIF設計に直接影響なし。実装タスクで grep 確認する                                              |
| M-SS-2   | フィルタUI配置先コンポーネント確定 | 未対象     | サービスIF設計に直接影響なし。zustand-slice-design.md で対応済み                                      |
| M-SS-3   | 型名重複確認                       | 未対象     | サービスIF設計に直接影響なし。ipc-channel-definitions.md で確認済み                                   |
| M-DQ-1   | semver ライブラリ未定義            | 解決済み   | セクション8 で `semver` パッケージの採用を確定                                                        |
| M-DQ-2   | update() 内通知の責務越境          | 解決済み   | セクション7 で RegistryService は「状態変更のみ」、NotificationService は「通知のみ」の責務分離を確定 |
| M-DQ-3   | reasons フィールドの日本語固定     | 未タスク化 | i18n 対応として未タスク化（Phase 3 確定済み）                                                         |
| M-DQ-4   | SkillDependency DI境界配置先未確定 | 解決済み   | セクション6 で `dependency-constraint.ts`（Port 同階層）への配置を確定                                |
