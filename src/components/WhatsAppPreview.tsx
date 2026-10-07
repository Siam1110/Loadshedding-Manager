import React from 'react';
import { Copy, Send, ExternalLink, Check } from 'lucide-react';

interface WhatsAppPreviewProps {
  message: string;
  onCopy: () => void;
  onSendApi?: () => void;
  onOpenWeb: () => void;
  copied: boolean;
  statusText?: string;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  message,
  onCopy,
  onSendApi,
  onOpenWeb,
  copied,
  statusText
}) => {
  return (
    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-2">
          <span>WhatsApp Preview</span>
        </h4>
        {statusText && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
            {statusText}
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans text-sm shadow-inner mb-4">
        {message}
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <button
          onClick={onCopy}
          className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        <button
          onClick={onOpenWeb}
          className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open WhatsApp</span>
        </button>

        {onSendApi && (
          <button
            onClick={onSendApi}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Send API</span>
          </button>
        )}
      </div>
    </div>
  );
};

