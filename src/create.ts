import { useMemo, useState } from "react";

import { isBrowser, useIsomorphicEffect } from "./utils";

export function create<TScreens extends BreakpointType>(screens: TScreens) {
  function useBreakpoint(
    breakpoint: keyof TScreens,
    defaultValue: boolean = false
  ) {
    const [match, setMatch] = useState(() => defaultValue);

    useIsomorphicEffect(() => {
      if (!(isBrowser && 'matchMedia' in window && window.matchMedia))
        return undefined;

      const value = screens[breakpoint];
      let queryStr = '';

      if (typeof value === 'string') {
        queryStr = `(min-width: ${value})`;
      } else if (typeof value === 'object') {
        const { min, max } = value;
        if (min) queryStr += `(min-width: ${min})`;
        if (max) queryStr += `${min ? ' and ' : ''}(max-width: ${max})`;
      }

      const query = window.matchMedia(queryStr);

      function listener(event: MediaQueryListEvent) {
        setMatch(event.matches);
      }

      setMatch(query.matches);

      query.addEventListener('change', listener);
      return () => query.removeEventListener('change', listener);
    }, [breakpoint, defaultValue]);

    return match;
  }

  function useBreakpointEffect(
    breakpoint: keyof TScreens,
    effect: (match: boolean) => void
  ) {
    const match = useBreakpoint(breakpoint);
    useIsomorphicEffect(() => effect(match), [breakpoint, effect]);
    return null;
  }

  function useBreakpointValue<T, U>(
    breakpoint: keyof TScreens,
    valid: T,
    invalid: U
  ) {
    const match = useBreakpoint(breakpoint);
    const value = useMemo(
      () => (match ? valid : invalid),
      [invalid, match, valid]
    );
    return value;
  }

  return {
    useBreakpoint,
    useBreakpointEffect,
    useBreakpointValue,
  };
}
