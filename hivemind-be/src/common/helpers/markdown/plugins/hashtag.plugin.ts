import * as markdownit from 'markdown-it';
import type { Options, Token, Renderer } from 'markdown-it';
import { createInlineRegexPlugin } from './create-inline-regex-plugin.helper';

export const hashtag = (md: markdownit) =>
  createInlineRegexPlugin(md, {
    type: 'hashtag',
    pattern: /(?<=\s|^)#([\p{L}0-9]+)(?=\s|$)/gu,
    render: renderHashtag
  });

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
