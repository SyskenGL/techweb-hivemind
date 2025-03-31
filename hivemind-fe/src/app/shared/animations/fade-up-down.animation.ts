import {
  animate,
  AnimationTriggerMetadata,
  style,
  transition,
  trigger
} from '@angular/animations';

export function fadeUpDownAnimation(
  config: { name?: string; duration?: string; translateY?: string } = {}
): AnimationTriggerMetadata {
  const {
    name = 'FadeUpDown',
    duration = '150ms',
    translateY = '10px'
  } = config;
  return trigger(name, [
    transition(':enter', [
      style({ opacity: 0, transform: `translateY(${translateY})` }),
      animate(duration, style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
      animate(
        duration,
        style({ opacity: 0, transform: `translateY(${translateY})` })
      )
    ])
  ]);
}
