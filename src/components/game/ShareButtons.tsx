import { Share2, Twitter, Facebook, Link2, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareButtonsProps {
  score: number;
  isDailyChallenge?: boolean;
  rank?: number | null;
}

export function ShareButtons({ score, isDailyChallenge, rank }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareText = useCallback(() => {
    const baseText = isDailyChallenge 
      ? `🗓️ I scored ${score.toLocaleString()} points in today's Elemental Blast Daily Challenge!`
      : `🎮 I scored ${score.toLocaleString()} points in Elemental Blast!`;
    
    const rankText = rank ? ` Ranked #${rank}!` : '';
    const emoji = score >= 5000 ? '🔥' : score >= 2000 ? '⭐' : score >= 1000 ? '🎯' : '💪';
    
    return `${baseText}${rankText} ${emoji}`;
  }, [score, isDailyChallenge, rank]);

  const getShareUrl = useCallback(() => {
    // Use the current page URL
    return window.location.href;
  }, []);

  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(getShareUrl());
    const hashtags = encodeURIComponent('ElementalBlast,GameScore');
    
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`,
      '_blank',
      'width=550,height=420,noopener,noreferrer'
    );
  }, [getShareText, getShareUrl]);

  const shareToFacebook = useCallback(() => {
    const url = encodeURIComponent(getShareUrl());
    const quote = encodeURIComponent(getShareText());
    
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`,
      '_blank',
      'width=550,height=420,noopener,noreferrer'
    );
  }, [getShareText, getShareUrl]);

  const copyToClipboard = useCallback(async () => {
    const text = `${getShareText()}\n\n${getShareUrl()}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  }, [getShareText, getShareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Elemental Blast Score',
          text: getShareText(),
          url: getShareUrl(),
        });
      } catch (err) {
        // User cancelled or error - silently fail
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  }, [getShareText, getShareUrl]);

  // Check if native share is available (mobile)
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex flex-col gap-2 items-center">
      <p className="text-xs text-game-text-muted mb-1">Share your score</p>
      
      <div className="flex gap-2">
        {/* Native share (mobile) */}
        {hasNativeShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="h-9 px-3 border-game-grid-border bg-game-grid-dark/50 hover:bg-game-grid-dark text-white"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        )}
        
        {/* Twitter/X */}
        <Button
          variant="outline"
          size="sm"
          onClick={shareToTwitter}
          className="h-9 px-3 border-game-grid-border bg-game-grid-dark/50 hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/50 text-white hover:text-[#1DA1F2]"
          title="Share on X (Twitter)"
        >
          <Twitter className="w-4 h-4" />
        </Button>
        
        {/* Facebook */}
        <Button
          variant="outline"
          size="sm"
          onClick={shareToFacebook}
          className="h-9 px-3 border-game-grid-border bg-game-grid-dark/50 hover:bg-[#4267B2]/20 hover:border-[#4267B2]/50 text-white hover:text-[#4267B2]"
          title="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </Button>
        
        {/* Copy link */}
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="h-9 px-3 border-game-grid-border bg-game-grid-dark/50 hover:bg-white/10 text-white"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
