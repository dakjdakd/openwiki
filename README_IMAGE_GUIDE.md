# README Image Guide / README 配图建议

| 位置 | 推荐文件名 | 图片类型 | 内容说明 | 尺寸建议 | 是否必需 | 没有图片时的占位方式 |
| --- | --- | --- | --- | --- | --- | --- |
| Logo / Icon | `public/logo.png` | Logo / app icon | 展示 OpenWiki 的核心标识。建议保持简单、清晰，适合在 README 顶部、favicon 和社交预览中复用。当前仓库已有 `public/logo.png`，可继续优化成更统一的品牌图标。 | 512x512 源图，README 中显示 96x96 | 是 | `[Project Logo]` |
| Hero Banner 或 Hero Demo | `public/hero-demo.png` 或 `public/hero-demo.gif` | 产品主视觉 / Demo 截图 | 展示用户从输入 GitHub URL 到进入分析工作区的主路径。画面应包含首页输入框、分析进度或最终工作区，突出“把仓库变成技术 Wiki”的核心体验。当前 README 使用 `public/Platform Preview.png` 作为临时主图。 | 1600x900 或 1440x900 | 是 | `[Hero Demo Image: show the main product experience here]` |
| 主功能截图 | `public/overview-screenshot.png` | 工作区截图 | 展示 Overview 页面，重点露出项目摘要、文件树、分析证据、源码预览和 AI Tutor，帮助读者理解 OpenWiki 不是静态报告，而是可探索的工作区。当前可使用 `public/Overview.png`。 | 1600x1000 | 是 | `[Overview Screenshot: file tree, analysis evidence, source preview, and AI tutor]` |
| 核心流程图 | `public/analysis-flow.png` | 流程图 / Mermaid 导出图 | 展示从 GitHub URL 输入、GitHub API 获取、源码采样、AI 分析、JSON 归一化到前端渲染的完整链路。图中应标出 SSE 进度流和内存存储。 | 1400x900 | 是 | 使用 README 中的 Mermaid 流程图代码块 |
| 使用场景图或结果图 | `public/report-result.png` | 结果截图 | 展示 Report 页面或最终输出效果，突出技术摘要、架构说明、业务分析和可复制 Markdown 的沉淀价值。当前可使用 `public/Report.png`。 | 1600x1000 | 推荐 | `[Report Result Screenshot: final technical and business analysis report]` |
| 配置界面或配置示例图 | `public/config-example.png` | 配置示意图 / 终端截图 | 展示 `.env` 配置、启动命令和本地访问地址。由于项目没有独立设置界面，可用干净的终端截图展示 `npm install`、`.env` 示例和 `npm run dev` 成功启动。 | 1400x760 | 推荐 | 使用 README 中的 `.env` 和命令代码块 |
| 架构图 | `public/architecture-diagram.png` | 系统架构图 | 用一张简洁架构图展示 React UI、Express API、GitHub REST API、AI Provider、内存项目 Store 之间的数据流。当前 README 使用目录结构和已有 `public/architecture.png`，后续建议补一张专门的系统架构图。 | 1400x900 | 推荐 | 使用 README 中的目录树和 API 表格 |
| 可选 GIF / 动图 | `public/openwiki-demo.gif` | 8-12 秒 GIF | 录制从首页粘贴仓库 URL、进入分析进度、打开 Overview 或 Architecture 的短流程。GIF 应服务于理解，不需要复杂转场或装饰。 | 1280x720，控制在 8-12 秒 | 可选 | `[Demo GIF: paste repository URL, run analysis, open generated workspace]` |
| 社区、赞助或生态相关图片 | `public/community-card.png` | 社区卡片 / 赞助图 | 如果项目后续有文档站、Discord、微信群、赞助入口或生态插件，可增加一张简洁社区入口图。当前项目信息不足，不建议在 README 主体中强行加入。 | 1200x630 | 可选 | `[Community / Sponsor Image]` |

