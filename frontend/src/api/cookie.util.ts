export const readCookie = (name: string): string | undefined => {
  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')[1];
  return value === undefined ? undefined : decodeURIComponent(value);
};
