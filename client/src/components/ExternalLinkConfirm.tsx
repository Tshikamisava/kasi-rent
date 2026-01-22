import React from 'react';

export default function ExternalLinkConfirm({ open, title, url, onConfirm, onClose }: { open: boolean; title?: string; url?: string; onConfirm: () => void; onClose: () => void }) {
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: 'white', borderRadius: 12, padding: 20, maxWidth: 520, width: '90%', boxShadow: '0 10px 40px rgba(2,6,23,0.2)' }}>
        <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>{title ?? 'Leave KasiRent?'}</h3>
        <p style={{ marginTop: 0, marginBottom: 16, color: '#374151' }}>You are about to open an external site: <strong style={{ wordBreak: 'break-all' }}>{url}</strong></p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, background: '#f3f4f6', border: 'none', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 12px', borderRadius: 8, background: '#111827', color: '#fff', border: 'none', cursor: 'pointer' }}>Continue</button>
        </div>
      </div>
    </div>
  );
}
