import { ipcMain } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  GetFileTreeRequest,
  GetFileTreeResponse,
  ReadFileRequest,
  ReadFileResponse,
  WriteFileRequest,
  WriteFileResponse,
  RenameFileRequest,
  RenameFileResponse,
  FileNode,
} from "../../preload/types";
import {
  validatePath,
  validateEncoding,
  validateString,
  validateNumber,
  createValidationErrorResponse,
} from "./validation";

// Build file tree recursively
async function buildFileTree(
  dirPath: string,
  depth: number = Infinity,
  currentDepth: number = 0,
): Promise<FileNode[]> {
  if (currentDepth >= depth) return [];

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    // Skip hidden files and node_modules
    if (entry.name.startsWith(".") || entry.name === "node_modules") {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    const node: FileNode = {
      id: fullPath,
      name: entry.name,
      type: entry.isDirectory() ? "folder" : "file",
      path: fullPath,
    };

    if (entry.isDirectory()) {
      node.children = await buildFileTree(fullPath, depth, currentDepth + 1);
    }

    nodes.push(node);
  }

  // Sort: folders first, then alphabetically
  return nodes.sort((a, b) => {
    if (a.type === "folder" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name);
  });
}

export function registerFileHandlers(): void {
  // Get file tree
  ipcMain.handle(
    IPC_CHANNELS.FILE_GET_TREE,
    async (
      _event,
      request: GetFileTreeRequest,
    ): Promise<GetFileTreeResponse> => {
      try {
        // 入力検証
        const pathValidation = validatePath(request.rootPath);
        if (!pathValidation.valid) {
          return createValidationErrorResponse(pathValidation.error!);
        }

        if (request.depth !== undefined) {
          const depthValidation = validateNumber(request.depth, {
            min: 1,
            max: 10,
            integer: true,
          });
          if (!depthValidation.valid) {
            return createValidationErrorResponse(depthValidation.error!);
          }
        }

        const tree = await buildFileTree(request.rootPath, request.depth);
        return { success: true, data: tree };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Read file
  ipcMain.handle(
    IPC_CHANNELS.FILE_READ,
    async (_event, request: ReadFileRequest): Promise<ReadFileResponse> => {
      try {
        // 入力検証
        const pathValidation = validatePath(request.filePath);
        if (!pathValidation.valid) {
          return createValidationErrorResponse(pathValidation.error!);
        }

        const encodingValidation = validateEncoding(request.encoding);
        if (!encodingValidation.valid) {
          return createValidationErrorResponse(encodingValidation.error!);
        }

        const encoding = encodingValidation.value!;
        const content = await fs.readFile(request.filePath, { encoding });
        const stats = await fs.stat(request.filePath);

        return {
          success: true,
          data: {
            content,
            metadata: {
              size: stats.size,
              lastModified: stats.mtime,
              encoding,
            },
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Write file
  ipcMain.handle(
    IPC_CHANNELS.FILE_WRITE,
    async (_event, request: WriteFileRequest): Promise<WriteFileResponse> => {
      try {
        // 入力検証
        const pathValidation = validatePath(request.filePath);
        if (!pathValidation.valid) {
          return createValidationErrorResponse(pathValidation.error!);
        }

        const contentValidation = validateString(request.content, {
          maxLength: 10 * 1024 * 1024, // 10MB制限
        });
        if (!contentValidation.valid) {
          return createValidationErrorResponse(contentValidation.error!);
        }

        const encodingValidation = validateEncoding(request.encoding);
        if (!encodingValidation.valid) {
          return createValidationErrorResponse(encodingValidation.error!);
        }

        const encoding = encodingValidation.value!;
        await fs.writeFile(request.filePath, request.content, { encoding });

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Rename file or folder
  ipcMain.handle(
    IPC_CHANNELS.FILE_RENAME,
    async (_event, request: RenameFileRequest): Promise<RenameFileResponse> => {
      try {
        // Validate old path
        const oldPathValidation = validatePath(request.oldPath);
        if (!oldPathValidation.valid) {
          return createValidationErrorResponse(
            oldPathValidation.error!,
          ) as RenameFileResponse;
        }

        // Validate new path
        const newPathValidation = validatePath(request.newPath);
        if (!newPathValidation.valid) {
          return createValidationErrorResponse(
            newPathValidation.error!,
          ) as RenameFileResponse;
        }

        // Check if old path exists
        try {
          await fs.access(request.oldPath);
        } catch {
          return {
            success: false,
            error: `File or folder does not exist: ${request.oldPath}`,
          };
        }

        // Check if new path already exists
        try {
          await fs.access(request.newPath);
          return {
            success: false,
            error: `A file or folder already exists at: ${request.newPath}`,
          };
        } catch {
          // New path doesn't exist, which is what we want
        }

        // Perform rename
        await fs.rename(request.oldPath, request.newPath);

        return {
          success: true,
          data: {
            oldPath: request.oldPath,
            newPath: request.newPath,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}
