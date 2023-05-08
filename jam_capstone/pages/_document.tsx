import Document, { Html, Head, Main, NextScript } from 'next/document';
import Link from 'next/link';
import Script from 'next/script';


class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <Link rel="stylesheet" href="/_next/static/css/flowbite.min.css" />
          <Link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@editorjs/simple-image@latest/dist/simple-image.min.css" />
          <Script src="https://cdn.jsdelivr.net/npm/@editorjs/simple-image@latest/dist/bundle.js" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
