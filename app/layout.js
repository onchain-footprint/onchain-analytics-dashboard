import "../styles/globals.css";
import Providers from "./providers"; // ✅ handles wagmi + rainbowkit

export const metadata = {
  title: "Onchain Score Dashboard",
  description: "View your onchain activity and mint a badge on Base via Zora",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
