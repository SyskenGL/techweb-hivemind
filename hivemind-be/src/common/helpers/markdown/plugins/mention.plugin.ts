import * as markdownit from 'markdown-it';
import type { Options, Token, Renderer } from 'markdown-it';
import { createInlineRegexPlugin } from './create-inline-regex-plugin.helper';

export const mention = (md: markdownit) =>
  createInlineRegexPlugin(md, {
    type: 'mention',
    pattern: /(?<=\s|^)@(?=.*[a-zA-Z0-9])(?!.*[._]{2})[a-zA-Z0-9._]+(?=\s|$)/g,
    render: renderMention
  });

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
