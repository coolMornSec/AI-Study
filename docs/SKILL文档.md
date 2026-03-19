# SKILL文档

## 技能是什么？

> skill是可复用的基于文件系统的资源，基于已有经验总结产生的专业技能，可以是工作流、最佳实践、专业知识等等。无须考虑在不同窗口重复输入prompts。

**优点：**

1. 专业定制
2. 可复用
3. 可组合（工作流）



## 技能内容

### 一、元数据【必须】

- 元数据包含两个信息：`名称`和`使用时机`
- 第一层加载

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

> 在bash中可执行的sh/python/node脚本（可能支持其他脚本），代表的是确定性内容。
>
> 比如：规则校验、格式转换、数据提取等等
>
> 脚本是用来执行的，本身不会参与到上下文环境，Agent只接受脚本的执行结果。





## 技能的加载机制

可以理解为，在项目目录下，在上下文构建一个虚拟机执行环境，跟电脑中通过bash命令访问文件一样， 该环境提供了一份skills文件结构目录的指南，这份指南会被加载到上下文中Agent在通过阅读这份指南



## 技能如何使用