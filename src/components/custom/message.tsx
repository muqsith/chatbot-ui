import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { cx } from 'classix';
import { SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { message } from "../../interfaces/interfaces"
import { MessageActions } from '@/components/custom/actions';

export const PreviewMessage = ({ message }: { message: message; }) => {

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          'group-data-[role=user]/message:bg-zinc-100 dark:group-data-[role=user]/message:bg-zinc-700 group-data-[role=user]/message:text-zinc-700 dark:group-data-[role=user]/message:text-gray-100 flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl'
        )}
      >
        {message.role === 'assistant' && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex flex-col w-full">
          {message.content && (
            <div className="flex flex-col gap-4 text-left">
              <Markdown>{message.content}</Markdown>
            </div>
          )}

          {message.role === 'assistant' && (
            <MessageActions message={message} />
          )}
        </div>
      </div>
    </motion.div>
  );
};


export const ThinkingMessage = () => {
  const role = 'assistant';
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let decreasing = true;
    const interval = setInterval(() => {
      setOpacity(prev => {
        if (decreasing) {
          if (prev > 0.1) return prev - 0.1;
          decreasing = false;
          return prev;
        } else {
          if (prev < 1) return prev + 0.1;
          decreasing = true;
          return prev;
        }
      });
    }, 75);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          'group-data-[role=user]/message:bg-muted'
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <span
            style={{
              opacity,
              transition: "opacity 75ms linear"
            }}
          >
            <SparklesIcon size={14} />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
