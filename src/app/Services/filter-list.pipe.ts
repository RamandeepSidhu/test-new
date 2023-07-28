import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: string[], search: string): string[] {
    if (!search) {
      return items;
    }

    return items.filter(item => item.toLowerCase().includes(search.toLowerCase()));
  }
}
