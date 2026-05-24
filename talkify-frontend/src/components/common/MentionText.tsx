// src/components/common/MentionText.tsx

import { useMemo } from 'react';
import { Link } from 'react-router-dom';

interface MentionTextProps {
    text: string;
    className?: string;
}

type TextPart = {
    type: 'text';
    content: string;
};

type MentionPart = {
    type: 'mention';
    content: string;
    username: string;
};

type MessagePart = TextPart | MentionPart;

const MENTION_REGEX = /@([a-zA-Z0-9_.]+)/g;

export function MentionText({ text, className = '' }: MentionTextProps) {
    const parts = useMemo<MessagePart[]>(() => {
        if (!text) return [{ type: 'text', content: text || '' }];

        const result: MessagePart[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        MENTION_REGEX.lastIndex = 0;

        while ((match = MENTION_REGEX.exec(text)) !== null) {
            if (match.index > lastIndex) {
                result.push({
                    type: 'text',
                    content: text.slice(lastIndex, match.index),
                });
            }

            result.push({
                type: 'mention',
                content: match[0],
                username: match[1],
            });

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            result.push({
                type: 'text',
                content: text.slice(lastIndex),
            });
        }

        return result;
    }, [text]);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.type === 'mention') {
                    return (
                        <Link
                            key={index}
                            to={`/${part.username}`}
                            className="text-[#3390ec] hover:text-[#3390ec]/80 hover:underline underline-offset-4 font-medium"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part.content}
                        </Link>
                    );
                }
                return <span key={index}>{part.content}</span>;
            })}
        </span>
    );
}