import { createRoot } from 'react-dom/client';
import '../scss/app.scss';
import React from 'react';
import App from './Co2Tool';

const rootelement = document.getElementById('qcc');
if (rootelement) {
  const root = createRoot(rootelement);
  const manifest = JSON.parse(rootelement.getAttribute('data-manifest'))
  root.render(<React.StrictMode>
    <App manifest={manifest} />
  </React.StrictMode>);
}
