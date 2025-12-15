import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

interface StarRatingProps {
    rating: number;
    editable?: boolean;
    onChange?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    editable = false,
    onChange,
    size = 'md'
}) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const handleClick = (value: number) => {
        if (editable && onChange) {
            onChange(value);
        }
    };

    const displayRating = editable && hoverRating > 0 ? hoverRating : rating;

    const getStarFill = (starIndex: number) => {
        const starValue = starIndex + 1;
        if (displayRating >= starValue) {
            return 100; // Full star
        } else if (displayRating > starIndex) {
            // Partial star - calculate percentage
            return (displayRating - starIndex) * 100;
        }
        return 0; // Empty star
    };

    return (
        <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((starIndex) => {
                const fillPercentage = getStarFill(starIndex);

                return (
                    <button
                        key={starIndex}
                        type="button"
                        onClick={() => handleClick(starIndex + 1)}
                        onMouseEnter={() => editable && setHoverRating(starIndex + 1)}
                        onMouseLeave={() => editable && setHoverRating(0)}
                        disabled={!editable}
                        className={`relative ${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                    >
                        {/* Background (empty) star */}
                        <StarIcon className={`${sizeClasses[size]} text-gray-300`} />

                        {/* Foreground (filled) star with clip */}
                        {fillPercentage > 0 && (
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
