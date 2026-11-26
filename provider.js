/**
 * invest-skill投研专家 —— 技能提供者。
 *
 * 把包内 `skills/<目录>/SKILL.md` 注册成一个技能提供者（provider），挂载在
 * `@deepseek-ai/dsh-agent-preset` 预设内部，因此这 15 个技能只出现在该预设的
 * 会话里，不影响其他会话的技能目录。
 *
 * 设计约束（与 @deepseek-ai/dsh-skill-office 保持同构）：
 * - 技能目录名沿用上游（下划线亦可），目录里的 frontmatter `name` 才是模型看到的技能名；
 * - 候选携带 resourceBase 指向技能目录，模型可直接读取其 references/、scripts/；
 * - 不 import 任何 @deepseek-ai/* 包，避免本地链接安装时的包解析问题。
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'invest-skill-provider'
export const inject = ['skills']

/** 技能目录清单：与上游 15 个已入库技能一一对应。 */
const SKILL_DIRS = [
  'policy_interpret',
  'sentiment_risk_warning',
  'a_share_bottom_monitor',
  'policy_bottom_monitor',
  'macro_analysis',
  'market_hotspot',
  'industry_brief',
  'concept_chain_analysis',
  'stock_5d_deep_analysis',
  'value_investing',
  'stock_comparative_analysis',
  'market_daily_review',
  'overnight_review',
  'racing_quant_pick',
  'aggressive_growth_strategy',
  'session_analysis',
]

/** 与内置 bundled 技能同级的排序权重（数值越大优先级越低，仅同层内比较）。 */
const RANK = 600

/** 技能根目录：<包根>/skills/ */
const ASSET_ROOT = fileURLToPath(new URL('./skills/', import.meta.url))

/** 技能名必须是 kebab-case，与技能注册表的校验一致。 */
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

function unquote(value) {
  const text = value.trim()
  if (
    text.length >= 2 &&
    ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))
  ) {
    return text.slice(1, -1)
  }
  return text
}

/**
 * 解析 SKILL.md 的 YAML frontmatter 中我们需要的字段（name、description）。
 * 只实现 SKILL.md 实际用到的 YAML 子集：单行标量、引号标量、`|` / `>` 块标量。
 */
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(raw)
  if (match === null) throw new Error('SKILL.md 缺少 YAML frontmatter')
  const lines = match[1].split(/\r?\n/u)
  const fields = {}
  for (let index = 0; index < lines.length; index += 1) {
    const head = /^([A-Za-z_][A-Za-z0-9_-]*):(?:[ \t]+(.*))?$/u.exec(lines[index])
    if (head === null) continue
    const key = head[1]
    const rest = (head[2] ?? '').trim()
    const block = /^([|>])[-+]?$/u.exec(rest)
    if (block !== null) {
      const collected = []
      while (
        index + 1 < lines.length &&
        (lines[index + 1].trim() === '' || /^[ \t]/u.test(lines[index + 1]))
      ) {
        index += 1
        collected.push(lines[index])
      }
      while (collected.length > 0 && collected[collected.length - 1].trim() === '') collected.pop()
      const indents = collected
        .filter((line) => line.trim() !== '')
        .map((line) => line.length - line.trimStart().length)
      const indent = indents.length > 0 ? Math.min(...indents) : 0
      const body = collected.map((line) => line.slice(Math.min(indent, line.length)))
      fields[key] = block[1] === '|' ? body.join('\n') : body.join(' ').replace(/\s{2,}/gu, ' ')
      continue
    }
    // 普通标量，允许折行缩进续写
    const parts = [rest]
    while (index + 1 < lines.length && /^[ \t]+\S/u.test(lines[index + 1])) {
      index += 1
      parts.push(lines[index].trim())
    }
    fields[key] = unquote(parts.join(' '))
  }
  return { fields, body: raw.slice(match[0].length).trim() }
}

async function readSkill(dirName, signal) {
  const directory = join(ASSET_ROOT, dirName)
  const locator = join(directory, 'SKILL.md')
  const raw = await readFile(locator, { encoding: 'utf8', signal })
  let parsed
  try {
    parsed = parseFrontmatter(raw)
  } catch (error) {
    throw new Error(`${dirName}/SKILL.md frontmatter 解析失败：${error.message}`)
  }
  const skillName = parsed.fields.name
  if (typeof skillName !== 'string' || !NAME_PATTERN.test(skillName)) {
    throw new Error(`${dirName}/SKILL.md 的 name 缺失或不是 kebab-case（当前：${JSON.stringify(skillName)}）`)
  }
  const description = parsed.fields.description
  if (typeof description !== 'string' || description.length === 0) {
    throw new Error(`${dirName}/SKILL.md 的 description 缺失`)
  }
  if (parsed.body.length === 0) throw new Error(`${dirName}/SKILL.md 正文为空`)
  return { skillName, description, content: parsed.body, directory, locator }
}

/** ENOENT/ENOTDIR 视为「文件暂时不在」，其余读错误让目录发现保持不完整、下一轮重试。 */
function isPersistent(error) {
  const code = error instanceof Error && 'code' in error ? error.code : undefined
  return code === 'ENOENT' || code === 'ENOTDIR'
}

export function apply(ctx) {
  const reportedFailures = new Map()
  const directoryByName = new Map()

  function reportFailure(dirName, error) {
    const failure = String(error)
    if (reportedFailures.get(dirName) !== failure) {
      reportedFailures.set(dirName, failure)
      ctx.logger.warn(`invest-skill: 技能 "${dirName}" 不可用：${failure}`)
    }
  }

  async function resolveDirectory(skillName, signal) {
    const known = directoryByName.get(skillName)
    if (known !== undefined) return known
    for (const dirName of SKILL_DIRS) {
      try {
        const skill = await readSkill(dirName, signal)
        directoryByName.set(skill.skillName, dirName)
        if (skill.skillName === skillName) return dirName
      } catch {
        // 单个技能读取失败不影响按名反查其他技能
      }
    }
    return undefined
  }

  ctx.skills.registerProvider((control) => ({
    name: 'invest-skill',
    async list(options) {
      const candidates = []
      let complete = true
      for (const dirName of SKILL_DIRS) {
        try {
          const skill = await readSkill(dirName, options.signal)
          directoryByName.set(skill.skillName, dirName)
          reportedFailures.delete(dirName)
          candidates.push({
            name: skill.skillName,
            description: skill.description,
            invocation: { modelInvocable: true, userInvocable: true },
            provider: 'invest-skill',
            source: 'bundled',
            rank: RANK,
            resourceBase: { kind: 'directory', path: skill.directory.split('\\').join('/') },
            locator: skill.locator,
          })
        } catch (error) {
          if (options.signal?.aborted === true) throw error
          if (!isPersistent(error)) complete = false
          reportFailure(dirName, error)
        }
      }
      return { candidates, complete }
    },
    async get(candidate, options) {
      const { rank: _rank, locator: _locator, ...summary } = candidate
      const dirName = await resolveDirectory(candidate.name, options.signal)
      if (dirName === undefined) {
        control.invalidate()
        return undefined
      }
      const skill = await readSkill(dirName, options.signal)
      if (skill.skillName !== candidate.name) {
        control.invalidate()
        return undefined
      }
      return { ...summary, content: skill.content }
    },
  }))
}
