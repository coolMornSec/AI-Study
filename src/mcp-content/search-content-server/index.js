import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import {
  readAllFiles,
  searchContent,
  formatResults,
  listAllCommands,
  callDeepSeek
} from "./utils.js";

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// data目录路径
const DATA_DIR = path.join(__dirname, "data");

// 创建MCP服务器
const server = new McpServer({
  name: "search-content-server",
  version: "1.0.0",
  capabilities: {
    tools: {}
  }
});

// 注册搜索工具
server.tool(
  "search_content",
  "根据关键词搜索data目录下文档中的命令或内容。支持中英文搜索，会智能匹配标题、命令、描述等内容并返回最相关的结果。",
  {
    query: z.string().describe("搜索关键词，可以是命令名称、功能描述或任何相关词汇")
  },
  async ({ query }) => {
    try {
      console.error(`收到搜索请求: ${query}`);
      const files = readAllFiles(DATA_DIR);
      
      if (files.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "data目录为空或不存在，请确保data目录下有文档文件。"
            }
          ]
        };
      }
      console.error(`搜索到${files.length}个文件`);
      const results = searchContent(query, files);
      const formattedOutput = formatResults(results);
      
      return {
        content: [
          {
            type: "text",
            text: formattedOutput
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `搜索出错: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);

// 注册列出所有命令的工具
server.tool(
  "list_commands",
  "列出data目录下所有文档中的命令和内容摘要",
  {},
  async () => {
    try {
      const files = readAllFiles(DATA_DIR);
      
      if (files.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "data目录为空或不存在。"
            }
          ]
        };
      }
      
      const output = listAllCommands(files);
      
      return {
        content: [
          {
            type: "text",
            text: output
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `获取命令列表出错: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);

// 注册获取文件内容的工具
server.tool(
  "get_file_content",
  "获取data目录下指定文件的完整内容",
  {
    filename: z.string().describe("要读取的文件名，例如: WSL.md")
  },
  async ({ filename }) => {
    try {
      const files = readAllFiles(DATA_DIR);
      const file = files.find(f => f.filename.toLowerCase() === filename.toLowerCase());
      
      if (!file) {
        return {
          content: [
            {
              type: "text",
              text: `未找到文件: ${filename}\n\n可用文件列表:\n${files.map(f => `- ${f.filename}`).join("\n")}`
            }
          ]
        };
      }
      
      return {
        content: [
          {
            type: "text",
            text: `# ${file.filename}\n\n${file.content}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `读取文件出错: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);

// 注册智能整理工具
server.tool(
  "organize_content",
  "使用DeepSeek大模型对文档进行智能整理、总结或提取特定内容。比如'列出所有网络配置相关的命令'、'总结WSL安装步骤'等。",
  {
    instruction: z.string().describe("对文档内容的整理或查询指令")
  },
  async ({ instruction }) => {
    try {
      const files = readAllFiles(DATA_DIR);
      
      if (files.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "data目录为空，无法进行整理。"
            }
          ]
        };
      }

      // 构建上下文
      let context = "";
      for (const file of files) {
        context += `\n=== 文件名: ${file.filename} ===\n\n${file.content}\n\n`;
      }
      
      // 限制上下文长度（简单处理，防止过长）
      if (context.length > 100000) {
        context = context.substring(0, 100000) + "\n...(内容过长已截断)...";
      }

      const messages = [
        {
          role: "system",
          content: `你是一个专业的文档助手。用户会提供一些技术文档内容（主要是Markdown格式的命令笔记），请根据用户的指令对这些内容进行整理、提取或回答问题。
          
请遵循以下规则：
1. 回答要精准，基于提供的文档内容。
2. 如果是提取命令，请保留代码块格式。
3. 如果文档中没有相关信息，请明确说明。
4. 输出格式要清晰工整，适合阅读。`
        },
        {
          role: "user",
          content: `这是所有的文档内容：\n${context}\n\n我的指令是：${instruction}`
        }
      ];

      console.error(`正在调用DeepSeek处理指令: ${instruction}`);
      const aiResponse = await callDeepSeek(messages);

      return {
        content: [
          {
            type: "text",
            text: aiResponse
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `智能整理出错: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Search Content MCP Server 已启动");
}

main().catch((error) => {
  console.error("服务器启动失败:", error);
  process.exit(1);
});
