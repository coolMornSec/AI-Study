# AI概念理解

## AI能够用来做什么

在公司层面

> 集成产品构建平台
>
> 公司核心数据：实时数据库、数据采集
>
> 1. 集成AI开发规范，





### 1. 集成AI开发规范

> **落地一套从需求到设计，到前端、后端、数据库、测试的一整套规范**

#### 目标

1. `开发人员`能够在了解需求的情况下，能够完善需求，生成一套符合公司规范的原型`UI`，进而生成高质量的前后端代码，能够在平台无缝使用。
2. 探索对于旧项目的功能优化，比如报告系统，能不能解决现存的问题升级并优化性能。



#### 验证

1. 搭建公司产品构建平台，通过梳理`Base44`平台需求，实现整体架构，能够完成一些简单工具或者产品的实现
2. 用户、角色、菜单、权限的直接生成（上面任务能完成，这个也没问题）



### 2. 推广使用

- 根据探索经验总结分享，日常开发任务可以用AI来提效。
- 产品经理能够在平台上实现一些小功能



### 3. 平台升级

- 接入公司的核心产品
- 业务产品快速构建展示产品
- 产品开发周期缩短









## AGENT

> 能够以目标为导向，在环境中持续感知、自主决策、行动，并对结果做出迭代修正的执行主体。



现在agent具备要素（目前）：

11. `执行目标`：外界输入
12. `自主规划决策`：根据状态、记忆、上下文，做出自主规划决策
13. `行动能力`：与外部世界沟通并影响外部状态
    1. 工具调用：技能查询、网页搜索、文件读写、命令执行
14. `工作流`：按照固定的流程循环执行
15. ``state/memory``：状态记忆 能够保存上下文和中间结果
16. `执行闭环`： 对结果自主判断并迭代修正



2. 执行环境中上下文、脚本、进程是如何执行的？



## Sub AGENT

### 子代理是什么？

`Sub Agent`是处理特定任务的AI专业助手，它运行在自己独立的上下文，有自定义的系统提示、特定工具访问和独立权限，可以自己定义需要的`models`、``skills``和`hooks`

当`主agent`碰到匹配子代理的执行任务时，会委托给子代理，子代理执行后将输出结果反馈给主代理

### 子代理的优点

#### 1. 独立的上下文

- 上下文环境独立于主环境，防止主agent信息过载失去**交互专注性**

#### 2. 并行运行

- 可以同时执行多个任务，比如运行不同脚本查看项目不同模块的内容，并行处理不必一一扫描，可以充分节省排序时间

#### 3. 专门的知识和能力

- 子agent具备自己的专业性和独立性，比如代码审查子agent相关的规则、技能、工具，在主agent中永远不需要涉及相关内容，任务均委托给专业的子agent即可。

#### 4. 工具限制

- 子agent可以添加工具访问限制，比如`Explore`，在对组件库进行探索时拒绝读写。

#### 5. 成本限制

- 根据子代理执行任务的难易程度，可以选择不同的模型



### 子代理的工作原理





### 如何创建有效的子代理

文件使用`yaml` 格式配置，后面跟markdown系统提示

比如`code-reviewer`

``````markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
disallowedTools: Write, Edit
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
``````

支持的字段

| 字段              | 描述                                                |
| :---------------- | --------------------------------------------------- |
| `name`            | 名称                                                |
| `description`     | 描述                                                |
| `tools`           | 使用工具                                            |
| `disallowedTools` | 限制使用工具                                        |
| `model`           | 模型，opus sonnet haiku inherit                     |
| `permissionMode`  | 权限模式`default`、`acceptEdits`、`dontAsk`、`plan` |
| `skills`          | 使用技能，启动时加载；不继承                        |
| `hooks`           | 生命周期钩子                                        |
| `mcpServers`      | 可用的`MCP Servers`                                 |
| `memory`          | 持久内存范围：user project local                    |

**[详细可参考自定义子代理](https://code.claude.com/docs/zh-CN/sub-agents#general-purpose)**



### 代理的反模式

​	什么情况下建议使用，什么情况下不建议使用`sub agent`

## Agent Teams

Claude中提出的概念

需要在setting.json文件中配置`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`

```
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```





#### 用例

- **研究和审查**：多个队友可以调查问题的不同方面，然后分享和质疑彼此的发现。
- **新模块和功能**：各自进行不同的任务，互不干扰
- 使用竞争假设来进行调试：并行测试不同理论，得到收敛答案



#### 与子agent的区别

![image-20260323165546974](C:\Users\whisp\AppData\Roaming\Typora\typora-user-images\image-20260323165546974.png)





#### MAS

multi-agent systems（多智能体系统），不同的系统作为不同的角色，负责不同的内容，各个agent之间互相协作共同完成任务







## MCP模型上下文协议



## RULES

## HOOKS

## 模型能力

- 批量读取文件
- 并行执行bash

## Claude提示词的最佳实践

- 添加用户背景或用户故事，给予充分的上下文，模型才知道你要什么
- 提供验证工具，比如Playwright、MCP服务器、用于测试UI的计算机状态。

- 对于强逻辑的内容，估计充分理解上下文。
- 使用结构化数据来验证跟踪规则、校验结果、任务状态
- 对于复杂任务进行拆分，模型在处理明确定义的小任务时，能具备所有的attention，减少幻觉出现
