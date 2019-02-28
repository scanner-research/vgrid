export let asset_url = (path) => {
  if ((window as any).IPython) {
    return `/django/${path}`;
  } else {
    return path;
  }
};
