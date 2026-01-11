import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

export const StarRating = ({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = false,
  onChange,
  readonly = false
}: StarRatingProps) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const handleClick = (index: number) => {
    if (!readonly && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const isFilled = index < Math.floor(rating);
        const isHalfFilled = index < rating && index >= Math.floor(rating);

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : isHalfFilled
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        );
      })}
      {showNumber && (
        <span className="text-sm font-medium text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
