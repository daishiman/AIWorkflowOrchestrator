# Phase 2: クラス設計書 - DefaultSafetyGate

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 2                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 1. クラス図

```
┌─────────────────────────────────────────────┐
│             <<interface>>                    │
│            SafetyGatePort                   │
├─────────────────────────────────────────────┤
│ + evaluate(skillName: string):              │
│     Promise<SafetyGateResult>               │
└─────────────────────┬───────────────────────┘
                      │ implements
┌─────────────────────▼───────────────────────┐
│           DefaultSafetyGate                 │
├─────────────────────────────────────────────┤
│ - permissionStore: IPermissionStore         │
│ - metadataProvider: SkillMetadataProvider   │
│ - protectedPaths: readonly string[]         │
├─────────────────────────────────────────────┤
│ + constructor(deps: DefaultSafetyGateDeps)  │
│ + evaluate(skillName): Promise<Result>      │
│ - checkCriticalTools(tools): Detail[]       │
│ - checkHighTools(tools): Detail[]           │
│ - checkNoPermanentApproval(tools): Detail[] │
│ - checkAllLowTools(tools): Detail[]         │
│ - checkProtectedPaths(paths): Detail[]      │
│ - calculateOverallGrade(details): Grade     │
│ - normalizePath(path: string): string       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      <<interface>>                           │
│    SkillMetadataProvider                    │
├─────────────────────────────────────────────┤
│ + getRequiredTools(skillName: string):      │
│     Promise<ToolInfo[]>                     │
│ + getAccessPaths(skillName: string):        │
│     Promise<string[]>                       │
└─────────────────────────────────────────────┘
```

## 2. DI 設計

### コンストラクタ引数

```typescript
interface DefaultSafetyGateDeps {
  permissionStore: IPermissionStore;
  metadataProvider: SkillMetadataProvider;
  protectedPaths: readonly string[];
}
```

**設計判断**: Named parameter pattern（オブジェクト引数）を採用。依存が3つあるため、位置引数よりも可読性と拡張性に優れる。

### SkillMetadataProvider インターフェース

```typescript
interface ToolInfo {
  name: string;
  riskLevel: ToolRiskLevel;
}

interface SkillMetadataProvider {
  getRequiredTools(skillName: string): Promise<ToolInfo[]>;
  getAccessPaths(skillName: string): Promise<string[]>;
}
```

**設計判断**: このインターフェースは DefaultSafetyGate と同じファイルで定義する。将来的に独立モジュールに分離可能だが、現時点では単一ファイルで十分。

## 3. 5種チェックの詳細設計

### 3-1. CRITICAL_TOOL_REQUIRED

```
入力: tools (ToolInfo[])
処理: tools.filter(t => t.riskLevel === "critical")
出力: 各 critical ツールに対して { checkId: "CRITICAL_TOOL_REQUIRED", status: "blocked", ... }
```

- critical ツールが0件の場合: 空配列を返す（details に追加しない）
- TOOL_RISK_CONFIG.critical.autoDenyDefault === true のため、常に blocked

### 3-2. HIGH_TOOL_REQUIRED

```
入力: tools (ToolInfo[])
処理: tools.filter(t => t.riskLevel === "high")
出力: 各 high ツールに対して { checkId: "HIGH_TOOL_REQUIRED", status: "warned", ... }
```

- high ツールが0件の場合: 空配列を返す
- TOOL_RISK_CONFIG.high.allowPermanent === false のため、恒久許可不可 → warned

### 3-3. NO_PERMANENT_APPROVAL

```
入力: tools (ToolInfo[])
処理: tools
  .filter(t => t.riskLevel === "medium" || t.riskLevel === "low")
  .filter(t => !permissionStore.isToolAllowed(t.name))
出力: 未許可ツールごとに { checkId: "NO_PERMANENT_APPROVAL", status: "warned", ... }
```

- IPermissionStore.isToolAllowed は1引数 (toolName のみ)
- 全ツールが許可済みの場合: 空配列を返す

### 3-4. ALL_LOW_TOOLS

```
入力: tools (ToolInfo[])
処理: tools.every(t => t.riskLevel === "low") かつ tools.length > 0
出力: 条件成立時に1件 { checkId: "ALL_LOW_TOOLS", status: "passed", message: "全ツールが低リスクです" }
```

- ツール0件の場合: このチェックは生成しない
- 1件でも low 以外がある場合: このチェックは生成しない

### 3-5. PROTECTED_PATH_ACCESS

```
入力: accessPaths (string[]), this.protectedPaths (string[])
処理:
  1. 各 accessPath を normalizePath() で正規化
  2. 各 protectedPath を normalizePath() で正規化
  3. accessPath.startsWith(normalizedProtectedPath) で前方一致判定
出力: マッチしたパスごとに { checkId: "PROTECTED_PATH_ACCESS", status: "blocked", ... }
```

**normalizePath の実装:**

```typescript
private normalizePath(p: string): string {
  // 末尾スラッシュを除去して正規化（ルート "/" は除く）
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}
```

**前方一致ロジック:**

```typescript
const normalizedAccess = this.normalizePath(accessPath);
const normalizedProtected = this.normalizePath(protectedPath);
// 完全一致 OR サブパス（/etc → /etc/passwd はマッチ、/etcfoo はマッチしない）
const isMatch =
  normalizedAccess === normalizedProtected ||
  normalizedAccess.startsWith(normalizedProtected + "/");
```

> **P55 準拠**: 正規表現は使用しない。`startsWith` + "/" 区切りで安全に前方一致。

## 4. グレード集約ロジック

```typescript
private calculateOverallGrade(details: SafetyCheckDetail[]): SafetyGrade {
  if (details.some(d => d.status === "blocked")) {
    return "UNSAFE";
  }
  if (details.some(d => d.status === "warned")) {
    return "SAFE_WITH_WARNINGS";
  }
  return "SAFE";
}
```

**優先順位**: blocked > warned > passed

## 5. evaluate() メソッド全体フロー

```typescript
async evaluate(skillName: string): Promise<SafetyGateResult> {
  // 1. メタデータ取得（エラーは呼び出し元に伝搬）
  const tools = await this.metadataProvider.getRequiredTools(skillName);
  const accessPaths = await this.metadataProvider.getAccessPaths(skillName);

  // 2. 5種チェック実行
  const details: SafetyCheckDetail[] = [
    ...this.checkCriticalTools(tools),
    ...this.checkHighTools(tools),
    ...this.checkNoPermanentApproval(tools),
    ...this.checkAllLowTools(tools),
    ...this.checkProtectedPaths(accessPaths),
  ];

  // 3. グレード集約
  const overallGrade = this.calculateOverallGrade(details);

  return {
    skillName,
    evaluatedAt: Date.now(),
    overallGrade,
    details,
  };
}
```

## 6. エラーハンドリング

DefaultSafetyGate 自体は try-catch を行わない。メタデータプロバイダのエラーはそのまま呼び出し元に伝搬する。

| エラー発生元                      | エラーコード        | 処理                                |
| --------------------------------- | ------------------- | ----------------------------------- |
| metadataProvider.getRequiredTools | SKILL_NOT_FOUND     | Promise reject → IPC ハンドラで捕捉 |
| metadataProvider.getAccessPaths   | HISTORY_UNAVAILABLE | Promise reject → IPC ハンドラで捕捉 |
| 想定外エラー                      | (任意)              | Promise reject → IPC ハンドラで捕捉 |
