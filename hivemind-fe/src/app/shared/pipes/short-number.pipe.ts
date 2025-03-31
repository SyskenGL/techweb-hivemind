import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
  standalone: true
})
export class ShortNumberPipe implements PipeTransform {
  private readonly powers = [
    { key: 'Q', value: Math.pow(10, 15) },
    { key: 'T', value: Math.pow(10, 12) },
    { key: 'B', value: Math.pow(10, 9) },
    { key: 'M', value: Math.pow(10, 6) },
    { key: 'K', value: 1000 }
  ];

  transform(number: number, decimalPlaces: number = 1): any {
    if (isNaN(number) || !number) {
      return number;
    }
    let key = '';
    let abs = Math.abs(number);
    const rounder = Math.pow(10, decimalPlaces);
    for (let i = 0; i < this.powers.length; i++) {
      let reduced = abs / this.powers[i].value;
      reduced = Math.round(reduced * rounder) / rounder;
      if (reduced >= 1) {
        abs = reduced;
        key = this.powers[i].key;
        break;
      }
    }
    return (number < 0 ? '-' : '') + abs + key;
  }
}
