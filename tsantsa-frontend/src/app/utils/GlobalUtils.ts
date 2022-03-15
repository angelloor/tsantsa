import { AngelNavigationItem } from '@angel/components/navigation';
import { Injectable } from '@angular/core';
import { Navigation } from 'app/core/app/app.type';

@Injectable({
  providedIn: 'root',
})
export class GlobalUtils {
  constructor() {}
  /**
   *
   * @param _object of the state with properties disorganized
   * @returns array
   */
  parseObjectToArray(_object: any) {
    const array = [];

    for (let x = 0; x < Object.keys(_object).length; x++) {
      if (_object[x] != undefined) {
        array.push(_object[x]);
      }
    }

    return array;
  }
  /**
   * Function to generate route for the user to navigate
   * @param navigations Item of navigación sourcing of store
   * @returns path to user navigated
   */
  generateRoutes(navigations: Navigation) {
    let allNavigations = [];
    let _routes: string[] = [];

    // Parse Navigation to Array
    const _default = this.parseObjectToArray(navigations.defaultNavigation);
    const _compact = this.parseObjectToArray(navigations.compactNavigation);
    const _futuristic = this.parseObjectToArray(
      navigations.futuristicNavigation
    );
    const _horizontal = this.parseObjectToArray(
      navigations.futuristicNavigation
    );

    allNavigations = Array.prototype.concat(
      _default,
      _compact,
      _futuristic,
      _horizontal
    );

    allNavigations.map((item: AngelNavigationItem) => {
      if (item.link) {
        _routes.push(item.link);
      }
      if (item.children) {
        item.children.map((item: AngelNavigationItem) => {
          if (item.link) {
            _routes.push(item.link);
          }
          if (item.children) {
            item.children.map((item: AngelNavigationItem) => {
              if (item.link) {
                _routes.push(item.link);
              }
            });
          }
        });
      }
    });
    return this.removeDuplicates(_routes);
  }

  removeDuplicates(ArrayRoutes: string[]) {
    const _arrayRoutes = ArrayRoutes.concat();
    for (var i = 0; i < _arrayRoutes.length; ++i) {
      for (var j = i + 1; j < _arrayRoutes.length; ++j) {
        if (_arrayRoutes[i] === _arrayRoutes[j]) {
          _arrayRoutes.splice(j, 1);
        }
      }
    }
    return _arrayRoutes;
  }
}
