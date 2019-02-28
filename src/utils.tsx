export let asset_url = (path: string): string => {
  if ((window as any).IPython) {
    return `/django/${path}`;
  } else {
    return path;
  }
};
