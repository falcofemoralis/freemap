export class HashUtil {
  static updateHash(selectedKey: string, data: string | null) {
    let found = false;
    const parts = window.location.hash
      .slice(1)
      .split('&')
      .map(part => {
        const key = part.split('=')[0];
        if (key === selectedKey) {
          found = true;
          if (!data) {
            return '';
          }
          return `${key}=${data}`;
        }
        return part;
      })
      .filter(a => a);
    if (!found) {
      parts.push(`${selectedKey}=${data}`);
    }

    window.location.href = `#${parts.join('&')}`;
  }

  static getHashKey(selectedKey: string): string | null {
    let found: string | null = null;
    window.location.hash
      .slice(1)
      .split('&')
      .find(part => {
        const [key, data] = part.split('=');
        console.log(key);
        console.log(data);

        if (key === selectedKey) {
          found = data;
          return true;
        }
      });
    return found;
  }
}
