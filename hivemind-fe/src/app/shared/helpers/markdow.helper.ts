import markdownit, { Options, PluginWithOptions } from 'markdown-it';
import { Token, Renderer, StateCore } from 'markdown-it/index.js';
import markdownItMark from 'markdown-it-mark';
import markdownItIns from 'markdown-it-ins';
import { full as emoji } from 'markdown-it-emoji';

const LINK_OPEN_PATTERN = /^<a[>\s]/i;
const LINK_CLOSE_PATTERN = /^<\/a\s*>/i;

interface PluginOptions {
  type: 'mention' | 'hashtag';
  pattern: RegExp;
  render: (
    tokens: Token[],
    idx: number,
    opts: Options,
    env: any,
    self: Renderer
  ) => string;
}

const createInlineRegexPlugin: PluginWithOptions<PluginOptions> = (
  markdown: markdownit,
  options: PluginOptions | undefined
) => {
  if (options) {
    markdown.core.ruler.after('inline', options.type, (state: StateCore) =>
      parseTokens(state, options)
    );
    markdown.renderer.rules[options.type] = (tokens, idx, opts, env, self) =>
      options.render(tokens, idx, opts, env, self);
  }
};

function parseTokens(state: StateCore, options: PluginOptions) {
  for (const blockToken of state.tokens) {
    if (blockToken.type !== 'inline') {
      continue;
    }
    if (blockToken.children == null) {
      continue;
    }
    let linkDepth = 0;
    let htmlLinkDepth = 0;
    blockToken.children = blockToken.children.flatMap((token: Token) => {
      if (token.type === 'link_open') {
        linkDepth++;
      } else if (token.type === 'link_close') {
        linkDepth--;
      } else if (token.type === 'html_inline') {
        if (LINK_OPEN_PATTERN.test(token.content)) {
          htmlLinkDepth++;
        } else if (LINK_CLOSE_PATTERN.test(token.content)) {
          htmlLinkDepth--;
        }
      }
      if (linkDepth > 0 || htmlLinkDepth > 0 || token.type !== 'text') {
        return [token];
      }
      return splitTokens(token, state, options.pattern, options.type);
    });
  }
}

function splitTokens(
  token: Token,
  state: StateCore,
  pattern: RegExp,
  type: 'mention' | 'hashtag'
): Token[] {
  const { content, level } = token;
  const tokens: Token[] = [];
  let pos = 0;
  for (const match of content.matchAll(pattern)) {
    if (match.index == null) continue;
    if (match.index > pos) {
      const textToken = new state.Token('text', '', 0);
      textToken.content = content.substring(pos, match.index);
      textToken.level = level;
      tokens.push(textToken);
    }
    const matchToken = new state.Token(type, '', 0);
    matchToken.content = match[0];
    matchToken.level = level;
    tokens.push(matchToken);
    pos = match.index + match[0].length;
  }
  if (pos < content.length) {
    const textToken = new state.Token('text', '', 0);
    textToken.content = content.substring(pos);
    textToken.level = level;
    tokens.push(textToken);
  }
  return tokens;
}

function renderHashtag(
  tokens: Token[],
  idx: number,
  opts: Options,
  env: any,
  self: Renderer
): string {
  if (tokens.length <= idx) {
    return '';
  }
  const token = tokens[idx];
  if (token.type !== 'hashtag') {
    return self.renderToken(tokens, idx, opts);
  }
  if (typeof env === 'object' && env !== null) {
    env.hashtags = env.hashtags ?? [];
    env.hashtags.push(token.content);
  }
  return `<a href="javascript:void(0);" class="hashtag">${token.content}</a>`;
}

function renderMention(
  tokens: Token[],
  idx: number,
  opts: Options,
  env: any,
  self: Renderer
): string {
  if (tokens.length <= idx) {
    return '';
  }
  const token = tokens[idx];
  if (token.type !== 'mention') {
    return self.renderToken(tokens, idx, opts);
  }
  if (typeof env === 'object' && env !== null) {
    env.mentions = env.mentions ?? [];
    env.mentions.push(token.content);
  }
  return `<a href="javascript:void(0);" class="mention">${token.content}</a>`;
}

const mention = (md: markdownit) =>
  createInlineRegexPlugin(md, {
    type: 'mention',
    pattern: /(?<=\s|^)@(?=.*[a-zA-Z0-9])(?!.*[._]{2})[a-zA-Z0-9._]+(?=\s|$)/g,
    render: renderMention
  });

const hashtag = (md: markdownit) =>
  createInlineRegexPlugin(md, {
    type: 'hashtag',
    pattern: /(?<=\s|^)#([\p{L}0-9]+)(?=\s|$)/gu,
    render: renderHashtag
  });

export const markdown = markdownit({
  html: false,
  xhtmlOut: true,
  breaks: false,
  linkify: true,
  typographer: false
});

markdown.disable([
  'code',
  'fence',
  'lheading',
  'heading',
  'hr',
  'reference',
  'table',
  'image'
]);

markdown.use(emoji);
markdown.use(hashtag);
markdown.use(mention);
markdown.use(markdownItMark);
markdown.use(markdownItIns);
