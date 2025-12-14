"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Avatar {
    id: number;
    svg: React.ReactNode;
    alt: string;
}

const avatars: Avatar[] = [
    {
        id: 1,
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <mask id=":r111:" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#:r111:)">
                    <rect width="36" height="36" fill="#ff005b" />
                    <rect x="0" y="0" width="36" height="36" transform="translate(9 -5) rotate(219 18 18) scale(1)" fill="#ffb238" rx="6" />
                    <g transform="translate(4.5 -4) rotate(9 18 18)">
                        <path d="M15 19c2 1 4 1 6 0" stroke="#000000" fill="none" strokeLinecap="round" />
                        <rect x="10" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000" />
                        <rect x="24" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000" />
                    </g>
                </g>
            </svg>
        ),
        alt: "Avatar 1",
    },
    {
        id: 2,
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <mask id=":R4mrttb:" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
                </mask>
                <g mask="url(#:R4mrttb:)">
                    <rect width="36" height="36" fill="#ff7d10"></rect>
                    <rect x="0" y="0" width="36" height="36" transform="translate(5 -1) rotate(55 18 18) scale(1.1)" fill="#0a0310" rx="6" />
                    <g transform="translate(7 -6) rotate(-5 18 18)">
                        <path d="M15 20c2 1 4 1 6 0" stroke="#FFFFFF" fill="none" strokeLinecap="round" />
                        <rect x="14" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
                        <rect x="20" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
                    </g>
                </g>
            </svg>
        ),
        alt: "Avatar 2",
    },
    {
        id: 3,
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <mask id=":r11c:" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
                </mask>
                <g mask="url(#:r11c:)">
                    <rect width="36" height="36" fill="#0a0310" />
                    <rect x="0" y="0" width="36" height="36" transform="translate(-3 7) rotate(227 18 18) scale(1.2)" fill="#ff005b" rx="36" />
                    <g transform="translate(-3 3.5) rotate(7 18 18)">
                        <path d="M13,21 a1,0.75 0 0,0 10,0" fill="#FFFFFF" />
                        <rect x="12" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
                        <rect x="22" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
                    </g>
                </g>
            </svg>
        ),
        alt: "Avatar 3",
    },
    {
        id: 4,
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <mask id=":r1gg:" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
                </mask>
                <g mask="url(#:r1gg:)">
                    <rect width="36" height="36" fill="#d8fcb3"></rect>
                    <rect x="0" y="0" width="36" height="36" transform="translate(9 -5) rotate(219 18 18) scale(1)" fill="#89fcb3" rx="6"></rect>
                    <g transform="translate(4.5 -4) rotate(9 18 18)">
                        <path d="M15 19c2 1 4 1 6 0" stroke="#000000" fill="none" strokeLinecap="round"></path>
                        <rect x="10" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect>
                        <rect x="24" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect>
                    </g>
                </g>
            </svg>
        ),
        alt: "Avatar 4",
    },
    {
        id: 5,
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <mask id=":r1hh:" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
                </mask>
                <g mask="url(#:r1hh:)">
                    <rect width="36" height="36" fill="#6366f1"></rect>
                    <rect x="0" y="0" width="36" height="36" transform="translate(5 -3) rotate(45 18 18) scale(1.1)" fill="#818cf8" rx="6"></rect>
                    <g transform="translate(4 -2) rotate(5 18 18)">
                        <path d="M15 19c2 1 4 1 6 0" stroke="#FFFFFF" fill="none" strokeLinecap="round"></path>
                        <rect x="11" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF"></rect>
                        <rect x="23" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF"></rect>
                    </g>
                </g>
            </svg>
        ),
        alt: "Avatar 5",
    },
    {
        id: 6,
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <mask id=":r1ii:" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
                </mask>
                <g mask="url(#:r1ii:)">
                    <rect width="36" height="36" fill="#10b981"></rect>
                    <rect x="0" y="0" width="36" height="36" transform="translate(7 -4) rotate(180 18 18) scale(1)" fill="#34d399" rx="6"></rect>
                    <g transform="translate(3 -3) rotate(-5 18 18)">
                        <path d="M15 20c2 1 4 1 6 0" stroke="#000000" fill="none" strokeLinecap="round"></path>
                        <rect x="12" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect>
                        <rect x="22" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect>
                    </g>
                </g>
            </svg>
        ),
        alt: "Avatar 6",
    },
];

interface AvatarPickerProps {
    selectedAvatarId?: number;
    onSelect?: (avatar: Avatar) => void;
    compact?: boolean;
}

export function AvatarPicker({ selectedAvatarId = 1, onSelect, compact = false }: AvatarPickerProps) {
    const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(
        avatars.find(a => a.id === selectedAvatarId) || avatars[0]
    );
    const [rotationCount, setRotationCount] = useState(0);

    const handleAvatarSelect = (avatar: Avatar) => {
        setRotationCount((prev) => prev + 360);
        setSelectedAvatar(avatar);
        onSelect?.(avatar);
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {avatars.slice(0, 4).map((avatar) => (
                    <motion.button
                        key={avatar.id}
                        onClick={() => handleAvatarSelect(avatar)}
                        className={cn(
                            "relative w-10 h-10 rounded-md overflow-hidden border-2 transition-colors",
                            selectedAvatar.id === avatar.id 
                                ? "border-primary" 
                                : "border-border hover:border-muted-foreground"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="w-full h-full flex items-center justify-center">
                            {avatar.svg}
                        </div>
                    </motion.button>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main avatar display */}
            <div className="flex items-center gap-4">
                <motion.div
                    className="relative w-16 h-16 rounded-md overflow-hidden border-2 border-border bg-muted flex items-center justify-center"
                    animate={{ rotate: rotationCount }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <div className="w-full h-full flex items-center justify-center scale-[1.5]">
                        {selectedAvatar.svg}
                    </div>
                </motion.div>
                <div>
                    <p className="text-sm font-medium text-foreground">Avatar selecionado</p>
                    <p className="text-xs text-muted-foreground">Clique para alterar</p>
                </div>
            </div>

            {/* Avatar selection grid */}
            <div className="flex flex-wrap gap-2">
                {avatars.map((avatar) => (
                    <motion.button
                        key={avatar.id}
                        onClick={() => handleAvatarSelect(avatar)}
                        className={cn(
                            "relative w-12 h-12 rounded-md overflow-hidden border-2 transition-colors",
                            selectedAvatar.id === avatar.id 
                                ? "border-primary bg-primary/10" 
                                : "border-border hover:border-muted-foreground hover:bg-muted/50"
                        )}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="w-full h-full flex items-center justify-center">
                            {avatar.svg}
                        </div>
                        <AnimatePresence>
                            {selectedAvatar.id === avatar.id && (
                                <motion.div
                                    className="absolute inset-0 ring-2 ring-primary ring-inset rounded-md"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                        </AnimatePresence>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

export { avatars };
export type { Avatar };
