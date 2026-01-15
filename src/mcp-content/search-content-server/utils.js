import fs from "fs";
import path from "path";
import axios from "axios";

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-191029a5e1754cbc9cd077251f7024d7';
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

/**
 * 读取目录下所有文件内容
 * @param {string} dirPath 目录路径
 * @returns {Array<{filename: string, content: string, filepath: string}>}
 */
export function readAllFiles(dirPath) {
  const files = [];
  
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isFile()) {
      // 只读取文本文件
      const ext = path.extname(item).toLowerCase();
      if ([".md", ".txt", ".json", ".yaml", ".yml", ".html", ".xml"].includes(ext)) {
        try {
          const content = fs.readFileSync(itemPath, "utf-8");
          files.push({
            filename: item,
            content: content,
            filepath: itemPath
          });
        } catch (err) {
          console.error(`读取文件失败: ${itemPath}`, err);
        }
      }
    } else if (stat.isDirectory()) {
      // 递归读取子目录
      files.push(...readAllFiles(itemPath));
    }
  }
  
  return files;
}

/**
 * 解析Markdown文件中的命令块
 * @param {string} content 文件内容
 * @returns {Array<{title: string, command: string, description: string, section: string}>}
 */
export function parseCommands(content) {
  const commands = [];
  const lines = content.split(/\r?\n/);
  
  let currentSection = "";
  let currentTitle = "";
  let currentDescription = "";
  let inCodeBlock = false;
  let codeBlockContent = "";
  let codeBlockLang = "";
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测标题
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }
    
    const titleMatch = line.match(/^###\s+(.+)$/);
    if (titleMatch) {
      currentTitle = titleMatch[1].trim();
      currentDescription = "";
      continue;
    }
    
    // 检测代码块
    const codeBlockStart = line.match(/^```(\w*)$/);
    if (codeBlockStart && !inCodeBlock) {
      inCodeBlock = true;
      codeBlockLang = codeBlockStart[1] || "";
      codeBlockContent = "";
      continue;
    }
    
    if (line.startsWith("```") && inCodeBlock) {
      // 代码块结束
      if (codeBlockContent.trim()) {
        commands.push({
          title: currentTitle,
          command: codeBlockContent.trim(),
          description: currentDescription.trim(),
          section: currentSection,
          language: codeBlockLang
        });
      }
      inCodeBlock = false;
      codeBlockContent = "";
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent += line + "\n";
    } else if (line.startsWith("-") || line.trim()) {
      // 收集描述信息
      if (!line.startsWith("#") && line.trim()) {
        currentDescription += line + " ";
      }
    }
  }
  
  return commands;
}

/**
 * 搜索匹配的内容
 * @param {string} query 搜索关键词
 * @param {Array} files 文件列表
 * @returns {Array} 匹配结果
 */
export function searchContent(query, files) {
  const results = [];
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 0);
  
  for (const file of files) {
    console.error(`正在搜索文件: ${file.filename}`);
    // 解析文件中的命令
    const commands = parseCommands(file.content);
    
    for (const cmd of commands) {
      let score = 0;
      const titleLower = cmd.title.toLowerCase();
      const commandLower = cmd.command.toLowerCase();
      const descLower = cmd.description.toLowerCase();
      const sectionLower = cmd.section.toLowerCase();
      
      // 计算匹配分数
      for (const term of queryTerms) {
        // 标题匹配 (高权重)
        if (titleLower.includes(term)) {
          score += 10;
        }
        // 命令匹配 (高权重)
        if (commandLower.includes(term)) {
          score += 8;
        }
        // 章节匹配 (中权重)
        if (sectionLower.includes(term)) {
          score += 5;
        }
        // 描述匹配 (低权重)
        if (descLower.includes(term)) {
          score += 3;
        }
      }
      
      // 精确匹配加分
      if (titleLower === queryLower || commandLower.includes(queryLower)) {
        score += 20;
      }
      
      if (score > 0) {
        results.push({
          ...cmd,
          filename: file.filename,
          score: score
        });
      }
    }
    
    // 如果没有匹配到命令，尝试全文搜索
    if (results.length === 0) {
      const contentLower = file.content.toLowerCase();
      if (contentLower.includes(queryLower)) {
        // 提取匹配行的上下文
        const lines = file.content.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(queryLower)) {
            const start = Math.max(0, i - 2);
            const end = Math.min(lines.length, i + 3);
            const context = lines.slice(start, end).join("\n");
            
            results.push({
              title: "全文搜索结果",
              command: "",
              description: context,
              section: "",
              filename: file.filename,
              lineNumber: i + 1,
              score: 1
            });
          }
        }
      }
    }
  }
  
  // 按分数排序
  results.sort((a, b) => b.score - a.score);
  
  // 返回前10个结果
  return results.slice(0, 10);
}

/**
 * 格式化搜索结果
 * @param {Array} results 搜索结果
 * @returns {string}
 */
export function formatResults(results) {
  if (results.length === 0) {
    return "未找到匹配的内容。";
  }
  
  let output = `找到 ${results.length} 个匹配结果：\n\n`;
  
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    output += `---\n`;
    output += `### ${i + 1}. ${r.title || "匹配内容"}\n`;
    
    if (r.section) {
      output += `**分类**: ${r.section}\n`;
    }
    
    output += `**来源文件**: ${r.filename}\n`;
    
    if (r.command) {
      output += `\n**命令**:\n\`\`\`${r.language || ""}\n${r.command}\n\`\`\`\n`;
    }
    
    if (r.description) {
      output += `\n**说明**: ${r.description}\n`;
    }
    
    if (r.lineNumber) {
      output += `**所在行**: ${r.lineNumber}\n`;
    }
    
    output += `\n`;
  }
  
  return output;
}

/**
 * 列出所有可用的命令
 * @param {Array} files 文件列表  
 * @returns {string}
 */
export function listAllCommands(files) {
  let output = "# 可用命令列表\n\n";
  
  for (const file of files) {
    const commands = parseCommands(file.content);
    
    if (commands.length > 0) {
      output += `## 📄 ${file.filename}\n\n`;
      
      let currentSection = "";
      for (const cmd of commands) {
        if (cmd.section && cmd.section !== currentSection) {
          currentSection = cmd.section;
          output += `### ${currentSection}\n\n`;
        }
        
        if (cmd.title) {
          output += `- **${cmd.title}**\n`;
        }
      }
      
      output += `\n`;
    }
  }
  
  return output;
}

/**
 * 调用DeepSeek API
 * @param {Array} messages 消息列表
 * @returns {Promise<string>}
 */
export async function callDeepSeek(messages) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("未配置 DEEPSEEK_API_KEY 环境变量，无法使用AI相关功能。");
  }

  try {
    console.error("DeepSeek API调用:", messages);
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: messages,
        stream: false,
        temperature: 0.1
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        timeout: 60000 // 60秒超时
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek API调用失败:", error.response ? error.response.data : error.message);
    throw new Error(`AI服务调用失败: ${error.message}`);
  }
}
