export const a8Ads = {
  trifa: {
    text: `<a href="https://px.a8.net/svt/ejp?a8mat=4B63GJ+6A8QNM+5UDW+5YJRM" rel="nofollow">国内利用者数No.1【トリファ（trifa）】</a> <img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4B63GJ+6A8QNM+5UDW+5YJRM" alt="">`,
    banner300x250: `<a href="https://px.a8.net/svt/ejp?a8mat=4B63GJ+6A8QNM+5UDW+5ZMCH" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www21.a8.net/svt/bgt?aid=260624899380&wid=001&eno=01&mid=s00000027266001006000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=4B63GJ+6A8QNM+5UDW+5ZMCH" alt="">`,
    banner120x60: `<a href="https://px.a8.net/svt/ejp?a8mat=4B63GJ+6A8QNM+5UDW+5YZ75" rel="nofollow">
<img border="0" width="120" height="60" alt="" src="https://www20.a8.net/svt/bgt?aid=260624899380&wid=001&eno=01&mid=s00000027266001003000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4B63GJ+6A8QNM+5UDW+5YZ75" alt="">`,
  },
  japanGlobalEsim: {
    text: `<a href="https://px.a8.net/svt/ejp?a8mat=4B63GJ+5TKLPU+5HZI+5YZ76" rel="nofollow">世界192地域で使える【JAPAN &GLOBALeSIM】</a> <img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=4B63GJ+5TKLPU+5HZI+5YZ76" alt="">`,
    banner300x250: `<a href="https://px.a8.net/svt/ejp?a8mat=4B63GJ+5TKLPU+5HZI+5ZEMP" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www27.a8.net/svt/bgt?aid=260624899352&wid=001&eno=01&mid=s00000025659001005000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=4B63GJ+5TKLPU+5HZI+5ZEMP" alt="">`,
    banner728x120: `<a href="https://px.a8.net/svt/ejp?a8mat=4B63GJ+5TKLPU+5HZI+61C2P" rel="nofollow">
<img border="0" width="728" height="120" alt="" src="https://www22.a8.net/svt/bgt?aid=260624899352&wid=001&eno=01&mid=s00000025659001014000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=4B63GJ+5TKLPU+5HZI+61C2P" alt="">`,
  },
};

export type A8AdKey =
  | "trifa.text"
  | "trifa.banner300x250"
  | "trifa.banner120x60"
  | "japanGlobalEsim.text"
  | "japanGlobalEsim.banner300x250"
  | "japanGlobalEsim.banner728x120";

export function getA8AdHtml(key?: A8AdKey) {
  if (!key) return null;

  const [serviceKey, adType] = key.split(".") as [
    keyof typeof a8Ads,
    string,
  ];
  const serviceAds = a8Ads[serviceKey] as Record<string, string> | undefined;

  return serviceAds?.[adType] ?? null;
}
