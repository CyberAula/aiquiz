"use client";

import { useState, type ReactNode } from "react";

type CollapsibleSectionProps = {
    id: string;
    title: string;
    description?: string;
    right?: ReactNode;
    defaultOpen?: boolean;
    children: ReactNode;
};

const CollapsibleSection = ({
    id,
    title,
    description,
    right,
    defaultOpen = true,
    children,
}: CollapsibleSectionProps) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="bg-white shadow rounded-lg">
            <button
                type="button"
                className="w-full p-6 flex items-start justify-between gap-4"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={id}
            >
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {description ? (
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    ) : null}
                </div>

                <div className="flex items-center gap-4">
                    {right ? <div className="text-sm text-gray-500">{right}</div> : null}
                    <span className="text-gray-400 text-xl leading-none select-none">
                        {open ? "−" : "+"}
                    </span>
                </div>
            </button>

            {open ? (
                <div id={id} className="px-6 pb-6">
                    {children}
                </div>
            ) : null}
        </div>
    );
};

export default CollapsibleSection;
