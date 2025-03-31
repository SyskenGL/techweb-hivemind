import * as markdownit from 'markdown-it';
import type {
  Options,
  PluginWithOptions,
  Token,
  Renderer,
  StateCore
} from 'markdown-it';

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

export const createInlineRegexPlugin: PluginWithOptions<PluginOptions> = (
  markdown: markdownit,
  options: PluginOptions
) => {
  markdown.core.ruler.after('inline', options.type, (state: StateCore) =>
    parseTokens(state, options)
  );
  markdown.renderer.rules[options.type] = (tokens, idx, opts, env, self) =>
    options.render(tokens, idx, opts, env, self);
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
