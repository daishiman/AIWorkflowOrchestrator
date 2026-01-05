/**
 * MSW Server Setup
 * Node.js環境用のMSWサーバー設定
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
