import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />

        <title>EuroSummer2026</title>

        <meta name="application-name" content="EuroSummer2026" />
        <meta name="apple-mobile-web-app-title" content="EuroSummer2026" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#FFF8F2" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="icon" href="/icon.png" />

        <style dangerouslySetInnerHTML={{ __html: `
          html,
          body,
          #root {
            width: 100%;
            min-width: 100%;
            height: 100%;
            min-height: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            background: #FFF8F2;
          }

          body {
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
            overscroll-behavior-y: none;
          }

          * {
            box-sizing: border-box;
          }
        ` }} />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
