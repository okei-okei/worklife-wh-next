export type ReferralLink = {
  provider: string;
  href: string;
  label: string;
  category: string;
  disclosure: string;
};

export const referralLinks = {
  wise: {
    provider: "Wise",
    href: "https://wise.com/invite/ilpn/sojit15?utm_source=ios-launchpad-nativeshare&utm_medium=invite&referralCode=sojit15",
    label: "紹介リンク",
    category: "money_transfer",
    disclosure:
      "このリンクから登録・利用すると、WorkLife WH運営者が紹介特典を受け取る場合があります。",
  },
  revolut: {
    provider: "Revolut",
    href: "https://revolut.com/referral/?referral-code=sojit!JUL1-26-AR-H3&geo-redirect",
    label: "紹介リンク",
    category: "bank",
    disclosure:
      "このリンクから登録・利用すると、WorkLife WH運営者が紹介特典を受け取る場合があります。",
  },
} satisfies Record<string, ReferralLink>;
