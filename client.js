window.__ModuleLoader__.load({
  id: 'dsh-invest-skill',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    // 侧栏头像：96×96 的压缩肖像内联为 data URI，随模块自包含，不依赖资源路由。
    const AVATAR = 'data:image/jpeg;base64,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'

    const AVATAR_BIG = 'data:image/jpeg;base64,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'

    const TITLE = 'invest-skill投研专家'

    // ── 数据 ────────────────────────────────────────────────
    const GROUPS = [
      {
        title: '宏观与事件',
        items: [
          ['policy-interpretation', '政策文件解读，判断对行业与市场的影响'],
          ['stock-market-spotlight-analysis', '本周热点、市场主线、板块资金流向'],
          ['industry-brief', '申万一级行业强弱排名与资金流'],
          ['concept-chain-analysis', '算力、固态电池这类主题的上下游环节拆解'],
          ['macro-stock-analysis', '美林时钟、PMI / 社融、行业轮动'],
          ['a-share-bottom-monitor', '抄底位置监控与三层决策检查表'],
          ['policy-bottom-monitor', '政策托底强度 S/A/B/C/D 分级'],
          ['sentiment-risk-warning', '舆情与次日波动率风险分级'],
        ],
      },
      {
        title: '标的分析',
        items: [
          ['stock-5d-deep-analysis', '个股五维诊断：基本面、技术面、资金面、消息面、估值'],
          ['value-investing', '价值投资五步框架与多股四层打分卡'],
          ['stock-comparative-analysis', '2–5 只标的横向对比，含 A+H'],
        ],
      },
      {
        title: '行情复盘',
        items: [
          ['market-daily-review', '十段式每日收评：涨跌统计、板块、异动、龙虎榜'],
          ['overnight-global-market-review', '隔夜美股港股复盘 + A 股开盘前瞻'],
        ],
      },
      {
        title: '量化与策略',
        items: [
          ['racing-quant-pick', '按策略挑票，给可溯源的选股池'],
          ['aggressive-growth-strategy', '激进成长策略八步分析，A+~D 评级'],
        ],
      },
    ]

    const PROMPTS = [
      '创业板指现在能不能抄底？用三层决策检查表给结论。',
      '对比分析贵州茅台和五粮液，出一份分析师级对比报告。',
      '帮我做今日 A 股投研全景分析，最后给 TOP3 重点公司验证。',
    ]

    const NOTES = [
      '数据：公开信息走 web_search / web_fetch；Tushare 需在 $DSH_HOME/.env 写 TUSHARE_TOKEN 并重启。',
      '取不到的数据一律标 N/A，不编数字，不给买卖、仓位、止损建议。',
      '15 个技能只在本预设生效，其他会话的技能目录不受影响。',
    ]

    // ── 侧栏头像 ────────────────────────────────────────────
    function InvestAvatar(props) {
      const size = props && typeof props.size === 'number' ? props.size : 16
      return h('img', {
        src: AVATAR,
        width: size,
        height: size,
        alt: '',
        'aria-hidden': true,
        draggable: false,
        style: {
          display: 'block',
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          opacity: props && props.active === false ? 0.82 : 1,
        },
      })
    }

    // ── 面板 ────────────────────────────────────────────────
    function CopyRow(props) {
      const [copied, setCopied] = React.useState(false)
      const timer = React.useRef(null)
      React.useEffect(
        () => () => {
          if (timer.current) clearTimeout(timer.current)
        },
        [],
      )

      function copy() {
        const done = () => {
          setCopied(true)
          if (timer.current) clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), 1600)
        }
        try {
          const result = navigator.clipboard && navigator.clipboard.writeText(props.text)
          if (result && typeof result.then === 'function') result.then(done, () => {})
          else done()
        } catch (error) {
          // 剪贴板不可用时静默失败，不打断阅读
        }
      }

      return h(
        'button',
        {
          type: 'button',
          onClick: copy,
          title: '点击复制这句提问',
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            width: '100%',
            textAlign: 'left',
            padding: '10px 14px',
            marginBottom: 8,
            font: 'inherit',
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--dsw-alias-label-primary)',
            background: 'var(--dsw-alias-bg-layer-1)',
            border: '1px solid var(--dsw-alias-border-l1)',
            borderRadius: 8,
            cursor: 'pointer',
          },
        },
        h('span', null, props.text),
        h(
          'span',
          {
            style: {
              flex: '0 0 auto',
              fontSize: 12,
              color: copied ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-label-secondary)',
            },
          },
          copied ? '已复制' : '复制',
        ),
      )
    }

    function InvestPanel() {
      const sectionTitle = (text) =>
        h(
          'h2',
          {
            style: {
              margin: '0 0 10px',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: 'var(--dsw-alias-label-secondary)',
            },
          },
          text,
        )

      return h(
        'div',
        {
          style: {
            height: '100%',
            overflowY: 'auto',
            padding: '28px 32px 40px',
            background: 'var(--dsw-alias-bg-base)',
            color: 'var(--dsw-alias-label-primary)',
            fontSize: 14,
            lineHeight: 1.6,
          },
        },
        h(
          'header',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 22,
            },
          },
          h('img', {
            src: AVATAR_BIG,
            width: 52,
            height: 52,
            alt: '',
            'aria-hidden': true,
            style: { borderRadius: '50%', objectFit: 'cover', flex: '0 0 auto' },
          }),
          h(
            'div',
            null,
            h('h1', { style: { margin: '0 0 4px', fontSize: 22, fontWeight: 650 } }, TITLE),
            h(
              'p',
              { style: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: 13 } },
              '15 个投研技能，按你的问题自动命中；这里是全部清单与常用提问。',
            ),
          ),
        ),

        h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 16,
              marginBottom: 26,
            },
          },
          ...GROUPS.map((group) =>
            h(
              'section',
              {
                key: group.title,
                style: {
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: 'var(--dsw-alias-bg-layer-1)',
                  border: '1px solid var(--dsw-alias-border-l1)',
                },
              },
              sectionTitle(group.title),
              ...group.items.map(([name, desc]) =>
                h(
                  'div',
                  { key: name, style: { marginBottom: 10 } },
                  h(
                    'div',
                    {
                      style: {
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                        fontSize: 12.5,
                        color: 'var(--dsw-alias-brand-primary)',
                        wordBreak: 'break-all',
                      },
                    },
                    name,
                  ),
                  h('div', { style: { fontSize: 13, color: 'var(--dsw-alias-label-secondary)' } }, desc),
                ),
              ),
            ),
          ),
        ),

        h(
          'section',
          { style: { marginBottom: 26, maxWidth: 720 } },
          sectionTitle('三句可以直接用'),
          ...PROMPTS.map((text) => h(CopyRow, { key: text, text })),
        ),

        h(
          'section',
          { style: { maxWidth: 720, marginBottom: 18 } },
          sectionTitle('数据与边界'),
          ...NOTES.map((note) =>
            h(
              'div',
              {
                key: note,
                style: {
                  position: 'relative',
                  paddingLeft: 14,
                  marginBottom: 6,
                  fontSize: 13,
                  color: 'var(--dsw-alias-label-secondary)',
                },
              },
              h('span', { style: { position: 'absolute', left: 0, color: 'var(--dsw-alias-state-idle-primary)' } }, '·'),
              note,
            ),
          ),
        ),

        h(
          'p',
          { style: { margin: 0, fontSize: 12, color: 'var(--dsw-alias-state-idle-primary)' } },
          '内容仅用于技术研究与方法论参考，不构成投资建议。市场有风险，投资需谨慎。',
        ),
      )
    }

    // ── 注册 ────────────────────────────────────────────────
    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            { name: 'sidebar.panellist', id: 'invest-board', order: 50, label: TITLE },
            InvestAvatar,
          ),
        )
        ctx.slots.inject('main', () =>
          ctx.slots.register({ name: 'main', key: 'invest-board' }, InvestPanel),
        )
      },
    }
  },
})
