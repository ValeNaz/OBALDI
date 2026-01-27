import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface StarRatingProps {
    rating: number; // 0 to 5
    size?: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
}

const StarRating = ({ rating, size = 16, interactive = false, onChange }: StarRatingProps) => {
    const handleClick = (index: number) => {
        if (interactive && onChange) {
            onChange(index + 1);
        }
    };

    return (
        <div className="flex gap-1">
            {[...Array(5)].map((_, i) => {
                const value = i + 1;

                let Icon = FaRegStar;
                let color = "text-slate-300";

                if (value <= rating) {
                    Icon = FaStar;
                    color = "text-yellow-400";
                } else if (value - 0.5 <= rating) {
                    Icon = FaStarHalfAlt;
                    color = "text-yellow-400";
                }

                return (
                    <button
                        key={i}
                        type="button"
                        onClick={() => handleClick(i)}
                        disabled={!interactive}
                        className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"} ${color}`}
                    >
                        <Icon size={size} />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
