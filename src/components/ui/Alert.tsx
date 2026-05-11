import React from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { clsx } from '../../lib/utils';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  className?: string;
}

const config: Record<AlertType, { bg: string; text: string; Icon: React.ElementType }> = {
  success: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', Icon: CheckCircle },
  error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', Icon: XCircle },
  warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', Icon: AlertCircle },
  info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', Icon: Info },
};

export default function Alert({ type, message, onClose, className }: AlertProps) {
  const { bg, text, Icon } = config[type];
  return (
    <div className={clsx('flex items-start gap-3 border rounded-lg p-3.5 text-sm', bg, text, className)}>
      <Icon size={16} className="shrink-0 mt-0.5" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
