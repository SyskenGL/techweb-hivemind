import {
  animate,
  AnimationTriggerMetadata,
  style,
  transition,
  trigger
} from '@angular/animations';

export function fadeInOutAnimation(
  config: {
    name?: string;
    enterDuration?: string;
    leaveDuration?: string;
    fadeDuration?: string;
  } = {}
): AnimationTriggerMetadata {
  const {
    name = 'FadeInOut',
    enterDuration = '150ms',
    leaveDuration = '150ms',
    fadeDuration = '75ms'
  } = config;
  return trigger(name, [
    transition(
      ':enter',
      [
        style({ opacity: 0, height: '0' }),
        animate('{{ enterDuration }}', style({ height: '*' })),
        animate('{{ fadeDuration }}', style({ opacity: 1 }))
      ],
      {
        params: { enterDuration, fadeDuration }
      }
    ),
    transition(
      ':leave',
      [
        style({ opacity: 1, height: '*' }),
        animate('{{ fadeDuration }}', style({ opacity: 0 })),
        animate('{{ leaveDuration }}', style({ height: '0' }))
      ],
      {
        params: { fadeDuration, leaveDuration }
      }
    )
  ]);
}
