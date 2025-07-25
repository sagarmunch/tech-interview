import React, { useState } from 'react';

interface LikeButtonProps {
  entryId: number;
  initialLikesCount: number;
  onLikeChange?: (newCount: number) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  entryId, 
  initialLikesCount, 
  onLikeChange 
}) => {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(false); // BUG 8: No way to know initial like state
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      const response = await fetch(`http://localhost:5000/api/entries/${entryId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likes_count);
        setIsLiked(!isLiked);
        
        // BUG 9: Not calling onLikeChange callback
        // onLikeChange?.(data.likes_count);
      } else {
        // BUG 10: Poor error handling - no user feedback
        console.error('Failed to like/unlike entry');
      }
    } catch (error) {
      console.error('Error:', error);
      // BUG 11: No error state management or retry mechanism
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={`like-button ${isLiked ? 'liked' : ''}`}
      onClick={handleLike}
      disabled={isLoading}
    >
      {/* BUG 12: Using innerHTML-like approach which could be XSS vulnerable */}
      <span dangerouslySetInnerHTML={{ 
        __html: isLiked ? '❤️' : '🤍' 
      }} />
      <span className="likes-count">{likesCount}</span>
      {isLoading && <span className="loading">...</span>}
    </button>
  );
};

export default LikeButton;