# SKILL文档



## 技能是什么？

> skill是可复用的指令、脚本、资源的文件夹，基于已有经验总结产生的专业技能，可以是工作流、最佳实践、专业知识等等。
>

**举例：**

1. `Vue3`的最佳实践
2. 公司邮件模板格式规范
3. 某种风格的`PPT`或者文档格式

技能平台：

1. [Skills Market]: https://skillsmp.com/


### Agent Skill开发规范 https://agentskills.io/ 

```
skill-name/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
├── assets/           # Optional: templates, resources
└── ...               # Any additional files or directories
```



## 技能内容

### 一、元数据【必须】

> - `name`：**名称**，（最多64个字符）
>
>   - 与技能名称必须一致
>
>   - 名称必须是小写字母和连字符`-`
>
> - `description`：**描述**，包含技能作用和使用时机（最多1024个字符）
> - `license`：协议名称或引用
> - `metadata`：其他版本、作者、等信息

```plain
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---
```

### 二、指令内容[必须]

> `SKILL.md`的主体信息可能包括：工作流、最佳实践 、专业指导，可以理解为导航、说明书、行为规则、触发器。
>
> 文档内部不超过500行，防止权重稀释，多余的内容需要拆分到其他补充文件中。



### 三、补充文件【Supporting Files】

> 补充文件规范性目录可能如下所示，但是可以自己定义和补充

#### 3.1. `references/` 参考文件

> 参考文件可以包括流程、`API`文档、组件库文档、术语表等等

#### 3.2 `template/` 模板

> 比如： 代码模板、需求设计文档模板、规则清单模板

#### 3.3. `examples/`  期望输出的格式示例

 > 比如：输出文档格式示例、代码生成示例、答复格式示例、Commit Message示例等等



#### 3.4 `scripts/` 可执行脚本

> 在bash中可执行的Python、Bash、JavaScript脚本（可能支持其他脚本），代表的是确定性内容。
>
> 比如：规则校验、格式转换、数据提取等等
>
> 脚本是用来执行的，本身不会参与到上下文环境，Agent只接受脚本的执行结果。





## 工作原理&加载机制

可以理解为，Skills在代码执行环境中运行，Agent在这个环境下可以跟电脑中通过bash命令访问文件一样， 访问文件系统，这样就构建了一份skills文件结构目录指南，这种文件架构实现了``渐进式披露``。Agent通过这份文件目录指南，获取加载信息 ，进行分层加载信息。



### 渐进式披露

1. 元数据预加载，获知技能说明
2. 根据技能加载时机，加载整个`SKILL.md`主体
3. 根据主体说明，在有需要的情况下，加载补充文件（reference/template/examples等等）



![image-20260320150617010](C:\Users\whisp\AppData\Roaming\Typora\typora-user-images\image-20260320150617010.png)





## 技能的优势

1. 专业角色、可复用
   1. 方便复用开源、公司的最佳实践
2. 可组合
   1. 通过不同的技能可以组合出一个想要的工作流程
3. 节省时间
   1. 渐进式披露减少上下文分析时间 
   2. 可执行脚本输出稳定验证结果避免返工
4. 节省成本
   1. 渐进式披露减少token消耗

### TOKEN消耗对比

| 方法               | 代币成本                        | 表现       |
| ------------------ | ------------------------------- | ---------- |
| 使用说明书         | 5,000-10,000 个token/请求       | 质量不稳定 |
| 技能（仅限元数据） | 极简版（仅需名称/描述）         | 专家级     |
| 技能（满负荷）     | 使用技能时可获得约 5,000 个代币 | 专家级     |





## 设计规范及注意事项

### 渐进式披露

- 设计大型技能时，需要做到合理拆分，明确使用场景，`SKILL.md`作为主体说明应小于500行，将更详细的内容拆分`reference`或者其他类似的目录中
- 对于引用的文件，要明确说明什么条件下引用什么文件，而不是详见参考文档。比如开发页面时引入组件列表说明 `components-list.md`
- 不要嵌套过深，所有引用文件从`SKILL.md`直接引用

### 合理利用上下文

- 技能激活时**技能主体**、**对话历史**、**系统上下文**、**其他激活的技能**，这些都会消耗Agent的注意力。内容越多权重越低。
- 适度详细，告诉Agent不知道的规范和边界条件，添加示例和反例效果更好

### 多步骤工作流程需要设置检查清单

- 明确的检查清单可以帮助Agent跟踪进度

### 验证循环

- 定义验证流程，Agent在执行下一步之前对当前阶段的输出内容进行验证，执行自检、脚本，然后修复并重新验证直至通过。

### 计划-验证-执行

- 对于批量或者breaking操作，可以先让Agent创建结构化的中间计划，然后根据规范来验证，验证失败则重新进行该过程，知道验证通过再执行

### 模型影响

- 假设Opus模型足够聪明，经过测试的技能可以在Opus模型准确使用，Opus模型已知的内容SKILL无需要标注，那么在Haiku模型下，某些已知的内容并不具备，可能要描述的详细一点。所以模型不同，使用方式也可能不同。





## 技能评估测试

- **测试技能是否触发**
  - 不同模型gent客户端通过执行日志，工具调用记录、详细输出，来验证编写技能是否按照预期触发，需要编写用例进行测试。【？？？？？这个要看agent是否支持】
- 输出测试

### 文档

[Claude最佳实践]: https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/best-practices

