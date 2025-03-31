import * as markdownit from 'markdown-it';
import * as mark from 'markdown-it-mark';
import * as ins from 'markdown-it-ins';
import { full as emoji } from 'markdown-it-emoji';
import { hashtag, mention } from './plugins';

export const markdown = markdownit({
  html: false,
  xhtmlOut: true,
  breaks: false,
  linkify: true,
  typographer: false
});

markdown.disable([
  'image',
  'code',
  'fence',
  'lheading',
  'heading',
  'hr',
  'reference',
  'table'
]);

markdown.use(emoji);
markdown.use(hashtag);
markdown.use(mention);
markdown.use(mark);
markdown.use(ins);
markdown.renderer.rules.image = undefined;
