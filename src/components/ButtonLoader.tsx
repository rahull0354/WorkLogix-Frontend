import { Loader2 } from 'lucide-react';

interface ButtonLoaderProps {
  text?: string;
  variant?: 'dots' | 'spin' | 'pulse' | 'shimmer';
}

export function ButtonLoader({ text = 'Loading...', variant = 'dots' }: ButtonLoaderProps) {
  if (variant === 'dots') {
    return (
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-current rounded-full btn-loading-dots">
          <span className="inline-block w-2 h-2 bg-current rounded-full"></span>
          <span className="inline-block w-2 h-2 bg-current rounded-full"></span>
        </span>
        <span className="ml-2">{text}</span>
      </div>
    );
  }

  if (variant === 'spin') {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{text}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>{text}</span>
    </div>
  );
}
