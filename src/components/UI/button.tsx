import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger";
    size?: "small" | "medium" | "large";
    fullWidth?: boolean;
};

const sizeStyles = {
    small: "px-3 py-1 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
};

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "medium",
    fullWidth = false,
    className,
    ...props
}) => {
    return (
        <button
            className={clsx(
                "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                sizeStyles[size],
                fullWidth && "w-full",
                className
            )}
            {...props}
        />
    );
};
