/**
 * MCP Resource Provider Template
 *
 * リソースプロバイダーの実装テンプレート。
 * このテンプレートを基にカスタムリソースプロバイダーを実装します。
 */

// ============================================================
// 型定義
// ============================================================

/**
 * リソース定義
 */
interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  metadata?: Record<string, unknown>;
}

/**
 * リソースコンテンツ
 */
interface ResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string; // Base64エンコード
}

/**
 * リソーステンプレート
 */
interface ResourceTemplate {
  uriTemplate: string;
  name: string;
  description?: string;
  mimeType?: string;
  parameters?: TemplateParameter[];
}

/**
 * テンプレートパラメータ
 */
interface TemplateParameter {
  name: string;
  description?: string;
  required?: boolean;
  type?: "string" | "number" | "boolean";
  default?: unknown;
}

/**
 * リソース更新通知
 */
interface ResourceUpdate {
  uri: string;
  event: "created" | "updated" | "deleted";
  timestamp: Date;
}

/**
 * リソースプロバイダーインターフェース
 */
interface ResourceProvider {
  /** プロバイダー名 */
  name: string;

  /** サポートするURIスキーム */
  schemes: string[];

  /** 利用可能なリソース一覧を取得 */
  listResources(): Promise<Resource[]>;

  /** リソーステンプレート一覧を取得 */
  listResourceTemplates(): Promise<ResourceTemplate[]>;

  /** リソースコンテンツを読み取り */
  readResource(uri: string): Promise<ResourceContent[]>;

  /** リソース変更を監視 */
  subscribeToUpdates?(callback: (update: ResourceUpdate) => void): () => void;
}

// ============================================================
// ベースプロバイダー実装
// ============================================================

/**
 * 抽象ベースプロバイダー
 */
abstract class BaseResourceProvider implements ResourceProvider {
  abstract name: string;
  abstract schemes: string[];

  /**
   * URIがこのプロバイダーでサポートされているかチェック
   */
  supportsUri(uri: string): boolean {
    try {
      const url = new URL(uri);
      return this.schemes.includes(url.protocol.replace(":", ""));
    } catch {
      return false;
    }
  }

  /**
   * URIをパースしてコンポーネントを取得
   */
  protected parseUri(uri: string): URL {
    return new URL(uri);
  }

  /**
   * URIテンプレートを展開
   */
  protected expandTemplate(
    template: string,
    params: Record<string, unknown>,
  ): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
      const value = params[key];
      if (value === undefined) {
        throw new Error(`Missing required parameter: ${key}`);
      }
      return encodeURIComponent(String(value));
    });
  }

  abstract listResources(): Promise<Resource[]>;
  abstract listResourceTemplates(): Promise<ResourceTemplate[]>;
  abstract readResource(uri: string): Promise<ResourceContent[]>;
}

// ============================================================
// ファイルシステムプロバイダー例
// ============================================================

/**
 * ファイルシステムリソースプロバイダー
 */
class FileSystemProvider extends BaseResourceProvider {
  name = "filesystem";
  schemes = ["file"];

  private basePath: string;
  private allowedExtensions: string[];

  constructor(options: { basePath: string; allowedExtensions?: string[] }) {
    super();
    this.basePath = options.basePath;
    this.allowedExtensions = options.allowedExtensions || [
      ".txt",
      ".md",
      ".json",
      ".yaml",
      ".yml",
    ];
  }

  async listResources(): Promise<Resource[]> {
    // 実装: ベースパス内のファイル一覧を取得
    // fs.readdir等を使用
    const resources: Resource[] = [];

    // 例: 静的リソース
    resources.push({
      uri: `file://${this.basePath}/config.json`,
      name: "Configuration",
      mimeType: "application/json",
    });

    return resources;
  }

  async listResourceTemplates(): Promise<ResourceTemplate[]> {
    return [
      {
        uriTemplate: `file://${this.basePath}/{path}`,
        name: "File",
        description: "Read any file in the base directory",
        parameters: [
          {
            name: "path",
            description: "Relative path to the file",
            required: true,
            type: "string",
          },
        ],
      },
    ];
  }

  async readResource(uri: string): Promise<ResourceContent[]> {
    const url = this.parseUri(uri);
    const filePath = url.pathname;

    // セキュリティ: パストラバーサル防止
    const normalizedPath = this.normalizePath(filePath);
    if (!normalizedPath.startsWith(this.basePath)) {
      throw new Error("Access denied: path traversal detected");
    }

    // 実装: ファイルを読み取り
    // const content = await fs.readFile(normalizedPath, 'utf-8');

    // 例: ダミーコンテンツ
    const content = '{ "example": true }';

    return [
      {
        uri,
        mimeType: this.getMimeType(normalizedPath),
        text: content,
      },
    ];
  }

  private normalizePath(path: string): string {
    // パスを正規化してパストラバーサルを防止
    const resolved = require("path").resolve(this.basePath, path);
    return resolved;
  }

  private getMimeType(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      json: "application/json",
      md: "text/markdown",
      txt: "text/plain",
      yaml: "application/x-yaml",
      yml: "application/x-yaml",
    };
    return mimeTypes[ext || ""] || "application/octet-stream";
  }

  subscribeToUpdates(callback: (update: ResourceUpdate) => void): () => void {
    // 実装: ファイル変更監視（fs.watch等）
    // const watcher = fs.watch(this.basePath, { recursive: true }, (event, filename) => {
    //   callback({
    //     uri: `file://${this.basePath}/${filename}`,
    //     event: event === 'rename' ? 'deleted' : 'updated',
    //     timestamp: new Date()
    //   });
    // });

    // return () => watcher.close();

    // ダミー実装
    return () => {};
  }
}

// ============================================================
// データベースプロバイダー例
// ============================================================

/**
 * データベースリソースプロバイダー
 */
class DatabaseProvider extends BaseResourceProvider {
  name = "database";
  schemes = ["db"];

  private connectionString: string;

  constructor(connectionString: string) {
    super();
    this.connectionString = connectionString;
  }

  async listResources(): Promise<Resource[]> {
    // 実装: データベースのテーブル一覧を取得
    return [
      {
        uri: "db://sqlite/users",
        name: "Users Table",
        description: "User records",
        mimeType: "application/json",
      },
      {
        uri: "db://sqlite/posts",
        name: "Posts Table",
        description: "Blog posts",
        mimeType: "application/json",
      },
    ];
  }

  async listResourceTemplates(): Promise<ResourceTemplate[]> {
    return [
      {
        uriTemplate: "db://sqlite/{table}",
        name: "Table Records",
        description: "All records from a table",
        mimeType: "application/json",
        parameters: [
          {
            name: "table",
            description: "Table name",
            required: true,
            type: "string",
          },
        ],
      },
      {
        uriTemplate: "db://sqlite/{table}/{id}",
        name: "Single Record",
        description: "Single record by ID",
        mimeType: "application/json",
        parameters: [
          {
            name: "table",
            description: "Table name",
            required: true,
            type: "string",
          },
          {
            name: "id",
            description: "Record ID",
            required: true,
            type: "number",
          },
        ],
      },
    ];
  }

  async readResource(uri: string): Promise<ResourceContent[]> {
    const url = this.parseUri(uri);
    const pathParts = url.pathname.split("/").filter(Boolean);

    const table = pathParts[0];
    const id = pathParts[1];

    // 実装: データベースクエリ実行
    // const result = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);

    // 例: ダミーデータ
    const data = id
      ? { id: Number(id), name: "Example", table }
      : [
          { id: 1, name: "Item 1" },
          { id: 2, name: "Item 2" },
        ];

    return [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(data, null, 2),
      },
    ];
  }
}

// ============================================================
// プロバイダーレジストリ
// ============================================================

/**
 * リソースプロバイダーレジストリ
 */
class ResourceProviderRegistry {
  private providers: Map<string, ResourceProvider> = new Map();

  /**
   * プロバイダーを登録
   */
  register(provider: ResourceProvider): void {
    for (const scheme of provider.schemes) {
      this.providers.set(scheme, provider);
    }
  }

  /**
   * URIに対応するプロバイダーを取得
   */
  getProvider(uri: string): ResourceProvider | undefined {
    try {
      const url = new URL(uri);
      const scheme = url.protocol.replace(":", "");
      return this.providers.get(scheme);
    } catch {
      return undefined;
    }
  }

  /**
   * すべてのリソースを取得
   */
  async listAllResources(): Promise<Resource[]> {
    const resources: Resource[] = [];

    for (const provider of this.providers.values()) {
      const providerResources = await provider.listResources();
      resources.push(...providerResources);
    }

    return resources;
  }

  /**
   * すべてのテンプレートを取得
   */
  async listAllTemplates(): Promise<ResourceTemplate[]> {
    const templates: ResourceTemplate[] = [];

    for (const provider of this.providers.values()) {
      const providerTemplates = await provider.listResourceTemplates();
      templates.push(...providerTemplates);
    }

    return templates;
  }

  /**
   * リソースを読み取り
   */
  async readResource(uri: string): Promise<ResourceContent[]> {
    const provider = this.getProvider(uri);
    if (!provider) {
      throw new Error(`No provider found for URI: ${uri}`);
    }

    return provider.readResource(uri);
  }
}

// ============================================================
// 使用例
// ============================================================

/*
// レジストリを作成
const registry = new ResourceProviderRegistry();

// プロバイダーを登録
registry.register(new FileSystemProvider({
  basePath: '/var/data',
  allowedExtensions: ['.json', '.md', '.txt']
}));

registry.register(new DatabaseProvider(
  'libsql://token@turso.io/mydb'
));

// リソース一覧を取得
const resources = await registry.listAllResources();
console.log('Available resources:', resources);

// リソースを読み取り
const content = await registry.readResource('file:///var/data/config.json');
console.log('Content:', content);

// テンプレートを取得
const templates = await registry.listAllTemplates();
console.log('Templates:', templates);
*/

export {
  Resource,
  ResourceContent,
  ResourceTemplate,
  ResourceUpdate,
  ResourceProvider,
  BaseResourceProvider,
  FileSystemProvider,
  DatabaseProvider,
  ResourceProviderRegistry,
};
